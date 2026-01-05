//преобразование данных заказа и текущих цен товара в структур данные для отображения в корзине
//унифиц формат данных для UI, для выполнения повторного заказа

import { useMemo } from 'react';
import { Order } from '@/types/order';
import { CustomCartItem, CustomPricing } from '@/types/cart';
import { CurrentProduct, ProductsData } from '@/types/userOrder';
import { CONFIG } from '../../config/config';

export const useOrderPricing = (
	order: Order, //заказ пользв
	currentProducts: CurrentProduct[] //актуал данные на момент
) => {
	//массив товаров в формате корзины с актуальными ценами
	const cartItemsForSummary: CustomCartItem[] = useMemo(
		() =>
			order.items.map((item) => {
				const currentProduct = currentProducts.find(
					(p) => p.id.toString() === item.productId.toString()
				);

				if (!currentProduct) {
					return {
						productId: item.productId,
						quantity: item.quantity,
						price: item.price,
						discountPercent: item.discountPercent || 0,
						hasLoyaltyDiscount: item.hasLoyaltyDiscount || false,
						addedAt: new Date(),
					};
				}
				//расчёт цены после скидки на товра
				const priceAfterDiscount =
					currentProduct.basePrice *
					(1 - (currentProduct.discountPercent || 0) / 100);

				return {
					productId: item.productId,
					quantity: item.quantity,
					price: priceAfterDiscount,
					discountPercent: currentProduct.discountPercent || 0,
					hasLoyaltyDiscount:
						currentProduct.hasLoyaltyDiscount || false,
					addedAt: new Date(),
				};
			}),
		[order.items, currentProducts]
	);
	//цены для быстр доступа по ид товара
	const productsPricingData: ProductsData = useMemo(
		() =>
			currentProducts.reduce((acc, product) => {
				acc[product.id] = {
					basePrice: product.basePrice,
					discountPercent: product.discountPercent || 0,
					hasLoyaltyDiscount: product.hasLoyaltyDiscount || false,
				};
				return acc;
			}, {} as ProductsData),
		[currentProducts]
	);
	//цена без скидк
	const customPricing: CustomPricing = useMemo(() => {
		const totalAfterProductDiscounts = cartItemsForSummary.reduce(
			(sum, item) => {
				return sum + item.price * item.quantity;
			},
			0
		);
		//финал цена со скидками
		const finalTotal = cartItemsForSummary.reduce((sum, item) => {
			const finalPrice = item.hasLoyaltyDiscount
				? item.price * (1 - CONFIG.CARD_DISCOUNT_PERCENT / 100)
				: item.price;
			return sum + finalPrice * item.quantity;
		}, 0);
		//сумма скидки
		const totalDiscount = totalAfterProductDiscounts - finalTotal;

		return {
			totalPrice: totalAfterProductDiscounts,
			totalMaxPrice: totalAfterProductDiscounts,
			totalDiscount,
			finalPrice: finalTotal,
			totalBonuses: 0, //так как корзина требует бонусы
			maxBonusUse: 0, //так как корзина требует бонусы
			isMinimumReached: true, //минималку вкл вдруг цены упали
		};
	}, [cartItemsForSummary]);

	return {
		cartItemsForSummary,
		productsData: productsPricingData, //объект с ценами для быстрого доступа по ид
		customPricing, //итог сумма,скидки,финал цена
	};
};
