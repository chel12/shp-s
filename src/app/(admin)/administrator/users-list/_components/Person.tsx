import { Cake } from 'lucide-react';

import { tableStyles } from '../../styles';
import { formatBirthday } from '../../../../../../utils/admin/formatBirthday';
import { isBirthdaySoon } from '../../../../../../utils/admin/birthdaySoon';

const Person = ({
	name,
	surname,
	birthday,
}: {
	name: string;
	surname: string;
	birthday: string;
}) => {
	//определяет есть ли др в ближайшие 3 дня
	const birthdaySoon = isBirthdaySoon(birthday);
	return (
		<div
			className={`border-b border-gray-300 md:border-b-0 order-2 flex flex-row md:flex-col md:items-start gap-x-3 gap-y-2 ${tableStyles.colSpans.name} ${tableStyles.border.right}`}>
			<div className="text-xs lg:text-sm font-medium md:text-left">
				{name} {surname}
			</div>
			{birthdaySoon && (
				<span className="inline-flex items-center gap-2 text-[#ff6633] text-xs md:justify-start">
					<Cake className="h-4 w-4" />
					{/* отсекает год*/}
					{formatBirthday(birthday)}
				</span>
			)}
		</div>
	);
};

export default Person;
