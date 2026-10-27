# Audited GitHub Pages publishing

## Scope

Pin the actual successful released-client commit and its database/resources. Keep private commit/build and UI-reachability evidence in ignored .audit, never public Git history. Later patches and development data are excluded.

The deployed first stage contains three currency records (displayed name/type/description); ordinary-player factual confirmation supplements their visibility evidence. This local revision also contains three verified story-trial character names. Name-only character records contain no stats, rarity, skills, equipment or pool membership. Other collections have status pages and no invented records.

## Verification

1. Record exact UI bindings, normal story/acquisition access, release switches and remaining runtime gaps separately.
2. Project fields through closed schemas and explicit reviewed slugs. Never copy raw tables, internal identifiers, assets or computed templates. Updating a digest alone is not an audit.
3. Run npm test and npm run build with low concurrency. Inspect staged source/history plus the explicit output manifest. .audit, dist, source maps and raw game data must stay out of public Git.
4. Check all real-path pages have readable raw HTML, title/description/canonical and valid links. Sitemap, static HTML and search must use the same safe projection. Verify desktop/mobile layout, keyboard navigation, search/filter, direct refresh and browser history.
5. Review the exact proposed commit and public scope before publication. The previous precise authorization for7f7b1d9 does not automatically authorize this revision's new data.

## GitHub Pages

Settings → Pages → GitHub Actions. The workflow uploads only dist and deploys with the short-lived GITHUB_TOKEN/OIDC using pages:write and id-token:write. No persistent credentials or alternate hosting.

After an authorized push, verify remote main SHA, successful Actions build/deploy and HTTPS page/resources against the audited manifest. Default URL: https://balatiger.github.io/Lumeng-Wiki/ .

GitHub Pages provides the default github.io HTTPS certificate. For an approved custom domain, Pages manages the certificate; no Certbot/renewal cron or reused private keys. Do not configure an unpurchased domain. Source: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https .

The local revision supplies canonical URLs and sitemap.xml. A robots.txt under a project subdirectory does not administer the github.io root domain. No search-console registration or URL submission has been performed.
