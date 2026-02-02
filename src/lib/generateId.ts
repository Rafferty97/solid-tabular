export function generateId<T extends string>(): T {
  return crypto.randomUUID().substring(0, 8) as T
}
