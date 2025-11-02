export interface ProductCardProps {
	_id: number;
	id: number;
	img: string;
	title: string;
	description: string;
	basePrice: number;
	discountPercent?: number;
	rating: {
		rate: number;
		count: number;
	};
	weight?: string;
	categories: string[];
	quantity?: number;
}
