import type { Built, Label, Options } from "./factory/spec";
import type { Warding } from "./factory/warding";
import type { Concrete } from "./kit/typing";
import type { Synopsis } from "./spec/definition/feat";

/**
 * A lenient options for the warding plugin, which allows the `user` and `role`
 * options to be optional.
 */
export type LenientOpts = {
  /**
   * The root user's email and password. If not provided, the root user will not
   * be created.
   */
  root?: {
    email: string;
    password: string;
  };
  /**
   * The user {@link Options}.
   */
  user?: Options;
  /**
   * The role {@link Options}.
   */
  role?: Options;
  /**
   * All the labels for plugin introduced collections, fields and select options.
   */
  label?: Label;
  /**
   * Extended features in the form of {@link Synopsis}s.
   */
  ext?: Synopsis[];
  /**
   * Modifies the {@link Built} result after {@link Warding.build}.
   */
  mod?: (w: Built) => Built;
  /**
   * Disable this plugin without uninstalling it.
   */
  mute?: boolean;
};

/**
 * The concrete variant of the {@link LenientOpts} in which the `user` and the
 * `role` options are mandatory.
 */
export type Opts = Concrete<LenientOpts, "user" | "role">;

export {
  Built,
  Label,
  Options,
  Populate,
  RolePopulate,
  UserPopulate
} from "./factory/spec";
export { Access, Expectation } from "./spec/access";
export { Role, Spec, User } from "./spec/definition/collections";
export { FeatureValue, NameLabelPair, Synopsis } from "./spec/definition/feat";
export {
  Label as SpecLabel,
  Labels as SpecLabels
} from "./spec/definition/label";
export { CascadingOptions } from "./spec/field/cascading";

