<script setup lang="ts">
import { ref } from "vue";
import {
    FButton,
    FLayoutApplicationTemplate,
    FLayoutLeftPanel,
    FLayoutRightPanel,
    FLayoutRightPanelService,
    FPageHeader,
} from "@fkui/vue";

const sections = ["Översikt", "Mina ärenden", "Inkomster", "Meddelanden"];
const section = ref(sections[0]);

const openHelp = (): void => FLayoutRightPanelService.open();
const closeHelp = (): void => FLayoutRightPanelService.close();
</script>

<template>
    <f-layout-application-template nav-label="Toppnavigering">
        <template #header>
            <f-page-header skip-link="app-template-content">
                FKUI-demo: applikationsmall
                <template #skip-link-text>Hoppa till huvudinnehåll</template>
            </f-page-header>
        </template>

        <template #top-navigation>
            <div class="top-nav">
                <router-link :to="{ name: 'komp-sidlayout' }">Tillbaka till komponenterna</router-link>
            </div>
        </template>

        <template #default>
            <f-layout-left-panel nav-label="Sidomeny">
                <template #heading>Meny</template>
                <template #content>
                    <ul class="side-menu">
                        <li v-for="name in sections" :key="name">
                            <button
                                type="button"
                                class="side-menu__item"
                                :aria-current="name === section ? 'page' : undefined"
                                @click="section = name"
                            >
                                {{ name }}
                            </button>
                        </li>
                    </ul>
                </template>
                <template #default>
                    <f-layout-right-panel>
                        <template #heading>Hjälp</template>
                        <template #content>
                            <p>
                                Den högra panelen öppnas och stängs med
                                <code>FLayoutRightPanelService</code>. Den kan också stängas med
                                krysset.
                            </p>
                            <p>Bredden går att ändra genom att dra i kanten.</p>
                        </template>
                        <template #default>
                            <div id="app-template-content" class="content" tabindex="-1">
                                <h1>{{ section }}</h1>
                                <p>
                                    <code>FLayoutApplicationTemplate</code> ger sidhuvud,
                                    toppnavigering, innehåll och sidfot.
                                    <code>FLayoutLeftPanel</code> är menyn till vänster och kan
                                    minimeras. <code>FLayoutRightPanel</code> ligger i den vänstra
                                    panelens innehåll.
                                </p>
                                <p class="buttons">
                                    <f-button variant="primary" size="medium" @click="openHelp">
                                        Öppna hjälp
                                    </f-button>
                                    <f-button variant="secondary" size="medium" @click="closeHelp">
                                        Stäng hjälp
                                    </f-button>
                                </p>
                            </div>
                        </template>
                    </f-layout-right-panel>
                </template>
            </f-layout-left-panel>
        </template>

        <template #footer>
            <div class="footer">Sidfot. Allt är påhittat, och ingenting sparas.</div>
        </template>
    </f-layout-application-template>
</template>

<style scoped>
.top-nav,
.footer {
    padding: 0.75rem 1rem;
}

.side-menu {
    list-style: none;
    margin: 0;
    padding: 0;
}

.side-menu__item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 0;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.side-menu__item[aria-current="page"] {
    font-weight: bold;
    text-decoration: underline;
}

.content {
    padding: 1rem 1.5rem;
}

.buttons {
    display: flex;
    gap: 1rem;
}
</style>
