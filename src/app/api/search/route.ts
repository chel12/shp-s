import { NextResponse } from 'next/server';
import { getDB } from '../../../../utils/api-routes';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('query') || '';
		if (!query) {
			return NextResponse.json({ groupedProducts: [] });
		}
		const db = await getDB();

		const products = await db
			.collection('products')
			.find({
				//по каким полям ищем
				//все совпадения, регистра независимый поиск
				$or: [
					{ title: { $regex: query, $option: 'i' } },
					{ description: { $regex: query, $option: 'i' } },
				],
			})
			.project({
				title: 1,
				categories: 1,
				id: 1,
			});
		//какие поля включаем. 1 включить.
	} catch (error) {}
}
