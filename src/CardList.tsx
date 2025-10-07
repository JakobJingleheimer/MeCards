import { useEffect, useState } from 'preact/hooks';

import type { CardsData } from './Card.d.ts';

function CardList() {
	const [list, setList] = useState<CardsData>();

	useEffect(() => {
		setList({ ...localStorage });
	}, []);

	if (!list) return <main>Loading…</main>;

	return (
		<main>
			{Object.entries(list).map(([id, { barcode, label }]) => (
				<figure>
					<img alt={barcode} src={`/cards/${id}`} />
					<figcaption>{label}</figcaption>
				</figure>
			))}
		</main>
	)
}

export default CardList;
