// One shared grade mapping for every character. S screenshot is not fabricated from A lighting.
export const heroBackgrounds=Object.freeze({'A级':{className:'hero-grade-a result-scene-a',source:'assets/backgrounds/character-result-a.png'},'S级':{className:'hero-grade-s',source:null}});
export function heroBackgroundClass(rarity){return heroBackgrounds[rarity]?.className||'';}

export function heroBackgroundStyle(rarity){const source=heroBackgrounds[rarity]?.source;return source?'--character-scene:url('+source+')':'';}
