export function isPrintableKey(ev: KeyboardEvent): boolean {
  return ev.key.length === 1 && !ev.altKey && !ev.ctrlKey && !ev.metaKey
}
