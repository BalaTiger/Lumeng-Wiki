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
 keys(release,['status','version','boundaryDate','reviewedOn','scope','allowedFields','reviewedEntries','gameDigest','reviewedCharacters','characterFields','publicationReview'],'release');
 keys(game,['entries','characters'],'game');
 if(!Array.isArray(game.characters))throw Error('Missing reviewed character list');
 if(!['pending','verified'].includes(release.status))throw Error('Unknown release status');
 if(!Array.isArray(game.entries)||!Array.isArray(release.allowedFields)||!Array.isArray(release.reviewedEntries))throw Error('Missing allowlist');
 if(release.status==='pending'){
   if(game.characters.length||game.entries.length||release.allowedFields.length||release.reviewedEntries.length||release.gameDigest!==null)throw Error('Pending release must have no game data');
 }else{
   if(!same(release.allowedFields,approvedFields)||!same(release.reviewedEntries,approvedSlugs))throw Error('Unreviewed field or entry in allowlist');
   if(!same(release.reviewedCharacters,approvedCharacters)||!same(release.characterFields,['name','rarity','profession','element','style','portrait','skills'])||!same(game.characters.map(x=>x.slug),approvedCharacters))throw Error('Unreviewed character entry or field');
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
   keys(character,['slug','name','uiPath','rarity','profession','element','style','portrait','skills'],'character');
   if(character.name!==approvedCharacterNames[index]||character.uiPath!=='正式剧情试用 → 角色界面 → 概览与技能')throw Error('Unreviewed character text or UI route');
   for(const [field,allowed]of Object.entries({rarity:['金色品质','紫色品质'],profession:['强袭','辅助'],element:['余烬','重构','创生'],style:['奇袭','技巧','策应']}))if(!allowed.includes(character[field]))throw Error('Unreviewed character facet '+field);
   if(character.portrait!=='assets/character-'+character.slug+'.png'||!Array.isArray(character.skills))throw Error('Unreviewed character artwork or skills');
   for(const skill of character.skills){keys(skill,['type','level','entries'],'skill group');if(!['普通攻击','特殊技','援护技','终结技','中枢心相'].includes(skill.type)||skill.level!==1||!Array.isArray(skill.entries))throw Error('Unreviewed skill type or level');for(const entry of skill.entries){keys(entry,['name','description'],'skill text');requiredText(entry.name,'skill name');requiredText(entry.description,'skill description');if(/[<>{}]|概率|几率/.test(entry.description))throw Error('Unrendered or excluded skill text');}}
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
export function requirePublishable(release,preview){if(!preview&&(release.status!=='verified'||release.publicationReview!=='approved'))throw Error('Deployment blocked: release boundary has not been verified.');}
export function build({preview=false,output=path.join(root,'dist')}={}){
 const publicData=JSON.parse(fs.readFileSync(path.join(root,'content/public.json'),'utf8'));
 const release=JSON.parse(fs.readFileSync(path.join(root,'content/release.json'),'utf8'));
 const gameBytes=fs.readFileSync(path.join(root,'content/game.json')),game=JSON.parse(gameBytes);
 validate(publicData,release,game,gameBytes);requirePublishable(release,preview);
 const approvedAssets={
   'character-he-yulian.png':'5ab61404df9dc973fc6a0c99360854446b01c1d6fc3a74499fafe18bcee4a1ff',
   'character-frieze.png':'733c5b4b1b3a7db29e8cdf1a968004ca4901631958f0dfe404a9f6883dfd92ea',
   'character-panacea.png':'be79f9b8459119d2e859455c51ccb7c1682a6cdc043eaf044336ca739eec9763',
   'logo.png':'e1637c8726bd86708e0b408937c1d04393277998fb05db477ef24d84fb454b71',
   'hero.jpg':'2874c7faea8e1adc7c3ca4c33217e261f4dd4b07abfdbb4b0a9ca9c0d24baabf',
   'favicon.png':'c409468e220d754c44910d6acf1d3a03edbd7efc08236f864468e957a1937092',
 };
 for(const [file,hash] of Object.entries(approvedAssets))if(digest(fs.readFileSync(path.join(root,'src/assets',file)))!==hash)throw Error('Unreviewed asset '+file);
 const fixedOutput=path.join(root,'dist');if(path.resolve(output)!==fixedOutput)throw Error('Output must be the repository dist directory');
 // Only the fixed repository dist folder is replaced; output uses an explicit file list.
 fs.rmSync(fixedOutput,{recursive:true,force:true});fs.mkdirSync(path.join(fixedOutput,'assets'),{recursive:true});
 for(const file of ['index.html','style.css','app.js','render.js','catalog.js'])fs.copyFileSync(path.join(root,'src',file),path.join(fixedOutput,file));
 for(const file of Object.keys(approvedAssets))fs.copyFileSync(path.join(root,'src/assets',file),path.join(fixedOutput,'assets',file));
 const source={key:'release-ui',title:'已核验客户端的游戏内物品详情',url:'#/version',evidence:'已解锁背包 → 顶部资源栏 → 资源详情。仅收录界面显示的名称、类型和说明。'};
 const records=game.entries.map(item=>({slug:item.slug,category:'资源货币',title:item.name,summary:item.description.split(/[。\n]/)[0]+'。',label:'游戏内 UI 资料',paragraphs:item.description.split('\n'),facts:[{label:'物品类型',value:item.type,source:'release-ui'},{label:'游戏内查看位置',value:item.uiPath,source:'release-ui'}],source:'release-ui'}));
 const characterSource={key:'release-story',title:'固定版本角色界面与正式剧情试用',url:'#/version',evidence:'固定版本正式剧情试用与角色界面：头像、品质标识、职业、属性、风格，以及对应试用等级的技能简述。'};
 const characterRecords=game.characters.map(c=>({slug:c.slug,category:'角色图鉴',title:c.name,summary:c.profession+' · '+c.element+' · '+c.style,label:'正式剧情试用角色',paragraphs:['本页按固定版本的正式剧情试用角色界面整理。'],facts:[{label:'稀有度',value:c.rarity,source:'release-story'},{label:'职业',value:c.profession,source:'release-story'},{label:'属性',value:c.element,source:'release-story'},{label:'风格',value:c.style,source:'release-story'}],character:{rarity:c.rarity,profession:c.profession,element:c.element,style:c.style,portrait:c.portrait,skills:c.skills},source:'release-story'}));
 const safe={checkedOn:publicData.checkedOn,sources:[...publicData.sources,source,characterSource],articles:[...characterRecords,...records,...publicData.articles],release:{status:release.status,version:release.version,boundaryDate:release.boundaryDate,reviewedOn:release.reviewedOn,scope:release.scope,gameEntryCount:game.entries.length+game.characters.length,itemCount:game.entries.length,characterCount:game.characters.length,allowedFieldCount:release.allowedFields.length}};
 fs.writeFileSync(path.join(fixedOutput,'data.js'),'export const '+Object.entries(safe).map(([k,v])=>k+' = '+JSON.stringify(v)).join(',\n')+';\n');
 fs.writeFileSync(path.join(fixedOutput,'.nojekyll'),'');
 fs.writeFileSync(path.join(fixedOutput,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\nSitemap: https://balatiger.github.io/Lumeng-Wiki/sitemap.xml\n');
 const html=fs.readFileSync(path.join(fixedOutput,'index.html'),'utf8');
 const rendered=html.replace('<body>','<body data-mode="'+(preview?'preview':'production')+'">').replace('<meta name="description"',preview?'<meta name="robots" content="noindex,nofollow"><meta name="description"':'<meta name="description"');
 const renderPage=createRenderer(safe);
 const pagePaths=['','characters','equipment','items','banners','catalog','version','policy',...safe.articles.map(a=>'article/'+a.slug)];
 const pageFiles=[];
 for(const route of pagePaths){
   const body=renderPage(new URL('/'+route,'https://local.invalid'));
   const title=body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g,'')||'首页';
   const canonical='https://balatiger.github.io/Lumeng-Wiki/'+(route?route+'/':'');
   const description=safe.articles.find(a=>'article/'+a.slug===route)?.summary||title+'。绿梦：时空之声 Wiki 固定版本资料与收录状态。';
   const page=rendered.replace('href="#main"','href="/Lumeng-Wiki/'+(route?route+'/':'')+'#main"').replace(/<meta name="description" content="[^"]*"/,'<meta name="description" content="'+description.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"').replace(/<title>.*?<\/title>/,'<title>'+title+' · 绿梦：时空之声 Wiki</title>').replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="'+canonical+'">').replace('<main id="main" tabindex="-1"></main>','<main id="main" tabindex="-1">'+body+'</main>');
   const file=(route?route+'/':'')+'index.html';fs.mkdirSync(path.dirname(path.join(fixedOutput,file)),{recursive:true});fs.writeFileSync(path.join(fixedOutput,file),page);pageFiles.push(file);
 }
 const notFound=rendered.replace('<main id="main" tabindex="-1"></main>','<main id="main" tabindex="-1">'+renderPage(new URL('/not-found','https://local.invalid'))+'</main>').replace('<meta name="description"','<meta name="robots" content="noindex,follow"><meta name="description"');
 fs.writeFileSync(path.join(fixedOutput,'404.html'),notFound);
 const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pagePaths.map(route=>'<url><loc>https://balatiger.github.io/Lumeng-Wiki/'+(route?route+'/':'')+'</loc></url>').join('')+'</urlset>\n';fs.writeFileSync(path.join(fixedOutput,'sitemap.xml'),sitemap);
 const files=[...pageFiles,'404.html','style.css','app.js','render.js','catalog.js','data.js','robots.txt','sitemap.xml','.nojekyll',...Object.keys(approvedAssets).map(file=>'assets/'+file)];
 const manifest=files.map(file=>({file,bytes:fs.statSync(path.join(fixedOutput,file)).size,sha256:digest(fs.readFileSync(path.join(fixedOutput,file)))}));
 fs.writeFileSync(path.join(fixedOutput,'build-manifest.json'),JSON.stringify({mode:preview?'preview':'production',files:manifest},null,2)+'\n');
 console.log('Built '+(preview?'LOCAL PREVIEW':'PRODUCTION')+': '+files.length+' explicit files; '+game.entries.length+' UI-reviewed currency records; '+game.characters.length+' reviewed character profiles (local review).');return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build({preview:process.argv.includes('--preview')});
