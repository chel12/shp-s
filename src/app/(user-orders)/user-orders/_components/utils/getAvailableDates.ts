import { getThreeDaysDates } from '@/app/(admin)/administrator/delivery-times/utils/getThreeDaysDates';
import { AvailableDate } from '@/types/availableDate';
import { Schedule } from '@/types/deliverySchedule';

export const getAvailableDates = (schedule: Schedule): AvailableDate[] => {
	//принять график
	const threeDaysDates = getThreeDaysDates();
	//массив дат
	return threeDaysDates
		.map((dateString) => {
			const daySchedule = schedule[dateString as keyof typeof schedule];

			if (!daySchedule) {
				return null;
			}

			const totalSlots = Object.values(daySchedule).filter(
				(available) => available
			).length;

			return {
				date: new Date(dateString),
				dateString,
				availableSlots: totalSlots,
				totalSlots,
			};
		})
		.filter((item): item is AvailableDate => item !== null);
};
