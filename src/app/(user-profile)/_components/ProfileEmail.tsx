import { useAuthStore } from '@/store/authStore';

import { formStyles, profileStyles } from '@/app/(auth)/styles';
import { Mail, Edit } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { CONFIG } from '../../../../config/config';
import { AuthFormLayout } from '@/app/(auth)/_components/AuthFormLayout';

import { authClient } from '@/lib/auth-client';
import { SuccessChangeEmail } from './SuccessChangeEmail';
import AlertMessage from './AlerMessage';

const ProfileEmail = () => {
	//переключение кнопок
	const [isEditing, setIsEditing] = useState(false);
	//перекл имени кнопок
	const [isSaving, setIsSaving] = useState(false);
	const [email, setEmail] = useState<string>('');
	const [showSuccess, setShowSuccess] = useState(false);
	const [error, setError] = useState('');
	//достаём юзера
	const { user, fetchUserData } = useAuthStore();
	//если емеил содержить доменный хвостик значит он технический
	const isTempEmail = user?.email?.endsWith(CONFIG.TEMPORARY_EMAIL_DOMAIN);
	//если нет почты вообще
	const hasNoEmail = !user?.email || user.email.trim() === '' || isTempEmail;
	//по тел зареган или нет, для определения логики дальнейшей
	const isPhoneRegistered = user?.phoneNumberVerified === true;

	//проверка на емаил если технический то не выводим, если свой то выводим
	useEffect(() => {
		if (user) {
			setEmail(isTempEmail ? '' : user.email || '');
		}
	}, [isTempEmail, user]);

	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		setError('');
	};

	const handleCancel = () => {
		setEmail(isTempEmail ? '' : user?.email || '');
		setIsEditing(false);
		setError('');
	};

	const handleSave = async () => {
		//проверка есть ли пользователь
		if (!user) return;
		//валидация емаил адреса
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError('Пожалуйста, введите корректный email адрес');
			return;
		}
		//проверка чтобы новый адресс не совпадал уже с имеющимся
		const currentDisplayEmail = isTempEmail ? '' : user.email || '';
		if (email === currentDisplayEmail) {
			setError('Новый email совпадает с текущим');
			return;
		}

		setIsSaving(true);
		setError('');

		try {
			//если зареган по телефону
			if (isPhoneRegistered) {
				await updateEmailDirectly();
			} else {
				//если почта то методы беттер ауф
				const response = await authClient.changeEmail({
					newEmail: email,
					callbackURL: '/login',
				});
				//обработка ошибок
				if (response.error) {
					//ошибка если емаил занят
					if (response.error.code === 'COULDNT_UPDATE_YOUR_EMAIL') {
						throw new Error(
							'Этот email уже используется другим пользователем'
						);
					} else {
						throw new Error(
							response.error.message || 'Ошибка при смене email'
						);
					}
				}

				setShowSuccess(true);
				setIsEditing(false);
			}
		} catch (error) {
			console.error('Ошибка при сохранении:', error);

			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('Произошла неизвестная ошибка при смене email');
			}
		} finally {
			setIsSaving(false);
		}
	};

	{
		/*сообщение об успешной операции тем кто по емаил зареган*/
	}
	const updateEmailDirectly = async () => {
		const response = await fetch('/api/auth/update-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, userId: user?.id }),
		});

		const data = await response.json();

		if (!response.ok) {
			setError(data.error);
			return;
		}
		//обнова данных юзера
		await fetchUserData();
		alert('Email успешно обновлен!');
		setIsEditing(false);
	};
	if (showSuccess) {
		return (
			<AuthFormLayout>
				<SuccessChangeEmail
					email={user?.email || ''}
					newEmail={email}
				/>
			</AuthFormLayout>
		);
	}

	return (
		<div className="mb-8">
			<div className="flex flex-wrap justify-between items-center mb-4 gap-4">
				<h3 className={profileStyles.sectionTitle}>Email</h3>
				{!isEditing ? (
					<button
						onClick={() => setIsEditing(true)}
						className={profileStyles.editButton}>
						<Edit className="h-4 w-4 mr-1" />
						Редактировать
					</button>
				) : (
					<div className="flex gap-2 w-full md:w-auto">
						<button
							onClick={handleCancel}
							className={profileStyles.cancelButton}>
							Отмена
						</button>
						<button
							onClick={handleSave}
							className={profileStyles.saveButton}>
							{isSaving ? 'Сохранение...' : 'Сохранить'}
						</button>
					</div>
				)}
			</div>

			<div className={profileStyles.inputContainer}>
				<input
					id="email"
					type="email"
					value={email}
					onChange={handleEmailChange}
					className={`${formStyles.input} [&&]:w-full disabled:cursor-not-allowed [&&]:disabled:bg-[#f3f2f1]`}
					placeholder="Введите ваш email"
					disabled={!isEditing}
				/>
				<Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
			</div>
			{/*когда нет почты и состояние не редактируется*/}
			{hasNoEmail && !isEditing && (
				<AlertMessage
					type="warning"
					message="Рекомендуем добавить email для получения уведомлений"
				/>
				// <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-2 rounded mt-3">
				// 	<AlertCircle className="h-4 w-4 mr-2" />
				// 	<span className="text-sm">
				// 		Рекомендуем добавить email для получения уведомлений
				// 	</span>
				// </div>
			)}
			{/*когда зареган по телефону и происходит редактирование */}
			{isEditing && isPhoneRegistered && (
				<AlertMessage
					type="success"
					message="Вы можете изменить email без подтверждения, так как были зарегистрированы по телефону"
				/>
				// <div className="flex items-center bg-green-50 text-primary px-3 py-2 rounded mt-3">
				// 	<AlertCircle className="h-4 w-4 mr-2" />
				// 	<span className="text-sm">
				// 		Вы можете изменить email без подтверждения, так как были
				// 		зарегистрированы по телефону
				// 	</span>
				// </div>
			)}
			{/*зареган по емаил и в состояние редакирования*/}
			{isEditing && !isPhoneRegistered && (
				<AlertMessage
					type="success"
					message="Для смены email потребуется подтверждение на прежнем и новом адресах."
				/>
				// <div className="flex items-center bg-orange-50 text-[#ff6633] px-3 py-2 rounded mt-3">
				// 	<AlertCircle className="h-4 w-4 mr-2" />
				// 	<span className="text-sm">
				// 		Для смены email потребуется подтверждение на прежнем и
				// 		новом адресах.
				// 	</span>
				// </div>
			)}

			{error && (
				<AlertMessage type="error" message={error} />
				// <div className="flex items-center bg-red-50 text-red-700 px-3 py-2 rounded mt-3">
				// 	<AlertCircle className="h-4 w-4 mr-2" />
				// 	<span className="text-sm">{error}</span>
				// </div>
			)}
		</div>
	);
};

export default ProfileEmail;
