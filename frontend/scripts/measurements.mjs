/** Missing measurements remain null; a measured zero remains zero. */
export function numberOrNull(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  if (typeof value === "boolean") throw Error("Boolean is not a measurement");
  const number = Number(value);
  if (!Number.isFinite(number)) throw Error("Nonfinite measurement");
  return number;
}
