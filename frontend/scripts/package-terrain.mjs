import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PNG } from "pngjs";
const out = path.resolve(import.meta.dirname, "../public/terrain");
const lon = 106.021621,
  lat = 10.479098;
const tile = (lon, lat, z) => [
  Math.floor(((lon + 180) / 360) * 2 ** z),
  Math.floor(
    ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z,
  ),
];
const manifest = {
  provider: "Mapzen Terrain Tiles / AWS Open Data",
  encoding: "terrarium",
  tileSize: 256,
  bufferMeters: 2000,
  bounds: [lon - 0.019, lat - 0.019, lon + 0.019, lat + 0.019],
  nativeResolution:
    "Composite DEM; original local resolution unverified. Tile sampling is not native resolution.",
  attribution:
    "Mapzen; SRTM, GMTED2010 and 3DEP courtesy of USGS; ETOPO1 courtesy of NOAA",
  license: "https://github.com/tilezen/joerd/blob/master/docs/attribution.md",
  tiles: [],
};
let previous = [];
try {
  previous = JSON.parse(
    await readFile(path.join(out, "manifest.json"), "utf8"),
  ).tiles;
} catch {
  /* first package */
}
for (let z = 10; z <= 14; z++) {
  const [xmin, ymin] = tile(lon - 0.019, lat + 0.019, z),
    [xmax, ymax] = tile(lon + 0.019, lat - 0.019, z);
  for (let x = xmin; x <= xmax; x++)
    for (let y = ymin; y <= ymax; y++) {
      const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
      const dir = path.join(out, String(z), String(x));
      await mkdir(dir, { recursive: true });
      const dest = path.join(dir, `${y}.png`);
      let bytes, retrievedAt;
      try {
        bytes = await readFile(dest);
        retrievedAt = previous.find(
          (t) => t.z === z && t.x === x && t.y === y,
        )?.retrievedAt;
        if (!retrievedAt) throw Error("Cache without provenance");
      } catch {
        const r = await fetch(url);
        if (!r.ok) throw Error(`DEM ${r.status}: ${url}`);
        bytes = Buffer.from(await r.arrayBuffer());
        retrievedAt = new Date().toISOString();
      }
      const png = PNG.sync.read(bytes);
      let min = Infinity,
        max = -Infinity;
      for (let i = 0; i < png.data.length; i += 4) {
        const v =
          png.data[i] * 256 + png.data[i + 1] + png.data[i + 2] / 256 - 32768;
        if (!Number.isFinite(v) || v < -12000 || v > 9000)
          throw Error("Invalid DEM elevation");
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
      await writeFile(dest, bytes);
      manifest.tiles.push({
        z,
        x,
        y,
        url,
        retrievedAt,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        width: png.width,
        height: png.height,
        min,
        max,
      });
    }
}
await writeFile(
  path.join(out, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Decoded and validated ${manifest.tiles.length} local Terrarium tiles (z10–14, 2km buffer).`,
);
