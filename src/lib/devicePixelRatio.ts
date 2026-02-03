import { Accessor, createMemo, createSignal } from 'solid-js'

const isServer = typeof window === 'undefined'

export function getDevicePixelRatio() {
  if (isServer) return 1
  const ratio = window.devicePixelRatio
  return ratio / Math.floor(ratio)
}

export const devicePixelRatio = (() => {
  if (isServer) return () => 1

  const [dpr, setDpr] = createSignal(getDevicePixelRatio())

  let cleanup: (() => void) | undefined

  const updatePixelRatio = () => {
    cleanup?.()
    setDpr(getDevicePixelRatio())
    const media = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    media.addEventListener('change', updatePixelRatio)
    cleanup = () => media.removeEventListener('change', updatePixelRatio)
  }

  updatePixelRatio()

  return dpr
})()

export function createSize(raw: Accessor<number> | number) {
  return createMemo(() => {
    const ratio = devicePixelRatio()
    return Math.round((typeof raw === 'function' ? raw() : raw) * ratio) / ratio
  })
}
