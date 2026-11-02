const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function acquisitionSection(sources=[],base='/',level=2,articles=[]){if(!sources.length)return '';const names=articles.filter(a=>a.collection?.kind==='item').map(a=>({name:a.title||a.collection.name,href:'article/'+a.slug+'/'})).sort((a,b)=>b.name.length-a.name.length);const rich=text=>{let html='',position=0;while(position<text.length){const found=names.find(n=>text.startsWith(n.name,position));if(found){html+='<a href="'+e(base+found.href)+'">'+e(found.name)+'</a>';position+=found.name.length;}else html+=e(text[position++]);}return html;};const link=(text,href)=>href?'<a href="'+e(base+href)+'">'+e(text)+'</a>':rich(text);return '<section class="acquisition-section"><h'+level+'>获取途径</h'+level+'><ul>'+groupBannerSources(sources).map(source=>source.banners?'<li><strong>卡池刻录</strong><ul class="acquisition-banners">'+source.banners.map(b=>'<li>'+link(b.name,b.href)+(b.condition?'：'+rich(b.condition):'')+'</li>').join('')+'</ul></li>':'<li><strong>'+link(source.name,source.href)+'</strong>'+(source.condition?'<p>'+rich(source.condition)+'</p>':'')+(source.costs.length?'<p class="source-cost">消耗：'+source.costs.map(cost=>link(cost.name,cost.href)+' × '+e(cost.count)).join('、')+'</p>':'')+'</li>').join('')+'</ul></section>';}

export function groupBannerSources(sources){
 const banners=new Map(),rows=[];
 for(const source of sources){
  if(!/^article\/banner-[a-z0-9-]+\/$/.test(source.href||'')){rows.push(source);continue;}
  if(!banners.size)rows.push({banners:[]});
  banners.set(source.href,source);
 }
 const group=rows.find(row=>row.banners);if(group)group.banners=[...banners.values()];
 return rows;
}
