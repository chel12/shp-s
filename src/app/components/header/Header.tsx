import React from 'react';
import LogoBlock from './LogoBlock';
import SearchBlock from './SearchBlock';
import UserBlock from './UserBlock';

const Header = () => {
	return (
		<header
			className="bg-white w-full md:shadow-(--shadow-default) flex flex-col 
		md:flex-row md:gap-y-5 xl:gap-y-7 md:gap-10 md:p-2 justify-center z-10 relative">
			<div
				className="flex flex-row gap-4 xl:gap-10 py-2 px-4 items-center shadow-(--shadow-default)
			md:shadow-none">
				<LogoBlock />
				<SearchBlock />
			</div>
			<UserBlock />
		</header>
	);
};

export default Header;
