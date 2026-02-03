import { onCleanup } from 'solid-js'

export type Handler<T> = (callback: (payload: T) => void) => void

export function createEvent<T>() {
  const listeners = new Set<(payload: T) => void>()

  const subscribe: Handler<T> = callback => {
    listeners.add(callback)
    onCleanup(() => listeners.delete(callback))
  }

  const emit = (payload: T) => {
    for (const listener of listeners) {
      listener(payload)
    }
  }

  return [subscribe, emit] as const
}
