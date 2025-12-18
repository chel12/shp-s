import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../utils/api-routes';
import { CONFIG } from '../../../../../config/config';
import { getShortDecimalId } from '../../../../../utils/admin/shortDecimalId';
import { calculateAge } from '../../../../../utils/admin/calculateAge';

interface UserFilter {
	region?: string;
	location?: string;
}

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
		//подключаемся к БД
		const db = await getDB();
		//фильтрация по региону и городу
		const filter: UserFilter = {};
		//если манагер то фильтруй по городу и региону
		if (isManager && managerRegion && managerLocation) {
			filter.region = managerRegion;
			filter.location = managerLocation;
		}
		//смещение (кол-во юзеров для игнора)
		const offset = (page - 1) * limit;
		//1 по возрастанию, -1 по убыванию
		const sortOptions: { [key: string]: 1 | -1 } = {};
		sortOptions[sortBy] = sortDirection === 'asc' ? 1 : -1;
		//получаем всех зеверей
		const users = await db
			.collection('user') //обращаемся к коллекции
			.find(filter) //ищем по фильтру
			.sort(sortOptions) //примянем сортировку
			.skip(offset) // с какого пользователя извлекаем
			.limit(limit) //какое кол-во
			.toArray(); //превратить в массив
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
