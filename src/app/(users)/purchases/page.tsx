import ProductsSection from '@/app/(products)/ProductsSection';
import fetchPurchases from '../fetchPurchases';

export const metadata = {
	title: 'Часто покупают в магазине "Северяночка"',
	description: 'Купленные товары магазина "Северяночка"',
};

const AllUserPurchases = async () => {
	try {
		const purchases = await fetchPurchases();
		return (
			<ProductsSection
				title="Все покупки"
				viewAllButton={{ text: 'На главную', href: '/' }}
				products={purchases}
			/>
		);
	} catch {
		return (
			<div className="text-red-500">
				Ошибка: не удалось загрузить покупки
			</div>
		);
	}
};

export default AllUserPurchases;
