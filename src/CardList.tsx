import { data } from './storage/data.ts';
import { media } from './storage/media.ts';

function CardList() {
	const cards = Array.from(data.getAll());

	return (
		<main className="container">
			{cards.map(([id, { barcode, label }]) => (
				<figure>
					<img alt={barcode} src={media.composeUrl(`${id}.svg`, 'card')} />
					<figcaption>{label}</figcaption>
				</figure>
			))}
		</main>
	)
}

export default CardList;
