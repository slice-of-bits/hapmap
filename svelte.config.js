import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { persistPreprocessor } from "@macfja/svelte-persistent-runes/plugins";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [vitePreprocess(), persistPreprocessor()],
    kit: {adapter: adapter({
        fallback: 'index.html'
    })}
};

export default config;
