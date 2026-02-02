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
      class={cn('flex w-full overflow-hidden p-1 whitespace-nowrap')}
      style={{ color: props.format.color ?? 'black' }}
    >
      {props.format.prefix?.(props.value)}
      <div
        class={cn('flex flex-1 overflow-hidden', {
          'flex-row-reverse': props.format.align === 'right',
          'justify-center': props.format.align === 'center',
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
    <div class="flex w-full items-center justify-center">
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
            'flex h-4 w-4 items-center justify-center rounded-sm border',
            props.value ? 'border-blue-700 bg-blue-600 text-blue-700' : 'border-gray-300 bg-white',
            props.editable ? 'cursor-pointer' : 'cursor-cell',
          )}
        >
          {!!props.value && (
            <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
