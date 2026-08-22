import { useMemo } from 'preact/hooks';
import { useRoute } from 'preact-iso';
import NoCard from '@tabler/icons/outline/id-off.svg';

import { composeMerchantSlug } from './merchant-info.ts';
import { data, type CardData, type CardId } from './storage/data.ts';
import { media } from './storage/media.ts';

import styles from './CardList.module.css';

export default function CardList() {
	const { query: { search } } = useRoute();
	const allCards = Array.from(data.getAll());
	const fuzzy = useMemo(() => new RegExp(`.*${search}.*`, 'i'), [search]);
	const cards = allCards
		? allCards
			.filter(({ 1: { label } }) => search ? fuzzy.test(label) : true)
			.sort(({ 1: a }, { 1: b }) => {
				if (a.label < b.label) return -1;
				if (a.label > b.label) return 1;
				return 0;
			})
		: [];

	return (
		<main className="container margin-end-space margin-start-space">
			<section className="callout grid-auto fill primary padding-m">
				{cards?.length
					? cards.map(([id, data]) => (<Card id={id} {...data} />))
					: <NoCards search={search} />
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

const NoCards = ({ search }: { search?: string | undefined }) => (
	<a className="align-center link-subtle stack" href="/card/new">
		<NoCard className="size-6xl" />

		{search
			? <>No card found for “{search}”. Add one!</>
			: <>No cards. Add one!</>
		}
	</a>
)
