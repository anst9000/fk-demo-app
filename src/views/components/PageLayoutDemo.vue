<script setup lang="ts">
import { computed, ref } from "vue";
import {
    FButton,
    FDetailsPanel,
    FFixedPane,
    FMinimizablePanel,
    FPageLayout,
    FRadioField,
    FResizePane,
    useDetailsPanel,
} from "@fkui/vue";

/* The four standard layouts of FPageLayout */
const layouts = ["three-column", "left-panel", "right-panel", "simple"] as const;
type LayoutName = (typeof layouts)[number];
const layout = ref<LayoutName>("three-column");
const paneType = ref<"resize" | "fixed">("resize");

interface Person {
    id: number;
    name: string;
    benefit: string;
    status: string;
    received: string;
}

/* Made-up cases for the details panel */
const people: Person[] = [
    { id: 1, name: "Anna Andersson", benefit: "Föräldrapenning", status: "Under handläggning", received: "2026-10-02" },
    { id: 2, name: "Björn Berg", benefit: "Sjukpenning", status: "Beviljad", received: "2026-09-18" },
    { id: 3, name: "Cecilia Ek", benefit: "Bostadsbidrag", status: "Komplettering begärd", received: "2026-10-27" },
    { id: 4, name: "David Lund", benefit: "Tillfällig föräldrapenning", status: "Beviljad", received: "2026-11-05" },
];

/*
 * FKUI keeps every details panel ever created in a list and finds the first one with the name, also after it
 * has been unmounted (in 6.65 its destroy() does nothing). A name of its own for each visit to this page makes
 * open() reach the panel that is on screen.
 */
const DETAILS = `person-details-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const details = useDetailsPanel<Person>(DETAILS);
const PersonPanel = FDetailsPanel<Person>;
const shown = ref<number | null>(null);
const lastClose = ref("");

function showDetails(person: Person): void {
    shown.value = person.id;
    details.open(person, {
        onClose({ reason }) {
            shown.value = null;
            lastClose.value = `Panelen stängdes (${reason}).`;
        },
    });
}

const hasLeft = computed(() => layout.value === "three-column" || layout.value === "left-panel");
const hasRight = computed(() => layout.value === "three-column" || layout.value === "right-panel");
const LeftPane = computed(() => (paneType.value === "resize" ? FResizePane : FFixedPane));

/* The slot scope holds the area names of the current layout; read them by name (not every layout has every area) */
const slotOf = (area: object, name: string): string | undefined => (area as Record<string, string | undefined>)[name];
</script>

<template>
    <div class="fullscreen">
        <f-page-layout :layout>
            <template #default="area">
                <header :slot="area.header" class="area-header">
                    <strong>FPageLayout-demo</strong>
                    <router-link :to="{ name: 'komp-sidlayout' }" class="back">
                        Tillbaka till komponenterna
                    </router-link>
                </header>

                <component
                    :is="LeftPane"
                    v-if="hasLeft"
                    :slot="slotOf(area, 'left')"
                    min="180px"
                    max="40%"
                    initial="260px"
                >
                    <f-minimizable-panel context="vänstermeny">
                        <template #default="panel">
                            <template v-if="panel.isOpen">
                                <h2 :slot="panel.header" class="panel-heading">Filter</h2>
                                <!-- FFixedPane takes its width from the content -->
                                <div :slot="panel.content" :class="{ 'fixed-width': paneType === 'fixed' }">
                                    <p>
                                        Den här panelen ligger i en
                                        <code>{{ paneType === "resize" ? "FResizePane" : "FFixedPane" }}</code>.
                                        Minimera den med knappen.
                                    </p>
                                    <f-radio-field v-model="paneType" value="resize">
                                        Går att dra i storlek
                                    </f-radio-field>
                                    <f-radio-field v-model="paneType" value="fixed">
                                        Fast bredd
                                    </f-radio-field>
                                </div>
                                <p :slot="panel.footer" class="panel-footer">FMinimizablePanel</p>
                            </template>
                        </template>
                    </f-minimizable-panel>
                </component>

                <main :slot="area.content" class="area-content">
                    <h1>Ärenden</h1>
                    <fieldset class="layout-choice">
                        <legend>Layout</legend>
                        <label v-for="name in layouts" :key="name">
                            <input v-model="layout" type="radio" name="layout" :value="name" />
                            {{ name }}
                        </label>
                    </fieldset>
                    <p v-if="!hasRight">Välj en layout med höger yta för att se detaljpanelen.</p>
                    <ul class="people">
                        <li v-for="person in people" :key="person.id" :class="{ selected: shown === person.id }">
                            <span>
                                <strong>{{ person.name }}</strong>
                                <br />
                                {{ person.benefit }}
                            </span>
                            <f-button
                                v-if="hasRight"
                                variant="secondary"
                                size="small"
                                @click="showDetails(person)"
                            >
                                Visa detaljer <span class="sr-only">för {{ person.name }}</span>
                            </f-button>
                        </li>
                    </ul>
                    <p v-if="lastClose" role="status">{{ lastClose }}</p>
                </main>

                <!-- Always mounted (see DETAILS); a layout without a right area simply has no slot for it -->
                <person-panel :slot="slotOf(area, 'right')" :name="DETAILS">
                    <template #default="panel">
                        <h2 :slot="panel.header" class="panel-heading">{{ panel.item.name }}</h2>
                        <dl :slot="panel.content" class="details">
                            <dt>Förmån</dt>
                            <dd>{{ panel.item.benefit }}</dd>
                            <dt>Status</dt>
                            <dd>{{ panel.item.status }}</dd>
                            <dt>Inkommen</dt>
                            <dd>{{ panel.item.received }}</dd>
                        </dl>
                        <div :slot="panel.footer" class="panel-buttons">
                            <f-button variant="primary" size="small" @click="panel.close('save')">
                                Markera som läst
                            </f-button>
                            <f-button variant="secondary" size="small" @click="panel.close()">
                                Stäng
                            </f-button>
                        </div>
                    </template>
                </person-panel>

                <footer :slot="area.footer" class="area-footer">
                    Sidfot. Allt är påhittat, och ingenting sparas.
                </footer>
            </template>
        </f-page-layout>
    </div>
</template>

<style scoped>
/* FPageLayout fills its parent; this page fills the window */
.fullscreen {
    height: 100vh;
}

.area-header,
.area-footer {
    color: var(--fkds-color-text-primary, #222);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--fkds-color-background-secondary, #f0f0f0);
}

.area-content {
    padding: 1rem 1.5rem;
}

.panel-heading {
    margin: 0;
    font-size: 1.125rem;
}

.fixed-width {
    width: 15rem;
}

.panel-footer {
    margin: 0;
    font-size: 0.875rem;
}

.layout-choice {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin: 0 0 1rem;
}

.people {
    list-style: none;
    padding: 0;
    max-width: 36rem;
}

.people li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--fkds-color-border-primary, #ccc);
}

.people li.selected {
    background: var(--fkds-color-background-secondary, #f0f0f0);
}

.details dt {
    font-weight: bold;
}

.details dd {
    margin: 0 0 0.75rem;
}

.panel-buttons {
    display: flex;
    gap: 0.5rem;
}
</style>
