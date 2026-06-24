import { nanoid } from 'nanoid/non-secure';
import type { FocusEventHandler, SubmitEventHandler } from 'preact';
import { useLocation, useRoute } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';

import { generateBarcode } from './generate-barcode.ts';
import { data, type CardData } from './storage/data.ts';
import { media } from './storage/media.ts';

const ENDPOINT = '';
const FORM_ID = 'upsert';
const ID_NEW = 'new';

function CardEdit() {
	let id = useRoute().params.id!;
	const [logo, setLogo] = useState<URL['href']>();
	const [card, setCard] = useState(id === ID_NEW ? {} as CardData : data.get(id));
	const { path, route } = useLocation();

	const lookupMerchantLogo: FocusEventHandler<HTMLInputElement> = async ({ currentTarget }) => {
		// const result = await fetch(ENDPOINT);
	};

	useEffect(() => {
		if (id === ID_NEW) return;

		caches.match(id);
	}, []);

	const onSubmit: SubmitEventHandler<HTMLFormElement & { elements: {
		barcode: HTMLInputElement,
		label: HTMLInputElement,
		notes: HTMLInputElement,
	} }> = async (event) => {
		event.preventDefault();

		const {
			barcode: { value: barcode },
			label: { value: label },
			notes: { value: notes },
		} = event.currentTarget.elements;

		if (id === 'new') id = nanoid(6);

		data.set(id, {
			barcode,
			label,
			notes,
		});

		await media.save(
			generateBarcode(barcode, id),
			'card',
		);

		route('/');
	};

	return (
		<main className="padding-m">
			{/* camera scanner */}
			<form
				className="container stack"
				id={FORM_ID}
				onSubmit={onSubmit}
			>
				<img src={logo} />

				<label>
					Merchant
					<input
						defaultValue={card.label}
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
						defaultValue={card.barcode}
						id="barcode"
						placeholder="4 003994 155486"
						required
						type="text"
					/>
				</label>
				<label>
					Notes
					<textarea
						defaultValue={card.notes}
						id="notes"
						placeholder="Whatever you want"
					/>
				</label>

				<div className="split">
					<button type="reset">Reset</button>

					<button className="primary" type="submit">Save</button>
				</div>
			</form>
		</main>
	);
}

export default CardEdit;
