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
const approvedCharacters=["he-yulian","frieze","panacea","luoxi","lita","mofei","daliya","beiyi","shilin","lilang","ameng","haila","take","aiti","mata","litlisi"];
const approvedCharacterNames=["何雨莲","弗莉兹","潘娜西娅","洛夕","莉塔","摩菲","达里娅","贝伊","诗凛","璃琅","阿萌","海拉","塔可","艾提","玛塔","莉特莉丝"];
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
   if(!same(release.reviewedCharacters,approvedCharacters)||!same(release.characterFields,['name','rarity','profession','element','style','portrait','skills','outfits','skillLevels','destiny','calibration','attributeNames','attributeLevels','calibrationCosts','calibrationMaterials','calibrationStages','reviewStatus','detailStatus','art','cardArt','professionIcon','elementIcon','rarityIcon'])||!same(game.characters.map(x=>x.slug),approvedCharacters))throw Error('Unreviewed character entry or field');
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
   keys(character,['slug','name','uiPath','rarity','profession','element','style','portrait','skills','outfits','skillLevels','destiny','calibration','attributeNames','attributeLevels','calibrationCosts','calibrationMaterials','calibrationStages','reviewStatus','detailStatus','art','cardArt','professionIcon','elementIcon','rarityIcon'],'character');
   if(character.name!==approvedCharacterNames[index]||character.uiPath!=='正式服已确认角色详情')throw Error('Unreviewed character text or UI route');
   for(const [field,allowed]of Object.entries({rarity:['S级','A级'],profession:['强袭','攻坚','辅助'],element:['导能','蚀刻','余烬','重构','创生'],style:['猛击','闪击','奇袭','技巧','策应']}))if(!allowed.includes(character[field]))throw Error('Unreviewed character facet '+field);
   if(character.portrait!=='assets/characters/portraits/character-'+character.slug+'.png'||!Array.isArray(character.skills))throw Error('Unreviewed character artwork or skills');
   if(character.reviewStatus!=='approved'||!['mapped','identity-only'].includes(character.detailStatus)||character.art!=='assets/characters/illustrations/art-'+character.slug+'.webp'||character.cardArt!=='assets/characters/illustrations/art-'+character.slug+'-card.webp'||!/^assets\/badges\/profession-(assault|breaker|support)\.png$/.test(character.professionIcon)||!/^assets\/badges\/element-(conduction|corrosion|reconstruction|creation|ember)\.png$/.test(character.elementIcon))throw Error('Unreviewed candidate art or native logo');
   if(character.rarityIcon!==({'S级':'assets/badges/rank-s.png','A级':'assets/badges/rank-a.png'})[character.rarity])throw Error('Native rarity logo does not match grade');
   if(character.professionIcon!==({'强袭':'assets/badges/profession-assault.png','攻坚':'assets/badges/profession-breaker.png','辅助':'assets/badges/profession-support.png'})[character.profession]||character.elementIcon!==({'导能':'assets/badges/element-conduction.png','蚀刻':'assets/badges/element-corrosion.png','重构':'assets/badges/element-reconstruction.png','创生':'assets/badges/element-creation.png','余烬':'assets/badges/element-ember.png'})[character.element])throw Error('Native logo does not match displayed profession or element');
   if(character.detailStatus!=='mapped'||!Array.isArray(character.outfits)||!character.outfits.length)throw Error('Missing approved character detail');
   for(const outfit of character.outfits){keys(outfit,['name','description'],'outfit');requiredText(outfit.name,'outfit name');requiredText(outfit.description,'outfit description');if(/[<>{}]/.test(outfit.name+outfit.description))throw Error('Unrendered outfit text');}
   const displayText=(value,label)=>{requiredText(value,label);if(/[<>{}]|String Not Found/.test(value))throw Error('Unrendered display text '+label);};
   if(!Array.isArray(character.skillLevels)||character.skillLevels.length!==(character.slug==='shilin'?7:8))throw Error('Unreviewed skill display groups');
   for(const [groupIndex,group]of character.skillLevels.entries()){keys(group,['type','maxLevel','levels','icon'],'skill display group');if(!/^assets\/skills\/skill-[a-z-]+\.png$/.test(group.icon))throw Error('Unreviewed native skill icon');displayText(group.type,'skill group');if(![1,13].includes(group.maxLevel)||!Array.isArray(group.levels)||group.levels.length!==group.maxLevel)throw Error('Unreviewed skill level range');for(const [i,v]of group.levels.entries()){keys(v,['level','condition','entries'],'skill display level');if(v.level!==i+1)throw Error('Unreviewed skill level');displayText(v.condition,'level condition');if(!Array.isArray(v.entries)||v.entries.length>15)throw Error('Unreviewed skill entries');for(const x of v.entries){keys(x,['name','description','parameters'],'skill displayed message');displayText(x.name,'skill name');if(x.description)displayText(x.description,'skill description');if(!Array.isArray(x.parameters))throw Error('Unreviewed parameter display');for(const p of x.parameters){keys(p,['label','value'],'displayed parameter');displayText(p.label,'parameter label');displayText(p.value,'parameter value');}}}}
   if(!Array.isArray(character.destiny)||character.destiny.length!==8||!Array.isArray(character.calibration)||character.calibration.length!==9||!Array.isArray(character.attributeNames)||character.attributeNames.length!==19)throw Error('Unreviewed character detail count');
   for(const [i,d]of character.destiny.entries()){keys(d,['stage','name','description','condition'],'destiny display');if(d.stage!==i+1)throw Error('Unreviewed destiny stage');for(const f of ['name','description','condition'])displayText(d[f],f);}
   for(const n of character.calibration){keys(n,['name','property','increment','condition'],'calibration display');for(const f of ['name','property','increment','condition'])displayText(n[f],f);}
   for(const a of character.attributeNames){keys(a,['name','category'],'attribute display');displayText(a.name,'attribute name');displayText(a.category,'attribute category');}
   if(!Array.isArray(character.attributeLevels)||character.attributeLevels.length!==80||!Array.isArray(character.calibrationCosts)||character.calibrationCosts.length!==3||!Array.isArray(character.calibrationMaterials)||character.calibrationMaterials.length!==2||!Array.isArray(character.calibrationStages)||character.calibrationStages.length!==3)throw Error('Unreviewed conditional UI records');
   for(const [i,a]of character.attributeLevels.entries()){keys(a,['level','condition','values'],'attribute level');if(a.level!==i+1||!Array.isArray(a.values)||a.values.length!==5)throw Error('Unreviewed attribute level');displayText(a.condition,'attribute conditions');for(const v of a.values){keys(v,['name','value'],'attribute displayed value');displayText(v.name,'attribute name');displayText(v.value,'attribute value');}}
   for(const cost of character.calibrationCosts){keys(cost,['condition','amount'],'displayed calibration cost');displayText(cost.condition,'cost condition');displayText(cost.amount,'cost amount');}
   for(const material of character.calibrationMaterials)displayText(material,'material name');
   for(const [i,stage]of character.calibrationStages.entries()){keys(stage,['name','condition','effectName','effect','nodes'],'calibration stage');for(const f of ['name','condition','effectName','effect'])displayText(stage[f],f);if(!Array.isArray(stage.nodes)||stage.nodes.length!==(i+1)*3)throw Error('Unreviewed visible nodes');for(const n of stage.nodes){keys(n,['name','property','increment','maxLevel'],'calibration node');for(const f of ['name','property','increment'])displayText(n[f],f);if(![2,4,6,10].includes(n.maxLevel))throw Error('Unreviewed node level');}}
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
export function requirePublishable(release,preview,characters=[]){if(!preview&&characters.some(c=>c.reviewStatus==='candidate'))throw Error('Deployment blocked: candidate roster is local review only.');if(!preview&&(release.status!=='verified'||release.publicationReview!=='approved'))throw Error('Deployment blocked: release boundary has not been verified.');}
export function build({preview=false,output=path.join(root,'dist')}={}){
 const publicData=JSON.parse(fs.readFileSync(path.join(root,'content/public.json'),'utf8'));
 const release=JSON.parse(fs.readFileSync(path.join(root,'content/release.json'),'utf8'));
 const gameBytes=fs.readFileSync(path.join(root,'content/game.json')),game=JSON.parse(gameBytes);
 validate(publicData,release,game,gameBytes);requirePublishable(release,preview,game.characters);
 const collectionBytes=fs.readFileSync(path.join(root,'content/collections.json'));if(digest(collectionBytes)!=='3fb3f92a3a91bc1dcc6f1dd5112e2c266e411cee184f7eda7ef82c75c561d895')throw Error('Unreviewed collection content');const collections=JSON.parse(collectionBytes).records;
 const extraBytes=fs.readFileSync(path.join(root,'content/extra.json'));if(digest(extraBytes)!=='8af9bf71678c840103d88cc150e3dea8d6fa3c529d45c9089882bfb3835d5f83')throw Error('Unreviewed extra UI content');const extra=JSON.parse(extraBytes);
 const approvedAssets={
"banners/permanent-recruitment.webp":"d8f5ee58935a2cf8c456040c8bb9721a9d05b5584ad295efb4376ffd88fca1a6",
"banners/beginner-recording.webp":"fea031a2c6c56d02c93ab03d9e183de317bb5068f236571e5d1394c8b418023c",
"banners/thousand-transformations.webp":"0aa83b13627aee2614e9114caea4f0c915ab9354164615dd459a1d8127a409c4",
"injectors/injector-01.webp":"2621217458b50b409048911c48b0c246fc309490814a8508fa3dbd42c2f41f29",
"injectors/injector-02.webp":"5aa5379cddc106752f8875951cb43980ac7990ef1ca88835dabc1655813eee08",
"injectors/injector-03.webp":"3ed3bd730b17b1eb14d9122e2d211d0ee94991ba775f28fac153c2c50f60fe95",
"injectors/injector-04.webp":"5832bb6ed1e46b68144cb0cad3fbf411d87cd3cdb70531d5797cda5020f4d6bb",
"injectors/injector-05.webp":"44fa82a79c356e8e72b9430f398791e0d1eb9f6bb412ef47ad1f2d0d9275aace",
"injectors/injector-06.webp":"0ee9e498bbf1aeedf966467e9075cb239ac5a9698e3d26b17cb40ef112e9d18f",
"injectors/injector-07.webp":"55532f999e8ae0e1d845c3f0156dc4e14b38d9b35ccdbbc5b567d66e540cd876",
"maps/aurum-fortress.webp":"a6f0a540de44efb8b066193d12b25dd6b2d1fa56f08803dda7a0126f44142725",
"maps/inverness-crater.webp":"7f407dd86d82b54b2450e63f593adce633a6e8072d5fd5a6b88c67193756773e",
"maps/valkyrie-fortress.webp":"26f38bf4a3fb5a648048d543a59d57c5b698be28651e364efb0659188342f2af",
"maps/crater-depths.webp":"be7f19d8c6e51f6f0d06d77bf4635e07ed07b3baccfe6efee37d9bcd231ae7b8",
"maps/newt-base.webp":"4e137dcfe57f843716456cdbb448d2479bec6a37d2e202a2f26ad5774b4312d5",
"outfits/he-yulian-1.webp":"394d8f608036c48f52c5359a8b03c32daa565ec14ad2b175450c4b25845ed143",
"outfits/luoxi-1.webp":"5c994026ddd41cb793d221a95b9e4efd8bd80f44094ad6a1fea85e983161d193",
"outfits/litlisi-1.webp":"45f9b6df958bc9f66cd558c862ec5f20d2f3e0d27473401c3f9438794832d485",
"collections/equipment-001.png":"20838194064f760dc4d660ad3c85c6b93e74f08ef4382493bdcf44e0aac34a3a",
"collections/equipment-002.png":"76f53fa07e34b6628e12b76bf1148e1636bba32d364dc93f2edd2e5645915c85",
"collections/equipment-003.png":"850e278f5bc226dc3fb8897333ee3b7d84427eb5ae7b83269c637f373a3a73c6",
"collections/equipment-004.png":"785d07d75ed06ca3a7f66a654244d60e3d9183242e66dafa6c2a1518a5fbce32",
"collections/equipment-005.png":"6122f29a3b66ae7769a0386a88385da43281e4a0d278351b5175c70adfaa9e75",
"collections/equipment-006.png":"3cbf8759e04723ef786008707603a686cdcb57782918b5315687a7580f26901c",
"collections/equipment-007.png":"599645cf851008e637f31e1bf30d5b3f5cba11da25cf50f216c76a670bfa1261",
"collections/equipment-008.png":"62667083e41af533b66e49e7e3b63da0fd377afe056d48ebb016f7814b19c58d",
"collections/equipment-009.png":"878bb354d689d875b819fab24d406d22d68746068ff5cc7d1d8ba4b128b543e7",
"collections/equipment-010.png":"0f4397d8f7efc9fd8b766fc9ca4d44d795c2b91300aa8fda3cfb16a89d39944f",
"collections/equipment-011.png":"b5c134bf0fb3f37d291e74d937be0501b74763cf57bd8288fb9909c2ede0806a",
"collections/equipment-012.png":"82cb636fb58d56f00a30142960c7d6b339b174043243cdfc5de8ce7882b73ec1",
"collections/equipment-013.png":"9b548892080fad3e19d260a27be4ff3a8875930c890d597486bc0ddfe3b6197f",
"collections/equipment-014.png":"e0fb037cd071d387e1b52ea687c71c561842ba9f74f0d4b8c48b8cbbf9c84de8",
"collections/equipment-015.png":"b4bce0bf6ac88ecbdd5788ad8b67504c6953c36226c95d6739352249bb52f4ca",
"collections/equipment-016.png":"a8c7091bb33b93a79a6ae25a266d8cfbc78b0c7dcce0512668c2f1ee3fa50c94",
"collections/equipment-017.png":"f80174ab6be1ed5448c9fe77084b1c98da78d8030825e04ba75e146c259784bb",
"collections/equipment-018.png":"522a773f282a5ebc7a75fc0e177ccc1a5b682d95bcd955ad43a8275e7713b9fd",
"collections/equipment-019.png":"c531811127230e6f872154fa807ba279caf36eb09c610328e285259ee21e914d",
"collections/equipment-020.png":"4fea46c604aaa48c01f1237cbd0a047a6db6fd6e4e41c87b184bce3c09c0039d",
"collections/equipment-021.png":"784223d4524829ead7779cae933eb4771ebe411e7fdea6604509e5644d00b6d2",
"collections/equipment-022.png":"3138f3a4470f067db93d609c2736a784e4111f627447839dee7194064ff5017e",
"collections/equipment-023.png":"8c15ee4daec4c55570880be08fc6806ff2f6c64b3ba02b781474bd3796995923",
"collections/equipment-024.png":"29dfb36255fd70a3a6ab93c27f217228a2acd6810e5562c34b91f8a1c324a422",
"collections/equipment-025.png":"dc4c415c49419ecf69982633798474f3c9e164a24ebb8c78b652bbd413fae40d",
"collections/equipment-026.png":"416da70b3f7a448738225d8e727cdfebdd5cd96f578bc8a77a35174049b19cec",
"collections/equipment-027.png":"9a933ff8ea15078dd666b06b9866c016956bf845daa6406a6f707e8282bb0bc7",
"collections/equipment-028.png":"d4a52a0b3b4de3475bcf6cd58fd6e393ca49f08481078d2535edf06830c5b7a7",
"collections/equipment-029.png":"5097151c0716c32224f2202df279c4c5427117cc44458da3429597297b31741a",
"collections/equipment-030.png":"56be35d29eb98587ccdb297fa75b7d287f871c7c2cdfa9b0439fd212e5171901",
"collections/equipment-031.png":"ec69e8d42622b79649ee00faebcefd8e2cdb70fb30c39253e920ee4b87d233d0",
"collections/equipment-032.png":"32d72d2628188b87af830d29cf4c76f87d0f4c74e0a868ba2eed8baf8a89730d",
"collections/equipment-033.png":"9b566f610820a687bd23532c9b223a1e252c12772d34d30fdc9afd952caa04d5",
"collections/equipment-034.png":"df98ef8186c146dc0cea3b3544287412b224a47cc08323a6f67f67b749a3f6d0",
"collections/equipment-035.png":"82b6e735cd1f49120c6466532e285f1f075a09f7ec84220389ef51bd1a255702",
"collections/equipment-036.png":"4f9ada6f470ba3749125707ade35ad8e03d64d2e228395d6a0bd5bb2ae8f391a",
"collections/equipment-037.png":"2e4375adfb8cfaf16ffccb5263022bb278483bf62954118797d04e2707199a78",
"collections/equipment-038.png":"daeb558dd29e2b7f4a5efc819a9b4f722f072d62e5c0ca0f26bd63c93845bea5",
"collections/equipment-039.png":"3233f43bc21593326f0cf2725f83d40ac98b775be54e88c191be7d7d2ba96d5b",
"collections/equipment-040.png":"72f03bd8ee23179e8626ca5ecedc0f273885097520f3f732fe4f3d76e026374b",
"collections/equipment-041.png":"51043a44b611f3e18f102320dcc3f0ec37bcd6622c61e863f98b776258de22da",
"collections/equipment-042.png":"b2ce6497814bef4c81aeb0108de88ada688c50ea398bc682922bb18bfe669aeb",
"collections/equipment-043.png":"c2155f182f7d197aafa8d6bba9c70d849efa09a7f20177d2d883aa1b03a12336",
"collections/equipment-044.png":"0aff1d6c0766fe5b35c06d1fd8e787ce5ff1966d5beda1b687ba31ac8cc41bdb",
"collections/equipment-045.png":"361954d2ebbca856e5d9da08aac2c2b9bee0fa4963995fc2924cfb3142d0a7d7",
"collections/equipment-046.png":"ae628066f90b6b54739d6d518eb04cc39fb12d292b30394664f52daa34c3e74d",
"collections/equipment-047.png":"90f3c59d8f141283b52831951c6b2d011932d57cb3c57f93f2be534e6e22a77c",
"collections/equipment-048.png":"c9d5a1f59b0ae2058ee4d9409e9b29d84cfcfccee5d14a57ffd751085f165fb9",
"collections/equipment-049.png":"606d4884777f779a5326b7228bdf9186367f9eca10b51a48c6af8ee4d01cda9b",
"collections/equipment-050.png":"f07b172abc62656d3d6a6cb1e74994c724abe3a1081c1496566d00e0fec5e202",
"collections/equipment-051.png":"fdcc1385c2280ae29c747fbdf51060a3f5c7719206a933c492bf5a48a2463381",
"collections/equipment-052.png":"94aff6eedaa1325cd04ede362ddbfb714bac9d9a5f9c5b4f025907e406dfb638",
"collections/equipment-053.png":"5400e76664210dc8897ea5c1921fc132de14736b932254fec501eaef83ff7c4f",
"collections/equipment-054.png":"854a1a6ab45f6a6eb71c83e66d36d3bd70617138d16f27cc11e361592a7488b8",
"collections/equipment-055.png":"f4d9ab63184f2a098c12fded286d3e1aeb8021f16769c1d9aa5e220507721170",
"collections/equipment-056.png":"9922c7a8c8d116948f4db96f79b0c264c5aabb63f99da33d48a7b152b7942dc2",
"collections/equipment-057.png":"20838194064f760dc4d660ad3c85c6b93e74f08ef4382493bdcf44e0aac34a3a",
"collections/equipment-058.png":"76f53fa07e34b6628e12b76bf1148e1636bba32d364dc93f2edd2e5645915c85",
"collections/equipment-059.png":"850e278f5bc226dc3fb8897333ee3b7d84427eb5ae7b83269c637f373a3a73c6",
"collections/equipment-060.png":"785d07d75ed06ca3a7f66a654244d60e3d9183242e66dafa6c2a1518a5fbce32",
"collections/equipment-061.png":"6122f29a3b66ae7769a0386a88385da43281e4a0d278351b5175c70adfaa9e75",
"collections/equipment-062.png":"3cbf8759e04723ef786008707603a686cdcb57782918b5315687a7580f26901c",
"collections/equipment-063.png":"599645cf851008e637f31e1bf30d5b3f5cba11da25cf50f216c76a670bfa1261",
"collections/equipment-064.png":"62667083e41af533b66e49e7e3b63da0fd377afe056d48ebb016f7814b19c58d",
"collections/equipment-065.png":"878bb354d689d875b819fab24d406d22d68746068ff5cc7d1d8ba4b128b543e7",
"collections/equipment-066.png":"0f4397d8f7efc9fd8b766fc9ca4d44d795c2b91300aa8fda3cfb16a89d39944f",
"collections/equipment-067.png":"b5c134bf0fb3f37d291e74d937be0501b74763cf57bd8288fb9909c2ede0806a",
"collections/equipment-068.png":"82cb636fb58d56f00a30142960c7d6b339b174043243cdfc5de8ce7882b73ec1",
"collections/equipment-069.png":"9b548892080fad3e19d260a27be4ff3a8875930c890d597486bc0ddfe3b6197f",
"collections/equipment-070.png":"e0fb037cd071d387e1b52ea687c71c561842ba9f74f0d4b8c48b8cbbf9c84de8",
"collections/equipment-071.png":"b4bce0bf6ac88ecbdd5788ad8b67504c6953c36226c95d6739352249bb52f4ca",
"collections/equipment-072.png":"a8c7091bb33b93a79a6ae25a266d8cfbc78b0c7dcce0512668c2f1ee3fa50c94",
"collections/equipment-073.png":"f80174ab6be1ed5448c9fe77084b1c98da78d8030825e04ba75e146c259784bb",
"collections/equipment-074.png":"522a773f282a5ebc7a75fc0e177ccc1a5b682d95bcd955ad43a8275e7713b9fd",
"collections/equipment-075.png":"c531811127230e6f872154fa807ba279caf36eb09c610328e285259ee21e914d",
"collections/equipment-076.png":"4fea46c604aaa48c01f1237cbd0a047a6db6fd6e4e41c87b184bce3c09c0039d",
"collections/equipment-077.png":"784223d4524829ead7779cae933eb4771ebe411e7fdea6604509e5644d00b6d2",
"collections/equipment-078.png":"3138f3a4470f067db93d609c2736a784e4111f627447839dee7194064ff5017e",
"collections/equipment-079.png":"8c15ee4daec4c55570880be08fc6806ff2f6c64b3ba02b781474bd3796995923",
"collections/equipment-080.png":"29dfb36255fd70a3a6ab93c27f217228a2acd6810e5562c34b91f8a1c324a422",
"collections/equipment-081.png":"dc4c415c49419ecf69982633798474f3c9e164a24ebb8c78b652bbd413fae40d",
"collections/equipment-082.png":"416da70b3f7a448738225d8e727cdfebdd5cd96f578bc8a77a35174049b19cec",
"collections/equipment-083.png":"9a933ff8ea15078dd666b06b9866c016956bf845daa6406a6f707e8282bb0bc7",
"collections/equipment-084.png":"d4a52a0b3b4de3475bcf6cd58fd6e393ca49f08481078d2535edf06830c5b7a7",
"collections/equipment-085.png":"5097151c0716c32224f2202df279c4c5427117cc44458da3429597297b31741a",
"collections/equipment-086.png":"56be35d29eb98587ccdb297fa75b7d287f871c7c2cdfa9b0439fd212e5171901",
"collections/equipment-087.png":"ec69e8d42622b79649ee00faebcefd8e2cdb70fb30c39253e920ee4b87d233d0",
"collections/equipment-088.png":"32d72d2628188b87af830d29cf4c76f87d0f4c74e0a868ba2eed8baf8a89730d",
"collections/equipment-089.png":"9b566f610820a687bd23532c9b223a1e252c12772d34d30fdc9afd952caa04d5",
"collections/equipment-090.png":"df98ef8186c146dc0cea3b3544287412b224a47cc08323a6f67f67b749a3f6d0",
"collections/equipment-091.png":"82b6e735cd1f49120c6466532e285f1f075a09f7ec84220389ef51bd1a255702",
"collections/equipment-092.png":"4f9ada6f470ba3749125707ade35ad8e03d64d2e228395d6a0bd5bb2ae8f391a",
"collections/equipment-093.png":"2e4375adfb8cfaf16ffccb5263022bb278483bf62954118797d04e2707199a78",
"collections/equipment-094.png":"daeb558dd29e2b7f4a5efc819a9b4f722f072d62e5c0ca0f26bd63c93845bea5",
"collections/equipment-095.png":"3233f43bc21593326f0cf2725f83d40ac98b775be54e88c191be7d7d2ba96d5b",
"collections/equipment-096.png":"72f03bd8ee23179e8626ca5ecedc0f273885097520f3f732fe4f3d76e026374b",
"collections/equipment-097.png":"51043a44b611f3e18f102320dcc3f0ec37bcd6622c61e863f98b776258de22da",
"collections/equipment-098.png":"b2ce6497814bef4c81aeb0108de88ada688c50ea398bc682922bb18bfe669aeb",
"collections/equipment-099.png":"c2155f182f7d197aafa8d6bba9c70d849efa09a7f20177d2d883aa1b03a12336",
"collections/equipment-100.png":"0aff1d6c0766fe5b35c06d1fd8e787ce5ff1966d5beda1b687ba31ac8cc41bdb",
"collections/equipment-101.png":"361954d2ebbca856e5d9da08aac2c2b9bee0fa4963995fc2924cfb3142d0a7d7",
"collections/equipment-102.png":"ae628066f90b6b54739d6d518eb04cc39fb12d292b30394664f52daa34c3e74d",
"collections/equipment-103.png":"90f3c59d8f141283b52831951c6b2d011932d57cb3c57f93f2be534e6e22a77c",
"collections/equipment-104.png":"c9d5a1f59b0ae2058ee4d9409e9b29d84cfcfccee5d14a57ffd751085f165fb9",
"collections/equipment-105.png":"606d4884777f779a5326b7228bdf9186367f9eca10b51a48c6af8ee4d01cda9b",
"collections/equipment-106.png":"f07b172abc62656d3d6a6cb1e74994c724abe3a1081c1496566d00e0fec5e202",
"collections/equipment-107.png":"fdcc1385c2280ae29c747fbdf51060a3f5c7719206a933c492bf5a48a2463381",
"collections/equipment-108.png":"94aff6eedaa1325cd04ede362ddbfb714bac9d9a5f9c5b4f025907e406dfb638",
"collections/equipment-109.png":"5400e76664210dc8897ea5c1921fc132de14736b932254fec501eaef83ff7c4f",
"collections/equipment-110.png":"854a1a6ab45f6a6eb71c83e66d36d3bd70617138d16f27cc11e361592a7488b8",
"collections/equipment-111.png":"f4d9ab63184f2a098c12fded286d3e1aeb8021f16769c1d9aa5e220507721170",
"collections/equipment-112.png":"9922c7a8c8d116948f4db96f79b0c264c5aabb63f99da33d48a7b152b7942dc2",
"collections/equipment-113.png":"6f54c7fc735906337b9c610d399aad45fb0d8445d86d302f2cbdc7e55f63c17b",
"collections/equipment-114.png":"e673c625a69e7cf565334fc2f6b60e829bac07d54c3968ea85f86950c9711cd1",
"collections/equipment-115.png":"4342ae0bcf957c4fad260a2cb1690f9e25724cb38281616315178f44ae515eea",
"collections/equipment-116.png":"4342ae0bcf957c4fad260a2cb1690f9e25724cb38281616315178f44ae515eea",
"collections/equipment-117.png":"5583a385992b2d5abdd93cedabaa4918eaa65905c13a9297e29eea88f02b0bf0",
"collections/equipment-118.png":"130b1c2bafd7b271b98095755c1d6f244461ff95b073f9b36135bf8ddb90cedf",
"collections/equipment-119.png":"c5e967f36fc331aa7f061350fb7696a752b395797ae922a0b4fa2fd9266d10ea",
"collections/equipment-120.png":"ed430593a2b916b74d58f904fc2d124d90f1ea197d9b110af1b1edd255b5bec4",
"collections/equipment-121.png":"e335e0e5de5273154b5ce70909b45768ccb19e959f36e1207bb55b3f381f5afe",
"collections/equipment-122.png":"b4709b4c00350af38205de621a51a482efc9b085f084bcefc03c3a9dd49d0ae7",
"collections/equipment-123.png":"d57fff7a8022a48fd31c7cf3fe4c2d3e3982deb87ead73a71fd6f066b4c378d0",
"collections/equipment-124.png":"b801d9409368616c4508dbb1fc2be0a5e63343522814cef9f0b466dd51325ed1",
"collections/item-125.png":"a3f04e4d1dabfabdb0a53d160ac1de126b8ae5b466a8ecb86a5aeb708be4aaf7",
"collections/item-126.png":"c77a22014038e6c98eb5aca29559bef92349a2a6b6fc4b10287c6ba8993b4d80",
"collections/item-127.png":"7645ff10747680c5a0eaec8c83025d18bb5179b498ab453777d607cd664f99bd",
"collections/item-128.png":"1ed443e55b1d735f35da3432d70d559caca10086e972f1f602734c3e96962ad9",
"collections/item-129.png":"5ef496b170c3f137a227835f53205f262250295b55bbe74a81371f9ff9807072",
"collections/item-130.png":"2cdb1d4c64979e24d558afee8cd69995de8fd28ed81342e381d11c1a3138c977",
"collections/item-131.png":"7d323242909ace621174d4e56af615b2f0ad0f8dfbd7231acbe0256c3f7efc2e",
"collections/item-132.png":"f684e4e9f9bc0fcd615335a681c6bcfed5094c5d0a9bba1bacfa96dc3cf0b03a",
"collections/item-133.png":"e0a88f93129645c4c6c91a3f26a172f00c83a27966b6bd001ac091e60b519322",
"collections/item-134.png":"32eaab965eff04247b83665f41fa267a9f7eed3b8d66083a3d2128324fa64550",
"collections/item-135.png":"ab2df2c12f7df35a4b58dae9a0ba4c593e63aa396942ce4dba9d2d1e4427c393",
"collections/item-136.png":"d277ac33b14935f28b3e905f8c4df0f8d0b730f1349f9d5c2f96e9996359af6c",
"collections/item-137.png":"739c577bcdbccd2e86365ffde35f4f08bdc9c27e8f53c0758f2d12717cbb8da6",
"collections/item-138.png":"6c25373ec6cee04b97d5a4816660634de30469d3fc27c130fb81eb9f6815c3b6",
"collections/item-139.png":"3affe98cbbbd6c44cf7a3d0050d3087a140b88a61c0094324b880a426c0cbd5e",
"collections/item-140.png":"7d225fd8cd27478a233224bcdc91c4cc082d3694aafebe1d846fbabbc724a0e7",
"collections/item-141.png":"5d0cd85658c8604828133f72c82434abdf6b4e4fe51e7ad7e3e51de6039ee86e",
"collections/item-142.png":"36424a3240567dfb4ce4897e76eef97254204cda1e6730a585bc378fcd14fa71",
"collections/item-143.png":"53b40436ece70f3cc5140a4a31598e695d1d622bb036c3871a10642f061b05cb",
"collections/item-144.png":"7658c54ab0b176eceefea5d982c9e37fb00e7856197ff1fec012eb756f7c840c",
"collections/item-145.png":"9f8c29c37ae8a0fdacfd9d7bdbbe033e7c97ed8007430e478722c20f6d52007f",
"collections/item-146.png":"6671987abb8c6c48acd1cbb7bf86cee62f15f6728bcfded01b1c4329b94552f5",
"collections/item-147.png":"da6513c26082d567a47c80aaf526858d4c158b02bf993cde7b7e486aea0d044a",
"collections/item-148.png":"1f2e49ed7358aed09ae82ac6b681a5cb2677e973afc3cf2cc31a799dece5f827",
"collections/item-149.png":"710a503730b92b20593540e472a2be3fb2ad60ec9e5b006daa6342a0d6ba2809",
"collections/item-150.png":"786a596fb03257b81625b753f19840c6b4cc84b9127f5003126475e5332361a2",
"collections/item-151.png":"8abd955216c1efb9dc656c8d48e65855a53b5dc17d14069fad425850cb3724a1",
"collections/item-152.png":"68f86e894ef5b1b145b6fc9c4deb3e4204315b25eb9ff10015335ca3f3415763",
"collections/item-153.png":"0c3b7ddfd2441619b1dbe689dce9e1875003ec79d137d0878c4706c5e63b8b35",
  "characters/portraits/character-he-yulian.png": "5ab61404df9dc973fc6a0c99360854446b01c1d6fc3a74499fafe18bcee4a1ff",
  "characters/portraits/character-frieze.png": "733c5b4b1b3a7db29e8cdf1a968004ca4901631958f0dfe404a9f6883dfd92ea",
  "characters/portraits/character-panacea.png": "be79f9b8459119d2e859455c51ccb7c1682a6cdc043eaf044336ca739eec9763",
  "brand/logo.png": "e1637c8726bd86708e0b408937c1d04393277998fb05db477ef24d84fb454b71",
  "backgrounds/hero.jpg": "2874c7faea8e1adc7c3ca4c33217e261f4dd4b07abfdbb4b0a9ca9c0d24baabf",
  "brand/favicon.png": "c409468e220d754c44910d6acf1d3a03edbd7efc08236f864468e957a1937092",
  "characters/portraits/character-luoxi.png": "9ecc8aa5d6620035cb69aec09f4a0b479d364dcb03adae1d631d15abbeb4a652",
  "characters/portraits/character-lita.png": "dc6d3e54b64eac50fb23684d58da550a61996ca4ee1a6cf0faee757513aed62b",
  "characters/portraits/character-mofei.png": "47a1e7513679a9203de78bba684b2429490f944cf92ab1d94962a2a5d3309c30",
  "characters/portraits/character-daliya.png": "c6264e2ac6a7e49429767e443a9550dfb9377fc175d47671cc26e9015ebd77f1",
  "characters/portraits/character-beiyi.png": "1d52ab10dadcae0c378b6fa5fdf8d1fa53425e506ce331164bc00f9d11bf7801",
  "characters/portraits/character-shilin.png": "f6c7edc062d1b949138882181aa4eccaaab9bb24acdc2d32767d7a7c9993b4da",
  "characters/portraits/character-lilang.png": "3f24c2ac3aace8a5917e8457f1b28648254a5cf4666867c8d27c07590bb0c17d",
  "characters/portraits/character-ameng.png": "d9db13073053d494cdf7dc0bd554a447759c212576fb2f7ad384dc2cdbf042fe",
  "characters/portraits/character-haila.png": "c26771173cc109ba9222a4f7b0c49cb2e74a9d1d7e6343c15fe4a1edbe89f68d",
  "characters/portraits/character-take.png": "68c4c6313370967e6b909705717be3a3893e0e9b310a4307f3137b6d4624fde1",
  "characters/portraits/character-aiti.png": "098beac83115145d2c9f1e6ad545e4021d5ecb780fed91e6fd4b2c6f94c192dc",
  "characters/portraits/character-mata.png": "2074db71cb09de38f5cd7b77617a0e8d230f4b23ebd0fa3811a554b138d63331",
  "characters/portraits/character-litlisi.png": "a5c1197bd4c1e4c616c76e551bc002d356e31b1e44d7d85f8d9a4e7eb90b29ff",
  "characters/illustrations/art-luoxi.webp": "de728fa96f59b1c7084b2681e17705e8858b8c8c346ee02775b10221c63d2bb4",
  "characters/illustrations/art-luoxi-card.webp": "5d10bde9ce665351105414b93b6d839beb7acb02c795a34c78f14b77e50725c4",
  "characters/illustrations/art-lita.webp": "77618f35c4497bc52b7b516b1d5c0a38df329e26450793286941fcd96cbf2133",
  "characters/illustrations/art-lita-card.webp": "b2b37d3f015eb839baff6d74255100c7254fe43dfd5838eaf505179ac894ee21",
  "characters/illustrations/art-mofei.webp": "fd26c884f250335122138310ebd73d3b86d18110e427f36df9d5306f9242bf0d",
  "characters/illustrations/art-mofei-card.webp": "9dc764e56c422035e5012eb83a91951e56576effa4b8ba7502136524b984ff63",
  "characters/illustrations/art-daliya.webp": "1ce53f0cae929466f3c229428155eae02928e51af80159b9a9b4d867e6e04aa2",
  "characters/illustrations/art-daliya-card.webp": "d1230715adba35cee4fdf52108c8e0bc2d8fce951998fe47164494364493e003",
  "characters/illustrations/art-frieze.webp": "dab47af8bbce0ef269f33eb5cb0dcf280eab72ff5798707c07a71ae90b2f3c89",
  "characters/illustrations/art-frieze-card.webp": "5198c8b2787d42e5cd1eb00050dd4e1ede272374874b3dc8a042888bfd5a4ed5",
  "characters/illustrations/art-beiyi.webp": "103bd06c363ebd6d5a2ce99a26e12d2a63b139304498e10854a5bbdebca325d6",
  "characters/illustrations/art-beiyi-card.webp": "ef63a028b3cb077fbe24e1d4de5e9e07ec2d76e5e72bf0981c76b25e55f715b7",
  "characters/illustrations/art-shilin.webp": "0eec1734a8243d3984a496693911ccda7e5c8c2f2b5243f6419190033088ad24",
  "characters/illustrations/art-shilin-card.webp": "09c2f80d9eea614bd7578b470008c31aa63986ece34a7c253131fa083c5bdb1c",
  "characters/illustrations/art-panacea.webp": "b56d3489b0cfbf3a2052393249b25e8f178fea4847217fa304ac85532a5787fd",
  "characters/illustrations/art-panacea-card.webp": "e04a0d4ba9ba4ba4822d72c793bc7b8c00acb0f7ef1cb3e01091dc59d6fe5548",
  "characters/illustrations/art-lilang.webp": "4e712032936e3ea6b4b54ebe7ea03dd38a23258af8cfcf373f18a7d362364f7e",
  "characters/illustrations/art-lilang-card.webp": "f38a4c0014259b65d0c80dbfa4fb688c94e91ad9eff2774a5d56e5a27ebef837",
  "characters/illustrations/art-ameng.webp": "8bf60eb7b6180f9f66695f60e3ac8cceaa6edd19e24d882eacb9b526863c7b61",
  "characters/illustrations/art-ameng-card.webp": "cff9d6642ab97de7f03a198c27385a743d5268732955a10c2fd1d104d2fbc3b2",
  "characters/illustrations/art-haila.webp": "4ed1efa6c763d2ee8e95f836cb72a274f26f4b99c778a45cf0c9722ee32ec1c6",
  "characters/illustrations/art-haila-card.webp": "8e42e9467ecfd1f78caf3ef219c9520a906df4697e069ebe70662669f543fa5f",
  "characters/illustrations/art-take.webp": "c28f90394c339d2f968f5574b628f23bd3308210eb3a92e85d1dfe535cb2571b",
  "characters/illustrations/art-take-card.webp": "4384c03b7c72577cee32dc19ee9b534ba9770fa2ab87eb05cb93ecf5e34bb556",
  "characters/illustrations/art-aiti.webp": "2653bdb87c1d4e81d2a25c243b82c78b72402ce35b2cb5d21d3ed170877db1be",
  "characters/illustrations/art-aiti-card.webp": "2965050208d7325ce6da8629e08fa5a1fcd12ee969811d315759ba1e1b436155",
  "characters/illustrations/art-mata.webp": "88769718bea02df18369543cf852c8f2c1931c25d9f50b3943346424a217cf68",
  "characters/illustrations/art-mata-card.webp": "0290d8403dc78e11e006f75bb12b241ccff661cf2bdf990f98784577b12cf083",
  "characters/illustrations/art-litlisi.webp": "9ee36fb7adc4dc9848f1554199764cd81e8cbee226adc98bf50a5359495e4ccb",
  "characters/illustrations/art-litlisi-card.webp": "850ed02fbfdfd026534fcb3620fb786d1b9b56e28f5fc5ff9feb64c4c590ba7d",
  "characters/illustrations/art-he-yulian.webp": "b0ebafceb79e436429e7e024e1bb83c3f048569afc37df477e6910fd904f14ec",
  "characters/illustrations/art-he-yulian-card.webp": "35993cf17527748bc8c08a7e7b7e72ea27eae2d41ef6eb06023e53218f8139b5",
  "badges/element-conduction.png": "dc4b085f6009907ee85e847eb150e8862957abbd81324b4ec6425d183fb8302a",
  "badges/element-corrosion.png": "8b8cd796332a1c074fc7fa7fc18bcf5db7a35ac66b039cbe4143f5fc2823b728",
  "badges/element-reconstruction.png": "509f8bc2e70e4e71c38b87703345cfb77674759a5663b5edf855a2c6584a643d",
  "badges/element-creation.png": "1e20b971d749155b1c204381e1d80235123818eae6fe834e2a67d9ba6a4afc5d",
  "badges/element-ember.png": "315d73fcb4f421ea6f959a13b7ef20b1226d96e3b5b0b5d01e3bc0b8f7ad295d",
  "badges/profession-assault.png": "90858b096fdcbaf9563a5d314b05eda4cf4769d990c300e78fc69d7432a2a78e",
  "badges/profession-breaker.png": "438a901aaa32e846d74f0bb68c17ff277d653e457d24ccb5679cd4599a522f1f",
  "badges/profession-support.png": "bae79e14bde8d562a456675254211755a3f5d00c3ccdcbbe96dd1ca1efd2c252",
  "skills/skill-derived-two.png": "da651f533f3bafa67266144cfddf11b63ca7f1499420a328fe07a03927269f07",
  "skills/skill-core.png": "8cdee2efb4900c0762d12c716ce754ff73acf76c807602c1bee4586015a760f9",
  "skills/skill-derived-one.png": "5e7792426b553867c579656a7e46898def48188120857262018b37bdbb723c73",
  "skills/skill-normal.png": "ffb09a457377bdb5600384d4dd12e6a0f27d2dbce8bff21ca66152bec9afc7b0",
  "skills/skill-ultimate.png": "e118eb4bca27c9d7dca56058741f8edde4390608d31aa05fe5c29a5ba962850f",
  "skills/skill-special.png": "663d337fa30d55b634d1163bb8a58afd65c2b3667707c581263d636375df8bb4",
  "skills/skill-assist.png": "5bb78da9fc97121991707d8eed1345546248d0ce5e53c355822bc5b36de8e79b",
  "skills/skill-derived-three.png": "7549a4a161aa8cc5dbe22be2347aebbd7adaf8d273d013f1e3e6c0afb4aee602",
  "backgrounds/character-result-a.png": "98bf76062c41931cfe6d6764a5ae86b6a8fbc8a9b7252db993f7751ac7d68cc1",
  "badges/rank-a.png": "cc2d88363b1e1b46ccc659258fe23cf128c177345def652d6e8c1d26e5f831c6",
  "badges/rank-s.png": "0f80eea9a251ed97f389c958ebd896ac11bc507dee604338b15ebbf024b38851",
  "backgrounds/gacha-bg-a.webp": "df12291fa39a5eba2c6b9b839f9b4af37e270e023597a0e08b2bf5617c53bbe2",
  "backgrounds/gacha-bg-s.webp": "ab7214c3c29c84013fec863badd6417b5db49a41e69c34933f88412e07165ffd"
};
 for(const [file,hash] of Object.entries(approvedAssets))if(digest(fs.readFileSync(path.join(root,'src/assets',file)))!==hash)throw Error('Unreviewed asset '+file);
 const fixedOutput=path.join(root,'dist');if(path.resolve(output)!==fixedOutput)throw Error('Output must be the repository dist directory');
 // Only the fixed repository dist folder is replaced; output uses an explicit file list.
 fs.rmSync(fixedOutput,{recursive:true,force:true});fs.mkdirSync(path.join(fixedOutput,'assets'),{recursive:true});
 for(const file of ['index.html','style.css','app.js','render.js','catalog.js','collections.js','extra.js','hero-backgrounds.js'])fs.copyFileSync(path.join(root,'src',file),path.join(fixedOutput,file));
 for(const file of Object.keys(approvedAssets)){fs.mkdirSync(path.dirname(path.join(fixedOutput,'assets',file)),{recursive:true});fs.copyFileSync(path.join(root,'src/assets',file),path.join(fixedOutput,'assets',file));}
 const source={key:'release-ui',title:'已核验客户端的游戏内物品详情',url:'#/version',evidence:'已解锁背包 → 顶部资源栏 → 资源详情。仅收录界面显示的名称、类型和说明。'};
 const legacyCurrencyRecords=game.entries.map(item=>({slug:item.slug,category:'资源货币',title:item.name,summary:item.description.split(/[。\n]/)[0]+'。',label:'游戏内 UI 资料',paragraphs:item.description.split('\n'),facts:[{label:'物品类型',value:item.type,source:'release-ui'},{label:'游戏内查看位置',value:item.uiPath,source:'release-ui'}],source:'release-ui'}));
 const records=collections.map(c=>({slug:c.slug,title:c.name,category:c.kind==='equipment'?'装备图鉴':'道具图鉴',summary:c.description.split(/[。\n]/)[0],label:'资料',paragraphs:[c.description],facts:[{label:'类型',value:c.type,source:'release-ui'},{label:'品质',value:c.quality+'级',source:'release-ui'}],source:'release-ui',collection:c}));
 const extraRecords=[...extra.injectors,...extra.maps].map(c=>({slug:c.slug,title:c.name,category:c.kind==='map'?'地图一览':'注射器一览',summary:c.description,paragraphs:[c.description],facts:[],source:'release-ui',label:'资料',collection:c})).concat(extra.banners.map(b=>({slug:'banner-'+b.slug,title:b.name,category:'卡池档案',summary:b.type,paragraphs:[b.description],facts:[],source:'release-ui',label:'刻录规则',banner:b})));
 const characterSource={key:'release-story',title:'固定版本2D角色图与UI分类·正式角色审阅',url:'#/version',evidence:'16人正式服可获取名单由玩家确认；显示字段与图片均固定发布版本。'};
 const characterRecords=game.characters.map(c=>({slug:c.slug,category:'角色图鉴',title:c.name,summary:c.profession+' · '+c.element+' · '+c.style,label:'角色资料',paragraphs:['正式服角色资料，字段按正常UI显示范围收录。'],facts:[{label:'稀有度',value:c.rarity,source:'release-story'},{label:'职业',value:c.profession,source:'release-story'},{label:'属性',value:c.element,source:'release-story'},{label:'风格',value:c.style,source:'release-story'}],character:{reviewStatus:c.reviewStatus,detailStatus:c.detailStatus,art:c.art,cardArt:c.cardArt,professionIcon:c.professionIcon,elementIcon:c.elementIcon,rarityIcon:c.rarityIcon,rarity:c.rarity,profession:c.profession,element:c.element,style:c.style,portrait:c.portrait,skillLevels:c.skillLevels,destiny:c.destiny,calibration:c.calibration,attributeNames:c.attributeNames,attributeLevels:c.attributeLevels,calibrationCosts:c.calibrationCosts,calibrationMaterials:c.calibrationMaterials,calibrationStages:c.calibrationStages,outfits:c.outfits},source:'release-story'}));
 const safe={extra,checkedOn:publicData.checkedOn,sources:[...publicData.sources,source,characterSource],articles:[...characterRecords,...records,...extraRecords,...publicData.articles],release:{status:release.status,version:release.version,boundaryDate:release.boundaryDate,reviewedOn:release.reviewedOn,scope:release.scope,gameEntryCount:collections.length+game.characters.length,itemCount:collections.filter(c=>c.kind==='item').length,characterCount:game.characters.length,allowedFieldCount:release.allowedFields.length}};
 fs.writeFileSync(path.join(fixedOutput,'data.js'),'export const '+Object.entries(safe).map(([k,v])=>k+' = '+JSON.stringify(v)).join(',\n')+';\n');
 fs.writeFileSync(path.join(fixedOutput,'.nojekyll'),'');
 fs.writeFileSync(path.join(fixedOutput,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\nSitemap: https://lvmengwiki.top/sitemap.xml\n');
 const siteBase=preview?'/Lumeng-Wiki/':'/',siteOrigin=preview?'https://balatiger.github.io':'https://lvmengwiki.top';
 const html=fs.readFileSync(path.join(fixedOutput,'index.html'),'utf8').replaceAll('/Lumeng-Wiki/',siteBase);
 const rendered=html.replace('<body>','<body data-mode="'+(preview?'preview':'production')+'">').replace('<meta name="description"',preview?'<meta name="robots" content="noindex,nofollow"><meta name="description"':'<meta name="description"');
 const renderPage=createRenderer(safe,siteBase);
 const pagePaths=['','characters','equipment','items','injectors','maps','banners','catalog','version','policy',...safe.articles.map(a=>'article/'+a.slug)];
 const pageFiles=[];
 for(const route of pagePaths){
   const body=renderPage(new URL('/'+route,'https://local.invalid'));
   const title=body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g,'')||'首页';
   const canonical=siteOrigin+siteBase+(route?route+'/':'');
   const description=safe.articles.find(a=>'article/'+a.slug===route)?.summary||title+'。绿梦：时空之声 Wiki，角色、装备与道具资料查询。';
   const page=rendered.replace('href="#main"','href="'+siteBase+(route?route+'/':'')+'#main"').replace(/<meta name="description" content="[^"]*"/,'<meta name="description" content="'+description.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"').replace(/<title>.*?<\/title>/,'<title>'+title+' · 绿梦：时空之声 Wiki</title>').replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="'+canonical+'">').replace('<main id="main" tabindex="-1"></main>','<main id="main" tabindex="-1">'+body+'</main>');
   const file=(route?route+'/':'')+'index.html';fs.mkdirSync(path.dirname(path.join(fixedOutput,file)),{recursive:true});fs.writeFileSync(path.join(fixedOutput,file),page);pageFiles.push(file);
 }
 const notFound=rendered.replace('<main id="main" tabindex="-1"></main>','<main id="main" tabindex="-1">'+renderPage(new URL('/not-found','https://local.invalid'))+'</main>').replace('<meta name="description"','<meta name="robots" content="noindex,follow"><meta name="description"');
 fs.writeFileSync(path.join(fixedOutput,'404.html'),notFound);
 const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pagePaths.map(route=>'<url><loc>'+siteOrigin+siteBase+(route?route+'/':'')+'</loc></url>').join('')+'</urlset>\n';fs.writeFileSync(path.join(fixedOutput,'sitemap.xml'),sitemap);
 const files=[...pageFiles,'404.html','style.css','app.js','render.js','catalog.js','collections.js','extra.js','hero-backgrounds.js','data.js','robots.txt','sitemap.xml','.nojekyll',...Object.keys(approvedAssets).map(file=>'assets/'+file)];
 const manifest=files.map(file=>({file,bytes:fs.statSync(path.join(fixedOutput,file)).size,sha256:digest(fs.readFileSync(path.join(fixedOutput,file)))}));
 fs.writeFileSync(path.join(fixedOutput,'build-manifest.json'),JSON.stringify({mode:preview?'preview':'production',files:manifest},null,2)+'\n');
 console.log('Built '+(preview?'LOCAL PREVIEW':'PRODUCTION')+': '+files.length+' explicit files; '+game.entries.length+' UI-reviewed currency records; '+game.characters.length+' approved character profiles.');return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build({preview:process.argv.includes('--preview')});
