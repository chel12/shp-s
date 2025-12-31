import { useEffect, useState } from 'react';
import {
	DeliveryAddress as DeliveryAddressType,
	DeliveryTime as DeliveryTimeType,
} from '@/types/order';
import DeliveryAddress from './DeliveryAddress';
import DeliveryTime from './DeliveryTime';

interface CheckoutFormProps {
	onFormDataChange: (data: {
		address: DeliveryAddressType;
		time: DeliveryTimeType;
		isValid: boolean;
	}) => void;
}

const CheckoutForm = ({ onFormDataChange }: CheckoutFormProps) => {
	//куда доставлять
	const [deliveryFormData, setDeliveryFormData] =
		useState<DeliveryAddressType>({
			city: '',
			street: '',
			house: '',
			apartment: '',
			additional: '',
		});
	//когда
	const [deliveryTime, setDeliveryTime] = useState<DeliveryTimeType>({
		date: '',
		timeSlot: '',
	});
	//эффект для проверки валидности данных полей
	useEffect(() => {
		//проверка введённых данных
		const isAddressValid = Boolean(
			deliveryFormData.city &&
			deliveryFormData.street &&
			deliveryFormData.house
		);
		//проверка валидности введённого времени
		const isTimeValid = Boolean(deliveryTime.date && deliveryTime.timeSlot);
		//общая валидность
		const isValid = isAddressValid && isTimeValid;
		//в родитель компонент закидываем данные
		onFormDataChange({
			address: deliveryFormData,
			time: deliveryTime,
			isValid,
		});
	}, [deliveryFormData, deliveryTime, onFormDataChange]);

	//место доставки
	const handleFormDataChange = (
		field: keyof DeliveryAddressType,
		value: string
	) => {
		setDeliveryFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};
	//дату доставки записывает
	const handleDateChange = (date: string) => {
		setDeliveryTime((prev) => ({
			...prev,
			date,
		}));
	};
	//слот доставки записывает
	const handleTimeSlotChange = (timeSlot: string) => {
		setDeliveryTime((prev) => ({
			...prev,
			timeSlot,
		}));
	};

	return (
		<div className="flex-1 space-y-10">
			<DeliveryAddress
				formData={deliveryFormData}
				onFormDataChange={handleFormDataChange}
			/>

			<DeliveryTime
				selectedDate={deliveryTime.date}
				selectedTimeSlot={deliveryTime.timeSlot}
				onDateChange={handleDateChange}
				onTimeSlotChange={handleTimeSlotChange}
			/>
		</div>
	);
};

export default CheckoutForm;
