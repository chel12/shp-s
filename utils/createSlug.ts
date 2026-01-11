import { transliterate } from './transliterate';

export function createSlug(text: string, id: number): string {
	const transliterated = transliterate(text, false);

	const slug = transliterated
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') //удаляется всё кроме букв и цифр
		.trim() //от пробелов по краям
		.replace(/\s+/g, '-') //от пробелов и дифисов
		.replace(/--+/g, '-') //от 2ных дифисов
		.replace(/^-+|-+$/g, '') //дифисы по краям
		.substring(0, 100); //лимитируем макс 100 символов

	if (!slug) {
		return `${id}`;
	}

	return `${id}-${slug}`; //для канон урл важно
}
