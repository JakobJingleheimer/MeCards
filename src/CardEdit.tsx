import { nanoid } from 'nanoid/non-secure';
import type { FocusEventHandler, SubmitEventHandler } from 'preact';
import { useLocation, useRoute } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';

import { generateBarcode } from './generate-barcode.ts';
import { data } from './storage/data.ts';
import { media } from './storage/media.ts';

const ENDPOINT = '';
const FORM_ID = 'upsert';

function CardEdit() {
	let id = useRoute().params.id!;
	const [logo, setLogo] = useState<URL['href']>();
	const { path, route } = useLocation();

	const lookupMerchantLogo: FocusEventHandler<HTMLInputElement> = async ({ currentTarget }) => {
		// const result = await fetch(ENDPOINT);
	};

	useEffect(() => {
		if (id === 'new') return;

		caches.match(id);
	}, []);

	const onSubmit: SubmitEventHandler<HTMLFormElement & { elements: {
		label: HTMLInputElement,
		number: HTMLInputElement,
		notes: HTMLInputElement,
	} }> = async (event) => {
		event.preventDefault();

		const {
			label: { value: label },
			number: { value: number },
			notes: { value: notes },
		} = event.currentTarget.elements;

		if (id === 'new') id = nanoid(6);

		data.set(id, {
			label,
			number,
			notes,
		});

		await media.save(
			generateBarcode(number, id),
			'card',
		);

		route('/');
	};

	return (
		<main className="container">
			{/* camera scanner */}
			<form id={FORM_ID} onSubmit={onSubmit}>
				<img src={logo} />

				<label>
					Merchant
					<input
						id="label"
						onBlur={lookupMerchantLogo}
						placeholder="Costco"
						required
						type="text"
					/>
				</label>
				<label>
					Card number
					<input
						id="number"
						placeholder="4 003994 155486"
						required
						type="text"
					/>
				</label>
				<label>
					Notes
					<textarea
						id="notes"
						placeholder="Whatever you want"
					/>
				</label>
			</form>

			<button form={FORM_ID}>Save</button>
		</main>
	);
}

export default CardEdit;
