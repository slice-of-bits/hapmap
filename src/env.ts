import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_API_HOST: { public: true, static: true },
	PUBLIC_AUTH_CLIENT_ID: { public: true, static: true }
});
