import { getDB } from '../../../../../utils/api-routes';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerUserId } from '../../../../../utils/getServerUserId';

export async function POST(request: Request) {
	try {
		const db = await getDB();
		//парсим данные
		const requestData = await request.json();
		//дестректурируем данные из запроса
		const { usedBonuses, earnedBonuses, purchasedProductIds } = requestData;
		//получаем пользователяы
		const userId = await getServerUserId();

		console.log(`ID пользователя -1`, userId);

		if (!userId) {
			return NextResponse.json(
				{ message: 'Пользователь не авторизован' },
				{ status: 401 }
			);
		}

		let userObjectId;
		try {
			//пытаемся хекс преобразовать в обьектИД
			userObjectId = ObjectId.createFromHexString(userId);
			console.log(`ID пользователя - 2`, userObjectId);
		} catch {
			console.error('Invalid user ID format:', userId);
			return NextResponse.json(
				{ message: 'Неверный формат ID пользователя' },
				{ status: 400 }
			);
		}
		//ищем потом его по объект ид
		const user = await db.collection('user').findOne({
			_id: userObjectId,
		});

		if (!user) {
			return NextResponse.json(
				{ message: 'Пользователь не найден' },
				{ status: 404 }
			);
		}
		//получаем текущ кол-во бонусов
		const currentBonuses = user.bonusesCount || 0;
		const usedBonusesNum = Number(usedBonuses) || 0; //преобразуем в число
		const earnedBonusesNum = Number(earnedBonuses) || 0; //заработанные бонусы в число

		if (usedBonusesNum > currentBonuses) {
			return NextResponse.json(
				{
					message: 'Недостаточно бонусов',
					availableBonuses: currentBonuses,
					requiredBonuses: usedBonusesNum,
				},
				{ status: 400 }
			);
		}
		//новое кол-во расчет бонусов
		const newBonusesCount =
			currentBonuses - usedBonusesNum + earnedBonusesNum;
		//текущий массив покупок пользователя
		const currentPurchases = Array.isArray(user.purchases)
			? user.purchases
			: [];
		//преобразование массива ИД купленных товаров в числа
		const numericPurchasedIds = (purchasedProductIds || []).map(
			(id: string) => Number(id)
		);
		//созд обнов массив ид купленных товаров в числа
		const updatedPurchases = [...currentPurchases, ...numericPurchasedIds];

		const updateResult = await db.collection('user').updateOne(
			{ _id: userObjectId },
			{
				$set: {
					bonusesCount: newBonusesCount, //обнов бонусы
					purchases: updatedPurchases, //обнов покупки
					cart: [], //чистим корзину
					updatedAt: new Date(),
				},
			}
		);
		//проверка были ли данные обновлены
		if (updateResult.modifiedCount === 0) {
			return NextResponse.json(
				{ message: 'Данные не были обновлены' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Пользователь успешно обновлен',
			updatedFields: {
				bonusesDeducted: usedBonusesNum,
				bonusesAdded: earnedBonusesNum,
				newBonusesCount,
				productsAdded: numericPurchasedIds.length,
				totalPurchases: updatedPurchases.length,
				cartCleared: true,
			},
		});
	} catch (error) {
		console.error('Ошибка обновления данных пользователя:', error);
		return NextResponse.json(
			{ message: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		);
	}
}
