let TOOLS = {
    center(center) {
        return center;
    },
    pathDecompose(center, d) { //路径d属性分解
        this.center = center;
        /* 整理出所有的点 start */
        let typeStr = "MLHVCSQTAZ";
        let typeList = (typeStr + typeStr.toLowerCase()).split(""); //共18种
        //路径第一个就是M
        let idxList = []; //索引列表
        typeList.forEach(type => {
            let index = d.indexOf(type);
            if (index != -1) {
                let tmp = d.split(type)
                //找出每个字母所在索引
                let len = 0;
                tmp.forEach((tmpItem, idx) => {
                    if (idx != 0) {
                        len += tmp[idx - 1].length;
                        idxList.push(len + idx - 1)
                    }
                })
            }
        })
        //排序
        idxList.sort((x, y) => {
            if (x < y) {
                return -1;
            } else if (x > y) {
                return 1;
            } else {
                return 0;
            }
        });
        let sliceList = [];
        for (let i = 1; i < idxList.length; i++) {
            let str = d.slice(idxList[i - 1] + 1, idxList[i]);
            //因为再svg中复数前边省略的逗号，添加上，但是如果是第一个就不需要
            str = str.replace(/-/g, ",-");
            if (str.indexOf(",") == 0) str = str.slice(1);
            //处理连续点,除了第一个点，后面所有的点前面都需要加上逗号
            let strArr = str.split(",");
            strArr.forEach((item, idx) => {
                let len = item.split(".").length;
                if (len > 2) {
                    let newStr = item.replace(/\./g, ",.").replace(",.", ".");
                    strArr.splice(idx, 1, newStr);
                }
            })
            str = strArr.join(",")
            sliceList.push(str)
        }
        let pointList = [];
        idxList.forEach((num, index) => {
            let letter = d[num];
            if (letter == "z" || letter == "Z") return false;
            let datas = sliceList[index].indexOf(",") == -1 ? [sliceList[index]] : sliceList[index].split(',');
            //现在的数据是字符串，先转成数字
            for (let i = 0; i < datas.length; i++) {
                datas[i] = parseFloat(datas[i])
            }
            // console.log(datas)
            if (index == 0) {
                pointList.push([datas[datas.length - 2], datas[datas.length - 1]]);
                return false;
            }
            //计算每个点的绝对坐标  MLHVCSQTAZ
            let isMin = false;
            if (/^[a-z]+$/.test(letter)) {
                isMin = true;
            }
            // console.log("isMin=", isMin)
            switch (letter) {
                case "M":
                case "m":
                    pointList.push([...datas]);
                    break;
                case "H":
                case "h": //x 沿着x轴移动一段位置
                    if (isMin) {
                        pointList.push([pointList[pointList.length - 1][0] + datas[0], pointList[pointList.length - 1][1]]);
                    } else {
                        pointList.push([datas[0], pointList[pointList.length - 1][1]]);
                    }
                    break;
                case "V":
                case "v": //y 沿着y轴移动一段位置
                    if (isMin) {
                        pointList.push([pointList[pointList.length - 1][0], pointList[pointList.length - 1][1] + datas[0]]);
                    } else {
                        pointList.push([pointList[pointList.length - 1][0], datas[0]]);
                    }
                    break;
                case "L":
                case "l":
                    if (isMin) { //相对单位，取和值，再加前一个点的坐标
                        let x = pointList[pointList.length - 1][0];
                        let y = pointList[pointList.length - 1][1];
                        for (let i = 0; i < datas.length; i += 2) {
                            x += datas[i];
                            y += datas[i + 1];
                        }
                        pointList.push([x, y]);
                    } else { //绝对单位，直接取最后两个数据
                        pointList.push([datas[datas.length - 2], datas[datas.length - 1]]);
                    }
                    break;
                case "C":
                case "c": //三次元贝塞尔曲线，一组数据是6个参数
                    dCurvePoints(6);
                    break;
                case "S":
                case "s":
                case "Q":
                case "q": //曲线，一组数据是4个参数
                    dCurvePoints(4);
                    break;
                case "T":
                case "t": //曲线，一组数据是2个参数
                    dCurvePoints(2);
                    break;
                case "A":
                case "a": //rx,ry x-axis-rotation large-arc-flag sweep-flag x,y  一组7个参数
                    dCurvePoints(7);
                    break;
            }

            function dCurvePoints(step) {
                if (datas.length < step) return false;
                //path d 曲线的终点计算 ，step：参数个数
                for (let i = 0; i < datas.length; i += step) {
                    let x = 0,
                        y = 0;
                    if (isMin) {
                        //相对单位，取和值，再加前一个点的坐标
                        x = pointList[pointList.length - 1][0];
                        y = pointList[pointList.length - 1][1];
                    }
                    x += datas[i + step - 2];
                    y += datas[i + step - 1];
                    pointList.push([x, y]);
                }
            }

        })
        /* 整理出所有的点 end */
        //计算最终四个点的坐标以及切斜角度
        let result = TOOLS.shapeFinalResult(pointList);
        // console.log("path", result.pointList)
        // console.log("angle", result.angle)
        return result;

    },
    polygonDecompose(center, points) { //多边形points属性分解
        this.center = center;
        /* 整理出所有的点 start */
        let pointList = [];
        let orgList = points.split(" ");
        for (let i = 0; i < orgList.length; i += 2) {
            pointList.push([parseFloat(orgList[i]), parseFloat(orgList[i + 1])])
        }
        /* 整理出所有的点 end */
        //计算最终四个点的坐标以及切斜角度
        let result = TOOLS.shapeFinalResult(pointList)
        // console.log("polygon", result.pointList)
        // console.log("angle", result.angle)
        return result;
    },
    rectDecompose(x, y, width, height) {
        this.center = center;
        x = parseFloat(x);
        y = parseFloat(y);
        width = parseFloat(width);
        height = parseFloat(height);
        /* 整理出所有的点 start */
        let pointList = [
            [x, y],
            [x + width, y],
            [x + width, y + height],
            [x, y + height]
        ]
        /* 整理出所有的点 end */
        //计算最终四个点的坐标以及切斜角度
        let result = TOOLS.shapeFinalResult(pointList)
        // console.log("rect", result.pointList)
        // console.log("angle", result.angle)
        return result;
    },
    shapeFinalResult(pointList) { //把超出四个点的，去掉多余的点
        while (pointList.length > 4) {
            let angleList = [];
            for (let i = 0; i < pointList.length; i++) {
                let cen = pointList[i];
                let first = [],
                    second = [];
                if (i == 0) {
                    first = pointList[pointList.length - 1];
                } else {
                    first = pointList[i - 1];
                }
                if (i == pointList.length - 1) {
                    second = pointList[0];
                } else {
                    second = pointList[i + 1];
                }
                let angel;
                if (TOOLS.calcOnline(cen, first, second)) {
                    angel = 180;
                } else {
                    angel = TOOLS.calcAngel(cen, first, second);
                }
                angleList.push(angel);
            }
            //每次删除最大的角度对应的点
            let max = Math.max(...angleList);
            let maxIdx = angleList.indexOf(max);
            pointList.splice(maxIdx, 1);
        }
        //返回最终结果
        let angle = parseInt(TOOLS.calcSlope(pointList)); //计算倾斜角度
        let cenPoint = TOOLS.calcCenterPoint(pointList); //中心点计算
        // console.log("tools angle", angle)
        let list = JSON.parse(JSON.stringify(pointList))
        list.forEach(pnt => {
            pnt[0] = parseInt(pnt[0])
            pnt[1] = parseInt(pnt[1])
        })
        return {
            pointList: list,
            angle,
            cenPoint: [parseInt(cenPoint[0]), parseInt(cenPoint[1])]
        };
    },
    calcCenterPoint(points) { //四边形中心点计算
        // console.log(points);
        var pD_x = points[3][0];
        var pD_y = points[3][1];
        var pA_x = points[0][0];
        var pA_y = points[0][1];

        var pC_x = points[2][0];
        var pC_y = points[2][1];
        var pB_x = points[1][0];
        var pB_y = points[1][1];

        var k_y = (pB_x * pC_y * pD_y - pD_x * pB_y * pC_y - pA_y * pB_x * pD_y + pD_x * pB_y * pA_y + pC_x * pA_y * pD_y - pA_x * pC_y * pD_y - pC_x * pB_y * pA_y + pA_x * pB_y * pC_y) /
            (pD_y * pC_x - pA_x * pD_y - pB_y * pC_x + pA_x * pB_y + pB_x * pC_y - pD_x * pC_y - pA_y * pB_x + pA_y * pD_x);

        var k_x = (pD_y * (pC_x - pA_x) * (pB_x - pD_x) - pA_y * (pC_x - pA_x) * (pB_x - pD_x) + pA_x * (pC_y - pA_y) * (pB_x - pD_x) + pD_x * (pD_y - pB_y) * (pC_x - pA_x)) /
            ((pC_y - pA_y) * (pB_x - pD_x) + (pD_y - pB_y) * (pC_x - pA_x));

        //回显中心点
        document.getElementById("208").setAttribute("cx", k_x);
        document.getElementById("208").setAttribute("cy", k_y);

        return [k_x, k_y];
    },
    calcOnline(cen, first, second) { //判断三点是否在一条直线上
        let s1 = Math.sqrt((cen[0] - first[0]) * (cen[0] - first[0]) + (cen[1] - first[1]) * (cen[1] - first[1]));
        let s2 = Math.sqrt((second[0] - first[0]) * (second[0] - first[0]) + (second[1] - first[1]) * (second[1] - first[1]));
        let s3 = Math.sqrt((cen[0] - second[0]) * (cen[0] - second[0]) + (cen[1] - second[1]) * (cen[1] - second[1]));
        let p = (s1 + s2 + s3) / 2;
        let s = Math.sqrt(p * (p - s1) * (p - s2) * (p - s3));
        return s < 5;
    },
    calcAngel(cen, first, second) { //角度计算
        if (Math.abs(cen[0] - first[0]) < 0.1 && Math.abs(cen[0] - second[0]) < 0.1) {
            return 180;
        }
        if (Math.abs(cen[1] - first[1]) < 0.1 && Math.abs(cen[1] - second[1]) < 0.1) {
            return 180;
        }
        let X1 = first[0],
            Y1 = first[1]; //A
        let X2 = cen[0],
            Y2 = cen[1]; //B
        let X3 = second[0],
            Y3 = second[1]; //C
        let c = Math.abs(Math.pow((Math.pow((X1 - X2), 2) + Math.pow((Y1 - Y2), 2)), 0.5)); //c
        let a = Math.abs(Math.pow((Math.pow((X3 - X2), 2) + Math.pow((Y3 - Y2), 2)), 0.5)); //a
        let b = Math.abs(Math.pow((Math.pow((X1 - X3), 2) + Math.pow((Y1 - Y3), 2)), 0.5)); //b
        let cosA = (Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(b, 2)) / (2 * a * c);
        return Math.acos(cosA) * (180 / Math.PI);
    },
    calcSlope(list) { //切斜角度
        let pointAB = {},
            pointAD = {},
            pointBC = {},
            pointCD = {};

        pointAB.x = (list[0][0] + list[1][0]) / 2;
        pointAB.y = (list[0][1] + list[1][1]) / 2;
        pointCD.x = (list[2][0] + list[3][0]) / 2;
        pointCD.y = (list[2][1] + list[3][1]) / 2;

        pointAD.x = (list[0][0] + list[3][0]) / 2;
        pointAD.y = (list[0][1] + list[3][1]) / 2;
        pointBC.x = (list[1][0] + list[2][0]) / 2;
        pointBC.y = (list[1][1] + list[2][1]) / 2;

        let dis1 = TOOLS.pointsToLineDistance(pointAB, pointCD);
        // console.log(pointAB);
        // console.log(pointCD);
        // document.getElementById("180").setAttribute("d", "M" + pointAB.x + "," + pointAB.y + "L" + pointCD.x + "," + pointCD.y);
        // console.log(dis1);
        let dis2 = TOOLS.pointsToLineDistance(pointAD, pointBC);
        // console.log(pointAD);
        // console.log(pointBC);
        // document.getElementById("181").setAttribute("d", "M" + pointAD.x + "," + pointAD.y + "L" + pointBC.x + "," + pointBC.y);
        // console.log(dis2);
        // document.getElementById("182").setAttribute("d", "M" + (this.center[0]-10) + "," + (this.center[1]-10) + "h20v20h-20z" );
        let angle = 0;
        let center = TOOLS.calcCenterPoint(list);
        if (dis1 > dis2) {
            let radian = Math.atan2((pointAB.y - pointCD.y), (pointCD.x - pointAB.x));
            // console.log('弧度:' + radian);
            angle = -radian * (180 / Math.PI);
            // console.log('角度:' + angle);
        } else {
            let radian = Math.atan2((pointAD.y - pointBC.y), (pointBC.x - pointAD.x));
            // console.log('弧度:' + radian);
            angle = -radian * (180 / Math.PI);
            // console.log('角度:' + angle);
        }
        while (angle > 360) {
            angle -= 360;
        }
        while (angle < 0) {
            angle += 360;
        }
        if (Math.abs(center[1] - this.center[1]) < this.center[1] * 0.02) {
            // console.log('水平轴')
            if (center[0] < this.center[0]) {
                angle = 90;
            } else {
                angle = 270;
            }
        } else if (center[1] < this.center[1]) {
            // console.log('上半区')
            if (angle > 270 || angle < 90) {
                angle += 180;
            }
        } else {
            // console.log('下半区')
            if (angle > 90 && angle < 270) {
                angle += 180;
            }
        }
        return angle;
    },
    pointsToLineDistance(pointA, pointB) { //点到直线的距离
        let s1 = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
        let s2 = Math.sqrt((this.center[0] - pointB.x) * (this.center[0] - pointB.x) + (this.center[1] - pointB.y) * (this.center[1] - pointB.y));
        let s3 = Math.sqrt((pointA.x - this.center[0]) * (pointA.x - this.center[0]) + (pointA.y - this.center[1]) * (pointA.y - this.center[1]));
        let p = (s1 + s2 + s3) / 2;
        let s = Math.sqrt(p * (p - s1) * (p - s2) * (p - s3));
        return 2 * s / s1;
    },
    getDisance1(pointA, pointB) { //两点之间的距离
        return Math.sqrt((pointA[0] - pointB[0]) * (pointA[0] - pointB[0]) + (pointA[1] - pointB[1]) * (pointA[1] - pointB[1]));
    },
    rotatePoint(center, A, angle) { //旋转之后的点
        let x = (A[0] - center[0]) * Math.cos(angle * Math.PI / 180) + (A[1] - center[1]) * Math.sin(angle * Math.PI / 180);
        let y = -(A[0] - center[0]) * Math.sin(angle * Math.PI / 180) + (A[1] - center[1]) * Math.cos(angle * Math.PI / 180);
        return [center[0] + x, center[1] + y];
    },

}
export default TOOLS;