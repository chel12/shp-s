import { CartSidebarProps } from '@/types/cart';
import BonusesSection from './BonusesSection';
import CartSummary from './CartSummary';

const CartSidebar = ({
	
}: CartSidebarProps) => {
	return (
		<div className="flex flex-col gap-y-6 md:w-[255px] xl:w-[272px]">
			<BonusesSection
			
			/>

			<CartSummary
			
			/>
		</div>
	);
};

export default CartSidebar;
