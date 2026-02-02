import { Accessor, createSignal, onCleanup, onMount } from 'solid-js'
import { Rect } from '../lib/rect'

export function watchViewport(element: () => HTMLElement): Accessor<Rect> {
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
