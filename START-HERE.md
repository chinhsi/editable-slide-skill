# 給學生的使用方式

解壓縮整個資料夾，交給能讀寫檔案及執行命令的 AI CLI。無需先裝 Node.js、Python、PowerPoint 或瀏覽器；需要網路、作業系統基本命令與安裝下載權限。Windows 用 PowerShell，Mac/Linux 用 shell。Linux 可能另需管理員安裝 Chromium 系統函式庫。

直接貼：

> 請先讀這個資料夾的 SKILL.md，依照它安裝所需環境並跑範例。接著以我提供的內容製作可編輯 PowerPoint。先用 HTML/CSS 排版，再用包內轉換器透過 Chromium 計算位置，交給 PptxGenJS 產出原生文字、形狀與圖表。不要把整頁變成圖片，不需要多 AI 複核。請交付 PPTX、來源 HTML、同源 PDF、圖片與檢查結果。我的主題是【】，聽眾是【】，時間是【】，資料是【】。

若要手動執行，在此資料夾開啟終端：

Mac/Linux：
```sh
bash scripts/setup.sh
bash scripts/run.sh assets/example.html output
```

Windows PowerShell：
```powershell
./scripts/setup.ps1
./scripts/run.ps1 assets/example.html output
```

Windows 若系統禁止執行腳本，應遵照學校政策處理，不自行繞過。輸出在 output。新簡報另存 HTML，再把命令的輸入路徑換掉。

本包採 MIT 授權，未收錄私人資料或原有受限制的 html2pptx 工具。Node.js、Playwright、PptxGenJS、JSZip 各自依其授權使用。安裝時取得依賴，不在分享包內夾帶整個執行環境。

限制：這是明確標記元素的 HTML 轉換器，不是任意網頁轉 PPT 工具。PDF/PNG 是 HTML 預覽，不是最終 PPTX 渲染；接收者字型與實際 PowerPoint 換行仍應檢查。
