<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { FNavigationMenu, FPageHeader, type NavigationMenuItem } from "@fkui/vue";

const route = useRoute();
const router = useRouter();

const menuItems: NavigationMenuItem[] = [
    { label: "Start", route: "start" },
    { label: "Ärenden", route: "arenden" },
    { label: "Applikationer", route: "applikationer" },
    { label: "Delsystem", route: "delsystem" },
    { label: "Formulär", route: "formular" },
    { label: "Komponenter", route: "komponenter" },
];

/* Menu items whose section has no route of its own, mapped to a path */
const sectionPaths: Record<string, string> = { komponenter: "/komponenter" };

const selectedSection = computed(() => route.meta.section ?? "");

function onSelectedRoute(name: string): void {
    if (name === route.name) {
        return;
    }
    void router.push(sectionPaths[name] ?? { name });
}
</script>

<template>
    <f-page-header skip-link="main-content">
        <router-link to="/" class="app-name">FKUI-demo</router-link>
        <template #skip-link-text>Hoppa till huvudinnehåll</template>
    </f-page-header>

    <nav class="app-nav" aria-label="Huvudmeny">
        <f-navigation-menu
            :routes="menuItems"
            :route="selectedSection"
            @selected-route="onSelectedRoute"
        />
    </nav>

    <main id="main-content" class="page" tabindex="-1">
        <router-view />
    </main>
</template>

<style scoped>
.app-name {
    color: inherit;
    text-decoration: none;
}

.app-nav {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1rem;
}
</style>
