import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const Test = resolve => require(["@/views/0test.vue"], resolve);
const Page_1 = resolve => require(["@/views/page_1.vue"], resolve);
const Page_2 = resolve => require(["@/views/page_2.vue"], resolve);
const Huabu = resolve => require(["@/views/huabu.vue"], resolve);
const ImgHuabu = resolve => require(["@/views/img_huabu.vue"], resolve);
const ImgHuabuJuxing = resolve => require(["@/views/img_huabu_juxing.vue"], resolve);
const Svg = resolve => require(["@/views/svg.vue"], resolve);
const SvgtoCanvas = resolve => require(["@/views/svg_to_canvas.vue"], resolve);
const SvgtoSvg = resolve => require(["@/views/svg_to_svg.vue"], resolve);
const MySvg = resolve => require(["@/views/mg_svg.vue"], resolve);
const OffCanvas = resolve => require(["@/views/offCanvas.vue"], resolve);
const SeatMobile = resolve => require(["@/views/seat_mobile.vue"], resolve);


const routes = [{
        path: "*",
        redirect: "/svg_to_svg" //重定向
    },
    {
        path: "/seat_mobile",
        name: "SeatMobile",
        component: SeatMobile
    },
    {
        path: "/test",
        name: "Test",
        component: Test
    },
    {
        path: "/page_1",
        name: "Page_1",
        component: Page_1
    },
    {
        path: "/page_2",
        name: "Page_2",
        component: Page_2
    },
    {
        path: "/huabu",
        name: "Huabu",
        component: Huabu
    },
    {
        path: "/img_huabu",
        name: "ImgHuabu",
        component: ImgHuabu
    },
    {
        path: "/img_huabu_juxing",
        name: "ImgHuabuJuxing",
        component: ImgHuabuJuxing
    },
    {
        path: "/svg",
        name: "Svg",
        component: Svg
    },
    {
        path: "/svg_to_canvas",
        name: "SvgtoCanvas",
        component: SvgtoCanvas
    },
    {
        path: "/svg_to_svg",
        name: "SvgtoSvg",
        component: SvgtoSvg
    },
    {
        path: "/my_svg",
        name: "MySvg",
        component: MySvg
    }, {
        path: "/offCanvas",
        name: "offCanvas",
        component: OffCanvas
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