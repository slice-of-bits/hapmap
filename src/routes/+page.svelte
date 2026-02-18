<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { recipesApiPublicGetRecipesOptions } from '$lib/api/public-client/@tanstack/svelte-query.gen';
	import Search from '$lib/components/public/search/Search.svelte';

	const recipesQuery = createQuery(() => ({
		...recipesApiPublicGetRecipesOptions({ query: { limit: 2, offset: 0 } })
	}));
</script>

<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
	<section
		class="rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 px-4 py-6 text-white shadow-lg sm:px-8 sm:py-10"
	>
		<h1 class="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">HapMap</h1>
		<p class="mt-3 max-w-2xl text-sm text-emerald-50 sm:text-base">
			Zoek snel in alle recepten en vind meteen wat je wilt koken.
		</p>
		<div class="mt-5 rounded-xl bg-white p-2 sm:mt-6 sm:p-3">
			<Search inputClasses="h-11 sm:h-12 text-base" />
		</div>
		<div class="mt-4 flex flex-wrap gap-2 sm:mt-5">
			<a
				href="/recepten"
				class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50"
			>
				Alle recepten bekijken
			</a>
			<a
				href="/over"
				class="rounded-md border border-emerald-100 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Over HapMap
			</a>
		</div>
	</section>

	<div class="mt-6">
		<div class="rounded-xl bg-white p-4 shadow">
			<h2 class="text-2xl font-bold text-slate-800">Nieuw toegevoegd</h2>
			<p class="mt-1 text-sm text-slate-600">De meest recente recepten uit de community.</p>

			{#if recipesQuery.isLoading}
				<p class="mt-4 text-slate-600">Recepten aan het laden...</p>
			{:else if recipesQuery.isError}
				<p class="mt-4 text-red-700">Kon de nieuwste recepten niet laden.</p>
			{:else if !recipesQuery.data?.items?.length}
				<p class="mt-4 text-slate-600">Er zijn nog geen recepten beschikbaar.</p>
			{:else}
				<ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each recipesQuery.data.items as recipe}
						<li class="rounded-lg border border-slate-200 p-3">
							<a
								href={`/recepten/${recipe.name}-${recipe.sqid}`}
								class="text-lg font-semibold text-slate-800 hover:underline"
							>
								{recipe.name}
							</a>
							<p class="mt-1 text-sm text-slate-600">
								{recipe.short_description || 'Geen korte beschrijving beschikbaar.'}
							</p>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
