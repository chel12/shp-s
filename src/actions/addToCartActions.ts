'use server';
import { getDB } from '../../utils/api-routes';
import { ObjectId } from 'mongodb';
import { getServerUserId } from '../../utils/getServerUserId';
import { CartItem } from '@/types/cart';

export async function addToCartAction(
	productId: string
): Promise<{ success: boolean; message: string; loyaltyPrice?: number }> {
	try {
		//проверка ид продукта
		if (!productId) {
			return { success: false, message: 'ID продукта не указан' };
		}
		//проверка ид юзера
		const userId = await getServerUserId();

		if (!userId) {
			return { success: false, message: 'Не авторизован' };
		}

		const db = await getDB();
		//поиск юзера в бд
		const user = await db.collection('user').findOne({
			_id: ObjectId.createFromHexString(userId),
		});

		if (!user) {
			return { success: false, message: 'Пользователь не найден' };
		}
		//ид в число так как в бд это число
		const productIdNumber = parseInt(productId);

		const product = await db.collection('products').findOne({
			id: productIdNumber,
		});

		if (!product) {
			return { success: false, message: 'Продукт не найден' };
		}

		//текущие товары в корзине юзера получаем и пихаем в массив
		const cartItems: CartItem[] = user.cart || [];

		const existingItem = cartItems.find(
			(item: CartItem) => item.productId === productId
		);
		//если товар существует уже
		if (existingItem) {
			return {
				success: false,
				message: 'Товар уже в корзине',
			};
		}

		const productQuantity = product.quantity || 0;
		const initialQuantity = productQuantity > 0 ? 1 : 0;

		//новый элемент корзины
		const newCartItem: CartItem = {
			productId,
			quantity: initialQuantity,
			addedAt: new Date(),
		};

		const newCartItems = [...cartItems, newCartItem];
		//ищем по бд юзера и переписываем
		await db
			.collection('user')
			.updateOne(
				{ _id: ObjectId.createFromHexString(userId) },
				{ $set: { cart: newCartItems } }
			);

		return {
			success: true,
			message: '',
		};
	} catch {
		return { success: false, message: 'Ошибка сервера' };
	}
}
