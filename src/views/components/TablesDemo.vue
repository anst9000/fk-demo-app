<script setup lang="ts">
import { computed, ref } from "vue";
import {
    FButton,
    FCrudDataset,
    FList,
    FPersonnummerTextField,
    FStaticField,
    FTable,
    FTextField,
    defineTableColumns,
} from "@fkui/vue";
import { formatCurrency } from "../../composables/formatters";

/* ---------- Table: select, expand and edit ---------- */

interface Payment {
    id: string;
    period: string;
    benefit: string;
    amount: number;
    comment: string;
    /** Part payments, shown when the row is expanded */
    parts?: Payment[];
}

const payments = ref<Payment[]>([
    {
        id: "1",
        period: "2026-08",
        benefit: "Föräldrapenning",
        amount: 18400,
        comment: "",
        parts: [
            { id: "1a", period: "2026-08", benefit: "Grundnivå", amount: 7800, comment: "" },
            { id: "1b", period: "2026-08", benefit: "Sjukpenningnivå", amount: 10600, comment: "" },
        ],
    },
    { id: "2", period: "2026-08", benefit: "Barnbidrag", amount: 1250, comment: "" },
    {
        id: "3",
        period: "2026-09",
        benefit: "Bostadsbidrag",
        amount: 3100,
        comment: "Retroaktivt",
        parts: [
            { id: "3a", period: "2026-07", benefit: "Bostadsbidrag", amount: 1550, comment: "" },
            { id: "3b", period: "2026-08", benefit: "Bostadsbidrag", amount: 1550, comment: "" },
        ],
    },
    { id: "4", period: "2026-09", benefit: "Barnbidrag", amount: 1250, comment: "" },
    { id: "5", period: "2026-10", benefit: "Sjukpenning", amount: 9870, comment: "" },
]);

const selectedPayments = ref<Payment[]>([]);
const selectedTotal = computed(() =>
    selectedPayments.value.reduce((sum, payment) => sum + payment.amount, 0),
);

const paymentColumns = defineTableColumns<Payment>([
    { header: "Period", key: "period", type: "text", size: "shrink" },
    { header: "Förmån", key: "benefit", type: "text" },
    { header: "Belopp (kr)", key: "amount", type: "text:currency", size: "shrink" },
    {
        header: "Kommentar",
        key: "comment",
        type: "text",
        editable: true,
        label: (row) => `Kommentar för ${row.benefit} ${row.period}`,
        validation: { maxLength: { length: 40 } },
    },
]);

/* ---------- FCrudDataset + FList ---------- */

interface Child {
    id: string;
    name: string;
    personnummer: string;
}

const children = ref<Child[]>([
    { id: "1", name: "Alva", personnummer: "20180412-1234" },
    { id: "2", name: "Noah", personnummer: "20210130-5678" },
]);
const changeLog = ref<string[]>([]);

function beforeCreate(): Child {
    const maxId = children.value.reduce((max, child) => Math.max(max, Number(child.id)), 0);
    return { id: String(maxId + 1), name: "", personnummer: "" };
}

function log(text: string): void {
    changeLog.value = [text, ...changeLog.value].slice(0, 5);
}
</script>

<template>
    <h2>Tabell: välja, expandera och redigera</h2>
    <p>
        Samma <code>FTable</code> som i listorna, men med kryssrutor för att välja rader, rader som
        kan expanderas och en kolumn som går att redigera direkt i tabellen.
    </p>
    <f-table
        v-model:selected-rows="selectedPayments"
        :rows="payments"
        :columns="paymentColumns"
        key-attribute="id"
        selectable="multi"
        expandable-attribute="parts"
    >
        <template #caption>Utbetalningar (påhittade)</template>
    </f-table>
    <p aria-live="polite">
        Valda rader: {{ selectedPayments.length }}, summa {{ formatCurrency(selectedTotal) }}.
    </p>

    <h2>Datamängdredigerare och lista</h2>
    <p>
        <code>FCrudDataset</code> sköter modalerna för att lägga till, ändra och ta bort. Raderna
        visas här med <code>FList</code>.
    </p>
    <f-crud-dataset
        v-model="children"
        :before-create
        add-new-modal-header="Lägg till barn"
        modify-modal-header="Ändra barn"
        delete-modal-header="Vill du ta bort barnet?"
        @created="(item: Child) => log(`${item.name} lades till.`)"
        @updated="(item: Child) => log(`${item.name} ändrades.`)"
        @deleted="(item: Child) => log(`${item.name} togs bort.`)"
    >
        <template #default="{ updateItem, deleteItem }">
            <f-list :items="children" element-id="children" key-attribute="id">
                <template #default="{ item }">
                    <div class="child-row">
                        <div>
                            <strong>{{ item.name }}</strong>
                            <br />
                            {{ item.personnummer }}
                        </div>
                        <div class="child-row__buttons">
                            <f-button
                                variant="tertiary"
                                size="small"
                                icon-left="pen"
                                @click="updateItem(item)"
                            >
                                Ändra <span class="sr-only">{{ item.name }}</span>
                            </f-button>
                            <f-button
                                variant="tertiary"
                                size="small"
                                icon-left="trashcan"
                                @click="deleteItem(item)"
                            >
                                Ta bort <span class="sr-only">{{ item.name }}</span>
                            </f-button>
                        </div>
                    </div>
                </template>
                <template #screenreader="{ item }">Barn {{ item.name }}</template>
                <template #empty>Inga barn registrerade.</template>
            </f-list>
        </template>

        <template #add-button>Lägg till barn</template>

        <template #add="{ item }">
            <f-text-field
                v-model="item.name"
                v-validation.required.maxLength="{ maxLength: { length: 40 } }"
            >
                Förnamn
            </f-text-field>
            <f-personnummer-text-field v-model="item.personnummer" v-validation.required>
                Personnummer
            </f-personnummer-text-field>
        </template>

        <template #modify="{ item }">
            <f-static-field>
                <template #label>Personnummer</template>
                <template #default>{{ item.personnummer }}</template>
            </f-static-field>
            <f-text-field
                v-model="item.name"
                v-validation.required.maxLength="{ maxLength: { length: 40 } }"
            >
                Förnamn
            </f-text-field>
        </template>

        <template #delete="{ item }">Vill du ta bort {{ item.name }} ({{ item.personnummer }})?</template>
    </f-crud-dataset>

    <ul v-if="changeLog.length > 0" class="change-log" aria-live="polite">
        <li v-for="(entry, index) in changeLog" :key="index">{{ entry }}</li>
    </ul>
</template>

<style scoped>
.child-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
}

.child-row__buttons {
    display: flex;
    gap: 0.5rem;
}

.change-log {
    margin-top: 1rem;
}
</style>
