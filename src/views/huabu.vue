<template>
    <div>
        <div id="box"></div>
        <div id="nul">清除</div>
        <br />
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
    mounted() { this.init(); },
    methods: {
        init() {
            var canvas = document.getElementById("mycanvas");
            var box = document.getElementById("box");
            var nul = document.getElementById("nul");

            //设置宽高
            canvas.width = 500;
            canvas.height = 500;

            //获取绘图环境
            var cxt = canvas.getContext("2d");

            //鼠标按下
            canvas.onmousedown = function (e) {
                //鼠标在 画布上的位置
                var x = e.clientX - canvas.offsetLeft;
                var y = e.clientY - canvas.offsetTop;
                cxt.beginPath();
                cxt.moveTo(x, y);
                console.log("mousedown");

                //鼠标移动
                canvas.onmousemove = function (e) {
                    var x = e.clientX - canvas.offsetLeft;
                    var y = e.clientY - canvas.offsetTop;
                    cxt.lineTo(x, y);
                    cxt.stroke();
                }
                //点击box改变画笔颜色 
                box.onclick = function () {
                    cxt.strokeStyle = "yellow";
                }
                //点击nul清空画布
                nul.onclick = function () {
                    cxt.clearRect(0, 0, 500, 500);
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