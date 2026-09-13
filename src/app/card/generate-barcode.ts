import jsbarcode from 'jsbarcode';

export function generateBarcode(number: string, id: string) {
	const xmlDocument = document.implementation.createDocument(
		'http://www.w3.org/1999/xhtml',
		'html',
		null,
	);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	jsbarcode(svg, number, { xmlDocument });

	const content = (new XMLSerializer()).serializeToString(svg);

	return new File(
		[content],
		`${id}.svg`,
		{ type: 'image/svg+xml' },
	);
}
