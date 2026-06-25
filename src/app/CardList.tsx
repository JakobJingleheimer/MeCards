import { composeMerchantSlug } from './merchant-info.ts';
import { data, type CardData, type CardId } from './storage/data.ts';
import { media } from './storage/media.ts';

import styles from './CardList.module.css';

export default function CardList() {
	const cards = Array.from(data.getAll());

	return (
		<main className="container margin-end-space margin-start-space">
			<section className="callout grid-auto fill primary padding-m">
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

const Card = ({ label, id }: CardData & { id: CardId }) => (
	<a className="callout neutral" href={`/card/${id}`}>
		<figure className="align-center direction-column flex">
			<img className={styles.CardListIcon} src={media.composeUrl(`${composeMerchantSlug(label)}.svg`, 'logo')} />

			<figcaption>{label}</figcaption>
		</figure>
	</a>
);
