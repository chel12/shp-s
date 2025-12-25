'use client';

import IconMenuMob from '../svg/IconMenuMob';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import IconBox from '../svg/IconBox';
import IconHeart from '../svg/IconHeart';
import IconCart from '../svg/IconCart';

const TopMenu = () => {
	const pathname = usePathname();
	const isCatalogPage = pathname === '/catalog';
	const isFavoritePage = pathname === '/favorites';
	const isCartPage = pathname === '/cart';

	const { user } = useAuthStore();

	const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

	return (
		<ul className="flex flex-row gap-x-6 items-end">
			<li>
				<Link
					href="/catalog"
					className="flex flex-col items-center gap-2.5 md:hidden w-11">
					<IconMenuMob isCatalogPage={isCatalogPage} />
					<span
						className={
							isCatalogPage ? 'text-[#ff6633]' : 'text-main-text'
						}>
						Каталог
					</span>
				</Link>
			</li>

			{!isManagerOrAdmin && (
				<li>
					<Link
						href="/favorites"
						className="flex flex-col items-center gap-2.5 w-11 ">
						<IconHeart isActive={isFavoritePage} variant="orange" />
						<span
							className={
								isCatalogPage
									? 'text-[#ff6633]'
									: 'text-main-text'
							}>
							Избранное
						</span>
					</Link>
				</li>
			)}

			<li className="flex flex-col items-center gap-2.5 w-11 cursor-pointer">
				<IconBox />
				<span
					className={
						isManagerOrAdmin ? 'text-[#ff6633]' : 'text-main-text'
					}>
					Заказы
				</span>
			</li>
			{!isManagerOrAdmin && (
				<li className="flex flex-col items-center gap-2.5 w-11 ">
					<Link
						href="/cart"
						className="flex flex-col items-center gap-2.5 w-11">
						<IconCart isActive={isCartPage} />
					</Link>
					<span
						className={
							isCartPage ? 'text-[#ff6633]' : 'text-main-text'
						}>
						Корзина
					</span>
				</li>
			)}
		</ul>
	);
};

export default TopMenu;
