import type { Field, SelectField } from "payload/types";

import type { Feature } from "../definition/feat";
import feat from "../definition/feat";
import type { Label } from "../definition/label";
import type { RuleLabel } from "../definition/rule";
import type { VerbLabel } from "../definition/verb";
import verb from "../definition/verb";
import cascading from "./cascading";

export function feature(features: Feature[], label?: Label): SelectField {
  return {
    type: "select",
    name: feat.fvName("feature"),
    options: features.map(f => {
      const label = feat.pickLabel(f);
      if (label) {
        return { label, value: f.slug };
      }
      return f.slug;
    }),
    label,
  };
}

export function traits(
  features: Feature[],
  label?: { [k in "traits" | keyof RuleLabel]: Label },
): Field {
  // create a lookup table for the given features
  const lookup = feat.lookup(features, label);
  return cascading.field(
    {
      ref: "feature",
      label: label?.traits ?? "Traits",
      selector: v => lookup[v] ?? [],
    },
    { name: feat.fvName("traits") },
  );
}

export function verbs(label?: {
  [k in "verbs" | keyof VerbLabel]: Label;
}): SelectField {
  return {
    type: "select",
    name: feat.fvName("verbs"),
    options: verb.verbs.map(x => ({ value: x, label: label?.[x] ?? x })),
    hasMany: true,
    defaultValue: verb.verbs,
    label: label?.verbs,
  };
}

export default { feature, traits, verbs };
