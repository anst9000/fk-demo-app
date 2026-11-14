<script setup lang="ts">
import { ref } from "vue";
import { FButton, FCheckboxField, FFieldset, FModal } from "@fkui/vue";
import type { ColumnOption } from "../composables/useColumnVisibility";

defineProps<{
    options: ColumnOption[];
}>();

const emit = defineEmits<{ showAll: [] }>();

/** Ids of the visible columns */
const visibleIds = defineModel<string[]>({ required: true });
const isOpen = ref(false);
</script>

<template>
    <f-button
        variant="tertiary"
        size="medium"
        aria-haspopup="dialog"
        class="column-settings__button"
        @click="isOpen = true"
    >
        <svg
            class="column-settings__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
        >
            <path
                fill="currentColor"
                d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
                transform="translate(-1 0)"
            />
        </svg>
        Kolumner
    </f-button>

    <f-modal :is-open size="small" @close="isOpen = false">
        <template #header>Välj kolumner</template>
        <template #content>
            <f-fieldset name="visible-columns">
                <template #label>Visa kolumner</template>
                <template #description="{ descriptionClass }">
                    <span :class="descriptionClass">
                        Den första kolumnen länkar till detaljsidan och visas alltid.
                    </span>
                </template>
                <f-checkbox-field
                    v-for="option in options"
                    :key="option.id"
                    v-model="visibleIds"
                    :value="option.id"
                    :disabled="option.required"
                >
                    {{ option.label }}
                </f-checkbox-field>
            </f-fieldset>
        </template>
        <template #footer>
            <div class="column-settings__footer">
                <f-button variant="primary" size="medium" @click="isOpen = false">Klar</f-button>
                <f-button variant="secondary" size="medium" @click="emit('showAll')">
                    Visa alla
                </f-button>
            </div>
        </template>
    </f-modal>
</template>

<style scoped>
.column-settings__icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.375rem;
    vertical-align: middle;
}

.column-settings__footer {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}
</style>
