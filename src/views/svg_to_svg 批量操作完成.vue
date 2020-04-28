<template lang="pug">
.warp
	div(style="display:none;")
		img( ref="iconNone" src="../assets/seat_icon_none.svg" alt="" sizes="" srcset="")
		img( ref="iconSelected" src="../assets/seat_icon_org.svg" alt="" sizes="" srcset="")
	.mini-map(ref="miniMap" :style="{width:miniMap.width+'px',height:miniMap.height+'px'}" v-show="miniMap.show&&showMax")
		.checkBox(ref="checkBox" :style="{width:checkBox.width+'px',height:checkBox.height+'px',top:checkBox.top+'px',left:checkBox.left+'px'}")
	.top.clear
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
	.bottom.clear
		.content-warp
			//- .checked-info {{checkedShape.cols}} {{checkedShape.rows}}
			.content(ref="content")
				.svg-warp(ref="svgWarp" v-html="svg" ,:class="{'showCanvas':wheelNum==wheelMax}")
				div(v-for="(list,idx) in canvasList",:key="idx" v-show="wheelNum==wheelMax")
					canvas.my-canvas( v-for="(canvasItem,idxs) in list" v-show="canvasItem.show" ,:key="idxs" ,:id="canvasItem.canvasId",:style="{left:canvasItem.left+'px',top:canvasItem.top+'px',zIndex:(batchAction?2:0)}" ) 浏览器不支持canvas
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
				canvas.seat-canvas(v-show="checkedShape.shapeId!=null" id="seatCanvas" ref="seatCanvas")
				.selected-box( ref="selectedBox" v-show="selectedBox.width>0&&selectedBox.height>0" ,:style="{width:selectedBox.width+'px',height:selectedBox.height+'px',top:selectedBox.top+'px',left:selectedBox.left+'px'}") selectedBox
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
            showMax: false,
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

            popSeatIconShow: false,
            popSeatIcon: {
                icon: "",
                width: 20,
                height: 20,
                realWidth: 20,
                realHeight: 20,
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
    computed: {
        powNum: function() {
            let pow = this.wheelNum * this.wheelNum;
            this.seatIcon.realWidth = this.seatIcon.width * pow
            this.seatIcon.realHeight = this.seatIcon.height * pow
            return pow
        },
        testList() {
            return JSON.parse(JSON.stringify(this.shapeList))
        }
    },
    watch: {
        shapeList: {
            handler(newVal) {
                this.saveAction()
            },
            deep: true
        },
        position: {
            handler(newVal) {
                svgWarp.style.left = newVal.left + 'px';
                svgWarp.style.top = newVal.top + 'px';
                if (this.wheelNum < this.wheelMax) return false;
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
                            let rangeCenter = [center[0] * this.powNum, center[1] * this.powNum]
                            let rangePoints = [
                                [point1[0] * this.powNum, point1[1] * this.powNum],
                                [point2[0] * this.powNum, point2[1] * this.powNum],
                                [point3[0] * this.powNum, point3[1] * this.powNum],
                                [point4[0] * this.powNum, point4[1] * this.powNum]
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
        },
        checkedShapeShow(newVal) {
            if (newVal) {
                this.checkedShapePopData = {
                    ...this.checkedShape
                }
            }
        }
    },
    created() {
        this.getCanvasList()
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
            this.canvasInit()
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
                // _this.seatCanvasWarp.dom.onmouseout = function(e) {
                //
                // }
                onlyForAction.onmouseup = function(e) { //鼠标弹起
                    //点击事件
                    if (_this.selectedBox.width == 0 && _this.selectedBox.height == 0) {
                        let seat = []
                        for (let i = 0; i < _this.checkedShape.cols; i++) {
                            let real_x = i * seat_width + _this.seatCanvas.paddingLeft;
                            for (let j = 0; j < _this.checkedShape.rows; j++) {
                                let real_y = j * seat_height + _this.seatCanvas.paddingTop;
                                let seatPoint = [real_x + _this.seatCanvas.seatWdith / 2, real_y + _this.seatCanvas.seatHeight / 2]
                                if (TOOLS.getDisance1(seatPoint, clickPoint) < _this.seatCanvas.seatWdith / 2) {
                                    seat = [j, i];
                                    break;
                                }
                                if (seat.length != 0) break;
                            }
                            if (seat.length != 0) break;
                        }
                        if (seat.length == 0) return false;
                        let real_x = seat[1] * seat_width + _this.seatCanvas.paddingLeft;
                        let real_y = seat[0] * seat_height + _this.seatCanvas.paddingTop;
                        if (_this.selectedSeatList.length != 0) {
                            //已经有选中的了
                            let hasIdx = -1;
                            for (let i = 0; i < _this.selectedSeatList.length; i++) {
                                let selcted_seat = _this.selectedSeatList[i];
                                if (selcted_seat.toString() == seat.toString()) {
                                    hasIdx = i;
                                    break;
                                }
                            }
                            if (hasIdx != -1) { //相等表明是取消操作，显示该座位本来状态
                                _this.seatCanvas.ctx.beginPath();
                                if (_this.checkedShape.seats[seat[0]][seat[1]].status == 0) {
                                    _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconShow, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                                } else if (_this.checkedShape.seats[seat[0]][seat[1]].status == -1) {
                                    _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconNone, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                                }
                                _this.$delete(_this.selectedSeatList, hasIdx);
                            } else {
                                //添加，选中座位
                                _this.seatCanvas.ctx.beginPath();
                                _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconSelected, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                                _this.selectedSeatList.push(seat);
                            }
                        } else {
                            //单个座位状态切换
                            let seatPoint = [real_x + _this.seatCanvas.seatWdith / 2, real_y + _this.seatCanvas.seatHeight / 2]
                            if (_this.checkedShape.seats[seat[0]][seat[1]].status == 0) {
                                _this.checkedShape.seats[seat[0]][seat[1]].status = -1;
                            } else {
                                _this.checkedShape.seats[seat[0]][seat[1]].status = 0;
                            }
                            _this.seatCanvas.ctx.beginPath();
                            if (_this.checkedShape.seats[seat[0]][seat[1]].status == 0) {
                                _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconShow, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                            } else if (_this.checkedShape.seats[seat[0]][seat[1]].status == -1) {
                                _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconNone, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                            }
                            //更新数据到shapeList中
                            _this.shapeList[_this.checkedShapeIdx].seats[seat[0]][seat[1]].status = _this.checkedShape.seats[seat[0]][seat[1]].status;
                        }
                    } else {
                        //拖拽事件，判断当前选中的座位
                        let endPoint = [clickPoint[0] + _this.selectedBox.width, clickPoint[1] + _this.selectedBox.height];
                        let selectedList = [];
                        for (let i = 0; i < _this.checkedShape.cols; i++) {
                            let real_x = i * seat_width + _this.seatCanvas.paddingLeft;
                            for (let j = 0; j < _this.checkedShape.rows; j++) {
                                let real_y = j * seat_height + _this.seatCanvas.paddingTop;
                                let point1 = [real_x, real_y];
                                let point2 = [real_x + _this.seatCanvas.seatWdith, real_y + _this.seatCanvas.seatHeight];
                                if (
                                    point1[0] >= clickPoint[0] && point1[0] <= endPoint[0] &&
                                    point2[0] >= clickPoint[0] && point2[0] <= endPoint[0] &&
                                    point1[1] >= clickPoint[1] && point1[1] <= endPoint[1] &&
                                    point2[1] >= clickPoint[1] && point2[1] <= endPoint[1]
                                ) {
                                    _this.seatCanvas.ctx.beginPath();
                                    _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconSelected, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                                    selectedList.push([j, i])
                                }
                                // else {
                                //     _this.seatCanvas.ctx.beginPath();
                                //     if (_this.checkedShape.seats[j][i].status == 0) {
                                //         _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconShow, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                                //     } else if (_this.checkedShape.seats[j][i].status == -1) {
                                //         _this.seatCanvas.ctx.drawImage(_this.seatIcon.iconNone, real_x, real_y, _this.seatCanvas.seatWdith, _this.seatCanvas.seatHeight);
                                //     }
                                // }

                            }
                        }
                        _this.selectedSeatList.push(...selectedList);
                    }
                    onlyForAction.onmousemove = null;
                    onlyForAction.onmouseup = null;
                }
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
            this.checkedShape.seats = seats
            this.drawSeatCanvas(this.checkedShape)
            this.$set(this.shapeList, this.checkedShapeIdx, {
                ...this.checkedShape
            })
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
        getCanvasList() { //根据切割canvas的行和列计算出canvas有多少个
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
                let tmpList = []
                for (let j = 0; j < this.canvasSplit.col; j++) {
                    tmpList.push({
                        ...obj,
                        canvasId
                    })
                    canvasId++;
                }
                this.canvasList.push(tmpList)
            }
            // console.log(this.canvasList)
        },
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
                    let findIdx = shapeIds.indexOf(curId + "");
                    if (findIdx != -1) {
                        if (this.shapeList[findIdx].rows > 0 && this.shapeList[findIdx].cols > 0) {
                            item.style.fill = "rgba(255, 192, 203, 0.74)";
                        }
                    }
                }
            })

            // document.getElementById("101").style.fill = "pink";
            // document.getElementById("25").style.fill = "pink";
            // document.getElementById("51").style.fill = "pink";
            // document.getElementById("56").style.fill = "pink";

            //给shape绑定选中事件
            if (this.showMax) {
                svgDom.addEventListener("dblclick", _this.shapeCheckedAction)
                svgDom.addEventListener("click", _this.seatCheckedAction)
            } else {
                svgDom.addEventListener("click", _this.shapeCheckedAction)
            }


            let viewBox = svgDom.getAttribute("viewBox").split(" ")
            this.center = {
                // x: 5872.5,
                // y: 4344
                find: true,
                x: parseFloat(viewBox[2]) / 2,
                y: parseFloat(viewBox[3]) / 2
            }
            //根据宽高比计算出content的高度
            this.warpInit(this.center);

            //计算出最大缩放值
            // this.wheelMax = 15000 / (this.center.x * 2);
            //缩放基础数据计算
            this.maxWidth = this.center.x * 2 * this.wheelMax;
            // this.maxWidth = 11745;
            this.wheelMax = this.maxWidth / (this.center.x * 2);
            this.maxHeight = this.center.y * 2 * this.wheelMax;
            this.wheelMin = this.floatTwo(this.cont.width / this.maxWidth);

            // //设置canvas
            this.canvasList.forEach((list, idx) => {
                list.forEach(item => {
                    item.width = this.maxWidth * this.wheelMax / this.canvasSplit.col
                    item.height = this.maxHeight * this.wheelMax / this.canvasSplit.row
                    item.dom.width = this.maxWidth * this.wheelMax / this.canvasSplit.col
                    item.dom.height = this.maxHeight * this.wheelMax / this.canvasSplit.row
                })
            })


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
        clickToMax(shape, wheelVal) { //点击放大
            if (!this.showMax) return false;
            this.setSvgAndCanvas(wheelVal);

            let pointListCol = JSON.parse(JSON.stringify(shape.pointList));
            let pointListRow = JSON.parse(JSON.stringify(shape.pointList));
            //找出左上角的坐标
            //降序排列
            pointListCol.sort((point1, point2) => {
                return (point1[1] - point2[1])
            })
            //降序排列
            pointListRow.sort((point1, point2) => {
                return (point1[0] - point2[0])
            })
            let pointTopLeft = [pointListRow[0][0], pointListCol[0][1]];

            // let cenPoint = shape.cenPoint;
            // let left = cenPoint[0] * this.powNum - this.cont.width / 2;
            // let top = cenPoint[1] * this.powNum - this.cont.height / 2;

            let left = pointTopLeft[0] * this.powNum;
            let top = pointTopLeft[1] * this.powNum;
            let position = {
                top: -1 * top,
                left: -1 * left
            }
            this.positionCheck(position)
            this.setCheckBox();
            this.getDisplayAreaShapeIds()
            // document.getElementById("211").setAttribute("cx", pointTopLeft[0])
            // document.getElementById("211").setAttribute("cy", pointTopLeft[1])
        },
        updateShapeSeatStatus(shape, seats) { //更新shape里单个座位的状态渲染信息
            //shape 表明是哪个区域
            //seats 是座位的座位下标，传数组，因为后面要实现批量选座
            // console.log("updateShapeSeatStatus...........")
            // console.log(seats)
            //center 是svg虚拟单位值
            let center = [shape.cenPoint[0], shape.cenPoint[1]];
            let angle = shape.angle;
            let width = (this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight;
            let height = (this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom;
            //计算出实际坐标 svg一比一
            //计算出实际坐标 svg一比一
            let point1 = [center[0] - width / 2, center[1] - height / 2];
            let point2 = [center[0] + width / 2, center[1] - height / 2];
            let point3 = [center[0] + width / 2, center[1] + height / 2];
            let point4 = [center[0] - width / 2, center[1] + height / 2];
            let rangePoints = [
                [point1[0] * this.powNum, point1[1] * this.powNum],
                [point2[0] * this.powNum, point2[1] * this.powNum],
                [point3[0] * this.powNum, point3[1] * this.powNum],
                [point4[0] * this.powNum, point4[1] * this.powNum]
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
            drawCanvas.forEach(canvasItem => {
                canvasItem.ctx.save();
                canvasItem.ctx.translate(center[0] * this.powNum - (canvasItem.col * canvasItem.width), center[1] * this.powNum - (canvasItem.row * canvasItem.height));
                canvasItem.ctx.rotate(angle * Math.PI / 180);
                canvasItem.ctx.translate(-(
                    center[
                        0] * this.powNum - (canvasItem.col * canvasItem.width)), -(center[1] * this.powNum - (canvasItem.row * canvasItem.height)));
                seats.forEach(seat => {
                    let j = seat[0],
                        i = seat[1];
                    let x = point1[0] + i * (this.seatIcon.width + this.seatIcon.marginRight);
                    let y = point1[1] + j * (this.seatIcon.height + this.seatIcon.marginBottom);
                    let real_x = x * this.powNum - (canvasItem.col * canvasItem.width);
                    let real_y = y * this.powNum - (canvasItem.row * canvasItem.height);
                    canvasItem.ctx.beginPath();
                    if (shape.seats[j][i].status == 0) {
                        canvasItem.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatIcon.realWidth, this.seatIcon.realHeight);
                    } else if (shape.seats[j][i].status == -1) {
                        canvasItem.ctx.drawImage(this.seatIcon.iconNone, real_x, real_y, this.seatIcon.realWidth, this.seatIcon.realHeight);
                    }
                })
                canvasItem.ctx.restore();
            })
            // ctx.restore();

        },
        drawOneShapeSeat(shape, originShape = false) { //绘制单个区域座位
            console.log("drawOneShapeSeat...........")
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
                        [point1[0] * this.powNum, point1[1] * this.powNum],
                        [point2[0] * this.powNum, point2[1] * this.powNum],
                        [point3[0] * this.powNum, point3[1] * this.powNum],
                        [point4[0] * this.powNum, point4[1] * this.powNum]
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
                        canvasItem.ctx.translate(center[0] * this.powNum - (canvasItem.col * canvasItem.width), center[1] * this.powNum - (canvasItem.row * canvasItem.height));
                        canvasItem.ctx.rotate(angle * Math.PI / 180);
                        canvasItem.ctx.translate(-(center[0] * this.powNum - (canvasItem.col * canvasItem.width)), -(center[1] * this.powNum - (canvasItem.row * canvasItem.height)));

                        canvasItem.ctx.clearRect(point1[0] * this.powNum - (canvasItem.col * canvasItem.width), point1[1] * this.powNum - (canvasItem.row * canvasItem.height), orgWidth * this.powNum, orgHeight * this.powNum);

                        canvasItem.ctx.restore();
                    })

                }
            }

            let width = (this.seatIcon.width + this.seatIcon.marginRight) * shape.cols - this.seatIcon.marginRight;
            let height = (this.seatIcon.height + this.seatIcon.marginBottom) * shape.rows - this.seatIcon.marginBottom;
            //计算出实际坐标 svg一比一
            let point1 = [center[0] - width / 2, center[1] - height / 2];
            let point2 = [center[0] + width / 2, center[1] - height / 2];
            let point3 = [center[0] + width / 2, center[1] + height / 2];
            let point4 = [center[0] - width / 2, center[1] + height / 2];
            let rangeCenter = [center[0] * this.powNum, center[1] * this.powNum]
            let rangePoints = [
                [point1[0] * this.powNum, point1[1] * this.powNum],
                [point2[0] * this.powNum, point2[1] * this.powNum],
                [point3[0] * this.powNum, point3[1] * this.powNum],
                [point4[0] * this.powNum, point4[1] * this.powNum]
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
                }
            }
            // 座位先一排一排的绘制
            drawCanvas.forEach(canvasItem => {

                canvasItem.ctx.save();
                canvasItem.ctx.translate(center[0] * this.powNum - (canvasItem.col * canvasItem.width), center[1] * this.powNum - (canvasItem.row * canvasItem.height));
                canvasItem.ctx.rotate(angle * Math.PI / 180);
                canvasItem.ctx.translate(-(
                    center[
                        0] * this.powNum - (canvasItem.col * canvasItem.width)), -(center[1] * this.powNum - (canvasItem.row * canvasItem.height)));
                let s_x = 0,
                    e_x = 0,
                    s_y = 0,
                    e_y = 0;
                if (drawCanvas.length > 1) {
                    s_x = canvasItem.width * canvasItem.col;
                    e_x = canvasItem.width * (canvasItem.col + 1);
                    s_y = 0;
                    e_y = canvasItem.height;
                }

                for (let i = 0; i < shape.cols; i++) {
                    let x = point1[0] + i * (this.seatIcon.width + this.seatIcon.marginRight);
                    let real_x = x * this.powNum - (canvasItem.col * canvasItem.width);
                    for (let j = 0; j < shape.rows; j++) {
                        let y = point1[1] + j * (this.seatIcon.height + this.seatIcon.marginBottom);
                        let real_y = y * this.powNum - (canvasItem.row * canvasItem.height);
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
                        canvasItem.ctx.beginPath();
                        if (shape.seats[j][i].status == 0) {
                            canvasItem.ctx.drawImage(this.seatIcon.iconShow, real_x, real_y, this.seatIcon.realWidth, this.seatIcon.realHeight);
                        } else if (shape.seats[j][i].status == -1) {
                            canvasItem.ctx.drawImage(this.seatIcon.iconNone, real_x, real_y, this.seatIcon.realWidth, this.seatIcon.realHeight);
                        }
                        // }
                    }
                }
                canvasItem.ctx.restore();
            })


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
                this.shapeList.push({
                    ...shapeObj
                });
                this.checkedShapeIdx = this.shapeList.length - 1;
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
                this.clickToMax(shapeObj, this.wheelMax * 1);

            } else {
                let shapeIndex = shapeIds.indexOf(shapeId)
                shapeObj = JSON.parse(JSON.stringify(this.shapeList[shapeIndex]))


                //没有设置座位区域，需要先让用户设置区域座位信息
                if (this.checkedShape.shapeId != shapeObj.shapeId) {
                    this.clickToMax(shapeObj, this.wheelMax * 1);
                    this.toggleCheckedShapeStatus(shapeObj, {
                        ...this.checkedShape
                    })
                    this.checkedShape = shapeObj;
                    let shapeIds = this.shapeList.map(item => item.shapeId);
                    this.checkedShapeIdx = shapeIds.indexOf(shapeId);

                    return false;
                } else if (this.wheelNum < this.wheelMax) {
                    this.clickToMax(shapeObj, this.wheelMax * 1);
                }

            }
        },
        seatCheckedAction(e) {
            if (this.wheelNum < this.wheelMax) {
                return false;
            }
            let shape = e.target;
            let name = shape.nodeName;
            if (name != "path" && name != "rect" && name != "polygon") return false;

            let shapeObj = [];
            let shapeId = shape.getAttribute("id");
            // 获取到shapeList的所有shapeId集合
            let shapeIds = this.shapeList.map(item => item.shapeId);
            if (shapeIds.indexOf(shapeId) == -1) {

            } else {
                let shapeIndex = shapeIds.indexOf(shapeId)
                shapeObj = JSON.parse(JSON.stringify(this.shapeList[shapeIndex]))
                //没有设置座位区域，需要先让用户设置区域座位信息
                if (this.checkedShape.shapeId != shapeObj.shapeId) {} else {
                    if (shapeObj.rows == 0 || shapeObj.cols == 0) {
                        // this.checkedShapeShow = true;
                    }
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
                        this.shapeList[shapeIndex].seats[seat[0]][seat[1]].status = seatInfo.status;
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

        },
        getDisplayAreaShapeIds() { //获取可视区域内的shapeId
            if (this.wheelNum < this.wheelMax) return false;
            //只查找有绘制座位shape的shapeList
            //计算出当前的中心点在svg中的坐标，因为可视区域的宽高是知道的
            let xMin = -this.position.left / this.powNum + this.center.x / 200,
                xMax = (-this.position.left + this.cont.width) / this.powNum - this.center.x / 200,
                yMin = -this.position.top / this.powNum + this.center.x / 200,
                yMax = (-this.position.top + this.cont.height) / this.powNum - this.center.x / 200;
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
            // console.log(list);
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
                this.drawOneShapeSeat({
                    ...shape
                }, {
                    ...this.shapeList[shapeIndex]
                });
                this.$set(this.shapeList, shapeIndex, {
                    ...shape
                });
            }
            this.checkedShape = {
                ...shape
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
        },
        checkedShapeSeatCancle() { //取消设置行列
            console.log("checkedShapeSeatCancle..........")
            this.checkedShapeShow = false;
        },
        canvasInit() { //canvas初始化
            let canvasList = document.getElementsByClassName("my-canvas");
            this.canvasList.forEach((rowList, row) => {
                rowList.forEach((canvasItem, col) => {
                    canvasItem.dom = canvasList[this.canvasSplit.col * row + col]
                    canvasItem.ctx = canvasList[this.canvasSplit.col * row + col].getContext("2d");
                })
            })
        },
        setSvgAndCanvas(val) {
            if (this.wheelNum == val) return false;
            this.wheelNum = val;
            this.setWidth = this.wheelNum * this.maxWidth;
            this.setHeight = this.wheelNum * this.maxHeight;
            //设置svg
            svgDom.setAttribute("width", this.setWidth)
            svgDom.setAttribute("height", this.setHeight)


            // canvas.width = this.canvasList[0].width;
            // canvas.height = this.canvasList[0].height;

            if (this.wheelNum == this.wheelMax) {
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
        warpInit(center) {
            contentWarp = this.$refs.content;

            this.cont.width = contentWarp.clientWidth || contentWarp.offsetWidth;
            this.cont.height = (this.cont.width * center.y) / center.x;
            contentWarp.style.height = this.cont.height + 'px';
            // this.cont.height = contentWarp.clientHeight || contentWarp.offsetHeight;
            this.cont.offsetLeft = contentWarp.offsetLeft;
            this.cont.offsetTop = contentWarp.offsetTop;
            this.cont.center = [this.cont.width / 2 + this.cont.offsetLeft, this.cont.height / 2 + this.cont.offsetTop];

            // 缩略图数据计算
            this.miniMap.width = 300;
            this.miniMap.height = 300 * this.cont.height / this.cont.width;

            contentWarp.onmousedown = this.warpClick;

            contentWarp.onmouseup = this.warpDataInit;

            contentWarp.onmouseout = this.warpDataInit;

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
            if (!this.showMax) return false;
            // console.log(this.wheelNum)
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
            this.seatIcon.iconShow = this.$refs.iconShow;
            this.seatIcon.iconNone = this.$refs.iconNone;
            this.seatIcon.iconSelected = this.$refs.iconSelected;
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
            this.canvasList.forEach((rowList, row) => {
                rowList.forEach((canvasItem, col) => {
                    canvasItem.ctx.clearRect(0, 0, canvasItem.width, canvasItem.height);
                })
            })
            this.drawMapSeat(this.renderList);
            this.saveAction();
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
        },
        toMin() {
            this.setSvgAndCanvas(this.wheelMin)
            this.position.top = 0;
            this.position.left = 0;
        },
        toMax() {
            this.showMax = !this.showMax;
            this.pageInit()
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
