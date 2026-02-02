export function postRemovalSelection<K>(items: { id: K }[], selectedId: K, removeId: K): K | null {
  if (removeId !== selectedId) return selectedId
  const idx = items.findIndex(item => item.id === selectedId)
  return items[idx + 1]?.id ?? items[idx - 1]?.id ?? null
}
