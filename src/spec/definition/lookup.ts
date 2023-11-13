import type { FeatureValue } from "./feat";

/**
 * Describes the lookup table of features.
 */
export type Lookup = {
  [k: string]: { [k: string]: string[] };
};

/**
 * Creates a {@link Lookup} from the given {@link FeatureValue}s.
 */
export function toLookup(fvs: FeatureValue[]): Lookup {
  return fvs.reduce(
    (
      m: Lookup,
      { feature, traits = [], verbs = [] },
    ) => {
      const t = m[feature] ?? (m[feature] = {});
      (traits?.length === 0 ? ["_"] : traits).forEach(
        x => (t[x] = t[x] ? Array.from(new Set([...t[x], ...verbs])) : verbs),
      );
      return m;
    },
    {},
  );
}

export default { toLookup };
