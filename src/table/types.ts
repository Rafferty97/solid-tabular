import { Component } from 'solid-js'
import { CellContentProps, CellFormat } from './CellContent'

export type Column<K = string> = {
  id: K
  name: string
  format?: CellFormat
  component?: Component<CellContentProps>
  icon?: Component
  readonly?: boolean
}

export interface ActiveRange {
  /** The active cell. */
  cell: CellIndex
  /** The selected cell range with inclusive bounds. */
  range?: {
    /** The top-left cell in the range. */
    min: CellIndex
    /** The top-right cell in the range. */
    max: CellIndex
  }
}

export type CellIndex = readonly [number, number]

export type PositionedColumn<K> = Column<K> & {
  index: number
  left: number
  right: number
  width: number
}
