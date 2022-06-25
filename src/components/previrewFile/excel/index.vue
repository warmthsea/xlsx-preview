<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { usePrevirewExcel, sheetTabScorllAbout } from "./index";
import { InfoFilled, MoreFilled, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";

const props = defineProps({
  link: String,
});
const emit = defineEmits(["handleTap"]);

/** 基础数据获取及切换sheet */
const { table_state, table_event_state, getExcelData, sheetExcelTab } = usePrevirewExcel();

/** 优化sheet操作及滚动 */
const { excel_body_ref, sheets_ref, sheets_scroll, sheetScrollEvent, sheetToggleScroll, setItemRef, addSlotHtml } = sheetTabScorllAbout();

/** 切换 */
const clickChangeTab = async (index: number) => {
  //储存即将离开 sheet scrollTop
  table_state.sheet_scroll[table_event_state.table_tac] = (excel_body_ref.value as HTMLElement).scrollTop;

  table_event_state.table_tac = index;
  table_event_state.is_loading = true;
  table_state.table_item = null;

  emit("handleTap", table_state.table_sheet[index]);
  setTimeout(async () => {
    await sheetExcelTab(index);
    await addSlotHtml();
    //回到sheet原来滚动的位置
    (excel_body_ref.value as HTMLElement).scrollTop = table_state.sheet_scroll[index] || 0;
    table_event_state.is_loading = false;
  }, 20);
};

/** init data */
const init = async (): Promise<void> => {
  await getExcelData(props.link);
  // 初始化scroll 存储
  table_state.sheet_scroll = table_state.table_sheet.map((itm: string): number => 0);
  await sheetExcelTab();
  await addSlotHtml();
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  // 清空数据
  table_state.info_data = {};
  table_state.table_item = null;
  table_state.table_sheet = [];
  table_state.sheet_scroll = [];
});
</script>

<template>
  <div v-loading="table_event_state.is_loading" class="previrew_info_excel">
    <div ref="excel_body_ref" id="excel_window_id" class="previrew_excel">
      <div class="id_not_show" v-show="table_event_state.is_data">暂无数据</div>
      <div v-html="table_state.table_item" id="excel_body_id"></div>
    </div>
    <div class="previrew_excel_sheet">
      <div class="sheet_info_icon">
        <el-tooltip content="切换工作表" placement="top" effect="light">
          <el-icon style="color: rgba(107, 107, 108, 1); margin: 0 8px">
            <info-filled />
          </el-icon>
        </el-tooltip>
        <div @dblclick="() => {}" :class="{ is_not_scroll: sheets_scroll.left_width == 0 }" @click="sheetScrollEvent('left')">
          <el-tooltip content="前一页" placement="top" effect="light">
            <el-icon>
              <arrow-left />
            </el-icon>
          </el-tooltip>
        </div>
        <div
          :class="{
            is_not_scroll: sheets_scroll.all_width == sheets_scroll.show_width + sheets_scroll.left_width,
          }"
          @click="sheetScrollEvent('right')"
        >
          <el-tooltip content="后一页" placement="top" effect="light">
            <el-icon>
              <arrow-right />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
      <!-- 修复双击选中bug -->
      <i></i>
      <div ref="sheets_ref" class="sheet_info_tab">
        <div :ref="setItemRef" @click="clickChangeTab(index)" :title="`${item}工作表`" :class="{ sheet_item_tac: table_event_state.table_tac == index }" class="sheet_item" v-for="(item, index) in table_state.table_sheet" :key="index">
          {{ item }}
        </div>
      </div>
      <div class="sheet_event_icon">
        <el-popover popper-class="sheet_info_all_list" placement="top-end" :width="250" trigger="click">
          <template #reference>
            <div class="sheet_info_is_green sheet_info_is_all">
              <el-icon>
                <more-filled />
              </el-icon>
            </div>
          </template>
          <div class="sheet_info_all_list_info">
            <div
              class="sheet_info_all_list_item"
              :class="{ sheet_item_tac: table_event_state.table_tac == index }"
              v-for="(item, index) in table_state.table_sheet"
              :key="index + 'c'"
              :title="item"
              @click="
                () => {
                  sheetToggleScroll(index), clickChangeTab(index);
                }
              "
            >
              {{ item }}
            </div>
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "./scss/report_previrew.scss";
@import "./scss/previrew_excel_scoped.scss";
</style>
<style lang="scss">
@import "./scss/previrew_excel.scss";
// popper
.sheet_info_all_list {
  padding: 0px 0px !important;
  width: 440px !important;
}
</style>
