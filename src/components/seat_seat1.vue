<template lang="pug">
.warp
	div(style="display:none;")
		img( ref="iconNone" src="../assets/seat_icon_none.svg" alt="" sizes="" srcset="")
		img( ref="iconSelected" src="../assets/seat_icon_org.svg" alt="" sizes="" srcset="")
	.top.clear
		//- router-link(to="/svg_to_svg") toMap
		img( ref="iconShow" src="../assets/seat_icon_show.svg" alt="" sizes="" srcset="" id="500")
		//- button(@click="miniMap.show=!miniMap.show") miniMap
		button(@click="checkedShapeShow=true") 修改区域座位信息
		//button(@click="toMax") toMax
	.bottom.clear
		.content-warp
			.content(ref="content")
				.svg-warp(ref="svgWarp" v-html="svg")
		//- 操作区域
		.active-area(ref="activeArea" )
			.active-top(:style="{height:activeTop+'px'}")
				p shapeId:{{checkedShape.shapeId}}  cols:{{checkedShape.cols}}  rows:{{checkedShape.rows}}
				.btns
					button(@click="addSeat",:disabled="selectedSeatList.length==0") 添加座位
					button(@click="removeSeat",:disabled="selectedSeatList.length==0") 删除座位
					button(@click="cancleSeleced",:disabled="selectedSeatList.length==0") 取消选择
				.cols-span(:style="{left:activeLeft+seatCanvas.paddingLeft+seatCanvas.left+'px'}" @mouseout="hoverPinkBox.width = 0;hoverPinkBox.height = 0;")
					span(v-for="(cols,idx) in checkedShape.cols",:key="idx" @click="checkedRowsOrCols(idx,false)"  @mouseover="hoverRowsOrCols(idx,false)" ) {{checkedShape.startCol+idx}} 列
			.active-left(:style="{width:activeLeft+'px',paddingTop:seatCanvas.paddingTop+'px'}")
				.rows-span(:style="{top:seatCanvas.paddingTop+seatCanvas.top+'px'}" @mouseout="hoverPinkBox.width = 0;hoverPinkBox.height = 0;")
					span(v-for="(rows,idx) in checkedShape.rows",:key="idx" @click="checkedRowsOrCols(idx,true)" @mouseover="hoverRowsOrCols(idx,true)"  ) {{checkedShape.startRow+idx}} 排
			.seat-canvas-warp(ref="seatCanvasWarp")
				canvas.seat-canvas(v-show="checkedShape.shapeId!=null&&!checkedShapeShow" id="seatCanvas" ref="seatCanvas")
				.selected-box( ref="selectedBox" v-show="selectedBox.width>0&&selectedBox.height>0&&!checkedShapeShow" ,:style="{width:selectedBox.width+'px',height:selectedBox.height+'px',top:selectedBox.top+'px',left:selectedBox.left+'px'}") selectedBox
				.hover-box(ref="hoverPinkBox" v-show="hoverPinkBox.width!=0" ,:style="{width:hoverPinkBox.width+'px',height:hoverPinkBox.height+'px',top:hoverPinkBox.top+'px',left:hoverPinkBox.left+'px'}") hoverPinkBox
				.only-for-action(ref="onlyForAction",:style="{width:seatCanvas.width+'px',height:seatCanvas.height+'px'}")
	.pop(v-show="checkedShapeShow")
		.pop-content
			h4
				span 行：
				input(type="number" v-model.number="checkedShapePopData.rows")
			h4
				span 列：
				input(type="number" v-model.number="checkedShapePopData.cols")
			h4
				span 排座-起始行：
				input(type="number" v-model.number="checkedShapePopData.startRow")
			h4
				span 排座-起始列（座）：
				input(type="number" v-model.number="checkedShapePopData.startCol")
			h4
				span 横向排序方向：
				em.radio(:class="{'checked':checkedShapePopData.orderRow==0}" @click="checkedShapePopData.orderRow=0") 逆时针
				em.radio(:class="{'checked':checkedShapePopData.orderRow==1}" @click="checkedShapePopData.orderRow=1") 顺时针
			h4
				span 竖直排序方向：
				em.radio( :class="{'checked':checkedShape.orderCol==0}" @click="checkedShapePopData.orderCol=0") 由里向外
				em.radio( :class="{'checked':checkedShapePopData.orderCol==1}" @click="checkedShapePopData.orderCol=1") 由外向里
			h4
				button(@click="checkedShapeSeatComfrim") 确认
				button(@click="checkedShapeSeatCancle") 取消
	.hover-info(v-show="hoverInfo.show" :style="{left:hoverInfo.left+'px',top:hoverInfo.top+'px'}")
		span {{hoverInfo.text}}
		div
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
            pageVisible: true,
            errorRange: 50,

            seatCanvasWarp: {
                dom: null,
                offsetLeft: 0,
                offsetTop: 0
            },
            seatCanvas: {
                dom: "",
                ctx: null,
                width: 0,
                height: 0,
                paddingLeft: 20,
                paddingTop: 20,
                seatWdith: 20,
                seatHeight: 20,
                seatMarginRight: 5,
                seatMarginBottom: 5,
                top: 0,
                left: 0
            },
            selectCanvas: {
                dom: "",
                ctx: null
            },
            activeTop: 100,
            activeLeft: 50,

            selectedBox: {
                width: 0,
                height: 0,
                top: 0,
                left: 0
            },
            selectedSeatList: [],

            hoverPinkBox: {
                width: 0,
                height: 0,
                top: 0,
                left: 0
            },


            hoverInfo: {
                show: false,
                text: "",
                top: 0,
                left: 0
            },

            //切割成多少个canvas
            canvasSplit: {
                row: 7,
                col: 7
            },

            canvasList: [], //二维数组

            batchAction: false, //批量操作

            // wheelMax: 1,//最大缩放值
            wheelMax: 1.3, //最大缩放值

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

            seatIcon: { //座位图标
                iconShow: "",
                iconNone: "",
                width: 20,
                height: 20,
                marginRight: 5,
                marginBottom: 5
            },

            checkedShapeShow: false,
            checkedShapePopData: {
                shapeId: null,
                rows: 0,
                cols: 0,
                startRow: 0, //排座的开始行
                startCol: 0, //排座的开始列（座）
                orderRow: 0, //横向排序方向：0：逆时针  1：反向
                orderCol: 0 //纵向排序方向：0：从里向外  1：反向
            },
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
            checkedShapeIdx: null,

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
    computed: {},
    watch: {
        shapeList: {
            handler(newVal) {
                this.saveAction()
            },
            deep: true
        },
        checkedShape: {
            handler(shape, oldShape) {
                if (shape.shapeId == oldShape.shapeId && shape.cols == oldShape.cols && shape.rows == oldShape.rows) return false;
                if (shape.cols == 0 || shape.rows == 0) {
                    this.checkedShapeShow = true;
                } else {
                    this.drawSeatCanvas(shape)
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
        if (localStorage.getItem("seatIcon")) {
            this.seatIcon = JSON.parse(localStorage.getItem("seatIcon"));
        }
    },
    mounted() {
        this.pageInit()

    },
    beforeDestroy() {

    },
    methods: {
        pageInit() {
            // this.judgePageActive()
            this.svg = _svg;
            // this.svg = _svgBaobao;
            //canvas init
            this.seatCanvasInit()

            this.$nextTick(() => {
                this.svgInit();
            });
        },
        seatCanvasInit() {
            this.seatCanvasWarp.dom = this.$refs.seatCanvasWarp;
            this.seatCanvasWarp.dom.addEventListener("scroll", this.seatCanvasWarpScroll)
            this.seatCanvasWarp.offsetLeft = this.seatCanvasWarp.dom.offsetLeft;
            this.seatCanvasWarp.offsetTop = this.seatCanvasWarp.dom.offsetTop;


            this.seatCanvas.dom = this.$refs.seatCanvas;
            this.seatCanvas.ctx = this.$refs.seatCanvas.getContext("2d");
            // this.selectCanvas.dom = this.$refs.selectCanvas;
            // this.selectCanvas.ctx = this.$refs.selectCanvas.getContext("2d");

            this.seatCanvasBindAction()

        },
        seatCanvasBindAction() { //seatCanvas绑定鼠标事件
            let onlyForAction = this.$refs.onlyForAction;
            onlyForAction.onmousedown = function(e) { //点击
                _this.selectedBox.width = 0;
                _this.selectedBox.height = 0;
                //鼠标坐标点
                let clickX = e.clientX - _this.seatCanvasWarp.offsetLeft - _this.seatCanvas.left;
                let clickY = e.clientY - _this.seatCanvasWarp.offsetTop - _this.seatCanvas.top;
                let clickPoint = [clickX, clickY]
                let seat_width = _this.seatCanvas.seatWdith + _this.seatCanvas.seatMarginRight;
                let seat_height = _this.seatCanvas.seatHeight + _this.seatCanvas.seatMarginBottom;
                let max_width = _this.checkedShape.cols * seat_width + _this.seatCanvas.paddingLeft * 2 - _this.seatCanvas.seatMarginRight;
                let max_height = _this.checkedShape.rows * seat_height + _this.seatCanvas.paddingTop * 2 - _this.seatCanvas.seatMarginBottom;

                onlyForAction.onmousemove = function(e) { //拖拽
                    let width = e.clientX - clickX - _this.seatCanvasWarp.offsetLeft - _this.seatCanvas.left;
                    let height = e.clientY - clickY - _this.seatCanvasWarp.offsetTop - _this.seatCanvas.top;
                    if (clickX + width > max_width) {
                        width = max_width - clickX
                    }
                    if (clickY + height > max_height) {
                        height = max_height - clickY
                    }
                    if (width > 0) {
                        _this.selectedBox.left = clickX;
                    } else {
                        _this.selectedBox.left = clickX - Math.abs(width);
                    }
                    if (height > 0) {
                        _this.selectedBox.top = clickY;
                    } else {
                        _this.selectedBox.top = clickY - Math.abs(height);
                    }
                    clickPoint = [_this.selectedBox.left, _this.selectedBox.top]
                    if (Math.abs(width) > 20 && Math.abs(height) > 20) {
                        _this.selectedBox.width = Math.abs(width);
                        _this.selectedBox.height = Math.abs(height);
                    }

                }
                onlyForAction.onmouseup = function(e) { //鼠标弹起
                    onlyForAction.onmousemove = null;
                    onlyForAction.onmouseup = null;
                    onlyForAction.onmouseout = null;
                    _this.endAction(clickPoint, seat_width, seat_height)
                }
                onlyForAction.onmouseout = function(e) { //鼠标弹起
                    onlyForAction.onmousemove = null;
                    onlyForAction.onmouseup = null;
                    onlyForAction.onmouseout = null;
                    _this.endAction(clickPoint, seat_width, seat_height)
                }
            }

        },
        endAction(clickPoint, seat_width, seat_height) {
            //点击事件
            if (this.selectedBox.width == 0 && this.selectedBox.height == 0) {
                let seat = []
                for (let i = 0; i < this.checkedShape.cols; i++) {
                    let real_x = i * seat_width + this.seatCanvas.paddingLeft;
                    for (let j = 0; j < this.checkedShape.rows; j++) {
                        let real_y = j * seat_height + this.seatCanvas.paddingTop;
                        let seatPoint = [real_x + this.seatCanvas.seatWdith / 2, real_y + this.seatCanvas.seatHeight / 2]
                        if (TOOLS.getDisance1(seatPoint, clickPoint) < this.seatCanvas.seatWdith / 2) {
                            seat = [j, i];
                            break;
                        }
                        if (seat.length != 0) break;
                    }
                    if (seat.length != 0) break;
                }
                if (seat.length == 0) return false;
                let real_x = seat[1] * seat_width + this.seatCanvas.paddingLeft;
                let real_y = seat[0] * seat_height + this.seatCanvas.paddingTop;
                if (this.selectedSeatList.length != 0) {
                    //已经有选中的了
                    let hasIdx = -1;
                    for (let i = 0; i < this.selectedSeatList.length; i++) {
                        let selcted_seat = this.selectedSeatList[i];
                        if (selcted_seat.toString() == seat.toString()) {
                            hasIdx = i;
                            break;
                        }
                    }
                    if (hasIdx != -1) { //相等表明是取消操作，显示该座位本来状态
                        this.seatCanvas.ctx.beginPath();
                        if (this.checkedShape.seats[seat[0]][seat[1]].status == 0) {
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        } else if (this.checkedShape.seats[seat[0]][seat[1]].status == -1) {
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconNone, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        }
                        this.$delete(this.selectedSeatList, hasIdx);
                    } else {
                        //添加，选中座位
                        this.seatCanvas.ctx.beginPath();
                        this.seatCanvas.ctx.drawImage(this.seatIcon.iconSelected, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        this.selectedSeatList.push(seat);
                    }
                } else {
                    //单个座位状态切换
                    let seatPoint = [real_x + this.seatCanvas.seatWdith / 2, real_y + this.seatCanvas.seatHeight / 2]
                    if (this.checkedShape.seats[seat[0]][seat[1]].status == 0) {
                        this.checkedShape.seats[seat[0]][seat[1]].status = -1;
                    } else {
                        this.checkedShape.seats[seat[0]][seat[1]].status = 0;
                    }
                    this.seatCanvas.ctx.beginPath();
                    if (this.checkedShape.seats[seat[0]][seat[1]].status == 0) {
                        this.seatCanvas.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                    } else if (this.checkedShape.seats[seat[0]][seat[1]].status == -1) {
                        this.seatCanvas.ctx.drawImage(this.seatIcon.iconNone, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                    }
                    this.checkedShape = this.orderSeats({
                        ...this.checkedShape
                    })
                    //更新数据到shapeList中
                    this.$set(this.shapeList, this.checkedShapeIdx, {
                        ...this.checkedShape
                    })
                }
            } else {
                //拖拽事件，判断当前选中的座位
                let endPoint = [clickPoint[0] + this.selectedBox.width, clickPoint[1] + this.selectedBox.height];
                let selectedList = [];
                for (let i = 0; i < this.checkedShape.cols; i++) {
                    let real_x = i * seat_width + this.seatCanvas.paddingLeft;
                    for (let j = 0; j < this.checkedShape.rows; j++) {
                        let real_y = j * seat_height + this.seatCanvas.paddingTop;
                        let point1 = [real_x, real_y];
                        let point2 = [real_x + this.seatCanvas.seatWdith, real_y + this.seatCanvas.seatHeight];
                        if (
                            point1[0] >= clickPoint[0] && point1[0] <= endPoint[0] &&
                            point2[0] >= clickPoint[0] && point2[0] <= endPoint[0] &&
                            point1[1] >= clickPoint[1] && point1[1] <= endPoint[1] &&
                            point2[1] >= clickPoint[1] && point2[1] <= endPoint[1]
                        ) {
                            this.seatCanvas.ctx.beginPath();
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconSelected, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                            selectedList.push([j, i])
                        }
                    }
                }
                this.selectedSeatList.push(...selectedList);
            }
        },
        checkedRowsOrCols(idx, type) {
            // 是选择row还是col，true==row
            let list = []
            let seat_width = _this.seatCanvas.seatWdith + _this.seatCanvas.seatMarginRight;
            let seat_height = _this.seatCanvas.seatHeight + _this.seatCanvas.seatMarginBottom;
            let row = type ? idx : 0;
            let col = type ? 0 : idx;
            let len = type ? this.checkedShape.rows : this.checkedShape.cols;
            for (let j = 0; j < len; j++) {
                if (type) {
                    col = j
                } else {
                    row = j;
                }
                let real_x = col * seat_height + _this.seatCanvas.paddingTop;
                let real_y = row * seat_width + _this.seatCanvas.paddingLeft;
                //判断是否已经在selectedSeatList存在
                let has = false;
                _this.seatCanvas.ctx.beginPath();
                for (let i = 0; i < _this.selectedSeatList.length; i++) {
                    if (_this.selectedSeatList[i].toString() == [row, col].toString()) {
                        has = true;
                        break;
                    }
                }
                if (!has) {
                    _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconSelected, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                    list.push([row, col])
                }
            }
            this.selectedSeatList.push(...list)
        },
        hoverRowsOrCols(idx, type) {
            let seat_width = this.seatCanvas.seatWdith + this.seatCanvas.seatMarginRight;
            let seat_height = this.seatCanvas.seatHeight + this.seatCanvas.seatMarginBottom;
            if (type) {
                // row
                this.hoverPinkBox.width = this.checkedShape.cols * seat_width + this.seatCanvas.paddingLeft * 2 - this.seatCanvas.seatMarginRight;
                this.hoverPinkBox.height = this.seatCanvas.seatHeight;
                this.hoverPinkBox.left = 0;
                this.hoverPinkBox.top = idx * seat_height + this.seatCanvas.paddingTop;
            } else {
                // col
                this.hoverPinkBox.width = this.seatCanvas.seatWdith;
                this.hoverPinkBox.height = this.checkedShape.rows * seat_height + this.seatCanvas.paddingTop * 2 - this.seatCanvas.seatMarginBottom;
                this.hoverPinkBox.left = idx * seat_width + this.seatCanvas.paddingLeft;
                this.hoverPinkBox.top = 0;
            }

        },
        cancleSeleced() {
            this.drawSeatCanvas(this.checkedShape)
        },
        addSeat() {
            let seats = [...this.checkedShape.seats]
            this.selectedSeatList.forEach(seat => {
                seats[seat[0]][seat[1]].status = 0
            })
            this.checkedShape.seats = seats
            this.checkedShape = this.orderSeats({
                ...this.checkedShape
            })
            this.drawSeatCanvas(this.checkedShape)
            this.$set(this.shapeList, this.checkedShapeIdx, {
                ...this.checkedShape
            })
        },
        removeSeat() {
            let seats = [...this.checkedShape.seats]
            this.selectedSeatList.forEach(seat => {
                seats[seat[0]][seat[1]].status = -1
            })
            this.checkedShape.seats = seats;
            this.checkedShape = this.orderSeats({
                ...this.checkedShape
            })
            this.drawSeatCanvas(this.checkedShape)
            this.$set(this.shapeList, this.checkedShapeIdx, {
                ...this.checkedShape
            })
        },
        orderSeats(shape) { //排座
            let seats = shape.seats;
            let rowString = 0;
            for (let row = 0; row < shape.rows; row++) {
                //只有当整行没有任何座位的时候才不计算
                let count = 0;
                for (let col = 0; col < shape.cols; col++) {
                    if (seats[row][col].status != -1) count += 1;
                }
                if (count != 0) rowString += 1;
                let colString = 0;
                for (let col = 0; col < shape.cols; col++) {
                    let seatInfo = seats[row][col];
                    seatInfo.rowString = rowString
                    if (seatInfo.status != -1) {
                        colString += 1;
                        seatInfo.colString = colString
                    } else {
                        seatInfo.colString = "-1"
                    }
                }
            }
            return shape;
        },
        drawSeatCanvas(shape) {
            this.selectedBox = {
                width: 0,
                height: 0,
                top: 0,
                left: 0
            };
            this.selectedSeatList = [];
            this.seatCanvas.ctx.clearRect(0, 0, this.seatCanvas.width, this.seatCanvas.height);
            // this.selectCanvas.ctx.clearRect(0, 0, this.seatCanvas.width, this.seatCanvas.height);

            let seat_width = this.seatCanvas.seatWdith + this.seatCanvas.seatMarginRight;
            let seat_height = this.seatCanvas.seatHeight + this.seatCanvas.seatMarginBottom;
            this.seatCanvas.width = shape.cols * seat_width + this.seatCanvas.paddingLeft * 2 - this.seatCanvas.seatMarginRight;
            this.seatCanvas.height = shape.rows * seat_height + this.seatCanvas.paddingTop * 2 - this.seatCanvas.seatMarginBottom;
            this.seatCanvas.dom.width = this.seatCanvas.width;
            this.seatCanvas.dom.height = this.seatCanvas.height;

            // this.selectCanvas.dom.width = this.seatCanvas.width;
            // this.selectCanvas.dom.height = this.seatCanvas.height;

            //绘制中线
            // 垂直线
            this.seatCanvas.ctx.strokeStyle = 'green';
            this.seatCanvas.ctx.lineWidth = 2;
            this.seatCanvas.ctx.beginPath();
            this.seatCanvas.ctx.moveTo(this.seatCanvas.width / 2, 0);
            this.seatCanvas.ctx.lineTo(this.seatCanvas.width / 2, this.seatCanvas.height);
            this.seatCanvas.ctx.setLineDash([8, 10]);
            this.seatCanvas.ctx.lineCap = "round";
            this.seatCanvas.ctx.stroke();
            this.seatCanvas.ctx.closePath();
            //水平线
            this.seatCanvas.ctx.beginPath();
            this.seatCanvas.ctx.moveTo(0, this.seatCanvas.height / 2);
            this.seatCanvas.ctx.lineTo(this.seatCanvas.width, this.seatCanvas.height / 2);
            this.seatCanvas.ctx.stroke();
            this.seatCanvas.ctx.closePath();

            this.$nextTick(() => {
                for (let i = 0; i < shape.cols; i++) {
                    let real_x = i * seat_width + this.seatCanvas.paddingLeft
                    for (let j = 0; j < shape.rows; j++) {
                        let real_y = j * seat_height + this.seatCanvas.paddingTop;
                        this.seatCanvas.ctx.beginPath();
                        if (shape.seats[j][i].status == 0) {
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        } else if (shape.seats[j][i].status == -1) {
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconNone, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        }
                    }
                }
            })
        },
        seatCanvasWarpScroll() {
            let top = this.$refs.seatCanvasWarp.scrollTop;
            let left = this.$refs.seatCanvasWarp.scrollLeft;
            this.seatCanvas.left = -left;
            this.seatCanvas.top = -top;
        },
        seatCanvasClick(e) {
            //鼠标坐标点
            let clickX = e.clientX - this.seatCanvasWarp.offsetLeft - this.seatCanvas.left;
            let clickY = e.clientY - this.seatCanvasWarp.offsetTop - this.seatCanvas.top;
            let clickPoint = [clickX, clickY]
            let seat_width = this.seatCanvas.seatWdith + this.seatCanvas.seatMarginRight;
            let seat_height = this.seatCanvas.seatHeight + this.seatCanvas.seatMarginBottom;
            // let shape = this.checkedShape
            let seat = []
            for (let i = 0; i < this.checkedShape.cols; i++) {
                let real_x = i * seat_width + this.seatCanvas.paddingLeft;
                for (let j = 0; j < this.checkedShape.rows; j++) {
                    let real_y = j * seat_height + this.seatCanvas.paddingTop;
                    let seatPoint = [real_x + this.seatCanvas.seatWdith / 2, real_y + this.seatCanvas.seatHeight / 2]
                    if (TOOLS.getDisance1(seatPoint, clickPoint) < this.seatCanvas.seatWdith / 2) {
                        seat = [j, i];
                        if (this.checkedShape.seats[j][i].status == 0) {
                            this.checkedShape.seats[j][i].status = -1;
                        } else {
                            this.checkedShape.seats[j][i].status = 0;
                        }
                        this.seatCanvas.ctx.beginPath();
                        if (this.checkedShape.seats[j][i].status == 0) {
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        } else if (this.checkedShape.seats[j][i].status == -1) {
                            this.seatCanvas.ctx.drawImage(this.seatIcon.iconNone, real_x, real_y, this.seatCanvas.seatWdith, this.seatCanvas.seatHeight);
                        }
                        //更新数据到shapeList中
                        this.shapeList[this.checkedShapeIdx].seats[j][i].status = this.checkedShape.seats[j][i].status;
                        break;
                    }
                    if (seat.length != 0) break;
                }
            }
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
                    let findIdx = shapeIds.indexOf(curId + "");
                    if (findIdx != -1) {
                        if (this.shapeList[findIdx].rows > 0 && this.shapeList[findIdx].cols > 0) {
                            item.style.fill = "rgba(255, 192, 203, 0.74)";
                        }
                    }
                }
            })

            let viewBox = svgDom.getAttribute("viewBox").split(" ")
            this.center = {
                find: true,
                x: parseFloat(viewBox[2]) / 2,
                y: parseFloat(viewBox[3]) / 2
            }
            let conWidth = this.$refs.content.clientWidth,
                conHeight = this.$refs.content.clientHeight;
            svgDom.setAttribute("width", conWidth)
            svgDom.setAttribute("height", conHeight)
            //给shape绑定选中事件
            svgDom.addEventListener("click", _this.shapeCheckedAction)

            //座位图标初始化
            this.seatIconInit()
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
                // shape.style.fill = "rgba(255, 192, 203, 0.74)";
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
                // this.shapeList.push({
                //     ...shapeObj
                // });
                // this.checkedShapeIdx = this.shapeList.length;
                this.toggleCheckedShapeStatus({
                    ...shapeObj
                }, {
                    ...this.checkedShape
                })
                this.checkedShapeShow = true;
                this.checkedShapePopData = {
                    ...shapeObj
                };
                //没有设置座位区域，需要先让用户设置区域座位信息


            } else {
                let shapeIndex = shapeIds.indexOf(shapeId)
                shapeObj = JSON.parse(JSON.stringify(this.shapeList[shapeIndex]))


                //没有设置座位区域，需要先让用户设置区域座位信息
                if (this.checkedShape.shapeId != shapeObj.shapeId) {
                    this.toggleCheckedShapeStatus(shapeObj, {
                        ...this.checkedShape
                    })
                    this.checkedShape = shapeObj;
                    let shapeIds = this.shapeList.map(item => item.shapeId);
                    this.checkedShapeIdx = shapeIds.indexOf(shapeId);
                    return false;
                }

            }
        },
        toggleCheckedShapeStatus(shape, originShape = false) { //选中shape显示状态切换
            if (originShape && originShape.shapeId) {
                if (shape.shapeId == originShape.shapeId) return false;
                document.getElementById(originShape.shapeId).style.stroke = "#333";
                document.getElementById(originShape.shapeId).style.strokeWidth = 1;
            }
            document.getElementById(shape.shapeId).style.strokeWidth = 16;
            document.getElementById(shape.shapeId).style.stroke = "green";
            document.getElementById("500").setAttribute("style", "transform: rotate(" + shape.angle + "deg);transform-origin: 50% 50%;");
        },
        checkedShapeSeatComfrim() { //保存设置行列
            this.checkedShapeShow = false;
            let shape = {
                ...this.checkedShapePopData
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
            } else {
                //说明是第一次保存
                this.shapeList.push({
                    ...shape
                })
            }
            this.checkedShape = {
                ...shape
            }
            this.checkedShape = this.orderSeats({
                ...this.checkedShape
            })
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
        },
        checkedShapeSeatCancle() { //取消设置行列
            console.log("checkedShapeSeatCancle..........")
            this.checkedShapeShow = false;
            this.toggleCheckedShapeStatus({
                ...this.checkedShape
            }, {
                ...this.checkedShapePopData
            })
        },
        //座位信息 start
        seatIconInit() { //座位图标初始化
            this.seatIcon.iconShow = this.$refs.iconShow;
            this.seatIcon.iconNone = this.$refs.iconNone;
            this.seatIcon.iconSelected = this.$refs.iconSelected;
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
            localStorage.setItem("seatIcon", JSON.stringify(this.seatIcon));
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
    }
    .bottom {
        width: 100%;
        height: calc(100% - 40px);
        overflow: hidden;
    }
    .content {
        height: 400px;
        width: 100%;
        overflow: hidden;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        margin: 0 auto;
        box-sizing: border-box;
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
    .content-warp {
        height: 100%;
        width: 700px;
        float: left;
    }
    .active-area {
        width: calc(100% - 700px);

        border-left: 1px solid #ccc;

        float: left;
        // position: fixed;
        // top: 0;
        // right: 0;
        // width: 600px;
        height: 100%;
        z-index: 2;
        // background-color: #ccc;
        // display: none;

        .active-top {
            border-bottom: 1px solid #ccc;
            position: relative;
            overflow: hidden;
            .cols-span {
                position: absolute;
                bottom: 0;
                height: 35px;
                vertical-align: bottom;
                overflow: hidden;
                cursor: pointer;
                span {
                    display: block;
                    width: 20px;
                    margin-right: 5px;
                    height: 100%;
                    overflow: hidden;
                    text-align: center;
                    float: left;
                    &:hover {
                        background-color: pink;
                    }
                }
            }
        }
        .active-left {
            height: calc(100% - 100px);
            float: left;
            border-right: 1px solid #ccc;
            position: relative;
            overflow: hidden;

            .rows-span {
                overflow: hidden;
                cursor: pointer;
                position: absolute;
                left: 0;
                width: 100%;
                span {
                    display: inline-block;
                    width: 100%;
                    text-align: right;
                    height: 20px;
                    margin-bottom: 5px;
                    &:hover {
                        background-color: pink;
                    }
                }
            }
        }
        .seat-canvas-warp {
            overflow: auto;
            min-height: calc(100% - 100px);
            min-width: calc(100% - 100px);
            position: relative;
            .seat-canvas {
                z-index: 2;
                background:: rgba(204, 204, 204, 0.5);
            }
            .selected-box {
                position: absolute;
                top: 0;
                left: 0;
                border: 2px dashed red;
                z-index: 2;
            }
            .hover-box {
                position: absolute;
                top: 0;
                left: 0;
                background-color: pink;
            }
            .only-for-action {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 3;
            }
        }

        canvas {
            float: left;
            // margin: 0 auto;
            position: absolute;
            top: 0;
            left: 0;
        }

    }

    .pop {
        z-index: 10;
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
    padding: 12px;
    background-color: rgba(0,0,0,.6);
    position: absolute;
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
}
</style>
