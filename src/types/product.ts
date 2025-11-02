export interface ProductCardProps {
	_id: number;
	id: number;
	img: string;
	title: string;
	description: string;
	basePrice: number;
	discountPercent?: number;
	rating: number;
	weight?: string;
	categories: string[];
	// volume?: string;
}
