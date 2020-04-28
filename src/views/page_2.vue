<template lang="pug">
  #page_1
    img(ref="myImg" src="../assets/3.png" style="display:none;")
    canvas(ref="myCanvas" width="500" height="400" style="border:1px solid #c3c3c3;") 抱歉！！！你当前使用的流览器不支持canvas！！！请换一个！！！
</template>

<script>
let _this = null, ctx = null, WIDTH = 0, HEIGHT = 0,
    pixel = null, opixel = null, edge = [];// xpixel = null,
export default {
    components: {},
    data() {
        return {};
    },
    created() {
        _this = this;
    },
    mounted() {
        this.init();
    },
    beforeDestroy() {
        ctx = null;
    },
    methods: {
        init() {

            ctx = this.$refs.myCanvas.getContext("2d");
            WIDTH = ctx.canvas.width;
            HEIGHT = ctx.canvas.height;
            console.log("ctx............");
            console.log(ctx);

            _this.clickAction()

            //画网格
            // this.drawGrid("#ccc", 50, 50);
            let img = this.$refs.myImg;
            img.onload = function () {
                ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
                pixel = (ctx.getImageData(0, 0, WIDTH, HEIGHT));
                // _this.whiteBlack();
            };
        },
        //绑定点击事件
        clickAction() {
            this.$refs.myCanvas.addEventListener("click", (e) => {
                let pos = _this.getEventPosition(e)
                console.log(opixel)
                console.log((ctx.getImageData(pos.x, pos.y, 1, 1)).data);
                console.log(pos)
            })
        },
        getEventPosition(ev) {
            let x, y;
            if (ev.layerX || ev.layerX == 0) {
                x = ev.layerX;
                y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                x = ev.offsetX;
                y = ev.offsetY;
            }
            return { x: x, y: y };
        },
        //获取固定的区域图像数据
        getCtxImageData() {
            let imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
            // ctx.putImageData(imgData, 300, 250);
            console.log(imgData.data);
            for (let i = 0; i < imgData.data.length; i += 4) {
                imgData.data[i] = 255 - imgData.data[i];//红色
                imgData.data[i + 1] = 255 - imgData.data[i + 1];//绿色 
                imgData.data[i + 2] = 255 - imgData.data[i + 2];//蓝色 
                imgData.data[i + 3] = 155;//alpha 通道 (0-255; 0 是透明的，255 是完全可见的)
            }
            ctx.putImageData(imgData, 0, 0);
        },
        //黑白化
        whiteBlack() {
            let red = 0;
            let green = 0;
            let blue = 0;
            let index = null;
            let average = null;
            for (let i = 0; i < HEIGHT; i++) {
                for (let j = 0; j < WIDTH; j++) {
                    index = (pixel.width * i + j) * 4;
                    red = index;
                    green = index + 1;
                    blue = index + 2;
                    average = Math.round((pixel.data[red] + pixel.data[green] + pixel.data[blue]) / 3);
                    if (average >= 254) {
                        pixel.data[red] = 255;
                        pixel.data[green] = 255;
                        pixel.data[blue] = 255;
                    } else {
                        pixel.data[red] = 0;
                        pixel.data[green] = 0;
                        pixel.data[blue] = 0;
                    }
                }
            }
            ctx.putImageData(pixel, 0, 0);
            this.imageEdge()
        },
        //边缘化
        imageEdge() {
            opixel = ctx.getImageData(0, 0, WIDTH, HEIGHT);
            let red = 0;
            let index = null;
            let redVal = null;
            let prevRedVal = null;
            let nextRedVal = null;
            let topRedVal = null;
            let bottomRedVal = null;

            for (let i = 0; i < HEIGHT; i++) {
                for (let j = 0; j < WIDTH; j++) {
                    index = (pixel.width * i + j) * 4;
                    red = index;
                    redVal = pixel.data[red];
                    prevRedVal = red - 4 >= 0 ? pixel.data[red - 4] : pixel.data[red];
                    nextRedVal = pixel.data[red + 4];
                    topRedVal = (red - WIDTH * 4) >= 0 ? pixel.data[red - WIDTH * 4] : pixel.data[red];
                    bottomRedVal = pixel.data[red + WIDTH * 4];
                    if (redVal != nextRedVal || redVal != topRedVal || redVal != prevRedVal || redVal != bottomRedVal) {
                        opixel.data[red] = 255;
                        edge.push(red);
                    }
                }
            }
            ctx.putImageData(opixel, 0, 0);
        },
        //画网格
        drawGrid(color, stepx, stepy) {
            ctx.save();
            ctx.fillStyle = "white";
            // console.log(ctx);
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.lineWidth = 0.3;
            ctx.strokeStyle = color;
            for (let i = stepx; i < ctx.canvas.width; i += stepx) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, ctx.canvas.height);
                ctx.closePath();
                ctx.stroke();
            }
            for (let j = stepy; j < ctx.canvas.height; j += stepy) {
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(ctx.canvas.width, j);
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        }
    }
};
</script>

<style>
</style>
