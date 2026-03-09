<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import Select from 'svelte-select';
	import {
		type RecipesApiPublicGetRecipesData,
		ingredientsApiPublicGetIngredients,
		recipesApiPublicGetCategories
	} from '$lib/api/public-client';
	import { recipesApiPublicGetRecipesOptions } from '$lib/api/public-client/@tanstack/svelte-query.gen';
	import RecipesList from '$lib/components/public/recipes/RecipesList.svelte';
	import { onMount } from 'svelte';

	type SelectItem = { label: string; value: string };
	const PAGE_SIZE = 24;

	let categoryItems = $state<Array<SelectItem>>([]);
	let ingredientItems = $state<Array<SelectItem>>([]);
	let category = $state('');
	let includeIngredients = $state<Array<string>>([]);
	let excludeIngredients = $state<Array<string>>([]);
	let offset = $state(0);

	type RecipesListQuery = Omit<
		NonNullable<RecipesApiPublicGetRecipesData['query']>,
		'include_ingredients' | 'exclude_ingredients' | 'include_ingredient' | 'exclude_ingredient'
	> & {
		include_ingredients?: string;
		exclude_ingredients?: string;
	};

	onMount(async () => {
		try {
			const [categoriesResponse, ingredientsResponse] = await Promise.all([
				recipesApiPublicGetCategories(),
				ingredientsApiPublicGetIngredients()
			]);

			categoryItems = (categoriesResponse.data ?? []).map((item) => ({
				label: item.name,
				value: item.sqid
			}));
			ingredientItems = (ingredientsResponse.data ?? []).map((item) => ({
				label: item.name_singular,
				value: item.sqid
			}));
		} catch (err) {
			console.error('filters load error', err);
		}
	});

	const recipesQuery = createQuery(() => ({
		// API expects plural ingredient filters as comma-separated values.
		// Keep query typing strict by mapping through a local query type.
		...(() => {
			const query: RecipesListQuery = {
				limit: PAGE_SIZE,
				offset,
				categorie: category || undefined,
				include_ingredients:
					includeIngredients.length > 0 ? includeIngredients.join(',') : undefined,
				exclude_ingredients:
					excludeIngredients.length > 0 ? excludeIngredients.join(',') : undefined
			};

			return recipesApiPublicGetRecipesOptions({
				query: query as unknown as NonNullable<RecipesApiPublicGetRecipesData['query']>
			});
		})(),
		placeholderData: (previousData) => previousData
	}));

	function currentPage() {
		return Math.floor(offset / PAGE_SIZE) + 1;
	}

	function totalPages() {
		const count = recipesQuery.data?.count ?? 0;
		return Math.max(1, Math.ceil(count / PAGE_SIZE));
	}

	function hasPreviousPage() {
		return offset > 0;
	}

	function hasNextPage() {
		const count = recipesQuery.data?.count ?? 0;
		return offset + PAGE_SIZE < count;
	}

	function handleCategoryChange(event: CustomEvent<SelectItem | null>) {
		category = event.detail?.value || '';
		offset = 0;
	}

	function handleExcludeIngredientChange(
		event: CustomEvent<SelectItem | Array<SelectItem> | null>
	) {
		const selected = event.detail;
		excludeIngredients = Array.isArray(selected)
			? selected
					.map((item) => item?.value)
					.filter((value): value is string => typeof value === 'string')
			: selected?.value
				? [selected.value]
				: [];
		offset = 0;
	}

	function handleIncludeIngredientChange(
		event: CustomEvent<SelectItem | Array<SelectItem> | null>
	) {
		const selected = event.detail;
		includeIngredients = Array.isArray(selected)
			? selected
					.map((item) => item?.value)
					.filter((value): value is string => typeof value === 'string')
			: selected?.value
				? [selected.value]
				: [];
		offset = 0;
	}

	function clearFilters() {
		category = '';
		includeIngredients = [];
		excludeIngredients = [];
		offset = 0;
	}

	function previousPage() {
		if (hasPreviousPage()) {
			offset = Math.max(0, offset - PAGE_SIZE);
		}
	}

	function nextPage() {
		if (hasNextPage()) {
			offset += PAGE_SIZE;
		}
	}
</script>

<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
	<h1 class="mb-2 text-center text-4xl font-black text-white sm:text-5xl md:text-6xl">HapMap</h1>
	<h2 class="mb-6 text-center text-xl font-semibold text-white sm:text-2xl">
		Alle recepten op een rij
	</h2>

	<div class="mb-6 rounded-xl bg-white p-4 shadow">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<div>
				<label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
					Categorie
				</label>
				<Select
					class="filter-select"
					items={categoryItems}
					value={categoryItems.find((item) => item.value === category) ?? null}
					on:change={handleCategoryChange}
					placeholder="Alle categorieen"
					searchable={true}
					clearable={true}
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
					Ingredient moet erin
				</label>
				<Select
					class="filter-select"
					items={ingredientItems}
					value={ingredientItems.filter((item) => includeIngredients.includes(item.value))}
					on:change={handleIncludeIngredientChange}
					placeholder="Zoek ingredient..."
					searchable={true}
					clearable={true}
					multiple={true}
					closeListOnChange={false}
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
					Ingredient uitsluiten
				</label>
				<Select
					class="filter-select"
					items={ingredientItems}
					value={ingredientItems.filter((item) => excludeIngredients.includes(item.value))}
					on:change={handleExcludeIngredientChange}
					placeholder="Zoek ingredient..."
					searchable={true}
					clearable={true}
					multiple={true}
					closeListOnChange={false}
				/>
			</div>
		</div>
		<div class="mt-3 flex justify-end">
			<button
				type="button"
				class="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
				onclick={clearFilters}
				disabled={!category && includeIngredients.length === 0 && excludeIngredients.length === 0}
			>
				Filters wissen
			</button>
		</div>
	</div>

	<RecipesList
		recipes={recipesQuery.data?.items ?? []}
		isLoading={recipesQuery.isLoading && !recipesQuery.data}
		isError={recipesQuery.isError}
	/>

	<div class="mt-6 flex items-center justify-center gap-3">
		<button
			type="button"
			class="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
			onclick={previousPage}
			disabled={!hasPreviousPage() || recipesQuery.isFetching}
		>
			Vorige
		</button>
		<span class="rounded bg-white px-3 py-2 text-sm font-medium text-slate-700">
			Pagina {currentPage()}
			{#if recipesQuery.data?.count}
				van {totalPages()}
			{/if}
		</span>
		<button
			type="button"
			class="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
			onclick={nextPage}
			disabled={!hasNextPage() || recipesQuery.isFetching}
		>
			Volgende
		</button>
	</div>
</div>
