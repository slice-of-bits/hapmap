import type { PagedRecipeListOutSchema, RecipeListOutSchema } from './public-client';
import { recipesApiPublicGetRecipesOptions } from './public-client/@tanstack/svelte-query.gen';

export function recipesListOptions(
	options?: Parameters<typeof recipesApiPublicGetRecipesOptions>[0]
) {
	return {
		...recipesApiPublicGetRecipesOptions(options),
		select: (data: PagedRecipeListOutSchema | RecipeListOutSchema[]): PagedRecipeListOutSchema => {
			// Older API deployments return the full list and ignore limit/offset.
			if (Array.isArray(data)) {
				const offset = options?.query?.offset ?? 0;
				const limit = options?.query?.limit ?? data.length;
				return { items: data.slice(offset, offset + limit), count: data.length };
			}

			return data;
		}
	};
}
