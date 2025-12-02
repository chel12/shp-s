export function validateBirthDate(dateStr: string): {
	isValid: boolean;
	error?: string;
} {
	//если нету даты или не полная
	if (!dateStr || dateStr.length < 10) {
		return {
			isValid: false,
			error: 'Введите полную дату в формате дд.мм.гггг',
		};
	}
	//разбить строку на компоненты и преобразовать в числа
	const [day, month, year] = dateStr.split('.').map(Number);
	const date = new Date(year, month - 1, day);
	const today = new Date();
	const minDate = new Date(1900, 0, 1);
	const maxDate = new Date();
	//проверка на возраст 14+
	maxDate.setFullYear(maxDate.getFullYear() - 14);
	//сравнивем компонент даты с исходными значениями
	if (
		date.getDate() !== day ||
		date.getMonth() !== month - 1 ||
		date.getFullYear() !== year
	) {
		return { isValid: false, error: 'Некорректная дата' };
	}
	if (date < minDate) {
		return { isValid: false, error: 'Дата не может быть раньше 1900 года' };
	}
	if (date > today) {
		return { isValid: false, error: 'Дата не может быть в будущем' };
	}
	if (date > maxDate) {
		return { isValid: false, error: 'Вам должно быть не меньше 14 лет' };
	}
	return { isValid: true };
}
