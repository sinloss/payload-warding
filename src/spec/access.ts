import type { AccessArgs, AccessResult } from "payload/config";

import basic from "../kit/basic";
import collections, { type Role, type Spec } from "./definition/collections";
import rule from "./definition/rule";
import verb from "./definition/verb";

/**
 * Describes the common access function that fits both collection and field accesses.
 */
export type Access<T = AccessResult | boolean> = (
  a: AccessArgs<any, any>,
) => T | Promise<T>;

/**
 * The expected `feature` + `traits` + `verbs` combination.
 */
export type Expectation = {
  feature: string;
  traits?: string[];
  verbs?: string[];
};

function operationMe(
  { user: usr, role }: Spec,
  { id, req: { user, collection, url } }: AccessArgs<any, any>,
  { feature, traits, verbs }: Expectation,
): boolean {
  if (feature !== usr && collection?.config?.slug !== usr) {
    return false;
  }

  // a '/me' or a '/login' is always an operation-me
  if (url === "/me" || url === "/login") return true;

  // the user id should match
  if (id !== user.id) return false;

  // when dealing with non-rule, non-role, non-active traits along with read and update
  // verbs, it surely is an operation-me
  return (
    basic.expect(
      false,
      traits,
      ...rule.rules,
      role,
      collections.name("active"),
    ) && basic.expect(true, verbs, verb.Verb.READ, verb.Verb.UPDATE)
  );
}

export function allow(
  { lookup }: Role,
  { feature, traits = [], verbs = [] }: Expectation,
): boolean {
  if (!lookup || !Object.prototype.hasOwnProperty.call(lookup, feature)) {
    return false;
  }
  const fv = lookup[feature];

  if (!traits || traits.length === 0) {
    // skip traits check, check only verbs
    const v = Object.keys(fv)
      .filter(x => !(rule.rules as string[]).includes(x))
      .flatMap(k => fv[k]);
    return basic.expect(true, verbs, ...v);
  }

  return traits.every(trait => {
    const v = fv[trait];

    // every expected trait should present
    if (!v) {
      return false;
    }

    // all the expected verbs should be included, vacuously true if verbs is empty
    return basic.expect(true, verbs, ...v);
  });
}

/**
 * Creates an access function for the given slug and the expected `feature` + `traits` +
 * `verbs` combination.
 */
export function check(
  ex: Expectation,
  spec: Spec,
): (a: AccessArgs<any, any>) => boolean | Promise<boolean> {
  return a => {
    const {
      req: { user },
    } = a;

    // no user, no further
    if (!user || !user[collections.name("active")]) return false;

    // the operation of me myself is totally fine
    if (operationMe(spec, a, ex)) return true;

    const role = user[spec.role];
    // no role, no further
    if (!role) return false;

    if (role instanceof Array) {
      return role.some(r => allow(r, ex));
    }

    return allow(role, ex);
  };
}

export default { allow, check };
