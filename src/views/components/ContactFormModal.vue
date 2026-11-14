<script setup lang="ts">
import { FEmailTextField, FFormModal, FPhoneTextField, FTextField } from "@fkui/vue";

export interface ContactDetails {
    name: string;
    email: string;
    phone: string;
}

/*
 * Opened with formModal() from useModal(). FFormModal is the root element, so
 * the isOpen prop and close listener that formModal() passes in fall through
 * to it. The promise resolves with the edited value when the form is submitted.
 */
defineProps<{ value: ContactDetails }>();
</script>

<template>
    <f-form-modal :value>
        <template #header>Ändra kontaktuppgifter</template>
        <template #error-message>Oj, du har glömt att fylla i något. Gå till:</template>
        <template #input-text-fields>
            <!-- FFormModal edits the value object it was given (a copy, see DialogsDemo) -->
            <f-text-field
                v-model="value.name"
                v-validation.required.maxLength="{ maxLength: { length: 60 } }"
            >
                Namn
            </f-text-field>
            <f-email-text-field v-model="value.email" v-validation.required>
                E-post
            </f-email-text-field>
            <f-phone-text-field v-model="value.phone">Telefon (frivilligt)</f-phone-text-field>
        </template>
    </f-form-modal>
</template>
