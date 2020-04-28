<template>
<input class="my-number-input" type="number" :placeholder="placeholder" v-model.number="inputModel">
</template>
<script type="text/ecmascript-6">
export default {
    components: {},
    props: {
        point: {
            default: 0
        },
        max: Number,
        placeholder: String,
        value: {
            default: null
        },
    },
    computed: {
        inputModel: {
            get: function() {
                // 父组件==>子组件 发消息
                return this.value;
            },
            set: function(value) {

                // 子组件==>父组件 发消息
                let val = this.$el.value;
                let len = val.length;
                // console.log(val);

                // 解决首位直接输入 '0开头的数字'问题
                if (len == 2 && val.charAt(0) == 0 && val.charAt(1) != '.') {
                    this.$el.value = val.charAt(1);
                    this.setParentModeVal(this.$el.value);
                    return;
                }

                // 解决数字键盘可以输入输入多个小数点问题
                if (Math.abs(this.value) > 0 && val === '' && value === '') {
                    if (this.keyDownDel) {
                        this.$el.value = ''; // 正常删除
                        console.log('---正常删除---' + this.value);
                    } else {
                        this.$el.value = this.value; // 多次输入小数点时
                        console.log('---多次输入小数点---' + this.value);
                    }
                    this.setParentModeVal(this.$el.value);
                    return;
                }

                // 解决开始就输入点问题
                if (this.value === '' && val === '' && value === '') {
                    console.log('---22aa---' + this.value);
                    this.$el.value = '';
                    this.setParentModeVal('');
                    return;
                }

                // 解决保留两位小数问题
                if (val) {
                    let pointIndex = val.indexOf('.');
                    if (this.point == 0 && len == 2 && val.charAt(pointIndex) == '.') {
                        console.log('只能输入整数');
                        this.$el.value = val.substr(0, pointIndex);
                        this.setParentModeVal(this.$el.value);
                        return;
                    }
                    if (pointIndex > 0 && (len - pointIndex) > (this.point + 1)) {
                        console.log('只能输入' + this.point + '位小数');
                        this.$el.value = val.substr(0, pointIndex + this.point + 1);
                        this.setParentModeVal(this.$el.value);
                        return;
                    }
                }

                // 解决输入最大值问题
                if (this.max > 0 && val > this.max) {
                    // console.log('---4---')
                    this.$el.value = val.substr(0, len - 1);
                    this.setParentModeVal(this.$el.value);
                    return;
                }

                this.setParentModeVal(val);
                return;
            }
        }
    },
    data() {
        return {
            keyDownDel: false, // 判断键盘输入值
        }
    },
    mounted() {
        // 判断键盘是否是删除动作
        var that = this;
        window.document.onkeydown = function(event) {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            if (e.keyCode == 8 || e.keyCode == 46) {
                that.keyDownDel = true;
            } else {
                that.keyDownDel = false;
            }

        };
    },
    methods: {
        setParentModeVal(value) {
            // this.value = value;
            this.$emit('input', value);
        }
    },
}
</script>
