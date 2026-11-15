<script setup lang="ts">
import { RouterLink } from "vue-router";
import PaginatedList from "../components/PaginatedList.vue";
import { caseRepository } from "../repositories/caseRepository";
import { useCaseColumns } from "./caseColumns";

const columns = useCaseColumns();
</script>

<template>
    <h1>Ärenden</h1>
    <p>
        Klicka på en rad för att öppna ärendet. Alla ärenden hämtas på en gång och söks,
        sorteras och delas upp i sidor i webbläsaren.
        <router-link :to="{ name: 'arenden-server' }">Jämför med paginering på servern</router-link>.
    </p>
    <paginated-list list-id="arenden" :load="caseRepository.getAll" :columns noun="ärenden" />
</template>
