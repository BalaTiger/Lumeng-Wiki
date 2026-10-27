// Shared grade backgrounds: A is a cropped game capture; S is an AI edit guided by release lighting.
export const heroBackgrounds=Object.freeze({'A级':{className:'hero-grade-a result-scene result-scene-a',source:'assets/backgrounds/character-result-a.png'},'S级':{className:'hero-grade-s result-scene result-scene-s',source:'assets/backgrounds/character-result-s.png'}});
export function heroBackgroundClass(rarity){return heroBackgrounds[rarity]?.className||'';}
export function heroBackgroundStyle(rarity){const source=heroBackgrounds[rarity]?.source;return source?'--character-scene:url('+source+')':'';}
