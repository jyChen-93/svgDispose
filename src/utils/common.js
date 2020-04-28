let COMMON = {
    diffObject(obj1, obj2) { //判断两个对象是否相等
        var o1 = obj1 instanceof Object;
        var o2 = obj2 instanceof Object;
        // 判断是不是对象
        if (!o1 || !o2) {
            return obj1 === obj2;
        }

        //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,
        //例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
        }

        for (var o in obj1) {
            var t1 = obj1[o] instanceof Object;
            var t2 = obj2[o] instanceof Object;
            if (t1 && t2) {
                return COMMON.diffObject(obj1[o], obj2[o]);
            } else if (obj1[o] !== obj2[o]) {
                return false;
            }
        }
        return true;
    }
}

export default COMMON;