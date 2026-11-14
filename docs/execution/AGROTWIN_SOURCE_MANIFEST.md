# AgroTwin V4 — source and attribution registry

Machine-readable authority: `../../../neurax-fieldshift-lab/neurax/resources/agrotwin/sources.json`, with `climate.json`, `case.json` and `catalog.json` in the same folder. API: `GET /v1/analysis/sources`. Every recorded run embeds the registry, source/hash, retrieval time, observation period and rule/algorithm fingerprints.

| Resource | Provider / class | Version, scale, time | Rights / use |
|---|---|---|---|
| POWER | NASA / DERIVED_MODEL | Cached Daily API v2.10.3, MERRA2; T2M °C, PRECTOTCORR mm/day -> monthly; 2015–2025; coarse native grid | NASA POWER attribution and original query/hash retained; no endorsement/field truth |
| SoilGrids | ISRIC / DERIVED_MODEL | 250 m, depth-specific pH/texture/quantiles; centroid model | CC-BY-4.0 attribution; estimates/uncertainty only |
| SOIL-01 | CTU / REGIONAL_HISTORICAL | 2011 paper; 2009 revised regional map, 1:250,000 | Link/citation; paper is not copied into frontend |
| S4/S5 | CTU / REGIONAL_HISTORICAL | 2009 papers, historical Long Khánh/Cai Lậy studies | Link/citation; no site transfer or guaranteed benefit |
| Additional timing/water sources | VAAS/extension/archive / REGIONAL_HISTORICAL | Exact source/cultivar/year in catalog | Draft evidence only; full texts not shipped |
| Sentinel-2 L2A | ESA, non-NASA / REMOTE_SENSING | 2025 research samples, 10/20 m bands/QA | Copernicus attribution; no raster/crop classifier in runtime |
| Geometry illustration | Team / PROPOSED research geometry | Original documented study block, spherical area approximation | Authored SVG; not current field imagery |
| Terrain | Mapzen terrain tiles, USGS/NOAA context | Pinned local tile manifest/hashes; native resolution unverified | Attribution retained; only background terrain, never drainage assessment |
| Basemap | OpenStreetMap contributors / map context | Current interactive navigation only | ODbL attribution and tile usage policy; no offline tile harvesting |

Sources: [POWER](https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/), [SoilGrids](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_01.html), [SOIL-01](https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/1006), [S4](https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/605), [S5](https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/597), [terrain attribution](https://raw.githubusercontent.com/tilezen/joerd/master/docs/attribution.md), [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/). Checked 14 November 2026 in this build/source audit.

No Esri photograph is needed in the reproducible runtime. The original local image is preserved, excluded from intentional staging, and no redistribution permission is asserted. The prepared sample card uses the team-generated geometry SVG instead. Automated browser tests block public OSM tiles to avoid prefetching; interactive maps retain visible attribution and normal browser caching. Offline fallback is local geometry/analysis, not downloaded OSM tiles.

Curated monthly cache is an intentional small attributed demo input authorized by V4. Original daily records, source PDFs, rasters, private attachments, tokens and environments are not shipped. Raw source hash is retained for provenance; a clone can verify the curated payload, not independently re-derive it without original daily data.

NASA challenge Resources direct retrieval failed in the preceding audit; the full current list is NOT_VERIFIED. Individual dataset docs are separate evidence. [Terms 2026](https://www.spaceappschallenge.org/legal/) was found through the official search index on 14 November; direct retrieval returned 502. User previously reported organizer authorization; original project/code dates remain unchanged. This local build is not a public submission or legal determination.

Actual public NASA POWER acquisition passed at `2026-11-14T08:13:55Z`: January 2025 UTC, T2M/PRECTOTCORR, representative polygon vertex-mean query point `[106.0214325,10.47907975]`. Raw response SHA-256 `0e255504731767685fa6cddd4ec8b2e73a6f2645d69a8963672e33b4c994fdc3`; one normalized month, coverage 1, technical QA pass. Evidence/raw artifact: lab `runs/agrotwin-v4-live-check.json` and `runs/agrotwin-v4-live/sources/`. TLS validation stayed enabled. This verifies this one public request; it does not guarantee API availability or validate any crop. The prepared multi-year cache retains its original query point and bytes.

Production build copies only the curated public allowlist from Vite config. The preserved local Esri photograph is neither staged nor copied into `dist`.
