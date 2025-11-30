'use client';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { CONFIG } from '../../../../config/config';
import { PriceFilterProps, PriceRange } from '@/types/priceTypes';

const PriceFilter = ({ basePath, category }: PriceFilterProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	//из урла берём
	const urlPriceFrom = searchParams.get('priceFrom') || '';
	const urlPriceTo = searchParams.get('priceTo') || '';

	const [inputValues, setInputValues] = useState({
		from: urlPriceFrom,
		to: urlPriceTo,
	});
	const [priceRange, setPriceRange] = useState<PriceRange>(
		CONFIG.FALLBACK_PRICE_RANGE
	);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		applyPriceFilter();
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
		router.push(`${basePath}?${params.toString()}`);
	}, [inputValues, priceRange, searchParams, router, basePath]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			setInputValues((prev) => ({ ...prev, [name]: value }));
		},
		[]
	);

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-y-10 text-[#414141] mt-10 xl:mt-0">
			<div className="flex flex-row justify-between items-center">
				<p className="text-black text-base">Цена</p>
				<button
					type="button"
					onClick={resetPriceFilter}
					className="text-xs rounded bg-[#f3f2f1] h-8 p-2 cursor-pointer">
					Очистить
				</button>
			</div>
			<div className="flex flex-row items-center justify-between gap-2">
				<input
					type="number"
					name="from"
					placeholder={`${priceRange.min}`}
					value={inputValues.from}
					onChange={handleInputChange}
					min={priceRange.min}
					max={priceRange.max}
					className="w-[124px] h-10 border border-[#bfbfbf] rounded bg-white py-2 px-4"
				/>
				<Image
					src="/icons-products/icon-line.svg"
					alt="линия разделитель полей"
					width={24}
					height={24}
				/>
				<input
					type="number"
					name="to"
					placeholder={`${priceRange.max}`}
					value={inputValues.to}
					onChange={handleInputChange}
					min={priceRange.min}
					max={priceRange.max}
					className="w-[124px] h-10 border border-[#bfbfbf] rounded bg-white py-2 px-4"
				/>
			</div>
			<button
				type="submit"
				className="bg-[#ff6633] text-white hover:shadow-(--shadow-article)
			active:shadow-(--shadow-button-active) h-10 rounded justify-center
			items-center duration-300 cursor-pointer
			"></button>
		</form>
	);
};

export default PriceFilter;
