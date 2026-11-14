<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { FBadge, FDefinitionList } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import { useResource } from "../composables/useResource";
import { environmentBadge } from "../composables/formatters";
import { applicationRepository } from "../repositories/applicationRepository";
import { subsystemRepository } from "../repositories/subsystemRepository";

const props = defineProps<{ id: number }>();

/* Load the subsystem and the application it belongs to */
const { data, loading, error } = useResource(async () => {
    const subsystem = await subsystemRepository.getById(props.id);
    const application = subsystem
        ? await applicationRepository.getById(subsystem.applicationId)
        : undefined;
    return { subsystem, application };
}, () => props.id);

const item = computed(() => data.value?.subsystem);
const application = computed(() => data.value?.application);

const definitions = computed(() =>
    item.value
        ? [
              { term: "Kod", definition: item.value.code },
              { term: "Team", definition: item.value.team },
              { term: "Version", definition: item.value.version },
              { term: "Senast driftsatt", definition: item.value.lastDeployed },
          ]
        : [],
);
</script>

<template>
    <detail-page
        :loading
        :error
        :not-found="!item"
        :back-to="{ name: 'delsystem' }"
        back-label="Alla delsystem"
    >
        <template v-if="item">
            <h1>{{ item.name }}</h1>
            <p>
                Miljö:
                <f-badge :status="environmentBadge(item.environment)">{{ item.environment }}</f-badge>
            </p>
            <p v-if="application">
                Ingår i applikationen
                <router-link
                    class="anchor"
                    :to="{ name: 'applikation', params: { id: application.id } }"
                >
                    {{ application.name }}
                </router-link>
            </p>
            <f-definition-list :definitions />
        </template>
    </detail-page>
</template>
