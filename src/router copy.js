import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const SvgtoSvg = resolve => require(["@/views/svg_to_svg.vue"], resolve);


const routes = [{
        path: "*",
        redirect: "/svg_to_svg" //重定向
    },
    {
        path: "/svg_to_svg",
        name: "SvgtoSvg",
        component: SvgtoSvg
    }
]


const router = new VueRouter({
    mode: "hash",
    base: process.env.BASE_URL,
    routes,
    scrollBehavior() {
        window.scrollTo(0, 0);
    }
});
export default router;