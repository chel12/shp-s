import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { getDB } from '../../../../../utils/api-routes';

export async function POST(request: NextRequest) {
	try {
		//берём юзера из запроса и пароль
		const { userId, password } = await request.json();
		//проверка если нету иди отсюда
		if (!userId || !password) {
			return Response.json(
				{ error: 'Требуется userId и password' },
				{ status: 400 }
			);
		}

		const db = await getDB();
		//обращаемся в коллекцию юзера и задаём пароль
		const result = await db.collection('user').updateOne(
			//по документации монго нашли юзера и конвертировали в обджектИд
			{ _id: ObjectId.createFromHexString(userId) },
			//уст хешир пароль
			{ $set: { password: await bcrypt.hash(password, 10) } }
		);
		//если юзера нет то иди отсюда
		if (result.matchedCount === 0) {
			return Response.json(
				{ error: 'Пользователь не найден', debug: { userId } },
				{ status: 404 }
			);
		}
		//отправляем окей
		return Response.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Ошибка:', error);
		return Response.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		);
	}
}
