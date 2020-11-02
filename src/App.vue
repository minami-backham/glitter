<template>
  <div id="app">
    <Glitter />
  </div>
</template>

<script>
import Glitter from "./components/Glitter.vue";
import "ress";

export default {
  name: "App",
  components: {
    Glitter
  }
};
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
}
</style>
