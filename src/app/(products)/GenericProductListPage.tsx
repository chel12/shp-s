import { GenericProductListPageProps } from '@/types/GenericProductListPageProps';
import ProductsSection from './ProductsSection';
import { CONFIG } from '../../../config/config';

const GenericProductListPage = async ({
	searchParams,
	props,
}: {
	searchParams: Promise<{ page?: string; itemsPerPage?: string }>;
	props: GenericProductListPageProps;
}) => {
	const params = await searchParams;
	const page = params?.page;
	const itemsPerPage = params?.itemsPerPage || CONFIG.ITEMS_PER_PAGE;
	const currentPage = Number(page) || 1;
	//кол-во на странице
	const perPage = Number(itemsPerPage);
	//считаем с какого элемента массива начинаем вывод
	const startIdx = (currentPage - 1) * perPage;

	const products = await props.fetchData();
	const paginatedProducts = products.slice(startIdx, startIdx + perPage);

	return (
		<>
			<ProductsSection
				title={props.pageTitle}
				viewAllButton={{ text: 'На главную', href: '/' }}
				products={paginatedProducts}
			/>
		</>
	);
};

export default GenericProductListPage;
