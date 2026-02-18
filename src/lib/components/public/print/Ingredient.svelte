<script lang="ts">
	import type { RecipeIngredientOutSchema } from '$lib/api/public-client/types.gen';
	import UnitDisplay from '$lib/components/utils/UnitDisplay.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/units';
	import { eatersStore } from '../stores/eatersStore.svelte';
	import AltIngredients from './AltIngredients.svelte';

	interface Props {
		ingredient: RecipeIngredientOutSchema;
	}

	let { ingredient }: Props = $props();

	const hasEatersWithAllergies = $derived(
		eatersStore.getEatersWithAnyAllergy(ingredient.ingredient.allergies) > 0
	);

	const totalQuantity = $derived(
		ingredient.quantity ? eatersStore.calculateTotalQuantity(ingredient.quantity) : 0
	);

	const quantityForNonAllergic = $derived(
		ingredient.quantity
			? eatersStore.calculateQuantityForNonAllergic(
					ingredient.quantity,
					ingredient.ingredient.allergies
				)
			: 0
	);

	const allergyNames = $derived(
		(ingredient.ingredient.allergies ?? []).map((allergy) => allergy.name).join(', ')
	);
</script>

<li class="list-disc">
	<UnitDisplay
		quantity={hasEatersWithAllergies ? quantityForNonAllergic : totalQuantity}
		unit={ingredient.unit ?? null}
	/>
	- {capitalizeFirstLetter(ingredient.ingredient.name_plural)}
	{#if allergyNames}
		(allergenen: {allergyNames})
	{/if}
	<AltIngredients alternatives={ingredient.ingredient_alternatives ?? []} />
</li>
