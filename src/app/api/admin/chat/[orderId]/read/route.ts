import { NextResponse } from 'next/server';
import { getDB } from '../../../../../../../utils/api-routes';
import { getServerUserId } from '../../../../../../../utils/getServerUserId';

//для того чтобы помечать сообщения прочитанные пользователем
//при клие на чат с уведомлением на фронте будет стучать сюда в апишку
export async function POST(
	request: Request,
	{ params }: { params: Promise<{ orderId: string }> }
) {
	try {
		const { orderId } = await params;
		const userId = await getServerUserId();
		const db = await getDB();

		await db.collection('chatMessages').updateMany(
			{
				orderId,
				readBy: { $ne: userId }, // чтобы не писал каждый раз, проверяем есть ли такой юзер уже
			},
			{
				$addToSet: { readBy: userId }, //1. записывает айди конкретного пользователя кто прочитал
			}
		);

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ message: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		);
	}
}
