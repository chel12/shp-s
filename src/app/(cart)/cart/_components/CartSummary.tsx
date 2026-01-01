import { CartSummaryProps } from '../../../../types/cart';
import { useCartStore } from '@/store/cartStore';
import { CONFIG } from '../../../../../config/config';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PriceSummary from './PriceSummary';
import MinimumOrderWarning from './MinimumOrderWarning';
import PaymentButtons from './PaymentButtons';
import CheckoutButton from './CheckoutButton';
import { FakePaymentData, PaymentSuccessData } from '@/types/payment';
import {
	createOrderRequest,
	prepareCartItemsWithPrices,
	updateUserAfterPayment,
} from '../utils/orderHelpers';
import FakePaymentModal from '@/app/(payment)/FakePaymentModal';
import PaymentSuccessModal from '@/app/(payment)/PaymentSuccessModal';

const CartSummary = ({ deliveryData, productsData = {} }: CartSummaryProps) => {
	const [isProcessing, setIsProcessing] = useState(false);
	//номер заказа
	const [orderNumber, setOrderNumber] = useState<string | null>(null);
	const [paymentType, setPaymentType] = useState<'cash' | 'online' | null>(
		null
	);
	//модалка для ввода карты
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	//модалка об статусе оплаты
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successData, setSuccessData] = useState<PaymentSuccessData | null>(
		null
	);
	const router = useRouter();

	const {
		pricing,
		cartItems,
		hasLoyaltyCard,
		isCheckout,
		setIsCheckout,
		isOrdered,
		setIsOrdered,
		useBonuses,
		resetAfterOrder,
	} = useCartStore();
	const visibleCartItems = cartItems.filter((item) => item.quantity > 0);
	const {
		totalPrice,
		totalMaxPrice,
		totalDiscount,
		finalPrice,
		totalBonuses,
		maxBonusUse,
		isMinimumReached,
	} = pricing;

	//расчёт сколько можно списать бонусов
	const usedBonuses = Math.min(
		maxBonusUse,
		Math.floor((totalPrice * CONFIG.MAX_BONUSES_PERCENT) / 100)
	);

	//используем бонусы если нет тогда 0
	const actualUsedBonuses = useBonuses ? usedBonuses : 0;

	//функция создания платежа
	const createOrder = async (
		paymentMethod: 'cash_on_delivery' | 'online',
		paymentId?: string
	) => {
		if (!deliveryData) {
			throw new Error('Данные доставки не заполнены');
		}
		//расчет цены
		const cartItemsWithPrices = prepareCartItemsWithPrices(
			visibleCartItems,
			productsData,
			hasLoyaltyCard
		);

		const orderData = {
			finalPrice,
			totalBonuses,
			usedBonuses: actualUsedBonuses,
			totalDiscount,
			deliveryAddress: deliveryData.address,
			deliveryTime: deliveryData.time,
			cartItems: cartItemsWithPrices,
			totalPrice: totalMaxPrice,
			paymentMethod,
			paymentId,
		};

		return await createOrderRequest(orderData);
	};

	//оплата онлайн
	const handleOrderCreation = async (
		paymentMethod: 'cash_on_delivery' | 'online',
		paymentData?: FakePaymentData
	) => {
		if (!deliveryData) {
			console.error('Данные доставки не заполнены');
			return;
		}

		setIsProcessing(true);
		setPaymentType(paymentMethod === 'online' ? 'online' : 'cash');

		try {
			const result = await createOrder(paymentMethod, paymentData?.id);
			//логика после подтверждения платежа
			if (paymentMethod === 'online') {
				try {
					//обновление коллекции пользователя после платежа

					await updateUserAfterPayment({
						usedBonuses: actualUsedBonuses,
						earnedBonuses: totalBonuses,
						purchasedProductIds: visibleCartItems.map(
							(item) => item.productId
						),
					});
				} catch (updateError) {
					console.warn(
						'Заказ создан, но возникла проблема с обновлением бонусов',
						updateError
					);
				}
				//данные для модалки по результам оплаты
				const successModalData: PaymentSuccessData = {
					orderNumber: result.orderNumber,
					paymentId: paymentData!.id,
					amount: finalPrice,
					cardLast4: paymentData!.cardLast4,
				};

				setSuccessData(successModalData);
				setShowSuccessModal(true);
			}

			setOrderNumber(result.orderNumber);
			setIsOrdered(true);
		} catch (error: unknown) {
			console.error(
				`Ошибка при создании ${paymentMethod} заказа:`,
				error
			);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Произошла неизвестная ошибка';
			alert(`Ошибка при оформлении заказа: ${errorMessage}`);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleCashPayment = async () => {
		await handleOrderCreation('cash_on_delivery');
	};

	const handleOnlinePayment = () => {
		if (!deliveryData) {
			console.error('Данные доставки не заполнены');
			return;
		}
		setShowPaymentModal(true);
	};
	const handleClosePaymentModal = () => {
		setShowPaymentModal(false);
	};

	const handlePaymentSuccess = async (paymentData: FakePaymentData) => {
		await handleOrderCreation('online', paymentData);
	};

	const handlePaymentError = (error: string) => {
		setShowPaymentModal(false);
		alert(`Ошибка оплаты: ${error}`);
	};

	const handleCloseSuccessModal = () => {
		setShowSuccessModal(false);
		setIsOrdered(true);
		resetAfterOrder();
		router.push('/orders');
	};
	//проверка валидности пришли ли данные
	const isFormValid = (): boolean => {
		if (!deliveryData) {
			return false;
		}

		const { address, time } = deliveryData;

		// Проверяем обязательные поля адреса
		const isAddressValid = Boolean(
			address.city?.trim() &&
			address.street?.trim() &&
			address.house?.trim()
		);

		// Проверяем время доставки
		const isTimeValid = Boolean(time.date?.trim() && time.timeSlot?.trim());

		// Используем отфильтрованные товары
		const isValidForm =
			isAddressValid &&
			isTimeValid &&
			isMinimumReached && //есть ли минимальая цена заказа
			visibleCartItems.length > 0;

		return isValidForm;
	};
	//можно ли продолжать оплату. проверка: загрузка прошла? данные есть?
	const canProceedWithPayment = (): boolean => {
		return isFormValid() && !isProcessing;
	};

	return (
		<>
			<PriceSummary
				visibleCartItems={visibleCartItems}
				totalMaxPrice={totalMaxPrice}
				totalDiscount={totalDiscount}
				finalPrice={finalPrice}
				totalBonuses={totalBonuses}
			/>

			<div className="w-full">
				<MinimumOrderWarning isMinimumReached={isMinimumReached} />
				{!isCheckout ? (
					<CheckoutButton
						isCheckout={isCheckout}
						isMinimumReached={isMinimumReached}
						visibleCartItemsCount={visibleCartItems.length}
						onCheckout={() => setIsCheckout(true)}
					/>
				) : (
					<PaymentButtons
						isOrdered={isOrdered}
						paymentType={paymentType}
						orderNumber={orderNumber}
						isProcessing={isProcessing}
						canProceedWithPayment={canProceedWithPayment()}
						onOnlinePayment={handleOnlinePayment}
						onCashPayment={handleCashPayment}
					/>
				)}
			</div>
			<FakePaymentModal
				amount={finalPrice}
				isOpen={showPaymentModal}
				onClose={handleClosePaymentModal}
				onSuccess={handlePaymentSuccess}
				onError={handlePaymentError}
			/>

			<PaymentSuccessModal
				isOpen={showSuccessModal}
				onClose={handleCloseSuccessModal}
				successData={successData}
			/>
		</>
	);
};

export default CartSummary;
