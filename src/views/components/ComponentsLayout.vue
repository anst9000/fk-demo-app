<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { FNavigationMenu, type NavigationMenuItem } from "@fkui/vue";
import { componentPages } from "./pages";

const route = useRoute();
const router = useRouter();

const menuItems: NavigationMenuItem[] = componentPages.map((page) => ({
    label: page.label,
    route: page.name,
}));

const selected = computed(() => String(route.name ?? ""));

function onSelectedRoute(name: string): void {
    if (name !== route.name) {
        void router.push({ name });
    }
}
</script>

<template>
    <h1>Komponenter</h1>
    <p>
        Exempel på fler komponenter från Försäkringskassans designsystem. Allt är påhittat och
        ingenting sparas.
    </p>

    <div class="components-layout">
        <nav class="components-layout__menu" aria-label="Komponentexempel">
            <f-navigation-menu
                vertical
                :routes="menuItems"
                :route="selected"
                @selected-route="onSelectedRoute"
            />
        </nav>
        <div class="components-layout__content">
            <router-view />
        </div>
    </div>
</template>

<style scoped>
.components-layout {
    display: grid;
    grid-template-columns: 14rem minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
}

.components-layout__content > :deep(h2:first-child) {
    margin-top: 0;
}

@media (max-width: 47.99rem) {
    .components-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: 1rem;
    }
}
</style>
