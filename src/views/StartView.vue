<script setup lang="ts">
import { RouterLink } from "vue-router";
import { FCard } from "@fkui/vue";

interface Section {
    title: string;
    text: string;
    to: string;
    linkText: string;
}

const sections: Section[] = [
    {
        title: "Ärenden",
        text: "Bläddra bland 120 påhittade ärenden och öppna ett ärende för att se detaljerna.",
        to: "/arenden",
        linkText: "Visa ärenden",
    },
    {
        title: "Applikationer",
        text: "Se vilka applikationer som finns, vem som äger dem och vilka delsystem de består av.",
        to: "/applikationer",
        linkText: "Visa applikationer",
    },
    {
        title: "Delsystem",
        text: "Alla delsystem med team, miljö och version. Varje delsystem länkar till sin applikation.",
        to: "/delsystem",
        linkText: "Visa delsystem",
    },
    {
        title: "Formulär",
        text: "Ett exempelformulär med de vanligaste fälttyperna och validering från designsystemet.",
        to: "/formular",
        linkText: "Öppna formuläret",
    },
];
</script>

<template>
    <section class="hero">
        <h1>Välkommen till FKUI-demo</h1>
        <p class="hero__lead">
            En liten exempelapplikation byggd med Vue, TypeScript och Försäkringskassans
            designsystem. All data kommer från ett mockat repo och är påhittad.
        </p>
        <router-link to="/arenden" class="button button--primary">Kom igång</router-link>
    </section>

    <div class="sections">
        <f-card v-for="section in sections" :key="section.to">
            <template #header="{ headingSlotClass }">
                <h2 :class="headingSlotClass">{{ section.title }}</h2>
            </template>
            <template #default>
                <p>{{ section.text }}</p>
                <router-link :to="section.to" class="button button--secondary">
                    {{ section.linkText }}
                </router-link>
            </template>
        </f-card>
    </div>
</template>

<style scoped>
.hero {
    padding: 2rem 0 2.5rem;
}

.hero__lead {
    max-width: 40rem;
    font-size: 1.125rem;
}

.sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1rem;
}
</style>
