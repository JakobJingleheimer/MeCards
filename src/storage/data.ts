export const data = {
	get(key: CardId) {
		const val = localStorage.getItem(key);
		return val == null
			? val
			: JSON.parse(val) as CardData;
	},
	* getAll() {
		for (const [key, val] of Object.entries(localStorage)) {
			yield [key, JSON.parse(val)] as [CardId, CardData];
		}
	},
	set(key: CardId, val: CardData) {
		localStorage.setItem(key, JSON.stringify(val));
	},
};

export type CardsCollection = ReturnType<typeof data['getAll']>;
export type CardId = string;
export type CardData = {
	barcode: string,
	label: string,
	notes: string,
};
