import { createMemo, Show } from 'solid-js'
import { devicePixelRatio } from 'src/lib/devicePixelRatio'
import './Outline.css'

export type Rect = {
  top: number
  left: number
  width: number
  height: number
}

export interface OutlineProps {
  rect?: Rect
  highlight?: Rect
  headerLeft?: number
  headerTop?: number
  expand: boolean
}

export function Outline(props: OutlineProps) {
  const px = (sz = 1) => sz / devicePixelRatio()
  const expand = (sz = 1) => (props.expand ? sz / devicePixelRatio() : 0)

  return (
    <Show when={props.rect}>
      <div
        class="solid-tabular/cell-outline"
        style={{
          left: `${props.headerLeft ? props.headerLeft - px(2) : props.rect!.left - expand()}px`,
          top: `${props.headerTop ? props.headerTop - px(2) : props.rect!.top - expand()}px`,
          width: `${props.headerLeft ? px(2) : props.rect!.width + expand(2)}px`,
          height: `${props.headerTop ? px(2) : props.rect!.height + expand(2)}px`,
          'box-shadow': `
              inset 0 0 0 ${px(2)}px var(--solid-tabular-outline-color, black),
              inset 0 0 0 ${px(3)}px white`,
        }}
      >
        <Show when={props.highlight}>
          <Highlight inner={props.highlight!} outer={props.rect!} />
        </Show>
      </div>
    </Show>
  )
}

function Highlight(props: { outer: Rect; inner: Rect }) {
  const px = (sz = 1) => sz / devicePixelRatio()

  const points = createMemo(() => {
    const x1 = props.inner.left - props.outer.left - px()
    const x2 = props.inner.left - props.outer.left + props.inner.width - px(3)
    const y1 = props.inner.top - props.outer.top - px()
    const y2 = props.inner.top - props.outer.top + props.inner.height - px(3)
    return [
      [x1, y1],
      [x1, y2],
      [x2, y2],
      [x2, y1],
      [x1, y1],
    ]
      .map(([x, y]) => `${x}px ${y}px`)
      .join(', ')
  })

  return (
    <div
      class="solid-tabular/shade"
      style={{
        'clip-path': `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${points()})`,
        inset: `${px(3)}px`,
      }}
    />
  )
}
