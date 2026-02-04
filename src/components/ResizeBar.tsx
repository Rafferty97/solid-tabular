import { createEffect, createMemo, createSignal, JSX, onCleanup } from 'solid-js'
import { devicePixelRatio } from 'src/lib/devicePixelRatio'
import { cn } from 'src/lib/classnames'
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
  let element: HTMLDivElement | undefined

  const [resizing, setResizing] = createSignal(false)

  let start = 0
  let startSize = 0
  let started = false

  const onPointerDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return

    ev.preventDefault()
    ev.stopPropagation()
    element?.setPointerCapture(ev.pointerId)

    start = ev[props.horiz ? 'pageY' : 'pageX']
    startSize = props.size
    started = false

    setResizing(true)
  }

  const onPointerMove = (ev: MouseEvent) => {
    if (!resizing()) return

    const delta = ev[props.horiz ? 'pageY' : 'pageX'] - start
    if (!started) {
      if (Math.abs(delta) < (props.minDelta ?? 4)) return
      started = true
    }

    let size = Math.max(startSize + delta, 0)
    if (props.min != null && size < props.min) size = props.min
    if (props.max != null && size > props.max) size = props.max
    props.setSize(size)
  }

  const onPointerUp = () => setResizing(false)

  const px = createMemo(() => 1 / devicePixelRatio())

  return (
    <div
      ref={element}
      data-solid-tabular-resize-bar
      class={cn(
        props.class,
        'solid-tabular/resizebar',
        props.horiz ? 'solid-tabular/horizontal' : 'solid-tabular/vertical',
      )}
      style={props.style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDblClick={props.resetSize}
    >
      <div
        data-resizing={resizing()}
        style={{
          [props.horiz ? 'height' : 'width']: `${3 * px()}px`,
          [props.horiz ? 'width' : 'height']: 'calc(100% - 4px)',
        }}
      />
    </div>
  )
}
