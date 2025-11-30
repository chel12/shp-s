import GenericListPage from '@/app/(products)/GenericListPage';
import { Loader } from '@/components/Loader';
import React, { Suspense } from 'react';
import { TRANSLATIONS } from '../../../../../utils/translations';
import fetchProductsByCategory from '../fetchCategory';
import FilterButtons from '../FilterButtons';
import Link from 'next/link';
import Image from 'next/image';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string }>;
}) {
	const { category } = await params;
	return {
		title: TRANSLATIONS[category] || category,
		description: `Описание категории товаров: ${
			TRANSLATIONS[category] || category
		} магазина "Северяночка" `,
	};
}

const CategoryPage = async ({
	searchParams,
	params,
}: {
	searchParams: Promise<{
		page?: string;
		itemsPerPage?: string;
		filter?: string | string[];
	}>;
	params: Promise<{ category: string }>;
}) => {
	const { category } = await params;
	const resolvedSearchParams = await searchParams;
	const activeFilter = resolvedSearchParams.filter;
	//получаем активные фильтры

	return (
		<div className="px-[max(12px,calc((100%-1208px)/2))]">
			<h1 className="text-2xl xl:text-4xl text-left font-bold text-[#414141] mb-15">
				{TRANSLATIONS[category] || category}
			</h1>
			<FilterButtons basePath={`/category/${category}`} />
			<div className="flex flex-row gap-x-6 mb-6">
				<div
					className={`h-8 p-2 rounded text-xs flex justify-center items-center duration-300 cursor-not-allowed gap-x-2 ${
						!activeFilter || activeFilter.length === 0
							? 'bg-[#f3f2f1] text-[#606060]'
							: 'bg-(--color-primary) text-white'
					}`}>
					{(() => {
						const activeFilterCount = activeFilter
							? Array.isArray(activeFilter)
								? activeFilter.length
								: 1
							: 0;
						return activeFilterCount === 0
							? 'Фильтры'
							: activeFilterCount === 1
							? 'Фильтр 1'
							: `Фильтры ${activeFilterCount}`;
					})()}
				</div>
				<div
					className={`h-8 p-2 rounded text-xs flex justify-center items-center duration-300 gap-x-2 ${
						!activeFilter || activeFilter.length === 0
							? 'bg-[#f3f2f1] text-[#606060]'
							: 'bg-(--color-primary) text-white'
					}`}>
					<Link
						href={buildClearFiltersLink(
							resolvedSearchParams,
							`/category/${category}`
						)}>
						Очистить фильтры
					</Link>
					<Image
						src="/icons-products/icon-closer.svg"
						alt="очистить фильтры"
						width={24}
						height={24}
						style={
							!activeFilter || activeFilter.length === 0
								? {}
								: { filter: 'brightness(0) invert(1)' }
						}></Image>
				</div>
			</div>
			<Suspense fallback={<Loader />}>
				<GenericListPage
					searchParams={Promise.resolve(resolvedSearchParams)}
					props={{
						fetchData: ({ pagination: { startIdx, perPage } }) =>
							fetchProductsByCategory(category, {
								pagination: { startIdx, perPage },
								filter: activeFilter,
							}),
						pageTitle: '',
						basePath: `/category/${category}`,
						contentType: 'category',
					}}
				/>
			</Suspense>
		</div>
	);
};
function buildClearFiltersLink(
	searchParams: {
		page?: string;
		itemsPerPage?: string;
		filter?: string | string[];
	},
	basePath: string
) {
	const params = new URLSearchParams();
	if (searchParams.page) {
		params.set('page', searchParams.page);
	}
	if (searchParams.itemsPerPage) {
		params.set('itemsPetPage', searchParams.itemsPerPage);
	}
	params.delete('filter');
	return `${basePath}?${params.toString()}`;
}
export default CategoryPage;
