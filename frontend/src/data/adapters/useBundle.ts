import { useEffect, useState } from "react";
import type { Bundle } from "../../core/contracts";
import { loadBundle } from "../repositories";
export function useBundle(environment: "research" | "sandbox", enabled = true) {
  const [bundle, setBundle] = useState<Bundle | null>(null),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setBundle(null);
    setError("");
    if (enabled)
      loadBundle(environment, ctrl.signal)
        .then(setBundle)
        .catch((e) => {
          if (!ctrl.signal.aborted)
            setError(e instanceof Error ? e.message : "Invalid bundle");
        });
    return () => ctrl.abort();
  }, [environment, enabled, reload]);
  return { bundle, error, retry: () => setReload((v) => v + 1) };
}
