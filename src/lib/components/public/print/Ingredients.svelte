<script lang="ts">
	import type { RecipeIngredientOutSchema } from '$lib/api/public-client/types.gen';
	import Ingredient from './Ingredient.svelte';

	interface Props {
		ingredients?: RecipeIngredientOutSchema[];
	}

	let { ingredients = [] }: Props = $props();
</script>

{#if ingredients.length > 0}
	<ul class="space-y-1 pl-5">
		{#each ingredients as ingredient (ingredient.sqid)}
			<Ingredient {ingredient} />
		{/each}
	</ul>
{:else}
	<p>Geen ingredienten gevonden.</p>
{/if}
