<template>
    <div class="contanier">
        <div style="display:none;">
            <img ref="iconDefault"
                 src="../assets/seat_icon_none.svg"
                 alt=""
                 sizes=""
                 srcset="">
            <img ref="iconBlue"
                 src="../assets/seat_icon_blue.svg"
                 alt=""
                 sizes=""
                 srcset="">
            <img ref="iconOrg"
                 src="../assets/seat_icon_org.svg"
                 alt=""
                 sizes=""
                 srcset="">
        </div>
        <div class="top">
            <div class="btns">
                <button @click="addShape">rect</button>
                <button @click="toMin">min</button>
                <button @click="toMax">max</button>
                <button @click="toMatch">match</button>
                <button @click="copyAction">copy</button>
                <button @click="deleteAction">delete</button>
                <button @click="setSeats">seats</button>
                <button @click="startSetSeats">{{isSetting?"unSeats":"settingSeats"}}</button>
                <button @click="setSeatsInfo">设置座位信息</button>
                <button @click="countSeats">countSeats</button>
                <button @click="saveData">saveData</button>
                <!-- <span>{{isSetting?"正在设置座位":"。。。"}}</span> -->
                <span>{{wheelNum}}</span>
            </div>
            <div class="selectedShape"
                 v-if="selectedShape">
                <h4>横坐标：
                    <input type="number"
                           v-model.number="selectedShape.position.x">
                </h4>
                <h4>纵坐标：
                    <input type="number"
                           v-model.number="selectedShape.position.y">
                </h4>
                <h4>宽度：
                    <input type="number"
                           v-model.number="selectedShape.info.width">
                </h4>
                <h4>高度：
                    <input type="number"
                           v-model.number="selectedShape.info.height">
                </h4>
                <h4>旋转角度：
                    <input type="number"
                           v-model.number="selectedShape.rotate">
                </h4>
            </div>
        </div>
        <div class="bottom con-warp"
             ref="content">
            <img class="svg"
                 ref="svg"
                 src="../assets/test2.svg" />
            <canvas id="ycanvas"
                    :style="{top:position.top+'px',left:position.left+'px',cursor:isSetting?'crosshair':'default'}">您的破浏览器不兼容</canvas>
            <canvas id="selectCanvas"
                    v-if="isSetting"
                    :style="{top:position.top+'px',left:position.left+'px',cursor:isSetting?'crosshair':'default'}">您的破浏览器不兼容</canvas>
        </div>
        <div class="pop"
             v-if="popShape">
            <div class="pop-con">
                <h3>
                    区域名称：
                    <input type="text"
                           v-model="popShape.name">
                </h3>
                <h3>
                    行数：
                    <input type="number"
                           v-model="popShape.rows">
                </h3>
                <h3>
                    列数：
                    <input type="number"
                           v-model="popShape.cols">
                </h3>
                <h5>
                    <button @click="popShape=null">取消</button>
                    <button @click="saveSeatsInfo">保存</button>
                </h5>
            </div>
        </div>
        <div class="pop"
             v-if="settingInfo.show">
            <div class="pop-con">
                <h3>
                    起始--行：
                    <input type="number"
                           v-model.number="settingInfo.startRow">
                </h3>
                <h3>
                    起始--列：
                    <input type="number"
                           v-model.number="settingInfo.startCol">
                </h3>
                <h5>
                    <button @click="settingInfo.show=false">取消</button>
                    <button @click="saveSeatsRankInfo">保存</button>
                </h5>
            </div>
        </div>
    </div>
</template>
<script>
// @ is an alias to /src
let _this = null, img = null, canvas = null, ctx = null, canvasDragging = false, shapeDragging = false, move_x = 0, move_y = 0, con_offsetLeft = 0, con_offsetTop = 0, selectedX = 0, selectedY = 0, icon = null, icon_blue = null, icon_org = null, s_canvas = null, s_ctx = null;
export default {
    name: "",
    components: {},
    data () {
        return {
            maxVal: 10000,
            maxWidth: 0,
            maxHeight: 0,
            setWidth: 0,
            setHeight: 0,
            minWidth: 0,
            minHeight: 0,
            wheelNum: 0,//当前缩放值
            wheelMin: 0,//最小缩放值
            wheelMax: 1,//最小缩放值
            position: { left: 0, top: 0 },
            shapes: [],
            selectedShape: null,
            popShape: null,
            onload: false,
            iconWidth: 32,
            isSetting: false,
            settingArea: { x: 0, y: 0, width: 0, height: 0 },
            settingList: [],
            settingListWithF: [],//带上shape坐标信息的列表
            settingInfo: {
                show: false,
                startCol: 1,
                startRow: 1
            }

        };
    },
    created () {
        _this = this;
    },
    mounted () {
        this.canvasInit();
        con_offsetLeft = this.$refs.content.offsetLeft;
        con_offsetTop = this.$refs.content.offsetTop;
        let sessionData = localStorage.getItem("shapes");
        if (sessionData) this.shapes = JSON.parse(sessionData);

        let timeOut = setTimeout(() => {
            _this.toMatch()
        }, 500);
    },
    watch: {
        shapes: {
            handler (newVal, oldVal) {
                this.drawShapes()
            },
            deep: true
        },
        position: {
            handler (newVal, oldVal) {
                img.style.left = newVal.left + 'px';
                img.style.top = newVal.top + 'px';
            },
            deep: true
        },
        wheelNum (val) {
            if (!this.onload) return false;
            if (val > 1) {
                _this.wheelNum = _this.wheelMax;
                // return false;
                console.log("已经最大了。。。。。")
            } else if (val < _this.wheelMin) {
                _this.wheelNum = _this.wheelMin;
                console.log("已经最小了。。。。。")
            }
            _this.setWidth = Math.ceil(val * _this.maxWidth);
            _this.setHeight = Math.ceil(val * _this.maxHeight);
            img.width = _this.setWidth;
            img.height = _this.setHeight;
            canvas.width = _this.setWidth;
            canvas.height = _this.setHeight;
            // tttt 6355 4701
            // console.log('tttt', _this.setWidth, _this.setHeight)
            this.$nextTick(() => {
                _this.drawShapes();
            })
        }
    },
    methods: {
        addShape () {
            /* 
            每个对象都必须有唯一的id 
            this.id = createRandomId();
            this.type = type;
            this.pos = pos;
            this.info = info;
            this.isSelected = false;
            this.wheelNum = 1; //滚轮数据
            this.scaleBase = scaleBase; //缩放基数，圆形：20，方形：100
            this.rotate = rotate;
            需要知道有多少行rows，多少列cols
            seats存放数据信息:
            座位信息：x,y 
            this.seats = [];
            */
            _this.shapes.push({
                id: _this.createRandomId(),
                position: {
                    x: 0, y: 0
                },
                info: {
                    width: _this.maxVal / 10,
                    height: _this.maxVal / 10
                },
                selected: false,
                rotate: 0,
                rows: 0,
                cols: 0,
                name: "",
                seats: []/* x,y,selected */
            })

            // console.log(_this.maxVal * _this.wheelNum / 10)
        },
        drawShapes () {
            // if (this.shapes.length == 0) return false;
            // console.log("drawShapes.......")
            // console.log(this.shapes)
            // 清除画布，准备绘制
            // console.time(2)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.shapes.forEach((shape, idx) => {
                // console.log(shape.seats)
                // console.log(shape)
                let x = shape.position.x * this.wheelNum,
                    y = shape.position.y * this.wheelNum,
                    width = shape.info.width * this.wheelNum,
                    height = shape.info.height * this.wheelNum;
                //rotate不为0，则需要旋转
                // if (shape.rotate != 0) {
                //save之后，可以调用Canvas的平移、放缩、旋转、错切、裁剪等操作。 restore：用来恢复Canvas之前保存的状态。防止save后对Canvas执行的操作对后续的绘制有影响。
                let rotate = shape.rotate;
                let t_x = x + width / 2, t_y = y + height / 2;
                ctx.save();
                ctx.translate(t_x, t_y);
                ctx.rotate(rotate * Math.PI / 180);
                ctx.translate(-t_x, -t_y);
                // }
                //画区域
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.strokeStyle = "green";
                if (_this.selectedShape && _this.selectedShape.id == shape.id) {
                    ctx.strokeStyle = "red"
                }
                ctx.stroke();
                //画座位
                if (this.wheelNum > 0.85) {
                    shape.seats.forEach(seat => {
                        ctx.beginPath();
                        if (seat.col != 0 && seat.row != 0) {
                            //设置了座位标记为黄色
                            ctx.drawImage(icon_org, (seat.x * this.wheelNum + x), (seat.y * this.wheelNum + y), 15, 15);
                        } else {
                            ctx.drawImage(icon, (seat.x * this.wheelNum + x), (seat.y * this.wheelNum + y), 15, 15);
                        }
                    })
                }
                // ctx.rotate(-rotate * Math.PI / 180);
                ctx.restore();
            })
            // console.timeEnd(2)
        },
        createRandomId () {
            return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
        },
        setDom () {
            img.width = _this.setWidth;
            img.height = _this.setHeight;
            //若设置为svg图原来的宽高，canvas不能渲染？？？
            canvas.width = _this.setWidth;
            canvas.height = _this.setHeight;
            _this.drawShapes();
        },
        canvasInit () {

            canvas = document.getElementById("ycanvas");
            ctx = canvas.getContext("2d");

            //鼠标事件绑定
            canvas.onmousedown = this.canvasClick;
            canvas.onmouseup = (e) => {
                if (canvasDragging && _this.isSetting) {
                    alert("选中啦。。。。。。")
                }
                canvasDragging = false, shapeDragging = false;
                move_x = 0, move_y = 0, selectedX = 0, selectedY = 0;
            };
            canvas.onmouseout = (e) => {
                canvasDragging = false, shapeDragging = false;
                move_x = 0, move_y = 0, selectedX = 0, selectedY = 0;
            };
            canvas.onmousewheel = (e) => {
                //Math.floor(15.7784514000 * 100) / 100
                let num = _this.floatTwo(_this.wheelNum + e.wheelDelta / 12000);
                if (num > _this.wheelMax && _this.wheelNum == _this.wheelMax) {
                    return false;
                }
                if (num < _this.wheelMin && _this.wheelNum == _this.wheelMin) {
                    return false;
                }
                _this.wheelNum = num;
                canvasDragging = false, shapeDragging = false;
                move_x = 0, move_y = 0, selectedX = 0, selectedY = 0;
                _this.selectedShape = null;
            };
            canvas.onmousemove = this.dragAction;

            //获取内容框的宽高
            let con_width = _this.$refs.content.offsetWidth;
            let con_height = _this.$refs.content.offsetHeight;
            //把svg显示到
            img = this.$refs.svg;

            //把svg绘制到canvas上
            img.onload = () => {
                let wid = img.width;
                let hei = img.height;
                //把最大宽度值调整到10000
                _this.maxWidth = _this.maxVal * _this.wheelMax;
                _this.maxHeight = (_this.maxVal * hei) / wid;
                _this.wheelMin = con_width / _this.maxWidth;
                //根据内容框缩放到合适的大小
                _this.onload = true;
                _this.wheelNum = _this.wheelMin;
            }
            //获取图标
            icon = this.$refs.iconDefault;
            icon_blue = this.$refs.iconBlue;
            icon_org = this.$refs.iconOrg;
        },
        floatTwo (num) {//保留两位小数
            return Math.floor(num * 100) / 100;
        },
        toMax () {
            _this.wheelNum = 1;
        },
        toMin () {
            _this.wheelNum = _this.wheelMin;
            _this.position.left = 0;
            _this.position.top = 0;
        },
        toMatch () {
            _this.wheelNum = 1;
            this.position.left = -7300;
            this.position.top = -800;
        },
        canvasClick (e) {
            // canvasDragging = false, shapeDragging = false;
            let clickX = e.clientX - (canvas.offsetLeft + con_offsetLeft);
            let clickY = e.clientY - (canvas.offsetTop + con_offsetTop);
            console.log("click x y", clickX, clickY);
            move_x = clickX;
            move_y = clickY;
            //设置座位信息，不能拖拽画布和图形
            if (this.isSetting) {
                canvasDragging = true;
                return false;
            }
            let onScope = false;
            _this.selectedShape = null;
            //若是点击在元素范围内，则执行选中操作，拖拽的元素
            _this.shapes.forEach((shape, idx) => {
                let x = shape.position.x * this.wheelNum,
                    y = shape.position.y * this.wheelNum,
                    width = shape.info.width * this.wheelNum,
                    height = shape.info.height * this.wheelNum;
                // console.log("shape", x, y, width, height)
                if (clickX > x && clickX < x + width && clickY > y && clickY < y + height) {
                    onScope = true;
                    _this.selectedShape = shape;
                    shape.selected = true;
                    selectedX = shape.position.x;
                    selectedY = shape.position.y;
                } else {
                    shape.selected = false;
                }
            });
            canvasDragging = !onScope;
            shapeDragging = onScope;
            // console.log("canvasDragging", canvasDragging, "shapeDragging", shapeDragging)
            if (onScope) {
                // ctx.beginPath();
                // ctx.rect(_this.selectedShape.position.x * this.wheelNum, _this.selectedShape.position.y * this.wheelNum, _this.selectedShape.info.width * this.wheelNum, _this.selectedShape.info.height * this.wheelNum);
                // // console.log('selected x y', selectedX, selectedY)
                // ctx.strokeStyle = "red"
                // ctx.stroke();
            } else if (_this.selectedShape) {
                // ctx.beginPath();
                // ctx.rect(_this.selectedShape.position.x * this.wheelNum, _this.selectedShape.position.y * this.wheelNum, _this.selectedShape.info.width * this.wheelNum, _this.selectedShape.info.height * this.wheelNum);
                // ctx.strokeStyle = "black"
                // ctx.stroke();
            }
        },
        dragAction (e) {
            // if (_this.wheelNum == _this.wheelMin) return false;
            // console.log(canvasDragging, shapeDragging);
            if (!this.isSetting) {//非设置座位状态
                if (canvasDragging == false && shapeDragging == false) return false;
                let nx = e.clientX;
                let ny = e.clientY;
                let nl = Math.ceil(nx - move_x);//偏移量
                let nt = Math.ceil(ny - move_y);//偏移量
                if (canvasDragging) {
                    _this.position.left = nl;
                    _this.position.top = nt;
                } else if (shapeDragging) {
                    _this.selectedShape.position.x = Math.ceil(selectedX + (nl - _this.position.left) / this.wheelNum);
                    _this.selectedShape.position.y = Math.ceil(selectedY + (nt - _this.position.top) / this.wheelNum);
                    _this.drawShapes();
                }
            } else {//设置座位状态
                if (canvasDragging == false) return false;
                let nx = e.clientX - (canvas.offsetLeft + con_offsetLeft);
                let ny = e.clientY - (canvas.offsetTop + con_offsetTop);
                // let nx = e.clientX;
                // let ny = e.clientY;
                let nl = nx - move_x;//偏移量
                let nt = ny - move_y;//偏移量
                // console.log(nx, ny)
                // console.log(move_x, move_y, "---", nl, nt)
                _this.drawShapes();
                ctx.beginPath();
                ctx.rect(move_x, move_y, nl, nt);
                ctx.strokeStyle = "blue";
                ctx.stroke();
            }


        },
        startSetSeats () {
            this.isSetting = !this.isSetting;
            if (!this.isSetting) {
                s_canvas = null;
                return false;
            }
            this.$nextTick(() => {
                s_canvas = document.getElementById("selectCanvas");
                s_ctx = s_canvas.getContext("2d");
                s_canvas.width = _this.setWidth;
                s_canvas.height = _this.setHeight;
                let clicked = false;
                let moveed = false;
                let x = 0, y = 0, width = 0, height = 0;
                s_canvas.onmousedown = (e) => {
                    x = e.clientX - (canvas.offsetLeft + con_offsetLeft);
                    y = e.clientY - (canvas.offsetTop + con_offsetTop);
                    clicked = true;
                };
                s_canvas.onmousemove = (e) => {
                    if (!clicked) return false;
                    let nx = e.clientX - (canvas.offsetLeft + con_offsetLeft);
                    let ny = e.clientY - (canvas.offsetTop + con_offsetTop);
                    // let nx = e.clientX;
                    // let ny = e.clientY;
                    width = nx - x;//偏移量
                    height = ny - y;//偏移量
                    if (width > 5 && height > 5) moveed = true;
                    // console.log(move_x, move_y, "---", nl, nt)
                    s_ctx.clearRect(0, 0, s_canvas.width, s_canvas.height);
                    s_ctx.beginPath();
                    s_ctx.rect(x, y, width, height);
                    s_ctx.strokeStyle = "blue";
                    s_ctx.stroke();
                };
                s_canvas.onmouseup = (e) => {
                    if (!moveed || !clicked) {
                        moveed = false, clicked = false;
                        return false;
                    }
                    moveed = false, clicked = false;
                    _this.settingArea = { x, y, width, height };
                    // _this.settingList = [];
                    _this.settingListWithF = [];
                    _this.shapes.forEach(shape => {
                        let tmplist = [];
                        shape.seats.forEach(seat => {
                            let s_x = shape.position.x + seat.x * this.wheelNum,
                                s_y = shape.position.y + seat.y * this.wheelNum;
                            if (s_x >= x && s_x <= (x + width) && s_y >= y && s_y <= (y + height)) {
                                // _this.settingList.push(seat);
                                tmplist.push(seat);
                                s_ctx.beginPath();
                                s_ctx.drawImage(icon_blue, s_x, s_y, 15, 15);
                            }
                        })
                        if (tmplist.length != 0) {
                            _this.settingListWithF.push({
                                id: shape.id,
                                name: shape.name,
                                position: shape.position,
                                seats: tmplist
                            })
                        }
                    });

                    console.log(JSON.parse(JSON.stringify(_this.settingListWithF)));
                    // console.log(JSON.parse(JSON.stringify(_this.settingList)));
                }

            })
        },
        setSeatsInfo () {
            if (_this.settingListWithF.length == 0) {
                alert("未选中任何座位");
                return false;
            }
            this.settingInfo.show = true;

        },
        saveSeatsRankInfo () {
            // console.log(this.settingInfo.startCol, this.settingInfo.startRow);
            if (_this.settingListWithF.length > 1) {
                alert("目前只能选中同一个区域类的座位");
                return false;
            }
            let list = JSON.parse(JSON.stringify(_this.settingListWithF));
            //因为现在只在一个shape内排序，故此不需要重新排序
            //排序，根据x,y
            // list.sort((a, b) => {
            //     if (a.position.x == b.position.x) {
            //         if (a.position.y > b.position.y) {
            //             return 1
            //         } else if (a.position.y < b.position.y) {
            //             return -1;
            //         } else {
            //             return 0;
            //         }
            //     } else {
            //         if (a.position.x > b.position.x) {
            //             return 1;
            //         } else {
            //             return -1;
            //         }
            //     }
            // });
            // console.log(list)
            // let seatList = [];
            let rows = [], cols = [];
            let shape = list[0];
            shape.seats.forEach((seat, idx) => {
                if (rows.indexOf(seat.x) == -1) {
                    rows.push(seat.x)
                }
                if (cols.indexOf(seat.y) == -1) {
                    cols.push(seat.y)
                }
                //因为座位就是按照好顺序排列的，所以可以直接找出所在位置
                let r = this.settingInfo.startRow + rows.indexOf(seat.x);
                let c = this.settingInfo.startRow + cols.indexOf(seat.y);
                seat.row = c;
                seat.col = r;
            })
            let inShapeSeat = [];//在shapes中的位置
            let inIdx = 0;
            //把数据赋值到shapes中去
            for (let i = 0; i < _this.shapes.length; i++) {
                let shape = _this.shapes[i];
                if (shape.id == shape.id) {
                    inShapeSeat = shape.seats;
                    inIdx = i;
                    break;
                }
            }
            for (let j = 0; j < shape.seats.length; j++) {
                let c_seat = shape.seats[j];
                for (let k = 0; k < inShapeSeat.length; k++) {
                    let in_seat = inShapeSeat[k];
                    if (c_seat.id == in_seat.id) {
                        inShapeSeat[k] = c_seat;
                        break;
                    }
                }
            }
            //vue更新数组以及试图
            let obj = this.shapes[inIdx];
            obj.seats = inShapeSeat;
            this.$set(this.shapes, inIdx, obj);
            let rotate = shape.rotate;
            s_ctx.save();
            s_ctx.translate(x + width / 2, y + height / 2);
            s_ctx.rotate(rotate * Math.PI / 180);
            s_ctx.translate(-(x + width / 2), -(y + height / 2));
            s_ctx.clearRect(0, 0, s_canvas.width, s_canvas.height);
            s_ctx.restore();
            this.settingInfo.show = false;
        },
        setSeats () {
            if (this.selectedShape == null) { alert("请先选择对象"); return false; }
            // console.log(this.selectedShape)
            this.popShape = JSON.parse(JSON.stringify(this.selectedShape));
        },
        saveSeatsInfo () {
            this.selectedShape.name = this.popShape.name;
            let rows = this.popShape.rows,
                cols = this.popShape.cols;
            let list = [],
                x = parseInt(this.popShape.position.x),
                y = parseInt(this.popShape.position.y);
            // console.log(x, y)
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    list.push({
                        x: i * 25,
                        y: j * 30,
                        show: false,
                        id: _this.createRandomId(),
                        col: 0,
                        row: 0
                    })
                }
            }
            this.selectedShape.rows = rows;
            this.selectedShape.cols = cols;
            this.selectedShape.seats = [];
            this.selectedShape.seats = list;
            // console.log(this.shapes)
            this.popShape = null;
        },
        saveData () {
            localStorage.setItem("shapes", JSON.stringify(this.shapes));
        },
        copyAction () {
            if (this.isSetting) { alert("请先取消设置座位详细信息，然后在操作"); return false; }
            if (this.selectedShape == null) { alert("请选择复制对象"); return false; }
            let obj = JSON.parse(JSON.stringify(this.selectedShape))
            //重新创建id
            obj.id = this.createRandomId();
            obj.position.x = obj.position.x + 30;
            obj.position.y = obj.position.y + 30;
            //重新创建seat的id
            let list = JSON.parse(JSON.stringify(obj.seats));
            list.forEach(ele => {
                ele.id = _this.createRandomId()
            })
            obj.seats = list;
            this.shapes.push(obj)
        },
        deleteAction () {
            if (this.selectedShape == null) { alert("请选择删除对象"); return false; }
            let selectedIdx = -1;
            this.shapes.forEach((ele, idx) => {
                if (ele.id == this.selectedShape.id) {
                    selectedIdx = idx;
                }
            });
            this.shapes.splice(selectedIdx, 1);
            this.selectedShape == null;
        },
        countSeats () {
            //计算座位个数
            console.time(1)
            let num = 0;
            // let list = [];
            this.shapes.forEach(shape => {
                // list.push(...shape.seats)
                // shape.seats.forEach(ele => {
                //     num += 1;
                // })
                num += shape.seats.length;
            })
            console.timeEnd(1)
            alert(num)
        }
    }
};
</script>
<style lang="scss" scoped>
div {
    box-sizing: border-box;
}
button {
    padding: 5px 10px;
}
.contanier {
    .top {
        height: 50px;
        overflow: hidden;
        box-sizing: border-box;
        // > div.btns {
        //     float: left;
        // }
        // > div.selectedShape {
        //     float: left;
        // }
        h4 {
            display: inline-block;
            padding-left: 10px;
        }
        input {
            width: 50px;
        }
    }
    .bottom {
        height: calc(100vh - 50px);
        border-top: 1px solid #ccc;
        box-sizing: border-box;
    }
}
.con-warp {
    position: relative;
    width: 100%;
    height: 100%;
    border-top: 1px solid red;
    border-bottom: 1px solid red;
    overflow: auto;
    overflow: hidden;
}
.svg {
    position: absolute;
    top: 0;
    left: 0;
}
canvas {
    border: 1px solid #ccc;
    position: absolute;
    top: 50%;
    left: 50%;
}
.pop {
    width: 100%;
    height: 100%;
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(
        $color: (
            #000000
        ),
        $alpha: 0.3
    );
    .pop-con {
        text-align: left;
        position: relative;
        top: 20%;
        left: 50%;
        width: 500px;
        min-height: 300px;
        margin-left: -250px;
        background-color: #fff;
        padding: 10px;
        h3 {
            margin: 10px;
            font-size: 14px;
        }
        h5 {
            text-align: center;
            button {
                margin: 0 10px;
            }
        }
    }
}
</style>