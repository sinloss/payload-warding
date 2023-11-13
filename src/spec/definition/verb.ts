import type { Vtypes } from "../../kit/typing";
import type { Label } from "./label";

/**
 * The available verbs of feature keys.
 */
export enum Verb {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

/**
 * The http methods to {@link Verb} mapping.
 */
export const map = {
  // create
  post: Verb.CREATE,
  // read
  connect: Verb.READ,
  options: Verb.READ,
  head: Verb.READ,
  get: Verb.READ,
  // update
  put: Verb.UPDATE,
  patch: Verb.UPDATE,
  // delete
  delete: Verb.DELETE,
};

/**
 * All the values of the {@link Verb}.
 */
export const verbs: Verb[] = Object.values(Verb);

/**
 * The label definition of the {@link Verb}s.
 */
export type VerbLabel = {
  [k in Vtypes<typeof verbs>]: Label;
};

export default { Verb, verbs, map };
