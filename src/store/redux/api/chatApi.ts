import { ChatMessage } from '@/types/chat';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
	reducerPath: 'chatApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/admin/',
	}),
	tagTypes: ['Chat'],
	endpoints: (builder) => ({
		//получать фоном сообщ
		getOrderMessages: builder.query<ChatMessage[], string>({
			query: (orderId) => `chat/${orderId}`,
			providesTags: ['Chat'],
		}),
		//для пометки о новом сообщение
		hasUnreadMessages: builder.query<boolean, string>({
			query: (orderId) => `chat/${orderId}/has-unread`,
		}),
	}),
});

export const { useGetOrderMessagesQuery, useHasUnreadMessagesQuery } = chatApi;

export type { ChatMessage };
