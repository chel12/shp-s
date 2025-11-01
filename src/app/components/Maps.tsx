'use client';
import { locations } from '@/data/locations';
import { Map, YMaps, Placemark } from '@pbe/react-yandex-maps';
import { useState } from 'react';

const Maps = () => {
	const [currentLocation, setCurrentLocation] = useState('borisovichi');
	const currentLocationData = locations[currentLocation];
	return (
		<YMaps
			query={{
				lang: 'ru_RU',
				apikey: '2beaa41f-97d6-4fab-abbb-12b567abf131',
			}}>
			<section>
				<div className="flex flex-col justify-center xl:max-w-[1208px]">
					<h2 className="mb-4 md:mb-8 xl:mb-10 text-2xl xl:text-4xl text-left font-bold">
						Наши магазины
					</h2>
					<div className="flex flex-wrap gap-x-2 gap-y-3 mb-5">
						{Object.keys(locations).map((key) => {
							const isActive = currentLocation === key;
							return (
								<button
									key={key}
									onClick={() => setCurrentLocation(key)}
									className={`p-2 text-xs justify-center items-center active:shadow-(--shadow-button-active) border-none rounded cursor-pointer transition-colors duration-300 ${
										isActive
											? 'bg-(--color-primary) text-white hover: shadow-(--shadow-button-default)'
											: 'bg-[#f3f2f1] hover:shadow-(--shadow-button-secondary)'
									}`}>
									{locations[key].name}
								</button>
							);
						})}
					</div>
					<Map
						defaultState={{
							center: currentLocationData.center,
							zoom: 16,
						}}
						state={{
							center: currentLocationData.center,
							zoom: 16,
						}}
						width="100%"
						height="354px"
						className="no-ymaps-copyright w-full h-[354px]">
						{' '}
						{locations[currentLocation].shops.map((shop) => (
							<Placemark
								key={shop.id}
								geometry={shop.coordinates}
								properties={{ hintContent: shop.name }}
								options={{
									iconLayout: 'default#image',
									iconImageHref:
										'/icons-map/icon-location.svg',
									iconImageSize: [32, 32],
									iconOffset: [-4, -4],
								}}
							/>
						))}
					</Map>
				</div>
			</section>
		</YMaps>
	);
};

export default Maps;
