# TalkTuit Support Hub

A fully grey-labeled client knowledge base for TalkTuit. The hub includes a
searchable A-Z guide library, a source-backed topic directory, product updates,
and client support paths without exposing upstream platform branding.

## Prerequisites

- Node.js `>=22.13.0`

## Local development

```bash
npm ci
npm run dev
npm run build
```

## Knowledge maintenance

- `npm run sync:knowledge` refreshes the sanitized tutorial index.
- `npm run check:brand` blocks upstream vendor names from public content.
- `npm run lint` checks the application source.
- `npm test` builds and validates the rendered routes.

The repository workflow checks for new topics every day. It validates the
grey-label rules and commits `data/tutorial-index.json` only when the source
catalog has materially changed. It can also be run manually from the Actions
tab.
