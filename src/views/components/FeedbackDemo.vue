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

/* FOffline (in App.vue) reacts to the browser's offline and online events; these only pretend */
function pretendOffline(): void {
    window.dispatchEvent(new Event("offline"));
}
function pretendOnline(): void {
    window.dispatchEvent(new Event("online"));
}

/* FErrorHandlingApp (in main.ts) replaces the app with an error page when an error is not handled */
function throwError(): void {
    throw new Error("Ett påhittat fel från komponentdemon");
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

    <h2>Ingen anslutning</h2>
    <p>
        <code>FOffline</code> ligger i appens ram och visar ett meddelande högst upp när
        webbläsaren tappar nätverket. Knapparna låtsas bara: de skickar webbläsarens
        <code>offline</code>- och <code>online</code>-händelser. Du kan också slå av nätverket i
        webbläsarens utvecklarverktyg.
    </p>
    <p class="button-row">
        <f-button variant="secondary" size="medium" @click="pretendOffline">Låtsas tappa nätverket</f-button>
        <f-button variant="secondary" size="medium" @click="pretendOnline">Låtsas få tillbaka det</f-button>
    </p>

    <h2>Felsida</h2>
    <p>
        <code>FErrorHandlingApp</code> och <code>ErrorPlugin</code> ligger runt hela appen (se
        <code>main.ts</code>). När ett fel inte fångas visas FKUI:s felsida i stället för appen.
        Ladda om sidan för att komma tillbaka.
    </p>
    <f-button variant="secondary" size="medium" @click="throwError">Orsaka ett fel</f-button>
</template>

<style scoped>
.badge-row,
.button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
}
</style>
