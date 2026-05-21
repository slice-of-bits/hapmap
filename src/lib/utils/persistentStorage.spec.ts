import { afterEach, describe, expect, it, vi } from 'vitest';
import { safePersistOptions } from './persistentStorage';

function createStorage(initial: Record<string, string> = {}): Storage {
	const data = new Map(Object.entries(initial));

	return {
		get length() {
			return data.size;
		},
		clear() {
			data.clear();
		},
		getItem(key) {
			return data.get(key) ?? null;
		},
		key(index) {
			return Array.from(data.keys())[index] ?? null;
		},
		removeItem(key) {
			data.delete(key);
		},
		setItem(key, value) {
			data.set(key, value);
		}
	};
}

function stubWindow(localStorage: Storage, sessionStorage: Storage): void {
	vi.stubGlobal('window', {
		localStorage,
		sessionStorage
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('safePersistOptions', () => {
	it('returns parsed storage data when it is valid', () => {
		const options = safePersistOptions({ count: 0 }, (value): value is { count: number } => {
			return typeof value === 'object' && value !== null && 'count' in value;
		});

		const result = options.deserialize?.<{ count: number }>('{"count":4}');

		expect(result).toEqual({ count: 4 });
	});

	it('clears local and session storage when JSON is invalid', () => {
		const localStorage = createStorage({ broken: '{' });
		const sessionStorage = createStorage({ session: 'value' });
		stubWindow(localStorage, sessionStorage);

		const options = safePersistOptions({ count: 0 });
		const result = options.deserialize?.<{ count: number }>('{');

		expect(result).toEqual({ count: 0 });
		expect(localStorage.length).toBe(0);
		expect(sessionStorage.length).toBe(0);
	});

	it('clears local and session storage when the data shape is invalid', () => {
		const localStorage = createStorage({ settings: '{"rounding_precision":"2"}' });
		const sessionStorage = createStorage({ session: 'value' });
		stubWindow(localStorage, sessionStorage);

		const options = safePersistOptions(
			{ rounding_precision: 2 },
			(value): value is { rounding_precision: number } => {
				return (
					typeof value === 'object' &&
					value !== null &&
					'rounding_precision' in value &&
					typeof value.rounding_precision === 'number'
				);
			}
		);
		const result = options.deserialize?.<{ rounding_precision: number }>(
			'{"rounding_precision":"2"}'
		);

		expect(result).toEqual({ rounding_precision: 2 });
		expect(localStorage.length).toBe(0);
		expect(sessionStorage.length).toBe(0);
	});
});
