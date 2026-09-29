# CLAUDE.md — TrngSm Shopify theme

Shopify Online Store 2.0 theme for the **TrngSm** store (`trngsm.myshopify.com`). The theme files sit at the repo root (`layout/`, `config/`, `locales/`, `assets/`, `sections/`, `snippets/`, `templates/`) — keep it that way; Shopify's GitHub integration requires it.

## Branches

- `dev` — where work happens; connected to an unpublished preview theme in Shopify.
- `main` — live storefront; connected to the published theme. Only merge `dev` into `main` when the owner says it is ready to go live.
- Shopify's GitHub integration commits theme editor changes back to whichever branch a theme is connected to.

## Rules for all work in this repo

1. **Always `git pull` before editing.** Shopify commits theme editor changes (mostly `config/settings_data.json` and `templates/*.json`) back to the connected branch, so the local copy is often stale.
2. **Don't overwrite `config/settings_data.json` or `templates/*.json` settings unless the owner asks.** These hold values saved in the theme editor. Never reset, reorder, or reformat existing settings. If a code change truly requires touching a template JSON, make the smallest possible edit and tell the owner.
3. **Run Theme Check before every commit and fix errors:** `npm run check`. Warnings do not block a commit, but do not add new ones. CI (`.github/workflows/theme-check.yml`) runs the same check on every push and PR.
4. **Keep all storefront text in English.** That covers section/schema labels, settings, `locales/*.json`, and any string in Liquid, JS, or CSS content that a customer can see.
5. **Small commits with clear messages.** One logical change per commit; write the message in the imperative (e.g. "Add sold-out badge to product card").

## Commands

```sh
npm install     # install Shopify CLI (dev dependency)
npm run dev     # shopify theme dev --store trngsm.myshopify.com
npm run check   # Shopify Theme Check
```

`npm run dev` needs an interactive Shopify login and won't work in a headless session; use `npm run check` there.

## Notes

- `node_modules`, `.env`, `.DS_Store` and `*.log` are git-ignored. Never commit credentials or store tokens.
- Known Theme Check warnings: 3 `RemoteAsset` warnings for the Google Fonts links in `layout/theme.liquid`. These are accepted.
