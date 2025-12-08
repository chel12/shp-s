import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';
import { GridFSBucket, ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
	const db = await getDB();

	try {
		//получаем форм дату
		const formData = await request.formData();
		//извлекаем файл аватара из формы
		const file = formData.get('avatar') as File;
		//получить юзера из формы
		const userId = formData.get('userId') as string;
		//проверка
		if (!file || !userId) {
			return NextResponse.json(
				{ error: 'Файл и userId обязательны' },
				{ status: 400 }
			);
		}
		//фича монго дб для сохранения файлов
		const bucket = new GridFSBucket(db, { bucketName: 'avatars' });
		//строковый индефикатор юзера в объект id
		const userIdObj = new ObjectId(userId);
		//проверка есть ли аватар
		const existingAvatar = await db.collection('avatars.files').findOne({
			'metadata.userId': userIdObj,
		});
		//если есть удаляем и загружаем новый
		if (existingAvatar) {
			try {
				await bucket.delete(existingAvatar._id);
			} catch (deleteError) {
				console.warn('Не удалось удалить старый аватар:', deleteError);
			}
		}
		//преобразование в аррейБаффер а затем в буффер
		const bytes = await file.arrayBuffer();
		//бинарные для монго дб
		const buffer = Buffer.from(bytes);
		//поток для загрузки файлов GridFS/загружаем
		const uploadStream = bucket.openUploadStream(file.name, {
			metadata: {
				userId: userIdObj,
				originalName: file.name,
				uploadedAt: new Date(),
			},
		});
		//записать буфер в поток загрузки
		uploadStream.end(buffer);
		//ждём завершение загрузки и получаем имя файла
		const fileId = await new Promise<ObjectId>((resolve, reject) => {
			uploadStream.on('finish', () => resolve(uploadStream.id));
			uploadStream.on('error', reject);
		});

		return NextResponse.json({
			success: true,
			avatarId: fileId.toString(),
		});
	} catch (error) {
		console.error('Ошибка загрузки аватара:', error);
		return NextResponse.json(
			{ error: 'Ошибка загрузки аватара' },
			{ status: 500 }
		);
	}
}
