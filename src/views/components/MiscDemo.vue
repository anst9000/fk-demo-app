<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { FDate } from "@fkui/date";
import {
    type FDialogueTreeQuestion,
    type FDialogueTreeUserProgress,
    FCalendar,
    FCalendarDay,
    FCurrencyTextField,
    FDialogueTree,
    FOutputField,
    FStaticField,
    FTextField,
    FTooltip,
} from "@fkui/vue";
import { formatCurrency } from "../../composables/formatters";

/* ---------- Calendar: pick several days ---------- */

const today = FDate.now();
const month = shallowRef(today);
const minDate = today.addMonths(-3);
const maxDate = today.addMonths(3);
const selectedDays = ref<string[]>([]);

function toggleDay(date: FDate): void {
    const iso = date.toString();
    selectedDays.value = selectedDays.value.includes(iso)
        ? selectedDays.value.filter((d) => d !== iso)
        : [...selectedDays.value, iso].sort();
}

/* ---------- Dialogue tree ---------- */

interface Answer {
    benefit: string;
    text: string;
}

const dialogueTree: FDialogueTreeQuestion = {
    label: "Vad gäller din fråga?",
    options: [
        {
            label: "Jag har barn",
            question: {
                label: "Vad vill du göra?",
                options: [
                    {
                        label: "Vara hemma med mitt barn",
                        question: {
                            label: "Föräldrapenning",
                            userData: {
                                benefit: "Föräldrapenning",
                                text: "Du kan få föräldrapenning när du är ledig för att vara med ditt barn.",
                            } satisfies Answer,
                        },
                    },
                    {
                        label: "Vara hemma med mitt sjuka barn",
                        question: {
                            label: "Tillfällig föräldrapenning",
                            userData: {
                                benefit: "Tillfällig föräldrapenning",
                                text: "Du kan få tillfällig föräldrapenning när du är borta från jobbet för att ta hand om ditt sjuka barn.",
                            } satisfies Answer,
                        },
                    },
                ],
            },
        },
        {
            label: "Jag är sjuk",
            question: {
                label: "Sjukpenning",
                userData: {
                    benefit: "Sjukpenning",
                    text: "Du kan få sjukpenning om du inte kan arbeta på grund av sjukdom.",
                } satisfies Answer,
            },
        },
        {
            label: "Jag behöver hjälp med boendekostnaden",
            question: {
                label: "Bostadsbidrag",
                userData: {
                    benefit: "Bostadsbidrag",
                    text: "Barnfamiljer och unga under 29 år kan få bostadsbidrag.",
                } satisfies Answer,
            },
        },
    ],
};

const progress = ref<FDialogueTreeUserProgress>({ label: "", lastStep: false, steps: [] });

/* ---------- Combobox ---------- */

const municipalities = [
    "Göteborg",
    "Helsingborg",
    "Jönköping",
    "Linköping",
    "Luleå",
    "Lund",
    "Malmö",
    "Norrköping",
    "Stockholm",
    "Umeå",
    "Uppsala",
    "Västerås",
    "Örebro",
];
const municipality = ref("");

/* ---------- Output field ---------- */

const salary = ref("");
const otherIncome = ref("");
const totalIncome = computed(() => (Number(salary.value) || 0) + (Number(otherIncome.value) || 0));

const decisionDate = "20260315";
</script>

<template>
    <h2>Kalender</h2>
    <p>
        <code>FCalendar</code> med egna dagar (<code>FCalendarDay</code>). Klicka på dagar för att
        välja dem, till exempel dagar med vård av barn.
    </p>
    <div class="calendar">
        <f-calendar v-model="month" :min-date="minDate" :max-date="maxDate" @click="toggleDay">
            <template #default="{ date, isFocused }">
                <f-calendar-day
                    :day="date"
                    :focused="isFocused"
                    :selected="selectedDays.includes(date.toString())"
                />
            </template>
        </f-calendar>
    </div>
    <p aria-live="polite">
        Valda dagar ({{ selectedDays.length }}):
        {{ selectedDays.length > 0 ? selectedDays.join(", ") : "inga" }}
    </p>

    <h2>Dialogträd</h2>
    <p><code>FDialogueTree</code> leder användaren rätt med en fråga i taget.</p>
    <!-- The tree only renders the options; the current question comes from v-model -->
    <h3 v-if="!progress.lastStep" aria-live="polite">{{ progress.label }}</h3>
    <f-dialogue-tree v-model="progress" :dialogue-tree="dialogueTree">
        <template #default="{ userData }">
            <div class="answer">
                <h3>{{ (userData as Answer).benefit }}</h3>
                <p>{{ (userData as Answer).text }} (Påhittad text.)</p>
            </div>
        </template>
    </f-dialogue-tree>

    <h2>Kombobox</h2>
    <p>Ett vanligt <code>FTextField</code> blir en kombobox med förslag när det får <code>options</code>.</p>
    <f-text-field v-model="municipality" :options="municipalities">Kommun</f-text-field>

    <h2>Presentationsfält</h2>
    <p>
        <code>FOutputField</code> visar ett värde som räknas fram från andra fält.
        <code>FStaticField</code> visar ett värde som inte går att ändra, här formaterat med
        <code>v-format</code>.
    </p>
    <div class="fields">
        <f-currency-text-field id="income-salary" v-model="salary">
            Lön per månad
        </f-currency-text-field>
        <f-currency-text-field id="income-other" v-model="otherIncome">
            Övriga inkomster per månad
        </f-currency-text-field>
        <f-output-field id="income-total" for="income-salary income-other">
            <template #label>Total inkomst per månad</template>
            <template #tooltip>
                <f-tooltip screen-reader-text="Läs mer om total inkomst" header-tag="h3">
                    <template #header>Total inkomst</template>
                    <template #body>Summan av lön och övriga inkomster.</template>
                </f-tooltip>
            </template>
            {{ formatCurrency(totalIncome) }}
        </f-output-field>
        <f-static-field>
            <template #label>Beslutsdatum</template>
            <span v-format:date-full="decisionDate"></span>
        </f-static-field>
    </div>
</template>

<style scoped>
.calendar {
    max-width: 24rem;
}

.answer {
    margin-top: 1rem;
}

.fields {
    max-width: 28rem;
}
</style>
