/*
 * Search and sort rules shared by the browser-side list and the mock server,
 * so both give the same result for the same search and sort order.
 */

function isSearchable(key: string, value: unknown): value is string | number {
    // ids are internal and would give confusing matches
    if (key === "id" || key.endsWith("Id")) {
        return false;
    }
    return typeof value === "string" || typeof value === "number";
}

/** Lower-cased text of all the row's text and number fields */
export function rowSearchText(row: object): string {
    return Object.entries(row)
        .filter(([key, value]) => isSearchable(key, value))
        .map(([, value]) => String(value).toLowerCase())
        .join(" ");
}

/** Splits a search into lower-cased words; an empty array means "no search" */
export function searchWords(search: string): string[] {
    return search.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Every word must appear somewhere in the row's search text */
export function matchesAllWords(searchText: string, words: string[]): boolean {
    return words.every((word) => searchText.includes(word));
}

/**
 * Compares two rows the same way as FKUI's FSortFilterDataset: text with
 * localeCompare, numbers numerically, descending by reversing the result.
 */
export function compareRows<T>(a: T, b: T, attribute: keyof T, ascending: boolean): number {
    const x = a[attribute];
    const y = b[attribute];
    let order = 0;
    if (typeof x === "number" && typeof y === "number") {
        order = x - y;
    } else {
        order = String(x ?? "").localeCompare(String(y ?? ""));
    }
    return ascending ? order : -order;
}
