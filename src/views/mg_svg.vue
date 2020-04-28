<template>
    <div>
        <svg xmlns="http://www.w3.org/2000/svg"
             width="300"
             height="300"
             viewBox="0 0 1164.73 725.31"
             id="ss_vg">
            <!-- <path d="M300 27.27 A272.73 272.73 0 0 1 536.19110837413 163.63499999999996 "
                  fill="red"></path> -->
            <path id="test"></path>
            <!-- <path d="M100 0 A100 100 0 0 1 200 100 "
                  stroke="lime"
                  stroke-width="3"
                  fill-opacity="0.5" />
            <path d="M100 100 A100 100 0 1 1 200 200 "
                  stroke="lime"
                  stroke-width="3"
                  fill-opacity="0.5" /> -->
        </svg>
    </div>
</template>
<script>
// @ is an alias to /src
export default {
    name: "",
    components: {},
    data () {
        return {};
    },
    created () { },
    mounted () {
        this.draw()
        // this.circle_center(2, 4, 4, 2, 2)
    },
    methods: {
        counted (x1, y1, x2, y2, x3, y3) {
            console.log(x1, y1, x2, y2, x3, y3)
            // console.log(x2 - x1)
            let a_b = Math.abs(Math.pow([Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)], 0.5))
            let a_c = Math.abs(Math.pow([Math.pow((x3 - x1), 2) + Math.pow((y3 - y1), 2)], 0.5))
            console.log(a_b)
            let pre = (x2 - x1) * (x3 - x1) + (y2 - y1) * (y3 - y1);
            let deg = Math.acos(pre / (a_b * a_c))
            console.log(pre / (a_b * a_c))
            console.log("deg=" + deg)
        },
        count_deg (x1, x2, r) {
            let deg = Math.asin((x2 - x1) / r) * 180 / Math.PI;
            console.log(deg)
        },
        circle_center (x1, y1, x2, y2, R) {//计算圆心
            // let x1 = 2, y1 = 4, x2 = 4, y2 = 2, R = 2;
            let c1 = 0, c2 = 0, A = 0, B = 0, C = 0, y01 = 0, x01 = 0, x02 = 0, y02 = 0;
            c1 = (Math.pow(x2, 2) - Math.pow(x1, 2) + Math.pow(y2, 2) - Math.pow(y1, 2)) / 2 / (x2 - x1);
            c2 = (y2 - y1) / (x2 - x1);

            A = 1.0 + Math.pow(c2, 2);
            B = 2 * (x1 - c1) * c2 - 2 * y1;
            C = Math.pow((x1 - c1), 2) + Math.pow(y1, 2) - Math.pow(R, 2);

            y01 = (-B + Math.sqrt(B * B - 4 * A * C)) / 2 / A;
            x01 = c1 - c2 * y01;

            y02 = (-B - Math.sqrt(B * B - 4 * A * C)) / 2 / A;
            x02 = c1 - c2 * y02;
            return {
                cx1: x01,
                cy1: y01,
                cx2: x02,
                cy2: y02,
            }

            // console.log(x01, y01)
            // console.log(x02, y02)
        },
        draw () {

            var sweepFlag = 1; //1 顺时针，0逆时针
            var deg = 30;

            var startX = 300; var startY = 27.27;
            var r = 272.73;
            var x = 0, y = 0; //终点坐标

            // 计算终点的坐标 deg是角度,Math.sin(arc) arc = 2Math.PI / 360
            // var arc = Math.sin(2 * Math.PI / 360 * deg);
            if (sweepFlag == 1) {
                x = startX + r * Math.sin(2 * Math.PI / 360 * deg);
                y = startY + r - r * Math.cos(2 * Math.PI / 360 * deg);
            } else {
                x = startX - r * Math.sin(2 * Math.PI / 360 * deg);
                y = startY + r - r * Math.cos(2 * Math.PI / 360 * deg);
            }
            console.log(x, y)
            var d = 'M' + startX + ' ' + startY + ' A' + r + ' ' + r + ' 0 0 ' + sweepFlag + ' ' + x + ' ' + y + ' ';
            var svgNode = document.getElementById("test");
            if (!svgNode) { return; }
            var color = sweepFlag == 1 ? 'lime' : 'red';
            // let node_s = document.createElement("path");
            svgNode.setAttribute('d', d);
            svgNode.setAttribute('stroke', "red");
            svgNode.setAttribute('fill', "none");
            // this.count_deg(111.93, 47.93, 359.41);
            // this.count_deg(startX, x, r);
            let c_position = this.circle_center(startX, startY, x, y, r);
            console.log(c_position)
            this.counted(c_position.cx1, c_position.cy1, startX, startY, x, y);
            // let deg1 = this.count_deg(c_position.cx1)
            // svgNode.append(node_s);
            // pathNode.setAttributeNS(null, "d", d);
            // pathNode.animate(700, '<>').attr({ 'stroke': color });
        }
    }
};
</script>
<style lang="scss" scoped>
</style>