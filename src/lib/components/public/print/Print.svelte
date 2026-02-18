<script lang="ts">
	import type {
		RecipeIngredientOutSchema,
		RecipeNoteOutSchema,
		RecipeStepOutSchema
	} from '$lib/api/public-client/types.gen';
	import SvelteMarkdown from 'svelte-markdown';
	import { eatersStore } from '../stores/eatersStore.svelte';
	import Ingredients from './Ingredients.svelte';

	interface Props {
		title: string;
		description?: string | null;
		ingredients?: RecipeIngredientOutSchema[];
		notes?: RecipeNoteOutSchema[];
		steps?: RecipeStepOutSchema[];
	}

	let { title, description = null, ingredients = [], notes = [], steps = [] }: Props = $props();

	const recipeAllergyNames = $derived(
		Array.from(
			new Set(
				ingredients
					.flatMap((ingredient) => ingredient.ingredient.allergies ?? [])
					.map((allergy) => allergy.name)
			)
		)
	);

	const relevantActiveAllergies = $derived(
		eatersStore.getActiveAllergies().filter((name) => recipeAllergyNames.includes(name))
	);

	const sortedNotes = $derived([...notes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

	const sortedSteps = $derived([...steps].sort((a, b) => a.order - b.order));
</script>

<article class="mx-auto max-w-4xl text-black">
	<header class="border-b border-black pb-4">
		<h1 class="text-3xl font-bold">{title}</h1>
		{#if description}
			<p class="mt-2">{description}</p>
		{/if}
	</header>

	<div class="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
		<section>
			<h2 class="text-xl font-semibold">Ingredienten</h2>
			<Ingredients {ingredients} />
		</section>

		<section>
			<h2 class="text-xl font-semibold">Eters</h2>
			<p class="mt-1">Totaal: {eatersStore.totalEaters}</p>
			{#if relevantActiveAllergies.length > 0}
				<p class="mt-2">Waarvan met allergie:</p>
				<ul class="list-disc pl-5">
					{#each relevantActiveAllergies as allergyName (allergyName)}
						<li>{allergyName}: {eatersStore.getEatersWithAllergy(allergyName)}</li>
					{/each}
				</ul>
			{/if}
			{#if recipeAllergyNames.length > 0}
				<p class="mt-2">Allergenen in dit recept: {recipeAllergyNames.join(', ')}</p>
			{/if}
		</section>
	</div>

	{#if sortedNotes.length > 0}
		<section class="mt-5">
			<h2 class="text-xl font-semibold">Notities</h2>
			<ul class="list-disc pl-5">
				{#each sortedNotes as note (note.sqid)}
					<li>
						{#if note.type}<span class="font-semibold uppercase">{note.type}:</span>
						{/if}
						{note.note}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if sortedSteps.length > 0}
		<section class="mt-5">
			<h2 class="text-xl font-semibold">Bereiding</h2>
			<ol class="list-decimal space-y-2 pl-5">
				{#each sortedSteps as step (step.sqid)}
					<li>
						<div class="prose max-w-none text-black">
							<SvelteMarkdown source={step.instruction} />
						</div>
					</li>
				{/each}
			</ol>
		</section>
	{/if}
</article>
