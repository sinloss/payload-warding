import {
  fieldAffectsData,
  type CollectionConfig,
  type Field,
  type GlobalConfig,
  type OptionObject,
} from "payload/types";

import type { Label } from "./label";
import { rules, type RuleLabel } from "./rule";
import ward from "./ward";

/**
 * The synopsis of a feature.
 */
export type Synopsis = {
  slug: string;
  traits: [string, Label | undefined][];
  label?: Label;
};

/**
 * Describes a feature.
 */
export type Feature = CollectionConfig | GlobalConfig | Synopsis;

/**
 * Describes the structure of the value extracted from a {@link Feature}.
 */
export type FeatureValue = {
  feature: string;
  traits: string[];
  verbs: string[];
};

export type NameLabelPair = [string, Label];

/**
 * All peripheral fields that are introduced by Payload.
 */
export const peripherals = ["createdAt", "updatedAt"];

export function fvName(name: keyof FeatureValue): keyof FeatureValue {
  return name;
}

/**
 * Checks if the given {@link Feature} is a {@link Synopsis}.
 */
export function synopsis(feature: Feature): feature is Synopsis {
  return (feature as Synopsis).traits !== undefined;
}

/**
 * Checks if the given {@link Feature} is a {@link CollectionConfig}.
 */
export function collection(
  feature: Feature,
  term: keyof CollectionConfig | true,
): feature is CollectionConfig {
  if (term === true) {
    return true;
  }

  return (feature as CollectionConfig)[term] !== undefined;
}

/**
 * Picks the label from the given {@link Feature}.
 */
export function pickLabel(feature: Feature): Label | undefined {
  if (collection(feature, "labels")) {
    return feature.labels?.singular;
  }

  return feature.label;
}

/**
 * Picks the name and label from the given {@link Field}, excluding those in the
 * `excludes` array.
 */
export function pick(
  field: Field,
  excludes: string[] = peripherals,
): NameLabelPair | false {
  if (fieldAffectsData(field)) {
    if (!ward.should(field) || excludes.includes(field.name)) {
      return false;
    }

    if (!field.label || typeof field.label === "boolean") {
      return [field.name, field.name];
    }

    return [field.name, field.label];
  }
  return false;
}

/**
 * Extracts all the possible traits from the given {@link Feature}.
 */
export function traits(
  feature: Feature,
  label?: RuleLabel,
): [string, Label][] | undefined {
  const set = new Map<string, Label>();

  if (synopsis(feature)) {
    feature.traits.forEach(([v, l]) => set.set(v, l ?? v));
    return Array.from(set);
  }

  if (!ward.should(feature)) return undefined;

  // extract valid field names
  feature.fields?.forEach(x => {
    const name = pick(x);
    if (name) {
      set.set(...name);
    }
  });

  // admin and unlock
  if (collection(feature, "auth") && feature.auth) {
    rules.forEach(x => set.set(x, label?.[x] ?? x));
  }

  if (feature.endpoints) {
    // extract valid endpoint paths
    feature.endpoints
      ?.filter(x => ward.should(x))
      .forEach(x => set.set(x.path, x.path));
  }

  return Array.from(set);
}

/**
 * Creates a lookup table of {@link OptionObject}s from the given {@link Feature}s.
 */
export function lookup(
  features: Feature[],
  label?: RuleLabel,
): {
  [k: string]: OptionObject[];
} {
  const m: { [k: string]: OptionObject[] } = {};

  return features.reduce((m, feature) => {
    const t = traits(feature, label)?.map(([value, label]) => ({
      value,
      label,
    }));

    if (t) m[feature.slug] = t;

    return m;
  }, m);
}

export default {
  peripherals,
  fvName,
  synopsis,
  collection,
  pickLabel,
  pick,
  traits,
  lookup,
};
