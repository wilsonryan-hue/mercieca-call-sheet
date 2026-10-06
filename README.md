# Mercieca Recruitment Desk

Frankie opens this page:

https://www.tchworks.co.uk/mercieca-recruitment/

That address is served by GitHub Pages from the `wilsonryan-hue/wilsonryan-hue.github.io` repository (file `mercieca-recruitment/index.html`). This repository is the source. It does not publish anything itself.

## Checks

```
npm ci
npm run build            # the page is complete and points at the live address
npm run verify:browser   # drives every workflow in a real browser
```

Both run on every pull request.

## Putting a new version live

Only with Ryan's yes. Copy `index.html` from `main` here to `mercieca-recruitment/index.html` in `wilsonryan-hue.github.io`, push, then check that `/mercieca-recruitment/` and the TCH Works shop pages still open.

Handover for another AI:

https://raw.githubusercontent.com/wilsonryan-hue/mercieca-call-sheet/main/MERCIECA_BUILD_HANDOFF.md
