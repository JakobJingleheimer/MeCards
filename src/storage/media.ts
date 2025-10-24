export const media = {
	composeUrl(filename: string, type: MediaType) {
		return `/${MEDIA_TYPE_TO_COLLECTION[type]}/${filename}`;
	},
	async save(file: File, type: MediaType) {
		return caches
			.open('v1')
			.then((cache) => cache.put(
				media.composeUrl(file.name, type),
				new Response(file, {
					headers: {
						'Content-Type': file.type,
					},
				}),
			));
	}
};

const MEDIA_TYPE_TO_COLLECTION = {
	card: 'cards',
	logo: 'logos',
} as const;
type MediaType = keyof typeof MEDIA_TYPE_TO_COLLECTION;
