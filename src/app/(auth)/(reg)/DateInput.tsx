'use client';

import { ChangeEvent, useState } from 'react';
import { formStyles } from '../styles';
import Tooltip from './Tooltip';
import { validateBirthDate } from '../../../../utils/validation/validateBirthDate';

interface DateInputProps {
	id: string;
	value: string;
	onChangeAction: (value: string) => void;
}

const DateInput = ({ id, value, onChangeAction }: DateInputProps) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const [error, setError] = useState<string | null>(null);

	//форматирование даты
	const formatDate = (input: string): string => {
		const cleaned = input.replace(/\D/g, '');
		//результаты
		let formatted = '';
		//дни
		if (cleaned.length > 0) formatted = cleaned.slice(0, 2);
		//месяц
		if (cleaned.length > 2) formatted += '.' + cleaned.slice(2, 4);
		//год
		if (cleaned.length > 4) formatted += '.' + cleaned.slice(4, 8);
		return formatted;
	};

	//функция работы с окончательной датой
	const handleDateChange = (formattedDate: string) => {
		const validation = validateBirthDate(formattedDate);
		setError(validation.error || null);
		setShowTooltip(!!validation.error);
		onChangeAction(formattedDate);
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		//выбор даты + форматирование
		const formatted = formatDate(e.target.value);
		handleDateChange(formatted);
	};

	return (
		<>
			<div className="relative">
				<label htmlFor={id} className={formStyles.label}>
					Дата рождения
				</label>

				<div className="relative">
					<input
						id={id}
						type="text"
						value={value}
						onChange={handleInputChange}
						placeholder="дд.мм.гггг"
						className={`${formStyles.input} pr-8`}
						maxLength={10}
						onFocus={() => setShowTooltip(true)}
						onBlur={() => setShowTooltip(false)}
					/>
				</div>
				{showTooltip && error && <Tooltip text={error} />}
			</div>
		</>
	);
};

export default DateInput;
