<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import {
    type ContextMenuItem,
    type FModalButtonDescriptor,
    FButton,
    FConfirmModal,
    FContextMenu,
    FDefinitionList,
    FModal,
    getHTMLElementFromVueRef,
    useModal,
} from "@fkui/vue";
import ContactFormModal, { type ContactDetails } from "./ContactFormModal.vue";

const { confirmModal, formModal, openModal } = useModal();

/* ---------- FModal ---------- */
const infoOpen = ref(false);

/* ---------- Confirm modal ---------- */
const documents = ref(["Läkarintyg.pdf", "Lönespecifikation.pdf", "Hyreskontrakt.pdf"]);
const lastAction = ref("");

async function removeDocument(name: string): Promise<void> {
    const confirmed = await confirmModal({
        heading: "Ta bort dokument",
        content: `Vill du ta bort ”${name}”? Det går inte att ångra.`,
        confirm: "Ja, ta bort",
        dismiss: "Nej, behåll",
    });
    if (confirmed) {
        documents.value = documents.value.filter((d) => d !== name);
        lastAction.value = `${name} togs bort.`;
    } else {
        lastAction.value = `${name} behölls.`;
    }
}

/* ---------- FConfirmModal with three buttons ---------- */
const draftButtons: FModalButtonDescriptor[] = [
    { label: "Spara utkast", event: "save", reason: "save", type: "primary" },
    { label: "Släng ändringarna", event: "discard", reason: "discard", type: "secondary" },
    { label: "Fortsätt redigera", event: "dismiss", reason: "dismiss", type: "secondary" },
];

async function leaveDraft(): Promise<void> {
    const result = await openModal(FConfirmModal, {
        props: {
            heading: "Du har osparade ändringar",
            content: "Vill du spara ansökan som utkast innan du lämnar sidan?",
            buttons: draftButtons,
        },
    });
    const texts: Record<string, string> = {
        save: "Utkastet sparades (på låtsas).",
        discard: "Ändringarna slängdes.",
    };
    lastAction.value = texts[String(result.reason)] ?? "Du fortsatte redigera.";
}

/* ---------- Form modal ---------- */
const contact = ref<ContactDetails>({
    name: "Test Testsson",
    email: "test@example.com",
    phone: "",
});

async function editContact(): Promise<void> {
    try {
        // The modal edits a copy, so cancelling leaves the original untouched
        const result = await formModal<ContactDetails>(ContactFormModal, {
            props: { value: { ...contact.value } },
        });
        contact.value = { ...result };
        lastAction.value = "Kontaktuppgifterna sparades.";
    } catch {
        lastAction.value = "Ändringen avbröts.";
    }
}

/* ---------- Context menu ---------- */
const menuItems: ContextMenuItem[] = [
    { label: "Skriv ut", key: "print" },
    { label: "Ladda ner som PDF", key: "pdf" },
    { label: "Skicka till Mina sidor", key: "send" },
    { separator: true },
    { label: "Arkivera", key: "archive" },
];
const menuOpen = ref(false);
const menuButton = useTemplateRef("menuButton");

function menuAnchor(): HTMLElement | undefined {
    return menuButton.value ? getHTMLElementFromVueRef(menuButton.value) : undefined;
}

function onMenuSelect(key: string): void {
    const item = menuItems.find((i) => "key" in i && i.key === key);
    lastAction.value = `Du valde ”${item && "label" in item ? item.label : key}” i menyn.`;
}
</script>

<template>
    <p v-if="lastAction" class="last-action" aria-live="polite">Senaste händelse: {{ lastAction }}</p>

    <h2>Modal dialogruta</h2>
    <p><code>FModal</code> för information som kräver användarens uppmärksamhet.</p>
    <f-button variant="secondary" size="medium" @click="infoOpen = true">
        Visa information
    </f-button>
    <f-modal :is-open="infoOpen" @close="infoOpen = false">
        <template #header>Om handläggningstider</template>
        <template #content>
            <p>
                Handläggningstiden beror på förmånen och hur komplett ansökan är. Siffrorna i den här
                demon är påhittade.
            </p>
        </template>
        <template #footer>
            <f-button variant="primary" size="medium" @click="infoOpen = false">Stäng</f-button>
        </template>
    </f-modal>

    <h2>Bekräftelsemodal</h2>
    <p>
        <code>confirmModal()</code> från <code>useModal()</code> returnerar ett löfte med
        <code>true</code> eller <code>false</code>.
    </p>
    <ul class="documents">
        <li v-for="doc in documents" :key="doc">
            <span>{{ doc }}</span>
            <f-button
                variant="tertiary"
                size="small"
                icon-left="trashcan"
                @click="removeDocument(doc)"
            >
                Ta bort <span class="sr-only">{{ doc }}</span>
            </f-button>
        </li>
    </ul>
    <p v-if="documents.length === 0">Inga dokument kvar.</p>

    <h3>Fler än två val</h3>
    <p>
        Bakom <code>confirmModal()</code> ligger komponenten <code>FConfirmModal</code>. Med
        <code>openModal(FConfirmModal, …)</code> kan den få egna knappar, och svaret är händelsen
        för knappen man valde. Att lägga den direkt i mallen är utfasat.
    </p>
    <f-button variant="secondary" size="medium" @click="leaveDraft">Lämna ansökan</f-button>

    <h2>Formulärsmodal</h2>
    <p><code>formModal()</code> öppnar ett formulär i en modal och returnerar det som sparades.</p>
    <f-definition-list
        :definitions="[
            { term: 'Namn', definition: contact.name },
            { term: 'E-post', definition: contact.email },
            { term: 'Telefon', definition: contact.phone || '–' },
        ]"
    />
    <f-button variant="secondary" size="medium" icon-left="pen" @click="editContact">
        Ändra kontaktuppgifter
    </f-button>

    <h2>Kontextmeny</h2>
    <p><code>FContextMenu</code> visar en meny med åtgärder vid en knapp.</p>
    <f-button
        ref="menuButton"
        variant="secondary"
        size="medium"
        icon-right="caret-down"
        aria-haspopup="menu"
        @click="menuOpen = !menuOpen"
    >
        Fler åtgärder
    </f-button>
    <f-context-menu
        :is-open="menuOpen"
        :items="menuItems"
        :anchor="menuAnchor()"
        aria-label="Åtgärder"
        @close="menuOpen = false"
        @select="onMenuSelect"
    />
</template>

<style scoped>
.last-action {
    padding: 0.5rem 0.75rem;
    border-left: 4px solid currentColor;
    background: var(--fkds-color-background-secondary, #f4f4f4);
}

.documents {
    list-style: none;
    padding: 0;
    max-width: 28rem;
}

.documents li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--fkds-color-border-secondary, #ddd);
}
</style>
