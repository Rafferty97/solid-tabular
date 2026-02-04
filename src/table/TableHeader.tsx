import { For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { PositionedColumn } from './types'
import ResizeBar from 'src/components/ResizeBar'
import { Renameable } from 'src/components/Renameable'

export interface TableHeaderProps<K> {
  height: number
  columns: PositionedColumn<K>[]
  columnsEditable?: boolean
  setColumnSize?: (colId: K, width: number) => void
  resetColumnSize?: (colId: K) => void
  setColumnName?: (colId: K, name: string) => void
  removeColumn(colId: K): void
}

export function TableHeader<K>(props: TableHeaderProps<K>) {
  return (
    <For each={props.columns}>
      {col => (
        <>
          <ColumnHeader
            column={col}
            height={props.height}
            columnsEditable={props.columnsEditable}
            setColumnName={props.setColumnName}
            removeColumn={props.removeColumn}
          />
          <ResizeBar
            class="solid-tabular/resize-bar"
            style={{
              position: 'absolute',
              top: '0',
              margin: '0 0 0 -4px',
              width: '9px',
              height: `${props.height - 1}px`,
              transform: `translate(${col.right}px, 0px)`,
            }}
            size={col.width}
            setSize={width => props.setColumnSize?.(col.id, width)}
            resetSize={() => props.resetColumnSize?.(col.id)}
          />
        </>
      )}
    </For>
  )
}

interface ColumnHeaderProps<K> {
  column: PositionedColumn<K>
  height: number
  columnsEditable?: boolean
  setColumnName?: (id: K, name: string) => void
  removeColumn(id: K): void
}

function ColumnHeader<K>(props: ColumnHeaderProps<K>) {
  // let labelEl: RenameableRef | undefined

  const handleContextMenu = async (ev: MouseEvent) => {
    ev.preventDefault()

    // const menuItems = await Promise.all([
    //   MenuItem.new({
    //     text: 'Rename',
    //     accelerator: 'R',
    //     action: () => labelEl?.startRename(),
    //     enabled: !!props.columnsEditable,
    //   }),
    //   MenuItem.new({
    //     text: 'Delete column',
    //     accelerator: 'D',
    //     action: () => props.removeColumn(props.column.id),
    //     enabled: !!props.columnsEditable,
    //   }),
    // ])

    // const menu = await Menu.new({
    //   items: menuItems,
    // })

    // await menu.popup().catch(e => console.error(e))
  }

  return (
    <div
      class="solid-tabular/column-header"
      style={{
        width: `${props.column.width}px`,
        height: `${props.height}px`,
        transform: `translate(${props.column.left}px, 0px)`,
      }}
      onContextMenu={handleContextMenu}
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
  )
}
