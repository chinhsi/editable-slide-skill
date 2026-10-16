# Editable Slide Skill

從只有 AI CLI 與終端機的環境，建立可編輯的 PowerPoint。包含獨立環境安裝、HTML/CSS 版面、原生 PPTX 轉換與基本驗證；不需要 API key 或多 AI 複核。

## 技術流程

HTML/CSS → Playwright + Chromium 計算排版 → 包內轉換器 → PptxGenJS → 可編輯 PPTX。

文字、矩形、圖片、原生長條圖與講者備註會保留為對應物件。PDF/PNG 由同源 HTML 產生，**不是最終 PPTX 的渲染結果**。目前尚未附 LibreOffice 驗證模組。

## 開始使用

讓 AI CLI 讀取 [SKILL.md](SKILL.md)，再依 [START-HERE.md](START-HERE.md) 提供內容。也可直接在本資料夾執行：

macOS/Linux：
```sh
bash scripts/setup.sh
bash scripts/run.sh assets/example.html output
```

Windows PowerShell：
```powershell
./scripts/setup.ps1
./scripts/run.ps1 assets/example.html output
```

第一次安裝需要網路。Node.js 與 Chromium 下載到包內 `.runtime`，不更改系統 PATH。Linux 可能需要管理員安裝瀏覽器系統函式庫。安裝權限依所在環境與學校政策處理。

## 來源與驗證

- [HTML 元素規格](references/html-contract.md)：支援範圍與排版限制。
- [範例](assets/example.html)：兩頁含中文文字與原生圖表。
- [驗證紀錄](VALIDATION.md)：Mac Apple Silicon 已實測；Windows/Linux 尚未實測。
- `npm test`：檢查原生文字、圖片、圖表、備註及錯誤攔截。

本工具使用自行實作的受限轉換器，不包含其他供應商限制轉發的 html2pptx.js。任意 HTML、既有 PPTX 保真編輯、Office 實際渲染不在目前支援範圍。

## 授權

本包程式採 [MIT](LICENSE)。安裝的 Node.js、Playwright、PptxGenJS、JSZip 分別依各自授權使用。
