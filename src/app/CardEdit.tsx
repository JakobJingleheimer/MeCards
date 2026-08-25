import XMarkIcon from '@tabler/icons/outline/x.svg';
import { nanoid } from 'nanoid/non-secure';
import type {
	FocusEventHandler,
	GenericEventHandler,
	SubmitEventHandler,
} from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useLocation, useRoute } from 'preact-iso';

import { generateBarcode } from './generate-barcode.ts';
import { data, type CardData } from './storage/data.ts';
import { media } from './storage/media.ts';
import { useToaster } from './toaster/context.tsx';
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
	const [disabled, setDisabled] = useState<boolean>();
	const [logo, setLogo] = useState<URL['href']>();
	const { route } = useLocation();
	const { push } = useToaster();

	const getMerchantLogo: FocusEventHandler<HTMLInputElement> = async ({
		currentTarget: { value: merchantName },
	}) => {
		if (!merchantName) return;

		setDisabled(true);

		const url = await retrieveMerchantLogo(merchantName)
			.catch(() => push({
				kind: 'warning',
				message: `Could not find a logo for “${merchantName}”.`,
			}))
			.finally(() => setDisabled(false));

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

	const handleDelete: GenericEventHandler<HTMLButtonElement> = () => {
		data.delete(id);
		media.remove(`${id}.svg`, 'card');
		route('/');
		push({
			kind: 'primary',
			heading: 'Card deleted',
			message: `${card.label} ${card.barcode}`,
		})
	};

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
						: <button
								className="danger"
								command="show-modal"
								commandFor={CONFIRM_MODAL_ID}
								type="button"
							>Delete</button>
					}

					<button
						className="primary"
						disabled={disabled}
						type="submit"
					>Save</button>
				</div>
			</form>

			<dialog
				closedBy="closerequest"
				id={CONFIRM_MODAL_ID}
			>
				<header className="action-header">
					<h1>Delete this {card.label} card?</h1>

					<button
						aria-label="cancel"
						className="-margin-6xs padding-6xs plain"
						command="request-close"
						commandFor={CONFIRM_MODAL_ID}
					>
						<XMarkIcon />
					</button>
				</header>

				<p>This cannot be undone (you'll need to re-create the card).</p>

				<div className="flex justify-end">
					<button
						className="danger"
						command="request-close"
						commandFor={CONFIRM_MODAL_ID}
						onClick={handleDelete}
					>Yes, delete it</button>
				</div>
			</dialog>
		</main>
	);
}

const CONFIRM_MODAL_ID = 'confirm-delete';
