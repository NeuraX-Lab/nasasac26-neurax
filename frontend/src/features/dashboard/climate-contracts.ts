import { z } from "zod";
const ForecastSchema = z
  .object({
    target: z.enum(["precip_sum_mm", "air_temp_mean_c", "air_rh_mean_pct"]),
    unit: z.enum(["mm/month", "degC", "percent"]),
    horizon_months: z.union([z.literal(1), z.literal(3)]),
    target_month: z.iso.date(),
    value: z.number().finite(),
    lower: z.number().finite(),
    upper: z.number().finite(),
    nominal_coverage: z.number().min(0).max(1),
    backtest_coverage: z.number().min(0).max(1),
    method: z.string().min(1),
    issued_at_utc: z.iso.datetime({ offset: true }),
    data_through: z.iso.date(),
    feature_data_cutoff: z.iso.date(),
    historical_vintage_verified: z.literal(false),
  })
  .superRefine((f, ctx) => {
    const units = {
      precip_sum_mm: "mm/month",
      air_temp_mean_c: "degC",
      air_rh_mean_pct: "percent",
    };
    if (
      f.unit !== units[f.target] ||
      f.lower > f.value ||
      f.upper < f.value ||
      f.target_month <= f.data_through
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid forecast units, range or cutoff",
      });
  });
export const OverviewSchema = z
  .object({
    schema_version: z.literal("fieldshift-2"),
    run_id: z.string().startsWith("v2-"),
    region_id: z.literal("MT-BLOCK-01"),
    data_through: z.iso.date(),
    coordinate: z.array(z.number().finite()).length(2),
    source_mode: z.string(),
    forecasts: z.array(ForecastSchema).length(6),
    months: z.array(
      z.object({
        date: z.iso.date(),
        rain: z.number().finite().nullable(),
        temp: z.number().finite().nullable(),
        rh: z.number().finite().nullable(),
        coverage: z.number().min(0).max(1),
        qa: z.enum(["pass", "warn", "fail"]),
      }),
    ),
  })
  .superRefine((v, ctx) => {
    if (
      new Set(v.forecasts.map((f) => `${f.target}/${f.horizon_months}`))
        .size !== 6 ||
      v.forecasts.some((f) => f.data_through !== v.data_through)
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate forecast or mixed cutoff",
      });
  });
export type Overview = z.infer<typeof OverviewSchema>;
