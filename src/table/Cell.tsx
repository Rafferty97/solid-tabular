import { createEffect, createSignal, Component, JSXElement } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Handler, nullHandler } from 'src/lib/createEvent'
import { Rect } from 'src/lib/rect'
import './Cell.css'

export interface CellProps {
  component: Component<CellContentProps>
  format: CellFormat
  readonly: boolean
  value: unknown
  setValue(value: unknown): void
  onEdit(pos: number): void
}

export interface CellInputProps {
  component: Component<CellContentProps>
  rect: Rect
  format: CellFormat
  readonly: boolean
  value: unknown
  setValue(value: unknown): void
  onFinishedEditing(): void
  focus: Handler<{ start: number; end?: number }>
  quickEdit: Handler<void>
}

export type CellContentProps<T = string> = {
  value: T
  readonly: boolean
  format: CellFormat
  editing: boolean
  setValue(value: T): void
  onEdit(pos: number): void
  onFinishedEditing(): void
  focus: Handler<{ start: number; end?: number }>
  quickEdit: Handler<void>
}

export type CellFormat = Partial<{
  align: Alignment
  content: (value: unknown) => string
  prefix: (value: unknown) => JSXElement
  suffix: (value: unknown) => JSXElement
  color: string
}>

export type Alignment = 'left' | 'center' | 'right'

export function Cell(props: CellProps) {
  let containerEl: HTMLDivElement | undefined

  // Eliminate flicker
  const [value, setValue] = createSignal(props.value)
  createEffect(() => props.value !== undefined && setValue(props.value))

  return (
    <div ref={containerEl} class="solid-tabular/cell" tabIndex={-1}>
      <Dynamic
        component={props.component}
        value={value() as string} // FIXME
        readonly={props.readonly}
        format={props.format}
        editing={false}
        setValue={props.setValue}
        onEdit={props.onEdit}
        onFinishedEditing={() => {}}
        focus={nullHandler()}
        quickEdit={nullHandler()}
      />
    </div>
  )
}

export function CellInputContainer(props: CellInputProps) {
  return (
    <div
      class="solid-tabular/cell-input-container"
      style={{
        left: `${props.rect.left}px`,
        top: `${props.rect.top}px`,
        width: `${props.rect.width}px`,
        height: `${props.rect.height}px`,
      }}
    >
      <Dynamic
        component={props.component}
        value={props.value as string} // FIXME
        readonly={props.readonly}
        format={props.format}
        editing={true}
        setValue={value => props.setValue(value)}
        onEdit={() => {}}
        onFinishedEditing={props.onFinishedEditing}
        focus={props.focus}
        quickEdit={props.quickEdit}
      />
    </div>
  )
}
