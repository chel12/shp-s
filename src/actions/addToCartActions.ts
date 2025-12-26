'use server';
import { getDB } from '../../utils/api-routes';
import { ObjectId } from 'mongodb';
import { CONFIG } from '../../config/config';
import { formatPrice } from '../../utils/formatPrice';
import { getServerUserId } from '../../utils/getServerUserId';
import { CartItem } from '@/types/cart';
import { getFullEnding } from '../../utils/getWordEnding';

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

		const discountPercent = product.discountPercent || 0;
		const basePrice = product.basePrice || 0;
		//цена со скидкой
		const priceWithDiscount =
			Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
		//проверка карты лояльности
		const hasLoyaltyCard = user.card && user.card !== '';
		//текущие товары в корзине юзера получаем и пихаем в массив
		const cartItems: CartItem[] = user.cart || [];

		const existingItem = cartItems.find(
			(item: CartItem) => item.productId === productId
		);
		//если товар существует уже
		if (existingItem) {
			return {
				success: false,
				message:
					'Товар уже в корзине. Изменить его количество можно на странице корзины',
			};
		}
		//калькуляция бонусов
		const calculatedBonuses = Math.round(
			(priceWithDiscount * CONFIG.BONUSES_PERCENT) / 100
		);

		let loyaltyPrice: number | undefined;
		let loyaltyDiscountApplied = false;
		//если есть карта лояльности
		if (hasLoyaltyCard) {
			const cardDiscountPercent = CONFIG.CARD_DISCOUNT_PERCENT;
			//финал цена с картой
			loyaltyPrice =
				Math.round(
					priceWithDiscount * (1 - cardDiscountPercent / 100) * 100
				) / 100;
			loyaltyDiscountApplied = true;
		}
		//новый элемент корзины
		const newCartItem: CartItem = {
			productId,
			quantity: 1,
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

		let successMessage = 'Товар добавлен в корзину';

		if (loyaltyDiscountApplied && loyaltyPrice) {
			const discountAmount = priceWithDiscount - loyaltyPrice;
			const cardDiscountPercent = CONFIG.CARD_DISCOUNT_PERCENT;
			successMessage += ` (скидка по карте -${cardDiscountPercent}%: -${formatPrice(discountAmount)} ₽)`;
		}

		const bonusWord = `${`бонус${getFullEnding(calculatedBonuses)}`}`;

		successMessage += `. При покупке Вы получите ${calculatedBonuses} ${bonusWord}.`;

		const result: {
			success: boolean;
			message: string;
			loyaltyPrice?: number;
		} = {
			success: true,
			message: successMessage,
		};

		if (hasLoyaltyCard && loyaltyPrice) {
			result.loyaltyPrice = loyaltyPrice;
		}

		return result;
	} catch {
		return { success: false, message: 'Ошибка сервера' };
	}
}
