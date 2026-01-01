export type PaymentSimulationResult = 'success' | 'failure' | 'error';

export interface FakePaymentData {
	id: string; //id платежа
	amount: number; //сумма
	cardLast4: string; //4 цифры карты
	timestamp: string; //время
	processor: string; //тип платежной системы
	status: 'succeeded' | 'failed'; //статус
}

export interface PaymentSuccessData {
	orderNumber: string;
	paymentId: string;
	amount: number;
	cardLast4: string;
}

export interface FakePaymentModalProps {
	amount: number;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (paymentData: FakePaymentData) => void;
	onError: (error: string) => void;
}
