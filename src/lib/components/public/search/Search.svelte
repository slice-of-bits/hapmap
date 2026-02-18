<script lang="ts">
	import { onMount } from 'svelte';
	import Select from 'svelte-select';
	import SearchResults from './SearchResults.svelte';
	import {
		type IngredientOutSchema,
		type RecipeCategoryOutSchema,
		type RecipeListOutSchema,
		type RecipesApiPublicSearchRecipesData,
		ingredientsApiPublicGetIngredients,
		recipesApiPublicGetCategories,
		recipesApiPublicSearchRecipes
	} from '$lib/api/public-client';
	import { goto } from '$app/navigation';

	let {
		placeholder = 'Zoek door alle recepten',
		inputClasses = '',
		autofocus = false
	}: {
		placeholder?: string;
		inputClasses?: string;
		autofocus?: boolean;
	} = $props();

	let query = $state('');
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let searchInput: HTMLInputElement;
	let results = $state<Array<RecipeListOutSchema>>([]);
	let selectedIndex = $state(-1);
	let filtersOpen = $state(false);
	let isSearching = $state(false);
	let searchRequestId = 0;

	let categories = $state<Array<RecipeCategoryOutSchema>>([]);
	let ingredients = $state<Array<IngredientOutSchema>>([]);

	let category = $state('');
	let includeIngredient = $state('');
	let excludeIngredient = $state('');

	type SelectItem = { label: string; value: string };
	type SearchQuery = RecipesApiPublicSearchRecipesData['query'];

	export function focus() {
		searchInput?.focus();
	}

	onMount(async () => {
		try {
			const [categoriesResponse, ingredientsResponse] = await Promise.all([
				recipesApiPublicGetCategories(),
				ingredientsApiPublicGetIngredients()
			]);

			categories = categoriesResponse.data ?? [];
			ingredients = ingredientsResponse.data ?? [];
		} catch (err) {
			console.error('filter options error', err);
		}
	});

	$effect(() => {
		if (results && results.length > 0) {
			if (selectedIndex === -1) {
				selectedIndex = 0;
			} else if (selectedIndex >= results.length) {
				selectedIndex = results.length - 1;
			}
		} else if (selectedIndex !== -1) {
			selectedIndex = -1;
		}
	});

	function getRecipeHref(result: RecipeListOutSchema) {
		return `/recepten/${result.name}-${result.sqid}`;
	}

	const categoryItems = $derived(
		categories.map((item) => ({
			label: item.name,
			value: item.sqid
		}))
	);
	const ingredientItems = $derived(
		ingredients.map((item) => ({
			label: item.name_singular,
			value: item.sqid
		}))
	);

	const selectedCategoryItem = $derived(
		categoryItems.find((item: SelectItem) => item.value === category) ?? null
	);
	const selectedIncludeIngredientItem = $derived(
		ingredientItems.find((item: SelectItem) => item.value === includeIngredient) ?? null
	);
	const selectedExcludeIngredientItem = $derived(
		ingredientItems.find((item: SelectItem) => item.value === excludeIngredient) ?? null
	);

	const hasActiveFilters = $derived(!!(category || includeIngredient || excludeIngredient));

	function toggleFilters() {
		filtersOpen = !filtersOpen;
		if (filtersOpen) {
			// Prevent results dropdown from covering the filter panel.
			results = [];
			selectedIndex = -1;
		}
	}

	async function search(text: string) {
		const currentRequestId = ++searchRequestId;

		if (text.length < 2 && !hasActiveFilters) {
			results = [];
			selectedIndex = -1;
			isSearching = false;
			return;
		}

		isSearching = true;

		try {
			const requestQuery: SearchQuery = {
				query: text,
				categorie: category || undefined,
				include_ingredient: includeIngredient || undefined,
				exclude_ingredient: excludeIngredient || undefined
			};

			const { data } = await recipesApiPublicSearchRecipes({ query: requestQuery });
			if (currentRequestId !== searchRequestId) return;
			results = data || [];
			selectedIndex = data && data.length > 0 ? 0 : -1;
		} catch (err) {
			if (currentRequestId !== searchRequestId) return;
			results = [];
			selectedIndex = -1;
			console.error('search error', err);
		} finally {
			if (currentRequestId === searchRequestId) {
				isSearching = false;
			}
		}

		// Clear the timeout if it's already set.
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Set the timeout to execute the umami.trackEvent after 2 seconds.
		timeoutId = setTimeout(() => {
			try {
				// @ts-ignore
				umami.trackEvent('search', {
					query: text,
					results: results?.length ?? 0
				});
			} catch (e) {}
		}, 2000);
	}

	function handleInputChange(e: Event) {
		query = (e.target as HTMLInputElement).value;
		search(query);
	}

	function clearFilters() {
		category = '';
		includeIngredient = '';
		excludeIngredient = '';
		search(query);
	}

	function handleCategoryChange(event: CustomEvent<SelectItem | null>) {
		category = event.detail?.value || '';
		search(query);
	}

	function handleIncludeIngredientChange(event: CustomEvent<SelectItem | null>) {
		includeIngredient = event.detail?.value || '';
		search(query);
	}

	function handleExcludeIngredientChange(event: CustomEvent<SelectItem | null>) {
		excludeIngredient = event.detail?.value || '';
		search(query);
	}

	function handleResultSelect() {
		query = '';
		results = [];
		selectedIndex = -1;
		filtersOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		// Handle Escape even without results
		if (event.key === 'Escape') {
			event.preventDefault();
			handleResultSelect();
			return;
		}

		// For other keys, check if we have results
		if (!results || results.length === 0) {
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % results.length;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = (selectedIndex - 1 + results.length) % results.length;
			return;
		}

		if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			const selected = results[selectedIndex];
			if (selected) {
				const href = getRecipeHref(selected);
				handleResultSelect();
				goto(href);
			}
			return;
		}
	}
</script>

<div class="relative w-full min-w-0">
	<div class="flex items-center gap-2">
		<div class="relative min-w-0 flex-1">
			<input
				class={`block w-full max-w-full min-w-0 rounded border border-slate-300 bg-white pr-9 placeholder:font-medium placeholder:text-slate-500 focus:border-emerald-600 focus:ring-emerald-600 ${inputClasses}`}
				bind:value={query}
				bind:this={searchInput}
				{autofocus}
				{placeholder}
				oninput={handleInputChange}
				onkeydown={handleKeydown}
				autocapitalize="off"
				autocomplete="off"
				spellcheck="false"
			/>
			{#if isSearching}
				<div
					class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500"
				>
					<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"
						></circle>
						<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
						></path>
					</svg>
				</div>
			{/if}
		</div>
		<button
			type="button"
			class="shrink-0 rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			onclick={toggleFilters}
			aria-expanded={filtersOpen}
		>
			Filters
		</button>
	</div>

	{#if filtersOpen}
		<button
			type="button"
			class="fixed inset-0 z-30 cursor-default bg-transparent"
			aria-label="Sluit filters"
			onclick={() => {
				filtersOpen = false;
			}}
		></button>
		<div
			class="absolute right-0 top-full z-40 mt-2 w-[min(95vw,44rem)] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
		>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-700">
						Categorie
					</label>
					<Select
						class="filter-select"
						items={categoryItems}
						value={selectedCategoryItem}
						on:change={handleCategoryChange}
						placeholder="Alle categorieen"
						searchable={true}
						clearable={true}
					/>
				</div>
				<div>
					<label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-700">
						Ingredient moet erin
					</label>
					<Select
						class="filter-select"
						items={ingredientItems}
						value={selectedIncludeIngredientItem}
						on:change={handleIncludeIngredientChange}
						placeholder="Zoek ingredient..."
						searchable={true}
						clearable={true}
					/>
				</div>
				<div>
					<label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-700">
						Ingredient uitsluiten
					</label>
					<Select
						class="filter-select"
						items={ingredientItems}
						value={selectedExcludeIngredientItem}
						on:change={handleExcludeIngredientChange}
						placeholder="Zoek ingredient..."
						searchable={true}
						clearable={true}
					/>
				</div>
			</div>
			<div class="mt-4 flex justify-between">
				<button
					type="button"
					class="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
					onclick={() => {
						filtersOpen = false;
					}}
				>
					Sluiten
				</button>
				<button
					type="button"
					class="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
					onclick={clearFilters}
					disabled={!hasActiveFilters}
				>
					Filters wissen
				</button>
			</div>
		</div>
	{/if}

	{#if !filtersOpen}
		<SearchResults bind:results onSelect={handleResultSelect} {selectedIndex} />
	{/if}
	<!--  <SearchFilters {filters}/-->
</div>
