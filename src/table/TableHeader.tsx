import { For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { PositionedColumn } from './types'
import ResizeBar from 'src/components/ResizeBar'
import { Renameable } from 'src/components/Renameable'
import { cn } from 'src/lib/utils'

export interface TableHeaderProps<K> {
  height: number
  columns: PositionedColumn<K>[]
  columnsEditable?: boolean
  onResizeColumn?: (colId: K, width: number | null) => void
  setColumnName?: (colId: K, name: string) => void
  removeColumn(colId: K): void
  extActiveColumn?: K
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
            extActive={col.id === props.extActiveColumn}
          />
          <ResizeBar
            class="absolute top-0 z-10 -ml-[4px] w-[9px]"
            style={{
              height: `${props.height - 1}px`,
              transform: `translate(${col.right}px, 0px)`,
            }}
            size={col.width}
            setSize={width => props.onResizeColumn?.(col.id, width)}
            resetSize={() => props.onResizeColumn?.(col.id, null)}
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
  extActive?: boolean
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
      class={'absolute top-0 border-b border-l border-gray-300 bg-white'}
      style={{
        width: `${props.column.width}px`,
        height: `${props.height}px`,
        transform: `translate(${props.column.left}px, 0px)`,
      }}
      onContextMenu={handleContextMenu}
    >
      <div
        class={cn('absolute inset-0 flex items-center gap-1 p-1', {
          'bg-cyan-600/6': props.extActive,
        })}
      >
        <Renameable
          class="min-w-0 text-sm font-bold"
          value={props.column.name}
          setValue={name => props.setColumnName?.(props.column.id, name)}
          disabled={!props.columnsEditable}
          terse
        />
        <div class="flex-1" />
        <Dynamic component={props.column.icon} size={12} />
      </div>
    </div>
  )
}
