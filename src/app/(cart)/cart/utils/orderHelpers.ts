import { CartItem } from '@/types/cart';
import {
	CartItemWithPrice,
	CreateOrderRequest,
	UpdateUserData,
} from '@/types/order';
import { ProductCardProps } from '@/types/product';
import {
	calculateFinalPrice,
	calculatePriceByCard,
} from '../../../../../utils/calcPrices';
import { CONFIG } from '../../../../../config/config';

export const prepareCartItemsWithPrices = (
	cartItems: CartItem[], //массив товаров в корзине
	productsData: Record<string, ProductCardProps>, //объект с данными товара
	hasLoyaltyCard: boolean //наличие карты лояльности
): CartItemWithPrice[] => {
	return cartItems //возвращаем массив товаров с рассчитанными скидками
		.map((item) => {
			const product = productsData[item.productId]; //находим данные товара
			//проверка найден ли товар
			if (!product) {
				console.warn(`Товар ${item.productId} не найден, пропускаем`);
				return null;
			}
			//рассчит скидки на сам товар
			const priceWithDiscount = calculateFinalPrice(
				product.basePrice,
				product.discountPercent || 0
			);
			//финал цена с учетом карты лояльности
			const finalPrice = hasLoyaltyCard
				? calculatePriceByCard(
						priceWithDiscount,
						CONFIG.CARD_DISCOUNT_PERCENT
					)
				: priceWithDiscount;

			return {
				...item, //копируем все свойства
				price: finalPrice, //добавляем рассчит финал цену
				basePrice: product.basePrice, //базовую цену товара
				discountPercent: product.discountPercent || 0, //процент скидки
				hasLoyaltyDiscount: hasLoyaltyCard, //флаг прим скидки
			};
		})
		.filter(Boolean) as CartItemWithPrice[]; // фильтруем и приводим к типу
};

export const createOrderRequest = async (orderData: CreateOrderRequest) => {
	const response = await fetch('/api/orders', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(orderData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Ошибка при создании заказа');
	}

	return await response.json();
};

export const updateUserAfterPayment = async (data: UpdateUserData) => {
	try {
		const response = await fetch('/api/users/update-after-payment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || 'Ошибка обновления пользователя'
			);
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка обновления пользователя:', error);
		throw error;
	}
};

export const confirmOrderPayment = async (orderId: string) => {
	try {
		const response = await fetch('/api/orders/confirm-payment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ orderId }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || 'Ошибка при подтверждении оплаты'
			);
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при подтверждении оплаты:', error);
		throw error;
	}
};
