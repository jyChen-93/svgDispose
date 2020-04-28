<template lang="pug">
.warp
	div(style="display:none;")
		img( ref="iconChecked" src="../assets/seat_icon_checked.svg" alt="" sizes="" srcset="")
	.mini-map(ref="miniMap" :style="{width:miniMap.width+'px',height:miniMap.height+'px'}" v-show="miniMap.show")
		.checkBox(ref="checkBox" :style="{width:checkBox.width+'px',height:checkBox.height+'px',top:checkBox.top+'px',left:checkBox.left+'px'}")
	.top
		router-link(to="/svg_to_canvas") toBatch
		img( ref="iconShow" src="../assets/seat_icon_show.svg" alt="" sizes="" srcset="" id="500")
		button(@click="saveAction") save
		button(@click="miniMap.show=!miniMap.show") miniMap
		button(@click="checkedShapeShow=true") 修改区域座位信息
		span 调整画布大小{{wheelNum}}
		number-input(:point="2", :max="99999" placeholder="请输入金额1213" v-model.number="wheelMaxBackUp" ,:input="updateInputNumberVal")
		button(@click="comfrimSizeChange") 确认调整
		h4 shapeInfo-->
			span 角度：
		//button(@click="toMax") toMax
	.content(ref="content")
		.svg-warp(ref="svgWarp" v-html="svg" ,:class="{'showCanvas':wheelNum>=wheelShow}")
		.canvas-row(v-for="(list,idx) in canvasList",:key="idx" v-show="wheelNum>=wheelShow")
			canvas.my-canvas(v-show="canvasItem.show" v-for="(canvasItem,idxs) in list",:key="idxs" ,:id="canvasItem.canvasId",:style="{left:canvasItem.left+'px',top:canvasItem.top+'px'}" ) 浏览器不支持canvas
		.hover-info(v-show="hoverInfo.show" :style="{left:hoverInfo.left+'px',top:hoverInfo.top+'px'}")
			span {{hoverInfo.text}}
			div
	//- 操作区域
	.active-area active-area
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
</template>

<script>
// @ is an alias to /src
import NumberInput from '@/components/cjy_plugin/number_input';
import TOOLS from '@/utils/tools.js'
import COMMON from '@/utils/common.js'
let _this = null,
    contentWarp = null,
    svgWarp = null,
    svgDom = null;
export default {
    name: "",
    components: {
        NumberInput
    },
    data() {
        return {
            pageVisible: true,
            errorRange: 50,

            hoverInfo: {
                show: true,
                text: "3213",
                top: 0,
                left: 0
            },

            //切割成多少个canvas
            canvasSplit: {
                row: 7,
                col: 7
            },

            canvasList: [], //二维数组


            wheelMaxBackUp: 0, //调整整个画布大小时候调用
            wheelMax: 1, //最大缩放值
            scaleMax: 1.5,

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

            seatIcon: { //座位图标
                iconShow: "",
                iconChecked: "",
                width: 0,
                height: 0,
                marginRight: 0,
                marginBottom: 0,
                diagonalLine: 0, //正方形对角线的长度
                realWidth: 20,
                realHeight: 20,
                realMarginRight: 8,
                realMarginBottom: 8
            },

            checkedShapeShow: false,
            checkedShape: {
                shapeId: null,
                rows: 0,
                cols: 0,
                startRow: 0, //排座的开始行
                startCol: 0, //排座的开始列（座）
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
            renderList: [], //已经渲染的shape
            viewBoxList: [] //当前可视区域内的shape
        };
    },
    computed: {
        wheelPow: function() {
            let pow = this.wheelNum * this.scaleMax;
            return pow
        },
        wheelShow() { //展示具体绘制座位的最小缩放值
            return Math.floor(this.wheelMax * 0.6 * 100) / 100;
        },
        wheelRadio() { //当前缩放值和最大缩放值的比例
            let radio = this.wheelNum / this.wheelMax;
            return this.wheelNum / this.wheelMax;
        }
    },
    watch: {
        position: {
            handler(newVal) {
                svgWarp.style.left = newVal.left + 'px';
                svgWarp.style.top = newVal.top + 'px';
                if (this.wheelNum < this.wheelShow) return false;
                this.canvasList.forEach((list, row) => {
                    list.forEach((item, col) => {
                        item.left = newVal.left + col * item.width
                        item.top = newVal.top + row * item.height
                    })
                })
            },
            deep: true
        },
        viewBoxList: {
            handler(list, oldList) {
                //判断当前需要显示的canvas
                for (let row = 0; row < this.canvasSplit.row; row++) {
                    let rowList = this.canvasList[row];
                    for (let col = 0; col < this.canvasSplit.col; col++) {
                        let canvasItem = this.canvasList[row][col];
                        //因为现在只有两个，所以高度是相同的，只需要判断宽度
                        let s_x = canvasItem.width * col - this.errorRange;
                        let e_x = canvasItem.width * (col + 1) + this.errorRange;
                        let s_y = canvasItem.height * row - this.errorRange;
                        let e_y = canvasItem.height * (row + 1) + this.errorRange;
                        let isIn = false;
                        list.forEach(shape => {
                            let center = [shape.cenPoint[0], shape.cenPoint[1]];
                            let angle = shape.angle;
                            let width = (this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight;
                            let height = (this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom;
                            //计算出实际坐标
                            let point1 = [center[0] - width / 2, center[1] - height / 2];
                            let point2 = [center[0] + width / 2, center[1] - height / 2];
                            let point3 = [center[0] + width / 2, center[1] + height / 2];
                            let point4 = [center[0] - width / 2, center[1] + height / 2];
                            let rangeCenter = [center[0] * this.wheelPow, center[1] * this.wheelPow]
                            let rangePoints = [
                                [point1[0] * this.wheelPow, point1[1] * this.wheelPow],
                                [point2[0] * this.wheelPow, point2[1] * this.wheelPow],
                                [point3[0] * this.wheelPow, point3[1] * this.wheelPow],
                                [point4[0] * this.wheelPow, point4[1] * this.wheelPow]
                            ]
                            //首先判断shape属于哪个canvas
                            if (rangeCenter[0] >= s_x && rangeCenter[0] <= e_x && rangeCenter[1] >= s_y && rangeCenter[1] <= e_y) {
                                isIn = true;
                            } else {
                                for (let k = 0; k < 4; k++) {
                                    let rangePoint = rangePoints[k];
                                    if (rangePoint[0] >= s_x && rangePoint[0] <= e_x && rangePoint[1] >= s_y && rangePoint[1] <= e_y) {
                                        isIn = true;
                                        break;
                                    }
                                }
                            }
                            if (isIn) {
                                canvasItem.show = true
                            } else {
                                canvasItem.show = false
                            }
                        })
                    }
                }

            },
            deep: true
        }
    },
    created() {
        _this = this;
        if (localStorage.getItem("shapeList")) {
            this.shapeList = JSON.parse(localStorage.getItem("shapeList"));
        }
        if (localStorage.getItem("scaleMax")) {
            this.scaleMax = parseFloat(localStorage.getItem("scaleMax"))
        }
        this.wheelMaxBackUp = this.scaleMax;
        this.seatIcon.width = this.seatIcon.realWidth / this.scaleMax
        this.seatIcon.height = this.seatIcon.realHeight / this.scaleMax
        this.seatIcon.marginRight = this.seatIcon.realMarginRight / this.scaleMax
        this.seatIcon.marginBottom = this.seatIcon.realMarginBottom / this.scaleMax
        //计算出正方形对角线的长度
        this.seatIcon.diagonalLine = Math.pow((this.seatIcon.width / 2) * (this.seatIcon.width / 2) * 2, 0.5);
        // this.canvasInit();
    },
    mounted() {
        //座位图标初始化
        this.seatIconInit();
        this.svg = _svg;
        this.$nextTick(() => {
            this.svgInit();
        });
    },
    beforeDestroy() {

    },
    methods: {
        updateInputNumberVal(number) { //input_number组件更新数据
            this.wheelMaxBackUp = number;
        },
        comfrimSizeChange() { //确认修改画布大小
            if (this.checkedShape.shapeId === null) {
                alert("请先双击选择需要观察的图形");
                return false;
            }
            this.scaleMax = this.wheelMaxBackUp;
            //保存数据
            localStorage.setItem("scaleMax", this.scaleMax);
            this.seatIcon.width = this.seatIcon.realWidth / this.scaleMax
            this.seatIcon.height = this.seatIcon.realHeight / this.scaleMax
            this.seatIcon.marginRight = this.seatIcon.realMarginRight / this.scaleMax
            this.seatIcon.marginBottom = this.seatIcon.realMarginBottom / this.scaleMax
            //计算出正方形对角线的长度
            this.seatIcon.diagonalLine = Math.pow((this.seatIcon.width / 2) * (this.seatIcon.width / 2) * 2, 0.5);

            // //缩放基础数据重新计算
            this.maxWidth = this.center.x * 2 * this.scaleMax;
            this.maxHeight = this.center.y * 2 * this.scaleMax;
            this.wheelMin = this.floatTwo(this.cont.width / this.maxWidth);
            //canvas的最大尽量接近2000*2000
            this.canvasSplit.col = Math.ceil(this.maxWidth / 2000)
            this.canvasSplit.row = Math.ceil(this.maxHeight / 2000)
            this.canvasInit()
            this.$nextTick(() => this.clickToMax(this.checkedShape, this.wheelNum))

        },
        canvasInit() { //根据切割canvas的行和列计算出canvas有多少个
            this.canvasList = []
            let tmpList = []
            let obj = {
                dom: null,
                ctx: null,
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                show: false
            }
            let canvasId = 1
            for (let i = 0; i < this.canvasSplit.row; i++) {
                let rowList = []
                for (let j = 0; j < this.canvasSplit.col; j++) {
                    rowList.push({
                        ...obj,
                        canvasId
                    })
                    canvasId++;
                }
                tmpList.push(rowList)
            }
            this.canvasList = tmpList;
            //获取canvasDom
            this.$nextTick(() => {
                let canvasList = document.getElementsByTagName("canvas");
                this.canvasList.forEach((rowList, row) => {
                    rowList.forEach((canvasItem, col) => {
                        canvasItem.dom = canvasList[this.canvasSplit.col * row + col]
                        canvasItem.ctx = canvasList[this.canvasSplit.col * row + col].getContext("2d");
                    })
                })
            })
        },
        checkOnSeat(shape, clickPoint) { //判断是否点击在座位上,返回座位信息的横纵下标
            //因为clickPoint是真实坐标，所以需要把shape的数据转算成真实的
            let center = [shape.cenPoint[0] * this.wheelPow, shape.cenPoint[1] * this.wheelPow];

            //座位起始坐标计算,真事单位
            let width = ((this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight) * this.wheelPow;
            let height = ((this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom) * this.wheelPow;
            let point1 = [center[0] - width / 2, center[1] - height / 2];
            // document.getElementById("212").setAttribute("cx", point1[0] / this.wheelPow)
            // document.getElementById("212").setAttribute("cy", point1[1] / this.wheelPow)
            //判断是否点击在座位上,使用每个座位的中心点到clickPoint之间的距离判断
            let seat = [];
            for (let i = 0; i < shape.cols; i++) {
                let cen_x = point1[0] + (i * (this.seatIcon.width + this.seatIcon.marginRight) + this.seatIcon.width / 2) * this.wheelPow;
                for (let j = 0; j < shape.rows; j++) {
                    let cen_y = point1[1] + (j * (this.seatIcon.height + this.seatIcon.marginBottom) + this.seatIcon.height / 2) * this.wheelPow;
                    let rotatePoint = TOOLS.rotatePoint(center, [cen_x, cen_y], -shape.angle);
                    let distance = TOOLS.getDisance1(rotatePoint, clickPoint);
                    if (distance < this.seatIcon.diagonalLine * this.wheelPow) {
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
                    let findIdx = shapeIds.indexOf(curId + "");
                    if (findIdx != -1) {
                        if (this.shapeList[findIdx].rows > 0 && this.shapeList[findIdx].cols > 0) {
                            item.style.fill = "rgba(255, 192, 203, 0.74)";
                        }
                    }
                }
            })

            //给shape绑定选中事件
            // svgDom.addEventListener("click", _this.shapeCheckedAction)
            // svgDom.addEventListener("dblclick", _this.shapeCheckedAction)
            // svgDom.addEventListener("click", _this.seatCheckedAction)

            let viewBox = svgDom.getAttribute("viewBox").split(" ")
            this.center = {
                find: true,
                x: parseFloat(viewBox[2]) / 2,
                y: parseFloat(viewBox[3]) / 2
            }
            //根据宽高比计算出content的高度
            this.warpInit(this.center);

            //缩放基础数据计算
            this.maxWidth = this.center.x * 2 * this.scaleMax;
            this.maxHeight = this.center.y * 2 * this.scaleMax;
            this.wheelMin = this.floatTwo(this.cont.width / this.maxWidth);

            //canvas的最大尽量接近2000*2000
            this.canvasSplit.col = Math.ceil(this.maxWidth / 2000)
            this.canvasSplit.row = Math.ceil(this.maxHeight / 2000)
            this.canvasInit()

            //根据内容框缩放到合适的大小
            this.setSvgAndCanvas(this.wheelMin);
            this.setCheckBox();

            document.getElementById("210").setAttribute("cx", this.center.x)
            document.getElementById("210").setAttribute("cy", this.center.y)
        },
        clickToMax(shape, wheelVal) { //点击放大
            this.setSvgAndCanvas(wheelVal);
            let cenPoint = shape.cenPoint;
            // let left = cenPoint[0] * this.wheelPow - this.cont.width / 2;
            // let top = cenPoint[1] * this.wheelPow - this.cont.height / 2;
            let left = cenPoint[0] * this.wheelPow - this.cont.width / 2;
            let top = cenPoint[1] * this.wheelPow - this.cont.height / 2;

            let position = {
                top: -1 * top,
                left: -1 * left
            }
            this.positionCheck(position)
            this.setCheckBox();
        },
        updateShapeSeatStatus(shape, seats) { //更新shape里单个座位的状态渲染信息
            //shape 表明是哪个区域
            //seats 是座位的座位下标，传数组，因为后面要实现批量选座
            // console.log(seats)
            //center 是svg虚拟单位值
            let center = [shape.cenPoint[0], shape.cenPoint[1]];
            let angle = shape.angle;
            let width = ((this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight) * this.wheelPow;
            let height = ((this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom) * this.wheelPow;
            //计算出实际坐标 svg一比一
            let point1 = [center[0] * this.wheelPow - width / 2, center[1] * this.wheelPow - height / 2];
            let point2 = [center[0] * this.wheelPow + width / 2, center[1] * this.wheelPow - height / 2];
            let point3 = [center[0] * this.wheelPow + width / 2, center[1] * this.wheelPow + height / 2];
            let point4 = [center[0] * this.wheelPow - width / 2, center[1] * this.wheelPow + height / 2];
            let rangeCenter = [center[0] * this.wheelPow, center[1] * this.wheelPow]
            let rangePoints = [
                [point1[0], point1[1]],
                [point2[0], point2[1]],
                [point3[0], point3[1]],
                [point4[0], point4[1]]
            ]
            //首先判断shape属于哪个canvas
            let drawCanvas = [];
            for (let row = 0; row < this.canvasSplit.row; row++) {
                let rowList = this.canvasList[row];
                for (let col = 0; col < this.canvasSplit.col; col++) {
                    let canvasItem = this.canvasList[row][col];
                    //因为现在只有两个，所以高度是相同的，只需要判断宽度
                    let s_x = canvasItem.width * col - this.errorRange;
                    let e_x = canvasItem.width * (col + 1) + this.errorRange;
                    let s_y = canvasItem.height * row - this.errorRange;
                    let e_y = canvasItem.height * (row + 1) + this.errorRange;
                    if (rangeCenter[0] >= s_x && rangeCenter[0] <= e_x && rangeCenter[1] >= s_y && rangeCenter[1] <= e_y) {
                        drawCanvas.push({
                            col,
                            row,
                            ...canvasItem
                        })
                        continue;
                    }
                    for (let k = 0; k < rangePoints.length; k++) {
                        let rangePoint = rangePoints[k];
                        if (rangePoint[0] >= s_x && rangePoint[0] <= e_x && rangePoint[1] >= s_y && rangePoint[1] <= e_y) {
                            drawCanvas.push({
                                col,
                                row,
                                ...canvasItem
                            })
                            break;
                        }
                    }
                }
            }
            drawCanvas.forEach(canvasItem => {
                canvasItem.ctx.save();
                let tanr_x = rangeCenter[0] - (canvasItem.col * canvasItem.width);
                let tanr_y = rangeCenter[1] - (canvasItem.row * canvasItem.height);
                canvasItem.ctx.translate(tanr_x, tanr_y);
                canvasItem.ctx.rotate(angle * Math.PI / 180);
                canvasItem.ctx.translate(-tanr_x, -tanr_y);

                seats.forEach(seat => {
                    let j = seat[0],
                        i = seat[1];
                    let x = point1[0] + i * (this.seatIcon.width + this.seatIcon.marginRight) * this.wheelPow;
                    let y = point1[1] + j * (this.seatIcon.height + this.seatIcon.marginBottom) * this.wheelPow;
                    let real_x = x - (canvasItem.col * canvasItem.width);
                    let real_y = y - (canvasItem.row * canvasItem.height);
                    if (shape.seats[j][i].status == 0) {
                        canvasItem.ctx.beginPath();
                        canvasItem.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatIcon.width * this.wheelPow, this.seatIcon.height * this.wheelPow);
                    } else if (shape.seats[j][i].status == 1) {
                        canvasItem.ctx.beginPath();
                        canvasItem.ctx.drawImage(this.seatIcon.iconChecked, real_x, real_y, this.seatIcon.width * this.wheelPow, this.seatIcon.height * this.wheelPow);
                    }
                })
                canvasItem.ctx.restore();
            })
        },
        drawOneShapeSeat(shape, originShape = false) { //绘制单个区域座位
            // console.log("drawOneShapeSeat..", shape.shapeId)
            // console.log(shape, this.seatIcon.width * this.wheelPow)
            //center 是svg虚拟单位值
            let center = [shape.cenPoint[0], shape.cenPoint[1]];
            let angle = shape.angle;
            // 有这个区域的上一个状态值就说明，是重绘当前区域
            if (originShape) {
                if (shape.cols == originShape.cols && shape.rows == originShape.rows) {
                    //没有改变行和列，就不清空了
                } else {
                    let orgWidth = (this.seatIcon.width + this.seatIcon.marginRight) * originShape.cols - this.seatIcon.marginRight;
                    let orgHeight = (this.seatIcon.height + this.seatIcon.marginBottom) * originShape.rows - this.seatIcon.marginBottom;
                    let point1 = [center[0] - orgWidth / 2, center[1] - orgHeight / 2];
                    let point2 = [center[0] + orgWidth / 2, center[1] - orgHeight / 2];
                    let point3 = [center[0] + orgWidth / 2, center[1] + orgHeight / 2];
                    let point4 = [center[0] - orgWidth / 2, center[1] + orgHeight / 2];
                    let rangePoints = [
                        [point1[0] * this.wheelPow, point1[1] * this.wheelPow],
                        [point2[0] * this.wheelPow, point2[1] * this.wheelPow],
                        [point3[0] * this.wheelPow, point3[1] * this.wheelPow],
                        [point4[0] * this.wheelPow, point4[1] * this.wheelPow]
                    ]
                    //首先判断shape属于哪个canvas
                    let drawCanvas = [];
                    this.canvasList.forEach((rowList, row) => {
                        rowList.forEach((canvasItem, col) => {
                            //因为现在只有两个，所以高度是相同的，只需要判断宽度
                            let s_x = canvasItem.width * col - this.errorRange;
                            let e_x = canvasItem.width * (col + 1) + this.errorRange;
                            let s_y = canvasItem.height * row - this.errorRange;
                            let e_y = canvasItem.height * (row + 1) + this.errorRange;
                            for (let k = 0; k < 4; k++) {
                                let rangePoint = rangePoints[k];
                                if (rangePoint[0] >= s_x && rangePoint[0] <= e_x && rangePoint[1] >= s_y && rangePoint[1] <= e_y) {
                                    drawCanvas.push({
                                        col,
                                        row,
                                        ...canvasItem
                                    })
                                    break;
                                }
                            }
                        })
                    })

                    //重绘需要清除canvas原始这个区域的数据
                    drawCanvas.forEach(canvasItem => {
                        canvasItem.ctx.save();
                        canvasItem.ctx.translate(center[0] * this.wheelPow - (canvasItem.col * canvasItem.width), center[1] * this.wheelPow - (canvasItem.row * canvasItem.height));
                        canvasItem.ctx.rotate(angle * Math.PI / 180);
                        canvasItem.ctx.translate(-(center[0] * this.wheelPow - (canvasItem.col * canvasItem.width)), -(center[1] * this.wheelPow - (canvasItem.row * canvasItem.height)));

                        canvasItem.ctx.clearRect(point1[0] * this.wheelPow - (canvasItem.col * canvasItem.width), point1[1] * this.wheelPow - (canvasItem.row * canvasItem.height), orgWidth * this.wheelPow, orgHeight * this.wheelPow);

                        canvasItem.ctx.restore();
                    })

                }
            }

            let width = ((this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight) * this.wheelPow;
            let height = ((this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom) * this.wheelPow;
            //计算出实际坐标
            let point1 = [center[0] * this.wheelPow - width / 2, center[1] * this.wheelPow - height / 2];
            let point2 = [center[0] * this.wheelPow + width / 2, center[1] * this.wheelPow - height / 2];
            let point3 = [center[0] * this.wheelPow + width / 2, center[1] * this.wheelPow + height / 2];
            let point4 = [center[0] * this.wheelPow - width / 2, center[1] * this.wheelPow + height / 2];
            let rangeCenter = [center[0] * this.wheelPow, center[1] * this.wheelPow]
            let rangePoints = [
                [point1[0], point1[1]],
                [point2[0], point2[1]],
                [point3[0], point3[1]],
                [point4[0], point4[1]]
            ]
            //首先判断shape属于哪个canvas
            let drawCanvas = [];
            for (let row = 0; row < this.canvasSplit.row; row++) {
                let rowList = this.canvasList[row];
                for (let col = 0; col < this.canvasSplit.col; col++) {
                    let canvasItem = this.canvasList[row][col];
                    //因为现在只有两个，所以高度是相同的，只需要判断宽度
                    let s_x = canvasItem.width * col - this.errorRange;
                    let e_x = canvasItem.width * (col + 1) + this.errorRange;
                    let s_y = canvasItem.height * row - this.errorRange;
                    let e_y = canvasItem.height * (row + 1) + this.errorRange;
                    if (rangeCenter[0] >= s_x && rangeCenter[0] <= e_x && rangeCenter[1] >= s_y && rangeCenter[1] <= e_y) {
                        drawCanvas.push({
                            col,
                            row,
                            ...canvasItem
                        })
                        continue;
                    }
                    for (let k = 0; k < rangePoints.length; k++) {
                        let rangePoint = rangePoints[k];
                        if (rangePoint[0] >= s_x && rangePoint[0] <= e_x && rangePoint[1] >= s_y && rangePoint[1] <= e_y) {
                            drawCanvas.push({
                                col,
                                row,
                                ...canvasItem
                            })
                            break;
                        }
                    }
                }
            }
            // 座位先一排一排的绘制
            drawCanvas.forEach(canvasItem => {
                canvasItem.ctx.save();
                let tanr_x = rangeCenter[0] - (canvasItem.col * canvasItem.width);
                let tanr_y = rangeCenter[1] - (canvasItem.row * canvasItem.height);
                canvasItem.ctx.translate(tanr_x, tanr_y);
                canvasItem.ctx.rotate(angle * Math.PI / 180);
                canvasItem.ctx.translate(-tanr_x, -tanr_y);

                // let s_x = 0,
                //     e_x = 0,
                //     s_y = 0,
                //     e_y = 0;
                // if (drawCanvas.length > 1) {
                //     s_x = canvasItem.width * canvasItem.col;
                //     e_x = canvasItem.width * (canvasItem.col + 1);
                //     s_y = 0;
                //     e_y = canvasItem.height;
                // }
                for (let i = 0; i < shape.cols; i++) {
                    let x = point1[0] + i * (this.seatIcon.width + this.seatIcon.marginRight) * this.wheelPow;
                    let real_x = x - (canvasItem.col * canvasItem.width);
                    for (let j = 0; j < shape.rows; j++) {
                        let y = point1[1] + j * (this.seatIcon.height + this.seatIcon.marginBottom) * this.wheelPow;
                        let real_y = y - (canvasItem.row * canvasItem.height);
                        // 当shape处在多个canvas上，需要判断当前seat是是否在循环到的canvas上
                        // let draw = true;
                        // if (drawCanvas.length > 1) {
                        //     draw = false;
                        //     let seatPoints = [
                        //         [real_x, real_y],
                        //         [real_x + this.seatIcon.realWidth, real_y],
                        //         [real_x, real_y + this.seatIcon.realHeight],
                        //         [real_x + this.seatIcon.realWidth, real_y + this.seatIcon.realHeight]
                        //     ];
                        //     for (let k = 0; k < 4; k++) {
                        //         let seatPoint = seatPoints[k];
                        //         // 没有在当前的canvas上，就不绘制当前seat
                        //         if (seatPoint[0] >= s_x && seatPoint[0] <= e_x && seatPoint[1] >= s_y && seatPoint[1] <= e_y) {
                        //             draw = true;
                        //             console.log(1)
                        //             break;
                        //         }
                        //     }
                        // }
                        // if (draw) {
                        if (shape.seats[j][i].status == 0) {
                            canvasItem.ctx.beginPath();
                            canvasItem.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatIcon.width * this.wheelPow, this.seatIcon.height * this.wheelPow);
                        } else if (shape.seats[j][i].status == 1) {
                            canvasItem.ctx.beginPath();
                            canvasItem.ctx.drawImage(this.seatIcon.iconChecked, real_x, real_y, this.seatIcon.width * this.wheelPow, this.seatIcon.height * this.wheelPow);
                        }
                        // }
                    }
                }
                canvasItem.ctx.restore();
            })


        },
        drawMapSeat(list) { //绘制座位
            if (this.wheelNum < this.wheelShow) return false;
            list.forEach((shape, index) => {
                if (shape.cols == 0 || shape.rows == 0) return false;
                this.drawOneShapeSeat(shape);
            })
        },
        shapeCheckedAction(shape, clickPoint) {
            // let shape = e.target;
            let name = shape.nodeName;
            if (name != "path" && name != "rect" && name != "polygon") return false;

            let shapeObj = [];
            let shapeId = shape.getAttribute("id");
            // 获取到shapeList的所有shapeId集合
            let shapeIds = this.shapeList.map(item => item.shapeId);
            if (shapeIds.indexOf(shapeId) == -1) {
                return false;
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
                this.clickToMax(shapeObj, this.wheelNum < this.wheelShow ? this.wheelShow : this.wheelNum);

            } else {
                let shapeIndex = shapeIds.indexOf(shapeId)
                shapeObj = JSON.parse(JSON.stringify(this.shapeList[shapeIndex]))
                if (shapeObj.shapeId == this.checkedShape.shapeId) {
                    if (this.wheelNum < this.wheelShow) {
                        //未显示座位，放大到显示座位的状态
                        this.clickToMax(shapeObj, this.wheelNum < this.wheelShow ? this.wheelShow : this.wheelNum);
                    } else {
                        //选中的是当前checkedShape，判定为选中座位
                        if (shapeObj.rows == 0 || shapeObj.cols == 0) {
                            // this.checkedShapeShow = true;
                        }
                        //如果没有返回座位下标信息，就判定为点击的shape
                        let seat = this.checkOnSeat(shapeObj, clickPoint);
                        if (seat.length != 0) {
                            //设置单个座位的属性
                            let seatInfo = shapeObj.seats[seat[0]][seat[1]];
                            if (seatInfo.status == -1) {
                                return false;
                            } else if (seatInfo.status == 0) {
                                seatInfo.status = 1;
                            } else if (seatInfo.status == 1) {
                                seatInfo.status = 0;
                            }
                            this.shapeList[shapeIndex].seats[seat[0]][seat[1]].status = seatInfo.status;
                            //更新单个座位的渲染状态
                            this.updateShapeSeatStatus(this.shapeList[shapeIndex], [seat])
                            // this.$set(this.shapeList, shapeIndex, {
                            //     ...shapeObj
                            // });
                            // console.log(seatInfo.rowString, seatInfo.colString)
                        }
                    }

                } else {
                    this.clickToMax(shapeObj, this.wheelNum < this.wheelShow ? this.wheelShow : this.wheelNum);
                    this.toggleCheckedShapeStatus(shapeObj, {
                        ...this.checkedShape
                    })
                    this.checkedShape = shapeObj;
                }



            }
        },
        getDisplayAreaShapeIds() { //获取可视区域内的shapeId
            if (this.wheelNum < this.wheelShow) return false;
            //只查找有绘制座位shape的shapeList
            //计算出当前的中心点在svg中的坐标，因为可视区域的宽高是知道的
            let xMin = -this.position.left / this.wheelPow + this.center.x / 200,
                xMax = (-this.position.left + this.cont.width) / this.wheelPow - this.center.x / 200,
                yMin = -this.position.top / this.wheelPow + this.center.x / 200,
                yMax = (-this.position.top + this.cont.height) / this.wheelPow - this.center.x / 200;
            //绘制出四个顶点
            // let point1 = [xMin, yMin]
            // let point2 = [xMax, yMin]
            // let point3 = [xMin, yMax]
            // let point4 = [xMax, yMax]
            // document.getElementById("211").setAttribute("cx", point1[0])
            // document.getElementById("211").setAttribute("cy", point1[1])
            // document.getElementById("212").setAttribute("cx", point2[0])
            // document.getElementById("212").setAttribute("cy", point2[1])
            // document.getElementById("213").setAttribute("cx", point3[0])
            // document.getElementById("213").setAttribute("cy", point3[1])
            // document.getElementById("214").setAttribute("cx", point4[0])
            // document.getElementById("214").setAttribute("cy", point4[1])

            //渲染列表判断
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
            this.drawMapSeat(list);

            // 当前可是区域列表判断
            let list2 = [];
            for (let i = 0; i < this.shapeList.length; i++) {
                let shape = this.shapeList[i];
                //首先判断中心点是否在范围内
                if (shape.cenPoint[0] < xMax && shape.cenPoint[0] > xMin && shape.cenPoint[1] < yMax && shape.cenPoint[1] > yMin) {
                    list2.push(shape);
                    continue;
                }
                for (let j = 0; j < shape.pointList.length; j++) {
                    let point = shape.pointList[j];
                    if (point[0] < xMax && point[0] > xMin && point[1] < yMax && point[1] > yMin) {
                        list2.push(shape);
                        break;
                    }
                }
            }
            if (!COMMON.diffObject({
                    ...this.viewBoxList
                }, {
                    ...list2
                })) this.viewBoxList = list2;
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
                this.drawOneShapeSeat({
                    ...shape
                }, {
                    ...this.shapeList[shapeIndex]
                });
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
            } else {
                this.renderList.push({
                    ...shape
                })
            }
            this.viewBoxList.push({
                ...shape
            })
            document.getElementById(shape.shapeId).style.fill = "rgba(255, 192, 203, 0.74)";
            this.saveAction();
        },
        checkedShapeSeatCancle() { //取消设置行列
            console.log("checkedShapeSeatCancle..........")
            this.checkedShapeShow = false;
        },
        setSvgAndCanvas(val) {
            // if (this.wheelNum == val) return false;
            this.wheelNum = val;
            this.setWidth = this.wheelNum * this.maxWidth;
            this.setHeight = this.wheelNum * this.maxHeight;
            //设置svg
            svgDom.setAttribute("width", this.setWidth)
            svgDom.setAttribute("height", this.setHeight)

            if (this.wheelNum >= this.wheelShow) {
                // //设置canvas
                this.canvasList.forEach((list, idx) => {
                    list.forEach(item => {
                        item.width = this.setWidth / this.canvasSplit.col
                        item.height = this.setHeight / this.canvasSplit.row
                        item.dom.width = this.setWidth / this.canvasSplit.col
                        item.dom.height = this.setHeight / this.canvasSplit.row
                    })
                })
                this.$nextTick(() => {
                    this.getDisplayAreaShapeIds()
                })
            }
            this.renderList = []
            this.viewBoxList = []
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
        warpInit(center) {
            contentWarp = this.$refs.content;

            this.cont.width = contentWarp.clientWidth || contentWarp.offsetWidth;
            // this.cont.height = (this.cont.width * center.y) / center.x;
            // contentWarp.style.height = this.cont.height + 'px';
            this.cont.height = contentWarp.clientHeight || contentWarp.offsetHeight;
            this.cont.offsetLeft = contentWarp.offsetLeft;
            this.cont.offsetTop = contentWarp.offsetTop;
            this.cont.center = [this.cont.width / 2 + this.cont.offsetLeft, this.cont.height / 2 + this.cont.offsetTop];

            // 缩略图数据计算
            this.miniMap.width = 300;
            this.miniMap.height = 300 * this.cont.height / this.cont.width;


            // contentWarp.onmousedown = this.warpClick;
            // contentWarp.onmouseup = this.warpDataInit;
            // contentWarp.onmousemove = this.warpDrag;

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
            //鼠标移出事件
            contentWarp.onmouseout = this.warpOut;
            // 鼠标滑过事件，显示座位的行列信息
            contentWarp.onmousemove = this.warpHover;

            //点击事件和拖拽事件冲突优化
            contentWarp.onmousedown = function(e) {
                _this.hoverInfoInit();
                //清除鼠标滑过和out事件
                contentWarp.onmousemove = null;
                contentWarp.onmouseout = null;
                let clickX = e.clientX,
                    clickY = e.clientY;
                let offsetTop = svgWarp.offsetTop,
                    offsetLeft = svgWarp.offsetLeft;
                let isDrag = false;
                let target = e.target;
                contentWarp.onmousemove = function(e) {
                    let left = Math.ceil(e.clientX - clickX); //偏移量
                    let top = Math.ceil(e.clientY - clickY); //偏移量
                    if (Math.abs(left) >= 5 && Math.abs(top) >= 5) {
                        isDrag = true;
                        _this.positionCheck({
                            top: top + offsetTop,
                            left: left + offsetLeft
                        });
                        _this.setCheckBox();
                    }

                }
                contentWarp.onmouseup = function(e) {
                    _this.hoverInfoInit()
                    contentWarp.onmousemove = _this.warpHover;
                    contentWarp.onmouseup = null;
                    contentWarp.onmouseout = _this.warpOut;
                    if (isDrag) {
                        _this.getDisplayAreaShapeIds();
                    } else {
                        _this.shapeCheckedAction(target, [clickX - offsetLeft - _this.cont.offsetLeft, clickY - offsetTop - _this.cont.offsetTop])
                    }
                }
                // contentWarp.onmouseout = function(e) {
                //     _this.hoverInfoInit()
                //     contentWarp.onmousemove = _this.warpHover;
                //     contentWarp.onmouseup = null;
                //     contentWarp.onmouseout = _this.warpOut;
                //     if (isDrag) {
                //         _this.getDisplayAreaShapeIds();
                //     }
                // }
            }
        },
        warpOut() {
            _this.hoverInfoInit()
        },
        warpHover(e) { //鼠标滑过事件，显示座位的行列信息
            if (this.wheelNum < this.wheelShow) return false;
            let shape = e.target;
            let name = shape.nodeName;
            if (name != "path" && name != "rect" && name != "polygon") return false;
            //计算出鼠标的真实坐标
            let clickX = e.clientX,
                clickY = e.clientY;
            let hoverPoint = [clickX - svgWarp.offsetLeft - _this.cont.offsetLeft, clickY - svgWarp.offsetTop - _this.cont.offsetTop];
            let shapeId = shape.getAttribute("id");
            let shapeIds = this.viewBoxList.map(item => item.shapeId);
            let shapedIdx = shapeIds.indexOf(shapeId);
            if (shapedIdx != -1) {
                let hoverShape = this.viewBoxList[shapedIdx];
                let seat = this.checkOnSeat(hoverShape, hoverPoint);
                if (seat.length == 0) {
                    this.hoverInfoInit()
                } else {
                    let seatInfo = hoverShape.seats[seat[0]][seat[1]];
                    if (seatInfo.status == -1) {
                        this.hoverInfoInit()
                    } else {
                        this.hoverInfo.text = seatInfo.rowString + "排 " + seatInfo.colString + "座";
                        this.hoverInfo.show = true;
                        this.hoverInfo.top = clickY;
                        this.hoverInfo.left = clickX;
                    }

                }
            }
        },
        warpWheel(e) { //滚轮事件，缩放svg与画布的大小
            this.hoverInfoInit()
            let orgWidth = svgWarp.offsetWidth,
                orgHeight = svgWarp.offsetHeight;
            let orgTop = svgWarp.offsetTop,
                orgLeft = svgWarp.offsetLeft;
            let radio = e.wheelDelta / 12000;
            if (radio < 0 && this.wheelNum > this.wheelMax / 4) {
                radio = radio * 8;
            } else if (radio > 0 && this.wheelNum < this.wheelMax / 4 * 3) {
                radio = radio * 8;
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
        },
        hoverInfoInit() { //hovertip init
            this.hoverInfo.show = false;
            this.hoverInfo.top = 0;
            this.hoverInfo.left = 0;
            this.hoverInfo.text = '';
        },
        //座位信息 start
        seatIconInit() { //座位图标初始化
            this.seatIcon.iconShow = this.$refs.iconShow;
            this.seatIcon.iconChecked = this.$refs.iconChecked;
        },
        //座位信息 end
        judgePageActive() { //判断当前页面是否是激活状态

            var hidden, state, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
                state = "visibilityState";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
                state = "mozVisibilityState";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
                state = "msVisibilityState";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
                state = "webkitVisibilityState";
            }

            // 添加监听器,监听当前是否活动页面
            document.addEventListener(visibilityChange, function() {
                if (document[state] == "hidden") {
                    console.log("hidden............")
                    let time = setTimeout(() => {
                        this.pageVisible = false;
                    }, 10000)
                    document.title = document[state];
                } else {
                    console.log("visible............")
                    if (this.pageVisible == false) this.pageVisible = true;
                }
            })
        },
        saveAction() {
            localStorage.setItem("shapeList", JSON.stringify(this.shapeList));
        },
        //普通函数方法
        floatTwo(num) { //保留两位小数
            return Math.floor(num * 10000) / 10000;

            // rounded = (0.5 + num) | 0;
            // rounded = ~~ (0.5 + num);
            // rounded = (0.5 + num) << 0;
        }

    }
};
</script>

<style lang="scss" scoped>
input {
    border: 1px solid #ccc;
}
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
        pointer-events: none;
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
        border-bottom: 1px solid red;
        overflow: hidden;
        width: 100%;
        float: left;
    }

    .content {
        height: calc(100vh - 40px);
        width: 100%;
        // width: calc(100vw - 600px);
        overflow: hidden;
        float: left;
        overflow: hidden;
        position: relative;
        overflow: hidden;
        margin: 0 auto;
        // border: 1px solid #ccc;
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
            border: 1px solid rgba(255, 192, 203, 1);
            // background-color: rgba(255, 192, 203, 0.3);
            // background-color: #bbbcbe;
            //禁止鼠标事件
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;

            // opacity: 1;
        }
    }
    .active-area {
        // float: left;
        width: 600px;
        position: fixed;
        top: 0;
        right: 0;
        width: 600px;
        height: 100%;
        z-index: 2;
        background-color: #fff;
        display: none;
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
.hover-info {
    pointer-events: none;
    padding: 12px;
    background-color: rgba(0,0,0,.6);
    position: fixed;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    pointer-events: none;
    transform: translate(-50%,-140%);
    span {
        font-size: 12px;
        color: #fff;
    }
    div {
        width: 0;
        height: 0;
        border-color: rgba(0,0,0,.6) transparent transparent;
        border-style: solid;
        border-width: 10px 10px 0;
        position: absolute;
        bottom: -10px;
        left: 0;
        right: 0;
        margin: auto;
    }
}
button {
    padding: 5px;
    border: 1px solid #ccc;
    margin-right: 5px;
}
</style>
