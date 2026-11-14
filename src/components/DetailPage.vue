<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router";
import { FMessageBox } from "@fkui/vue";

defineProps<{
    loading: boolean;
    error: string | null;
    /** True when loading finished but the item does not exist */
    notFound: boolean;
    backTo: RouteLocationRaw;
    backLabel: string;
}>();
</script>

<template>
    <router-link :to="backTo" class="anchor back-link">← {{ backLabel }}</router-link>

    <p v-if="loading">Hämtar…</p>

    <f-message-box v-else-if="error" type="error">
        <template #default="{ headingSlotClass }">
            <h2 :class="headingSlotClass">Något gick fel</h2>
            <p>{{ error }}</p>
        </template>
    </f-message-box>

    <f-message-box v-else-if="notFound" type="warning">
        <template #default="{ headingSlotClass }">
            <h2 :class="headingSlotClass">Hittades inte</h2>
            <p>Det finns ingen post med det här id:t.</p>
        </template>
    </f-message-box>

    <slot v-else />
</template>
