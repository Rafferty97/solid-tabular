import { For } from 'solid-js'
import { PositionedColumn } from './types'
import { Cell } from './Cell'
import './TableRow.css'

export interface TableRowProps<Column, Value> {
  columns: PositionedColumn<Column, Value>[]
  row: number
  top: number
  height: number
  getCellValue: (row: number, column: Column) => Value
  setCellValue?: (row: number, column: Column, value: Value) => void
  onPointerDown: (ev: PointerEvent, i: number, j: number) => void
  onMouseContextDown?: (ev: MouseEvent, i: number, j: number) => void
  onContextMenu?: (ev: MouseEvent, i: number, j: number) => void
}

export function TableRow<Column, Value>(props: TableRowProps<Column, Value>) {
  return (
    <div class="solid-tabular/row">
      <For each={props.columns}>
        {col => (
          <div
            class="solid-tabular/row-cell"
            style={{
              width: `${col.width}px`,
              height: `${props.height}px`,
              transform: `translate(${col.left}px, ${props.top}px)`,
            }}
            onPointerDown={ev => {
              if (ev.button === 0) props.onPointerDown(ev, props.row, col.index)
              if (ev.button === 2) props.onMouseContextDown?.(ev, props.row, col.index)
            }}
            onContextMenu={ev => props.onContextMenu?.(ev, props.row, col.index)}
          >
            <Cell<Value>
              component={col.component}
              value={props.getCellValue(props.row, col.column)}
              setValue={value => props.setCellValue?.(props.row, col.column, value)}
            />
          </div>
        )}
      </For>
    </div>
  )
}
