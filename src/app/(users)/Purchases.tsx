import fetchPurchases from './fetchPurchases';
import ProductsSection from '../(products)/ProductsSection';

const Purchases = async () => {
	try {
		const purchases = await fetchPurchases();
		return (
			<ProductsSection
				title="Покупали раньше"
				viewAllButton={{ text: 'Все покупки', href: 'purchases' }}
				products={purchases}
				compact
			/>
		);
	} catch (err) {
		return <div className="text-red-500">Ошибка: получения покупок</div>;
	}
};

export default Purchases;
