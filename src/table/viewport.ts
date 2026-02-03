import { Accessor, createSignal, onCleanup, onMount } from 'solid-js'
import { Rect } from '../lib/rect'

const isServer = typeof window === 'undefined'

export function watchViewport(element: () => HTMLElement): Accessor<Rect> {
  if (isServer) return () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })

  const [viewport, setViewport] = createSignal({
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  onMount(() => {
    const el = element()

    const update = () => {
      const left = el.scrollLeft
      const top = el.scrollTop
      const width = el.clientWidth
      const height = el.clientHeight
      const right = left + width
      const bottom = top + height
      setViewport({ left, right, top, bottom, width, height })
    }

    const observer = new ResizeObserver(update)

    el.addEventListener('scroll', update)
    observer.observe(el)

    onCleanup(() => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    })
  })

  return viewport
}
