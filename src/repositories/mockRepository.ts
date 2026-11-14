export interface Repository<T extends { id: number }> {
    getAll(): Promise<T[]>;
    /** Resolves to `undefined` when no item has the given id */
    getById(id: number): Promise<T | undefined>;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a repository that behaves like a backend call: the JSON file is
 * loaded lazily and every response is delayed to simulate network latency.
 * Swap it for an HTTP implementation later without touching the components.
 */
export function createMockRepository<T extends { id: number }>(
    load: () => Promise<{ default: unknown }>,
    delayMs = 400,
): Repository<T> {
    async function readAll(): Promise<T[]> {
        const module = await load();
        await delay(delayMs);
        return structuredClone(module.default as T[]);
    }

    return {
        getAll: readAll,
        async getById(id) {
            const items = await readAll();
            return items.find((item) => item.id === id);
        },
    };
}
