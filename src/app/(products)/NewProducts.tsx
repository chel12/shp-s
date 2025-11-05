import { shuffleArray } from '../../../utils/shuffleArray';
import fetchProductsByCategory from './fetchProducts';
import ProductsSection from './ProductsSection';

export const metadata = {
	title: 'Новые товары магазина "Северяночка"',
	description: 'Новые товары магазина "Северяночка"',
};

const NewProducts = async () => {
	try {
		let products = await fetchProductsByCategory('new');
		products = shuffleArray(products);
		return (
			<ProductsSection
				title="Новинки"
				viewAllButton={{ text: 'Все новинки', href: 'new' }}
				products={products}
				compact
			/>
		);
	} catch {
		return (
			<div className="text-red-500">
				Ошибка: не удалось загрузить новинки
			</div>
		);
	}
};

export default NewProducts;
