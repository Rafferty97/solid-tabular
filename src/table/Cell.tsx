import { createEffect, createSignal, Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Handler, nullHandler } from 'src/lib/createEvent'
import { Rect } from 'src/lib/rect'
import './Cell.css'

export interface CellProps<T> {
  component: Component<CellContentProps<T>>
  value: T
  setValue(value: T): void
  onEdit(pos: number): void
}

export interface CellInputProps<T> {
  component: Component<CellContentProps<T>>
  rect: Rect
  value: T
  setValue(value: T): void
  onFinishedEditing(): void
  focus: Handler<{ start: number; end?: number }>
  quickEdit: Handler<void>
}

export type CellContentProps<T = unknown> = {
  value: T
  editing: boolean
  setValue(value: T): void
  onEdit(pos: number): void
  onFinishedEditing(): void
  focus: Handler<{ start: number; end?: number }>
  quickEdit: Handler<void>
}

export function Cell<T>(props: CellProps<T>) {
  let containerEl: HTMLDivElement | undefined

  // Eliminate flicker
  const [value, setValue] = createSignal(props.value)
  createEffect(() => props.value !== undefined && setValue(() => props.value))

  return (
    <div ref={containerEl} class="solid-tabular/cell" tabIndex={-1}>
      <Dynamic
        component={props.component}
        value={value()}
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

export function CellInputContainer<T>(props: CellInputProps<T>) {
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
        value={props.value}
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
