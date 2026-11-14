<script setup lang="ts" generic="T extends { id: number }">
import { computed, ref, watch } from "vue";
import { type LocationQuery, useRoute, useRouter } from "vue-router";
import {
    FMessageBox,
    FPaginateDataset,
    FPaginator,
    FSearchTextField,
    FSelectField,
    FSortFilterDataset,
    FTable,
    getTableSortableAttributes,
    type TableColumn,
} from "@fkui/vue";
import ColumnSettings from "./ColumnSettings.vue";
import { useColumnVisibility } from "../composables/useColumnVisibility";
import { useResource } from "../composables/useResource";

const props = withDefaults(
    defineProps<{
        /** Unique name of the list, used to remember which columns are shown */
        listId: string;
        /** Loads all items, e.g. from a repository */
        load: () => Promise<T[]>;
        /** The first column should be the link to the detail page */
        columns: Array<TableColumn<T, keyof T>>;
        /** Word used in the caption, e.g. "ärenden" */
        noun: string;
        /** Prefix for the query parameters, so several lists can share a page */
        queryPrefix?: string;
    }>(),
    { queryPrefix: "" },
);

const route = useRoute();
const router = useRouter();
const { data, loading, error } = useResource(props.load);

/* ---------- Column visibility ---------- */

const { options, visibleIds, visibleColumns, showAll } = useColumnVisibility(
    () => props.columns,
    `fk-demo:columns:${props.listId}`,
);

/* ---------- URL state: page, page size and search ---------- */

const pageSizes = [10, 25, 50];
const pageKey = computed(() => `${props.queryPrefix}sida`);
const sizeKey = computed(() => `${props.queryPrefix}rader`);
const searchKey = computed(() => `${props.queryPrefix}sok`);

function readNumber(key: string, fallback: number): number {
    const value = Number(route.query[key]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

/*
 * router.replace() is async, so route.query is stale until it finishes. Quick
 * successive changes (sort, then page) build on the pending query instead, so
 * no change is lost.
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

/* Page, page size and search live in the URL, so "back" from a detail page returns to the same view */
const currentPage = computed({
    get: () => readNumber(pageKey.value, 1),
    set: (page: number) => updateQuery({ [pageKey.value]: page === 1 ? undefined : String(page) }),
});

const itemsPerPage = computed({
    get: () => {
        const size = readNumber(sizeKey.value, pageSizes[0]);
        return pageSizes.includes(size) ? size : pageSizes[0];
    },
    set: (size: number) =>
        updateQuery({
            [pageKey.value]: undefined,
            [sizeKey.value]: size === pageSizes[0] ? undefined : String(size),
        }),
});

/* The search text is kept locally while typing and written to the URL shortly after */
const searchText = ref(String(route.query[searchKey.value] ?? ""));
let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(searchText, (text) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        updateQuery({
            [searchKey.value]: text.trim() || undefined,
            [pageKey.value]: undefined, // a new search starts on page 1
        });
    }, 250);
});

/* ---------- Filtering ---------- */

function isSearchable(key: string, value: unknown): value is string | number {
    // ids are internal and would give confusing matches
    if (key === "id" || key.endsWith("Id")) {
        return false;
    }
    return typeof value === "string" || typeof value === "number";
}

/**
 * Lower-cased search text for each row, built once when the data is loaded.
 * Building it on every keystroke took ~50 ms with 10 000 rows; with the index
 * a keystroke takes ~1-2 ms.
 */
const searchIndex = computed<string[]>(() =>
    (data.value ?? []).map((row) =>
        Object.entries(row)
            .filter(([key, value]) => isSearchable(key, value))
            .map(([, value]) => String(value).toLowerCase())
            .join(" "),
    ),
);

/** Every word must appear in at least one of the row's text or number fields */
const filteredData = computed<T[]>(() => {
    const rows = data.value ?? [];
    const words = searchText.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
        return rows;
    }
    const index = searchIndex.value;
    return rows.filter((_row, i) => words.every((word) => index[i].includes(word)));
});

const isFiltered = computed(() => filteredData.value.length !== (data.value?.length ?? 0));

/* ---------- Sorting ---------- */

/** Every column with a `key` can be sorted by clicking its header */
const sortableAttributes = computed(() => getTableSortableAttributes(props.columns));

/*
 * The sort order is kept in the URL as ?sortera=<key>&ordning=fallande
 * (ascending is the default and is left out). FSortFilterDataset reads the
 * starting order from the URL once, when it is created.
 */
const sortKey = computed(() => `${props.queryPrefix}sortera`);
const orderKey = computed(() => `${props.queryPrefix}ordning`);

const urlSortAttribute = computed(() => {
    const value = route.query[sortKey.value];
    return typeof value === "string" && value in sortableAttributes.value ? value : "";
});
const urlSortAscending = computed(() => route.query[orderKey.value] !== "fallande");

function onSortChanged(sort: { attribute: string | number | symbol; ascending: boolean }): void {
    const attribute = String(sort.attribute ?? "");
    const unchanged =
        attribute === urlSortAttribute.value &&
        (attribute === "" || sort.ascending === urlSortAscending.value);
    if (unchanged) {
        return; // e.g. the order from the URL being applied: keep the current page
    }
    updateQuery({
        [sortKey.value]: attribute || undefined,
        [orderKey.value]: attribute && !sort.ascending ? "fallande" : undefined,
        [pageKey.value]: undefined, // a new sort order starts on page 1
    });
}

/* ---------- Row click ---------- */

/**
 * Each row has a link (anchor column) to its detail page. Clicking anywhere on
 * the row follows that link, and the link itself is handled by the router
 * instead of reloading the whole page.
 */
function onTableClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0) {
        return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return; // let the browser open the link in a new tab/window
    }
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea")) {
        return;
    }
    const row = target.closest("tbody tr");
    const link =
        target.closest<HTMLAnchorElement>("a[href]") ??
        row?.querySelector<HTMLAnchorElement>("a[href]");
    const href = link?.getAttribute("href");
    if (!href || !href.startsWith("/")) {
        return;
    }
    event.preventDefault();
    void router.push(href);
}
</script>

<template>
    <p v-if="loading">Hämtar {{ noun }}…</p>
    <f-message-box v-else-if="error" type="error">
        <template #default="{ headingSlotClass }">
            <h3 :class="headingSlotClass">Kunde inte hämta {{ noun }}</h3>
            <p>{{ error }}</p>
        </template>
    </f-message-box>

    <template v-else-if="data">
        <div class="toolbar">
            <div class="toolbar__search">
                <f-search-text-field v-model="searchText">
                    <template #default>Sök bland {{ noun }}</template>
                </f-search-text-field>
            </div>
            <div v-if="data.length > pageSizes[0]" class="toolbar__page-size">
                <f-select-field v-model.number="itemsPerPage">
                    <template #label>Rader per sida</template>
                    <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
                </f-select-field>
            </div>
            <div class="toolbar__settings">
                <column-settings v-model="visibleIds" :options @show-all="showAll" />
            </div>
        </div>

        <!--
            FSortFilterDataset makes the column headers sortable (FTable talks to it
            via provide/inject). Its own search and sort dropdown are turned off since
            the toolbar above already has a search field.
        -->
        <f-sort-filter-dataset
            :data="filteredData"
            :sortable-attributes="sortableAttributes"
            :show-filter="false"
            :show-sort="false"
            :default-sort-attribute="urlSortAttribute"
            :default-sort-ascending="urlSortAscending"
            @used-sort-attributes="onSortChanged"
        >
            <template #default="{ sortFilterResult }">
                <f-paginate-dataset
                    v-model="currentPage"
                    :items="sortFilterResult"
                    :items-per-page="itemsPerPage"
                >
                    <template #default="{ items, firstItemIndex, lastItemIndex }">
                        <div @click="onTableClick">
                            <f-table
                                :rows="items"
                                :columns="visibleColumns"
                                key-attribute="id"
                                striped
                                :row-class="() => 'clickable-row'"
                            >
                                <template #caption>
                                    <span aria-live="polite">
                                        <template v-if="filteredData.length === 0">
                                            Inga träffar bland {{ data.length }} {{ noun }}
                                        </template>
                                        <template v-else>
                                            <!-- lastItemIndex is exclusive -->
                                            Visar {{ firstItemIndex + 1 }}–{{ lastItemIndex }} av
                                            {{ filteredData.length }} {{ noun }}
                                            <template v-if="isFiltered">
                                                (filtrerat från {{ data.length }})
                                            </template>
                                        </template>
                                    </span>
                                </template>
                                <template #empty>
                                    {{
                                        isFiltered
                                            ? `Inga ${noun} matchar ”${searchText.trim()}”.`
                                            : `Inga ${noun} hittades.`
                                    }}
                                </template>
                            </f-table>
                        </div>
                        <f-paginator v-if="filteredData.length > itemsPerPage" />
                    </template>
                </f-paginate-dataset>
            </template>
        </f-sort-filter-dataset>
    </template>
</template>

<style scoped>
.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0 1.5rem;
}

.toolbar__search {
    flex: 1 1 18rem;
    max-width: 28rem;
}

.toolbar__page-size {
    flex: 0 0 10rem;
}

.toolbar__settings {
    margin-left: auto;
    margin-bottom: 1.5rem;
}
</style>
