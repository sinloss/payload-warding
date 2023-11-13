import type { CheckboxField } from "payload/types";

import collections from "../definition/collections";
import type { Label } from "../definition/label";
import shy from "./shy";

export function active(label?: Label): CheckboxField {
  return {
    type: "checkbox",
    name: collections.name("active"),
    defaultValue: true,
    required: true,
    admin: { components: { Field: shy.Checkbox } },
    label,
  };
}

export default { active };
