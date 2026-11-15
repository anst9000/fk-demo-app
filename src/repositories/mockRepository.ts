import { markRaw } from "vue";
import { compareRows, matchesAllWords, rowSearchText, searchWords } from "../utils/rowSearch";

/** A request for one page of a searched and sorted list */
export interface PageQuery<T> {
    /** Index of the first row to return (0 = the first row) */
    offset: number;
    /** Max number of rows to return */
    limit: number;
    search?: string;
    /** "" or left out: the default order */
    sortAttribute?: keyof T | "";
    ascending?: boolean;
}

export interface PageResult<T> {
    /** The rows on the requested page */
    items: T[];
    /** Number of rows matching the search, on all pages */
    total: number;
}

export interface Repository<T extends { id: number }> {
    getAll(): Promise<T[]>;
    /** Resolves to `undefined` when no item has the given id */
    getById(id: number): Promise<T | undefined>;
    /** Searches, sorts and pages on the "server": only one page is returned */
    query(request: PageQuery<T>): Promise<PageResult<T>>;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * Each response holds fresh shallow copies (the rows are flat), which is much
 * cheaper than structuredClone (~100 ms for 100 000 rows). The copies are
 * marked raw: they are plain read-only data, so Vue does not need to wrap
 * each row in a reactive proxy or walk it in deep watchers. (Rows cannot be
 * frozen, since FTable stores a hidden row id on each of them.)
 */
function copyRows<T extends object>(rows: T[]): T[] {
    return rows.map((row) => markRaw({ ...row }));
}

/**
 * Creates a repository that behaves like a backend call: the data is loaded
 * lazily and every response is delayed to simulate network latency.
 * Swap it for an HTTP implementation later without touching the components.
 */
export function createMockRepository<T extends { id: number }>(
    load: () => Promise<{ default: unknown }>,
    delayMs = 400,
): Repository<T> {
    async function readAll(): Promise<T[]> {
        const module = await load();
        await delay(delayMs);
        return module.default as T[];
    }

    /*
     * "Server side" state for query(). A real backend would use database
     * indexes; here the search text of each row is computed on the first
     * search (not before, since listing without a search does not need it),
     * and the last searched and sorted result is kept, so paging through it
     * is cheap.
     */
    let searchIndex: { rows: T[]; texts: string[] } | undefined;
    let lastResult: { key: string; rows: T[] } | undefined;

    function searchTexts(all: T[]): string[] {
        if (searchIndex?.rows !== all) {
            searchIndex = { rows: all, texts: all.map(rowSearchText) };
        }
        return searchIndex.texts;
    }

    function searchAndSort(all: T[], request: PageQuery<T>): T[] {
        const { search = "", sortAttribute = "", ascending = true } = request;
        const key = JSON.stringify([search, sortAttribute, ascending]);
        if (lastResult?.key === key) {
            return lastResult.rows;
        }
        const words = searchWords(search);
        let rows = all;
        if (words.length > 0) {
            const texts = searchTexts(all);
            rows = all.filter((_row, i) => matchesAllWords(texts[i], words));
        }
        if (sortAttribute !== "") {
            rows = [...rows].sort((a, b) => compareRows(a, b, sortAttribute, ascending));
        }
        lastResult = { key, rows };
        return rows;
    }

    return {
        async getAll() {
            return copyRows(await readAll());
        },
        async getById(id) {
            const item = (await readAll()).find((row) => row.id === id);
            return item && copyRows([item])[0];
        },
        async query(request) {
            const rows = searchAndSort(await readAll(), request);
            return {
                items: copyRows(rows.slice(request.offset, request.offset + request.limit)),
                total: rows.length,
            };
        },
    };
}
