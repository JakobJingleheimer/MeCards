import jsbarcode from 'jsbarcode';


export function generateBarcodeFile(
	number: string,
	id: string,
) {
	const xmlDocument = document.implementation.createDocument(
		'http://www.w3.org/1999/xhtml',
		'html',
		null,
	);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	jsbarcode(svg, number, { xmlDocument });

	const contents = (new XMLSerializer()).serializeToString(svg);

	return new File(
		[contents],
		`${id}.svg`,
		{ type: 'image/svg+xml' },
	);
}
