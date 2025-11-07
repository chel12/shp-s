'use client';

import { CatalogProps } from '@/types/catalog';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const CatalogPage = () => {
	const [categories, setCategories] = useState<CatalogProps[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchCategories = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('api/catalog');
			if (!response.ok)
				throw new Error(`Ошибка ответа сервера:  ${response.status}`);
			const data: CatalogProps[] = await response.json();
			setCategories(data.sort((a, b) => a.order - b.order));
		} catch (error) {
			console.error(`Не удалось получить категории: ${error}`);
			setError('Не удалось получить категории');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	if (isLoading) {
		return <div className="text-center py-8 ">Загрузка каталога...</div>;
	}
	if (error) {
		return (
			<div className="text-center py-8 text-red-500 ">Ошибка:{error}</div>
		);
	}
	if (!categories.length) {
		return (
			<div className="text-center py-8 text-red-500 ">
				Категорий каталога не найдено
			</div>
		);
	}

	return (
		<section className="px-[max(12px,calc((100%-1208px)/2))] mx-auto mb-20">
			<h1 className="mb-4 md:mb-8 xl:mb-10 flex flex-row text-4xl mb:text-5xl xl:text-[64px] text-[#414141]"></h1>
			<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
				{categories.map((category) => (
					<div
						key={category._id}
						className={`
						${category.mobileColSpan}
						${category.tabletColSpan}
						${category.colSpan}
						bg-gray-100 rounded overflow-hidden min-h-50`}>
						<div className="h-full w-full">
							<Link
								href={`category-${category.id}`}
								className="block relative h-full overflow-hidden group min-w-40
					         md:min-w-[224px] xl:min-w[274px]">
								<Image
									src={category.img}
									alt={category.title}
									fill
									sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw,33vw"
									className="object-cover transition-transform group-hover:scale-105"
								/>
								<div
									className="absolute inset-0 bg-[linear-gradient(180deg,rgba(112,192,91,0)_0%,rgba(112,192,91,0.82)_82.813%)] h-[117px] top-auto
                  group-hover:bg-[linear-gradient(180deg,rgba(255,102,51,0)_0%,rgba(255,102,51,1)_100%)] group-hover:h-[177px] transition-all duration-300s"></div>
								<div className="absolute left-2.5 bottom-2.5 flex items-center ju">
									<span className="text-white text-lg font-bold">
										{category.title}
									</span>
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default CatalogPage;
