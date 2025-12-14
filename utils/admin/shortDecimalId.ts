//перевод из 16 ричной из БД в 10ричную
export const getShortDecimalId = (id: string): string => {
	if (id.length < 4) return id;
	try {
		const last4Hex = id.slice(-4);
		const decimal = parseInt(last4Hex, 16);
		return decimal.toString();
	} catch {
		return id.slice(-4);
	}
};
