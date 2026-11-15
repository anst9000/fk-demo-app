<script setup lang="ts" generic="T extends { id: number }">
/**
 * A list where the server searches, sorts and pages: only the rows on the
 * current page are fetched, so the size of the dataset hardly matters.
 *
 * - FPaginateDataset runs in its server mode: it gets the total number of rows
 *   (`items-length`) and a `fetch-data(first, last)` function that it calls on
 *   start and on every page change. FPaginator works as usual.
 * - FPaginateDataset does not refetch when the search, sort order or page size
 *   change, so it is recreated (`:key`) for each new query. The first page of
 *   the new query is fetched before that, since it must know the total.
 * - FSortFilterDataset is kept around the table only for the clickable sort
 *   headers. It sorts the current page in the same way as the server, so it
 *   never changes the order; the sort change is sent on to the server.
 */
import { computed, ref, watch } from "vue";
import {
    FMessageBox,
    FPaginateDataset,
    FPaginator,
    FSortFilterDataset,
    FTable,
    getTableSortableAttributes,
    type TableColumn,
} from "@fkui/vue";
import ListToolbar from "./ListToolbar.vue";
import { useColumnVisibility } from "../composables/useColumnVisibility";
import { useListQuery } from "../composables/useListQuery";
import { useRowLink } from "../composables/useRowLink";
import type { PageQuery, PageResult } from "../repositories/mockRepository";

const props = withDefaults(
    defineProps<{
        /** Unique name of the list, used to remember which columns are shown */
        listId: string;
        /** Fetches one page, e.g. `repository.query` */
        query: (request: PageQuery<T>) => Promise<PageResult<T>>;
        /** The first column should be the link to the detail page */
        columns: Array<TableColumn<T, keyof T>>;
        /** Word used in the caption, e.g. "ärenden" */
        noun: string;
        /** Prefix for the query parameters, so several lists can share a page */
        queryPrefix?: string;
    }>(),
    { queryPrefix: "" },
);

const { options, visibleIds, visibleColumns, showAll } = useColumnVisibility(
    () => props.columns,
    `fk-demo:columns:${props.listId}`,
);

const sortableAttributes = computed(() => getTableSortableAttributes(props.columns));

const { currentPage, itemsPerPage, search, searchText, sortAttribute, sortAscending, onSortChanged } =
    useListQuery(props.queryPrefix, sortableAttributes);

const onTableClick = useRowLink();

/* ---------- Fetching ---------- */

const error = ref<string | null>(null);
/** Number of rows matching the search; null until the first answer */
const total = ref<number | null>(null);
/** True while a request is on its way */
const fetching = ref(false);

/*
 * Answers can arrive out of order (quick page clicks). Every request waits for
 * the newest one, so an old answer never replaces a newer one.
 */
let latest: Promise<PageResult<T>> | undefined;

async function request(first: number, last: number): Promise<PageResult<T>> {
    let current = props.query({
        offset: first,
        limit: Math.max(0, last - first),
        search: search.value,
        sortAttribute: sortAttribute.value as keyof T | "",
        ascending: sortAscending.value,
    });
    latest = current;
    fetching.value = true;
    error.value = null;
    try {
        let result = await current;
        while (latest && latest !== current) {
            current = latest;
            result = await current;
        }
        total.value = result.total;
        return result;
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
        throw e;
    } finally {
        if (latest === current) {
            fetching.value = false;
        }
    }
}

/** Search, sort order and page size: a new query when any of them changes */
const queryKey = computed(() =>
    JSON.stringify([search.value, sortAttribute.value, sortAscending.value, itemsPerPage.value]),
);

/** The query the table shows; FPaginateDataset is recreated when it changes */
const shownKey = ref("");
/** The first page of a new query, fetched before FPaginateDataset is recreated */
let prefetched: { first: number; items: T[] } | undefined;

watch(
    queryKey,
    async (key) => {
        const size = itemsPerPage.value;
        let first = (currentPage.value - 1) * size;
        try {
            let result = await request(first, first + size);
            if (result.total > 0 && first >= result.total) {
                // e.g. ?sida=500 in an old link: show the last page instead
                const lastPage = Math.ceil(result.total / size);
                currentPage.value = lastPage;
                first = (lastPage - 1) * size;
                result = await request(first, first + size);
            }
            if (key !== queryKey.value) {
                return; // the query changed again while waiting
            }
            prefetched = { first, items: result.items };
            shownKey.value = key;
        } catch {
            /* shown via `error` */
        }
    },
    { immediate: true },
);

/** The rows FPaginateDataset shows now */
let shownItems: T[] = [];

/** Called by FPaginateDataset with the index range of the page to show */
async function fetchPage(first: number, last: number): Promise<T[]> {
    if (queryKey.value !== shownKey.value) {
        // A new query is on its way and this FPaginateDataset is about to be
        // replaced; it only reacts to the reset to page 1. Keep its rows.
        return shownItems;
    }
    if (prefetched?.first === first) {
        shownItems = prefetched.items;
        prefetched = undefined;
        return shownItems;
    }
    try {
        shownItems = (await request(first, last)).items;
    } catch {
        shownItems = [];
    }
    return shownItems;
}
</script>

<template>
    <f-message-box v-if="error" type="error">
        <template #default="{ headingSlotClass }">
            <h3 :class="headingSlotClass">Kunde inte hämta {{ noun }}</h3>
            <p>{{ error }}</p>
        </template>
    </f-message-box>

    <list-toolbar
        v-model:search="searchText"
        v-model:page-size="itemsPerPage"
        v-model:visible-ids="visibleIds"
        :noun
        :show-page-size="true"
        :options
        @show-all="showAll"
    />

    <p v-if="total === null && !error">Hämtar {{ noun }}…</p>

    <f-paginate-dataset
        v-else-if="total !== null"
        :key="shownKey"
        v-model="currentPage"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :fetch-data="fetchPage"
    >
        <template #default="{ items, firstItemIndex, lastItemIndex }">
            <div
                class="server-list__table"
                :class="{ 'server-list__table--busy': fetching }"
                :aria-busy="fetching"
                @click="onTableClick"
            >
                <f-sort-filter-dataset
                    :data="items as T[]"
                    :sortable-attributes="sortableAttributes"
                    :show-filter="false"
                    :show-sort="false"
                    :default-sort-attribute="sortAttribute"
                    :default-sort-ascending="sortAscending"
                    @used-sort-attributes="onSortChanged"
                >
                    <template #default="{ sortFilterResult }">
                        <f-table
                            :rows="sortFilterResult"
                            :columns="visibleColumns"
                            key-attribute="id"
                            striped
                            :row-class="() => 'clickable-row'"
                        >
                            <template #caption>
                                <span aria-live="polite">
                                    <template v-if="total === 0">
                                        Inga {{ noun }} matchar ”{{ search }}”
                                    </template>
                                    <template v-else>
                                        <!-- lastItemIndex is exclusive -->
                                        Visar {{ firstItemIndex + 1 }}–{{ lastItemIndex }} av
                                        {{ total }} {{ noun }}
                                        <template v-if="search">som matchar ”{{ search }}”</template>
                                    </template>
                                </span>
                                <span v-if="fetching" class="server-list__fetching">Hämtar…</span>
                            </template>
                            <template #empty>
                                {{ search ? `Inga ${noun} matchar ”${search}”.` : `Inga ${noun} hittades.` }}
                            </template>
                        </f-table>
                    </template>
                </f-sort-filter-dataset>
            </div>
            <f-paginator v-if="total > itemsPerPage" />
        </template>
    </f-paginate-dataset>
</template>

<style scoped>
.server-list__table--busy {
    opacity: 0.6;
    transition: opacity 0.2s 0.15s; /* only dims if the answer takes a while */
}

.server-list__fetching {
    margin-left: 1rem;
    font-weight: normal;
}
</style>
