'use client';
import Image from 'next/image';
import iconSearch from '/public/icons-header/icon-search.svg';
import Link from 'next/link';
import iconBurger from '/public/icons-header/icon-burger-menu.svg';
import { useEffect, useState } from 'react';

const InputBlock = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [groupedProducts, setGroupedProducts] = useState([]);

	useEffect(() => {
		const fetchSearchData = async () => {
			if (query.length > 1) {
				try {
					setIsLoading(true);
					const response = await fetch(`*api/search?query=${query}`);
					const data = await response.json();
					setGroupedProducts(data);
				} catch (error) {
					console.error('Не найден продукт или категория', error);
				} finally {
					setIsLoading(false);
				}
			} else {
				setGroupedProducts([]);
			}
		};

		const debounceTimer = setTimeout(fetchSearchData, 300);
		return clearTimeout(debounceTimer);
	}, [query]);

	const handleInputFocus = () => {
		setIsOpen(true);
	};
	const resetSearch = () => {
		setIsOpen(false);
		setQuery('');
	};

	return (
		<div className="relative min-w-[261px] flex-grow">
			<div
				className="raltive rounded border-1 
			border-(--color-primary) shadow-(--shadow-button-default)
			leading-[150%]">
				<input
					type="text"
					placeholder="Найти товар"
					className="w-full h-10  p-2 outline-none   text-[#8f8f8f] text-base "
					onFocus={handleInputFocus}
					onChange={(e) => setQuery(e.target.value)}
				/>

				<Image
					src={iconSearch}
					alt="Поиск"
					width={24}
					height={24}
					className="absolute top-2 right-2"
				/>
			</div>
			{isOpen && (
				<div
					className="absolute -mt-0.5 left-0 right-0 z-10 max-h-[300px] 
			overflow-y-auto bg-white rounded-b border-1 border-(--color-primary)
			border-t-0 shadow-inherit break-words
			">
					{isLoading ? (
						<div className="p-4 text-center">Загрузка...</div>
					) : groupedProducts.length > 0 ? (
						<div className="p-2 flex flex-col gap-2.5">
							<div className="flex flex-col gap-2.5">
								<Link
									href="#"
									onClick={resetSearch}
									className="flex items-start gap-x-4
						hover:bg-gray-100 rounded cursor-pointer
						">
									<div>Текст ссылки на категорию</div>
									<Image
										src={iconBurger}
										alt="Иконка меню категории"
										width={24}
										height={24}
										className="flex-shrink-0"
									/>
								</Link>
								<ul className="flex flex-col gap-2.5">
									<li className="p-1 hover:bg-gray-100">
										<Link
											href="#"
											onClick={resetSearch}
											className="cursor-pointer">
											Продукт
										</Link>
									</li>
									<li className="p-1 hover:bg-gray-100">
										<Link
											href="#"
											className=" cursor-pointer">
											Продукт
										</Link>
									</li>
									<li className="p-1 hover:bg-gray-100">
										<Link
											href="#"
											className=" cursor-pointer">
											Продукт
										</Link>
									</li>
									<li className="p-1 hover:bg-gray-100">
										<Link
											href="#"
											className=" cursor-pointer">
											Продукт
										</Link>
									</li>
								</ul>
							</div>
						</div>
					) : query.length > 1 ? (
						<div className="text-[#8f8f8f] py-2 px-4 ">
							Ничего не найдено
						</div>
					) : (
						<div className="p-4 text-[#8f8f8f]  ">
							Введите 2 и более символа для поиска
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default InputBlock;
