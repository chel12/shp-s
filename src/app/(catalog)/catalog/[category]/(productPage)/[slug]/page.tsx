//оболочка
import { Metadata } from 'next';
import { ProductCardProps } from '@/types/product';

//основной компонент

import ErrorComponent from '@/components/ErrorComponent';
import { getProduct } from '../getProducts';
import ProductPageContent from './ProductPageContent';
import { baseUrl } from '../../../../../../../utils/baseUrl';

interface PageProps {
	params: Promise<{ category: string; slug: string }>;
}

//id берет из парамсов а название обрезает
function extractIdFromSlug(slug: string): string {
	const match = slug.match(/^(\d+)/);
	return match ? match[1] : slug;
}
//динамически мета данные генерирует
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	try {
		const { category, slug } = await params;
		const productId = extractIdFromSlug(slug);
		const product = await getProduct(productId);
		const canonicalUrl = `${baseUrl}/catalog/${category}/${slug}`;
		return {
			title: `${product.title}`,
			description: `Заказывайте ${product.title} по лучшей цене. Быстрая доставка, гарантия качества.`,
			metadataBase: new URL(baseUrl),
			alternates: {
				canonical: canonicalUrl,
			},
			//для соцсетей что показывать
			openGraph: {
				title: product.title,
				description:
					product.description ||
					`Заказывайте ${product.title} по лучшей цене`,
				images: product.img ? [product.img[0]] : [],
				url: canonicalUrl,
			},
		};
	} catch {
		return {
			title: 'Товар',
			description: 'Страница товара',
			metadataBase: new URL(baseUrl),
		};
	}
}

const ProductPage = async ({ params }: PageProps) => {
	let product: ProductCardProps;

	try {
		const { slug } = await params;
		const productId = extractIdFromSlug(slug);
		product = await getProduct(productId);
	} catch (error) {
		return (
			<ErrorComponent
				error={
					error instanceof Error ? error : new Error(String(error))
				}
				userMessage="Не удалось загрузить данные о продукте"
			/>
		);
	}

	if (!product) {
		return (
			<ErrorComponent
				error={new Error('Продукт не найден')}
				userMessage="Продукт не найден"
			/>
		);
	}
	//основной компонент страницы
	return (
		<ProductPageContent
			product={product}
			productId={product.id.toString()}
		/>
	);
};

export default ProductPage;
