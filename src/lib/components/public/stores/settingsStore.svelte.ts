import '@macfja/svelte-persistent-runes';
import { safePersistOptions } from '$lib/utils/persistentStorage';

const RoutingStrategies = ['closest', 'up', 'down', 'nearest', 'none'] as const;

type RoutingStrategy = (typeof RoutingStrategies)[number];

interface Settings {
	rounding_strategy: RoutingStrategy;
	rounding_precision: number;
}

const DefaultSettings: Settings = {
	rounding_strategy: 'closest',
	rounding_precision: 2
};

function isSettings(value: unknown): value is Settings {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		'rounding_strategy' in value &&
		'rounding_precision' in value &&
		typeof value.rounding_strategy === 'string' &&
		RoutingStrategies.includes(value.rounding_strategy as RoutingStrategy) &&
		typeof value.rounding_precision === 'number' &&
		Number.isFinite(value.rounding_precision)
	);
}

export const SettingsStoreSvelte = $persist(
	DefaultSettings,
	'settings',
	safePersistOptions(DefaultSettings, isSettings)
);
