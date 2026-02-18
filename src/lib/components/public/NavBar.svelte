<script lang="ts">
	import { tick } from 'svelte';
	import Search from '$lib/components/public/search/Search.svelte';

	let mobileSearchOpen = $state(false);
	let mobileSearch: { focus: () => void } | null = null;

	async function toggleMobileSearch() {
		mobileSearchOpen = !mobileSearchOpen;
		if (mobileSearchOpen) {
			await tick();
			mobileSearch?.focus();
		}
	}
</script>

<nav class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
	<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4">
		<a href="/" class="inline-flex items-center gap-2 font-bold text-slate-800">
			<img src="/logo.png" alt="HapMap Logo" class="h-7 w-7" />
			<span class="hidden text-xl sm:inline">HapMap</span>
		</a>

		<div class="ml-auto flex items-center gap-3 text-sm font-semibold text-slate-700 sm:text-base">
			<a href="/recepten" class="hover:text-slate-900">Recepten</a>
			<a href="/over" class="hover:text-slate-900">Over</a>
		</div>

		<button
			type="button"
			class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 sm:hidden"
			onclick={toggleMobileSearch}
			aria-expanded={mobileSearchOpen}
			aria-label={mobileSearchOpen ? 'Sluit zoeken' : 'Open zoeken'}
		>
			{#if mobileSearchOpen}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.3-4.3"></path>
				</svg>
			{/if}
		</button>

		<div class="hidden w-72 sm:block">
			<Search />
		</div>
	</div>

	{#if mobileSearchOpen}
		<div class="border-t border-slate-200 px-3 pb-3 sm:hidden">
			<Search bind:this={mobileSearch} autofocus={true} inputClasses="h-11 text-base" />
		</div>
	{/if}
</nav>
