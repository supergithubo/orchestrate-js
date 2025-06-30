/**
 * Returns a shallow copy of the object with all undefined values removed.
 * @param obj The source object.
 * @returns A new object with no undefined values.
 */
export function filterUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Returns the extension to use for dynamic service imports based on environment.
 * Use 'ts' for ts-node/dev, 'js' for production/compiled.
 */
export function getLoaderExtension(): "ts" | "js" {
  if (process.env.TS_NODE || process.env.NODE_ENV === "development") {
    return "ts";
  }
  return "js";
}

export default {
  filterUndefined,
  getLoaderExtension,
};
