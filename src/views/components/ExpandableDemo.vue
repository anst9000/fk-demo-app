<script setup lang="ts">
import { ref } from "vue";
import { FExpand, FExpandablePanel, FExpandableParagraph } from "@fkui/vue";

interface Question {
    title: string;
    answer: string;
    notifications: number;
}

const questions: Question[] = [
    {
        title: "När betalas pengarna ut?",
        answer: "Utbetalningen görs normalt runt den 25:e i månaden efter att beslutet har fattats.",
        notifications: 0,
    },
    {
        title: "Hur ändrar jag mitt kontonummer?",
        answer: "Du ändrar kontonummer på Mina sidor under Mina uppgifter. Ändringen gäller från nästa utbetalning.",
        notifications: 1,
    },
    {
        title: "Vad händer om jag har fått för mycket pengar?",
        answer: "Då får du ett brev om återbetalning med uppgifter om belopp och när det ska betalas.",
        notifications: 2,
    },
];

/* FExpandablePanel and FExpandableParagraph are controlled: the parent keeps the open state */
const openPanels = ref<number[]>([]);
function togglePanel(index: number): void {
    openPanels.value = openPanels.value.includes(index)
        ? openPanels.value.filter((i) => i !== index)
        : [...openPanels.value, index];
}

const paragraphOpen = ref(false);

/* FExpand animates content that appears or disappears */
const detailsOpen = ref(false);
</script>

<template>
    <h2>Expanderbar panel</h2>
    <p>
        <code>FExpandablePanel</code> passar för vanliga frågor och liknande. Siffran visar
        antal notifieringar.
    </p>
    <f-expandable-panel
        v-for="(question, index) in questions"
        :key="question.title"
        :expanded="openPanels.includes(index)"
        :notifications="question.notifications"
        header-tag="h3"
        @toggle="togglePanel(index)"
    >
        <template #title>{{ question.title }}</template>
        <template #default>
            <p>{{ question.answer }}</p>
        </template>
    </f-expandable-panel>

    <h2>Expanderbart stycke</h2>
    <p><code>FExpandableParagraph</code> är en lättare variant för extra text i löpande innehåll.</p>
    <f-expandable-paragraph
        :expanded="paragraphOpen"
        header-tag="h3"
        @toggle="paragraphOpen = !paragraphOpen"
    >
        <template #title>Vad räknas som inkomst?</template>
        <template #default>
            <p>
                Lön, sjukpenning, föräldrapenning och pension räknas som inkomst. Studiemedel räknas
                bara delvis. Exemplet är påhittat.
            </p>
        </template>
    </f-expandable-paragraph>

    <h2>Animerad expandering</h2>
    <p>
        <code>FExpand</code> har ingen rubrik eller knapp själv. Den animerar bara innehåll som
        visas eller döljs, så den passar när knappen ska se ut på ett eget sätt.
    </p>
    <!-- A plain button with FKUI's classes: FButton does not update aria-expanded after the first render -->
    <button
        type="button"
        class="button button--secondary button--medium"
        :aria-expanded="detailsOpen"
        aria-controls="expand-details"
        @click="detailsOpen = !detailsOpen"
    >
        {{ detailsOpen ? "Dölj beräkningen" : "Visa beräkningen" }}
    </button>
    <f-expand>
        <div v-if="detailsOpen" id="expand-details" class="expand-details">
            <p>
                Ersättningen är knappt 80 procent av inkomsten upp till ett tak. Siffrorna i
                exemplet är påhittade.
            </p>
        </div>
    </f-expand>
</template>

<style scoped>
.expand-details {
    padding: 1rem 0 0;
}
</style>
