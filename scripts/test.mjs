import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import JSZip from 'jszip';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'editable deck test '));
const original=await fs.readFile(path.join(root,'assets/example.html'),'utf8');
const image='<img data-pptx="image" style="left:1100px;top:610px;width:80px;height:50px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jMioAAAAASUVORK5CYII=">';
async function run(name,html,success){const source=path.join(tmp,name+'.html'),out=path.join(tmp,name);await fs.writeFile(source,html);const r=spawnSync(process.execPath,[path.join(root,'scripts/build.mjs'),source,out],{encoding:'utf8'});if((r.status===0)!==success)throw new Error(name+' failed expectation\n'+r.stdout+r.stderr);return out;}
const out=await run('valid',original.replace('</section>',image+'</section>'),true);
const qa=JSON.parse(await fs.readFile(path.join(out,'qa.json')));if(qa.slides!==2||qa.charts!==1||qa.notesParts!==2)throw new Error('Missing expected native parts');
const zip=await JSZip.loadAsync(await fs.readFile(path.join(out,'output.pptx')));if(!Object.keys(zip.files).some(n=>/^ppt\/media\/.+\.png$/.test(n)))throw new Error('Missing image');
await run('overflow',original.replace('left:100px;top:220px','left:1250px;top:220px'),false);
await run('unsupported',original.replace('background:#e3edf0','background:#e3edf0;transform:rotate(5deg)'),false);
await run('unmarked',original.replace('<section class="slide">','<section class="slide"><p>unmarked</p>'),false);
console.log('PASS: native CJK text, 2 notes, chart, image, spaced paths, overflow/effect/unmarked rejection. Artifacts:',tmp);
