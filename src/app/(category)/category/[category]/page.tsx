import ErrorComponent from '@/components/ErrorComponent';
import React from 'react';

const CategoryPage = async ({
	params,
}: {
	params: Promise<{ category: string }>;
}) => {
	let category: string = '';

	try {
		category = (await params).category;
	} catch (error) {
		<ErrorComponent
			error={
				//если настоящая ошибка а не ТС ошибка, в строку приводим
				error instanceof Error ? error : new Error(String(error))
			}
			userMessage="Ошибка получений категорий"
		/>;
	}

	return <div>Страница категории: {category}</div>;
};

export default CategoryPage;
