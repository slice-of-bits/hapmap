import type { PersistentRunesOptions } from '@macfja/svelte-persistent-runes';

type Validator<T> = (value: unknown) => value is T;

function cloneFallback<T>(fallback: T): T {
	if (typeof structuredClone === 'function') {
		return structuredClone(fallback);
	}

	return JSON.parse(JSON.stringify(fallback)) as T;
}

function clearBrowserStorage(): void {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.localStorage.clear();
	} catch {
		// Ignore storage APIs that are blocked or unavailable.
	}

	try {
		window.sessionStorage.clear();
	} catch {
		// Ignore storage APIs that are blocked or unavailable.
	}
}

export function safePersistOptions<Fallback>(
	fallback: Fallback,
	isValid?: Validator<Fallback>
): Partial<PersistentRunesOptions> {
	return {
		serialize<Value>(value: Value) {
			return JSON.stringify(value);
		},
		deserialize<Value = Fallback>(value: string) {
			try {
				const parsed = JSON.parse(value) as unknown;

				if (isValid && !isValid(parsed)) {
					throw new Error('Stored value does not match the expected shape');
				}

				return parsed as Value;
			} catch {
				clearBrowserStorage();
				return cloneFallback(fallback) as unknown as Value;
			}
		},
		storageRead(key) {
			if (typeof window === 'undefined') {
				return undefined;
			}

			try {
				return window.localStorage.getItem(key) ?? undefined;
			} catch {
				clearBrowserStorage();
				return undefined;
			}
		},
		storageWrite(key, value) {
			if (typeof window === 'undefined') {
				return;
			}

			try {
				window.localStorage.setItem(key, value);
			} catch {
				clearBrowserStorage();
			}
		}
	};
}

export function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
