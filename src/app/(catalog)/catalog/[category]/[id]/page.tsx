import ErrorComponent from '@/components/ErrorComponent';
import React from 'react';

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
	let productId: string = '';

	try {
		productId = (await params).id;
	} catch (error) {
		<ErrorComponent
			error={
				//если настоящая ошибка а не ТС ошибка, в строку приводим
				error instanceof Error ? error : new Error(String(error))
			}
			userMessage="Не удалось загрузить данные о продукте"
		/>;
	}

	return <div>Страница продукта: {productId}</div>;
};

export default ProductPage;
