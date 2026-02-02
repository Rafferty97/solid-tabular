import { createEffect, createMemo, createSignal, JSX, onCleanup } from 'solid-js'
import { devicePixelRatio } from '../lib/devicePixelRatio'
import { cn } from 'src/lib/utils'
import '../components/ResizeBar.css'

export interface ResizeBarProps {
  horiz?: boolean
  size: number
  setSize(size: number): void
  resetSize?: () => void
  min?: number
  max?: number
  class?: string
  style?: JSX.CSSProperties | string
  minDelta?: number
}

export default function ResizeBar(props: ResizeBarProps) {
  const [resizing, setResizing] = createSignal(false)
  let start = 0
  let startSize = 0
  let started = false

  const startResize = (ev: MouseEvent) => {
    if (ev.button !== 0) return
    ev.stopPropagation()
    start = ev[props.horiz ? 'pageY' : 'pageX']
    startSize = props.size
    started = false
    setResizing(true)
  }

  createEffect(() => {
    if (!resizing()) return

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev[props.horiz ? 'pageY' : 'pageX'] - start
      if (!started) {
        if (Math.abs(delta) < (props.minDelta ?? 4)) return
        document.body.classList.add(props.horiz ? 'dragging-ns' : 'dragging-ew')
        started = true
      }
      let size = Math.max(startSize + delta, 0)
      if (props.min != null && size < props.min) size = props.min
      if (props.max != null && size > props.max) size = props.max
      props.setSize(size)
    }
    const onMouseUp = () => setResizing(false)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    onCleanup(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.classList.remove('dragging-ns', 'dragging-ew')
    })
  })

  const px = createMemo(() => 1 / devicePixelRatio())

  return (
    <div
      class={cn(
        props.class,
        'resizebar z-10 flex items-center justify-center select-none',
        props.horiz ? 'right-0 left-0 cursor-ns-resize' : 'top-0 bottom-0 cursor-ew-resize',
      )}
      style={props.style}
      onMouseDown={startResize}
      onDblClick={props.resetSize}
    >
      <div
        class={`bg-primary-600 ${resizing() ? 'resizing' : ''}`}
        style={{
          [props.horiz ? 'height' : 'width']: `${3 * px()}px`,
          [props.horiz ? 'width' : 'height']: 'calc(100% - 4px)',
        }}
      />
    </div>
  )
}
