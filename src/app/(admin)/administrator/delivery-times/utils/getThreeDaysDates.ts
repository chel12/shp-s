//функция формирует и выводит 3 даты для слотов
export const getThreeDaysDates = (): string[] => {
	//хранение дат
	const dates: string[] = [];
	const today = new Date();
	//создание дат
	const localToday = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate()
	);

	for (let i = 0; i < 3; i++) {
		const date = new Date(localToday);
		date.setDate(localToday.getDate() + i);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const dateString = `${year}-${month}-${day}`;
		dates.push(dateString); //собирает даты в массив
	}

	return dates;
};
