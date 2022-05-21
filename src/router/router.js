import { createRouter, createWebHistory } from 'vue-router'
import Converter from '@views/Converter.vue'
import SavedSongs from '@views/SavedSongs.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Converter,
        meta: {
            title: "Genshin Lyre Parser - Converter",
        },
    },
    {
        path: '/saved',
        name: 'Saved Songs',
        component: SavedSongs,
        meta: {
            title: "Genshin Lyre Parser - Saved Songs",
        },
    },
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _, next) => {
    document.title = to.meta.title || "Genshin Lyre Parser";
    next();
});

export default router