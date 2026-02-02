import { createEffect, createMemo, createSignal, onCleanup, Show, Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Handler } from 'solid-events'
import { CellContentProps, CellFormat } from './CellContent'
import { Rect } from '../lib/rect'
import { cn } from 'src/lib/utils'
import './Cell.css'

export interface CellProps {
  component: Component<CellContentProps>
  format: CellFormat
  editable: boolean
  value: unknown
  setValue?: (value: unknown) => void
  onEdit?: (pos: number) => void
  extActive?: boolean
}

export interface CellInputProps {
  format: CellFormat
  value: unknown
  setValue: (value: string) => void
  readonly?: boolean
  onFinishedEditing?: () => void
  focus: Handler<{ start: number; end?: number }>
  quickEdit: Handler<void>
}

export function Cell(props: CellProps) {
  let containerEl: HTMLDivElement | undefined

  // Eliminate flicker
  const [value, setValue] = createSignal(props.value)
  createEffect(() => props.value !== undefined && setValue(props.value))

  const isNull = () => value() === null

  return (
    <div
      ref={containerEl}
      class={cn('cell relative flex h-full items-center text-sm outline-none', {
        'bg-cyan-600/6': props.extActive,
      })}
      tabIndex={-1}
    >
      <Show
        when={!isNull()}
        fallback={<span class="w-full rounded text-center text-xs text-gray-300 italic">NULL</span>}
      >
        <Dynamic
          component={props.component}
          value={value()}
          setValue={props.setValue}
          onEdit={props.onEdit}
          editable={props.editable}
          format={props.format}
        />
      </Show>
    </div>
  )
}

export function CellInput(props: CellInputProps) {
  let inputEl: HTMLInputElement | undefined

  let quickMode = true
  const value = createMemo(() => (props.value != null ? String(props.value) : ''))

  const edit = (start: number, end: number | null, quick: boolean) => {
    if (!inputEl) return
    quickMode = quick
    inputEl.scrollLeft = 0
    inputEl.setSelectionRange(start, end ?? inputEl.value.length)
    inputEl.focus({ preventScroll: true })
  }
  props.focus(({ start, end }) => edit(start, end ?? null, false))
  props.quickEdit(() => edit(0, null, true))

  onCleanup(() => inputEl === document.activeElement && props.setValue(inputEl.value))

  const handleInputKeyDown = (ev: KeyboardEvent) => {
    if (!inputEl) return

    // Let these bubble up to the Table
    if (ev.key === 'Tab' || ev.key === 'Enter') {
      return
    }
    if (quickMode && ev.key?.startsWith('Arrow')) {
      return
    }

    if (ev.key === 'Escape') {
      ev.preventDefault()
      inputEl.value = value()
      props.onFinishedEditing?.()
      return
    }

    // Handle all other keys natively
    ev.stopPropagation()
  }

  return (
    <div class="cell-input pointer-events-auto">
      <input
        ref={inputEl}
        name="cellinput"
        class={cn('inset-0 block bg-white p-1 text-sm outline-none', {
          'text-right': props.format.align === 'right',
        })}
        value={value()}
        onChange={ev => props.setValue(ev.currentTarget.value)}
        onKeyDown={handleInputKeyDown}
        readOnly={props.readonly}
        onClick={() => (quickMode = false)}
        onDblClick={ev => ev.stopPropagation()}
        onPaste={ev => ev.stopPropagation()}
        tabIndex={-1}
      />
    </div>
  )
}

export interface CellInputContainerProps {
  rect: Rect
  format: CellFormat
  value: unknown
  readonly?: boolean
  setCellValue(value: string): void
  onFinishedEditing(): void
  focus: Handler<{ start: number; end?: number }>
  quickEdit: Handler<void>
}

export function CellInputContainer(props: CellInputContainerProps) {
  return (
    <div
      class="pointer-events-none absolute border border-transparent"
      style={{
        left: `${props.rect.left}px`,
        top: `${props.rect.top}px`,
        width: `${props.rect.width}px`,
        height: `${props.rect.height}px`,
      }}
    >
      <CellInput
        format={props.format}
        value={props.value}
        setValue={value => props.setCellValue?.(value)}
        readonly={props.readonly}
        onFinishedEditing={props.onFinishedEditing}
        focus={props.focus}
        quickEdit={props.quickEdit}
      />
    </div>
  )
}
