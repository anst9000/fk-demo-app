<script setup lang="ts">
import { useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import PaginatedList from "../components/PaginatedList.vue";
import { subsystemRepository } from "../repositories/subsystemRepository";
import type { Subsystem } from "../types/subsystem";

const router = useRouter();

const columns = defineTableColumns<Subsystem>([
    {
        header: "Kod",
        type: "anchor",
        text: (row) => row.code,
        href: (row) => router.resolve({ name: "delsystem-detalj", params: { id: row.id } }).href,
        size: "shrink",
    },
    { header: "Namn", key: "name", type: "text" },
    { header: "Team", key: "team", type: "text", size: "shrink" },
    { header: "Miljö", key: "environment", type: "text", size: "shrink" },
    { header: "Senast driftsatt", key: "lastDeployed", type: "text:date", size: "shrink" },
]);
</script>

<template>
    <h1>Delsystem</h1>
    <p>Klicka på en rad för att se delsystemet.</p>
    <paginated-list list-id="delsystem" :load="subsystemRepository.getAll" :columns noun="delsystem" />
</template>
