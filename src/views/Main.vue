<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import PrevirewExcel from "../components/previrewFile/excel/index.vue";

const link = ref<string>("");

/** get sheet name */
const handleTap = (e: string) => {
  console.log("sheet-name：", e);
};

const goGitHub = (): void => {
  window.open("https://github.com/warmthsea/xlsx-preview", "_blank");
};

onBeforeMount(() => {
  link.value = "./test.xlsx";
});
</script>

<template>
  <div class="main_body">
    <div class="title">
      <h1>preview xlsx</h1>
      <h3>
        <img @click="goGitHub()" src="@/assets/github.svg" alt="github" />
        简单预览xlsx文件
      </h3>
    </div>
    <div class="xlsx_body">
      <PrevirewExcel :link="link" @handleTap="handleTap"></PrevirewExcel>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main_body {
  height: 100vh;
  padding: 0 5%;
  min-width: 1024px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    height: 60vh;

    h1 {
      font-size: 50px;
    }
    h3 {
      font-size: 24px;
      opacity: 0.8;

      display: flex;
      align-items: center;

      img {
        margin-right: 10px;
        width: 50px;
        opacity: 0.7;
        transition: all 0.2s;

        &:hover {
          opacity: 1;
          cursor: pointer;
          transition: all 0.2s;
        }
      }
    }
  }

  .xlsx_body {
    height: 80vh;
    width: 75%;
  }
}
</style>
