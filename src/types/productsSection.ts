import { ProductCardProps } from './product';

export interface ProductSectionProps {
	title: string;
	viewAllButton: {
		text: string;
		href: string;
	};
	products: ProductCardProps;
	compact?: boolean;
}
