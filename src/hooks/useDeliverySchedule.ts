import { useState, useCallback } from 'react';
import { getThreeDaysDates } from '@/app/(admin)/administrator/delivery-times/utils/getThreeDaysDates';
import { convertTimeToMinutes } from '@/app/(admin)/administrator/delivery-times/utils/convertTimeToMinutes';
import { Schedule } from '@/types/deliverySchedule';

export function useDeliverySchedule() {
	//хранение расписания доставки
	const [schedule, setSchedule] = useState<Schedule>({});
	const [loading, setLoading] = useState(true);
	//состояния сохранения на серв
	const [saving, setSaving] = useState(false);
	//сообщения
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	//время начала
	const [startTime, setStartTime] = useState('08:00');
	//время конца
	const [endTime, setEndTime] = useState('14:00');
	//хранение слотов (время начала и конца объеденено)
	const [timeSlots, setTimeSlots] = useState<string[]>([]);
	//получаем даты на ближайшие 3 дня
	const dates = getThreeDaysDates();
	//показ сообщ пользователю
	const showMessage = useCallback((text: string) => {
		setMessage(text);
	}, []);
	//иницилизация пустого расписания для всех дат
	const initializeEmptySchedule = useCallback(() => {
		const emptySchedule: Schedule = {};

		dates.forEach((date) => {
			emptySchedule[date] = {};
		});

		setSchedule(emptySchedule);
	}, [dates]);

	//получение с сервера
	const fetchDeliveryTimes = useCallback(async () => {
		try {
			const response = await fetch('/api/delivery-times');
			//получаем
			const data = await response.json();
			//есть ли данные в ответе
			if (data.schedule && Object.keys(data.schedule).length > 0) {
				const loadedSchedule = data.schedule as Schedule;

				// const updatedSchedule = dates.reduce<Schedule>((acc, date) => {
				//   acc[date] = loadedSchedule[date] ? { ...loadedSchedule[date] } : {};
				//   return acc;
				// }, {});

				const updatedSchedule: Schedule = {};
				//перебираем даты
				dates.forEach((date) => {
					updatedSchedule[date] = loadedSchedule[date]
						? { ...loadedSchedule[date] }
						: {};
				});

				setSchedule(updatedSchedule);
				//собирает все уникальные значения дат (перестраховка)
				const slots = new Set(
					dates.flatMap((date) =>
						Object.keys(updatedSchedule[date] || {})
					)
				);

				setTimeSlots(Array.from(slots));
			} else {
				initializeEmptySchedule();
			}
		} catch {
			setError('Ошибка загрузки графика доставки');
			initializeEmptySchedule();
		} finally {
			setLoading(false);
		}
	}, [dates, initializeEmptySchedule]);

	//добавление нового слота
	const addTimeSlot = useCallback(() => {
		setError('');

		if (!startTime.trim() || !endTime.trim()) {
			setError('Заполните оба поля времени');
			return;
		}
		//конвертация в минуты
		const startMinutes = convertTimeToMinutes(startTime);
		const endMinutes = convertTimeToMinutes(endTime);

		if (startMinutes >= endMinutes) {
			setError('Время начала должно быть раньше времени окончания');
			return;
		}

		const timeSlotValue = `${startTime}-${endTime}`;
		//пересечение
		const hasOverlap = timeSlots.some((existingSlot) => {
			//получаем массив
			const [existingStart, existingEnd] = existingSlot.split('-');
			//конвертируем в минуты
			const existingStartMinutes = convertTimeToMinutes(existingStart);
			const existingEndMinutes = convertTimeToMinutes(existingEnd);

			return (
				//начала нового слота будет существовать уже в существующем слоте
				(startMinutes >= existingStartMinutes &&
					startMinutes < existingEndMinutes) ||
				//конец нового слота будет в существ уже слоте
				(endMinutes > existingStartMinutes &&
					endMinutes <= existingEndMinutes) ||
				//новый слот покрывает полностью существующий слот уже
				(startMinutes <= existingStartMinutes &&
					endMinutes >= existingEndMinutes)
			);
		});

		if (hasOverlap) {
			setError('Временной слот пересекается с существующими слотами');
			return;
		}
		//существующим добавляем новый слот
		const updatedTimeSlots = [...timeSlots, timeSlotValue];
		//и обновляем стейт
		setTimeSlots(updatedTimeSlots);
		//обновляем слот
		const updatedSchedule: Schedule = { ...schedule };
		//создание новой даты если её нет
		dates.forEach((date) => {
			if (!updatedSchedule[date]) updatedSchedule[date] = {};
			//устанавливает слот как доступный в тру
			updatedSchedule[date][timeSlotValue] = true;
		});

		setSchedule(updatedSchedule);
		showMessage('Временной слот добавлен для всех дней');
	}, [startTime, endTime, timeSlots, schedule, dates, showMessage]);
	//меняет тоглл тру фили фолс
	const updateTimeSlotStatus = useCallback(
		(date: string, timeSlot: string, free: boolean) => {
			setSchedule((prev) => ({
				...prev,
				[date]: {
					...prev[date],
					[timeSlot]: free,
				},
			}));
		},
		[]
	);
	//удаление слота
	const removeTimeSlot = useCallback(
		(slotToRemove: string) => {
			setError('');

			const updatedTimeSlots = timeSlots.filter(
				(slot) => slot !== slotToRemove
			);
			setTimeSlots(updatedTimeSlots);

			const updatedSchedule: Schedule = { ...schedule };

			dates.forEach((date) => {
				if (updatedSchedule[date]) {
					delete updatedSchedule[date][slotToRemove];
				}
			});

			setSchedule(updatedSchedule);
			showMessage('Временной слот удален из всех дней');
		},
		[timeSlots, schedule, dates, showMessage]
	);
	//сохранение графики доставки
	const saveDeliveryTimes = useCallback(async () => {
		setError('');
		setSaving(true);
		setMessage('');

		try {
			const scheduleToSend: Schedule = {};

			dates.forEach((date) => {
				scheduleToSend[date] = {};
				timeSlots.forEach((slot) => {
					scheduleToSend[date][slot] =
						schedule[date]?.[slot] !== false;
				});
			});
			//отправляем на сервак график доставки
			const response = await fetch('/api/delivery-times', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ schedule: scheduleToSend }),
			});

			const result = await response.json();

			if (result.success) {
				showMessage('График доставки успешно сохранен!');
			} else {
				setError(result.error || 'Ошибка при сохранении');
			}
		} catch (err) {
			console.error('Ошибка сохранения:', err);
			setError('Ошибка при сохранении графика доставки');
		} finally {
			setSaving(false);
		}
	}, [dates, timeSlots, schedule, showMessage]);

	return {
		schedule,
		loading,
		saving,
		message,
		error,
		startTime,
		endTime,
		timeSlots,
		setStartTime,
		setEndTime,
		fetchDeliveryTimes,
		showMessage,
		addTimeSlot,
		updateTimeSlotStatus,
		removeTimeSlot,
		saveDeliveryTimes,
	};
}
