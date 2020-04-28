<template lang="pug">
    div.warp
        img( ref="myImg" src="../assets/sss.png" style="display:none;" )
        .fixed-top
            button( @click="clearAction") 清除
        .fixed-bottom
            .fixed-left.tools 
                p 工具栏
                .demo-rect(ref="demoRect" @mousedown="rectMouseDown")
            .fixed-right
                canvas.my-canvas(ref="myCanvas") 您的破浏览器不兼容
</template>
<script>
// @ is an alias to /src
var canvas = null, ctx = null, img = null;
// box = null
export default {
    name: "",
    components: {},
    data() {
        return {};
    },
    created() { },
    mounted() { this.init(); },
    methods: {
        init() {
            this.toolsInit();//工具栏初始化
            this.canvasInit();//画布初始化
        },
        canvasInit() {
            canvas = this.$refs.myCanvas;
            //设置宽高
            canvas.width = 500;
            canvas.height = 400;
            //获取绘图环境
            ctx = canvas.getContext("2d");
            //导入图片
            this.importImg()
            //画布功能实现，主要是鼠标的onmousedown，和onmousemove事件
            this.huabuFunction();
        },
        importImg() {//导入图片
            img = this.$refs.myImg;
            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
        },
        huabuFunction() {
            //鼠标按下
            canvas.onmousedown = function (e) {
                //鼠标在 画布上的位置
                var x = e.clientX - canvas.offsetLeft;
                var y = e.clientY - canvas.offsetTop;
                ctx.beginPath();
                ctx.moveTo(x, y);
                console.log("mousedown");

                //鼠标移动
                canvas.onmousemove = function (e) {
                    var x = e.clientX - canvas.offsetLeft;
                    var y = e.clientY - canvas.offsetTop;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                //鼠标抬起事件
                canvas.onmouseup = function () {
                    canvas.onmousemove = null;
                }
            }
        },
        clearAction() {//清除画布
            ctx.clearRect(0, 0, 500, 500);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        },
        rectMouseDown(e) {
            let odiv = e.target;        //获取目标元素
            //算出鼠标相对元素的位置
            let disX = e.clientX - odiv.offsetLeft;
            let disY = e.clientY - odiv.offsetTop;
            document.onmousemove = (e) => {       //鼠标按下并移动的事件
                //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                let left = e.clientX - disX;
                let top = e.clientY - disY;
                //绑定元素位置到positionX和positionY上面
                this.positionX = top;
                this.positionY = left;
                //移动当前元素
                odiv.style.left = left + 'px';
                odiv.style.top = top + 'px';
            };
            document.onmouseup = (e) => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        },
        // rectMouseUp(event) { },
        // rectMouseMove(event) { },
        toolsInit() {
            console.log('toolsInit.......')
            this.$refs.demoRect.addEventListener('onmousedown', (e) => {
                console.log('onmousedown..........')
                e = e || window.event;
                // get the mouse cursor position at startup:
                console.log(e.clientX)
            });
        }
    }
};
</script>
<style lang="scss">
canvas {
    border: 1px solid #ccc;
}
div {
    box-sizing: border-box;
}
@mixin bor {
    border: 1px solid #ccc;
}
.warp {
    position: relative;
    padding-top: 40px;
    .fixed-top {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
    }
    .fixed-bottom {
        display: flex;
        .fixed-left {
            width: 100px;
            float: left;
            border: 1px solid #ccc;
        }
        .fixed-right {
            flex: 1;
            overflow: auto;
            .my-canvas {
                width: 100%;
            }
        }
    }
}
.tools {
    .demo-rect {
        width: 50px;
        height: 50px;
        @include bor;
        margin: 10px auto;
        position: fixed;
        // cursor: all-scroll;
    }
}
</style>