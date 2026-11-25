<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';

	import { recipesListOptions } from '$lib/api/recipes';
	import RecipesList from '$lib/components/public/recipes/RecipesList.svelte';

	// get the sqid from the slug by splitting on the last -
	const username: string = page.params.slug ?? '';

	let recipesQuery = createQuery(() => ({
		...recipesListOptions({ query: { created_by: username } })
	}));
</script>

<RecipesList
	recipes={recipesQuery.data?.items ?? []}
	isLoading={recipesQuery.isLoading && !recipesQuery.data}
	isError={recipesQuery.isError}
/>
