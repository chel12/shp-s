export const optimizeCameraPhoto = (
	canvas: HTMLCanvasElement,
	quality: number = 0.8,
	maxSize: number = 128,
	userId: string
): Promise<File> => {
	return new Promise((resolve, reject) => {
		//временный канвас для ресайза предотвращает мутирование исходника
		const tempCanvas = document.createElement('canvas');
		//получает апи для рисования
		const ctx = tempCanvas.getContext('2d');
		//проверка браузера на канвас
		if (!ctx) {
			reject(new Error('Canvas context not available'));
			return;
		}
		//сохрн исход размеры
		let width = canvas.width;
		let height = canvas.height;
		//проверка нужно ли масштабирование
		if (width > maxSize || height > maxSize) {
			const ratio = Math.min(maxSize / width, maxSize / height);
			width = Math.round(width * ratio);
			height = Math.round(height * ratio);
		}
		//устанавливаем для временного
		tempCanvas.width = width;
		tempCanvas.height = height;
		//улучщаем сглаживание
		ctx.imageSmoothingQuality = 'high';
		//ресайз с учетом сглаживания и настроек
		ctx.drawImage(canvas, 0, 0, width, height);
		//конвертация канвас в бинарку которую можно хранить в БД
		tempCanvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(
						new File([blob], `avatar-${userId}-${Date.now()}.jpg`, {
							type: 'image/jpeg',
						})
					);
				} else {
					reject(new Error('Failed to create blob'));
				}
			}, //все захваченное в джипек с высок качеством
			'image/jpeg',
			quality
		);
	});
};
