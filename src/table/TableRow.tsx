import { For } from 'solid-js'
import { PositionedColumn } from './types'
import { Cell } from './Cell'
import { Z_INDEX } from './zIndex'
import { TextContent } from './CellContent'

export interface TableRowProps<K> {
  columns: PositionedColumn<K>[]
  rowIdx: number
  top: number
  height: number
  isActive: boolean
  getCellValue: (row: number, column: PositionedColumn<K>) => unknown
  setCellValue?: (rowIdx: number, colId: K, value: unknown) => void
  onMouseDown: (ev: MouseEvent, i: number, j: number) => void
  onMouseContextDown?: (ev: MouseEvent, i: number, j: number) => void
  onContextMenu?: (ev: MouseEvent, i: number, j: number) => void
  onEditCell?: (pos: number) => void
  extActiveColumn?: K
}

export function TableRow<K>(props: TableRowProps<K>) {
  return (
    <div class={['row', props.isActive ? 'active' : ''].join(' ')}>
      <For each={props.columns}>
        {col => (
          <div
            class="row-cell"
            style={{
              width: `${col.width}px`,
              height: `${props.height}px`,
              transform: `translate(${col.left}px, ${props.top}px)`,
              'z-index': Z_INDEX.CELL,
            }}
            onMouseDown={ev => {
              if (ev.button === 0) props.onMouseDown(ev, props.rowIdx, col.index)
              if (ev.button === 2) props.onMouseContextDown?.(ev, props.rowIdx, col.index)
            }}
            onContextMenu={ev => props.onContextMenu?.(ev, props.rowIdx, col.index)}
          >
            {/* <Cell
              component={col.component ?? TextContent}
              format={col.format ?? {}}
              editable={col.readonly !== true}
              value={props.getCellValue(props.rowIdx, col)}
              setValue={value => props.setCellValue?.(props.rowIdx, col.id, value)}
              onEdit={props.onEditCell}
              extActive={col.id === props.extActiveColumn}
            /> */}
          </div>
        )}
      </For>
    </div>
  )
}
