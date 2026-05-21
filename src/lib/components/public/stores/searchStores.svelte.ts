import '@macfja/svelte-persistent-runes';
import { isStringArray, safePersistOptions } from '$lib/utils/persistentStorage';

export const filtersVisibilityStore = $persist(
	false,
	'filtersVisibility',
	safePersistOptions(false, (value): value is boolean => typeof value === 'boolean')
);

export const activeFiltersStore = $persist<string[]>(
	[],
	'activeFilters',
	safePersistOptions<string[]>([], isStringArray)
);

interface FilterObject {
	filters: Record<string, string>;
}

export const buildFilterObject = () => {
	const filterObject: FilterObject = { filters: {} };

	activeFiltersStore.forEach((filter: string) => {
		const [category, value] = filter.split('-');
		filterObject.filters[category] = value;
	});

	return filterObject;
};
