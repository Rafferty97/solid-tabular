import './AddColumnButton.css'

export interface AddColumnButtonProps {
  tableWidth: number
  width: number
  height: number
  onPointerDown: () => void
}

export function AddColumnButton(props: AddColumnButtonProps) {
  return (
    <div class="solid-tabular/add-column-btn" style={{ left: `${props.tableWidth}px` }}>
      <div
        style={{ width: `80px`, height: `${props.height}px` }}
        onMouseDown={ev => ev.button === 0 && props.onPointerDown()}
      >
        +
      </div>
    </div>
  )
}
