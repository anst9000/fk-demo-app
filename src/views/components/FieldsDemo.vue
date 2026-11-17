<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from "vue";
import { ValidationService } from "@fkui/logic";
import {
    type ErrorItem,
    type GroupValidityEvent,
    FBankAccountNumberTextField,
    FBankgiroTextField,
    FButton,
    FClearingnumberTextField,
    FEmailTextField,
    FErrorList,
    FLabel,
    FOrganisationsnummerTextField,
    FPercentTextField,
    FPlusgiroTextField,
    FTextField,
    FValidationGroup,
} from "@fkui/vue";

/* ---------- Special text fields ---------- */
const employer = ref("");
const workRate = ref("");
const clearing = ref("");
const account = ref("");
const bankgiro = ref("");
const plusgiro = ref("");

/* ---------- FLabel with a native element ---------- */
const contactWay = ref("");

/* ---------- FValidationGroup + FErrorList ---------- */
const form = useTemplateRef<HTMLFormElement>("form");
const errorListAnchor = useTemplateRef<HTMLElement>("errorListAnchor");
const group = ref<GroupValidityEvent>({ isValid: true, componentsWithError: [], componentCount: 0 });
const applicant = ref({ name: "", email: "", reason: "" });
const submitted = ref(false);
const sent = ref(false);

/* After the first submit the list follows the group, so it shrinks as the user corrects the fields */
const errors = computed<ErrorItem[]>(() =>
    submitted.value
        ? group.value.componentsWithError.map((e) => ({
              title: e.errorMessage,
              id: e.elementId,
              focusElementId: e.focusElementId,
          }))
        : [],
);

/* The group hears about each field's result a moment after the validation call returns */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

async function submit(): Promise<void> {
    if (!form.value) {
        return;
    }
    // Validate every field, also those the user never touched, and show their errors
    ValidationService.setSubmitted(form.value);
    await ValidationService.validateAllElements(form.value);
    await settle();
    submitted.value = true;
    sent.value = group.value.isValid;
    if (!sent.value) {
        await nextTick();
        // The error list should get focus, so screen-reader users hear it
        errorListAnchor.value?.focus();
    }
}
</script>

<template>
    <h2>Fler textfält</h2>
    <p>
        Specialiserade textfält som formaterar och validerar sitt innehåll. Skriv något och lämna
        fältet för att se formateringen. Alla nummer är påhittade.
    </p>
    <div class="field-grid">
        <f-organisationsnummer-text-field v-model="employer" v-validation.required>
            Arbetsgivarens organisationsnummer
        </f-organisationsnummer-text-field>
        <f-percent-text-field v-model="workRate" v-validation.required>
            Sysselsättningsgrad
        </f-percent-text-field>
        <f-clearingnumber-text-field v-model="clearing" v-validation.required>
            Clearingnummer
        </f-clearingnumber-text-field>
        <f-bank-account-number-text-field v-model="account" v-validation.required>
            Kontonummer
        </f-bank-account-number-text-field>
        <f-bankgiro-text-field v-model="bankgiro">Bankgironummer (frivillig)</f-bankgiro-text-field>
        <f-plusgiro-text-field v-model="plusgiro">Plusgironummer (frivillig)</f-plusgiro-text-field>
    </div>

    <h2>Etikett</h2>
    <p>
        <code>FLabel</code> är etiketten som textfälten använder. Den kan också sättas på ett eget
        fält, här en vanlig <code>select</code>, med beskrivning och felmeddelande på samma sätt.
    </p>
    <div class="label-demo">
        <f-label for="contact-way">
            Hur vill du bli kontaktad?
            <template #description="{ descriptionClass }">
                <span :class="descriptionClass">Vi kontaktar dig bara om ärendet behöver kompletteras.</span>
            </template>
        </f-label>
        <select id="contact-way" v-model="contactWay" class="native-select">
            <option value="">Välj</option>
            <option value="telefon">Telefon</option>
            <option value="e-post">E-post</option>
            <option value="brev">Brev</option>
        </select>
    </div>

    <h2>Valideringsgrupp och fellista</h2>
    <p>
        <code>FValidationGroup</code> samlar giltigheten för fälten i gruppen.
        <code>FErrorList</code> sammanfattar felen när formuläret skickas, och länkarna leder till
        fälten. Skicka formuläret tomt för att se den.
    </p>

    <div ref="errorListAnchor" tabindex="-1" class="error-list-anchor">
        <f-error-list v-if="errors.length" :items="errors">
            <template #title>Rätta följande innan du skickar:</template>
        </f-error-list>
    </div>

    <form ref="form" novalidate @submit.prevent="submit">
        <f-validation-group key="ansokan" v-model="group">
            <f-text-field
                id="ansokan-namn"
                v-model="applicant.name"
                v-validation.required.maxLength="{ maxLength: { length: 60 } }"
            >
                Namn
            </f-text-field>
            <f-email-text-field id="ansokan-epost" v-model="applicant.email" v-validation.required>
                E-post
            </f-email-text-field>
            <f-text-field
                id="ansokan-orsak"
                v-model="applicant.reason"
                v-validation.required.maxLength="{ maxLength: { length: 100 } }"
            >
                Vad gäller ansökan?
            </f-text-field>
        </f-validation-group>
        <p class="group-status">
            Gruppen har {{ group.componentCount }} fält,
            {{ group.componentsWithError.length }} med fel.
        </p>
        <f-button type="submit" variant="primary" size="medium">Skicka</f-button>
    </form>
    <p v-if="sent" role="status">Ansökan skickades (på låtsas).</p>
</template>

<style scoped>
.field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: 0 1.5rem;
}

.label-demo {
    max-width: 24rem;
    margin-bottom: 1.5rem;
}

.native-select {
    width: 100%;
    min-height: 2.5rem;
    font: inherit;
}

.error-list-anchor:focus {
    outline: none;
}

.group-status {
    color: var(--fkds-color-text-secondary, #555);
}
</style>
