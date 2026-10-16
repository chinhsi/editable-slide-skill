---
name: editable-html-deck
description: 從只有終端機的環境建立可編輯 PowerPoint：安裝獨立 Node.js 與 Chromium，以 HTML/CSS 排版，轉為原生文字、形狀、圖片和圖表，輸出 PPTX、HTML 同源 PDF 與基本驗證。適用新製作簡報與學生可重建作業；不適用保留既有 PPT 細節的局部修改。
---
# 可編輯 HTML 簡報

本 skill 可直接交給有檔案及命令執行能力的 AI CLI 閱讀，不依賴其他 skill、個人電腦路徑、API key 或多 AI 複核。先完成安裝與範例，再依使用者內容製作。

## 從零啟動

先確認作業系統與 skill 所在目錄。Mac/Linux 執行 `bash scripts/setup.sh`；Windows PowerShell 執行 `./scripts/setup.ps1`。腳本在包內 `.runtime` 安裝 Node.js，執行 `npm ci`，下載專用 Chromium，不更改系統 PATH 或安裝系統 Chrome。需網路與下載權限；依目前 CLI 的權限規則執行。

Linux 若 Chromium 缺系統函式庫，依錯誤執行本地 Playwright 的 `install-deps chromium`，這一步可能需要管理員權限；不要自行執行 sudo 或繞過平台限制。支援 macOS/Linux x64、arm64 與 Windows x64/arm64；只有 Mac 已實際驗證，其餘需在目標平台驗收。

安裝完使用 `bash scripts/run.sh assets/example.html output`；Windows 使用 `./scripts/run.ps1 assets/example.html output`。路徑可含空格。

## 製作順序

1. 依目的、聽眾及資料整理逐頁主線。沒有材料時不要捏造研究結果或來源。
2. 讀 [HTML 規格](references/html-contract.md)，由 `assets/example.html` 建立新 HTML。每頁獨立 `.slide`，明確標記要轉換的物件。
3. 用 CSS 決定版面；轉換器會用 Chromium 量測尺寸、位置及文字樣式，再用 PptxGenJS 建立原生物件。這是本包自行實作的受限轉換器，並非通用 HTML 匯入器，也不是第三方 html2pptx.js 的副本。
4. 執行 run 腳本。轉換器會拒絕出界、文字容器溢出、未知元素及不支援的效果；修正有問題的頁面後重建。
5. 查看輸出的 HTML 預覽 PNG，核對文字、重疊、對比及圖表。可閱讀圖像的 CLI 才能完成目視；不能看圖時如實標未目視，不得假稱通過。
6. `qa.json` 驗證頁數、原生文字完整性及 notes/圖表數。這不等於 PowerPoint 實際渲染驗證。HTML PDF/PNG 是來源預覽，不能稱為 PPTX 截圖。若使用者環境有可用 Office 渲染器，可另驗最終 PPTX；不要求安裝 Office 或啟動 GUI。
7. 交付 PPTX、同源 PDF、來源 HTML、本 skill 包與必要圖片、qa.json，以及重建命令。保留各依賴套件的授權。不要加入跨模型複核、個人課程路徑或私人工作室設定。

## 修改與界線

改本流程生成的簡報：修改 HTML 來源後重建。若使用者已在 PowerPoint 手動修改，先確認哪個版本是正本，不用舊 HTML 覆蓋。任意既有 PPTX 的保真編輯不在此 skill 範圍。

插圖可由使用者提供或另行生成，不是必要依賴。精確文字及數據留在原生物件。中文字型在接收端仍須可用；本包不內嵌或下載字型。
