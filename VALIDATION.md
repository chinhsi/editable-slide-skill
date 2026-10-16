# 驗證紀錄 — 2026-10-16

- macOS Apple Silicon：從空的包內 .runtime 下載並校驗 Node.js v24.22.0，npm ci 安裝鎖定依賴，獨立下載 Chromium，啟動成功。
- 範例 2 頁：原生中文字、2 份 notes、1 份原生圖表；PPTX ZIP 完整性與原生文字核對通過；Arial 的東亞字型設定改為 Microsoft JhengHei。
- 自動測試通過：圖片嵌入、含空格路徑、文字保留、圖表與 notes；出界、不支援效果、未標記文字均會拒絕輸出。
- 已目視兩頁 HTML PNG 預覽。未用 PowerPoint/Office 渲染最終 PPTX；PNG/PDF 不代表 Office 排版結果。
- Windows/Linux 安裝腳本已提供，但未在該平台實測。中文字型未內嵌，接收者仍需可用字型。
- 本次沒有多 AI 檢驗、付費 API 或圖片生成依賴。
