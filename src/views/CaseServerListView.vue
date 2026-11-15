<script setup lang="ts">
import { RouterLink } from "vue-router";
import ServerPaginatedList from "../components/ServerPaginatedList.vue";
import { caseRepository } from "../repositories/caseRepository";
import { useCaseColumns } from "./caseColumns";

const columns = useCaseColumns();
</script>

<template>
    <h1>Ärenden – paginering på servern</h1>
    <p>
        Samma ärenden, men här söker, sorterar och delar servern upp listan i sidor. Webbläsaren
        hämtar bara raderna på den sida som visas, så varje sidbyte är en ny förfrågan.
        <router-link :to="{ name: 'arenden' }">Tillbaka till paginering i webbläsaren</router-link>.
    </p>
    <server-paginated-list
        list-id="arenden"
        :query="caseRepository.query"
        :columns
        noun="ärenden"
    />
</template>
