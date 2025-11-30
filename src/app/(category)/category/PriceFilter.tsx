'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export interface PriceFilterProps {
	basePath: string;
	category: string;
}

const PriceFilter = ({ basePath, category }: PriceFilterProps) => {
	const searchParams = useSearchParams();
	//из урла берём
	const urlPriceFrom = searchParams.get('priceFrom') || '';
	const urlPriceTo = searchParams.get('priceTo') || '';

	const [inputValues, setInputValues] = useState({
		from: urlPriceFrom,
		to: urlPriceTo,
	});

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			setInputValues((prev) => ({ ...prev, [name]: value }));
		},
		[]
	);

	return (
		<div className="flex flex-col gap-y-10 text-[#414141] mt-10 xl:mt-0">
			<div className="flex flex-row justify-between items-center">
				<p className="text-black text-base">Цена</p>
				<button className="text-xs rounded bg-[#f3f2f1] h-8 p-2 cursor-pointer">
					Очистить
				</button>
			</div>
			<div className="flex flex-row items-center justify-between gap-2">
				<input
					type="number"
					name="from"
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
					value={inputValues.to}
					onChange={handleInputChange}
					min={priceRange.min}
					max={priceRange.max}
					className="w-[124px] h-10 border border-[#bfbfbf] rounded bg-white py-2 px-4"
				/>
			</div>
		</div>
	);
};

export default PriceFilter;
