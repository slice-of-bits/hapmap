<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { recipesApiPublicGetRecipeDetailOptions } from '$lib/api/public-client/@tanstack/svelte-query.gen';
	import Print from '$lib/components/public/print/Print.svelte';
	import { eatersStore } from '$lib/components/public/stores/eatersStore.svelte';

	const slug = page.params.slug ?? '';
	const recipeSqid = slug.substring(slug.lastIndexOf('-') + 1);

	const recipeDetailQuery = createQuery(() => ({
		...recipesApiPublicGetRecipeDetailOptions({ path: { sqid: recipeSqid } })
	}));

	let hasTriggeredPrint = false;

	function getValidEaters(value: string | null): number | null {
		if (!value) {
			return null;
		}

		const parsed = Number.parseInt(value, 10);

		if (Number.isNaN(parsed) || parsed < 0) {
			return null;
		}

		return parsed;
	}

	onMount(() => {
		if (!browser) {
			return;
		}

		const eatersFromUrl = getValidEaters(page.url.searchParams.get('eaters'));
		if (eatersFromUrl !== null) {
			eatersStore.totalEaters = eatersFromUrl;
		}

		if (recipeDetailQuery.isSuccess && recipeDetailQuery.data && !hasTriggeredPrint) {
			hasTriggeredPrint = true;
			window.requestAnimationFrame(() => window.print());
		}
	});

	$effect(() => {
		if (!browser || hasTriggeredPrint) {
			return;
		}

		if (recipeDetailQuery.isSuccess && recipeDetailQuery.data) {
			hasTriggeredPrint = true;
			window.requestAnimationFrame(() => window.print());
		}
	});
</script>

<svelte:head>
	<title>Print recept</title>
</svelte:head>

<main class="print-route mx-auto min-h-screen max-w-5xl bg-white px-4 py-6 text-black md:px-8">
	{#if recipeDetailQuery.isLoading}
		<p>Printweergave laden...</p>
	{:else if recipeDetailQuery.isError || !recipeDetailQuery.data}
		<p>Fout bij het laden van het recept.</p>
	{:else}
		<div class="print-actions mb-4 flex justify-end gap-3">
			<a
				href={resolve(`/recepten/${slug}`)}
				class="rounded border border-black px-3 py-1 font-medium text-black hover:bg-slate-100"
			>
				Terug naar recept
			</a>
			<button
				type="button"
				class="cursor-pointer rounded border border-black bg-black px-3 py-1 font-medium text-white hover:bg-slate-800"
				onclick={() => window.print()}
			>
				Print opnieuw
			</button>
		</div>

		<Print
			title={recipeDetailQuery.data.name}
			description={recipeDetailQuery.data.short_description}
			ingredients={recipeDetailQuery.data.ingredients ?? []}
			notes={recipeDetailQuery.data.notes ?? []}
			steps={recipeDetailQuery.data.steps ?? []}
		/>
	{/if}
</main>

<style>
	.print-route {
		font-family: Georgia, 'Times New Roman', serif;
	}

	:global(body) {
		background: #fff;
		color: #000;
	}

	:global(nav) {
		display: none;
	}

	@media print {
		.print-actions {
			display: none;
		}

		.print-route {
			min-height: 0;
			max-width: none;
			padding: 0;
		}

		@page {
			size: auto;
			margin: 14mm;
		}
	}
</style>
