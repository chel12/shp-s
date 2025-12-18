import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';
import { CONFIG } from '../../../../../config/config';
import { getShortDecimalId } from '../../../../../utils/admin/shortDecimalId';
import { calculateAge } from '../../../../../utils/admin/calculateAge';
import { Document, Filter } from 'mongodb';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		//лимит
		const limit = parseInt(
			searchParams.get('limit') || CONFIG.DEFAULT_PAGE_SIZE.toString()
		);
		// страницу
		const page = parseInt(searchParams.get('page') || '1');
		//роль
		const role = searchParams.get('role');
		//регион
		const managerRegion = searchParams.get('managerRegion');
		//город
		const managerLocation = searchParams.get('managerLocation');
		//является ли манагером
		const isManager = searchParams.get('isManager') === 'true';
		const sortBy = searchParams.get('sortBy') || 'createdAt';
		const sortDirection = searchParams.get('sortDirection') || 'desc';
		// Получаем параметры фильтрации
		const id = searchParams.get('id');
		const name = searchParams.get('name');
		const surname = searchParams.get('surname');
		const email = searchParams.get('email');
		const phoneNumber = searchParams.get('phoneNumber');
		const minAge = searchParams.get('minAge');
		const maxAge = searchParams.get('maxAge');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		//подключаемся к БД
		const db = await getDB();
		//фильтрация по региону и городу
		const filter: Filter<Document> = {};
		//если манагер то фильтруй по городу и региону
		if (isManager && managerRegion && managerLocation) {
			filter.region = managerRegion;
			filter.location = managerLocation;
		}
		//проверка что id передан и не является пустой строкой
		if (id && id.trim() !== '') {
			//удаляем пробелы
			const searchId = id.trim();
			//получаем ид всех юзеров
			const allUserIds = await db
				.collection('user')
				.find({}, { projection: { _id: 1 } })
				.toArray();
			//новый массив который пройдет проверку
			const matchingIds = allUserIds
				.filter((user) => {
					//16 формат в 10
					const decimalId = getShortDecimalId(user._id.toString());
					//проверяем содержит ли поисковую строку
					return decimalId.includes(searchId);
				})
				.map((user) => user._id);
			//проверка на совпадения
			if (matchingIds.length > 0) {
				//если есть _ид формируем из обьекта массив
				Object.assign(filter, { _id: { $in: matchingIds } });
			} else {
				//иначе пустой массив
				Object.assign(filter, { _id: { $in: [] } });
			}
		}
		//остальные фильтры
		if (name && name.trim() !== '') {
			Object.assign(filter, {
				name: { $regex: name, $options: 'i' },
			});
		}

		if (surname && surname.trim() !== '') {
			Object.assign(filter, {
				surname: { $regex: surname, $options: 'i' },
			});
		}

		if (email && email.trim() !== '') {
			Object.assign(filter, {
				email: {
					$regex: email,
					$options: 'i',
					$not: {
						$regex: CONFIG.TEMPORARY_EMAIL_DOMAIN,
						$options: 'i',
					},
				},
			});
		}
		if (phoneNumber && phoneNumber.trim() !== '') {
			Object.assign(filter, {
				phoneNumber: { $regex: phoneNumber, $options: 'i' },
			});
		}

		if (role && role !== 'all') {
			filter.role = role;
		}
		//по возрасту
		if (minAge || maxAge) {
			const currentYear = new Date().getFullYear();
			const birthdayDateFilter: Record<string, string> = {};

			if (minAge && minAge.trim() !== '') {
				const minAgeNum = parseInt(minAge);
				const maxBirthdayYear = currentYear - minAgeNum;
				birthdayDateFilter.$lte = `${maxBirthdayYear}-12-31T23:59:59.999Z`;
			}

			if (maxAge && maxAge.trim() !== '') {
				const maxAgeNum = parseInt(maxAge);
				const minBirthdayYear = currentYear - maxAgeNum - 1;
				birthdayDateFilter.$gte = `${minBirthdayYear}-01-01T00:00:00.000Z`;
			}

			Object.assign(filter, { birthdayDate: birthdayDateFilter });
		}
		//по дате регистрации
		const createdAtFilter: Record<string, Date> = {};

		if (startDate && startDate.trim() !== '') {
			createdAtFilter.$gte = new Date(startDate);
		}

		if (endDate && endDate.trim() !== '') {
			createdAtFilter.$lte = new Date(endDate);
		}

		if (Object.keys(createdAtFilter).length > 0) {
			Object.assign(filter, { createdAt: createdAtFilter });
		}

		//смещение (кол-во юзеров для игнора)
		const offset = (page - 1) * limit;
		//1 по возрастанию, -1 по убыванию
		const sortOptions: { [key: string]: 1 | -1 } = {};
		sortOptions[sortBy] = sortDirection === 'asc' ? 1 : -1;
		//сортировка при пагинации
		if (sortBy === 'age') {
			sortOptions.birthdayDate = sortDirection === 'asc' ? 1 : -1;
		} else if (sortBy === 'id') {
			sortOptions._id = sortDirection === 'asc' ? 1 : -1;
		} else {
			sortOptions[sortBy] = sortDirection === 'asc' ? 1 : -1;
		}

		//получаем всех зеверей
		const users = await db
			.collection('user') //обращаемся к коллекции
			.find(filter) //ищем по фильтру
			.sort(sortOptions) //примянем сортировку
			.skip(offset) // с какого пользователя извлекаем
			.limit(limit) //какое кол-во
			.toArray(); //превратить в массив
		//сортировка при получение из БД
		if (sortBy === 'id') {
			users.sort((a, b) => {
				const decimalA = parseInt(getShortDecimalId(a._id.toString()));
				const decimalB = parseInt(getShortDecimalId(b._id.toString()));

				return sortDirection === 'asc'
					? decimalA - decimalB
					: decimalB - decimalA;
			});
		}
		//общее кол-во зверей
		const totalCount = await db.collection('user').countDocuments(filter);

		//всех пользовталей объектид в строки
		const formattedUsers = users.map((user) => ({
			id: user._id.toString(),
			decimalId: getShortDecimalId(user._id.toString()),
			name: user.name || '',
			surname: user.surname || '',
			age: calculateAge(user.birthdayDate),
			email: user.email || '',
			phoneNumber: user.phoneNumber || '',
			role: user.role || 'user',
			birthdayDate: user.birthdayDate || '',
			region: user.region || '',
			location: user.location || '',
			gender: user.gender || '',
			card: user.card || '',
			hasCard: user.hasCard || false,
			createdAt: user.createdAt
				? user.createdAt.toISOString()
				: new Date().toISOString(),
			updatedAt: user.updatedAt
				? user.updatedAt.toISOString()
				: new Date().toISOString(),
			emailVerified: user.emailVerified || false,
			phoneNumberVerified: user.phoneNumberVerified || false,
		}));

		return NextResponse.json({
			users: formattedUsers,
			totalCount,
			totalPages: Math.ceil(totalCount / limit),
		});
	} catch (error) {
		console.error('Ошибка при загрузке пользователей:', error);
		return NextResponse.json(
			{ error: 'Ошибка при загрузке пользователей' },
			{ status: 500 }
		);
	}
}
