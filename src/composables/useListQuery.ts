import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import { type LocationQuery, useRoute, useRouter } from "vue-router";

export const PAGE_SIZES = [10, 25, 50];

/** How long to wait after the last keystroke before searching */
export const SEARCH_DEBOUNCE_MS = 250;

/**
 * The state of a list (page, page size, search and sort order), kept in the
 * URL so "back" from a detail page returns to the same view:
 * ?sida=3&rader=25&sok=anna&sortera=amount&ordning=fallande
 * Default values are left out of the URL.
 *
 * @param prefix - prefix for the query keys, so several lists can share a page
 * @param sortableAttributes - the attributes that may be sorted on
 */
export function useListQuery(prefix: string, sortableAttributes: MaybeRefOrGetter<object>) {
    const route = useRoute();
    const router = useRouter();

    const pageKey = `${prefix}sida`;
    const sizeKey = `${prefix}rader`;
    const searchKey = `${prefix}sok`;
    const sortKey = `${prefix}sortera`;
    const orderKey = `${prefix}ordning`;

    function readNumber(key: string, fallback: number): number {
        const value = Number(route.query[key]);
        return Number.isInteger(value) && value > 0 ? value : fallback;
    }

    /*
     * router.replace() is async, so route.query is stale until it finishes.
     * Quick successive changes (sort, then page) build on the pending query
     * instead, so no change is lost.
     */
    let pendingQuery: LocationQuery | null = null;

    function updateQuery(changes: Record<string, string | undefined>): void {
        const query: LocationQuery = { ...(pendingQuery ?? route.query) };
        for (const [key, value] of Object.entries(changes)) {
            if (value === undefined) {
                delete query[key];
            } else {
                query[key] = value;
            }
        }
        pendingQuery = query;
        void router.replace({ query }).finally(() => {
            if (pendingQuery === query) {
                pendingQuery = null;
            }
        });
    }

    /* ---------- Page and page size ---------- */

    const currentPage = computed({
        get: () => readNumber(pageKey, 1),
        set: (page: number) => updateQuery({ [pageKey]: page === 1 ? undefined : String(page) }),
    });

    const itemsPerPage = computed({
        get: () => {
            const size = readNumber(sizeKey, PAGE_SIZES[0]);
            return PAGE_SIZES.includes(size) ? size : PAGE_SIZES[0];
        },
        set: (size: number) =>
            updateQuery({
                [pageKey]: undefined,
                [sizeKey]: size === PAGE_SIZES[0] ? undefined : String(size),
            }),
    });

    /* ---------- Search ---------- */

    /** The search as stored in the URL: what the list is filtered on */
    const search = computed(() => {
        const value = route.query[searchKey];
        return typeof value === "string" ? value : "";
    });

    /**
     * The text in the search field. It is written to the URL (and so searched
     * for) 250 ms after the last keystroke, so typing a word gives one search
     * instead of one per letter. Clearing the field searches at once.
     */
    const searchText = ref(search.value);
    let searchTimer: ReturnType<typeof setTimeout> | undefined;
    /** The last search this list wrote to the URL */
    let appliedSearch = search.value;

    function applySearch(text: string): void {
        const trimmed = text.trim();
        if (trimmed === search.value) {
            return;
        }
        appliedSearch = trimmed;
        updateQuery({
            [searchKey]: trimmed || undefined,
            [pageKey]: undefined, // a new search starts on page 1
        });
    }

    watch(searchText, (text) => {
        clearTimeout(searchTimer);
        if (text.trim() === "") {
            applySearch("");
        } else {
            searchTimer = setTimeout(() => applySearch(text), SEARCH_DEBOUNCE_MS);
        }
    });

    /*
     * Back/forward to a URL with another search: show it in the field. Our own
     * updates are skipped, so letters typed meanwhile are not overwritten.
     */
    watch(search, (value) => {
        if (value === appliedSearch) {
            return;
        }
        appliedSearch = value;
        clearTimeout(searchTimer);
        searchText.value = value;
    });

    /* ---------- Sort order ---------- */

    /** "" when the list is not sorted */
    const sortAttribute = computed(() => {
        const value = route.query[sortKey];
        return typeof value === "string" && value in toValue(sortableAttributes) ? value : "";
    });
    const sortAscending = computed(() => route.query[orderKey] !== "fallande");

    /** Handler for FSortFilterDataset's `used-sort-attributes` event */
    function onSortChanged(sort: { attribute: string | number | symbol; ascending: boolean }): void {
        const attribute = String(sort.attribute ?? "");
        const unchanged =
            attribute === sortAttribute.value &&
            (attribute === "" || sort.ascending === sortAscending.value);
        if (unchanged) {
            return; // e.g. the order from the URL being applied: keep the current page
        }
        updateQuery({
            [sortKey]: attribute || undefined,
            [orderKey]: attribute && !sort.ascending ? "fallande" : undefined,
            [pageKey]: undefined, // a new sort order starts on page 1
        });
    }

    return {
        currentPage,
        itemsPerPage,
        search,
        searchText,
        sortAttribute,
        sortAscending,
        onSortChanged,
    };
}
