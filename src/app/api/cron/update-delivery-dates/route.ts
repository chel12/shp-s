import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';
import { getThreeDaysDates } from '@/app/(admin)/administrator/delivery-times/utils/getThreeDaysDates';

export async function GET(request: NextRequest) {
	try {
		//используем секретный ключ (енв файл)
		const secret = request.nextUrl.searchParams.get('secret');
		if (secret !== process.env.CRON_SECRET) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const db = await getDB();
		//доставку ищем
		const deliverySettings = await db
			.collection('delivery-times')
			.findOne({}); //найти любой
		//если нет
		if (!deliverySettings) {
			return NextResponse.json({
				success: false,
				message: 'Настройки доставки не найдены',
			});
		}
		//текущ раписание или пустой объект
		const currentSchedule = deliverySettings.schedule || {};
		//новые даты получаем без расписания
		const newDates = getThreeDaysDates();
		//массив дат из расписания
		const currentDates = Object.keys(currentSchedule);
		//определяет даты для удаления
		const datesToRemove = currentDates.filter(
			(date) => !newDates.includes(date)
		);
		//опред дат для добавления
		const datesToAdd = newDates.filter(
			(date) => !currentDates.includes(date)
		);
		//делаем копию текущ расписания для модификации
		const updatedSchedule = { ...currentSchedule };
		//удаляем устаревшие даты из расписания
		datesToRemove.forEach((date) => {
			delete updatedSchedule[date];
		});
		//добавляем новые даты для расписания
		datesToAdd.forEach((newDate) => {
			//вычесление даты за день до новой
			const prevDate = new Date(newDate);
			prevDate.setDate(prevDate.getDate() - 1);
			const prevDateStr = prevDate.toISOString().split('T')[0];
			//копируем настройки предыдущ дня
			if (updatedSchedule[prevDateStr]) {
				updatedSchedule[newDate] = { ...updatedSchedule[prevDateStr] };
			} else {
				//иначе создаём свои базовые
				updatedSchedule[newDate] = {
					'08:00-14:00': true,
					'14:00-18:00': true,
					'18:00-20:00': true,
					'20:00-22:00': true,
				};
			}
		});

		await db.collection('delivery-times').updateOne(
			{}, //обновляем в БД
			{
				$set: {
					schedule: updatedSchedule, //новое рапис
					updatedAt: new Date(), //время обновл
				},
			}
		);
		//ответ
		return NextResponse.json({
			success: true,
			message: `Расписание обновлено. Добавлены даты: ${datesToAdd.join(', ')}, удалены даты: ${datesToRemove.join(', ')}`,
			addedDates: datesToAdd, // массив добавленных дат
			removedDates: datesToRemove, // массив удалённых дат
			currentDates: Object.keys(updatedSchedule), //текущ даты в распис
			updatedAt: new Date().toISOString(), //время обнов
		});
	} catch (error) {
		console.error('Ошибка cron:', error);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
