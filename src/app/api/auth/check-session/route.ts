import { NextResponse } from 'next/server';
import {
	getBetterAuthSession,
	getCustomSessionToken,
	validateCustomSession,
} from '../../../../../utils/auth-helpers';

//для быстрой проверки
export async function GET(request: Request) {
	try {
		//сначала проверка сессии для емаил и ОТП
		const betterAuthSession = await getBetterAuthSession(request.headers);
		if (betterAuthSession) return NextResponse.json({ isAuth: true });
		//телефон+пароль юзеры.извлечь токен сессии из запроса
		const sessionToken = getCustomSessionToken(
			request.headers.get('cookie')
		);
		if (!sessionToken) return NextResponse.json({ isAuth: false });
		//проверить сессию
		const isAuth = await validateCustomSession(sessionToken);
		return NextResponse.json({ isAuth });
	} catch (error) {
		console.error('Error in check-session:', error);
		return NextResponse.json({ isAuth: false });
	}
}
