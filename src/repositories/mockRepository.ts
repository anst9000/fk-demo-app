import { markRaw } from "vue";

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
    /*
     * Each call returns fresh shallow copies (the rows are flat), which is much
     * cheaper than structuredClone (~100 ms for 100 000 rows). The copies are
     * marked raw: they are plain read-only data, so Vue does not need to wrap
     * each row in a reactive proxy or walk it in deep watchers. (Rows cannot
     * be frozen, since FTable stores a hidden row id on each of them.)
     */
    async function readAll(): Promise<T[]> {
        const module = await load();
        await delay(delayMs);
        return (module.default as T[]).map((item) => markRaw({ ...item }));
    }

    return {
        getAll: readAll,
        async getById(id) {
            const items = await readAll();
            return items.find((item) => item.id === id);
        },
    };
}
