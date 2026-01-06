import { OrdersResponse } from '@/types/reduxApi';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ordersApi = createApi({
	//уник ключ для редакс
	reducerPath: 'ordersApi',
	//базовый http клиент для запросов этого апи
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/',
	}),
	//типы тегов для инвалидации кеша
	tagTypes: ['Orders'],
	//конечная точка апи ендпоинтс
	endpoints: (builder) => ({
		getAdminOrders: builder.query<OrdersResponse, void>({
			//квери енпоинт для получения заказа
			query: () => 'admin/users/orders',
			//теги которые предоставляют запрос для инвалидации кеша
			providesTags: ['Orders'],
		}),
	}),
});
//хук для компонентов
export const { useGetAdminOrdersQuery } = ordersApi;
