import { useOrderProducts } from '@/hooks/useOrderProducts';
import { Order } from '@/types/order';
import OrderHeader from './OrderHeader';
import { useDeliveryData } from '@/hooks/useDeliveryData';
import useRepeatOrder from '@/hooks/useRepeatOrder';
import DeliveryDatePicker from './DeliveryDatePicker';
import ProductsSection from '@/components/ProductsSection';
import { useEffect, useState } from 'react';
import { OrderActions } from './OrderActions';
import MiniLoader from '@/components/MiniLoader';
import OrderDetails from './OrderDetails';
import { useOrderProductsData } from '@/hooks/useOrderProductsData';
import { usePriceComparison } from '@/hooks/usePriceComparison';
import { useOrderPricing } from '@/hooks/useOrderPricing';
import { StockWarningsAlert } from './StockWarningsAlert';

const OrderCard = ({ order }: { order: Order }) => {
	const [showOrderDetails, setShowOrderDetails] = useState(false);
	const [showPriceWarning, setShowPriceWarning] = useState(false);

	//обращается за данными о продуктах
	const { productsData: fetchedProductsData, loading: productsDataLoading } =
		useOrderProductsData(order);

	const { orderProducts, stockWarnings } = useOrderProducts(
		order,
		fetchedProductsData
	);

	const { currentProducts, priceComparison } = usePriceComparison(
		order,
		fetchedProductsData
	);

	const { cartItemsForSummary, productsData, customPricing } =
		useOrderPricing(order, currentProducts);

	const {
		showDatePicker,
		showDeliveryButton,
		handleOrderClick,
		handleDeliveryClick,
		handleDateSelect,
		handleCancelDelivery,
	} = useRepeatOrder();

	const { deliverySchedule } = useDeliveryData();
	//проверка продуктов на складе
	const hasStockIssues = orderProducts.some(
		(product) => product.isLowStock || product.insufficientStock
	);
	//можем ли повторить заказ
	const canCreateRepeatOrder = !hasStockIssues;
	//стили тыкаем через них показ всего заказа
	const applyIndexStyles = !showOrderDetails;
	//проверка изменений и в стейт предупрежд кидаем
	useEffect(() => {
		if (priceComparison?.hasChanges) {
			setShowPriceWarning(true);
		}
	}, [priceComparison]);

	if (productsDataLoading) {
		return <MiniLoader />;
	}

	return (
		<div className="text-main-text">
			<OrderHeader
				order={order}
				showDeliveryButton={showDeliveryButton}
				onOrderClick={handleOrderClick}
				onDeliveryClick={handleDeliveryClick}
				disabled={hasStockIssues}
			/>
			<ProductsSection
				products={orderProducts}
				//для отображ всех карт за счёт стиля
				applyIndexStyles={applyIndexStyles}
				isOrderPage={true}
			/>
			<StockWarningsAlert
				warnings={stockWarnings}
				hasStockIssues={hasStockIssues}
			/>
			<OrderActions
				showOrderDetails={showOrderDetails}
				onToggleDetails={() => setShowOrderDetails(!showOrderDetails)}
			/>
			{showOrderDetails && <OrderDetails order={order} />}
			{showDatePicker && (
				<DeliveryDatePicker
					schedule={deliverySchedule}
					isCreatingOrder={false}
					onDateSelect={(date, timeSlot) =>
						handleDateSelect(date, timeSlot, order.deliveryAddress)
					}
					onCancel={handleCancelDelivery}
				/>
			)}
		</div>
	);
};

export default OrderCard;
