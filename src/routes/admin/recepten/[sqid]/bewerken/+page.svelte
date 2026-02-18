<script lang="ts">
	import { useQueryClient } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RecipeForm from '$lib/components/admin/recipies/RecipeForm.svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import {
		recipesApiPrivateGetRecipeDetail,
		recipesApiPrivateUpdateRecipe,
		ingredientsApiPrivateGetIngredients,
		recipesApiPrivateListRecipes
	} from '$lib/api/private-client/sdk.gen';
	import type {
		RecipeUpdateInSchema,
		PrivateRecipeOutSchema,
		IngredientOutSchema,
		RecipeCategoryInSchema
	} from '$lib/api/private-client/types.gen';

	let sqid = get(page).params.sqid as string;
	let availableIngredients = $state<IngredientOutSchema[]>([]);
	let availableCategories = $state<RecipeCategoryInSchema[]>([]);
	const queryClient = useQueryClient();

	let currentRecipe = $state<PrivateRecipeOutSchema | undefined>(undefined);

	async function loadRecipeDetail() {
		try {
			const response = await recipesApiPrivateGetRecipeDetail({ path: { sqid } });
			currentRecipe = response.data;
		} catch (error) {
			console.error('Failed to load recipe detail:', error);
		}
	}

	onMount(() => {
		loadRecipeDetail();
		loadIngredients();
		loadCategories();
	});

	async function loadIngredients() {
		try {
			const response = await ingredientsApiPrivateGetIngredients({});
			if (response.data && Array.isArray(response.data)) {
				availableIngredients = response.data;
			}
		} catch (error) {
			console.error('Failed to load ingredients:', error);
		}
	}

	async function loadCategories() {
		try {
			const response = await recipesApiPrivateListRecipes({});
			if (response.data && Array.isArray(response.data)) {
				const uniqueCategories = new Map<string, RecipeCategoryInSchema>();

				for (const recipe of response.data) {
					const category = recipe.category;
					if (!uniqueCategories.has(category.sqid)) {
						uniqueCategories.set(category.sqid, {
							sqid: category.sqid,
							name: category.name
						});
					}
				}

				availableCategories = Array.from(uniqueCategories.values());
			}
		} catch (error) {
			console.error('Failed to load categories:', error);
		}
	}

	async function handleSave(recipe: RecipeUpdateInSchema) {
		try {
			await recipesApiPrivateUpdateRecipe({ path: { sqid }, body: recipe });
			queryClient.invalidateQueries({ queryKey: ['recipes'] });
			queryClient.invalidateQueries({ queryKey: ['recipesApiPrivateListRecipes'] });
			goto('/admin/recepten');
		} catch (error) {
			console.error('Failed to update recipe:', error);
		}
	}

	function handleCancel() {
		goto('/admin/recepten');
	}
</script>

<div class="container mx-auto p-6">
	{#if !currentRecipe}
		<div class="text-center p-8">Laden...</div>
	{:else}
		<RecipeForm
			recipe={currentRecipe}
			{availableIngredients}
			{availableCategories}
			onSave={handleSave}
			onCancel={handleCancel}
		/>
	{/if}
</div>
