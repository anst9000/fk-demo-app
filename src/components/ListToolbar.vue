<script setup lang="ts">
import { FSearchTextField, FSelectField } from "@fkui/vue";
import ColumnSettings from "./ColumnSettings.vue";
import type { ColumnOption } from "../composables/useColumnVisibility";
import { PAGE_SIZES } from "../composables/useListQuery";

defineProps<{
    /** Word used in the search label, e.g. "ärenden" */
    noun: string;
    showPageSize: boolean;
    options: ColumnOption[];
}>();

const emit = defineEmits<{ showAll: [] }>();

const searchText = defineModel<string>("search", { required: true });
const itemsPerPage = defineModel<number>("pageSize", { required: true });
const visibleIds = defineModel<string[]>("visibleIds", { required: true });
</script>

<template>
    <div class="toolbar">
        <div class="toolbar__search">
            <f-search-text-field v-model="searchText">
                <template #default>Sök bland {{ noun }}</template>
            </f-search-text-field>
        </div>
        <div v-if="showPageSize" class="toolbar__page-size">
            <f-select-field v-model.number="itemsPerPage">
                <template #label>Rader per sida</template>
                <option v-for="size in PAGE_SIZES" :key="size" :value="size">{{ size }}</option>
            </f-select-field>
        </div>
        <div class="toolbar__settings">
            <column-settings v-model="visibleIds" :options @show-all="emit('showAll')" />
        </div>
    </div>
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
