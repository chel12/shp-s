'use client';

import { useEffect } from 'react';
import { useAuthStore } from './authStore';
//сделаем чтобы обернуть приложение и всегда была возможность 
// проверить авторизацию и получить данные
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	//для проверки авторизации при загрузке приложения
	const { checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	return <>{children}</>;
};

export default AuthProvider;
