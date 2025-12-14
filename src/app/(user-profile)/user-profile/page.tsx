'use client';

import { ErrorContent } from '@/app/(auth)/(reg)/_components/ErrorContent';
import { useAuthStore } from '@/store/authStore';
import { MailWarning, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from '@/components/Loader';
import ProfileHeader from '../_components/ProfileHeader';
import SecuritySection from '../_components/SecuritySection';
import ProfileAvatar from '../_components/ProfileAvatar';
import LocationSection from '../_components/LocationSection';
import ProfileEmail from '../_components/ProfileEmail';
import ProfilePhoneSetting from '../_components/ProfilePhone/ProfilePhoneSetting';
import ProfilePassword from '../_components/ProfilePassword';

const ProfilePage = () => {
	const { user, isAuth, checkAuth } = useAuthStore();
	//состояние проверки
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const router = useRouter();
	//как зарегистрирован
	const isPhoneRegistration = user?.phoneNumberVerified;

	//проверка аунтификации вытаскиваем из стора
	useEffect(() => {
		const checkAuthentication = async () => {
			await checkAuth();
			setIsCheckingAuth(false);
		};
		checkAuthentication();
	}, [checkAuth]);
	//проверка на авторизацию
	useEffect(() => {
		if (!isCheckingAuth && !isAuth) {
			router.replace('/');
		}
	}, [isAuth, isCheckingAuth, router]);

	const handleToLogin = () => {
		router.replace('/login');
	};

	const handleToRegister = () => {
		router.replace('/register');
	};

	//проверка сессии
	if (isCheckingAuth) {
		return <Loader />;
	}
	//подгрузка пользователя
	if (!isAuth) {
		return <Loader />;
	}

	if (!user) {
		return (
			<ErrorContent
				error="Данные пользователя не найдены"
				icon={<MailWarning className="h-8 w-8 text-red-600" />}
				primaryAction={{ label: 'Войти', onClick: handleToLogin }}
				secondaryAction={{
					label: 'Зарегистрироваться',
					onClick: handleToRegister,
				}}
			/>
		);
	}

	return (
		<div className="bg-[#fbf8ec] px-4 md:px-6 xl:px-8 max-w-4xl w-full mx-auto">
			<div className="animate-slide-in opacity translate-y-8 bg-white rounded-xl shadow-xl overflow-hidden duration-700 ease-out">
				<ProfileHeader name={user.name} surname={user.surname} />

				<div className="p-6 md:p-8">
					<div className="flex items-center justify-center mb-6">
						<div className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center">
							{isPhoneRegistration ? (
								<>
									<Phone className="h-4 w-4 mr-1" />
									<span>Зарегистрирован по телефону</span>
								</>
							) : (
								<>
									<MailWarning className="h-4 w-4 mr-1" />
									<span>Зарегистрирован по email</span>
								</>
							)}
						</div>
					</div>
					<ProfileAvatar gender={user.gender || 'male'} />
					<LocationSection />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<ProfileEmail />
						<ProfilePhoneSetting />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<ProfilePassword />
					</div>
					<SecuritySection />
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
