import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { z } from "zod";
import type { Area, Preferences } from "../contracts";
import { GeometrySchema } from "../contracts/geometry";
const initial: Preferences = {
  environment: "research",
  year: "all",
  selected: "R1",
  rainDelta: 0,
  tempDelta: 0,
};
export const PrefSchema = z.object({
  environment: z.enum(["research", "sandbox"]),
  year: z.string().regex(/^(all|20\d{2})$/),
  selected: z.enum(["", "R0", "R1", "R2"]),
  rainDelta: z.number().min(-50).max(50),
  tempDelta: z.number().min(-5).max(5),
});
function readPrefs() {
  try {
    return PrefSchema.parse(
      JSON.parse(localStorage.getItem("agrotwin-preferences") || "null"),
    );
  } catch {
    return initial;
  }
}
const Context = createContext<{
  prefs: Preferences;
  patch: (v: Partial<Preferences>) => void;
  areas: Area[];
  saveArea: (a: Area) => boolean;
  removeArea: (id: string) => void;
  storageError: boolean;
}>(null!);
export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, patch] = useReducer(
    (s: Preferences, p: Partial<Preferences>) => ({ ...s, ...p }),
    undefined,
    readPrefs,
  );
  const [areas, setAreas] = useReducer(
    (_: Area[], a: Area[]) => a,
    [],
    () => {
      try {
        const a = JSON.parse(localStorage.getItem("agrotwin-areas") || "[]");
        return Array.isArray(a)
          ? a.filter(
              (x) =>
                z
                  .object({
                    id: z.string().regex(/^area-[a-f0-9-]+$/),
                    name: z.string().min(1).max(80),
                    createdAt: z.string().datetime(),
                    group: z.string().max(80).optional(),
                    geometry: GeometrySchema,
                  })
                  .safeParse(x).success,
            )
          : [];
      } catch {
        return [];
      }
    },
  );
  const [storageError, setError] = useReducer(() => true, false);
  useEffect(() => {
    try {
      localStorage.setItem("agrotwin-preferences", JSON.stringify(prefs));
    } catch {
      setError();
    }
  }, [prefs]);
  const persist = (next: Area[]) => {
    try {
      localStorage.setItem("agrotwin-areas", JSON.stringify(next));
      setAreas(next);
      return true;
    } catch {
      setError();
      return false;
    }
  };
  return (
    <Context.Provider
      value={{
        prefs,
        patch,
        areas,
        storageError,
        saveArea: (a) => persist([...areas.filter((x) => x.id !== a.id), a]),
        removeArea: (id) => {
          persist(areas.filter((x) => x.id !== id));
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
