<template lang="pug">
div.warp
	button.toggle(@click="toggleAction") toggle
	button.toggle.two(@click="clearAction") clearAction
	seat-map(v-if="showInMap")
	seat-seat(v-if="!showInMap")
</template>
<script>
// @ is an alias to /src
import SeatMap from "@/components/seat_map"
import SeatSeat from "@/components/seat_seat"
export default {
    name: "",
    components: {
        SeatMap,
        SeatSeat
    },
    data() {
        return {
            showInMap: false
        };
    },
    created() {
        if (localStorage.getItem("showInMap")) {
            this.showInMap = localStorage.getItem("showInMap") == "false" ? false : true;
        } else {
            localStorage.setItem("showInMap", this.showInMap)
        }
    },
    methods: {
        toggleAction() {
            this.showInMap = !this.showInMap
            localStorage.setItem("showInMap", this.showInMap)
        },
        clearAction() {
            localStorage.removeItem("shapeList")
        }
    }
};
</script>
<style lang="scss" scoped>
.warp {
    width: 100%;
    height: 100vh;
}
.toggle {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2;
    padding: 10px;
    border: 1px solid;
    &.two {
        left: 100px;
    }
}
</style>
