import { NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';
import { getServerUserId } from '../../../../../utils/getServerUserId';

export async function POST(request: Request) {
	try {
		const db = await getDB();
		const userId = await getServerUserId();
		const { orderId, message, userName, userRole } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ message: 'Пользователь не авторизован' },
				{ status: 401 }
			);
		}

		const chatMessage = {
			orderId, //какой заказ
			userId, //какой юзер
			userName, //имя
			message, //сообщ
			timestamp: new Date(), //метка времени
			readBy: [userId], //айди юзера тех кто прочитал
			userRole, //роль
		};

		const result = await db
			.collection('chatMessages')
			.insertOne(chatMessage);

		return NextResponse.json({
			...chatMessage,
			_id: result.insertedId, //монго дибишная тема для того чтобы на фронте сразу отрендерить сообщение из бд
		});
	} catch (error) {
		console.error('Ошибка отправки сообщения:', error);
		return NextResponse.json(
			{ message: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		);
	}
}
