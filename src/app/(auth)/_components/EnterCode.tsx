'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRegFormContext } from '@/app/contexts/RegFormContext';
import { useEffect, useState } from 'react';
import { buttonStyles } from '../styles';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import useTimer from '@/hooks/useTimer';

const MAX_ATTEMPTS = 3;
const TIMEOUT_PERIOD = 180;

export const EnterCode = ({ phoneNumber }: { phoneNumber: string }) => {
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
	const { regFormData } = useRegFormContext();
	//timeLeft - сколько осталось времени
	//canResend - можно отправлять или нет
	//startTimer - старт таймера
	const { timeLeft, canResend, startTimer } = useTimer(TIMEOUT_PERIOD);
	const router = useRouter();

	useEffect(() => {
		startTimer();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		//если код меньше 4 защита
		if (code.length !== 4) return;

		try {
			const { data: verifyData, error: verifyError } =
				//из документации
				await authClient.phoneNumber.verify({
					phoneNumber,
					code,
					disableSession: false,
				});

			if (verifyError) throw verifyError;

			setAttemptsLeft(MAX_ATTEMPTS);
			//ещё и пароль надо проверять(с макета)
			const passwordResponse = await fetch('/api/auth/set-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					//юзера из id verify берём и пароль из регформы
					userId: verifyData.user.id,
					password: regFormData.password,
				}),
			});
			//если не получилось то обращаемся и достаём ошибку
			if (!passwordResponse.ok) {
				const errorData = await passwordResponse.json();
				console.error('Детали ошибки', errorData);
				throw new Error(errorData.error || 'Ошибка установки пароля');
			}
			//теперь надо вызвать метод обнов пользователя  из betterAuthCLient
			const { error: updateError } =
				await authClient.updateUser(regFormData);
			//если там ошибка то на верх её прокинуть
			if (updateError) throw updateError;
			//если всё чётко то го на страницу авторизации
			router.replace('/login');
		} catch (error) {
			console.error('Ошибка верификации телефона:', error);
			setCode('');
			setAttemptsLeft((prev) => prev - 1);

			if (attemptsLeft <= 1) {
				setError(
					'Попытки исчерпаны. Пожалуйста, зарегистрируйтесь снова'
				);
				setTimeout(() => router.replace('/register'), 2000);
			} else {
				setError(`Неверный код. Осталось попыток: ${attemptsLeft - 1}`);
			}
		}
	};

	const handleResend = async () => {
		if (!canResend) return;
		try {
			await authClient.phoneNumber.sendOtp(
				{ phoneNumber },
				{
					onSuccess: () => {
						startTimer();
						setError('');
						setAttemptsLeft(MAX_ATTEMPTS);
					},
					onError: (ctx) => {
						setError(
							ctx.error?.message || 'Ошибка при отправке SMS'
						);
					},
				}
			);
		} catch (error) {
			console.error('Ошибка отправки кода:', error);
			setError('Ошибка при отправке кода');
		}
	};
	return (
		<>
			<div className="flex flex-col gap-y-8">
				<h1 className="text-2xl font-bold text-[#414141] text-center">
					Регистрация
				</h1>
				<div>
					<p className="text-center text-[#8f8f8f]">Код из SMS</p>
					<form
						onSubmit={handleSubmit}
						className="w-65 mx-auto max-h-screen flex flex-col justify-center items-center"
						autoComplete="off">
						<input
							type="password"
							//ограничения для html
							inputMode="numeric"
							pattern="[0-9]{4}"
							maxLength={4}
							value={code}
							onChange={(e) => {
								setCode(e.target.value);
								setError('');
							}}
							className="flex justify-center w-27.5 h-15 text-center 
							text-2xl px-4 py-3 border border-[#bfbfbf] rounded 
							focus:border-[#70c05b] focus:shadow-(--shadow-button-default)
							 focus:bg-white focus:outline-none"
							//не сохранять код в целях безопасности
							autoComplete="one-time-code"
							required
						/>
						{error && (
							<div className="text-red-500 text-center mt-2 text-sm">
								{error}
							</div>
						)}
						<button
							type="submit"
							className={`${buttonStyles.base} ${
								code.length !== 4
									? buttonStyles.inactive
									: buttonStyles.active
							} [&&]:mt-8 mb-0`}
							disabled={code.length !== 4 || attemptsLeft <= 0}>
							Подтвердить
						</button>
					</form>
				</div>

				{!canResend ? (
					<p className="text-[#414141] text-xs text-center">
						Запросить код повторно можно через{' '}
						<span className="font-bold">{timeLeft} секунд</span>
					</p>
				) : (
					<button
						onClick={handleResend}
						disabled={!canResend}
						className={`text-xs underline cursor-pointer text-center ${
							canResend
								? 'text-[#ff6633]'
								: 'text-gray-400 cursor-not-allowed'
						}`}>
						Отправить еще раз
					</button>
				)}
				<Link
					href="/register"
					className="h-8 text-xs text-[#414141] hover:text-black w-30 flex items-center justify-center gap-x-2 mx-auto duration-300 cursor-pointer">
					<Image
						src="/icons-auth/icon-arrow-left.svg"
						width={24}
						height={24}
						alt="Вернуться"
					/>
					Вернуться
				</Link>
			</div>
		</>
	);
};
