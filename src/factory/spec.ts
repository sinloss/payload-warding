import type { Payload } from "payload";
import type { CollectionConfig, Field, Where } from "payload/types";

import { APIError } from "payload/errors";
import type { Concrete } from "../kit/typing";
import collections, { type Spec } from "../spec/definition/collections";
import feat, { type Feature, type FeatureValue } from "../spec/definition/feat";
import type {
  Label as SpecLabel,
  Labels as SpecLabels,
} from "../spec/definition/label";
import lookup from "../spec/definition/lookup";
import type { RuleLabel } from "../spec/definition/rule";
import verb, { type VerbLabel } from "../spec/definition/verb";
import type { Warden } from "../spec/warden";

/**
 * The {@link Warding} options.
 */
export type Options = {
  slug: string;
  fields?: Field[];
  tag?: SpecLabels;
};

/**
 * The {@link Concrete} variant of {@link Options}.
 */
export type ConcreteOptions = Concrete<Options, "fields">;

/**
 * The {@link Warding} label map.
 */
export type Label = {
  [k in
    | "active"
    | "roleName"
    | "features"
    | "feature"
    | "verbs"
    | "traits"
    | keyof RuleLabel
    | keyof VerbLabel]: SpecLabel;
};

/**
 * The result type of {@link Warding.build}.
 */
export type Built = {
  collections: { user: CollectionConfig; role: CollectionConfig };
  warden: Warden;
  populate: Populate;
  initialize: Initialize;
  initializationExtra?: { user: any; role: any };
};

export type Initialize = (
  payload: Payload,
  root?: { email: string; password: string },
  extra?: { user: any; role: any },
) => Promise<void>;

export type Populate = {
  role: RolePopulate;
  user: UserPopulate;
};

export type RolePopulate = (
  payload: Payload,
  role: { name: string; features: FeatureValue[] },
  extra?: any,
) => Promise<string | number>;

export type UserPopulate = (
  payload: Payload,
  user: {
    email: string;
    password: string;
    roles: (string | number)[];
  },
  extra?: any,
) => Promise<string | number>;

/**
 * The {@link APIError} for a conflict condition caused by something that is 
 * still in use.
 */
export class StillInUse extends APIError {
  constructor(slug: string) {
    super(`This ${slug} is still in use!`, 404, {}, true);
  }
}

export function theInitialize(
  populate: Populate,
  features: Feature[],
): Initialize {
  return async (payload, root, extra) => {
    const role = await populate.role(
      payload,
      {
        name: collections.root,
        features: features
          .map(x => {
            const t = feat.traits(x)?.map(([value]) => value);
            if (!t) return undefined;
            return {
              feature: x.slug,
              traits: t,
              verbs: verb.verbs as string[],
            };
          })
          .filter((x): x is FeatureValue => !!x),
      },
      extra?.role,
    );

    if (!root) return;

    await populate.user(
      payload,
      {
        email: root?.email,
        password: root?.password,
        roles: [role],
      },
      extra?.user,
    );
  };
}

export function theRolePopulate(slug: string): RolePopulate {
  return async (payload, { name, features }, extra) => {
    const id = await has(payload, {
      slug,
      where: { name: { equals: name } },
    });

    if (id) {
      return id;
    }

    return (
      await payload.create({
        collection: slug,
        data: {
          ...extra,
          name,
          [collections.name("features")]: features,
          [collections.name("lookup")]: lookup.toLookup(features),
        },
      })
    ).id;
  };
}

export function theUserPopulate(slug: Spec): UserPopulate {
  return async (payload, { email, password, roles }, extra) => {
    const id = await has(payload, {
      slug: slug.user,
      where: { email: { equals: email } },
    });
    if (id) {
      return id;
    }

    return (
      await payload.create({
        collection: slug.user,
        data: {
          ...extra,
          email,
          password,
          [slug.role]: roles,
        },
      })
    ).id;
  };
}

export async function has(
  payload: Payload,
  {
    slug,
    where,
  }: {
    slug: string;
    where: Where;
  },
): Promise<string | number> {
  const v = await payload.find({
    collection: slug,
    where,
    limit: 1,
  });

  if (v.totalDocs > 0) {
    return v.docs[0].id;
  }

  return 0;
}

export default { theRolePopulate, theUserPopulate, has };
