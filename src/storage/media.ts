export const media = {
	composeUrl(filename: string, type: MediaType) {
		return `/${MEDIA_TYPE_TO_COLLECTION[type]}/${filename}`;
	},
	async find(filename: File['name'], type: MediaType) {
		const key = type
			? media.composeUrl(filename, type)
			: filename;

		return caches
			.open(CACHE_NAME) // Should this be kept open?
			.then((cache) => cache.match(key))
			.then((rsp) => rsp ? key : undefined);
	},
	async save(file: File, type: MediaType) {
		return caches
			.open(CACHE_NAME) // Should this be kept open?
			.then(async (cache) => {
				const key = media.composeUrl(file.name, type);

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
