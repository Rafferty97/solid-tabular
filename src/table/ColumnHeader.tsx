import { Dynamic } from 'solid-js/web'
import { PositionedColumn } from './types'
import { Renameable } from 'src/components/Renameable'
import ResizeBar from 'src/components/ResizeBar'
import './ColumnHeader.css'

export interface ColumnHeaderProps<K, T> {
  column: PositionedColumn<K, T>
  height: number
  columnsEditable?: boolean
  setColumnName?: (id: K, name: string) => void
  setColumnSize?: (id: K, width: number) => void
  resetColumnSize?: (id: K) => void
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
            setValue={name => props.setColumnName?.(props.column.id, name)}
            disabled={!props.columnsEditable}
          />
          <div style={{ flex: '1' }} />
          <Dynamic component={props.column.icon} />
        </div>
      </div>
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
        setSize={width => props.setColumnSize?.(props.column.id, width)}
        resetSize={() => props.resetColumnSize?.(props.column.id)}
      />
    </>
  )
}
