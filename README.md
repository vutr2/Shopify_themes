# TrngSm Shopify Theme

Shopify Online Store 2.0 theme for the **TrngSm** store (`trngsm.myshopify.com`).

The theme files (`layout/`, `config/`, `locales/`, `assets/`, `sections/`, `snippets/`, `templates/`) sit at the **root** of this repo — Shopify's GitHub integration requires that.

## Connect this repo to Shopify

Do this once per branch. You will end up with two themes in Shopify: one following `dev` (preview) and one following `main` (live).

1. In Shopify admin go to **Online Store → Themes**.
2. Click **Add theme → Connect from GitHub**.
3. Sign in to GitHub and authorize the **Shopify GitHub integration** if prompted. Grant it access to this repository (it is private, so it must be selected explicitly).
4. Choose the account and the repository **`trngsm-shopify-theme`**.
5. Choose the branch **`dev`** and click **Connect**. Shopify creates an unpublished theme that follows `dev`.
6. Repeat steps 2–5 and choose the branch **`main`**. When you are ready to go live, publish the theme that follows `main`.
7. The theme lives at the repo root, so there is no subfolder to select.

The connected theme's name in the Themes list includes the repository and branch, so you can tell the two apart.

## Branch strategy

| Branch | Purpose | Shopify theme |
| ------ | ------- | ------------- |
| `dev`  | Day-to-day work and previewing changes | Unpublished preview theme |
| `main` | What is live on the storefront | Published (live) theme |

Workflow:

1. Work on `dev` and push. The preview theme in Shopify updates automatically.
2. Check the changes in the `dev` preview theme.
3. When it is ready to go live, merge `dev` into `main` (pull request or fast-forward merge). The live theme updates automatically.

## Shopify commits back to this repo

The connection is **two-way**. When you (or anyone on your team) save changes in the Shopify theme editor, Shopify **commits them back to the connected branch** — mostly `config/settings_data.json` and `templates/*.json`.

Because of that:

- **Always `git pull` before you start editing**, or your push will be rejected or will clobber editor changes.
- Do not overwrite `config/settings_data.json` or the settings inside `templates/*.json` by hand unless you mean to reset what was configured in the theme editor.
- Expect commits from Shopify in the history of `dev` and `main`. Editor changes made on the `dev` theme only land on `dev`; bring them to `main` through the normal merge.

## Local development

Requirements: Node.js 20+ and npm. Shopify CLI is installed as a dev dependency.

```sh
npm install        # once
npm run dev        # shopify theme dev --store trngsm.myshopify.com
npm run check      # Shopify Theme Check
```

`npm run dev` opens a local preview on `http://127.0.0.1:9292` and asks you to log in to the store on first run. Run `npm run check` before every commit.

## Continuous integration

`.github/workflows/theme-check.yml` runs Shopify Theme Check on every push and pull request. The job fails on Theme Check **errors**; warnings are reported but do not fail it.

## Project layout

```
assets/      CSS, JS and images
config/      settings_schema.json (theme settings) and settings_data.json (saved values)
layout/      theme.liquid
locales/     translation files (en.default.json)
sections/    theme sections and section groups
snippets/    reusable Liquid snippets
templates/   JSON templates for each page type
```
