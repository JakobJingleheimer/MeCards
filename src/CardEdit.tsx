import type { FocusEventHandler } from 'preact';
import { useRoute } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';

const ENDPOINT = '';

function CardEdit() {
	const id = useRoute().params.id!;
	const [logo, setLogo] = useState<URL['href']>();

	const lookupMerchantLogo: FocusEventHandler<HTMLInputElement> = async ({ currentTarget }) => {
		// const result = await fetch(ENDPOINT);
	};

	useEffect(() => {
		if (id === 'new') return;

		caches.match(id);
	}, []);

	return (
		<>
			{/* camera scanner */}
			<form>
				<img src={logo} />

				<input
					name="merchant"
					onBlur={lookupMerchantLogo}
					placeholder="Costco"
					required
					type="text"
				/>
				<input
					name="card-number"
					placeholder="Costco"
					required
					type="text"
				/>
			</form>
		</>
	);
}

export default CardEdit;
