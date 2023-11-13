import type { CollectionConfig } from "payload/types";

import collections from "../spec/definition/collections";
import feat, {
  type Feature,
  type NameLabelPair,
  type Synopsis,
} from "../spec/definition/feat";
import { tagSanitize } from "../spec/definition/label";
import { active } from "../spec/field/active";
import fts from "../spec/field/features";
import shy from "../spec/field/shy";
import { Warden } from "../spec/warden";
import {
  StillInUse,
  has,
  theInitialize,
  theRolePopulate,
  theUserPopulate,
  type Built,
  type ConcreteOptions,
  type Label,
  type Options,
} from "./spec";

/**
 * The {@link Warding} that can build a proper role based {@link CollectionConfig}s.
 */
export class Warding {
  constructor(private readonly options: Options) {}

  /**
   * Creates a role based {@link CollectionConfig} together with a foreign role {@link CollectionConfig}.
   */
  build(
    features: Feature[],
    { fields = [], slug, tag }: Options,
    label?: Label,
  ): Built {
    // the user with the foreign role
    const user = this.user({ slug, tag }, label);
    user.auth = true;
    user.hooks = {
      beforeValidate: [
        async ({ data, req: { url, payload } }) => {
          if (!data || url !== "/first-register") return data;

          // assign the root role for the user of first registration
          data[slug] = await has(payload, {
            slug,
            where: { name: { equals: collections.root } },
          });
          return data;
        },
      ],
    };

    // all features including the user and the foreign role
    features = [...features, user, this.roleSynopsis({ fields, slug, tag })];

    // the foreign role
    const role = this.role(features, { fields, slug, tag }, label);
    role.hooks = {
      beforeDelete: [
        async ({ id, req: { payload } }): Promise<void> => {
          if (
            await has(payload, {
              slug: this.options.slug,
              where: { [slug]: { equals: id } },
            })
          ) {
            throw new StillInUse(slug);
          }
        },
      ],
    };

    const shape = { user: user.slug, role: slug };
    const populate = {
      role: theRolePopulate(slug),
      user: theUserPopulate(shape),
    };

    return {
      collections: { user, role },
      initialize: theInitialize(populate, features),
      warden: new Warden(shape),
      populate,
    };
  }

  private role(
    features: Feature[],
    { fields, slug, tag }: ConcreteOptions,
    label?: Label,
  ): CollectionConfig {
    return Warding.create(
      {
        fields: [
          {
            type: "text",
            name: collections.name("name"),
            required: true,
            unique: true,
            index: true,
            label: label?.roleName,
          },
          ...fts.field(features, label),
          ...fields,
        ],
        slug,
        tag: tag ? tagSanitize(tag) : tag,
      },
      collections.name("name"),
    );
  }

  private roleSynopsis(
    { fields, slug, tag }: ConcreteOptions,
    label?: Label,
  ): Synopsis {
    return {
      slug,
      traits: [
        [collections.name("name"), label?.roleName],
        [collections.name("features"), label?.features],
        ...fields.map(x => feat.pick(x)).filter((x): x is NameLabelPair => !!x),
      ],
      label: tag?.singular,
    };
  }

  private user(role: Omit<Options, "fields">, label?: Label): CollectionConfig {
    return {
      ...Warding.create(
        {
          ...this.options,
          fields: [
            active(label?.active),
            {
              type: "relationship",
              name: role.slug,
              relationTo: role.slug,
              hasMany: true,
              index: true,
              admin: { components: { Field: shy.Relationship } },
              label: role.tag?.singular,
            },
            ...(this.options.fields ?? []),
          ],
        },
        collections.name("email"),
      ),
    };
  }

  /**
   * Creates a {@link CollectionConfig} based on the given {@link Options}.
   */
  static create(
    { fields = [], slug, tag }: Options,
    title: string,
  ): CollectionConfig {
    // sanitizes the tag
    if (tag) tag = tagSanitize(tag);

    return { slug, admin: { useAsTitle: title }, fields, labels: tag };
  }
}

export default { Warding };
