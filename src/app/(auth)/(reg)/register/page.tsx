'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PhoneInput from '../PhoneInput';

const initialFormData = {
	phone: '+7',
	surname: '',
	firstName: '',
	password: '',
	confirmPassword: '',
	birthdayDate: '',
	region: '',
	location: '',
	gender: '',
	card: '',
	email: '',
	hasCard: false,
};

function RegisterPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<{
		error: Error;
		userMessage: string;
	} | null>(null);
	const [formData, setFormData] = useState(initialFormData);

	const handleClose = () => {
		setFormData(initialFormData);
		router.back();
	};
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	const handleSubmit = () => {
		//
	};
	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center
		bg-[#fcd5bacc] min-h-screen text-[#414141]
		">
			<div
				className="bg-white rounded shadow-(--shadow-auth-form) 
			w-full max-w-[687px] max-h-[100vh] overflow-y-auto">
				<div className="flex justify-end">
					<button
						onClick={handleClose}
						className="bg-[#f3f2f1] rounded duration-300 cursor-pointer
						mb-8"
						aria-label="Закрыть">
						<Image
							src="/icons-auth/icon-closer.svg"
							alt="Закрыть окно"
							width={24}
							height={24}
						/>
					</button>
				</div>
				<h1 className="text-2xl font-bold text-center mb-10">
					Регистрация
				</h1>
				<h2 className="text-lg font-bold text-center mb-6">
					Обязательные поля
				</h2>
				<form
					onSubmit={handleSubmit}
					autoComplete="off"
					className="w-full max-w-[552px] mx-auto max-h-100vh flex flex-col 
					justify-center overflow-y-auto">
					<div className="w-full flex flex-row flex-wrap justify-center gap-x-8 gap-y-4">
						<div className="flex flex-col gap-y-4 items-start">
							<PhoneInput
								value={formData.phone}
								onChangeAction={handleChange}
							/>
							Имя Фамилия Пароль Повторить пароль
						</div>
						<div className="flex flex-col gap-y-4 items-start">
							Дата рождения Регион Населенный пункт Пол
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default RegisterPage;
