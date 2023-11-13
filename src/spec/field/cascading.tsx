import * as React from "react";
import { SelectInput, useField, useFormFields } from "payload/components/forms";
import type { Field, OptionObject } from "payload/types";

import { sibling } from "../../kit/path";
import type { Label } from "../definition/label";

/**
 * The {@link Select}'s options.
 */
export type CascadingOptions = {
  ref: string;
  label: Label;
  selector: (value: string) => OptionObject[];
};

/**
 * Creates a {@link React.FC} that renders a cascading {@link SelectInput}, using the
 * information provided in the given {@link CascadingOptions}.
 */
export function Select({
  ref,
  label,
  selector,
}: CascadingOptions): React.FC<{ path: string; options: string[] }> {
  return ({ path }) => {
    const [options, setOptions] = React.useState<OptionObject[]>([]);
    const { value, setValue } = useField<string[]>({ path });
    const trait = useFormFields(([fields]) => fields[sibling(path, ref)]);
    const v = React.useRef<string>(trait?.value as string); // hold the current trait value

    React.useEffect(() => {
      const selected = selector(trait?.value as string);
      setOptions(selected);
      if (v.current === trait?.value) return; // same trait values, no need to update

      setValue(
        selected.map(option => option.value),
        true, // disable modifying form
      );

      v.current = trait?.value as string; // hold the latest trait value
    }, [trait]);

    return (
      <>
        <SelectInput
          path={path}
          name={path}
          options={options}
          value={value}
          hasMany={true}
          defaultValue={options.map(x => ({ value: x.value }))}
          label={label}
          onChange={x => {
            if (x instanceof Array) {
              setValue(x.map(option => option.value));
              return;
            }
            setValue(x.value);
          }}
        />
      </>
    );
  };
}

/**
 * Creates a decent cascading {@link Select} field.
 */
export function field(options: CascadingOptions, { name = "traits" }): Field {
  return {
    type: "json",
    name,
    admin: {
      components: {
        Field: Select(options),
      },
    },
  };
}

export default { Select, field };
