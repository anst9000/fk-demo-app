import { ref, watch } from "vue";

export type ThemeChoice = "light" | "dark" | "auto";

const STORAGE_KEY = "fk-demo-theme";

function readStored(): ThemeChoice {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === "light" || value === "dark" ? value : "auto";
    } catch {
        return "auto";
    }
}

/* The chosen theme, shared by the whole app and remembered between visits */
export const theme = ref<ThemeChoice>(readStored());

function apply(choice: ThemeChoice): void {
    const root = document.documentElement;
    if (choice === "auto") {
        delete root.dataset.theme;
    } else {
        root.dataset.theme = choice;
    }
    try {
        localStorage.setItem(STORAGE_KEY, choice);
    } catch {
        /* Private mode or blocked storage: the choice lasts until the page reloads */
    }
}

/* Runs at once, so the page never shows in the wrong theme first */
watch(theme, apply, { immediate: true });
