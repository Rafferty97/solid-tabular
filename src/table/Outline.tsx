import { Show } from 'solid-js'
import { devicePixelRatio } from 'src/lib/devicePixelRatio'
import { cn } from 'src/lib/classnames'

export interface OutlineProps {
  rect?: {
    top: number
    left: number
    width: number
    height: number
  }
  headerLeft?: number
  headerTop?: number
  expand: boolean
  shade?: boolean
}

export function Outline(props: OutlineProps) {
  const px = (sz = 1) => sz / devicePixelRatio()
  const expand = (sz = 1) => (props.expand ? sz / devicePixelRatio() : 0)
  return (
    <Show when={props.rect}>
      <div
        class={cn('solid-tabular/cell-outline', { 'solid-tabular/shade': props.shade })}
        style={{
          left: `${props.headerLeft ? props.headerLeft - px(2) : props.rect!.left - expand()}px`,
          top: `${props.headerTop ? props.headerTop - px(2) : props.rect!.top - expand()}px`,
          width: `${props.headerLeft ? px(2) : props.rect!.width + expand(2)}px`,
          height: `${props.headerTop ? px(2) : props.rect!.height + expand(2)}px`,
          'box-shadow': `
              inset 0 0 0 ${px(2)}px var(--solid-tabular-outline-color, black),
              inset 0 0 0 ${px(3)}px white`,
        }}
      />
    </Show>
  )
}
