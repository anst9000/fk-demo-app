<script setup lang="ts">
import { computed } from "vue";
import { FBadge, FDefinitionList } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import { useResource } from "../composables/useResource";
import { caseStatusBadge, formatCurrency } from "../composables/formatters";
import { caseRepository } from "../repositories/caseRepository";

const props = defineProps<{ id: number }>();

const { data: item, loading, error } = useResource(
    () => caseRepository.getById(props.id),
    () => props.id,
);

const definitions = computed(() =>
    item.value
        ? [
              { term: "Ärendenummer", definition: item.value.caseNumber },
              { term: "Namn", definition: item.value.name },
              { term: "Förmån", definition: item.value.benefit },
              { term: "Belopp", definition: formatCurrency(item.value.amount) },
              { term: "Inkom", definition: item.value.receivedDate },
          ]
        : [],
);
</script>

<template>
    <detail-page
        :loading
        :error
        :not-found="!item"
        :back-to="{ name: 'arenden' }"
        back-label="Alla ärenden"
    >
        <template v-if="item">
            <h1>Ärende {{ item.caseNumber }}</h1>
            <p>
                Status:
                <f-badge :status="caseStatusBadge(item.status)">{{ item.status }}</f-badge>
            </p>
            <f-definition-list :definitions />
        </template>
    </detail-page>
</template>
