import type { Config, Plugin } from "payload/config";

import { Warding } from "./factory/warding";
import type { Opts } from "./types";

/**
 * Create the warding {@link Plugin}.
 */
function warding({ root, user, role, label, ext, mod, mute }: Opts): Plugin {
  return (incoming: Config): Config => {
    if (mute ?? false) return incoming;

    // collection all features
    const features = [
      ...(incoming.globals ?? []),
      ...(incoming.collections ?? []),
      ...(ext ?? []),
    ];

    if (features.length === 0) {
      return incoming;
    }

    // warding build
    let w = new Warding(user).build(features, role, label);
    if (mod) {
      // modify the warding built result if possible
      w = mod(w);
    }

    return {
      ...incoming,
      admin: {
        ...incoming.admin,
        user: user.slug,
      },
      globals: incoming.globals?.map(x => w.warden.ward(x)) ?? [],
      collections: [
        ...(incoming.collections?.map(x => w.warden.ward(x, true)) ?? []),
        w.warden.ward(w.collections.user, true),
        w.warden.ward(w.collections.role, true),
      ],
      onInit: async payload => {
        if (incoming.onInit) {
          await incoming.onInit(payload);
        }
        return w.initialize(payload, root, w.initializationExtra);
      },
      custom: {
        ...incoming.custom,
        warding: {
          warden: w.warden,
          populate: w.populate,
        },
      },
    };
  };
}

export { default as convention } from "./convention";
export { default as access } from "./spec/access";
export { default as cascading } from "./spec/field/cascading";
export { default as shy } from "./spec/field/shy";
export { Warden } from "./spec/warden";
export * from "./types";

export default warding;
