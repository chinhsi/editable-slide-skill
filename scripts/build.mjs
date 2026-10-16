import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.runtime/browsers');
const {chromium}=await import('playwright');
const [inputArg,outArg]=process.argv.slice(2);
if(!inputArg||!outArg) throw new Error('Usage: build.mjs source.html output-directory');
const input=path.resolve(inputArg),out=path.resolve(outArg);
await fs.mkdir(path.join(out,'preview'),{recursive:true});
const browser=await chromium.launch({headless:true});
const presentation=new PptxGenJS();presentation.layout='LAYOUT_WIDE';
presentation.author='';presentation.subject='Editable HTML deck';
const expected=[];let chartCount=0;
try {
 const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 await page.route('**/*',route=>/^https?:/.test(route.request().url())?route.abort():route.continue());
 await page.goto(pathToFileURL(input).href);await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode())));
 const chartSpecs=await page.locator('[data-pptx="chart"]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.dataset.chart)));
 for(const spec of chartSpecs){
  if(spec.type!=='bar'||!spec.series?.length)throw new Error('Only nonempty bar chart series supported');
  const labels=spec.series[0].labels;
  for(const s of spec.series)if(!s.name||!Array.isArray(labels)||!labels.length||JSON.stringify(s.labels)!==JSON.stringify(labels)||s.values?.length!==labels.length||!s.values.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0))throw new Error('Bar series require matching labels and nonnegative finite numbers');
 }
 await page.locator('[data-pptx="chart"]').evaluateAll(nodes=>nodes.forEach(n=>{
  const spec=JSON.parse(n.dataset.chart),ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 800 380');svg.style.cssText='width:100%;height:100%';
  const max=Math.max(1,...spec.series.flatMap(s=>s.values)),total=spec.series.reduce((a,s)=>a+s.values.length,0);let i=0;
  for(const s of spec.series) s.values.forEach((v,j)=>{const y=20+i++*330/total,rect=document.createElementNS(ns,'rect');rect.setAttribute('x','180');rect.setAttribute('y',y);rect.setAttribute('width',v/max*520);rect.setAttribute('height',Math.min(40,240/total));rect.setAttribute('fill','#176b87');svg.append(rect);const t=document.createElementNS(ns,'text');t.setAttribute('x','5');t.setAttribute('y',y+22);t.setAttribute('font-size','18');t.textContent=s.labels[j]+' '+v;svg.append(t)});n.append(svg);
 }));
 const slides=await page.locator('.slide').count();if(!slides)throw new Error('No .slide sections');
 for(let i=0;i<slides;i++){
  const section=page.locator('.slide').nth(i);
  const data=await section.evaluate(root=>{
   const base=root.getBoundingClientRect(),errors=[];
   const rgb=color=>{const m=color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);if(!m)throw new Error('Unsupported color '+color);return {hex:m.slice(1,4).map(v=>(+v).toString(16).padStart(2,'0')).join(''),alpha:m[4]===undefined?1:+m[4]}};
   const bg=rgb(getComputedStyle(root).backgroundColor);if(bg.alpha!==1)errors.push('Slide background must be opaque');
   if(Math.abs(base.width-1280)>1||Math.abs(base.height-720)>1)errors.push('Slide must be 1280x720');
   for(const n of root.querySelectorAll('*')){
    if(n.closest('.notes')||n.closest('[data-pptx]'))continue;
    if([...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim()))errors.push('Unmarked visible text');
    const c=getComputedStyle(n);if(c.display!=='none'&&(rgb(c.backgroundColor).alpha>0||parseFloat(c.borderTopWidth)>0))errors.push('Unmarked decorated container');
   }
   if([...root.childNodes].some(c=>c.nodeType===3&&c.textContent.trim()))errors.push('Unmarked slide text');
   const objects=[...root.querySelectorAll('[data-pptx]')].map(n=>{
    const r=n.getBoundingClientRect(),c=getComputedStyle(n),kind=n.dataset.pptx;
    if(!['text','rect','image','chart'].includes(kind))errors.push('Unknown element '+kind);
    if(n.parentElement.closest('[data-pptx]'))errors.push('Nested data-pptx elements');
    for(let a=n;a&&a!==root;a=a.parentElement){const s=getComputedStyle(a);if(s.transform!=='none'||s.opacity!=='1'||s.boxShadow!=='none'||s.textShadow!=='none'||s.backgroundImage!=='none'||s.filter!=='none'||parseFloat(s.borderRadius)>0)errors.push('Unsupported effect on '+kind)}
    if(r.left<base.left-1||r.top<base.top-1||r.right>base.right+1||r.bottom>base.bottom+1)errors.push(kind+' outside slide');
    if(r.width<=0||r.height<=0)errors.push(kind+' has no area');
    if(kind==='text'){
     if(rgb(c.backgroundColor).alpha>0||parseFloat(c.borderTopWidth)>0)errors.push('Text decoration must be a separate rect');
     if(n.children.length)errors.push('Text must be plain, without nested tags');
     if(n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1)errors.push('Text overflows: '+n.innerText.slice(0,50));
     if(['paddingTop','paddingBottom','paddingLeft','paddingRight'].some(k=>parseFloat(c[k])!==0))errors.push('Text padding must be zero');
    }
    return {kind,x:(r.left-base.left)/96,y:(r.top-base.top)/96,w:r.width/96,h:r.height/96,text:n.innerText,color:rgb(c.color),fill:rgb(c.backgroundColor),font:c.fontFamily.split(',')[0].replace(/["']/g,''),size:parseFloat(c.fontSize)*.75,bold:+c.fontWeight>=600,italic:c.fontStyle==='italic',align:c.textAlign,lineSpacing:parseFloat(c.lineHeight)*.75,borderWidth:parseFloat(c.borderTopWidth)*.75,borderColor:rgb(c.borderTopColor),naturalWidth:n.naturalWidth,naturalHeight:n.naturalHeight,src:kind==='image'?n.src:null,chart:kind==='chart'?JSON.parse(n.dataset.chart):null};
   });return {objects,errors,bg:bg.hex,notes:root.querySelector('.notes')?.textContent||''};
  });
  if(data.errors.length)throw new Error(`Slide ${i+1}: ${[...new Set(data.errors)].join('; ')}`);
  const slide=presentation.addSlide();slide.background={color:data.bg};slide.addNotes(data.notes);
  const texts=[];
  for(const o of data.objects){
   const box={x:o.x,y:o.y,w:o.w,h:o.h};
   if(o.kind==='text'){slide.addText(o.text,{...box,fontFace:o.font,fontSize:o.size,bold:o.bold,italic:o.italic,color:o.color.hex,transparency:(1-o.color.alpha)*100,margin:0,breakLine:false,paraSpaceAfterPt:0,align:['left','right','center','justify'].includes(o.align)?o.align:'left',valign:'top',...(Number.isFinite(o.lineSpacing)?{lineSpacing:o.lineSpacing}:{} )});texts.push(o.text);}
   if(o.kind==='rect')slide.addShape(presentation.ShapeType.rect,{...box,fill:{color:o.fill.hex,transparency:(1-o.fill.alpha)*100},line:{color:o.borderColor.hex,width:o.borderWidth,transparency:o.borderWidth?0:100}});
   if(o.kind==='image'){
    if(!o.src.startsWith('file:')&&!o.src.startsWith('data:image/'))throw new Error('Image must be local or data URL');
    const source=o.src.startsWith('file:')?fileURLToPath(o.src):o.src;
    if(!o.naturalWidth||!o.naturalHeight)throw new Error('Image failed to load');
    const scale=Math.min(o.w/o.naturalWidth,o.h/o.naturalHeight),w=o.naturalWidth*scale,h=o.naturalHeight*scale;
    slide.addImage({...o.src.startsWith('file:')?{path:source}:{data:source},x:o.x+(o.w-w)/2,y:o.y+(o.h-h)/2,w,h});
   }
   if(o.kind==='chart'){slide.addChart(presentation.ChartType.bar,o.chart.series,{...box,catAxisLabelFontFace:'Arial',catAxisLabelFontSize:14,valAxisLabelFontSize:14,showLegend:o.chart.series.length>1,showTitle:false,showValue:true,chartColors:['176B87','F4A261'],showCatName:false});chartCount++;}
  }
  expected.push(texts);await section.screenshot({path:path.join(out,'preview',`page-${i+1}.png`)});
 }
 await page.addStyleTag({content:'@page{size:1280px 720px;margin:0}html,body{margin:0!important}.slide{break-after:page!important;break-inside:avoid!important}.slide:last-child{break-after:auto!important}'});
 await page.pdf({path:path.join(out,'source-handout.pdf'),printBackground:true,preferCSSPageSize:true});
 await presentation.writeFile({fileName:path.join(out,'output.pptx')});
}finally{await browser.close();}
const zip=await JSZip.loadAsync(await fs.readFile(path.join(out,'output.pptx')),{checkCRC32:true});
// Preserve Latin Arial while assigning a Chinese-capable East Asian font.
for(const name of Object.keys(zip.files).filter(n=>/^ppt\/(slides|charts)\/.*\.xml$/.test(n))){
 const xml=await zip.file(name).async('string');
 zip.file(name,xml.replace(/<a:ea typeface="Arial"/g,'<a:ea typeface="Microsoft JhengHei"'));
}
await fs.writeFile(path.join(out,'output.pptx'),await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const norm=s=>s.replace(/\s+/g,'');
for(let i=0;i<expected.length;i++){
 const xml=await zip.file(`ppt/slides/slide${i+1}.xml`).async('string');
 const text=[...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m=>decode(m[1])).join('');
 if(norm(text)!==norm(expected[i].join('')))throw new Error(`Native text mismatch on slide ${i+1}`);
}
const qa={slides:expected.length,charts:chartCount,nativeTextVerified:true,zipCRCVerified:true,notesParts:Object.keys(zip.files).filter(n=>/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n)).length,source:input,warnings:['PNG/PDF are HTML source previews, not PPTX renders.','Final PowerPoint visual rendering and recipient fonts have not been verified.'],checkedAt:new Date().toISOString()};
await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(qa,null,2));console.log(JSON.stringify(qa,null,2));
