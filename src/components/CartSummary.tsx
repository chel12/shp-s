import { ExtendedCartSummaryProps } from '../types/cart';
import { useCartStore } from '@/store/cartStore';
import { CONFIG } from '../../config/config';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PriceSummary from '../app/(cart)/cart/_components/PriceSummary';
import MinimumOrderWarning from '../app/(cart)/cart/_components/MinimumOrderWarning';
import PaymentButtons from '../app/(cart)/cart/_components/PaymentButtons';
import CheckoutButton from '../app/(cart)/cart/_components/CheckoutButton';
import { FakePaymentData, PaymentSuccessData } from '@/types/payment';
import {
	confirmOrderPayment,
	createOrderRequest,
	prepareCartItemsWithPrices,
	updateUserAfterPayment,
} from '../app/(cart)/cart/utils/orderHelpers';
import FakePaymentModal from '@/app/(payment)/FakePaymentModal';
import PaymentSuccessModal from '@/app/(payment)/PaymentSuccessModal';
import { useAuthStore } from '@/store/authStore';
import { ProductCardProps } from '@/types/product';

const CartSummary = ({
	deliveryData,
	productsData = {},
	isRepeatOrder = false,
	customCartItems,
	customPricing,
	onOrderSuccess,
}: ExtendedCartSummaryProps) => {
	const [isProcessing, setIsProcessing] = useState(false);
	//номер заказа
	const [orderNumber, setOrderNumber] = useState<string | null>(null);

	const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

	const [paymentType, setPaymentType] = useState<
		'cash_on_delivery' | 'online' | null
	>(null);
	//модалка для ввода карты
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	//модалка об статусе оплаты
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successData, setSuccessData] = useState<PaymentSuccessData | null>(
		null
	);
	const { user } = useAuthStore();
	//чтобы узнать начислять 5% бонус или нет
	const actualHasLoyaltyCard = !!user?.card;

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
		updatePricing,
	} = useCartStore();

	const visibleCartItems =
		isRepeatOrder && customCartItems
			? customCartItems
			: cartItems.filter((item) => item.quantity > 0);

	const currentPricing =
		isRepeatOrder && customPricing ? customPricing : pricing;

	const {
		totalPrice,
		totalMaxPrice,
		totalDiscount,
		finalPrice,
		totalBonuses,
		maxBonusUse,
		isMinimumReached,
	} = currentPricing;

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
		if (isRepeatOrder) {
			updatePricing({
				...currentPricing,
				totalBonuses,
			});
		}

		const effectiveHasLoyaltyCard = isRepeatOrder
			? actualHasLoyaltyCard
			: hasLoyaltyCard;

		//расчет цены
		const cartItemsWithPrices = prepareCartItemsWithPrices(
			visibleCartItems,
			productsData as { [key: string]: ProductCardProps },
			effectiveHasLoyaltyCard
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
	const handlePaymentResult = async (
		paymentMethod: 'cash_on_delivery' | 'online',
		paymentData?: FakePaymentData
	) => {
		if (!deliveryData) {
			console.error('Данные доставки не заполнены');
			return;
		}

		setIsProcessing(true);
		setPaymentType(
			paymentMethod === 'online' ? 'online' : 'cash_on_delivery'
		);

		try {
			//логика после подтверждения платежа
			if (paymentMethod === 'online') {
				if (paymentData?.status === 'succeeded') {
					//списывание товара
					await confirmOrderPayment(currentOrderId!);
					//обновление коллекции пользователя после платежа
					await updateUserAfterPayment({
						usedBonuses: actualUsedBonuses,
						earnedBonuses: totalBonuses,
						purchasedProductIds: visibleCartItems.map(
							(item) => item.productId
						),
					});
				}

				//данные для модалки по результам оплаты
				const successModalData: PaymentSuccessData = {
					orderNumber: orderNumber!,
					paymentId: paymentData!.id,
					amount: finalPrice,
					cardLast4: paymentData!.cardLast4,
				};

				setSuccessData(successModalData);
				setShowSuccessModal(true);
			} else {
				const result = await createOrder(
					paymentMethod,
					paymentData?.id
				);
				setOrderNumber(result.orderNumber);
			}

			setIsOrdered(true);
		} catch (error: unknown) {
			console.error(`Ошибка`, error);
			alert(`Ошибка при обработки заказа`);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleCashPayment = async () => {
		await handlePaymentResult('cash_on_delivery');
	};

	const handleOnlinePayment = async () => {
		if (!deliveryData) {
			console.error('Данные доставки не заполнены');
			return;
		}
		setIsProcessing(true);

		try {
			const result = await createOrder('online');
			setOrderNumber(result.orderNumber);
			setCurrentOrderId(result.order._id);
			setShowPaymentModal(true);
		} catch (error) {
			console.error('Ошибка при создании заказа:', error);
			alert('Ошибка при создании заказа');
		} finally {
			setIsProcessing(false);
		}
	};
	const handleClosePaymentModal = () => {
		setShowPaymentModal(false);
	};
	//успешная онлайн оплата
	const handlePaymentSuccess = async (paymentData: FakePaymentData) => {
		setShowPaymentModal(false);
		try {
			await handlePaymentResult('online', paymentData);
		} catch (error) {
			console.error('Ошибка обработки заказа:', error);
		}
	};

	const handlePaymentError = (error: string) => {
		setShowPaymentModal(false);
		alert(`Ошибка оплаты: ${error}`);
	};

	const handleCloseSuccessModal = () => {
		setShowSuccessModal(false);
		if (isRepeatOrder && onOrderSuccess) {
			onOrderSuccess();
		}
		setIsOrdered(true);
		resetAfterOrder();
		router.push('/user-orders');
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
				{isRepeatOrder || !isCheckout ? (
					<PaymentButtons
						isOrdered={isOrdered}
						paymentType={paymentType}
						orderNumber={orderNumber}
						isProcessing={isProcessing}
						canProceedWithPayment={canProceedWithPayment()}
						onOnlinePayment={handleOnlinePayment}
						onCashPayment={handleCashPayment}
					/>
				) : (
					<CheckoutButton
						isCheckout={isCheckout}
						isMinimumReached={isMinimumReached}
						visibleCartItemsCount={visibleCartItems.length}
						onCheckout={() => setIsCheckout(true)}
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
