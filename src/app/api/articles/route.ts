import { NextResponse } from 'next/server';
import { getDB } from '../../../../api-routes';

export async function GET() {
	try {
		const db = await getDB();
		const articles = await db.collection('articles').find().toArray();
		return NextResponse.json(articles);
	} catch (error) {
		console.error('Ошибка сервера:', error);
		return NextResponse.json(
			{ message: 'Ошибка сервера' },
			{ status: 500 }
		);
	}
}
