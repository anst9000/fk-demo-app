<script setup lang="ts" generic="T extends { id: number }">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
    FMessageBox,
    FPaginateDataset,
    FPaginator,
    FSelectField,
    FTable,
    type TableColumn,
} from "@fkui/vue";
import { useResource } from "../composables/useResource";

const props = withDefaults(
    defineProps<{
        /** Loads all items, e.g. from a repository */
        load: () => Promise<T[]>;
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

const pageSizes = [10, 25, 50];
const pageKey = computed(() => `${props.queryPrefix}sida`);
const sizeKey = computed(() => `${props.queryPrefix}rader`);

function readNumber(key: string, fallback: number): number {
    const value = Number(route.query[key]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

function writeQuery(page: number, size: number): void {
    void router.replace({
        query: {
            ...route.query,
            [pageKey.value]: page === 1 ? undefined : String(page),
            [sizeKey.value]: size === pageSizes[0] ? undefined : String(size),
        },
    });
}

/* Page and page size live in the URL, so "back" from a detail page returns to the same page */
const currentPage = computed({
    get: () => readNumber(pageKey.value, 1),
    set: (page: number) => writeQuery(page, itemsPerPage.value),
});

const itemsPerPage = computed({
    get: () => {
        const size = readNumber(sizeKey.value, pageSizes[0]);
        return pageSizes.includes(size) ? size : pageSizes[0];
    },
    set: (size: number) => writeQuery(1, size),
});

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
    const link = target.closest<HTMLAnchorElement>("a[href]") ?? row?.querySelector<HTMLAnchorElement>("a[href]");
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
        <div v-if="data.length > pageSizes[0]" class="page-size">
            <f-select-field v-model.number="itemsPerPage">
                <template #label>Rader per sida</template>
                <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </f-select-field>
        </div>

        <f-paginate-dataset
            v-model="currentPage"
            :items="data"
            :items-per-page="itemsPerPage"
        >
            <template #default="{ items, firstItemIndex, lastItemIndex }">
                <div @click="onTableClick">
                    <f-table
                        :rows="items"
                        :columns
                        key-attribute="id"
                        striped
                        :row-class="() => 'clickable-row'"
                    >
                        <template #caption>
                            <!-- lastItemIndex is exclusive -->
                            Visar {{ firstItemIndex + 1 }}–{{ lastItemIndex }} av
                            {{ data.length }} {{ noun }}
                        </template>
                        <template #empty>Inga {{ noun }} hittades.</template>
                    </f-table>
                </div>
                <f-paginator v-if="data.length > itemsPerPage" />
            </template>
        </f-paginate-dataset>
    </template>
</template>

<style scoped>
.page-size {
    max-width: 12rem;
}
</style>
