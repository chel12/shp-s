import { useGetAdminOrdersQuery } from '@/store/redux/api/ordersApi';
import TimeSlotGroup from './TimeSlotGroup';

interface TimeSlotSectionProps {
	orderIds: string[];
}

const TimeSlotSection = ({ orderIds }: TimeSlotSectionProps) => {
	//получаем данные
	const { data } = useGetAdminOrdersQuery();
	//фильтр заказов под переданный Id
	const orders =
		data?.orders?.filter((order) => orderIds.includes(order._id)) || [];
	//уникальный список временных слотов
	const timeSlots = [
		...new Set(orders.map((o) => o.deliveryTimeSlot)),
	].sort();
	//создание групп заказов по временным слотам
	const timeSlotGroups = timeSlots.map((timeSlot) => ({
		timeSlot,
		orderIds: orders
			.filter((order) => order.deliveryTimeSlot === timeSlot)
			.map((order) => order._id),
	}));

	console.log(timeSlotGroups);

	return (
		<div className="flex flex-col gap-y-30">
			{timeSlotGroups.map(({ timeSlot, orderIds }) => (
				<TimeSlotGroup
					key={timeSlot}
					timeSlot={timeSlot}
					orderIds={orderIds}
				/>
			))}
		</div>
	);
};

export default TimeSlotSection;
