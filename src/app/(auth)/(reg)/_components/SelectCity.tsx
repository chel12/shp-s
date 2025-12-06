'use client';

import { ChangeEvent } from 'react';


import Image from 'next/image';
import { cities } from '@/data/cities';
import { formStyles } from '../../styles';

interface SelectCityProps {
	value: string;
	onChangeAction: (e: ChangeEvent<HTMLSelectElement>) => void;
}
const SelectCity = ({ value, onChangeAction }: SelectCityProps) => {
	return (
		<div>
			<label htmlFor="location" className={formStyles.label}>
				Город
			</label>
			<div className="relative">
				<select
					value={value}
					id="location"
					onChange={onChangeAction}
					className={`${formStyles.input} appearance-none pr-8 cursor-pointer`}>
					{cities.map((city) => (
						<option key={city.value}>{city.label}</option>
					))}
				</select>
				<div
					className="absolute right-2 top-2 transform -transform-y-1/2 
					pointer-events-none">
					<Image
						src="/icons-products/icon-arrow-right.svg"
						alt="Выберите Город"
						width={24}
						height={24}
						className="rotate-90"
					/>
				</div>
			</div>
		</div>
	);
};

export default SelectCity;
