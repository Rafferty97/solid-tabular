import { Component } from 'solid-js'
import { CellContentProps } from './Cell'

export type Column<K, T> = {
  id: K
  name: string
  component: Component<CellContentProps<T>>
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

export type PositionedColumn<K, T> = Column<K, T> & {
  index: number
  left: number
  right: number
  width: number
}
