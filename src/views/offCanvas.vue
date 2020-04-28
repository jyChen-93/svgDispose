<template lang="pug">
div 
    .top
        img( ref="iconShow" src="../assets/seat_icon_show.svg" alt="" sizes="" srcset="" id="500")
    .content
        canvas.my-canvas(ref="canvas")
</template>

<script>
// @ is an alias to /src
export default {
    name: "",
    components: {},
    data() {
        return {
            canvas: null
        };
    },
    created() {},
    mounted() {
        let _this=this;
        var canvas = this.$refs.canvas; //非离屏canvas这个是上面html中定义好的
        canvas.width = 400;
        canvas.height = 400;
        var ctx = canvas.getContext("2d");

        var offCanvas = document.createElement("canvas"); //离屏canvas 通过代码创建出来的
        offCanvas.width = 400;
        offCanvas.height = 400;
        var offContext = offCanvas.getContext("2d");
        //对离屏canvas 进行绘制  （所有的绘制在离屏canvas上面进行绘制 ）
        // offContext.rect(0, 0, 400, 400);
        // offContext.fillStyle = 'blue';
        // offContext.fill();
        var img = new Image();
        img.src = "../assets/seat_icon_show.svg";
        console.log(img)
        img.onload = function () {
            console.log(img)
            
        }

        setTimeout(function(){
            offContext.drawImage(_this.$refs.iconShow, 0, 0);
            ctx.clearRect(0, 0, 400, 400)
            ctx.drawImage(offCanvas, 0, 0);
            ctx.drawImage(offCanvas, 100, 100);
        },100);
        // ctx.drawImage(this.$refs.iconShow, 0, 0); //将之前绘制好的离屏canvas 当做一张图片 绘制在非离屏canvas上 这样就显示出来了
    },
    methods: {

    }
};
</script>

<style lang="scss" scoped>
</style>
