import { Accessor, createSignal, SignalOptions } from 'solid-js'

export class Lens<T> {
  constructor(
    readonly get: Accessor<T>,
    readonly set: (value: T) => void,
    readonly cmp = (a: T, b: T) => a === b,
  ) {}

  prop<K extends keyof T>(key: K): Lens<T[K]> {
    return new Lens(
      () => this.get()[key],
      value => this.set({ ...this.get(), [key]: value }),
    )
  }

  index<U>(this: Lens<U[]>, index: number): Lens<U> {
    return new Lens(
      () => this.get()[index] as U,
      value => {
        const prev = this.get()
        this.set([...prev.slice(0, index), value, ...prev.slice(index + 1)])
      },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item<K extends keyof any, V>(this: Lens<Record<K, V> | undefined>, key: K, def: V): Lens<V> {
    return new Lens(
      () => this.get()?.[key] ?? def,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value => this.set({ ...this.get(), [key]: value } as any),
    )
  }

  default(def: NonNullable<T>): Lens<NonNullable<T>> {
    return new Lens(() => this.get() ?? def, this.set)
  }

  equals(other: T): boolean {
    return this.cmp(this.get(), other)
  }

  setter(value: T): () => void {
    return () => this.set(value)
  }
}

export function createSignalLens<T>(init: T, options?: SignalOptions<T>): Lens<T> {
  const [get, set] = createSignal(init, options)
  return new Lens<T>(get, set)
}
