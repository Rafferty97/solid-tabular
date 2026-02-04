import './AddRowButton.css'

export interface AddRowButtonProps {
  tableWidth: number
  cellHeight: number
  rowHeaderWidth: number
  onPointerDown: () => void
}

export function AddRowButton(props: AddRowButtonProps) {
  return (
    <div
      class="solid-tabular/add-row-btn"
      style={{
        width: `${props.tableWidth}px`,
        height: `${props.cellHeight}px`,
      }}
      onPointerDown={ev => ev.button === 0 && props.onPointerDown()}
    >
      <div>
        <span class="solid-tabular/plus-btn" style={{ width: `${props.rowHeaderWidth}px` }}>
          +
        </span>
        <span class="solid-tabular/text">Add row</span>
      </div>
    </div>
  )
}
