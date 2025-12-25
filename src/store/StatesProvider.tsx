'use client';

import { useEffect } from 'react';
import { useAuthStore } from './authStore';
import { useCartStore } from './cartStore';
//сделаем чтобы обернуть приложение и всегда была возможность
// проверить авторизацию и получить данные
const StatesProvider = ({ children }: { children: React.ReactNode }) => {
	//для проверки авторизации при загрузке приложения
	const { checkAuth, user } = useAuthStore();
	const { fetchCart, clearCart } = useCartStore();

	//Нужно синхронизировать корзину при изменение пользователя

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	//нужен юзер берем из ауфстр
	useEffect(() => {
		if (user) {
			//определяем роль
			const isManagerOrAdmin =
				user.role === 'manager' || user.role === 'admin';
			if (!isManagerOrAdmin) {
				fetchCart();
			} else {
				clearCart();
			}
		} else {
			clearCart(); //очищаем корзину не в бд а в сторе
		}
	}, [user, fetchCart, clearCart]);
	return <>{children}</>;
};

export default StatesProvider;
