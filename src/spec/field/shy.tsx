import * as React from "react";
import { Checkbox as PayloadCheckbox } from "payload/components/forms";
import { RelationshipComponent } from "payload/components/fields/Relationship";

export function shy(props: any): boolean {
  if (!props.permissions) return true;

  const {
    permissions: {
      create: { permission: c },
      read: { permission: r },
      update: { permission: u },
      delete: { permission: d },
    },
  } = props;

  return !(c || r || u || d);
}

export const Relationship: React.FC<any> = props =>
  shy(props) ? <></> : <RelationshipComponent {...props} />;

export const Checkbox: React.FC<any> = props =>
  shy(props) ? <></> : <PayloadCheckbox {...props} />;

export default { Relationship, Checkbox, shy };
