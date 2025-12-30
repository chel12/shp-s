import { convertTimeToMinutes } from './convertTimeToMinutes';

//сортирует 3 даты
export const sortTimeSlots = (timeSlots: string[]): string[] => {
	return [...timeSlots].sort((a, b) => {
		const [startA] = a.split('-');
		const [startB] = b.split('-');
		return convertTimeToMinutes(startA) - convertTimeToMinutes(startB);
	});
};
