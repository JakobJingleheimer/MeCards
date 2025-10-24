export const data = {
	get(key: string) {
		const val = localStorage.getItem(key);
		return val == null
			? val
			: JSON.parse(val) as CardData;
	},
	* getAll() {
		for (const [key, val] of Object.entries(localStorage)) {
			yield [key, JSON.parse(val)];
		}
	},
	set(key: string, val: CardData) {
		localStorage.setItem(key, JSON.stringify(val));
	},
};

export type CardsCollection = ReturnType<typeof data['getAll']>;
type CardData = {
	number: string,
	label: string,
	notes: string,
};
