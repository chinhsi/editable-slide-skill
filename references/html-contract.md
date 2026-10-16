# HTML 元素規格

每頁 `<section class="slide">` 固定 1280×720 CSS px，position:relative；每個可見元素都必須是以下帶 `data-pptx` 的節點。元素順序就是 PowerPoint 疊放順序。可以用 flex/grid 做不帶視覺樣式的容器，但不要讓容器帶背景、文字或裝飾。建議採 absolute positioning，與範例一致。

- `data-pptx="text"`：純文字，無子標籤或富文字。可用換行；要局部粗體請拆成另一個文字框。CSS font-size、font-family 第一個字體、font-weight、font-style、color、text-align、line-height 會轉換；margin/padding 設 0。字體建議 Arial、Microsoft JhengHei 或目標裝置已裝的中文字體。native 文字不保證與 Chromium 完全相同的換行，須留足空間。
- `data-pptx="rect"`：背景色＋可選單一實線邊框；無子節點。不能用陰影、圓角、漸層、transform、透明度，避免靜默失真。
- `<img data-pptx="image" src="...">`：本地相對圖片或 data URL，object-fit:contain；輸出保留實際圖像比例。不要用遠端圖片 URL。HTML 在其來源資料夾讀取，資產路徑以 HTML 為準。
- `data-pptx="chart"`：原生長條圖。附 `data-chart='{"type":"bar","series":[{"name":"示例","labels":["A","B"],"values":[3,5]}]}'`。數據必須有限數值，系列 labels 相同。HTML 預覽顯示同源 SVG 長條示意；PPTX 是原生 chart，外觀不等同 SVG。其他圖表可另外擴充轉換器，不能假稱已支援。
- `<aside class="notes">講者備註</aside>`：每頁最多一個，由 CSS 隱藏，轉為 speaker notes。

頁面底色用 `.slide {background:#FAF9F6}`。不支援任意 CSS 效果、HTML table、SVG 文字直接轉原生圖形、動畫、母片、內嵌字型、超連結或複雜富文字。需要表格時可用獨立 rect/text 格子（不是原生 PowerPoint 表格）。不應把整頁 rasterize 作為文字轉換失敗的替代。

輸出 output.pptx、source-handout.pdf、preview/page-N.png、qa.json。qa.json 的警告標明 PPTX 尚未用 Office 渲染。不得把 QA 的程式檢查冒稱目視或跨軟體一致性驗證。
