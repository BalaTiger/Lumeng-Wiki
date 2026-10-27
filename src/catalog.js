export const facets=[['rarity','稀有度'],['availability','限定类型'],['profession','职业'],['element','属性'],['style','风格']];
export function filterCharacters(characters,params){const query=(params.get('q')||'').trim().toLocaleLowerCase();return characters.filter(a=>(!query||a.title.toLocaleLowerCase().includes(query))&&facets.every(([key])=>{const selected=params.getAll(key);return !selected.length||!!a.character?.[key]&&selected.includes(a.character[key]);}));}
export function filterQuery(params,key,value){const next=new URLSearchParams(params);if(key==='all')return '';if(value===undefined)next.delete(key);else{const values=next.getAll(key).filter(x=>x!==value);next.delete(key);for(const x of values)next.append(key,x);}return next.toString();}
export function characterReturn(params){const raw=new URLSearchParams(params.get('list')||''),safe=new URLSearchParams();for(const key of ['q',...facets.map(x=>x[0])])for(const value of raw.getAll(key))if(value.length<=120)safe.append(key,value);return safe.toString();}

export function validReleaseDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function selectHomeCharacters(characters,{hasLimitedDistinction=false}={}){
 const eligible=characters.filter(a=>a.character.rarity==='S级'&&(!hasLimitedDistinction||a.character.availability==='限定'));
 if(eligible.length<=1)return {characters:eligible,orderConfirmed:eligible.every(a=>validReleaseDate(a.character.releasedOn))};
 if(eligible.some(a=>!validReleaseDate(a.character.releasedOn)))return {characters:[],orderConfirmed:false};
 const recent=(a,b)=>b.character.releasedOn.localeCompare(a.character.releasedOn)||(a.character.rarity===b.character.rarity?0:a.character.rarity==='S级'?-1:1)||a.slug.localeCompare(b.slug);
 const chosen=[...eligible].sort(recent).slice(0,3),newA=characters.filter(a=>a.character.rarity==='A级'&&validReleaseDate(a.character.releasedOn)).sort(recent)[0];
 if(newA&&newA.character.releasedOn>chosen.at(-1).character.releasedOn){chosen[chosen.length-1]=newA;chosen.splice(1,chosen.length-1,...chosen.slice(1).sort(recent));}
 return {characters:chosen,orderConfirmed:true};
}
