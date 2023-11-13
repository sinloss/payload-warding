export function should(
  { custom }: { custom?: any },
  verb?: string,
  fallback = true,
): boolean {
  const should = custom?.warding?.should;
  if (typeof should === "boolean") {
    return should;
  }

  if (verb) {
    return should?.[verb] ?? fallback;
  }

  // always return true when there's no explicit boolean value 'should' assigned
  // in cases where the 'verb' is not specified.
  return true;
}

export default { should };
