import { useState, useEffect } from 'react';
import { Order, OrderItem } from '@/types/order';
import { ProductCardProps } from '@/types/product';

export const useOrderProducts = (order: Order) => {
	//все данные о продукте заказа
	const [orderProducts, setOrderProducts] = useState<ProductCardProps[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	//для повторного заказа, проверка есть ли такие товары на складе
	const [stockWarnings, setStockWarnings] = useState<string[]>([]);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				//достаточно ли продуктов для повтора
				const warnings: string[] = [];
				const promises = order.items.map(async (item: OrderItem) => {
					try {
						//данные о продукте
						const response = await fetch(
							`/api/products/${item.productId}`
						);
						if (!response.ok) {
							throw new Error(
								`Товар ${item.productId} не найден`
							);
						}
						//присваиваем полученные данные
						const productData: ProductCardProps =
							await response.json();
						//проверка кол-ва
						const availableQuantity = productData.quantity;
						//сколько было в послед заказе
						const orderQuantity = item.quantity;
						//осталось меньше чем в заказе, тогда тру
						const isLowStock = availableQuantity < orderQuantity;
						const insufficientStock = availableQuantity === 0;

						if (isLowStock) {
							//если временно отсутствует
							if (insufficientStock) {
								warnings.push(
									`Товар "${productData.title}" временно отсутствует на складе`
								);
							} else {
								//ну или покажем кол-во
								warnings.push(
									`Товара "${productData.title}" осталось ${availableQuantity} шт., а в заказе ${orderQuantity} шт.`
								);
							}
						}
						//ПродуктДата - из апи сам продукт
						//item это к заказу
						const productCardData = {
							_id: productData._id,
							id: productData.id,
							img: productData.img,
							title: productData.title,
							description: productData.description,
							basePrice: item.price,
							discountPercent: item.discountPercent || 0,
							orderQuantity: orderQuantity,
							rating: productData.rating,
							quantity: productData.quantity,
							isLowStock,
							insufficientStock,
							categories: productData.categories || [],
						} as ProductCardProps;

						return productCardData;
					} catch (fetchError) {
						console.error(
							`Ошибка загрузки товара ${item.productId}:`,
							fetchError
						);
						return null;
					}
				});

				const results = await Promise.all(promises);
				//фильтр данных по которым нет инфы
				const validProducts = results.filter(
					(product): product is ProductCardProps => product !== null
				);

				setOrderProducts(validProducts);
				setStockWarnings(warnings);
			} catch (error) {
				console.error('Ошибка загрузки товаров:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [order]);

	return { orderProducts, loading, stockWarnings };
};
