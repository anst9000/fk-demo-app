import type { RouteComponent } from "vue-router";

export interface ComponentPage {
    path: string;
    name: string;
    label: string;
    component: () => Promise<RouteComponent>;
}

/** The pages in the "Komponenter" section, in menu order */
export const componentPages: ComponentPage[] = [
    {
        path: "aterkoppling",
        name: "komp-aterkoppling",
        label: "Återkoppling",
        component: () => import("./FeedbackDemo.vue"),
    },
    {
        path: "expanderbart",
        name: "komp-expanderbart",
        label: "Expanderbart",
        component: () => import("./ExpandableDemo.vue"),
    },
    {
        path: "dialoger",
        name: "komp-dialoger",
        label: "Dialoger och menyer",
        component: () => import("./DialogsDemo.vue"),
    },
    {
        path: "steg-for-steg",
        name: "komp-steg",
        label: "Steg för steg",
        component: () => import("./WizardDemo.vue"),
    },
    {
        path: "tabeller",
        name: "komp-tabeller",
        label: "Tabeller och listor",
        component: () => import("./TablesDemo.vue"),
    },
    {
        path: "falt",
        name: "komp-falt",
        label: "Fler fält och validering",
        component: () => import("./FieldsDemo.vue"),
    },
    {
        path: "sidlayout",
        name: "komp-sidlayout",
        label: "Sidlayout",
        component: () => import("./LayoutDemo.vue"),
    },
    {
        path: "ovrigt",
        name: "komp-ovrigt",
        label: "Kalender, ikoner, filer m.m.",
        component: () => import("./MiscDemo.vue"),
    },
];
