import { FilterControlsProps } from '@/types/filterControlsProps';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const FilterControls = ({
	activeFilter,
	basePath,
	searchParams = {},
}: FilterControlsProps) => {
	const minPrice = searchParams.priceFrom;
	const maxPrice = searchParams.priceTo;

	function buildClearFiltersLink() {
		const params = new URLSearchParams();
		if (searchParams.page) {
			params.set('page', searchParams.page);
		}
		if (searchParams.itemsPerPage) {
			params.set('itemsPetPage', searchParams.itemsPerPage);
		}
		params.delete('filter');
		params.delete('priceFrom');
		params.delete('priceTo');
		return `${basePath}?${params.toString()}`;
	}

	const hasPriceFilter = minPrice || maxPrice;

	const buildClearPriceFilterLink = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('priceFrom');
		params.delete('priceTo');
		return `${basePath}?${params.toString()}`;
	};

	const activeFilterCount =
		(activeFilter
			? Array.isArray(activeFilter)
				? activeFilter.length
				: 1
			: 0) + (hasPriceFilter ? 1 : 0);

	const filterButtonText =
		activeFilterCount === 0
			? 'Фильтры'
			: activeFilterCount === 1
			? 'Фильтр 1'
			: `Фильтры ${activeFilterCount}`;

	return (
		<div className="flex flex-wrap flex-row gap-4">
			<div
				className={`h-8 p-2 rounded text-xs flex justify-center items-center duration-300 cursor-not-allowed gap-x-2 ${
					(activeFilter && activeFilter.length > 0) || hasPriceFilter
						? 'bg-(--color-primary) text-white'
						: 'bg-[#f3f2f1] text-[#606060]'
				}`}>
				{filterButtonText}
			</div>
			{hasPriceFilter && (
				<div
					className="h-8 p-2 rounded text-xs flex justify-center items-center duration-300 gap-x-2 bg-(--color-primary) 
					text-white">
					<Link
						href={buildClearPriceFilterLink()}
						className="flex items-center gap-x-2">
						Цена {minPrice !== undefined ? `от ${minPrice}` : ''}
						{maxPrice !== undefined ? `до ${maxPrice}` : ''}
						<Image
							src="/icons-products/icon-closer.svg"
							alt="очистить цену"
							width={24}
							height={24}
							style={{
								filter: 'brightness(0) invert(1)',
							}}></Image>
					</Link>
				</div>
			)}
			<div
				className={`h-8 p-2 rounded text-xs flex justify-center items-center duration-300 gap-x-2 ${
					(activeFilter && activeFilter.length > 0) || hasPriceFilter
						? 'bg-(--color-primary) text-white'
						: 'bg-[#f3f2f1] text-[#606060]'
				}`}>
				<Link
					href={buildClearFiltersLink()}
					className="flex items-center gap-x-2">
					Очистить фильтры
					<Image
						src="/icons-products/icon-closer.svg"
						alt="очистить фильтры"
						width={24}
						height={24}
						style={
							activeFilter && activeFilter.length > 0
								? {}
								: { filter: 'brightness(0) invert(1)' }
						}></Image>
				</Link>
			</div>
		</div>
	);
};

export default FilterControls;
