<script lang="ts">
	import type { AlternativeOutSchema } from '$lib/api/public-client/types.gen';
	import UnitDisplay from '$lib/components/utils/UnitDisplay.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/units';
	import { eatersStore } from '../stores/eatersStore.svelte';

	interface Props {
		altIngredient: AlternativeOutSchema;
	}

	let { altIngredient }: Props = $props();

	const eatersWithAllergies = $derived(
		eatersStore.getEatersWithAnyAllergy(altIngredient.for_allergies)
	);

	const allergyNames = $derived(
		(altIngredient.for_allergies ?? []).map((allergy) => allergy.name).join(', ')
	);
</script>

{#if eatersWithAllergies > 0}
	<li class="ml-6 list-disc">
		<UnitDisplay
			quantity={altIngredient.quantity * eatersWithAllergies}
			unit={altIngredient.unit ?? null}
		/>
		- {capitalizeFirstLetter(altIngredient.alternative_ingredient.name_plural)}
		{#if allergyNames}
			(voor {allergyNames})
		{/if}
	</li>
{/if}
