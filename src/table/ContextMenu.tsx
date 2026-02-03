import { JSXElement } from 'solid-js'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from 'src/components/ContextMenu'

export function CellContextMenu(props: {
  editable: boolean
  copy(): void
  paste(): void
  clear(): void
  insertRows(): void
  insertColumns(): void
  removeRows(): void
  removeColumns(): void
  children: JSXElement
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent class="cell-ctx-menu">
        <ContextMenuGroup>
          <ContextMenuItem onClick={props.copy}>
            <span>Copy</span>
            {/* <ContextMenuShortcut>⌘+C</ContextMenuShortcut> */}
          </ContextMenuItem>
          <ContextMenuItem disabled={!props.editable} onClick={props.paste}>
            <span>Paste</span>
            {/* <ContextMenuShortcut>⌘+V</ContextMenuShortcut> */}
          </ContextMenuItem>
          <ContextMenuItem disabled={!props.editable} onClick={props.clear}>
            <span>Clear cells</span>
            {/* <ContextMenuShortcut>Backspace</ContextMenuShortcut> */}
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem disabled={!props.editable} onClick={props.insertRows}>
            Insert row(s)
          </ContextMenuItem>
          <ContextMenuItem disabled={!props.editable} onClick={props.insertColumns}>
            Insert column(s)
          </ContextMenuItem>
          <ContextMenuItem disabled={!props.editable} onClick={props.removeRows}>
            Delete row(s)
          </ContextMenuItem>
          <ContextMenuItem disabled={!props.editable} onClick={props.removeColumns}>
            Delete column(s)
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
