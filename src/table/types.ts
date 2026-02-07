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
  range?: CellRange
}

export type CellIndex = readonly [number, number]

export type CellRange = Readonly<{
  /** The top-left cell in the range. */
  min: CellIndex
  /** The top-right cell in the range. */
  max: CellIndex
}>

export type PositionedColumn<K, T> = Column<K, T> & {
  index: number
  left: number
  right: number
  width: number
}

export type DragMode = 'cell' | 'cols' | 'rows'
