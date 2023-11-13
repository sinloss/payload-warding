import type { FeatureValue } from "./feat";
import type { Lookup } from "./lookup";

/**
 * The spec of user's and role's slugs.
 */
export type Spec = {
  user: string;
  role: string;
};

/**
 * Describes a portion of the structure of the user collection.
 */
export type User = {
  email: string;
  active: boolean;
};

/**
 * Describes a portion of the structure of the role collection.
 */
export type Role = {
  id: string | number;
  name: string;
  features: FeatureValue[];
  lookup: Lookup;
};

/**
 * The name of the root role.
 */
export const root = "root";

export function name(k: keyof Role | keyof User): keyof Role | keyof User {
  return k;
}

export default { name, root };
