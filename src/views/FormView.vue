<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
    FButton,
    FCheckboxField,
    FCurrencyTextField,
    FDatepickerField,
    FDefinitionList,
    FEmailTextField,
    FFieldset,
    FFileSelector,
    FMessageBox,
    FPersonnummerTextField,
    FPhoneTextField,
    FPostalCodeTextField,
    FRadioField,
    FSelectField,
    FTextareaField,
    FTextField,
    FValidationForm,
} from "@fkui/vue";

interface ApplicationForm {
    name: string;
    personnummer: string;
    email: string;
    phone: string;
    postalCode: string;
    benefit: string;
    startDate: string;
    amount: string;
    contactMethod: string;
    channels: string[];
    message: string;
    files: string[];
    consent: boolean;
}

function emptyForm(): ApplicationForm {
    return {
        name: "",
        personnummer: "",
        email: "",
        phone: "",
        postalCode: "",
        benefit: "",
        startDate: "",
        amount: "",
        contactMethod: "",
        channels: [],
        message: "",
        files: [],
        consent: false,
    };
}

const benefits = ["Föräldrapenning", "Sjukpenning", "Bostadsbidrag", "Barnbidrag"];
const contactMethods = [
    { value: "email", label: "E-post" },
    { value: "phone", label: "Telefon" },
    { value: "letter", label: "Brev" },
];
const channels = [
    { value: "sms", label: "Sms" },
    { value: "app", label: "Notis i appen" },
    { value: "mypages", label: "Mina sidor" },
];

const form = reactive<ApplicationForm>(emptyForm());
const submitted = ref<ApplicationForm | null>(null);
/* Changing the key remounts the form, which also clears validation state */
const formKey = ref(0);

function onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    form.files = Array.from(input.files ?? []).map((file) => file.name);
}

function onSubmit(): void {
    submitted.value = structuredClone({ ...form, channels: [...form.channels], files: [...form.files] });
}

function startOver(): void {
    Object.assign(form, emptyForm());
    submitted.value = null;
    formKey.value++;
}

function label(list: Array<{ value: string; label: string }>, value: string): string {
    return list.find((item) => item.value === value)?.label ?? value;
}

const summary = computed(() => {
    const s = submitted.value;
    if (!s) {
        return [];
    }
    return [
        { term: "Namn", definition: s.name },
        { term: "Personnummer", definition: s.personnummer },
        { term: "E-post", definition: s.email },
        { term: "Telefon", definition: s.phone || "–" },
        { term: "Postnummer", definition: s.postalCode || "–" },
        { term: "Förmån", definition: s.benefit },
        { term: "Startdatum", definition: s.startDate },
        { term: "Belopp", definition: s.amount ? `${s.amount} kr` : "–" },
        { term: "Kontaktsätt", definition: label(contactMethods, s.contactMethod) },
        {
            term: "Aviseringar",
            definition: s.channels.map((c) => label(channels, c)).join(", ") || "–",
        },
        { term: "Meddelande", definition: s.message || "–" },
        { term: "Bifogade filer", definition: s.files.join(", ") || "–" },
    ];
});
</script>

<template>
    <h1>Formulär</h1>
    <p>
        Ett exempelformulär med olika fälttyper från designsystemet. Fält markerade som
        obligatoriska valideras när du lämnar fältet och när du skickar.
    </p>

    <template v-if="submitted">
        <f-message-box type="success">
            <template #default="{ headingSlotClass }">
                <h2 :class="headingSlotClass">Tack, formuläret är skickat</h2>
                <p>Inget skickades på riktigt. Så här såg uppgifterna ut:</p>
            </template>
        </f-message-box>
        <f-definition-list :definitions="summary" />
        <f-button variant="secondary" size="medium" @click="startOver">Fyll i igen</f-button>
    </template>

    <f-validation-form v-else :key="formKey" class="form" @submit="onSubmit">
        <template #error-message>
            Oj, du har glömt att fylla i något. Gå till:
        </template>

        <h2>Personuppgifter</h2>

        <f-text-field
            v-model="form.name"
            v-validation.required.maxLength="{ maxLength: { length: 60 } }"
        >
            <template #default>Namn</template>
        </f-text-field>

        <f-personnummer-text-field v-model="form.personnummer" v-validation.required>
            <template #default>Personnummer</template>
            <template #description="{ formatDescriptionClass }">
                <span :class="formatDescriptionClass">(ÅÅÅÅMMDD-NNNN)</span>
            </template>
        </f-personnummer-text-field>

        <f-email-text-field v-model="form.email" v-validation.required>
            <template #default>E-post</template>
        </f-email-text-field>

        <f-phone-text-field v-model="form.phone">
            <template #default>Telefonnummer (frivilligt)</template>
        </f-phone-text-field>

        <f-postal-code-text-field v-model="form.postalCode">
            <template #default>Postnummer (frivilligt)</template>
        </f-postal-code-text-field>

        <h2>Ansökan</h2>

        <f-select-field v-model="form.benefit" v-validation.required>
            <template #label>Förmån</template>
            <option value="" disabled>Välj förmån</option>
            <option v-for="benefit in benefits" :key="benefit" :value="benefit">
                {{ benefit }}
            </option>
        </f-select-field>

        <f-datepicker-field v-model="form.startDate" v-validation.required>
            <template #default>Från och med datum</template>
        </f-datepicker-field>

        <f-currency-text-field
            v-model="form.amount"
            v-validation.minValue="{ minValue: { minValue: 0 } }"
        >
            <template #default>Belopp per månad (frivilligt)</template>
        </f-currency-text-field>

        <f-fieldset v-validation.required name="contact-method">
            <template #label>Hur vill du bli kontaktad?</template>
            <f-radio-field
                v-for="method in contactMethods"
                :key="method.value"
                v-model="form.contactMethod"
                :value="method.value"
            >
                {{ method.label }}
            </f-radio-field>
        </f-fieldset>

        <f-fieldset name="channels">
            <template #label>Aviseringar (frivilligt)</template>
            <template #description="{ descriptionClass }">
                <span :class="descriptionClass">Välj ett eller flera alternativ.</span>
            </template>
            <f-checkbox-field
                v-for="channel in channels"
                :key="channel.value"
                v-model="form.channels"
                :value="channel.value"
            >
                {{ channel.label }}
            </f-checkbox-field>
        </f-fieldset>

        <f-textarea-field v-model="form.message" :maxlength="500" :soft-limit="400">
            <template #default>Meddelande (frivilligt)</template>
        </f-textarea-field>

        <div class="file-selector">
            <f-file-selector @change="onFilesSelected">Bifoga fil</f-file-selector>
            <ul v-if="form.files.length > 0">
                <li v-for="file in form.files" :key="file">{{ file }}</li>
            </ul>
        </div>

        <f-fieldset v-validation.required name="consent">
            <template #label>Bekräftelse</template>
            <f-checkbox-field v-model="form.consent" :value="true">
                Jag intygar att uppgifterna stämmer
            </f-checkbox-field>
        </f-fieldset>

        <div class="actions">
            <f-button type="submit" variant="primary" size="medium">Skicka</f-button>
            <f-button variant="secondary" size="medium" @click="startOver">Rensa</f-button>
        </div>
    </f-validation-form>
</template>

<style scoped>
.form {
    max-width: 40rem;
}

.file-selector {
    margin-bottom: 1.5rem;
}

.actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}
</style>
