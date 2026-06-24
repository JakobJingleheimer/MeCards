import { media } from './storage/media.ts';

export async function retrieveMerchantLogo(merchantName: string) {
	if (await media.find(merchantName, 'logo')) return;

	const merchantSlug = composeMerchantSlug(merchantName);

	const entityId = await fetch(`${ENTITIES_SEARCH_ENDPOINT}${encodeURIComponent(merchantName)}`)
		.then(checkRspJson)
		.then(({ results: [entity] }: WikimediaEntitiesSearchResult) => entity?.id);

	if (!entityId) throw new Error('Merchant not found');

	const blob = await fetch(`${ENTITY_META_ENDPOINT}${entityId}.json`)
		.then(checkRspJson)
		.then((entity: WikimediaEntityResult) => {
			const resources = entity.entities[entityId]!.claims;
			const rId = 'P154' in resources
				? 'P154'
				: 'P18' in resources
				? 'P18'
				: '';

			if (rId) return resources[rId]?.at(-1)?.mainsnak.datavalue.value;
		})
		.then((filename) => {
			if (filename) return filename;
			throw new Error(`${merchantName} has no logo`);
		})
		.then((filename) => filename.replaceAll(' ', '_'))
		.then((filename) => fetch(`${MEDIA_ENDPOINT}${filename}`))
		.then(checkRspJson)
		.then((info: WikimediaCommonsResult) => info.original.url)
		.then(fetch)
		.then((rsp) => {
			if (rsp.ok) return rsp.blob();
			throw rsp;
		});

	const logo = new File([blob], `${merchantSlug}.svg`, { type: blob.type });

	const url = await media.save(logo, 'logo');

	return url;
};

const ENTITIES_SEARCH_ENDPOINT = 'https://www.wikidata.org/w/rest.php/wikibase/v1/search/items?language=en&limit=1&q=';
const ENTITY_META_ENDPOINT = 'https://www.wikidata.org/wiki/Special:EntityData/'
const MEDIA_ENDPOINT = 'https://api.wikimedia.org/core/v1/commons/file/File:';

export const composeMerchantSlug = (name: string) => name
	.split(' ')
	.map((piece) => `${piece[0]?.toLocaleUpperCase()}${piece.slice(1).toLocaleLowerCase()}`)
	.join('_');

function checkRspJson(rsp: Response) {
	if (rsp.ok) return rsp.json();
	throw rsp;
}

type WikimediaEntitiesSearchResult = {
	results: {
		id: string,
		'display-label': {
			language: 'en',
			value: string,
		},
		description: {
			language: 'en',
			value: string,
		},
		match: {
			type: 'label',
			language: 'en',
			text: string
		}
	}[],
};

type WikimediaEntityResult = {
  entities: {
		[key: string]: {
			claims: {
				P18?: [WikimediaEntityResource],
				P154?: [WikimediaEntityResource],
			},
		},
	},
};

type WikimediaEntityResource = {
	mainsnak: {
		snaktype: 'value',
		property: 'P154',
		hash: string,
		datavalue: {
			/** `'Albert Heijn Logo.svg'` */
			value: File['name'],
			type: 'string'
		},
		datatype: "commonsMedia"
	},
};

type WikimediaCommonsResult = {
	title: string,
	file_description_url: URL['href'],
	latest: {
		timestamp: ReturnType<Date['toISOString']>,
		user: {
			id: number,
			name: string,
		},
	},
	preferred: WikimediaCommonsMedia,
	original: WikimediaCommonsMedia,
	thumbnail: WikimediaCommonsMedia,
}

type WikimediaCommonsMedia = {
	mediatype: 'DRAWING',
	size: number | null,
	width: number,
	height: number,
	duration: number | null,
	url: URL['href'],
};
