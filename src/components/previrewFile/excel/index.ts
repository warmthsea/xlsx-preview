import axios from "axios";
import type { AxiosInstance } from "axios";
import * as XLSX from "xlsx";
import type { WorkBook, WorkSheet } from "xlsx";
import { nextTick, onBeforeUpdate, onMounted, reactive, ref } from "vue";

/**
 * @掘金文章 https://juejin.cn/post/7123459055049408542
 * @docs SheetJs中文文档 https://github.com/rockboom/SheetJS-docs-zh-CN
 */
interface ExcelType {
    /** 表格加载的总数据 */
    info_data: { [sheet: string]: WorkSheet };
    /** 选中的数据 */
    table_item: any;
    /** sheet 列表 */
    table_sheet: Array<string>;
    /** sheet 滚动存储 */
    sheet_scroll: Array<number>;
}

interface ExcelStyleType {
    /** 选择的sheet */
    table_tac: number;
    /** 是否加载动画 */
    is_loading: boolean;
    /** 是否有数据 */
    is_data: boolean;
}

/** 获取数据、基本切换 */
export const usePrevirewExcel = () => {
    /** Excel基础数据 */
    const table_state = reactive<ExcelType>({
        info_data: {},
        table_item: null,
        table_sheet: [],
        sheet_scroll: [],
    });
    /** Excel相关数据 */
    const table_event_state = reactive<ExcelStyleType>({
        table_tac: 0,
        is_loading: false,
        is_data: false,
    });

    /** 初始化数据 */
    const getExcelData = async (link: string = "./test.xlsx"): Promise<boolean> => {
        let axi: AxiosInstance = axios.create();
        return new Promise(function (resolve, reject) {
            axi({
                method: "get",
                responseType: "arraybuffer",
                url: link,
            }).then(async ({ data }) => {
                let workbook: WorkBook = XLSX.read(new Uint8Array(data as ArrayBuffer), {
                    type: "array",
                    cellStyles: true,
                });
                table_state.table_sheet = workbook.SheetNames;
                table_state.info_data = workbook.Sheets;
                resolve(true);
            });
        });
    };

    /** sheet tab */
    const sheetExcelTab = async (index: number = 0): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            table_event_state.is_data = false;
            //这里取出第一个工作表,Excek文件是必须存在一个sheet页
            let worksheet: WorkSheet = JSON.parse(JSON.stringify(table_state.info_data[table_state.table_sheet[index]]));
            if (worksheet.A1) {
                // 渲染某一个sheet数据
                // XLSX.utils API 请参考 SheetJs .d.ts文件或者 文档（sheet_to_csv | ）
                table_state.table_item = sheetTableDataFormat(XLSX.utils.sheet_to_csv(worksheet as WorkSheet));
            } else {
                console.warn("暂无数据");
                table_event_state.is_data = true;
            }
            resolve(true);
        });
    };

    /** format table data */
    const sheetTableDataFormat = (csv: string): string => {
        let html: string = "<table>";
        let rows: string[] = csv.split("\n");
        console.log(rows);
        rows.forEach((row: string, idx: number) => {
            let columns: string[] = row.split(",");
            columns.unshift(String(idx + 1)); // 添加行索引
            if (idx == 0) {
                // 添加列索引
                html += "<tr>";
                for (let i: number = 0; i < columns.length; i++) {
                    html += `<th>${i == 0 ? "" : String.fromCharCode(65 + i - 1)}</th>`;
                }
                html += "</tr>";
            }
            html += "<tr>";
            columns.forEach((column: string) => (html += `<td>${column}</td>`));
            html += "</tr>";
        });
        html += "</table>";
        return html;
    };

    return {
        table_state,
        table_event_state,
        getExcelData,
        sheetExcelTab,
    };
};

interface SheetsScrollType {
    /** sheet总宽度 */
    all_width: number;
    /** sheet可见宽度 */
    show_width: number;
    /** sheet左边滚动距离 */
    left_width: number;
}

/** sheet 切换位移相关 */
export const sheetTabScorllAbout = () => {
    const excel_body_ref = ref<HTMLElement>();
    /** sheet ref */
    const sheets_ref = ref<HTMLElement>();
    const sheets_scroll = reactive<SheetsScrollType>({
        show_width: 0,
        all_width: 0,
        left_width: 0,
    });
    /** 点击切换滚动 */
    const sheetScrollEvent = (direction: string = "right", /** 可选参数 向左侧位移多远 */ left_width_nums: number = 0): void => {
        if (direction == "right") {
            (sheets_ref.value as HTMLElement).scrollLeft += (sheets_ref.value as HTMLElement).clientWidth - 100;
        } else if (direction == "left") {
            (sheets_ref.value as HTMLElement).scrollLeft -= (sheets_ref.value as HTMLElement).clientWidth + 100;
        } else {
            (sheets_ref.value as HTMLElement).scrollLeft = left_width_nums - 100;
        }
        sheets_scroll.left_width = (sheets_ref.value as HTMLElement).scrollLeft;
    };
    /** 操作Dom */
    const addSlotHtml = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            //选择渲染出来的所有 td 单项
            let excel_td_dom: NodeListOf<any> = document.querySelectorAll("#excel_body_id table td");
            for (let i in excel_td_dom) {
                //内容为空高度丢失问题
                if (typeof excel_td_dom[i] == "object") {
                    if (!excel_td_dom[i].innerHTML) {
                        excel_td_dom[i].height = "30";
                    }
                }
            }
            resolve(true);
        });
    };

    /** 处理多个子item ref */
    const itemRefs = ref<Array<any>>([]);
    const setItemRef = (el: any) => {
        if (el) {
            itemRefs.value.push(el);
        }
    };
    /** 左右滚动 */
    const sheetToggleScroll = (index: number) => {
        let left_width_nums: number = 0;
        for (let i in itemRefs.value) {
            if (Number(i) < index) {
                left_width_nums += itemRefs.value[i].clientWidth;
            }
        }
        sheetScrollEvent("", left_width_nums);
    };

    onMounted(async () => {
        await nextTick();
        setTimeout(() => {
            sheets_scroll.show_width = (sheets_ref.value as HTMLElement).clientWidth;
            sheets_scroll.all_width = (sheets_ref.value as HTMLElement).scrollWidth;
        }, 80);
    });

    onBeforeUpdate(() => {
        itemRefs.value = [];
    });

    return {
        excel_body_ref,
        sheets_ref,
        sheets_scroll,
        itemRefs,
        setItemRef,
        sheetScrollEvent,
        sheetToggleScroll,
        addSlotHtml,
    };
};
