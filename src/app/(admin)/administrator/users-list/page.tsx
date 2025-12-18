'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserData } from '@/types/userData';
import ErrorComponent from '@/components/ErrorComponent';
import { useAuthStore } from '@/store/authStore';
import { CONFIG } from '../../../../../config/config';
import { Loader } from '@/components/Loader';
import NavAndInfo from './_components/NavAndInfo';
import UsersTable from './_components/UsersTable';

const PAGE_SIZE_OPTIONS = [1, 5, 10, 20, 50, 100];

const UsersList = () => {
	const [users, setUsers] = useState<UserData[]>([]);
	const [pageSize, setPageSize] = useState(CONFIG.DEFAULT_PAGE_SIZE);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	//сортировка по чему
	const [sortBy, setSortBy] = useState('createdAt');
	//направление сортировки 
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		error: Error;
		userMessage: string;
	} | null>(null);

	//тот кто в админ панели - назовём юзером
	const { user: currentUser } = useAuthStore();
	// а манагером тот у кого в бд написано манагер
	//это делается для фичи манагеров по регионам
	const isManager = currentUser?.role === 'manager';

	//выбор страницы
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};
	//для пагинации
	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setCurrentPage(1);
	};
	//сортировка
	const handleSort = (field: string) => {
		//приходит поле по которому происходит сортировка
		//переключатель (тоглер)
		const newDirection =
			sortBy === field && sortDirection === 'desc' ? 'asc' : 'desc';
		setSortBy(field);
		setSortDirection(newDirection);
		//возврат на первую страницу
		setCurrentPage(1);
	};

	//загрузка пользователей
	const loadUsers = useCallback(
		async (
			page: number,
			sortField: string,
			sortDir: 'asc' | 'desc',
			limit: number
		) => {
			try {
				setLoading(true);
				setError(null);
				//создание кверика
				const queryParams = new URLSearchParams({
					page: page.toString(),
					limit: limit.toString(),
					isManager: isManager.toString(),
					sortBy: sortField,
					sortDirection: sortDir,
				});
				//для манагеров чтобы выдавать им зверей по региону
				if (isManager && currentUser) {
					queryParams.append(
						'managerRegion',
						currentUser.region || ''
					);
					queryParams.append(
						'managerLocation',
						currentUser.location || ''
					);
				}

				const response = await fetch(`/api/admin/users?${queryParams}`);

				if (!response.ok) {
					throw new Error('Ошибка загрузки пользователей');
				}

				const data = await response.json();

				if (data?.users) {
					setUsers(data.users);
					setTotalUsers(data.totalCount);
					setTotalPages(data.totalPages);
					console.log(data.users);
				}
			} catch (error) {
				setError({
					error:
						error instanceof Error
							? error
							: new Error('Неизвестная ошибка'),
					userMessage: 'Не удалось загрузить список пользователей',
				});
			} finally {
				setLoading(false);
			}
		},
		[currentUser, isManager]
	);

	useEffect(() => {
		loadUsers(currentPage, sortBy, sortDirection, pageSize);
	}, [loadUsers, currentPage, pageSize, sortBy, sortDirection]);

	if (loading) return <Loader />;

	if (error) {
		return (
			<ErrorComponent
				error={error.error}
				userMessage={error.userMessage}
			/>
		);
	}

	return (
		<div className="p-3 lg:p-6">
			<NavAndInfo
				pageSize={pageSize}
				pageSizeOptions={PAGE_SIZE_OPTIONS}
				onPageSizeChange={handlePageSizeChange}
				totalUsers={totalUsers}
			/>
			<UsersTable
				users={users}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				sortBy={sortBy}
				sortDirection={sortDirection}
				onSort={handleSort}
			/>
		</div>
	);
};

export default UsersList;
