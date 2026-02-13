import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { PositionedColumn } from './types'
import { Renameable } from 'src/components/Renameable'
import ResizeBar from 'src/components/ResizeBar'
import './ColumnHeader.css'

export interface ColumnHeaderProps<Column, Value> {
  column: PositionedColumn<Column, Value>
  height: number
  columnsRenameable?: boolean
  columnsResizeable?: boolean
  setColumnName?: (column: Column, name: string) => void
  setColumnSize?: (column: Column, width: number) => void
  resetColumnSize?: (column: Column) => void
  onPointerDown?: (ev: PointerEvent) => void
}

export function ColumnHeader<K, T>(props: ColumnHeaderProps<K, T>) {
  return (
    <>
      <div
        class="solid-tabular/column-header"
        style={{
          width: `${props.column.width}px`,
          height: `${props.height}px`,
          transform: `translate(${props.column.left}px, 0px)`,
        }}
        onPointerDown={props.onPointerDown}
      >
        <div>
          <Renameable
            class="solid-tabular/renameable"
            value={props.column.name}
            setValue={name => props.setColumnName?.(props.column.column, name)}
            disabled={!props.columnsRenameable}
          />
          <div style={{ flex: '1' }} />
          <Dynamic component={props.column.icon} />
        </div>
      </div>
      <Show when={props.columnsResizeable}>
        <ResizeBar
          style={{
            position: 'absolute',
            top: '0',
            margin: '0 0 0 -4px',
            width: '9px',
            height: `${props.height - 1}px`,
            transform: `translate(${props.column.right}px, 0px)`,
            'z-index': 10,
          }}
          size={props.column.width}
          setSize={width => props.setColumnSize?.(props.column.column, width)}
          resetSize={() => props.resetColumnSize?.(props.column.column)}
        />
      </Show>
    </>
  )
}
