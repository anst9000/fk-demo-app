import { createRouter, createWebHistory } from "vue-router";
import { componentPages } from "../views/components/pages";

declare module "vue-router" {
    interface RouteMeta {
        /** Page title, shown in the browser tab */
        title?: string;
        /** Which navigation menu item is selected */
        section?: string;
    }
}

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "start",
            component: () => import("../views/StartView.vue"),
            meta: { title: "Start", section: "start" },
        },
        {
            path: "/arenden",
            name: "arenden",
            component: () => import("../views/CaseListView.vue"),
            meta: { title: "Ärenden", section: "arenden" },
        },
        {
            path: "/arenden/:id(\\d+)",
            name: "arende",
            component: () => import("../views/CaseDetailView.vue"),
            props: (route) => ({ id: Number(route.params.id) }),
            meta: { title: "Ärende", section: "arenden" },
        },
        {
            path: "/applikationer",
            name: "applikationer",
            component: () => import("../views/ApplicationListView.vue"),
            meta: { title: "Applikationer", section: "applikationer" },
        },
        {
            path: "/applikationer/:id(\\d+)",
            name: "applikation",
            component: () => import("../views/ApplicationDetailView.vue"),
            props: (route) => ({ id: Number(route.params.id) }),
            meta: { title: "Applikation", section: "applikationer" },
        },
        {
            path: "/delsystem",
            name: "delsystem",
            component: () => import("../views/SubsystemListView.vue"),
            meta: { title: "Delsystem", section: "delsystem" },
        },
        {
            path: "/delsystem/:id(\\d+)",
            name: "delsystem-detalj",
            component: () => import("../views/SubsystemDetailView.vue"),
            props: (route) => ({ id: Number(route.params.id) }),
            meta: { title: "Delsystem", section: "delsystem" },
        },
        {
            path: "/formular",
            name: "formular",
            component: () => import("../views/FormView.vue"),
            meta: { title: "Formulär", section: "formular" },
        },
        {
            path: "/komponenter",
            component: () => import("../views/components/ComponentsLayout.vue"),
            meta: { section: "komponenter" },
            children: [
                { path: "", redirect: { name: "komp-aterkoppling" } },
                ...componentPages.map((page) => ({
                    path: page.path,
                    name: page.name,
                    component: page.component,
                    meta: { title: page.label, section: "komponenter" },
                })),
            ],
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("../views/NotFoundView.vue"),
            meta: { title: "Sidan finns inte" },
        },
    ],
    scrollBehavior(_to, _from, savedPosition) {
        return savedPosition ?? { top: 0 };
    },
});

router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} – FKUI-demo` : "FKUI-demo";
});
