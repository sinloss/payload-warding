import type { AccessArgs } from "payload/config";
import { Forbidden } from "payload/errors";
import {
  fieldAffectsData,
  type CollectionConfig,
  type GlobalConfig,
} from "payload/types";

import basic from "../kit/basic";
import type { StringLiteral } from "../kit/typing";
import access, { type Access, type Expectation } from "./access";
import type { Spec } from "./definition/collections";
import feat from "./definition/feat";
import rule from "./definition/rule";
import verb from "./definition/verb";
import ward from "./definition/ward";

/**
 * Warden of the north!
 */
export class Warden {
  constructor(private readonly spec: Spec) {}

  /**
   * Wards the given {@link CollectionConfig} or {@link GlobalConfig}.
   */
  ward<T extends CollectionConfig | GlobalConfig>(
    config: T,
    collection?: true,
  ): T {
    if (!config.access) config.access = {};

    if (collection && feat.collection(config, true)) {
      config = this.collectionSpecific(config);
    }

    return this.endpoints(
      this.fields(this.cru(config, { feature: config.slug }, {})),
    );
  }

  /**
   * Wards {@link CollectionConfig} specific accesses.
   */
  collectionSpecific<T extends CollectionConfig>(config: T): T {
    // ward for 'delete'
    config.access!.delete = this.ck(
      { feature: config.slug, verbs: [verb.Verb.DELETE] },
      config,
      verb.Verb.DELETE,
    );

    if (config.auth) {
      // ward for 'admin'
      config.access!.admin = this.ck(
        { feature: config.slug, traits: [rule.Rule.ADMIN] },
        config,
        "admin",
      );

      // ward for 'unlock'
      config.access!.unlock = this.ck(
        {
          feature: config.slug,
          traits: [rule.Rule.UNLOCK],
        },
        config,
        "unlock",
      );
    }

    return config;
  }

  /**
   * Wards fields.
   */
  fields<T extends CollectionConfig | GlobalConfig>(config: T): T {
    config.fields = config.fields.map(x => {
      if (fieldAffectsData(x)) {
        if (!x.access) x.access = {};
        x = this.cru(x, { feature: config.slug, trait: x.name }, config);
      }
      return x;
    });

    return config;
  }

  /**
   * Wards endpoints.
   */
  endpoints<T extends CollectionConfig | GlobalConfig>(config: T): T {
    if (config.endpoints) {
      config.endpoints = config.endpoints.map(x => {
        const v = verb.map[x.method];
        const ck = access.check(
          {
            feature: config.slug,
            traits: [x.path],
            verbs: [v],
          },
          this.spec,
        );

        // if the custom setting rejects warding, decorate the handler's
        // req.context with the ck as the 'warding' function
        if (!ward.should(x, v, ward.should(config, v))) {
          x.handler = basic.map(x.handler, handle => (req, res, next) => {
            req.context.warding = ck;
            return handle(req, res, next);
          });
          return x;
        }

        // otherwise insert the ck into the handler, meaning the endpoint
        // needs the warding
        x.handler = [
          (req, _, next) => {
            // access control
            if (!ck({ req })) {
              throw new Forbidden(req.t);
            }
            next();
          },
          ...(x.handler instanceof Array ? x.handler : [x.handler]),
        ];

        return x;
      });
    }

    return config;
  }

  /**
   * Wards `create` / `read` / `update` accesses.
   */
  cru<
    T extends {
      access?: {
        create?: Access;
        read?: Access;
        update?: Access;
      };
      custom?: any;
    },
  >(
    it: T,
    { feature, trait }: { feature: string; trait?: string },
    parent: { custom?: any },
  ): T {
    const ex = {
      feature,
      traits: trait ? [trait] : [],
    };

    it.access!.create = this.verbed(ex, it, verb.Verb.CREATE, parent);
    it.access!.read = this.verbed(ex, it, verb.Verb.READ, parent);
    it.access!.update = this.verbed(ex, it, verb.Verb.UPDATE, parent);

    return it;
  }

  /**
   * A verbed variant of {@link ck}, which will check the parent for the verb's
   * access, and then put the verb in the verbs array.
   */
  verbed<T, K>(
    ex: Expectation,
    config: {
      access?: { [k in StringLiteral<K>]?: Access<T> };
      custom?: any;
    },
    verb: StringLiteral<K>,
    parent: { custom?: any },
  ): Access<T> | Access<boolean> | undefined {
    return this.ck(
      { ...ex, verbs: [verb] },
      config,
      verb,
      ward.should(parent, verb),
    );
  }

  /**
   * Creates a {@link Access} for the given `config` and `verb` expecting
   * the given {@link Expectation}.
   */
  ck<T, K>(
    ex: Expectation,
    config: {
      access?: { [k in StringLiteral<K>]?: Access<T> };
      custom?: any;
    },
    verb: StringLiteral<K>,
    pshould = true,
  ): Access<T> | Access<boolean> | undefined {
    const ck = access.check(ex, this.spec);
    const acc = config.access?.[verb];
    if (!acc) {
      // respect the current 'warding.should' setting, and fallback to the
      // designated parent 'should' value
      if (ward.should(config, verb, pshould)) {
        return ck;
      }

      // reject warding
      return undefined;
    }

    // with a designated access function
    return (a: AccessArgs<any, any>) => {
      // pass the ck to it so that it by itself can decide to and how to use the
      // ck function
      a.req.context.warding = ck;
      return acc(a);
    };
  }
}

export default { Warden };
