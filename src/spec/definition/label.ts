import pluralize, { singular } from "pluralize";

/**
 * Describes the label of fields
 */
export type Label = Record<string, string> | string;

/**
 * Describes the labels of collections
 */
export type Labels = {
  plural?: Record<string, string> | string;
  singular?: Record<string, string> | string;
};

export function tagSanitize(tag: Labels): Labels {
  if (tag?.singular && !tag?.plural) {
    tag.plural = labelSanitize(pluralize, tag.singular);
  } else if (tag?.plural && !tag?.singular) {
    tag.singular = labelSanitize(singular, tag.plural);
  }

  return tag;
}

export function labelSanitize(
  sanitize: (word: string) => string,
  label: Label,
): Label {
  if (!label) return label;
  if (typeof label === "string") {
    return sanitize(label);
  }

  return Object.keys(label).reduce((m: { [k: string]: string }, k) => {
    m[k] = sanitize(label[k]);
    return m;
  }, {});
}

export default { tagSanitize, labelSanitize };
