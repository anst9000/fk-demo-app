<script setup lang="ts">
import { useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import PaginatedList from "../components/PaginatedList.vue";
import { caseRepository } from "../repositories/caseRepository";
import type { Case } from "../types/case";

const router = useRouter();

const columns = defineTableColumns<Case>([
    {
        header: "Ärendenummer",
        type: "anchor",
        text: (row) => row.caseNumber,
        href: (row) => router.resolve({ name: "arende", params: { id: row.id } }).href,
        size: "shrink",
    },
    { header: "Namn", key: "name", type: "text" },
    { header: "Förmån", key: "benefit", type: "text" },
    { header: "Status", key: "status", type: "text" },
    { header: "Belopp (kr)", key: "amount", type: "text:currency", size: "shrink" },
    { header: "Inkom", key: "receivedDate", type: "text:date", size: "shrink" },
]);
</script>

<template>
    <h1>Ärenden</h1>
    <p>Klicka på en rad för att öppna ärendet.</p>
    <paginated-list :load="caseRepository.getAll" :columns noun="ärenden" />
</template>
