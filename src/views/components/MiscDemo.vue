<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef } from "vue";
import { FDate } from "@fkui/date";
import {
    type FDialogueTreeQuestion,
    type FDialogueTreeUserProgress,
    FButton,
    FCalendar,
    FCalendarDay,
    FCurrencyTextField,
    FDialogueTree,
    FFileItem,
    FIcon,
    FLogo,
    FProgressbar,
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

/* ---------- Icons: every icon in @fkui/icon-lib-default ---------- */
const iconNames = [
    "alert", "arrow-down", "arrow-in-circle", "arrow-right", "bars", "bell", "calendar",
    "caret-down", "caret-up", "chevrons-left", "circle", "circle-notch-solid", "close", "cross",
    "dash", "doc", "ellipsis", "error", "file", "i", "new-window", "paper-clip", "pdf", "pen",
    "pic", "plus", "search", "sort", "success", "trashcan", "triangle",
];

/* ---------- File items ---------- */
interface DemoFile {
    name: string;
    type: string;
}
const files: DemoFile[] = [
    { name: "Läkarintyg.pdf", type: "application/pdf" },
    { name: "Foto på kvitto.jpg", type: "image/jpeg" },
    { name: "Ansökan.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { name: "Kalkyl.csv", type: "text/csv" },
];
const upload = ref(35);
const uploading = ref(true);
let timer: ReturnType<typeof setInterval> | undefined;
function startUpload(): void {
    upload.value = 0;
    uploading.value = true;
    clearInterval(timer);
    timer = setInterval(() => {
        upload.value = Math.min(100, upload.value + 10);
        if (upload.value === 100) {
            clearInterval(timer);
        }
    }, 400);
}
function cancelUpload(): void {
    clearInterval(timer);
    uploading.value = false;
}
onUnmounted(() => clearInterval(timer));
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

    <h2>Ikoner</h2>
    <p>
        <code>FIcon</code> visar en ikon ur ikonbiblioteket, här alla
        {{ iconNames.length }} i <code>@fkui/icon-lib-default</code>. Ikoner är dolda för
        skärmläsare om de inte får en <code>title</code>.
    </p>
    <ul class="icon-grid">
        <li v-for="name in iconNames" :key="name">
            <f-icon :name class="icon-grid__icon" />
            <code>{{ name }}</code>
        </li>
    </ul>
    <p class="icon-row">
        <span><f-icon name="arrow-right" /> vanlig</span>
        <span><f-icon name="arrow-right" flip="horizontal" /> spegelvänd</span>
        <span><f-icon name="arrow-right" rotate="90" /> roterad 90°</span>
        <span>
            <span class="icon-stack icon-stack--circle">
                <f-icon name="circle" />
                <f-icon name="success" />
            </span>
            staplad
        </span>
        <span>
            <f-icon name="pen"><title>Redigera</title></f-icon>
            med titel för skärmläsare
        </span>
    </p>

    <h2>Logotyp</h2>
    <p>
        <code>FLogo</code> visar logotypen som appen anger med CSS-variablerna
        <code>--f-logo-image-small</code> och <code>--f-logo-image-large</code> (se
        <code>style.css</code>). Den här demon har en påhittad logotyp.
    </p>
    <div class="logos">
        <f-logo size="small">FKUI-demo</f-logo>
        <f-logo size="large">FKUI-demo</f-logo>
        <f-logo>FKUI-demo</f-logo>
    </div>
    <p class="hint">Liten, stor och responsiv (växlar efter fönstrets bredd).</p>

    <h2>Filer</h2>
    <p>
        <code>FFileItem</code> visar en fil, till exempel efter att användaren valt den med
        <code>FFileSelector</code> (se Formulär). Ikonen väljs efter filtypen.
    </p>
    <ul class="files">
        <li v-for="file in files" :key="file.name">
            <f-file-item :file-name="file.name" :mime-type="file.type" />
        </li>
        <li>
            <f-file-item file-name="Hyreskontrakt.pdf" mime-type="application/pdf">
                <template #row>
                    <f-button
                        v-if="uploading && upload < 100"
                        variant="tertiary"
                        size="small"
                        icon-left="close"
                        @click="cancelUpload"
                    >
                        Avbryt uppladdning
                    </f-button>
                    <f-button v-else variant="tertiary" size="small" @click="startUpload">
                        Ladda upp igen
                    </f-button>
                </template>
                <f-progressbar
                    v-if="uploading"
                    aria-label="Uppladdning av Hyreskontrakt.pdf"
                    :value="upload"
                    value-text="Uppladdat: %VALUE% %"
                />
                <p v-else class="hint">Uppladdningen avbröts.</p>
            </f-file-item>
        </li>
    </ul>
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

.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
    gap: 0.75rem;
    list-style: none;
    padding: 0;
}

.icon-grid li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.icon-grid__icon {
    width: 1.5rem;
    height: 1.5rem;
}

.icon-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    align-items: center;
}

.logos {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2rem;
}

.hint {
    color: var(--fkds-color-text-secondary, #555);
}

.files {
    list-style: none;
    padding: 0;
    max-width: 32rem;
}
</style>
