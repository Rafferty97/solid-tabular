import { CellIndex, CellRange } from 'src/table/types'

export function moveUp(prev: CellIndex, range: CellRange): CellIndex {
  if (prev[0] > range.min[0]) {
    return [prev[0] - 1, prev[1]]
  }
  if (prev[1] > range.min[1]) {
    return [range.max[0], prev[1] - 1]
  }
  return range.max
}

export function moveDown(prev: CellIndex, range: CellRange): CellIndex {
  if (prev[0] < range.max[0]) {
    return [prev[0] + 1, prev[1]]
  }
  if (prev[1] < range.max[1]) {
    return [range.min[0], prev[1] + 1]
  }
  return range.min
}

export function moveLeft(prev: CellIndex, range: CellRange): CellIndex {
  if (prev[1] > range.min[1]) {
    return [prev[0], prev[1] - 1]
  }
  if (prev[0] > range.min[0]) {
    return [prev[0] - 1, range.max[1]]
  }
  return range.max
}

export function moveRight(prev: CellIndex, range: CellRange): CellIndex {
  if (prev[1] < range.max[1]) {
    return [prev[0], prev[1] + 1]
  }
  if (prev[0] < range.max[0]) {
    return [prev[0] + 1, range.min[1]]
  }
  return range.min
}
