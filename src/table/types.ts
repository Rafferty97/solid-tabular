import { Component } from 'solid-js'
import { CellContentProps, CellFormat } from './CellContent'
import { IconProps } from 'src/components/icon'

export type Column<K = string> = {
  id: K
  name: string
  width: number
  format?: CellFormat
  component?: Component<CellContentProps>
  icon?: Component<IconProps>
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
