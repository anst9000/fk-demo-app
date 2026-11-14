<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import {
    FPaginateDataset,
    FPaginator,
    FSelectField,
    FTable,
    defineTableColumns,
} from "@fkui/vue";
import type { Case } from "../types/case";
import { caseRepository } from "../repositories/caseRepository";

const cases = ref<Case[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const columns = defineTableColumns<Case>([
    { header: "Ärendenummer", key: "caseNumber", type: "text", size: "shrink" },
    { header: "Namn", key: "name", type: "text" },
    { header: "Förmån", key: "benefit", type: "text" },
    { header: "Status", key: "status", type: "text" },
    { header: "Belopp (kr)", key: "amount", type: "text:currency", size: "shrink" },
    { header: "Inkom", key: "receivedDate", type: "text:date", size: "shrink" },
]);

// Go back to the first page when the page size changes
watch(itemsPerPage, () => {
    currentPage.value = 1;
});

onMounted(async () => {
    try {
        cases.value = await caseRepository.getAll();
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <section>
        <h2>Ärenden</h2>

        <p v-if="loading">Hämtar ärenden…</p>
        <p v-else-if="error" class="error">Kunde inte hämta ärenden: {{ error }}</p>

        <template v-else>
            <div class="page-size">
                <f-select-field v-model.number="itemsPerPage">
                    <template #label>Rader per sida</template>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                </f-select-field>
            </div>

            <f-paginate-dataset
                v-model="currentPage"
                :items="cases"
                :items-per-page="itemsPerPage"
            >
                <template #default="{ items, firstItemIndex, lastItemIndex }">
                    <f-table :rows="items" :columns key-attribute="id" striped>
                        <template #caption>
                            <!-- lastItemIndex is exclusive -->
                            Visar {{ firstItemIndex + 1 }}–{{ lastItemIndex }} av
                            {{ cases.length }} ärenden
                        </template>
                        <template #empty>Inga ärenden hittades.</template>
                    </f-table>
                    <f-paginator />
                </template>
            </f-paginate-dataset>
        </template>
    </section>
</template>

<style scoped>
.page-size {
    max-width: 12rem;
}

.error {
    color: var(--f-text-color-error, #b00020);
}
</style>
