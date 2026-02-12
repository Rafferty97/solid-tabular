import { createEffect, createSignal, Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Handler, nullHandler } from 'src/lib/createEvent'
import { Rect } from 'src/lib/rect'
import './Cell.css'

export interface CellProps<T> {
  component: Component<CellContentProps<T>>
  value: T
  setValue(value: T): void
}

export interface CellInputProps<T> {
  component: Component<CellContentProps<T>>
  rect: Rect
  value: T
  setValue(value: T): void
  onFinishedEditing(): void
  quickEdit: Handler<KeyboardEvent>
  onPointerDown?: (ev: PointerEvent) => void
}

export type CellContentProps<T = unknown> = {
  /** The value in the cell. */
  value: T
  /** Whether the cell is in "edit mode." */
  editing: boolean
  /** Updates the value of the cell. */
  setValue(value: T): void
  /** Fired when a quick edit has been triggered by a keyboard event. */
  quickEdit: Handler<KeyboardEvent>
  /** Returns focus to the table. */
  onFinishedEditing(): void
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
        quickEdit={nullHandler()}
        onFinishedEditing={() => {}}
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
      onPointerDown={props.onPointerDown}
    >
      <Dynamic
        component={props.component}
        value={props.value}
        editing={true}
        setValue={value => props.setValue(value)}
        quickEdit={props.quickEdit}
        onFinishedEditing={props.onFinishedEditing}
      />
    </div>
  )
}
