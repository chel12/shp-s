'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const FILTERS = [
	{ key: 'our-production', label: 'Товары нашего производства' },
	{ key: 'healthy-food', label: 'Полезное питание' },
	{ key: 'non-gmo', label: 'Без ГМО' },
];

const FilterButtons = ({ basePath }: { basePath: string }) => {
	//достать из урла после "?"
	const searchParams = useSearchParams();
	//получить всё filter?="" будет массивом
	const currentFilters = searchParams.getAll('filter');

	const buildFilterLink = (filterKey: string) => {
		//функция как тоггл фильтров
		//копию урла делаем
		const params = new URLSearchParams(searchParams.toString());
		//проверка активен или нет
		if (currentFilters.includes(filterKey)) {
			params.delete('filter');
			currentFilters
				.filter((f) => f !== filterKey)
				.forEach((f) => params.append('filter', f));
		} else {
			params.append('filter', filterKey);
		}
		//ну и пагинацию скидываем чтобы в начало фильтров бекнуться
		params.delete('page');
		//возвращаем обновлённый урл
		return `${basePath}?${params.toString()}`;
	};

	const isFilterActive = (filterKey: string) =>
		currentFilters.includes(filterKey);

	return (
		<div className="flex flex-wrap flex-row gap-4 items-center">
			{FILTERS.map((filter) => (
				<Link
					key={filter.key}
					href={buildFilterLink(filter.key)}
					className={`h-8 p-2 rounded text-xs flex justify-center items-center duration-300 cursor-pointer ${
						isFilterActive(filter.key)
							? 'bg-(--color-primary) text-white hover:shadow-(--shadow-button-default) active:shadow-(--shadow-button-active)'
							: 'bg-[#f3f2f1] text-[#606060] hover:shadow-(--shadow-button-secondary) active:shadow-(--shadow-button-active)'
					} `}>
					{filter.label}
				</Link>
			))}
		</div>
	);
};

export default FilterButtons;
