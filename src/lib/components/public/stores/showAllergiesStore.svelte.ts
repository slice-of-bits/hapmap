import '@macfja/svelte-persistent-runes';
import { safePersistOptions } from '$lib/utils/persistentStorage';

export const showAllergiesStoreSvelte = $persist(
	false,
	'showAllergies',
	safePersistOptions(false, (value): value is boolean => typeof value === 'boolean')
);
