<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { FBadge, FDefinitionList, defineTableColumns } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import PaginatedList from "../components/PaginatedList.vue";
import { useResource } from "../composables/useResource";
import { applicationStatusBadge } from "../composables/formatters";
import { applicationRepository } from "../repositories/applicationRepository";
import { subsystemRepository } from "../repositories/subsystemRepository";
import type { Subsystem } from "../types/subsystem";

const props = defineProps<{ id: number }>();
const router = useRouter();

const { data: item, loading, error } = useResource(
    () => applicationRepository.getById(props.id),
    () => props.id,
);

const definitions = computed(() =>
    item.value
        ? [
              { term: "Förkortning", definition: item.value.shortName },
              { term: "Ägare", definition: item.value.owner },
              { term: "Teknik", definition: item.value.technology },
              { term: "I drift sedan", definition: item.value.launched },
          ]
        : [],
);

const subsystemColumns = defineTableColumns<Subsystem>([
    {
        header: "Kod",
        type: "anchor",
        key: "code",
        text: (row) => row.code,
        href: (row) => router.resolve({ name: "delsystem-detalj", params: { id: row.id } }).href,
        size: "shrink",
    },
    { header: "Namn", key: "name", type: "text" },
    { header: "Team", key: "team", type: "text", size: "shrink" },
    { header: "Miljö", key: "environment", type: "text", size: "shrink" },
    { header: "Version", key: "version", type: "text", size: "shrink" },
]);
</script>

<template>
    <detail-page
        :loading
        :error
        :not-found="!item"
        :back-to="{ name: 'applikationer' }"
        back-label="Alla applikationer"
    >
        <template v-if="item">
            <h1>{{ item.name }}</h1>
            <p>
                Status:
                <f-badge :status="applicationStatusBadge(item.status)">{{ item.status }}</f-badge>
            </p>
            <p>{{ item.description }}</p>
            <f-definition-list :definitions />

            <h2>Delsystem</h2>
            <!-- key: reload the list when navigating to another application -->
            <paginated-list
                :key="item.id"
                list-id="applikation-delsystem"
                :load="() => subsystemRepository.getByApplicationId(item!.id)"
                :columns="subsystemColumns"
                noun="delsystem"
            />
        </template>
    </detail-page>
</template>
