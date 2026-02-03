import { JSXElement } from 'solid-js'
import { calcCursorPosition } from '../lib/cursor'
import { cn } from 'src/lib/utils'

export type CellContentProps = {
  value: unknown
  setValue?: (value: unknown) => void
  onEdit?: (pos: number) => void
  editable: boolean
  format: CellFormat
}

export type CellFormat = Partial<{
  align: Alignment
  content: (value: unknown) => string
  prefix: (value: unknown) => JSXElement
  suffix: (value: unknown) => JSXElement
  color: string
}>

export type Alignment = 'left' | 'center' | 'right'

export function TextContent(props: CellContentProps) {
  let contentEl: HTMLDivElement | undefined

  const handleDoubleClick = (ev: MouseEvent) => {
    ev.stopPropagation()
    props.onEdit?.(contentEl ? calcCursorPosition(contentEl, ev.pageX) : 0)
  }

  return (
    <div
      onDblClick={handleDoubleClick}
      class="text-content"
      style={{ color: props.format.color ?? 'black' }}
    >
      {props.format.prefix?.(props.value)}
      <div
        class={cn('text-content-inner', {
          'align-right': props.format.align === 'right',
          'align-center': props.format.align === 'center',
        })}
      >
        <span ref={contentEl}>{props.format.content?.(props.value) ?? String(props.value)}</span>
      </div>
      {props.format.suffix?.(props.value)}
    </div>
  )
}

export function CheckboxContent(props: CellContentProps) {
  return (
    <div class="checkbox-content">
      <label>
        <input
          type="checkbox"
          class="sr-only"
          checked={!!props.value}
          onChange={ev => props.setValue?.(ev.target.checked)}
          disabled={!props.editable}
        />
        <div
          class={cn(
            'checkbox-box',
            props.value ? 'checked' : 'unchecked',
            props.editable ? 'editable' : 'readonly',
          )}
        >
          {!!props.value && (
            <svg
              class="checkbox-icon"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 4.5l-7 7-4-4"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.5 4.5l-7 7-4-4"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          )}
        </div>
      </label>
    </div>
  )
}
