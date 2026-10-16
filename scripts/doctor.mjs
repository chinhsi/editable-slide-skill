import {chromium} from 'playwright';
const browser = await chromium.launch({headless:true});
try { const p=await browser.newPage(); await p.setContent('<p>繁體中文 CLI ready</p>'); console.log('OK: Node',process.version,'Chromium',browser.version()); } finally {await browser.close();}
