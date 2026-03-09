<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import RecipeForm from '$lib/components/admin/recipies/RecipeForm.svelte';
	import { recipesApiPrivateCreateRecipeMutation } from '$lib/api/private-client/@tanstack/svelte-query.gen';
	import {
		ingredientsApiPrivateGetIngredients,
		recipesApiPrivateListRecipes
	} from '$lib/api/private-client/sdk.gen';
	import type {
		RecipeUpdateInSchema,
		IngredientOutSchema,
		RecipeCategoryInSchema
	} from '$lib/api/private-client/types.gen';

	let availableIngredients = $state<IngredientOutSchema[]>([]);
	let availableCategories = $state<RecipeCategoryInSchema[]>([]);

	const queryClient = useQueryClient();

	// Load ingredients and categories on mount
	$effect(() => {
		loadIngredients();
		loadCategories();
	});

	async function loadIngredients() {
		try {
			const response = await ingredientsApiPrivateGetIngredients();
			if (response.data && Array.isArray(response.data)) {
				availableIngredients = response.data;
			}
		} catch (error) {
			console.error('Failed to load ingredients:', error);
		}
	}

	async function loadCategories() {
		try {
			const response = await recipesApiPrivateListRecipes();
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

	const createMutationObj = createMutation(() => ({
		...recipesApiPrivateCreateRecipeMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['recipes'] });
			goto('/admin/recepten');
		}
	}));

	function handleSave(recipe: RecipeUpdateInSchema) {
		createMutationObj.mutate({ query: { recipe_data: recipe as Record<string, unknown> } });
	}

	function handleCancel() {
		goto('/admin/recepten');
	}
</script>

<div class="container mx-auto p-6">
	<RecipeForm
		{availableIngredients}
		{availableCategories}
		onSave={handleSave}
		onCancel={handleCancel}
	/>
</div>
