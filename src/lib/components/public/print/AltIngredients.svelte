<script lang="ts">
	import type { AlternativeOutSchema } from '$lib/api/public-client/types.gen';
	import AltIngredient from './AltIngredient.svelte';

	interface Props {
		alternatives?: AlternativeOutSchema[];
	}

	let { alternatives = [] }: Props = $props();
</script>

{#if alternatives.length > 0}
	<ul class="mt-1">
		{#each alternatives as altIngredient (altIngredient.sqid)}
			<AltIngredient {altIngredient} />
		{/each}
	</ul>
{/if}
