import { createRouter, createWebHistory } from "vue-router";

import Scrobbles from "../views/Scrobbles.vue";
import Pending from "../views/Pending.vue";
import Settings from "../views/Settings.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Scrobbles",
            component: Scrobbles,
        },
        {
            path: "/pending",
            name: "Pending",
            component: Pending,
        },
        {
            path: "/settings",
            name: "Settings",
            component: Settings,
        },
    ],
});

export default router;
