# Dataset manifest — V4.1
Accountable owner: Hưng. Pipeline/research execution: Codex; this is not external dataset approval.

Machine inventory: [actual files + SHA256 and registry](evidence/dataset_inventory.json). It lists the local Mỹ Thành raw/imagery/metadata and curated/runtime datasets; file presence does not grant redistribution. Source URLs, provider, rights, grain, quantities/units, observation/retrieval times remain in each source record and V4 source manifest.

| Dataset | Actually available | Use / constraints |
|---|---|---|
| NASA POWER | Raw2015–2025 daily JSON in sibling docs; 132 curated monthly records; January2025 fresh acquisition from V4 | Regional model/reanalysis, T2M °C and rain mm/month; no farm ground truth |
| SoilGrids | Existing case context/quantiles and research metadata | Model250m; not measured pH or field class |
| Sentinel-2 | Existing scene/render/SCL research files in inventory | Remote-sensing research; no crop outcome labels or completed runtime classifier |
| SOIL-01/S4/S5 | Citation/metadata and historical paper evidence | Region/experiment context; no per-field supervised labels |
| K1 | Six draft rules, three historical sequences | Runtime gated; CODEX provisional packet below does not enable approval |
| H1 | Existing browser synthetic/replay/mocked USB + V4.1 server batches | No authenticated real device log provided; no field join |
| HLS/MODIS/IMERG | No configured runtime dataset | Acquisition deferred until a concrete task needs it |

POWER native meteorological grid is 0.5×0.625 degrees; [NASA methodology](https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/), checked14Nov2026. Query points stay distinct; resampling does not create ground measurements. UTC query specified, not inferred from local display date. Source cache version/API/hash pinned in report; original daily raw stays outside product Git. ESA/ISRIC/CTU are non-NASA sources. License/attribution comes from source registry; Esri local images are not shipped.

Raw→normalized reconstruction PASS: original SHA60fd764713fde469a037889ec2459018821abddd842c089899ac01d34e0fdf32 matches cache provenance;132 months, max |temperature difference|4.84e-7°C and rain difference5.69e-14mm, within documented rounding tolerance. Retained precipitation flag is Q1 sidecar, not a corrected value. Reconstruction command: lab `.venv/Scripts/python.exe -m neurax.agrotwin.inventory`.
