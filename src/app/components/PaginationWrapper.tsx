'use client';
import { useEffect, useState } from 'react';
import { CONFIG } from '../../../config/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from '../../../utils/debounce';
import Pagination from './Pagination';

function getItemsPerPageByWidth() {
	const width = window.innerWidth;
	if (width < 768) return 2;
	if (width < 1280) return 3;
	return 4;
}

const PaginationWrapper = ({
	totalItems,
	currentPage,
	basePath,
}: {
	totalItems: number;
	currentPage: number;
	basePath: string;
}) => {
	const [itemsPerPage, setItemsPerPage] = useState(CONFIG.ITEMS_PER_PAGE);
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const updateItemsPerPage = () => {
			const newItemsPerPage = getItemsPerPageByWidth();
			if (newItemsPerPage === itemsPerPage) return;
			setItemsPerPage(newItemsPerPage);
			//url создаём
			const params = new URLSearchParams(searchParams.toString());
			params.set('itemsPerPage', newItemsPerPage.toString());
			//если страница с мелкой в большую то меняем страницу
			params.set('page', '1');
			//смена урла без перезагрузки
			router.replace(`${basePath}?${params.toString()}`, {
				scroll: false,
			});
		};
		updateItemsPerPage();
		const handleResize = debounce(updateItemsPerPage, 200);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [itemsPerPage, searchParams, basePath, router]);

	return (
		<>
			<Pagination
				totalItems={totalItems}
				currentPage={currentPage}
				basePath={basePath}
				itemsPerPage={itemsPerPage}
				searchQuery={searchParams.toString()}
			/>
		</>
	);
};

export default PaginationWrapper;
