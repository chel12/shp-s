import { Locations } from "@/types/shop";

export const locations: Locations = {
	borisovichi: {
		name: 'Борисовичи',
		center: [57.811024, 28.263346],
		shops: [
			{
				id: 1,
				coordinates: [57.811024, 28.263346],
				name: 'Магазин на Балтийской',
			},
		],
	},
	pskov: {
		name: 'Псков',
		center: [57.81574, 28.277553],
		shops: [
			{
				id: 1,
				coordinates: [57.81574, 28.277553],
				name: 'Магазин на Коммунальной',
			},
		],
	},
	pechory: {
		name: 'Печоры',
		center: [57.822717, 27.64802],
		shops: [
			{
				id: 1,
				coordinates: [57.822717, 27.64802],
				name: 'Магазин на Индустриальной',
			},
		],
	},
	izborsk: {
		name: 'Изборск',
		center: [57.705261, 27.867019],
		shops: [
			{
				id: 1,
				coordinates: [57.705261, 27.867019],
				name: 'Изборск',
			},
		],
	},
};
