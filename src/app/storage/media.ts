export const media = {
	composeUrlPath(filename: string, type: MediaType) {
		return `/${MEDIA_TYPE_TO_COLLECTION[type]}/${filename}`;
	},
	async createTmpUrl(filename: string, type: MediaType, previousUrl?: string) {
		const newKey = this.composeUrlPath(filename, type);
		const cached = await caches
			.open(CACHE_NAME) // Should this be kept open?
			.then((cache) => cache.match(newKey));

		if (!cached) throw new Error(`No cached item for ${newKey}`);

		const tmpUrl = URL.createObjectURL(await cached.blob());
		if (previousUrl) URL.revokeObjectURL(previousUrl);

		return tmpUrl;
	},
	async find(filename: File['name'], type?: MediaType) {
		const key = type
			? this.composeUrlPath(filename, type)
			: filename;

		return caches
			.open(CACHE_NAME) // Should this be kept open?
			.then((cache) => cache.match(key))
			.then((rsp) => rsp ? key : undefined);
	},
	async remove(filename: File['name'], type?: MediaType) {
		const key = type
			? this.composeUrlPath(filename, type)
			: filename;

		return caches
			.open(CACHE_NAME)
			.then((cache) => cache.delete(key));
	},
	async save(file: File, type: MediaType) {
		return caches
			.open(CACHE_NAME) // Should this be kept open?
			.then(async (cache) => {
				const key = this.composeUrlPath(file.name, type);

				await cache.put(
					key,
					new Response(file, {
						headers: {
							'Content-Type': file.type,
						},
					}),
				);
				return key;
		});
	}
};

const CACHE_NAME = 'v1';

const MEDIA_TYPE_TO_COLLECTION = {
	card: 'cards',
	logo: 'logos',
} as const;
type MediaType = keyof typeof MEDIA_TYPE_TO_COLLECTION;
