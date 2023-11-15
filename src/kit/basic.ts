import { isPlainObject, type PlainObject } from "./typing";

/**
 * Map the possible {@link T} or an array of {@link T} to a corresponding
 * {@link V} or an array of {@link V}.
 */
export function map<T, V>(v: T | T[], fn: (x: T) => V): V | V[] {
  return Array.isArray(v) ? v.map(fn) : fn(v);
}

/**
 * Checks if every elements of the given list are included / excluded in the
 * expected strings.
 */
export function expect(
  included?: boolean,
  list?: string[],
  ...expected: string[]
): boolean {
  return (list ?? []).every(x => expected.includes(x) === (included ?? true));
}

/**
 * Patchs a {@link PlainObject} with a key-value pair. This implements the
 * RFC-7386. See {@link https://datatracker.ietf.org/doc/html/rfc7386} for
 * details
 */
export function patch(to: PlainObject, key: string, value: any): void {
  if (!to) return;

  if (value === null) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete to[key];
    return;
  }

  // ignore undefined values
  if (value === undefined) return;

  let t = to[key];
  if (isPlainObject(value)) {
    if (!isPlainObject(t)) {
      // expecting a plain object yet got something else other than nothing, so
      // stop here
      if (t !== undefined && t !== null) return;

      // and if that is undefined or null, create a new plain object then
      t = to[key] = {};
    }

    // patch nested plain objects
    Object.keys(value).forEach(key => patch(t, key, value[key]));
    return;
  }

  // otherwise just set the value
  to[key] = value;
}

/**
 * Merges multiple subsequent {@link T}s into the first {@link T}, deeply, using
 * the {@link patch} function.
 */
export function merge<T extends PlainObject>(to: T, ...froms: T[]): T {
  if (froms.length === 0) return to;
  const from = froms.shift()!;

  // patch the `to` object
  Object.keys(from).forEach(k => patch(to, k, from[k]));

  // go on merging the rest froms
  return merge(to, ...froms);
}

export default { map, expect, patch, merge };
