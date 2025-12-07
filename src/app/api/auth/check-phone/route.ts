import { NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';

export async function POST(request: Request) {
	try {
		//получить телефон из реквеста
		const { phoneNumber } = await request.json();
		//обращаемся к бд
		const db = await getDB();
		//ищем пользователя с таким телефоном
		const user = await db.collection('user').findOne({
			phoneNumber,
		});
		//если нету верни ответ exists:false
		if (!user) {
			return NextResponse.json({
				exists: false,
			});
		}
		//иначе true
		return NextResponse.json({
			exists: true,
			userName: user.name,
		});
	} catch (error) {
		console.error('Ошибка проверки телефона:', error);
		return NextResponse.json(
			{
				error: 'Ошибка сервера',
			},
			{ status: 500 }
		);
	}
}
