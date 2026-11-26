declare module '@dopry/svelte-oidc' {
	import type { SvelteComponent } from 'svelte';
	import type { Readable, Writable } from 'svelte/store';

	export const isAuthenticated: Readable<boolean>;
	export const isLoading: Readable<boolean>;
	export const authError: Writable<unknown>;
	export const accessToken: Readable<string | null>;

	export class OidcContext extends SvelteComponent {}
	export class LoginButton extends SvelteComponent {}
}
