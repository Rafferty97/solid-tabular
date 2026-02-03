import { createEffect, createMemo, createSignal, onCleanup, Show, Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Handler } from 'src/lib/createEvent'
import { CellContentProps, CellFormat } from './CellContent'
import { Rect } from 'src/lib/rect'

export interface CellProps {
  component: Component<CellContentProps>
  format: CellFormat
  editable: boolean
  value: unknown
  setValue?: (value: unknown) => void
  onEdit?: (pos: number) => void
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

  return (
    <div ref={containerEl} class="cell" tabIndex={-1}>
      <Dynamic
        component={props.component}
        value={value()}
        setValue={props.setValue}
        onEdit={props.onEdit}
        editable={props.editable}
        format={props.format}
      />
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
    if (quickMode && ev.key.startsWith('Arrow')) {
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
    <div class="cell-input">
      <input
        ref={inputEl}
        // name="cellinput"
        style={{ 'text-align': props.format.align }}
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
      class="cell-input-container"
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
        setValue={value => props.setCellValue(value)}
        readonly={props.readonly}
        onFinishedEditing={props.onFinishedEditing}
        focus={props.focus}
        quickEdit={props.quickEdit}
      />
    </div>
  )
}
