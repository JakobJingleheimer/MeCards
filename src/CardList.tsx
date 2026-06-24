import { data, type CardData, type CardId } from './storage/data.ts';
import { media } from './storage/media.ts';

export default function CardList() {
	const cards = Array.from(data.getAll());

	return (
		<main className="container margin-end-space margin-start-space">
			<section className="grid-auto fill padding-m">
				{cards
					.sort(({ 1: a }, { 1: b }) => {
						if (a.label < b.label) return -1;
						if (a.label > b.label) return 1;
						return 0;
					})
					.map(([id, data]) => (<Card id={id} {...data} />))
				}
			</section>
		</main>
	)
}

const Card = ({ barcode, label, id }: CardData & { id: CardId }) => (
	<a href={`/edit/${id}`}>
		<figure className="direction-column flex">
				<img alt={barcode} src={media.composeUrl(`${id}.svg`, 'card')} />
			<figcaption>{label}</figcaption>
		</figure>
	</a>
);
