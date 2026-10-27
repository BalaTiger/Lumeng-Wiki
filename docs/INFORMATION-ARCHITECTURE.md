# Information architecture review

Reviewed 2026-10-27. Retain the existing visual design; prioritize game reference lookup.

Reference structure: Star Rail BWIKI homepage separates character/equipment/item indexes and version/warp archives. PRTS sidebar places operator, item and banner indexes prominently and separates new operators from archive navigation. No third-party copy or artwork was reused.

Sources:
- https://wiki.biligame.com/sr/首页
- https://prts.wiki/w/MediaWiki:Sidebar
- https://prts.wiki/w/卡池一览

Local revision: primary navigation uses character/equipment/skill/item/banner indexes. Homepage leads with three verified story-trial character names, version scope and search. Equipment, skill and banner links resolve to transparent collection-status pages. Currency entries are a distinct subsection, not a complete item encyclopedia. Official introduction/download/artwork articles remain auxiliary.

No character image, stats, rarity, skill text, equipment fields, pool membership or current banner claim is included. Character names derive only from the pinned release story-trial name toast. Detailed private evidence stays in ignored .audit/.

Static publishing: all18 readable pages are emitted as real directory paths with an HTML body, unique title/description and canonical URL. sitemap.xml lists only these pages. The same safe projection drives static HTML and client search; no second raw data source is introduced. Root-domain robots administration and search-console submissions were not performed.
