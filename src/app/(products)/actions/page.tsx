import fetchProductsByCategory from '../fetchProducts';
import GenericProductListPage from '../GenericProductListPage';
import ProductsSection from '../ProductsSection';

export const metadata = {
	title: 'Акции магазина "Северяночка"',
	description: 'Акционные товары магазина "Северяночка"',
};

const AllActions = async ({
	searchParams,
}: {
	searchParams: Promise<{ page?: string; itemsPerPage?: string }>;
}) => {
	return (
		<GenericProductListPage
			searchParams={searchParams}
			props={{
				fetchData: () => fetchProductsByCategory('actions'),
				pageTitle: 'Все акции',
				basePath: '/actions',
				errorMessage: 'Ошибка: не удалось загрузить акции',
			}}
		/>
	);
	// try {
	// 	const products = await fetchProductsByCategory('actions');
	// 	return (
	// 		<ProductsSection
	// 			title="Все акции"
	// 			viewAllButton={{ text: 'На главную', href: '/' }}
	// 			products={products}
	// 		/>
	// 	);
	// } catch {
	// 	return (
	// 		<div className="text-red-500">
	// 			Ошибка: не удалось загрузить акции
	// 		</div>
	// 	);
	// }
};

export default AllActions;
