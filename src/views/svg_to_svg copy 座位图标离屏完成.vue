<template lang="pug">
.warp
    div(style="display:none;")
        img( ref="iconNone" src="../assets/seat_icon_none.svg" alt="" sizes="" srcset="")
    .mini-map(ref="miniMap" :style="{width:miniMap.width+'px',height:miniMap.height+'px'}" v-show="miniMap.show")
        .checkBox(ref="checkBox" :style="{width:checkBox.width+'px',height:checkBox.height+'px',top:checkBox.top+'px',left:checkBox.left+'px'}")
    .top
        img( ref="iconShow" src="../assets/seat_icon_show.svg" alt="" sizes="" srcset="" id="500")
        button(@click="saveAction") save
        button(@click="toMin") min
        button(@click="toMax") max
        button(@click="miniMap.show=!miniMap.show") miniMap
        button(@click="checkedShapeShow=true") 修改区域座位信息
        button(@click="changeSeatIcon") 修改座位大小和间距
        button(@click="batchAction=!batchAction") 批量设置座位
        h4 shapeInfo-->
            span 角度：
        //button(@click="toMax") toMax
    .content(ref="content")
        canvas.my-canvas(ref="my_canvas"  :style="{left:position.left+'px',top:position.top+'px',zIndex:(batchAction?2:0)}" v-show="setWidth!=0&&wheelMax==wheelNum") 浏览器不支持canvas
        .svg-warp(ref="svgWarp" v-html="svg" :class="{'showCanvas':wheelNum==wheelMax}")
    .pop(v-show="checkedShapeShow")
        .pop-content
            h4
                span 行：
                input(type="number" v-model.number="checkedShape.rows")
            h4
                span 列：
                input(type="number" v-model.number="checkedShape.cols")
            h4
                span 排座-起始行：
                input(type="number" v-model.number="checkedShape.startRow")
            h4
                span 排座-起始列（座）：
                input(type="number" v-model.number="checkedShape.startCol")
            h4
                span 横向排序方向：
                em.radio(:class="{'checked':checkedShape.orderRow==0}" @click="checkedShape.orderRow=0") 逆时针
                em.radio(:class="{'checked':checkedShape.orderRow==1}" @click="checkedShape.orderRow=1") 顺时针
            h4
                span 竖直排序方向：
                em.radio( :class="{'checked':checkedShape.orderCol==0}" @click="checkedShape.orderCol=0") 由里向外
                em.radio( :class="{'checked':checkedShape.orderCol==1}" @click="checkedShape.orderCol=1") 由外向里
            h4
                button(@click="checkedShapeSeatComfrim") 确认
                button(@click="checkedShapeSeatCancle") 取消
    .pop(v-show="popSeatIconShow")
        .pop-content
            h4
                span 宽：
                input(type="number" v-model.number="popSeatIcon.width")
            h4
                span 高：
                input(type="number" v-model.number="popSeatIcon.height")
            h4
                span 横向间距：
                input(type="number" v-model.number="popSeatIcon.marginRight")
            h4
                span 竖直间距：
                input(type="number" v-model.number="popSeatIcon.marginBottom")
            h4
                button(@click="seatIconComfrim") 确认
                button(@click="changeSeatIcon") 取消
</template>

<script>
// @ is an alias to /src
import TOOLS from '@/utils/tools.js'
import COMMON from '@/utils/common.js'
let _this = null,
    contentWarp = null,
    svgWarp = null,
    svgDom = null,
    move_x = 0,
    move_y = 0,
    warpIsDragging = false;
let canvas = null,
    ctx = null;
export default {
    name: "",
    components: {},
    data() {
        return {
            batchAction: false, //批量操作

            // wheelMax: 1,//最大缩放值
            wheelMax: 1.2, //最大缩放值

            wheelNum: 0, //当前缩放值
            wheelMin: 0, //最小缩放值

            center: {
                find: false,
                x: 0,
                y: 0
            },
            canvas: {
                left: 0,
                top: 0
            },

            svg: "",

            maxWidth: 0,
            maxHeight: 0,
            setWidth: 0,
            setHeight: 0,
            minWidth: 0,
            minHeight: 0,

            position: {
                left: 0,
                top: 0
            },
            cont: {
                width: 0,
                height: 0,
                offsetLeft: 0,
                offsetTop: 0,
                center: []

            },
            miniMap: {
                show: true,
                width: 0,
                height: 0
            },
            checkBox: {
                width: 0,
                height: 0,
                top: 0,
                left: 0,
            },

            popSeatIconShow: false,
            popSeatIcon: {
                icon: "",
                width: 20,
                height: 20,
                marginRight: 5,
                marginBottom: 5
            },
            seatIcon: { //座位图标
                iconShow: "",
                iconNone: "",
                width: 20,
                height: 20,
                marginRight: 5,
                marginBottom: 5
            },

            checkedShapeShow: false,
            checkedShape: {
                rows: 10,
                cols: 10,
                startRow: 1, //排座的开始行
                startCol: 1, //排座的开始列（座）
                orderRow: 0, //横向排序方向：0：逆时针  1：反向
                orderCol: 0 //纵向排序方向：0：从里向外  1：反向
                // seats:[]
            },

            shapeList: [
                // {
                //     cenPoint:[0,0],
                //     angle:0,
                //     shapeId:0,
                //     rows:10,
                //     cols:10,
                //     startRow:2,//排座的开始行
                //     startCol:2,//排座的开始列（座）
                //     seats:[
                //        [ {seatId:0,status:0,ticketLevel:0},{seatId:2,status:0,ticketLevel:0}],
                //        [ {seatId:7,status:0,ticketLevel:0},{seatId:5,status:0,ticketLevel:0}],
                //        [ {seatId:6,status:0,ticketLevel:0},{seatId:4,status:0,ticketLevel:0}]
                //     ]
                // }
            ],
            renderList: []
        };
    },
    computed: {
        powNum: function () {
            return this.wheelNum * this.wheelNum;
        },
        sqrtNum() {
            return this.wheelNum * this.wheelNum;
        },
        testList() {
            return JSON.parse(JSON.stringify(this.shapeList))
        }
    },
    watch: {
        position: {
            handler(newVal, oldVal) {
                svgWarp.style.left = newVal.left + 'px';
                svgWarp.style.top = newVal.top + 'px';
            },
            deep: true
        },
        testList: {
            handler(list, oldVal) {
                if (this.wheelNum < this.wheelMax) return false;
                //- console.log(list)
                //- console.log(oldVal)
                //不更新整个canvas 只更新修改数据了得shape
                //比较更新数据
                if (list.length >= oldVal.length) {
                    list.forEach((shape) => {
                        let has = false;
                        oldVal.forEach((old) => {
                            if (shape.shapeId == old.shapeId) {
                                has = true;
                                if (COMMON.diffObject(shape, old)) { //表明更新了数据
                                    this.drawOneShapeSeat(shape, old);
                                }
                            }
                        })
                        if (!has) {
                            this.drawOneShapeSeat(shape);
                        }
                    })
                } else {

                }
                // console.timeEnd(1)
                //- this.drawMapSeat(list)
            },
            deep: true
        }
    },
    created() {
        _this = this;
        if (localStorage.getItem("shapeList")) {
            this.shapeList = JSON.parse(localStorage.getItem("shapeList"));
        }
        if (localStorage.getItem("seatIcon")) {
            this.seatIcon = JSON.parse(localStorage.getItem("seatIcon"));
        }
    },
    mounted() {
        this.svg = _svg;
        // this.svg = _svgBaobao;

        //canvas init
        this.canvasInit()

        this.warpInit();

        this.$nextTick(() => {
            this.svgInit();
        });

    },
    beforeDestroy() {

    },
    methods: {
        checkOnSeat(clickPoint, shape) { //判断是否点击在座位上
            //- console.log(shape);
            //返回座位信息的横纵下标

            //因为clickPoint是真实坐标，所以需要把shape的数据转算成真实的
            let center = [shape.cenPoint[0] * this.powNum, shape.cenPoint[1] * this.powNum];

            //座位起始坐标计算
            let width = (this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight;
            let height = (this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom;
            let point1 = [center[0] - width / 2 * this.powNum, center[1] - height / 2 * this.powNum];

            //判断是否点击在座位上
            let seat = [];
            for (let i = 0; i < shape.cols; i++) {
                let x = point1[0] + (i * (this.seatIcon.width + this.seatIcon.marginRight) + this.seatIcon.width / 2) * this.powNum;
                for (let j = 0; j < shape.rows; j++) {
                    let y = point1[1] + (j * (this.seatIcon.height + this.seatIcon.marginBottom) + this.seatIcon.height / 2) * this.powNum;
                    let rotatePoint = TOOLS.rotatePoint(center, [x, y], -this.checkedShape.angle);
                    if (TOOLS.getDisance1(rotatePoint, clickPoint) < this.seatIcon.width / 2 * this.powNum) {
                        seat = [j, i];
                        break;
                    }
                    if (seat.length != 0) break;
                }
            }
            return seat;
        },
        svgInit() {
            svgWarp = this.$refs.svgWarp;
            svgDom = svgWarp.firstElementChild;

            // svgDom.onmousedown = this.warpClick;

            // svgDom.onmouseup = this.warpDataInit;

            // svgDom.onmouseout = this.warpDataInit;

            // svgDom.onmousemove = this.warpDrag;
            // 获取到shapeList的所有shapeId集合
            let shapeIds = this.shapeList.map(item => item.shapeId);
            // console.log(shapeIds)
            //给元素设定id
            let domList = svgDom.childNodes;
            let id_num = 0;
            domList.forEach(item => {
                /* 元素节点	1,属性节点	2,文本节点	3,注释节点（comment）	8,document	9,DocumentFragment	11 */
                if (item.nodeType == 1 && item.nodeName != "text" && item.nodeName != "title") {
                    let curId = ++id_num;
                    item.setAttribute("id", curId);
                    if (shapeIds.indexOf(curId + "") != -1) {
                        // item.style.stroke = "red";
                        // item.style.strokeWidth = 6;
                        item.style.fill = "rgba(255, 192, 203, 0.74)";
                    }
                }
            })

            // document.getElementById("101").style.fill = "pink";
            // document.getElementById("25").style.fill = "pink";
            // document.getElementById("51").style.fill = "pink";
            // document.getElementById("56").style.fill = "pink";

            //给shape绑定选中事件
            // svgDom.addEventListener("dblclick", _this.shapeCheckedAction)
            svgDom.addEventListener("click", _this.shapeCheckedAction)

            let viewBox = svgDom.getAttribute("viewBox").split(" ")
            this.center = {
                // x: 5872.5,
                // y: 4344
                find: true,
                x: parseFloat(viewBox[2]) / 2,
                y: parseFloat(viewBox[3]) / 2
            }
            //缩放基础数据计算
            this.maxWidth = this.center.x * 2 * this.wheelMax;
            this.maxHeight = this.center.y * 2 * this.wheelMax;
            this.wheelMin = this.floatTwo(this.cont.width / this.maxWidth);
            //根据内容框缩放到合适的大小
            this.onload = true;
            this.setSvgAndCanvas(this.wheelMin);
            // this.setSvgAndCanvas(this.wheelMax);
            this.setCheckBox();

            //座位图标初始化
            this.seatIconInit()

            document.getElementById("210").setAttribute("cx", this.center.x)
            document.getElementById("210").setAttribute("cy", this.center.y)

        },
        clickToMax(cenPoint, wheelVal) { //点击放大
            this.setSvgAndCanvas(wheelVal);
            let left = cenPoint[0] * this.powNum - this.cont.width / 2;
            let top = cenPoint[1] * this.powNum - this.cont.height / 2;
            let position = {
                top: -1 * top,
                left: -1 * left
            }
            this.positionCheck(position)
            this.setCheckBox();
            // this.getDisplayAreaShapeIds()

            // console.log("clickToMax",cenPoint)

            document.getElementById("211").setAttribute("cx", cenPoint[0])
            document.getElementById("211").setAttribute("cy", cenPoint[1])
        },
        updateShapeSeatStatus(shape, seats) { //更新shape里单个座位的状态渲染信息
            //shape 表明是哪个区域
            //seats 是座位的座位下标，传数组，因为后面要实现批量选座
            // console.log(shape)
            // console.log(seats)
            //center 是svg虚拟单位值
            let center = [shape.cenPoint[0], shape.cenPoint[1]];
            let angle = shape.angle;
            ctx.save();
            ctx.translate(center[0] * this.powNum, center[1] * this.powNum);
            ctx.rotate(angle * Math.PI / 180);
            ctx.translate(-center[0] * this.powNum, -center[1] * this.powNum);
            let width = (this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight;
            let height = (this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom;
            //计算出实际坐标 svg一比一
            let point1 = [center[0] - width / 2, center[1] - height / 2];

            seats.forEach(seat => {
                let j = seat[0],
                    i = seat[1];
                let x = point1[0] + i * (this.seatIcon.width + this.seatIcon.marginRight);
                let y = point1[1] + j * (this.seatIcon.height + this.seatIcon.marginBottom);
                ctx.beginPath();
                if (shape.seats[j][i].status == 0) {
                    ctx.drawImage(this.seatIcon.iconShow, x * this.powNum, y * this.powNum, this.seatIcon.width * this.powNum, this.seatIcon.height * this.powNum);
                } else if (shape.seats[j][i].status == -1) {
                    ctx.drawImage(this.seatIcon.iconNone, x * this.powNum, y * this.powNum, this.seatIcon.width * this.powNum, this.seatIcon.height * this.powNum);
                }
            })
            ctx.restore();

        },
        drawOneShapeSeat(shape, originShape = false) { //绘制单个区域座位
            //center 是svg虚拟单位值
            let center = [shape.cenPoint[0], shape.cenPoint[1]];
            let angle = shape.angle;
            ctx.save();
            ctx.translate(center[0] * this.powNum, center[1] * this.powNum);
            ctx.rotate(angle * Math.PI / 180);
            ctx.translate(-center[0] * this.powNum, -center[1] * this.powNum);
            // 有这个区域的上一个状态值就说明，是重绘当前区域
            if (originShape) {
                if (shape.cols == originShape.cols && shape.rows == originShape.rows) {

                } else {
                    let orgWidth = (this.seatIcon.width + this.seatIcon.marginRight) * originShape.cols - this.seatIcon.marginRight;
                    let orgHeight = (this.seatIcon.height + this.seatIcon.marginBottom) * originShape.rows - this.seatIcon.marginBottom;
                    let orgPoint1 = [center[0] - orgWidth / 2, center[1] - orgHeight / 2];
                    //重绘需要清除canvas原始这个区域的数据
                    ctx.clearRect(orgPoint1[0] * this.powNum, orgPoint1[1] * this.powNum, orgWidth * this.powNum, orgHeight * this.powNum);
                }
            }

            let width = (this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight;
            let height = (this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom;
            //计算出实际坐标 svg一比一
            let point1 = [center[0] - width / 2, center[1] - height / 2];
            let point2 = [center[0] + width / 2, center[1] - height / 2];
            let point3 = [center[0] + width / 2, center[1] + height / 2];
            let point4 = [center[0] - width / 2, center[1] + height / 2];
            //svg回显绘制座位矩形区域
            // let path = "M" + point1[0] + "," + point1[1] + "L" + point2[0] + "," + point2[1] + "L" + point3[0] + "," + point3[1] + "L" + point4[0] + "," + point4[1] + "Z"
            // document.getElementById("185").setAttribute("d", path);

            // 座位先一排一排的绘制
            for (let i = 0; i < shape.cols; i++) {
                let x = point1[0] + i * (this.seatIcon.width + this.seatIcon.marginRight);
                for (let j = 0; j < shape.rows; j++) {
                    let y = point1[1] + j * (this.seatIcon.height + this.seatIcon.marginBottom);
                    ctx.beginPath();
                    if (shape.seats[j][i].status == 0) {
                        ctx.drawImage(this.seatIcon.iconShow, x * this.powNum, y * this.powNum, this.seatIcon.width * this.powNum, this.seatIcon.height * this.powNum);
                    } else if (shape.seats[j][i].status == -1) {
                        ctx.drawImage(this.seatIcon.iconNone, x * this.powNum, y * this.powNum, this.seatIcon.width * this.powNum, this.seatIcon.height * this.powNum);
                    }
                }
            }
            ctx.restore();
        },
        drawMapSeat(list) { //绘制座位
            if (this.wheelNum < this.wheelMax) return false;
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            list.forEach((shape, index) => {
                if (shape.cols == 0 || shape.rows == 0) return false;
                this.drawOneShapeSeat(shape);
            })
        },
        shapeCheckedAction(e) {
            let shape = e.target;
            let name = shape.nodeName;
            if (name != "path" && name != "rect" && name != "polygon") return false;

            let shapeObj = [];
            let shapeId = shape.getAttribute("id");
            // 获取到shapeList的所有shapeId集合
            let shapeIds = this.shapeList.map(item => item.shapeId);
            if (shapeIds.indexOf(shapeId) == -1) {
                shape.style.fill = "rgba(255, 192, 203, 0.74)";
                //id没有存在在列表中表明，还没有点击过这个shape
                //获取shape在svg中的一些原始 start
                let result = null;
                switch (name) {
                    case "path":
                        result = TOOLS.pathDecompose([this.center.x, this.center.y], shape.getAttribute("d"));
                        break;
                    case "polygon":
                        result = TOOLS.polygonDecompose([this.center.x, this.center.y], shape.getAttribute("points"));
                        break;
                    case "rect":
                        let width = shape.getAttribute("width");
                        let height = shape.getAttribute("height");
                        let x = shape.getAttribute("x");
                        let y = shape.getAttribute("y");
                        result = TOOLS.rectDecompose([this.center.x, this.center.y], x, y, width, height);
                        break;
                    default:
                        console.log(name);
                        break;
                }
                //获取shape在svg中的一些原始 end
                if (result == null) return false;
                shapeObj = {
                    ...result,
                    shapeId,
                    rows: 0,
                    cols: 0,
                    startRow: 1,
                    startCol: 1,
                    orderRow: 0, //横向排序方向：0：逆时针  1：反向
                    orderCol: 0, //纵向排序方向：0：从里向外  1：反向
                    seats: []
                }
                this.shapeList.push({
                    ...shapeObj
                });
                this.toggleCheckedShapeStatus({
                    ...shapeObj
                }, {
                    ...this.checkedShape
                })
                this.checkedShape = {
                    ...shapeObj
                };
                //没有设置座位区域，需要先让用户设置区域座位信息
                // this.checkedShapeShow = true;
                //选中shape居中显示
                this.clickToMax(shapeObj.cenPoint, this.wheelMax * 1);

            } else {
                let shapeIndex = shapeIds.indexOf(shapeId)
                shapeObj = JSON.parse(JSON.stringify(this.shapeList[shapeIndex]))

                //选中shape居中显示
                this.clickToMax(shapeObj.cenPoint, this.wheelMax * 1);
                //没有设置座位区域，需要先让用户设置区域座位信息
                if (this.checkedShape.shapeId != shapeObj.shapeId) {
                    this.toggleCheckedShapeStatus(shapeObj, {
                        ...this.checkedShape
                    })
                    this.checkedShape = shapeObj;
                    return false;
                } else {
                    this.checkedShape = shapeObj;
                    if (shapeObj.rows == 0 || shapeObj.cols == 0) {
                        // this.checkedShapeShow = true;
                    }
                    if (this.wheelNum == this.wheelMax) {
                        //鼠标坐标点
                        let clickX = e.clientX - svgWarp.offsetLeft;
                        let clickY = e.clientY - svgWarp.offsetTop - contentWarp.offsetTop;

                        //如果没有返回座位下标信息，就判定为点击的shape
                        let seat = this.checkOnSeat([clickX, clickY], shapeObj);
                        if (seat.length != 0) {
                            //设置单个座位的属性
                            let seatInfo = shapeObj.seats[seat[0]][seat[1]];
                            //- console.log(seat)
                            //- console.log(shapeObj.seats)
                            if (seatInfo.status == 0) {
                                seatInfo.status = -1;
                            } else if (seatInfo.status == -1) {
                                seatInfo.status = 0;
                            }
                            this.shapeList[shapeIndex].seats[seat[0]][seat[1]] = seatInfo;
                            //更新单个座位的渲染状态
                            this.updateShapeSeatStatus(this.shapeList[shapeIndex], [seat])
                            // this.$set(this.shapeList, shapeIndex, {
                            //     ...shapeObj
                            // });
                            // console.log(seatInfo.rowString, seatInfo.colString)
                        } else {
                            // 如果选中的shape为前一次选中的则不做任何改变
                            //COMMON.diffObject(shape,old)
                            // if (COMMON.diffObject(this.checkedShape,shapeObj)) return false;
                            // this.checkedShape = shapeObj;

                        }
                    }
                }

            }

        },
        getDisplayAreaShapeIds() { //获取可视区域内的shapeId
            if (this.wheelNum < this.wheelMax) return false;
            console.log("getDisplayAreaShapeIds............")
            //只查找有绘制座位shape的shapeList
            //计算出当前的中心点在svg中的坐标，因为可视区域的宽高是知道的
            let xMin = -this.position.left / this.powNum + this.center.x / 200,
                xMax = (-this.position.left + this.cont.width) / this.powNum - this.center.x / 200,
                yMin = -this.position.top / this.powNum + this.center.x / 200,
                yMax = (-this.position.top + this.cont.height) / this.powNum - this.center.x / 200;
            //绘制出四个顶点
            let point1 = [xMin, yMin]
            let point2 = [xMax, yMin]
            let point3 = [xMin, yMax]
            let point4 = [xMax, yMax]
            document.getElementById("211").setAttribute("cx", point1[0])
            document.getElementById("211").setAttribute("cy", point1[1])
            document.getElementById("212").setAttribute("cx", point2[0])
            document.getElementById("212").setAttribute("cy", point2[1])
            document.getElementById("213").setAttribute("cx", point3[0])
            document.getElementById("213").setAttribute("cy", point3[1])
            document.getElementById("214").setAttribute("cx", point4[0])
            document.getElementById("214").setAttribute("cy", point4[1])

            let list = [];
            let renderIds = this.renderList.map(item => item.shapeId);
            for (let i = 0; i < this.shapeList.length; i++) {
                let shape = this.shapeList[i];
                //如果已经存在，说明已经渲染过，就不需要再进行判断
                if (renderIds.indexOf(shape.shapeId) != -1) continue;
                //首先判断中心点是否在范围内
                if (shape.cenPoint[0] < xMax && shape.cenPoint[0] > xMin && shape.cenPoint[1] < yMax && shape.cenPoint[1] > yMin) {
                    list.push(shape);
                    continue;
                }
                for (let j = 0; j < shape.pointList.length; j++) {
                    let point = shape.pointList[j];
                    if (point[0] < xMax && point[0] > xMin && point[1] < yMax && point[1] > yMin) {
                        list.push(shape);
                        break;
                    }
                }
            }
            this.renderList.push(...list);
            // console.log(list);
            this.drawMapSeat(list);

        },
        toggleCheckedShapeStatus(shape, originShape = false) { //选中shape显示状态切换
            if (originShape && originShape.shapeId) {
                if (shape.shapeId == originShape.shapeId) return false;
                document.getElementById(originShape.shapeId).style.stroke = "#333";
                document.getElementById(originShape.shapeId).style.strokeWidth = 1;
            }
            document.getElementById(shape.shapeId).style.strokeWidth = 6;
            document.getElementById(shape.shapeId).style.stroke = "green";
            document.getElementById("500").setAttribute("style", "transform: rotate(" + shape.angle + "deg);transform-origin: 50% 50%;");
        },
        checkedShapeSeatComfrim() { //保存设置行列
            this.checkedShapeShow = false;
            this.saveAction();
            let shape = {
                ...this.checkedShape
            };
            //生成座位
            let seatIdStart = 0;
            shape.seats = [];
            //先循环行，再循环列
            if (shape.orderRow == 0) { //逆时针
                for (let i = 0; i < shape.rows; i++) {
                    let rowList = [];
                    if (shape.orderCol == 0) { //从里向外
                        for (let j = 0; j < shape.cols; j++) {
                            let seat = {
                                seatId: seatIdStart++,
                                status: 0,
                                rowString: shape.startRow + i,
                                colString: shape.startCol + j,
                                level: 0
                            }
                            rowList.push(seat);
                        }
                    } else { //反向
                        for (let j = shape.cols - 1; j > -1; j--) {
                            let seat = {
                                seatId: seatIdStart++,
                                status: 0,
                                rowString: shape.startRow + i,
                                colString: shape.startCol + j,
                                level: 0
                            }
                            rowList.push(seat);
                        }
                    }
                    shape.seats.push(rowList)
                }
            } else { //顺时针
                for (let i = shape.rows - 1; i > -1; i--) {
                    let rowList = [];
                    if (shape.orderCol == 0) { //从里向外
                        for (let j = 0; j < shape.cols; j++) {
                            let seat = {
                                seatId: seatIdStart++,
                                status: 0,
                                rowString: shape.startRow + i,
                                colString: shape.startCol + j,
                                level: 0
                            }
                            rowList.push(seat);
                        }
                    } else { //反向
                        for (let j = shape.cols - 1; j > -1; j--) {
                            let seat = {
                                seatId: seatIdStart++,
                                status: 0,
                                rowString: shape.startRow + i,
                                colString: shape.startCol + j,
                                level: 0
                            }
                            rowList.push(seat);
                        }
                    }
                    shape.seats.push(rowList)
                }
            }
            //把数据保存到shapeList中
            let shapeId = shape.shapeId;
            let shapeIds = this.shapeList.map(item => item.shapeId);
            let shapeIndex = shapeIds.indexOf(shapeId);
            if (shapeIndex != -1) {
                this.$set(this.shapeList, shapeIndex, {
                    ...shape
                });
            }
            let renderIds = this.renderList.map(item => item.shapeId);
            let renderIndex = renderIds.indexOf(shapeId);
            if (renderIndex != -1) {
                this.$set(this.renderList, renderIndex, {
                    ...shape
                });
            }
        },
        checkedShapeSeatCancle() { //取消设置行列
            console.log("checkedShapeSeatCancle..........")
            this.checkedShapeShow = false;
        },
        canvasInit() { //canvas初始化
            canvas = this.$refs.my_canvas;
            ctx = canvas.getContext("2d");
        },
        setSvgAndCanvas(val) {
            if(val == this.wheelMax){
                this.getDisplayAreaShapeIds()
            }
            if (this.wheelNum == val) return false;
            console.log("setSvgAndCanvas.............")
            this.wheelNum = val;
            this.setWidth = this.wheelNum * this.maxWidth;
            this.setHeight = this.wheelNum * this.maxHeight;
            //设置svg
            svgDom.setAttribute("width", this.setWidth)
            svgDom.setAttribute("height", this.setHeight)

            //设置canvas
            canvas.width = this.setWidth;
            canvas.height = this.setHeight;

            if (this.wheelNum == this.wheelMax) {
                // console.log("主动调用 drawMapSeat")
                //当缩放值为最大值时绘制map
                // this.drawMapSeat(this.shapeList);
                this.$nextTick(() => {
                    this.getDisplayAreaShapeIds()
                })
            } else {
                this.renderList = []
            }
            // svgWarp.style.width = this.setWidth + "px"
            // svgWarp.style.height = this.setHeight + "px"
        },
        setCheckBox() {
            //checkBox 宽高计算
            this.checkBox.width = this.miniMap.width * this.wheelMin / this.wheelNum;
            this.checkBox.height = this.miniMap.height * this.wheelMin / this.wheelNum;

            let mouseX = 0,
                mouseY = 0;
            mouseX = this.cont.width / 2 - this.position.left;
            mouseY = this.cont.height / 2 - this.position.top;
            this.checkBox.left = mouseX / this.setWidth * this.miniMap.width - this.checkBox.width / 2;
            this.checkBox.top = mouseY / this.setHeight * this.miniMap.height - this.checkBox.height / 2;
        },
        positionCheck(position) {
            let top = this.cont.height - this.setHeight;
            let left = this.cont.width - this.setWidth;
            let top2 = -this.cont.height;
            let left2 = -this.cont.width;
            if (position.top < 0 && position.top < top) {
                this.position.top = top;
            } else if (position.top > 0 && position.top > top2) {
                this.position.top = 0;
            } else {
                this.position.top = position.top;
            }
            if (position.left < 0 && position.left < left) {
                this.position.left = left;
            } else if (position.left > 0 && position.left > left2) {
                this.position.left = 0;
            } else {
                this.position.left = position.left;
            }
        },
        warpInit() {
            contentWarp = this.$refs.content;

            this.cont.width = contentWarp.clientWidth || contentWarp.offsetWidth;
            this.cont.height = contentWarp.clientHeight || contentWarp.offsetHeight;
            this.cont.offsetLeft = contentWarp.offsetLeft;
            this.cont.offsetTop = contentWarp.offsetTop;
            this.cont.center = [this.cont.width / 2 + this.cont.offsetLeft, this.cont.height / 2 + this.cont.offsetTop];

            // 缩略图数据计算
            this.miniMap.width = 300;
            this.miniMap.height = 300 * this.cont.height / this.cont.width;

            contentWarp.onmousedown = this.warpClick;

            contentWarp.onmouseup = this.warpDataInit;

            // contentWarp.onmouseout = this.warpDataInit;

            contentWarp.onmousemove = this.warpDrag;

            if (window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
                if (contentWarp.addEventListener) {
                    contentWarp.addEventListener('DOMMouseScroll', this.warpWheel, false);
                } else {
                    contentWarp.attachEvent('on' + 'DOMMouseScroll', this.warpWheel);
                }
            } else {
                if (contentWarp.addEventListener) {
                    contentWarp.addEventListener('mousewheel', this.warpWheel, false);
                } else {
                    contentWarp.attachEvent('on' + 'mousewheel', this.warpWheel);
                }
            }
        },
        warpClick(e) {
            let clickX = e.clientX - svgWarp.offsetLeft;
            let clickY = e.clientY - svgWarp.offsetTop;
            move_x = clickX;
            move_y = clickY;
            warpIsDragging = true;
            // console.log(svgWarp.offsetLeft, svgWarp.offsetTop)
        },
        warpDrag(e) {
            // if (!warpIsDragging || this.wheelNum <= this.wheelMin) { warpIsDragging = false; return false; }
            if (!warpIsDragging) {
                warpIsDragging = false;
                return false;
            }
            warpIsDragging = "drag"
            // svgDom.removeEventListener("click", _this.shapeCheckedAction, false)
            let nx = e.clientX;
            let ny = e.clientY;
            let nl = Math.ceil(nx - move_x); //偏移量
            let nt = Math.ceil(ny - move_y); //偏移量
            this.positionCheck({
                top: nt,
                left: nl
            });
            this.setCheckBox();

        },
        warpWheel(e) {

            // console.log(this.wheelNum)
            let orgWidth = svgWarp.offsetWidth,
                orgHeight = svgWarp.offsetHeight;
            let orgTop = svgWarp.offsetTop,
                orgLeft = svgWarp.offsetLeft;
            let radio = e.wheelDelta / 12000;
            if (radio < 0 && this.wheelNum > this.wheelMax / 4) {
                radio = radio * 18;
            } else if (radio > 0 && this.wheelNum < this.wheelMax / 4 * 3) {
                radio = radio * 18;
            }
            let curVal = this.floatTwo(this.wheelNum + radio);
            if (this.wheelNum >= this.wheelMax && curVal > this.wheelMax) return false;
            if (this.wheelNum <= this.wheelMin && curVal < this.wheelMin) return false;
            if (curVal >= this.wheelMax) {
                curVal = this.wheelMax;
            } else if (curVal <= this.wheelMin) {
                curVal = this.wheelMin;
            }
            this.setSvgAndCanvas(curVal);

            //position的left，top计算以及边缘值优化
            let position = {
                top: 0,
                left: 0
            }
            if (curVal == this.wheelMin) {
                position.top = 0;
                position.left = 0;
            } else {
                let ratioT = (e.clientY - orgTop) / orgHeight,
                    ratioL = (e.clientX - orgLeft) / orgWidth;
                position.top = Math.ceil(e.clientY - (this.setHeight * ratioT));
                position.left = Math.ceil(e.clientX - (this.setWidth * ratioL));
            }
            this.positionCheck(position)
            this.setCheckBox();
            // this.getDisplayAreaShapeIds();
        },
        warpDataInit(e) {
            if (warpIsDragging == "drag") {
                this.getDisplayAreaShapeIds();
            }
            move_x = 0, move_y = 0, warpIsDragging = false;
            //给shape绑定选中事件
            // svgDom.addEventListener("click", _this.shapeCheckedAction)
        },
        //座位信息 start
        seatIconInit() { //座位图标初始化
            let width = this.seatIcon.width * this.wheelMax * this.wheelMax;
            let height = this.seatIcon.height * this.wheelMax * this.wheelMax
            let offCanvas = document.createElement("canvas"); //离屏canvas 通过代码创建出来的
            offCanvas.width = width;
            offCanvas.height = height;
            let offContext = offCanvas.getContext("2d");

            let offCanvas2 = document.createElement("canvas"); //离屏canvas 通过代码创建出来的
            offCanvas2.width = width;
            offCanvas2.height = height;
            let offContext2 = offCanvas2.getContext("2d");
            let _this = this
            setTimeout(function () {
                offContext.drawImage(_this.$refs.iconShow, 0, 0, width, height);
                _this.seatIcon.iconShow = offCanvas;
                offContext2.drawImage(_this.$refs.iconNone, 0, 0, width, height);
                _this.seatIcon.iconNone = offCanvas2;
            }, 100);

        },
        changeSeatIcon() {
            this.popSeatIcon = {
                ...this.seatIcon
            };
            this.popSeatIconShow = !this.popSeatIconShow;
        },
        seatIconComfrim() {
            this.popSeatIconShow = false;
            if (this.seatIcon == this.popSeatIcon) return false;
            this.seatIcon = {
                ...this.popSeatIcon
            };
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawMapSeat(this.renderList);
            this.saveAction()
        },
        //座位信息 end

        saveAction() {
            localStorage.setItem("shapeList", JSON.stringify(this.shapeList));
            localStorage.setItem("seatIcon", JSON.stringify(this.seatIcon));
        },
        //普通函数方法
        floatTwo(num) { //保留两位小数
            return Math.floor(num * 10000) / 10000;
        },
        toMin() {
            this.setSvgAndCanvas(this.wheelMin)
            this.position.top = 0;
            this.position.left = 0;
        },
        toMax() {}
    }
};
</script>

<style lang="scss" scoped>
div {
    box-sizing: border-box;
}

.warp {
    width: 100%;
    height: 100%;
    position: relative;

    .mini-map {
        // width: 282px;
        // height: 212px;
        // background-image: url("../assets/baobao.svg");
        background-image: url("../assets/test2.svg");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        position: absolute;
        right: 10px;
        top: 0;
        background-color: #fff;
        z-index: 10;
        // border: 1px solid springgreen;
        overflow: hidden;
        background-color: rgba(66, 55, 55, 0.3);

        .checkBox {
            border: 1px solid red;
            position: absolute;
            top: -1px;
            left: -1px;
        }
    }

    .top {
        height: 40px;
        // border-bottom: 1px solid red;
        overflow: hidden;
    }

    .content {
        height: calc(100vh - 40px);
        overflow: hidden;
        position: relative;
        overflow: hidden;
        margin: 0 auto;
        border: 1px solid #ccc;
        box-sizing: border-box;

        // &:after {
        //     content: "";
        //     display: block;
        //     width: 10px;
        //     height: 10px;
        //     position: absolute;
        //     top: 50%;
        //     left: 50%;
        //     background-color: #000;
        //     margin-top: -5px;
        //     margin-left: -5px;
        // }

        .svg-origin {
            // border: 1px solid blue;
            width: 100%;
        }

        .svg-warp {
            position: absolute;
            top: 0;
            left: 0;
            background-color: #bbbcbe;

            &.showCanvas {
                opacity: 0.7;
                background-color: transparent;
            }
        }

        .my-canvas {
            // border: 2px solid rgba(255, 192, 203, 1);
            // background-color: rgba(255, 192, 203, 0.3);
            background-color: #bbbcbe;
            position: absolute;
            top: 0;
            left: 0;

            // opacity: 1;
        }
    }

    .pop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(66, 55, 55, 0.3);

        .pop-content {
            text-align: left;
            position: absolute;
            width: 500px;
            height: 300px;
            //- padding-top: 60px;
            top: 50%;
            left: 50%;
            margin-left: -250px;
            margin-top: -150px;
            background-color: #fff;

            h4 {
                padding: 10px;
            }

            em.radio {
                color: #bbbcbe;
                margin-right: 10px;
                font-style: normal;

                &.checked {
                    color: red;
                }
            }
        }
    }
}

button {
    padding: 5px;
}

button {
    padding: 5px;
}
</style>
