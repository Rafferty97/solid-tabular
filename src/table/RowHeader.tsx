import './RowHeader.css'

export interface RowHeaderProps {
  index: number
  width: number
  height: number
  y: number
}

export function RowHeader(props: RowHeaderProps) {
  return (
    <div
      class="solid-tabular/row-header"
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        transform: `translateY(${props.y}px)`,
      }}
    >
      <span>{props.index + 1}</span>
    </div>
  )
}
