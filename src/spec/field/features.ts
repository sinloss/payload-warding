import type { ArrayField, JSONField } from "payload/types";
import pluralize from "pluralize";

import collections from "../definition/collections";
import type { Feature } from "../definition/feat";
import type { Label } from "../definition/label";
import { labelSanitize } from "../definition/label";
import lookup from "../definition/lookup";
import type { RuleLabel } from "../definition/rule";
import type { VerbLabel } from "../definition/verb";
import feature from "./feature";

/**
 * Creates an {@link ArrayField} of features consisting of feature, traits and verbs, and
 * a {@link JSONField} of the lookup table.
 */
export function field(
  features: Feature[],
  label?: {
    [k in
      | "features"
      | "feature"
      | "verbs"
      | "traits"
      | keyof RuleLabel
      | keyof VerbLabel]: Label;
  },
): [ArrayField, JSONField] {
  return [
    {
      type: "array",
      name: collections.name("features"),
      required: true,
      fields: [
        {
          type: "row",
          fields: [
            {
              ...feature.feature(features, label?.feature),
              admin: { width: "50%" },
            },
            { ...feature.verbs(label), admin: { width: "50%" } },
          ],
        },
        feature.traits(features, label),
      ],
      label: label?.features,
      labels: label?.features
        ? {
            singular: label.features,
            plural: labelSanitize(pluralize, label.features),
          }
        : undefined,
    },
    {
      type: "json",
      name: collections.name("lookup"),
      admin: {
        disabled: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData: { [collections.name("features")]: fvs } }) =>
            lookup.toLookup(fvs),
        ],
      },
      custom: {
        warding: {
          should: false,
        },
      },
    },
  ];
}

export default { field };
