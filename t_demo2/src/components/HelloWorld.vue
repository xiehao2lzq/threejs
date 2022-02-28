<template>
  <div id="three">
    <div class="left">
      <div id="chart1"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  data() {
    return {};
  },
  methods: {
    
  }
};
</script>

<style  scoped>
.left {
  width: 300px;
  height: 800px;
  position: absolute;
  left: -300px;
  top: 50px;
  z-index: 1000;
  padding: 15px 30px;
  box-shadow: 0px 0px 12px #00ffff80;
  background-color: rgba(0, 127, 127, 0.5);
  box-sizing: border-box;
  padding: 30px 20px;
  transition-duration: 2.5s;
}
#chart1 {
  width: 100%;
  height: 300px;
}
</style>