/**
 * Gets the dirname of the given payload field path.
 *
 * @param path the payload field path
 * @returns [`dir` the dirname, `ok` if it is successfully extracted]
 */
export function dirname(path: string): [dir: string, ok: boolean] {
  const dot = path.lastIndexOf(".");
  if (dot === -1) {
    return [path, false];
  }

  return [path.substring(0, dot), true];
}

/**
 * Gets the sibling's path of the given payload field path, identified by the
 * given name.
 *
 * @param path the payload field path
 * @param name the name of the target sibling
 * @returns the sibling's payload field path
 */
export function sibling(path: string, name: string): string {
  const [dir, ok] = dirname(path);
  if (!ok) {
    // if the dir could not be obtained, assume it as the root
    return name;
  }

  return `${dir}.${name}`;
}

export default { dirname, sibling };
