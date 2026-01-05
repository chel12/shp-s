//проверка цены продуктов из БД и заказа
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '@/types/order';
import { CurrentProduct, PriceComparison } from '@/types/userOrder';
import { CONFIG } from '../../config/config';
import { ProductCardProps } from '@/types/product';
import { useAuthStore } from '@/store/authStore';

export const usePriceComparison = (
	order: Order,
	productsData: ProductCardProps[]
) => {
	//стейт для изменений
	const [priceComparison, setPriceComparison] =
		useState<PriceComparison | null>(null);
	//берем юзера
	const { user } = useAuthStore();
	//проверяем есть у юзера карта лояльности или нет
	const hasLoyaltyCard = !!user?.card || false;
	//вычисляет текущие цены товаров с учётом актуальных скидок и статусов карты лояльности
	const currentProducts = useMemo((): CurrentProduct[] => {
		//если нет товаров
		if (!productsData || productsData.length === 0) {
			return [];
		}
		//возвращ результата мепа
		return order.items
			.map((item) => {
				//актуальн данные товара по ИД
				const productData = productsData.find(
					(p) => p.id.toString() === item.productId.toString()
				);

				if (!productData) {
					return null;
				}
				//вычисляем множетель скидки
				const discountMultiplier =
					1 - (productData.discountPercent || 0) / 100;
				//финал цена
				let finalPrice =
					Math.round(
						productData.basePrice * discountMultiplier * 100
					) / 100;
				//если карта лоялки то доп скидка
				if (hasLoyaltyCard) {
					finalPrice =
						finalPrice * (1 - CONFIG.CARD_DISCOUNT_PERCENT / 100);
				}

				const currentProduct: CurrentProduct = {
					id: item.productId,
					price: finalPrice,
					basePrice: productData.basePrice,
					discountPercent: productData.discountPercent,
					hasLoyaltyDiscount: hasLoyaltyCard,
					title: productData.title,
				};

				return currentProduct;
			}) //доп роверка null отсев
			.filter((product): product is CurrentProduct => product !== null);
	}, [order.items, productsData, hasLoyaltyCard]);

	//сравнивает цены из заказов с текущими и показывает расхождения
	//3 тип отслед: Базовую цену, скидка,карта лояльности
	const comparePrices = useCallback((): void => {
		//если ничего не пришло из функции сверху
		if (currentProducts.length === 0) {
			setPriceComparison(null);
			return;
		}
		//массив для хранения изменений
		const changedItems: PriceComparison['changedItems'] = [];
		//флаг изменений
		let hasAnyChanges = false;
		let currentTotal = 0;
		//проход по товарам из ориг заказа
		order.items.forEach((orderItem) => {
			//поиск актуал товара
			const currentProduct = currentProducts.find(
				(p) => p.id === orderItem.productId
			);
			//если найден то стоимость к общей сумме+
			if (currentProduct) {
				currentTotal += currentProduct.price * orderItem.quantity;
				//откат к баз цене для проверки
				const originalPriceWithoutLoyalty = orderItem.hasLoyaltyDiscount
					? orderItem.price / (1 - CONFIG.CARD_DISCOUNT_PERCENT / 100)
					: orderItem.price;
				//откат к баз цене для проверки
				const currentPriceWithoutLoyalty =
					currentProduct.hasLoyaltyDiscount
						? currentProduct.price /
							(1 - CONFIG.CARD_DISCOUNT_PERCENT / 100)
						: currentProduct.price;
				//из-за того что округляли тут делаем чтобы учёт копейки не считал
				const priceChanged =
					Math.abs(
						originalPriceWithoutLoyalty - currentPriceWithoutLoyalty
					) > 0.01;
				//првоерка процента скидки на товар
				const discountChanged =
					(orderItem.discountPercent || 0) !==
					(currentProduct.discountPercent || 0);
				//проверка изменений карты лояльности
				const loyaltyStatusChanged =
					orderItem.hasLoyaltyDiscount !==
					currentProduct.hasLoyaltyDiscount;
				//если есть изменения пушим их
				if (priceChanged || discountChanged || loyaltyStatusChanged) {
					changedItems.push({
						productId: orderItem.productId,
						productName: currentProduct.title,
						originalPrice: orderItem.price,
						currentPrice: currentProduct.price,
						quantity: orderItem.quantity,
						priceChanged,
						discountChanged,
						loyaltyStatusChanged,
						originalDiscount: orderItem.discountPercent || 0,
						currentDiscount: currentProduct.discountPercent || 0,
						originalHasLoyalty:
							orderItem.hasLoyaltyDiscount || false,
						currentHasLoyalty:
							currentProduct.hasLoyaltyDiscount || false,
					});
					hasAnyChanges = true;
				}
			}
		});
		//сумма ориг заказа
		const originalTotal = order.totalAmount;
		//разница сумм от текущий и суммы заказа
		const difference = currentTotal - originalTotal;
		//есть ли значимые изменения
		const hasChanges = hasAnyChanges || Math.abs(difference) > 0.01;
		//сохр результаты сравнения
		setPriceComparison({
			hasChanges,
			originalTotal,
			currentTotal,
			difference,
			changedItems,
		});
	}, [currentProducts, order.items, order.totalAmount]);

	useEffect(() => {
		comparePrices();
	}, [comparePrices]);

	console.log(currentProducts, priceComparison);

	return { currentProducts, priceComparison };
};
