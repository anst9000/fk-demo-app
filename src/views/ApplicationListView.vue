<script setup lang="ts">
import { useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import PaginatedList from "../components/PaginatedList.vue";
import { applicationRepository } from "../repositories/applicationRepository";
import type { Application } from "../types/application";

const router = useRouter();

const columns = defineTableColumns<Application>([
    {
        header: "Namn",
        type: "anchor",
        key: "name",
        text: (row) => row.name,
        href: (row) => router.resolve({ name: "applikation", params: { id: row.id } }).href,
    },
    { header: "Förkortning", key: "shortName", type: "text", size: "shrink" },
    { header: "Ägare", key: "owner", type: "text" },
    { header: "Status", key: "status", type: "text", size: "shrink" },
    { header: "Teknik", key: "technology", type: "text", size: "shrink" },
]);
</script>

<template>
    <h1>Applikationer</h1>
    <p>Påhittade applikationer. Klicka på en rad för att se applikationen och dess delsystem.</p>
    <paginated-list list-id="applikationer" :load="applicationRepository.getAll" :columns noun="applikationer" />
</template>
