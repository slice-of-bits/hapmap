import '@macfja/svelte-persistent-runes'

export const filtersVisibilityStore = $persist(false, 'filtersVisibility');


export const activeFiltersStore = $persist<string[]>([],'activeFilters');

export const buildFilterObject = () => {
    const filterObject = { filters: {} };

    activeFiltersStore.forEach((filter: string) => {
        const [category, value] = filter.split('-');
        (filterObject.filters as Record<string, any>)[category] = value;
    });

    return filterObject;
}