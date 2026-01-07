import { NextResponse } from 'next/server';
import { getDB } from '../../../../../../../utils/api-routes';
import { getServerUserId } from '../../../../../../../utils/getServerUserId';

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ orderId: string }> }
) {
	try {
		const { orderId } = await params;
		const userId = await getServerUserId();
		const db = await getDB();

		if (!userId) {
			return NextResponse.json(false);
		}
		//проверка есть ли хотяб 1 не прочитанное сообщение для юзера с ИД
		const hasUnread = await db.collection('chatMessages').findOne({
			orderId,
			readBy: { $ne: userId },
		});

		return NextResponse.json(!!hasUnread); //булевый возвращаем
	} catch (error) {
		console.error('Ошибка проверки непрочитанных сообщений:', error);
		return NextResponse.json(false);
	}
}
