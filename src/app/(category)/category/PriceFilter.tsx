'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CONFIG } from '../../../../config/config';
import { PriceFilterProps, PriceRange } from '@/types/priceTypes';
import ErrorComponent from '@/components/ErrorComponent';
import MiniLoader from '@/components/MiniLoader';
import PriceFilterHeader from './PriceFilterHeader';
import PriceInputs from './PriceInputs';
import PriceRangeSlider from './PriceRangeSlider';

const PriceFilter = ({
	basePath,
	category,
	setIsFilterOpenAction,
}: PriceFilterProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	//из урла берём
	const urlPriceFrom = searchParams.get('priceFrom') || '';
	const urlPriceTo = searchParams.get('priceTo') || '';
	const urlInStock = searchParams.get('inStock') === 'true';

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<{
		error: Error;
		userMessage: string;
	} | null>(null);

	const [inStock, setInStock] = useState(urlInStock);

	const [inputValues, setInputValues] = useState({
		from: urlPriceFrom,
		to: urlPriceTo,
	});

	const [priceRange, setPriceRange] = useState<PriceRange>(
		CONFIG.FALLBACK_PRICE_RANGE
	);

	const fetchPriceData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			//получить категорию чтобы прокинуть в роут
			const currentCategory = category || searchParams.get('category');
			if (!currentCategory) return;
			const params = new URLSearchParams();

			params.set('category', currentCategory);
			params.set('getPriceRangeOnly', 'true');
			const response = await fetch(`/api/category?${params.toString()}`);
			if (!response.ok)
				throw new Error(`Ошибка сервера: ${response.status}`);
			const data = await response.json();
			const receivedRange =
				data.priceRange || CONFIG.FALLBACK_PRICE_RANGE;
			const roundedRange = {
				min: Math.floor(Number(receivedRange.min)),
				max: Math.ceil(Number(receivedRange.max)),
			};
			//округление от копеек
			setPriceRange(roundedRange);
			setInputValues({
				from: urlPriceFrom || roundedRange.min.toString(),
				to: urlPriceTo || roundedRange.max.toString(),
			});
		} catch (error) {
			setError({
				error:
					error instanceof Error
						? error
						: new Error('Неизвестная ошибка'),
				userMessage: 'Не удалось загрузить каталог категорий',
			});
			setPriceRange(CONFIG.FALLBACK_PRICE_RANGE);
			setInputValues({
				from: CONFIG.FALLBACK_PRICE_RANGE.min.toString(),
				to: CONFIG.FALLBACK_PRICE_RANGE.max.toString(),
			});
		} finally {
			setIsLoading(false);
		}
	}, [category, searchParams, urlPriceFrom, urlPriceTo]);

	useEffect(() => {
		fetchPriceData();
	}, [fetchPriceData]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		applyPriceFilter();
		if (setIsFilterOpenAction) setIsFilterOpenAction(false);
	};

	const applyPriceFilter = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString());
		//защита от пользователя чтобы меньше положенного не ввёл
		let fromValue = Math.max(
			priceRange.min,
			parseInt(inputValues.from) || priceRange.min
		);
		//защита от пользователя чтобы больше положенного не ввёл
		let toValue = Math.min(
			priceRange.max,
			parseInt(inputValues.to) || priceRange.max
		);
		if (fromValue > toValue) [fromValue, toValue] = [toValue, fromValue];
		params.set('priceFrom', fromValue.toString());
		params.set('priceTo', toValue.toString());
		params.set('inStock', inStock.toString());
		router.push(`${basePath}?${params.toString()}`);
	}, [inputValues, priceRange, searchParams, router, basePath, inStock]);

	//функция "в наличии"
	const handleInStockChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setInStock(e.target.checked);
		},
		[]
	);

	//стейт для rc слайдера
	const sliderValues = [
		parseInt(inputValues.from) || priceRange.min,
		parseInt(inputValues.to) || priceRange.max,
	];
	//sliders func
	const handleSliderChange = useCallback((values: [number, number]) => {
		setInputValues({
			from: values[0].toString(),
			to: values[1].toString(),
		});
	}, []);

	//сброс
	const resetPriceFilter = useCallback(() => {
		setInputValues({
			from: priceRange.min.toString(),
			to: priceRange.max.toString(),
		});
		const params = new URLSearchParams(searchParams.toString());
		params.delete('priceFrom');
		params.delete('priceTo');
		params.delete('page');
		router.push(`${basePath}?${params.toString()}`);
	}, [basePath, priceRange.max, priceRange.min, router, searchParams]);

	if (isLoading) {
		return <MiniLoader />;
	}
	if (error) {
		return (
			<ErrorComponent
				error={error.error}
				userMessage={error.userMessage}
			/>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-y-10 text-[#414141] ">
			<PriceFilterHeader onResetAction={resetPriceFilter} />
			<PriceInputs
				from={inputValues.from}
				to={inputValues.to}
				min={priceRange.min}
				max={priceRange.max}
				onFromChangeAction={(value: string) =>
					setInputValues((prev) => ({ ...prev, from: value }))
				}
				onToChangeAction={(value: string) =>
					setInputValues((prev) => ({ ...prev, to: value }))
				}
			/>

			<PriceRangeSlider
				min={priceRange.min}
				max={priceRange.max}
				values={sliderValues}
				onChangeAction={handleSliderChange}
			/>

			<div className="flex items-center gap-2">
				<label className="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						id="inStock"
						checked={inStock}
						onChange={handleInStockChange}
						className="sr-only peer"
					/>
					<div className="w-[46px] h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#70c05b] transition-colors duration-200">
						<div
							className={`
                absolute top-0.5 left-0
                w-5 h-5
                border-[0.5px] border-[rgba(0,0,0,0.04)]
                rounded-full
                shadow-[0px_1px_1px_rgba(0,0,0,0.08),0px_2px_6px_rgba(0,0,0,0.15)]
                bg-white
                transition-transform duration-300
                ${
					inStock
						? 'transform translate-x-6'
						: 'transform translate-x-0'
				}
              `}></div>
					</div>
					<span className="ml-2 text-sm text-[#414141]">
						В наличии
					</span>
				</label>
			</div>
			<button
				type="submit"
				className="bg-[#ff6633] text-white hover:shadow-(--shadow-article)
			active:shadow-(--shadow-button-active) h-10 rounded justify-center
			items-center duration-300 cursor-pointer
			">
				Применить
			</button>
		</form>
	);
};

export default PriceFilter;
