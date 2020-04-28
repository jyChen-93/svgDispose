<template>
    <div>
        <img ref="myImg" src="../assets/sss.png" style="display:none;" />
        <div id="box"></div>
        <div id="nul">清除</div>
        <br />
        <canvas id="mycanvas">您的破浏览器不兼容</canvas>
    </div>
</template>
<script>
// @ is an alias to /src
var canvas = null, box = null, nul = null, ctx = null, img = null;
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
            canvas = document.getElementById("mycanvas");
            box = document.getElementById("box");
            nul = document.getElementById("nul");

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
        importImg() {
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
                //点击box改变画笔颜色 
                box.onclick = function () {
                    ctx.strokeStyle = "yellow";
                }
                //点击nul清空画布
                nul.onclick = function () {
                    ctx.clearRect(0, 0, 500, 500);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }

                //鼠标抬起事件
                canvas.onmouseup = function () {
                    canvas.onmousemove = null;
                }


            }
        }
    }
};
</script>
<style>
canvas {
    border: 1px solid #ccc;
}

#box {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: yellow;
}

#nul {
    display: inline-block;
    margin-left: 10px;
    font-size: 12px;
    text-align: center;
    width: 40px;
    height: 20px;
    background: pink;
}
</style>