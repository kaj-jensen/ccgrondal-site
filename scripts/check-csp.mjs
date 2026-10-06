import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(new URL('../',import.meta.url).pathname);
const folder=readdirSync(root).includes('public')?path.join(root,'public'):root;
const policy=readFileSync(path.join(folder,'_headers'),'utf8').match(/Content-Security-Policy: (.+)/i)?.[1];
if(!policy)throw new Error('Missing CSP');
const scripts=policy.split(';').find(d=>d.trim().startsWith('script-src '));
if(!scripts||scripts.includes("'unsafe-inline'")||scripts.includes("'unsafe-eval'"))throw new Error('Scripts must use exact hashes or authorized hosts');
let count=0;
for(const file of readdirSync(folder).filter(f=>f.endsWith('.html'))){
 const html=readFileSync(path.join(folder,file),'utf8');
 for(const [,attrs,body] of html.matchAll(/<script\b([^>]*)>(.*?)<\/script\s*>/gis)){
  const src=attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  if(src){if(src.startsWith('https://')&&!scripts.includes(new URL(src).origin))throw new Error(`${file}: blocked external script ${src}`);continue;}
  const hash=`'sha256-${createHash('sha256').update(body).digest('base64')}'`;
  if(!scripts.includes(hash))throw new Error(`${file}: update CSP for changed inline script (${hash})`);
  count++;
 }
}
console.log(`CSP allows ${count} intended inline scripts and keeps arbitrary inline execution blocked.`);
