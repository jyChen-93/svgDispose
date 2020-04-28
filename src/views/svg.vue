<template lang="pug">
div.warp
	button.toggle(@click="showInMap=!showInMap") toggle
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
    created() {},
    methods: {}
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
}
</style>
