import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../utils/api-routes';

export async function POST(request: NextRequest) {
	try {
		//подкл к бд
		const db = await getDB();
		//обращ к коллекции
		const productsCollection = db.collection('products');
		//получаем бади
		const body = await request.json();
		//деструктурируем
		const {
			title,
			description,
			basePrice,
			discountPercent,
			weight,
			quantity,
			article,
			brand,
			manufacturer,
			isHealthyFood,
			isNonGMO,
			categories,
			tags,
			img,
			id,
		} = body;

		if (!id) {
			return NextResponse.json(
				{ error: 'Вставьте изображение товара' },
				{ status: 400 }
			);
		}
		//создание
		const productData = {
			id: id,
			img: img || `/images/products/img-${id}.jpeg`,
			title,
			description,
			basePrice: Number(basePrice),
			discountPercent: Number(discountPercent) || 0,
			rating: {
				count: 0,
				distribution: {
					1: 0,
					2: 0,
					3: 0,
					4: 0,
					5: 0,
				},
			},
			categories: Array.isArray(categories) ? categories : [],
			weight: Number(weight),
			quantity: Number(quantity),
			tags: Array.isArray(tags) ? tags : [],
			isHealthyFood: Boolean(isHealthyFood),
			isNonGMO: Boolean(isNonGMO),
			updatedAt: new Date(),
			article,
			brand,
			manufacturer,
		};
		//результат записываем в БД
		const result = await productsCollection.insertOne(productData);
		//ответ отправляем
		return NextResponse.json({
			success: true,
			product: { ...productData, _id: result.insertedId },
		});
	} catch (error) {
		console.error('Error adding product:', error);
		return NextResponse.json(
			{ error: 'Ошибка добавления товара' },
			{ status: 500 }
		);
	}
}
