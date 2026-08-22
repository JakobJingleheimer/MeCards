import { nanoid } from 'nanoid/non-secure';
import type {
	FocusEventHandler,
	GenericEventHandler,
	SubmitEventHandler,
} from 'preact';
import { useLocation, useRoute } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';

import { generateBarcode } from './generate-barcode.ts';
import { data, type CardData } from './storage/data.ts';
import { media } from './storage/media.ts';
import { composeMerchantSlug, retrieveMerchantLogo } from './merchant-info.ts';

const FORM_ID = 'upsert';
const ID_NEW = 'new';

export default function CardEdit() {
	let id = useRoute().params.id!;
	const isNew = id === ID_NEW;
	const [card] = useState(
		isNew
		? {} as CardData
		: data.get(id) ?? {} as CardData
	);
	const [logo, setLogo] = useState<URL['href']>();
	const { route } = useLocation();

	const getMerchantLogo: FocusEventHandler<HTMLInputElement> = async ({
		currentTarget: { value: merchantName },
	}) => {
		if (!merchantName) return;

		const url = await retrieveMerchantLogo(merchantName);

		setLogo(url);
	};

	useEffect(() => {
		if (!card.label) return;

		const merchantSlug = composeMerchantSlug(card.label);
		const filename = `${merchantSlug}.svg`;

		media
			.find(filename, 'logo')
			.then((key) => key && setLogo(key));
	}, [card.label]);

	const handleReset: GenericEventHandler<HTMLFormElement> = () => setLogo('');

	const handleSubmit: SubmitEventHandler<HTMLFormElement & { elements: {
		barcode: HTMLInputElement,
		label: HTMLInputElement,
		notes: HTMLInputElement,
	} }> = async (event) => {
		event.preventDefault();

		const {
			label: { value: label },
			notes: { value: notes },
		} = event.currentTarget.elements;
		const barcode = event.currentTarget.elements.barcode.value.replaceAll(/\s+/g, '');

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
			<form
				className="align-center container stack"
				id={FORM_ID}
				onReset={handleReset}
				onSubmit={handleSubmit}
			>
				<img className="size-5xl" src={logo} />

				<img
					alt={card.barcode}
					className="container"
					src={isNew ? '' : media.composeUrl(`${id}.svg`, 'card')}
				/>

				<label>
					Merchant
					<input
						defaultValue={card.label}
						id="label"
						onBlur={getMerchantLogo}
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
					{isNew
						? <button type="reset">Reset</button>
						: <button className="danger" onClick={() => data.delete(id)} type="button">Delete</button>
					}

					<button className="primary" type="submit">Save</button>
				</div>
			</form>
		</main>
	);
}
