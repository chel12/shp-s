import { NextResponse } from 'next/server';
import { getDB } from '../../../../utils/api-routes';
export const revalidate = 3600;
export async function GET() {
	try {
		const db = await getDB();
		const articles = await db.collection('articles').find().toArray();
		return NextResponse.json(articles);
	} catch (error) {
		console.error('Ошибка при загрузке статей:', error);
		return NextResponse.json(
			{ message: 'Ошибка сервера' },
			{ status: 500 }
		);
	}
}
