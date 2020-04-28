<template lang="pug">
#app
	//h3.nav
		router-link( to='/test') test
		//-   router-link(to='/page_1') canvas导入处理，黑白化以及描边
		//-   router-link(to='/page_2') page_2
		//-   router-link(to='/huabu') canvas实现简单的画布效果
		//-   router-link(to='/img_huabu') 导入图片，canvas实现简单复现
		//-   router-link(to='/img_huabu_juxing') 导入图片，画画，画矩形
		//-   router-link(to='/drag_change') drag_change
		router-link(to='/svg') svg
		router-link(to='/svg_to_canvas') Svg2Canvas
	router-view
</template>

<script>
export default {
    name: "App",
    components: {},
    methods: {}
};
</script>

<style lang="scss">
body,
html {
    height: 100%;
    width: 100%;
}
.checked {
    fill: #000 !important;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
    width: 100%;
    h3.nav {
        margin-bottom: 30px;
        margin-top: 30px;
    }
    h3.nav a {
        margin: 0 5px;
    }
}
* {
    margin: 0;
    padding: 0;
    -moz-user-select: -moz-none;
    -moz-user-select: none;
    -o-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
