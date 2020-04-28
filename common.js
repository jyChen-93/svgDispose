//生成不重复的id，发放还需优化
function createRandomId() {
    return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
}
//在某个范围内生成随机数
function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
//计算两点距离
function getDistence(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
};
//判断是否在多边形的范围里面，利用的角度及算法
// function checkPointInPolyline(point, polylinePoints) {
//    //参考来源：http://www.fly63.com/article/detial/5829
//     /* 计算过程可以转变为以下三个步骤：
//     1. 已知多边形顶点和已知坐标，将坐标与顶点两两组合成三点队列
//     2. 已知三点求夹角，可以使用余玄定理
//     3. 判断夹角之和是否360° */
//     let totalA = 0;
//     const A = point;
//     for (let i = 0; i < polylinePoints.length; i++) {
//         let B, C;
//         if (i === polylinePoints.length - 1) {
//             B = {
//                 x: polylinePoints[i][0],
//                 y: polylinePoints[i][1]
//             };
//             C = {
//                 x: polylinePoints[0][0],
//                 y: polylinePoints[0][1]
//             };
//         } else {
//             B = {
//                 x: polylinePoints[i][0],
//                 y: polylinePoints[i][1]
//             };
//             C = {
//                 x: polylinePoints[i + 1][0],
//                 y: polylinePoints[i + 1][1]
//             };
//         }
//         //计算角度
//         const angleA = Math.acos((Math.pow(getDistence(A, C), 2) + Math.pow(getDistence(A, B), 2) - Math.pow(
//             getDistence(B, C), 2)) / (2 * getDistence(A, C) * getDistence(A, B)))
//         totalA += angleA
//     }
//     //判断角度之和
//     return totalA === 2 * Math.PI;
// }

function checkPointInPolyline(point, polylinePoints) {
    //射线法  参考来源：http://www.fly63.com/article/detial/5829
    let leftSide = 0;
    const A = point;
    for (let i = 0; i < polylinePoints.length; i++) {
        let B, C;
        if (i === polylinePoints.length - 1) {
            B = {
                x: polylinePoints[i][0],
                y: polylinePoints[i][1]
            };
            C = {
                x: polylinePoints[0][0],
                y: polylinePoints[0][1]
            };
        } else {
            B = {
                x: polylinePoints[i][0],
                y: polylinePoints[i][1]
            };
            C = {
                x: polylinePoints[i + 1][0],
                y: polylinePoints[i + 1][1]
            };
        }
        //判断左侧相交
        let sortByY = [B.y, C.y].sort((a, b) => a - b)
        if (sortByY[0] < A.y && sortByY[1] > A.y) {
            if (B.x < A.x || C.x < A.x) {
                leftSide++
            }
        }
    }
    return leftSide % 2 === 1
}