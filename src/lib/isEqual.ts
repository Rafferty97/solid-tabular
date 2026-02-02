/**
 * Solid-aware deep equality check that ignores Solid proxy symbols.
 * Based on radashi's isEqual but filters out Solid's internal symbols.
 */
export function isEqual<TType>(x: TType, y: TType): boolean {
  if (Object.is(x, y)) {
    return true
  }
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime()
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString()
  }
  if (typeof x !== 'object' || x === null || typeof y !== 'object' || y === null) {
    return false
  }

  // The key difference: filter out Solid symbols
  const keysX = Object.keys(x as unknown as object) as (keyof typeof x)[]
  const keysY = Object.keys(y as unknown as object)

  if (keysX.length !== keysY.length) {
    return false
  }
  for (let i = 0; i < keysX.length; i++) {
    if (!Reflect.has(y as unknown as object, keysX[i]!)) {
      return false
    }
    if (!isEqual(x[keysX[i]!], y[keysX[i]!])) {
      return false
    }
  }
  return true
}
