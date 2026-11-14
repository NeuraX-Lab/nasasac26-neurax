import { z } from "zod";
import type { FeatureCollection, Polygon } from "geojson";
export type Geometry = FeatureCollection<Polygon>;
export function parseCoordinates(input: string): Geometry {
  const ring = input
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((line) => line.split(",").map(Number));
  if (
    ring.length < 3 ||
    ring.some(
      (p) =>
        p.length !== 2 ||
        !p.every(Number.isFinite) ||
        Math.abs(p[0]) > 180 ||
        Math.abs(p[1]) > 85,
    )
  )
    throw Error("invalid");
  if (new Set(ring.map((p) => p.join(","))).size < 3) throw Error("invalid");
  if (ring[0].join(",") !== ring.at(-1)!.join(",")) ring.push([...ring[0]]);
  const cross = (a: number[], b: number[], c: number[]) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    for (let j = i + 2; j < ring.length - 1; j++) {
      if (i === 0 && j === ring.length - 2) continue;
      const a = ring[i],
        b = ring[i + 1],
        c = ring[j],
        d = ring[j + 1];
      if (
        cross(a, b, c) * cross(a, b, d) <= 0 &&
        cross(c, d, a) * cross(c, d, b) <= 0
      )
        throw Error("intersection");
    }
  }
  if (Math.abs(area) < 1e-12) throw Error("zero area");
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [ring] },
      },
    ],
  };
}

const position = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-85).max(85),
]);
export const GeometrySchema = z
  .object({
    type: z.literal("FeatureCollection"),
    features: z
      .array(
        z.object({
          type: z.literal("Feature"),
          properties: z.record(z.string(), z.unknown()).nullable(),
          geometry: z.object({
            type: z.literal("Polygon"),
            coordinates: z.array(z.array(position).min(4)).length(1),
          }),
        }),
      )
      .length(1),
  })
  .superRefine((g, ctx) => {
    try {
      const ring = g.features[0].geometry.coordinates[0];
      if (JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1)))
        throw Error("open ring");
      parseCoordinates(ring.map((p) => p.join(",")).join("\n"));
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid polygon geometry" });
    }
  });
