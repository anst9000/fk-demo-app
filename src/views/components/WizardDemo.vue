<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
    FButton,
    FCurrencyTextField,
    FDefinitionList,
    FMessageBox,
    FNumericTextField,
    FPersonnummerTextField,
    FSelectField,
    FTextField,
    FWizard,
    FWizardStep,
} from "@fkui/vue";

const housingTypes = ["Hyresrätt", "Bostadsrätt", "Villa", "Inneboende"];

function emptyAnswers() {
    return { name: "", personnummer: "", housing: "", rent: "", children: "" };
}

const answers = reactive(emptyAnswers());
/** Key of the open step, `undefined` before the wizard starts */
const currentStep = ref<string | undefined>(undefined);
const done = ref(false);
/* Changing the key remounts the wizard when starting over */
const wizardKey = ref(0);

const summary = computed(() => [
    { term: "Namn", definition: answers.name },
    { term: "Personnummer", definition: answers.personnummer },
    { term: "Boendeform", definition: answers.housing },
    { term: "Hyra per månad", definition: answers.rent ? `${answers.rent} kr` : "–" },
    { term: "Antal barn", definition: answers.children || "0" },
]);

function startOver(): void {
    Object.assign(answers, emptyAnswers());
    currentStep.value = undefined;
    done.value = false;
    wizardKey.value++;
}
</script>

<template>
    <h2>Steg för steg-guide</h2>
    <p>
        <code>FWizard</code> delar upp ett längre flöde i steg. Varje steg valideras innan man går
        vidare. Exemplet är en påhittad ansökan om bostadsbidrag.
    </p>

    <template v-if="done">
        <f-message-box type="success">
            <template #default="{ headingSlotClass }">
                <h3 :class="headingSlotClass">Klart!</h3>
                <p>Ansökan är ifylld (men skickades inte på riktigt).</p>
            </template>
        </f-message-box>
        <f-definition-list :definitions="summary" />
        <f-button variant="secondary" size="medium" @click="startOver">Börja om</f-button>
    </template>

    <f-wizard
        v-else
        :key="wizardKey"
        v-model="currentStep"
        header-tag="h3"
        disable-initial-focus
        @completed="done = true"
    >
        <f-wizard-step key="om-dig" title="Om dig" :use-error-list="false">
            <f-text-field
                v-model="answers.name"
                v-validation.required.maxLength="{ maxLength: { length: 60 } }"
            >
                Namn
            </f-text-field>
            <f-personnummer-text-field v-model="answers.personnummer" v-validation.required>
                Personnummer
            </f-personnummer-text-field>
        </f-wizard-step>

        <f-wizard-step key="boende" title="Ditt boende" :use-error-list="false">
            <f-select-field v-model="answers.housing" v-validation.required>
                <template #label>Boendeform</template>
                <option value="" disabled>Välj boendeform</option>
                <option v-for="type in housingTypes" :key="type" :value="type">{{ type }}</option>
            </f-select-field>
            <f-currency-text-field
                v-model="answers.rent"
                v-validation.required.minValue="{ minValue: { minValue: 1 } }"
            >
                Hyra eller avgift per månad
            </f-currency-text-field>
            <f-numeric-text-field
                v-model="answers.children"
                v-validation.integer.minValue.maxValue="{
                    minValue: { minValue: 0 },
                    maxValue: { maxValue: 15 },
                }"
            >
                Antal barn som bor hos dig (frivilligt)
            </f-numeric-text-field>
        </f-wizard-step>

        <f-wizard-step key="granska" title="Granska och skicka" :use-error-list="false">
            <p>Kontrollera uppgifterna innan du skickar.</p>
            <f-definition-list :definitions="summary" />
        </f-wizard-step>
    </f-wizard>
</template>
