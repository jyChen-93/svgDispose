<template>
    <div>
        <canvas id="mycanvas">您的破浏览器不兼容</canvas>
    </div>
</template>
<script>
// @ is an alias to /src
export default {
    name: "",
    components: {},
    data() {
        return {};
    },
    created() { },
    mounted() {
        let canvas = document.getElementById("mycanvas");
        let ctx = canvas.getContext("2d");

        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.rect(0, 0, 100, 100);
        ctx.strokeStyle = "black";
        ctx.fill();
        ctx.stroke();
        canvas.width = 500;
        canvas.height = 500;
    },
    methods: {}
};
</script>
<style lang="scss" scoped>
</style>