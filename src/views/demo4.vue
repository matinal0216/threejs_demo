<template>
  <div id="model" ref="model"></div>
</template>
<script setup>
import { onMounted } from "vue";
import renderModel from "./renderModel";
onMounted(async () => {
  const modelApi = new renderModel("#model");
  const load = await modelApi.init();
  // load =true 表示加载完成
});
</script>
