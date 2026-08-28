import debounce from 'lodash.debounce';
import type { ChangeEvent } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useLocation } from 'preact-iso';

import Info from '@tabler/icons/outline/info-circle.svg';
import SearchList from '@tabler/icons/outline/list-search.svg';
import Scan from '@tabler/icons/outline/scan.svg';
import Wallet from '@tabler/icons/outline/wallet.svg';

export function Footer() {
	const { path, query: { search }, route } = useLocation();

	const handleSearch = useMemo(
		() => debounce(
			({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => route(`/?search=${value}`),
			300,
		),
		[],
	);

	return (
		<footer className="flex gap-m justify-center padding-4xs">
			<a className="flex-inline" href="/about">
				<Info className="size-5xl" />
			</a>

			{path === '/' && (
				<label className="flex gap-m">
					<SearchList aria-label="search cards" className="size-5xl" />

					<input
						className="margin-start-0"
						defaultValue={search}
						name="search-cards"
						onChange={handleSearch}
						type="search"
					/>
				</label>
			)}

			<a className="flex-inline" href="/">
				<Wallet className="size-5xl" />
			</a>

			<a className="flex-inline" href="/card/new">
				<Scan className="size-5xl" />
			</a>
		</footer>
	);
}
