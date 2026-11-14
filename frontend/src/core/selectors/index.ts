import type { Month, Geometry } from "../contracts";
export function summarize(months: Month[], year: string): Month[] {
  const selected =
    year === "all" ? months : months.filter((x) => x.date.startsWith(year));
  if (year !== "all") return selected;
  return Array.from({ length: 12 }, (_, i) => {
    const rows = selected.filter((x) => Number(x.date.slice(5, 7)) === i + 1);
    const mean = (key: "rain" | "temp") => {
      const vals = rows
        .map((x) => x[key])
        .filter((v): v is number => v !== null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    return {
      date: `2000-${String(i + 1).padStart(2, "0")}-01`,
      rain: mean("rain"),
      temp: mean("temp"),
      coverage: rows.length
        ? rows.reduce((a, b) => a + b.coverage, 0) / rows.length
        : 0,
      qa: rows.some((x) => x.qa === "fail")
        ? "fail"
        : rows.some((x) => x.qa === "warn")
          ? "warn"
          : "pass",
    };
  });
}
export { parseCoordinates } from "../contracts/geometry";
export function center(geometry: Geometry): [number, number] {
  const points = geometry.features[0]?.geometry.coordinates[0];
  const ring = points?.length ? points.slice(0, -1) : undefined;
  if (!ring?.length) return [106.021621, 10.479098];
  return [
    ring.reduce((a, p) => a + p[0], 0) / ring.length,
    ring.reduce((a, p) => a + p[1], 0) / ring.length,
  ];
}
