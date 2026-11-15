<script setup lang="ts" generic="T extends { id: number }">
/**
 * A list where all rows are loaded at once and searched, sorted and paged in
 * the browser. See ServerPaginatedList for the version that lets the server
 * do it and only fetches one page at a time.
 */
import { computed, markRaw, watch } from "vue";
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
import { PAGE_SIZES, useListQuery } from "../composables/useListQuery";
import { useResource } from "../composables/useResource";
import { useRowLink } from "../composables/useRowLink";
import { matchesAllWords, rowSearchText, searchWords } from "../utils/rowSearch";

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

const { data, loading, error } = useResource(props.load);

const { options, visibleIds, visibleColumns, showAll } = useColumnVisibility(
    () => props.columns,
    `fk-demo:columns:${props.listId}`,
);

/** Every column with a `key` can be sorted by clicking its header */
const sortableAttributes = computed(() => getTableSortableAttributes(props.columns));

const { currentPage, itemsPerPage, search, searchText, sortAttribute, sortAscending, onSortChanged } =
    useListQuery(props.queryPrefix, sortableAttributes);

const onTableClick = useRowLink();

/* ---------- Filtering ---------- */

/**
 * Lower-cased search text for each row, built once when the data is loaded.
 * Building it on every search took ~50 ms with 10 000 rows; with the index
 * a search takes ~1-2 ms.
 */
const searchIndex = computed<string[]>(() => (data.value ?? []).map(rowSearchText));

/*
 * Build the index when the browser is idle right after loading, instead of
 * on the first search (~50 ms with 100 000 rows).
 */
const whenIdle: (callback: () => void) => void =
    typeof requestIdleCallback === "function"
        ? (callback) => requestIdleCallback(callback, { timeout: 1000 })
        : (callback) => setTimeout(callback, 0);

watch(data, (rows) => {
    if (rows && rows.length > 0) {
        whenIdle(() => void searchIndex.value);
    }
});

/**
 * Filtered on the search in the URL, which is updated 250 ms after the last
 * keystroke. The result is marked raw: FSortFilterDataset deep-watches its
 * data, which otherwise means walking every field of every row on each change.
 */
const filteredData = computed<T[]>(() => {
    const rows = data.value ?? [];
    const words = searchWords(search.value);
    if (words.length === 0) {
        return markRaw(rows);
    }
    const index = searchIndex.value;
    return markRaw(rows.filter((_row, i) => matchesAllWords(index[i], words)));
});

const isFiltered = computed(() => filteredData.value.length !== (data.value?.length ?? 0));
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
        <list-toolbar
            v-model:search="searchText"
            v-model:page-size="itemsPerPage"
            v-model:visible-ids="visibleIds"
            :noun
            :show-page-size="data.length > PAGE_SIZES[0]"
            :options
            @show-all="showAll"
        />

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
            :default-sort-attribute="sortAttribute"
            :default-sort-ascending="sortAscending"
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
                                            ? `Inga ${noun} matchar ”${search}”.`
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
