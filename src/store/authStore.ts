// import { create } from 'zustand';

// type AuthState = {
// 	isAuth: boolean;
// 	userName: string;
// 	login: (name: string) => void;
// };

// export const useAuthStore = create<AuthState>()((set) => ({
// 	isAuth: false,
// 	userName: '',
// 	login: (name) => set({ isAuth: true, userName: name }),
// }));

import { create } from 'zustand';
import { authClient } from '@/lib/auth-client';

type UserData = {
	id: string;
	name: string;
	surname: string;
	email: string;
	phoneNumber: string;
	emailVerified: boolean;
	phoneNumberVerified: boolean;
	gender: string;
	birthdayDate?: string;
	location?: string;
	region?: string;
} | null;

type AuthState = {
	isAuth: boolean;
	user: UserData;
	isLoading: boolean;
	login: () => void;
	logout: () => Promise<void>;
	//проверка аунтификации через наличие сессии
	checkAuth: () => Promise<boolean>;
	//загрузка данных пользователя
	fetchUserData: () => Promise<void>;
};

//перед тем как закинуть в стор получаем из сессии
//перед тем как получить из сессии нужно проверить если ли она
export const useAuthStore = create<AuthState>((set, get) => ({
	//initialState
	isAuth: false,
	user: null,
	isLoading: false,

	login: () => {
		set({ isAuth: true });
		get().fetchUserData();
	},

	//проверка авторизации
	checkAuth: async () => {
		try {
			set({ isLoading: true });
			const response = await fetch('/api/auth/check-session');

			if (!response.ok) {
				set({ isAuth: false, user: null, isLoading: false });
				return false;
			}

			const data = await response.json();

			if (data.isAuth) {
				set({ isAuth: true });
				await get().fetchUserData();
			} else {
				set({ isAuth: false, user: null, isLoading: false });
			}

			return data.isAuth;
		} catch {
			set({ isAuth: false, user: null, isLoading: false });
			return false;
		}
	},

	//загрузка данных пользователя
	fetchUserData: async () => {
		try {
			set({ isLoading: true });
			const response = await fetch('/api/auth/user');

			if (response.status === 401 || response.status === 403) {
				throw new Error('Unauthorized');
			}

			if (!response.ok) {
				throw new Error('Ошибка получения данных');
			}

			const userData = await response.json();

			set({ user: userData, isLoading: false });
		} catch (error) {
			console.error('Ошибка загрузки данных пользователя:', error);
			set({ user: null, isLoading: false });

			if (error === 'Unauthorized') {
				set({ isAuth: false });
			}
		}
	},
	//выход из сессии
	logout: async () => {
		try {
			await authClient.signOut();

			await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			set({ isAuth: false, user: null });
		}
	},
}));
