import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';
import { ProductCardProps } from '@/types/product';

export async function GET(request: NextRequest) {
	try {
		//извлекаем параметры
		const { searchParams } = new URL(request.url);
		const productId = searchParams.get('productId');
		const category = searchParams.get('category');
		const limit = parseInt(searchParams.get('limit') || '4');

		if (!productId || !category) {
			return NextResponse.json(
				{ error: 'ID продукта и категория обязательны' },
				{ status: 400 }
			);
		}

		const db = await getDB();
		//получаем методом выборки 4 случайных продукта
		const similarProducts = await db
			.collection<ProductCardProps>('products')
			.aggregate([
				{
					//фильтр по условиям
					$match: {
						categories: { $in: [category] },
						id: { $ne: productId }, //искл текущ товар
					},
				},
				{ $sample: { size: limit } }, //выбор случайных продуктов и лимит их
			])
			.toArray();

		return NextResponse.json({ similarProducts });
	} catch (error) {
		console.error('Ошибка получения похожих продуктов:', error);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
