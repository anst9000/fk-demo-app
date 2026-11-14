<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { FBadge, FButton, FLoader, FMessageBox, FProgressbar, FTooltip } from "@fkui/vue";
import type { BadgeStatus } from "../../composables/formatters";

const badges: Array<{ status: BadgeStatus; text: string }> = [
    { status: "default", text: "Utkast" },
    { status: "info", text: "Under handläggning" },
    { status: "success", text: "Beviljad" },
    { status: "warning", text: "Komplettering begärd" },
    { status: "error", text: "Avslagen" },
];

/* Progress bar */
const progress = ref(40);
function changeProgress(step: number): void {
    progress.value = Math.min(100, Math.max(0, progress.value + step));
}

/* Loader: shown as an overlay while a (pretend) request is running */
const loading = ref(false);
function simulateRequest(): void {
    loading.value = true;
    setTimeout(() => (loading.value = false), 2500);
}

/* The tooltip is attached to this heading */
const tooltipAnchor = useTemplateRef<HTMLElement>("tooltipAnchor");
</script>

<template>
    <h2>Meddelanderuta</h2>
    <p><code>FMessageBox</code> finns i fyra typer.</p>
    <f-message-box type="info">
        <template #default="{ headingSlotClass }">
            <h3 :class="headingSlotClass">Information</h3>
            <p>Handläggningstiden för föräldrapenning är just nu cirka 10 dagar.</p>
        </template>
    </f-message-box>
    <f-message-box type="success">
        <template #default="{ headingSlotClass }">
            <h3 :class="headingSlotClass">Ansökan skickad</h3>
            <p>Vi har tagit emot din ansökan.</p>
        </template>
    </f-message-box>
    <f-message-box type="warning">
        <template #default="{ headingSlotClass }">
            <h3 :class="headingSlotClass">Komplettering behövs</h3>
            <p>Vi saknar ett läkarintyg för perioden.</p>
        </template>
    </f-message-box>
    <f-message-box type="error">
        <template #default="{ headingSlotClass }">
            <h3 :class="headingSlotClass">Något gick fel</h3>
            <p>Tjänsten svarar inte just nu. Försök igen om en stund.</p>
        </template>
    </f-message-box>

    <h2>Bricka</h2>
    <p><code>FBadge</code> i alla statusar, vanlig och inverterad.</p>
    <p class="badge-row">
        <f-badge v-for="badge in badges" :key="badge.status" :status="badge.status">
            {{ badge.text }}
        </f-badge>
    </p>
    <p class="badge-row">
        <f-badge v-for="badge in badges" :key="badge.status" :status="badge.status" inverted>
            {{ badge.text }}
        </f-badge>
    </p>

    <h2>Förloppsindikator</h2>
    <f-progressbar
        :value="progress"
        aria-label="Uppladdning"
        value-text="Uppladdat: %VALUE% %"
    />
    <p class="button-row">
        <f-button variant="secondary" size="medium" @click="changeProgress(-20)">− 20 %</f-button>
        <f-button variant="primary" size="medium" @click="changeProgress(20)">+ 20 %</f-button>
    </p>

    <h2>Laddningsindikator</h2>
    <p><code>FLoader</code> som overlay medan en påhittad förfrågan pågår.</p>
    <f-button variant="primary" size="medium" @click="simulateRequest">
        Hämta data (2,5 sekunder)
    </f-button>
    <f-loader :show="loading" overlay>Hämtar data…</f-loader>

    <div ref="tooltipAnchor">
        <h2>Tooltip</h2>
    </div>
    <f-tooltip :attach-to="tooltipAnchor" screen-reader-text="Läs mer om tooltip" header-tag="h3">
        <template #header>Om tooltip</template>
        <template #body>
            En tooltip ger kort extra information utan att ta plats på sidan. Den öppnas med
            i-knappen bredvid rubriken.
        </template>
    </f-tooltip>
    <p>Klicka på i-knappen bredvid rubriken ovan.</p>
</template>

<style scoped>
.badge-row,
.button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
}
</style>
