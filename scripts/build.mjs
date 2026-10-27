import { createRenderer } from '../src/render.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const keys=(obj,allowed,label)=>{if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error(label+': expected object');for(const key of Object.keys(obj))if(!allowed.includes(key))throw Error(label+': unexpected field '+key);};
const requiredText=(value,label)=>{if(typeof value!=='string'||!value.trim()||value.length>3000)throw Error('Invalid text '+label);};
const approvedSlugs=['credit-points','brilliant-diamonds','primal-crystal'];
const approvedCharacters=['he-yulian','frieze','panacea'];
const approvedCharacterNames=['何雨莲','弗莉兹','潘娜西娅'];
const approvedFields=['name','type','description'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function validate(publicData,release,game,gameBytes){
 keys(publicData,['checkedOn','sources','articles'],'public');
 keys(release,['status','version','boundaryDate','reviewedOn','scope','allowedFields','reviewedEntries','gameDigest','reviewedCharacters','characterFields'],'release');
 keys(game,['entries','characters'],'game');
 if(!Array.isArray(game.characters))throw Error('Missing reviewed character list');
 if(!['pending','verified'].includes(release.status))throw Error('Unknown release status');
 if(!Array.isArray(game.entries)||!Array.isArray(release.allowedFields)||!Array.isArray(release.reviewedEntries))throw Error('Missing allowlist');
 if(release.status==='pending'){
   if(game.characters.length||game.entries.length||release.allowedFields.length||release.reviewedEntries.length||release.gameDigest!==null)throw Error('Pending release must have no game data');
 }else{
   if(!same(release.allowedFields,approvedFields)||!same(release.reviewedEntries,approvedSlugs))throw Error('Unreviewed field or entry in allowlist');
   if(!same(release.reviewedCharacters,approvedCharacters)||!same(release.characterFields,['name'])||!same(game.characters.map(x=>x.slug),approvedCharacters))throw Error('Unreviewed character entry or field');
   if(!same(game.entries.map(x=>x.slug),approvedSlugs))throw Error('Unreviewed game entry');
   if(!/^[a-f0-9]{64}$/.test(release.gameDigest)||digest(gameBytes)!==release.gameDigest)throw Error('Reviewed game content digest mismatch');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(release.boundaryDate)||!release.version||!release.scope)throw Error('Incomplete release review');
 }
 for(const item of game.entries){
   keys(item,['slug','name','type','description','uiPath'],'game entry');
   for(const field of ['slug','name','type','description','uiPath'])requiredText(item[field],field);
   if(item.type!=='资源'||!item.uiPath.startsWith('已解锁背包'))throw Error('Unreviewed UI route or item category');
   if(/[<>]|\{[^}]*\}|概率|公式|DEBUG|\b(?:internalId|dropRate|secret)\b/i.test(item.description))throw Error('Unreviewed text content');
 }
 for(const [index,character] of game.characters.entries()){
   keys(character,['slug','name','uiPath'],'character');
   if(character.name!==approvedCharacterNames[index]||character.uiPath!=='正式剧情试用 → 角色入队提示')throw Error('Unreviewed character text or UI route');
 }
 if(!Array.isArray(publicData.sources)||!Array.isArray(publicData.articles))throw Error('Invalid public content');
 const sourceKeys=new Set();
 for(const source of publicData.sources){keys(source,['key','title','url','evidence'],'source');if(source.url!=='https://lvmeng.zhuziplay.com/'||sourceKeys.has(source.key))throw Error('Unapproved public source');sourceKeys.add(source.key);}
 const slugs=new Set([...approvedSlugs,...approvedCharacters]);
 for(const a of publicData.articles){
   keys(a,['slug','category','title','summary','label','paragraphs','facts','source'],'article');
   if(!/^[a-z0-9-]+$/.test(a.slug)||slugs.has(a.slug))throw Error('Invalid or duplicate slug');slugs.add(a.slug);
   if(!['游戏概览','开始游戏','宣传资料'].includes(a.category)||!sourceKeys.has(a.source))throw Error('Unapproved category or source');
   for(const field of ['title','summary','label'])requiredText(a[field],field);
   if(!Array.isArray(a.paragraphs)||!Array.isArray(a.facts))throw Error('Invalid article body');
   for(const p of a.paragraphs)requiredText(p,'paragraph');
   for(const f of a.facts){keys(f,['label','value','source'],'fact');if(typeof f.value!=='string'||!sourceKeys.has(f.source))throw Error('Unsourced fact');}
 }
 return true;
}
export function requirePublishable(release,preview){if(!preview&&release.status!=='verified')throw Error('Deployment blocked: release boundary has not been verified.');}
export function build({preview=false,output=path.join(root,'dist')}={}){
 const publicData=JSON.parse(fs.readFileSync(path.join(root,'content/public.json'),'utf8'));
 const release=JSON.parse(fs.readFileSync(path.join(root,'content/release.json'),'utf8'));
 const gameBytes=fs.readFileSync(path.join(root,'content/game.json')),game=JSON.parse(gameBytes);
 validate(publicData,release,game,gameBytes);requirePublishable(release,preview);
 const approvedAssets={
   'logo.png':'e1637c8726bd86708e0b408937c1d04393277998fb05db477ef24d84fb454b71',
   'hero.jpg':'2874c7faea8e1adc7c3ca4c33217e261f4dd4b07abfdbb4b0a9ca9c0d24baabf',
   'favicon.png':'c409468e220d754c44910d6acf1d3a03edbd7efc08236f864468e957a1937092',
 };
 for(const [file,hash] of Object.entries(approvedAssets))if(digest(fs.readFileSync(path.join(root,'src/assets',file)))!==hash)throw Error('Unreviewed asset '+file);
 const fixedOutput=path.join(root,'dist');if(path.resolve(output)!==fixedOutput)throw Error('Output must be the repository dist directory');
 // Only the fixed repository dist folder is replaced; output uses an explicit file list.
 fs.rmSync(fixedOutput,{recursive:true,force:true});fs.mkdirSync(path.join(fixedOutput,'assets'),{recursive:true});
 for(const file of ['index.html','style.css','app.js','render.js'])fs.copyFileSync(path.join(root,'src',file),path.join(fixedOutput,file));
 for(const file of Object.keys(approvedAssets))fs.copyFileSync(path.join(root,'src/assets',file),path.join(fixedOutput,'assets',file));
 const source={key:'release-ui',title:'已核验客户端的游戏内物品详情',url:'#/version',evidence:'已解锁背包 → 顶部资源栏 → 资源详情。仅收录界面显示的名称、类型和说明。'};
 const records=game.entries.map(item=>({slug:item.slug,category:'资源货币',title:item.name,summary:item.description.split(/[。\n]/)[0]+'。',label:'游戏内 UI 资料',paragraphs:item.description.split('\n'),facts:[{label:'物品类型',value:item.type,source:'release-ui'},{label:'游戏内查看位置',value:item.uiPath,source:'release-ui'}],source:'release-ui'}));
 const characterSource={key:'release-story',title:'固定版本正式剧情试用的入队提示',url:'#/version',evidence:'正式剧情试用的入队提示显示角色姓名。本页仅收录姓名，不包含未核实的属性、技能或装备。'};
 const characterRecords=game.characters.map(character=>({slug:character.slug,category:'角色图鉴',title:character.name,summary:'已核实正式剧情试用中的角色姓名；详细资料尚未收录。',label:'角色姓名 · 剧情试用',paragraphs:['正式剧情试用的入队提示中显示该角色姓名。本站目前仅收录姓名。','属性、技能、装备与获取方式的详细资料尚未收录；此页不代表当前卡池推荐或近期实装。'],facts:[{label:'已收录字段',value:'角色姓名',source:'release-story'},{label:'游戏内查看位置',value:character.uiPath,source:'release-story'}],source:'release-story'}));
 const safe={checkedOn:publicData.checkedOn,sources:[...publicData.sources,source,characterSource],articles:[...characterRecords,...records,...publicData.articles],release:{status:release.status,version:release.version,boundaryDate:release.boundaryDate,reviewedOn:release.reviewedOn,scope:release.scope,gameEntryCount:game.entries.length+game.characters.length,itemCount:game.entries.length,characterCount:game.characters.length,allowedFieldCount:release.allowedFields.length}};
 fs.writeFileSync(path.join(fixedOutput,'data.js'),'export const '+Object.entries(safe).map(([k,v])=>k+' = '+JSON.stringify(v)).join(',\n')+';\n');
 fs.writeFileSync(path.join(fixedOutput,'.nojekyll'),'');
 fs.writeFileSync(path.join(fixedOutput,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\nSitemap: https://balatiger.github.io/Lumeng-Wiki/sitemap.xml\n');
 const html=fs.readFileSync(path.join(fixedOutput,'index.html'),'utf8');
 const rendered=html.replace('<body>','<body data-mode="'+(preview?'preview':'production')+'">').replace('<meta name="description"',preview?'<meta name="robots" content="noindex,nofollow"><meta name="description"':'<meta name="description"');
 const renderPage=createRenderer(safe);
 const pagePaths=['','characters','equipment','skills','items','banners','catalog','version','policy',...safe.articles.map(a=>'article/'+a.slug)];
 const pageFiles=[];
 for(const route of pagePaths){
   const body=renderPage(new URL('/'+route,'https://local.invalid'));
   const title=body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g,'')||'首页';
   const canonical='https://balatiger.github.io/Lumeng-Wiki/'+(route?route+'/':'');
   const description=safe.articles.find(a=>'article/'+a.slug===route)?.summary||title+'。绿梦：时空之声 Wiki 固定版本资料与收录状态。';
   const page=rendered.replace(/<meta name="description" content="[^"]*"/,'<meta name="description" content="'+description.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"').replace(/<title>.*?<\/title>/,'<title>'+title+' · 绿梦：时空之声 Wiki</title>').replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="'+canonical+'">').replace('<main id="main" tabindex="-1"></main>','<main id="main" tabindex="-1">'+body+'</main>');
   const file=(route?route+'/':'')+'index.html';fs.mkdirSync(path.dirname(path.join(fixedOutput,file)),{recursive:true});fs.writeFileSync(path.join(fixedOutput,file),page);pageFiles.push(file);
 }
 const notFound=rendered.replace('<main id="main" tabindex="-1"></main>','<main id="main" tabindex="-1">'+renderPage(new URL('/not-found','https://local.invalid'))+'</main>').replace('<meta name="description"','<meta name="robots" content="noindex,follow"><meta name="description"');
 fs.writeFileSync(path.join(fixedOutput,'404.html'),notFound);
 const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pagePaths.map(route=>'<url><loc>https://balatiger.github.io/Lumeng-Wiki/'+(route?route+'/':'')+'</loc></url>').join('')+'</urlset>\n';fs.writeFileSync(path.join(fixedOutput,'sitemap.xml'),sitemap);
 const files=[...pageFiles,'404.html','style.css','app.js','render.js','data.js','robots.txt','sitemap.xml','.nojekyll','assets/logo.png','assets/hero.jpg','assets/favicon.png'];
 const manifest=files.map(file=>({file,bytes:fs.statSync(path.join(fixedOutput,file)).size,sha256:digest(fs.readFileSync(path.join(fixedOutput,file)))}));
 fs.writeFileSync(path.join(fixedOutput,'build-manifest.json'),JSON.stringify({mode:preview?'preview':'production',files:manifest},null,2)+'\n');
 console.log('Built '+(preview?'LOCAL PREVIEW':'PRODUCTION')+': '+files.length+' explicit files; '+game.entries.length+' UI-reviewed currency records; '+game.characters.length+' name-only characters.');return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build({preview:process.argv.includes('--preview')});
