import type { AccessArgs } from "payload/types";

import basic from "./kit/basic";
import access from "./spec/access";
import type { Expectation, LenientOpts, Opts, Spec } from "./types";

const defaults: Opts = {
  user: {
    slug: "user",
    tag: { singular: { en: "User", zh: "用户" } },
  },
  role: {
    slug: "role",
    tag: { singular: { en: "Role", zh: "角色" } },
  },
  label: {
    active: { en: "Active Flag", zh: "生效标记" },
    features: { en: "Features", zh: "功能" },
    verbs: { en: "Verbs", zh: "谓词" },
    traits: { en: "Traits", zh: "特征" },
    feature: { en: "Feature", zh: "功能" },
    roleName: { en: "Role Name", zh: "角色名" },
    "<admin>": { en: "< Admin Panel >", zh: "< 管理面板 >" },
    "<unlock>": { en: "< Unlock >", zh: "< 解锁用户 >" },
    create: { en: "Create", zh: "新增" },
    read: { en: "Read", zh: "读取" },
    update: { en: "Update", zh: "更新" },
    delete: { en: "Delete", zh: "删除" },
  },
};

/**
 * Produces conventional {@link Opts} with given extension {@link LenientOpts}.
 */
export function opts(ext: LenientOpts): Opts {
  return basic.merge({}, defaults, ext) as Opts;
}

/**
 * A conventional variant of {@link access.check} with the {@link Spec} set to
 * the default user and role slugs.
 */
export function check(
  ex: Expectation,
  {
    user = defaults.user.slug,
    role = defaults.role.slug,
  }: { user?: string; role?: string } = {},
): (a: AccessArgs<any, any>) => boolean | Promise<boolean> {
  return access.check(ex, { user, role });
}

export default { opts, check };
