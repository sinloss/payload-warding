import type { Vtypes } from "../../kit/typing";
import type { Label } from "./label";

/**
 * The particular rules of authentication.
 */
export enum Rule {
  ADMIN = "<admin>",
  UNLOCK = "<unlock>",
}

/**
 * All the values of the {@link Rule}.
 */
export const rules: Rule[] = Object.values(Rule);

/**
 * The label definition of the {@link Rule}s.
 */
export type RuleLabel = { [k in Vtypes<typeof rules>]: Label };

export default { rules, Rule };
