# IDEA MINERS 2026 · Engineering hardening

Hydrology tests now transpile and execute the **actual** `src/lib/fao56.ts` with its imported crop constants (not a separate copy of formulas).

The daily evapotranspiration replacement estimate is **not** an automatic irrigation order. Root-zone stored moisture, capillary flux, salinity leaching and infrastructure constraints remain unmeasured; never automatically skip a positive daily deficit based solely on forecast rain tomorrow.

For local verification:

```sh
cd aqua-app
npm ci
npm test
npm run typecheck
npm run build
```
