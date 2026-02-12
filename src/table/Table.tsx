import { For, Show, createMemo, createSignal, mapArray, createEffect, Component, onCleanup } from 'solid-js'
import { createVirtualizer } from '@tanstack/solid-virtual'
import type { DragMode, ActiveRange, CellIndex } from './types'
import { devicePixelRatio, createSize } from 'src/lib/devicePixelRatio'
import { isPrintableKey } from 'src/lib/isPrintableKey'
import { findIndex } from 'src/lib/findIndex'
import { ColumnHeader } from './ColumnHeader'
import { TableRow } from './TableRow'
import { CellContentProps, CellInputContainer } from './Cell'
import { Outline } from './Outline'
import { watchViewport } from 'src/lib/watchViewport'
import { modifierKey } from 'src/lib/modifierKey'
import { createEvent } from 'src/lib/createEvent'
import { AddRowButton } from './AddRowButton'
import { AddColumnButton } from './AddColumnButton'
import { RowHeader } from './RowHeader'
import { isEqual } from 'radashi'
import { textContent } from 'src/components/CellContent'
import { copyTableToClipboard, pasteTableFromClipboard } from 'src/lib/clipboard'
import './Table.css'

const DEFAULT_COLUMN_SIZE = 80 // px
const DEFAULT_CELL_HEIGHT = 29 // px
const DEFAULT_CELL_CONTENT = textContent()
const CELL_DRAG_DELAY = 300 // ms

export interface TableProps<Column, Value = unknown> {
  /** The columns. */
  columns: Column[]
  /** The number of rows. */
  numRows: number
  /** Whether columns can be inserted, removed, modified and re-ordered. */
  columnsEditable?: boolean
  /** Whether rows can be inserted, removed and re-ordered. */
  rowsEditable?: boolean
  /** Whether columns can be resized. */
  columnsResizeable?: boolean
  /** Height of cells in pixels. */
  cellHeight?: number
  /** Component used to render the content of cells for a particular column. */
  cellContent?: (column: Column) => Component<CellContentProps<Value>> | undefined
  /** Gets the icon for a particular column. */
  getColumnIcon?: (column: Column) => Component | undefined
  /** The state of the selected cell or cells in the table. */
  activeRange?: ActiveRange
  /** Sets the state of the selected cell or cells in the table. */
  setActiveRange?: (range: ActiveRange) => void
  /** Gets the value in a cell. */
  getCellValue(row: number, column: Column): Value
  /** Sets the value of the given cell. */
  setCellValue?: (row: number, column: Column, value: Value) => void
  /** Gets the width of the given column. */
  getColumnSize?: (column: Column) => number | null | undefined
  /** Sets the width of the given column. */
  setColumnSize?: (column: Column, width: number) => void
  /** Resets the width of the given column. */
  resetColumnSize?: (column: Column) => void
  /** Gets the name of the given column. */
  getColumnName?: (column: Column) => string
  /** Sets the name of the given column. */
  setColumnName?: (column: Column, name: string) => void
  /** Inserts a numer of columns into the table. */
  insertColumns?: (index: number, count: number) => void
  /** Inserts a number of rows into the table. */
  insertRows?: (index: number, count: number) => void
  /** Removes a number of columns from the table. */
  removeColumns?: (index: number, count: number) => void
  /** Removes a number of rows from the table. */
  removeRows?: (index: number, count: number) => void
  /** Called whenever the range of rows visible in the viewport changes. */
  onViewportChanged?: (start: number, end: number) => void
  /** Fired when a cell context menu is opened. */
  onCellContextMenu?: (ev: MouseEvent, row: number, column: Column) => void
  /** Fired when a range of cells is copied to the clipboard. */
  onCopy?: (min: CellIndex, max: CellIndex) => void
  /** Fired when a range of cells is pasted to from the clipboard. */
  onPaste?: (min: CellIndex, max: CellIndex) => void
  /** Fired when a range of cells is cleared. */
  onClear?: (min: CellIndex, max: CellIndex) => void
  /** Initial scroll position to restore. */
  initialScrollPosition?: { left: number; top: number }
  /** Called when the table scroll position changes. */
  onScrollPositionChange?: (scrollLeft: number, scrollTop: number) => void
}

export default function Table<Column, Value = unknown>(props: TableProps<Column, Value>) {
  // The root DOM element of the table
  let tableEl: HTMLDivElement | undefined

  // The element that proxies cell focus
  let focusEl: HTMLDivElement | undefined

  // Quick edit event
  const [onQuickEdit, emitQuickEdit] = createEvent<void>()

  // Row and column counts
  const numRows = () => props.numRows
  const numCols = () => props.columns.length

  // The active cell range
  const activeRange = createMemo(() => {
    if (!props.activeRange) return undefined
    const { cell, range } = props.activeRange
    const maxRow = Math.max(numRows() - 1, 0)
    const maxCol = Math.max(numCols() - 1, 0)
    const min = [
      Math.max(Math.min(range?.min[0] ?? cell[0], maxRow), 0),
      Math.max(Math.min(range?.min[1] ?? cell[1], maxCol), 0),
    ] as const
    const max = [
      Math.max(Math.min(range?.max[0] ?? cell[0], maxRow), 0),
      Math.max(Math.min(range?.max[1] ?? cell[1], maxCol), 0),
    ] as const
    const shiftCell = [
      cell[0] === max[0] ? min[0] : max[0], // Last row, unless `cell` is already there
      cell[1] === max[1] ? min[1] : max[1], // Last column, unless `cell` is already there
    ] as const
    const size = [1 + max[0] - min[0], 1 + max[1] - min[1]] as const
    return { cell, shiftCell, min, max, size }
  })

  // The active cell, which may be within a range
  const activeCell = createMemo(() => activeRange()?.cell, undefined, {
    equals: (a, b) => String(a) === String(b),
  })

  // Details about the active cell
  const activeCellData = createMemo(() => {
    const cell = activeCell()
    if (!cell) return undefined
    const row = cell[0]
    const column = props.columns[cell[1]]
    if (cell[0] >= props.numRows || !column) return undefined
    return { row, column }
  })

  // Calculate some measurements
  const px = () => 1 / devicePixelRatio()
  const cellHeight = createSize(() => props.cellHeight ?? DEFAULT_CELL_HEIGHT)
  const rowHeaderWidth = () => rowHeaderSize().width
  const colHeaderHeight = cellHeight
  const scrollPadding = createSize(6)

  // Used to determine when the row range has changed
  let viewportRange: [number, number] = [0, 0]
  props.onViewportChanged?.(viewportRange[0], viewportRange[1])

  // The virtualizer ensures only visible rows are present in the DOM, for performance
  // Some properties are defined as getters to ensure reactivity
  const rowVirtualizer = createVirtualizer({
    getScrollElement: () => tableEl ?? null,
    estimateSize: cellHeight,
    get count() {
      return props.numRows
    },
    get paddingStart() {
      return colHeaderHeight() - px()
    },
    get scrollPaddingStart() {
      return colHeaderHeight() + scrollPadding()
    },
    get scrollPaddingEnd() {
      return scrollPadding()
    },
    onChange(instance) {
      const nextRange: [number, number] = [instance.range?.startIndex ?? 0, instance.range?.endIndex ?? 0]
      if (viewportRange[0] !== nextRange[0] || viewportRange[1] !== nextRange[1]) {
        viewportRange = nextRange
        props.onViewportChanged?.(viewportRange[0], viewportRange[1])
      }
    },
    overscan: 10,
  })

  // Restore scroll position when data is ready
  let shouldRestoreScroll = !!props.initialScrollPosition
  createEffect(() => {
    if (tableEl && shouldRestoreScroll && props.numRows > 0) {
      if (props.initialScrollPosition) {
        const { left, top } = props.initialScrollPosition
        tableEl.scrollTo({ left, top, behavior: 'instant' })
      }
      shouldRestoreScroll = false
    }
  })

  // Watch scroll position
  const viewport = watchViewport(() => tableEl!)

  // Compute cell dimensions on the horizontal axis
  const horizSizes = createMemo(() => {
    const dpr = devicePixelRatio()

    const headerWidth = Math.max(props.numRows.toString().length, 2) * 8 + 16
    const header = {
      left: 0,
      right: headerWidth + 1 / dpr,
      width: headerWidth + 1 / dpr,
    }

    let x = headerWidth
    const columns = props.columns.map(column => {
      const rawWidth = props.getColumnSize?.(column) ?? DEFAULT_COLUMN_SIZE
      const width = Math.round(rawWidth * dpr) / dpr
      const [left, right] = [x, x + width]
      x += width
      return { left, right, width }
    })
    const tableWidth = x

    return { header, columns, tableWidth }
  })
  const rowHeaderSize = () => horizSizes().header
  const columnSize = (idx: number) => horizSizes().columns[idx]
  const tableWidth = () => horizSizes().tableWidth
  const tableHeight = () => rowVirtualizer.getTotalSize()

  // Column virtualisation
  const visibleColumnRange = createMemo(
    () => {
      const { left, right } = viewport()
      const start = Math.max(findIndex(horizSizes().columns, c => c.right >= left) - 1, 0)
      const end = Math.min(findIndex(horizSizes().columns, c => c.left >= right) + 1, numCols())
      return { start, end }
    },
    undefined,
    { equals: isEqual },
  )
  const visibleColumns = mapArray(
    createMemo(() => props.columns.slice(visibleColumnRange().start, visibleColumnRange().end)),
    (column, localIndex) => {
      const index = () => localIndex() + visibleColumnRange().start
      const size = createMemo(() => horizSizes().columns[index()])
      return {
        column,
        get name() {
          return props.getColumnName?.(column) ?? String(column)
        },
        get component() {
          return props.cellContent?.(column) ?? DEFAULT_CELL_CONTENT
        },
        get icon() {
          return props.getColumnIcon?.(column)
        },
        get index() {
          return index()
        },
        get left() {
          return size()?.left ?? 0
        },
        get right() {
          return size()?.right ?? 0
        },
        get width() {
          return size()?.width ?? 0
        },
      }
    },
  )

  // Methods to scroll to a row/column or the active cell
  let lastScroll = new Date()

  const scrollToCell = (rowIdx?: number, colIdx?: number) => {
    if (!tableEl) return

    // Compute horizontal scroll
    let left = tableEl.scrollLeft
    if (colIdx != null) {
      const column = columnSize(colIdx)
      const paddedLeft = rowHeaderSize().width + scrollPadding()
      const paddedRight = tableEl.clientWidth - scrollPadding()
      const minLeft = (column?.right ?? 0) - paddedRight
      const maxLeft = (column?.left ?? 0) - paddedLeft
      left = Math.max(Math.min(tableEl.scrollLeft, maxLeft), minLeft, 0)
    }

    // Compute vertical scroll
    let top = tableEl.scrollTop
    if (rowIdx != null) {
      const paddedTop = scrollPadding()
      const paddedBottom = tableEl.clientHeight - colHeaderHeight() - scrollPadding()
      const minTop = cellHeight() * (rowIdx + 1) - paddedBottom
      const maxTop = cellHeight() * rowIdx - paddedTop
      top = Math.max(Math.min(tableEl.scrollTop, maxTop), minTop, 0)
    }

    // Perform the scroll with smoothing
    if (+new Date() - +lastScroll > 75) {
      const margin = 6
      tableEl.scrollTo({
        left: Math.min(Math.max(tableEl.scrollLeft, left - margin), left + margin),
        top: Math.min(Math.max(tableEl.scrollTop, top - margin), top + margin),
        behavior: 'instant',
      })
      tableEl.scrollTo({ left, top, behavior: 'smooth' })
    } else {
      tableEl.scrollTo({ left, top, behavior: 'instant' })
    }
    lastScroll = new Date()
  }

  // Focuses the input proxy element
  const focus = () => focusEl?.focus({ preventScroll: true })

  // Moves focus to the given cell
  const moveToCell = (i?: number, j?: number) => {
    if (i != null) i = Math.max(Math.min(i, numRows() - 1), 0)
    if (j != null) j = Math.max(Math.min(j, numCols() - 1), 0)

    const min = [i ?? 0, j ?? 0] as const
    const max = [i ?? numRows() - 1, j ?? numCols() - 1] as const
    const cell = min
    const range = i == null || j == null ? { min, max } : undefined

    props.setActiveRange?.({ cell, range })
    scrollToCell(i, j)
    focus()
  }

  // Moves focus to the given cell without modifying the selected range
  const moveWithinRange = ([i, j]: CellIndex) => {
    const range = props.activeRange?.range
    const min = range?.min ?? [0, 0]
    const max = range?.max ?? [numRows() - 1, numCols() - 1]

    const ai = i + (j < min[1] ? -1 : j > max[1] ? 1 : 0)
    const aj = j + (i < min[0] ? -1 : i > max[0] ? 1 : 0)
    const cell = [
      ai < min[0] ? max[0] : ai > max[0] ? min[0] : ai,
      aj < min[1] ? max[1] : aj > max[1] ? min[1] : aj,
    ] as const

    props.setActiveRange?.({ cell, range })
    scrollToCell(cell[0], cell[1])
    focus()
  }

  // Moves the cell range to the given cell
  const rangeToCell = (i?: number, j?: number) => {
    if (!props.activeRange) return

    if (i != null) i = Math.max(Math.min(i, numRows() - 1), 0)
    if (j != null) j = Math.max(Math.min(j, numCols() - 1), 0)

    const { cell } = props.activeRange
    const min = [Math.min(cell[0], i ?? 0), Math.min(cell[1], j ?? 0)] as const
    const max = [Math.max(cell[0], i ?? numRows() - 1), Math.max(cell[1], j ?? numCols() - 1)] as const
    props.setActiveRange?.({ cell, range: { min, max } })
    scrollToCell(i, j)
    focus()
  }

  // Moves focus to the given cell, but only if it is outside the active range
  const moveToCellIfOutside = (i: number, j: number) => {
    const range = activeRange()
    if (!range) return

    i = Math.max(Math.min(i, numRows() - 1), 0)
    j = Math.max(Math.min(j, numCols() - 1), 0)
    const cell = [i, j] as const

    if (i < range.min[0] || i > range.max[0] || j < range.min[1] || j > range.max[1]) {
      props.setActiveRange?.({ cell })
      scrollToCell(i, j)
      focus()
    }
  }

  // Selects all cells in a row, column or the whole table
  const selectAll = (i: number | null, j: number | null) => {
    const min = [i ?? 0, j ?? 0] as const
    const max = [i ?? numRows() - 1, j ?? numCols() - 1] as const
    props.setActiveRange?.({ cell: min, range: { min, max } })
  }

  // Handle cell and cell range selection by mouse
  const [cellDragging, setCellDragging] = createSignal<DragMode>()

  let pointerCapture: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => clearTimeout(pointerCapture))

  const onCellDown = (ev: PointerEvent, i: number | null, j: number | null) => {
    if (ev.shiftKey) {
      rangeToCell(i ?? undefined, j ?? undefined)
    } else {
      moveToCell(i ?? undefined, j ?? undefined)
    }
    setCellDragging(i == null ? 'rows' : j == null ? 'cols' : 'cell')
    clearTimeout(pointerCapture)
    pointerCapture = setTimeout(() => tableEl?.setPointerCapture(ev.pointerId), CELL_DRAG_DELAY)
  }

  let [x, y] = [0, 0]

  const onCellMove = (ev?: MouseEvent) => {
    if (!cellDragging()) return
    if (ev) {
      const rect = tableEl!.getBoundingClientRect()
      x = ev.pageX + viewport().left - rect.left
      y = ev.pageY + viewport().top - rect.top
    }
    const i = Math.floor((y - colHeaderHeight()) / cellHeight())
    const j = findIndex(horizSizes().columns, c => c.right > x)
    rangeToCell(cellDragging() == 'rows' ? undefined : i, cellDragging() == 'cols' ? undefined : j)
  }

  const onCellUp = () => {
    setCellDragging(undefined)
    clearTimeout(pointerCapture)
  }

  const onCellContextDown = (_ev: MouseEvent, i: number, j: number) => {
    moveToCellIfOutside(i, j)
  }

  const onContextMenu = (_ev: MouseEvent, i: number, j: number) => {
    moveToCellIfOutside(i, j)
  }

  // Handle cell copy and paste events
  const handleCopy = async (ev?: ClipboardEvent) => {
    ev?.preventDefault()

    const range = activeRange()
    if (!range) return

    if (props.onCopy) {
      props.onCopy(range.min, range.max)
    } else {
      const table: string[][] = []
      for (let i = range.min[0]; i <= range.max[0]; i++) {
        const row: string[] = []
        for (let j = range.min[1]; j <= range.max[1]; j++) {
          row.push(String(props.getCellValue(i, props.columns[j]!)))
        }
        table.push(row)
      }
      copyTableToClipboard(table)
    }
  }

  const handlePaste = async (ev?: ClipboardEvent) => {
    ev?.preventDefault()
    // if (!props.rowsEditable) return

    const range = activeRange()
    if (!range) return

    if (props.onPaste) {
      props.onPaste(range.min, range.max)
    } else {
      pasteTableFromClipboard().then(table => {
        if (!props.setCellValue) return
        if (!table) return
        let i = range.min[0]
        for (const row of table) {
          let j = range.min[1]
          for (const cell of row) {
            props.setCellValue(i, props.columns[j]!, cell as any)
            j += 1
          }
          i += 1
        }
      })
    }
  }

  // Handle keyboard events
  const handleKeyDown = (ev: KeyboardEvent) => {
    const range = activeRange()
    if (!range) return

    const { cell, shiftCell, min, max } = range
    const delta = ev[modifierKey] ? Infinity : 1

    if (ev.key.startsWith('Arrow')) {
      ev.preventDefault()
      const move = ev.shiftKey ? rangeToCell : moveToCell
      const prev = ev.shiftKey ? shiftCell : cell
      switch (ev.key) {
        case 'ArrowUp':
          return move(prev[0] - delta, prev[1])
        case 'ArrowDown':
          return move(prev[0] + delta, prev[1])
        case 'ArrowLeft':
          return move(prev[0], prev[1] - delta)
        case 'ArrowRight':
          return move(prev[0], prev[1] + delta)
      }
    }

    if (ev.key == 'Tab') {
      ev.preventDefault()
      const delta = ev.shiftKey ? -1 : 1
      moveWithinRange([cell[0], cell[1] + delta])
      return
    }

    if (ev.key == 'Enter') {
      ev.preventDefault()
      const delta = ev.shiftKey ? -1 : 1
      moveWithinRange([cell[0] + delta, cell[1]])
      return
    }

    if (isPrintableKey(ev) || ev.key === 'Backspace') {
      emitQuickEdit()
      return
    }

    if (ev.key === 'Delete') {
      props.onClear?.(min, max)
      return
    }

    if (ev.key === 'a' && ev[modifierKey] && !ev.shiftKey) {
      ev.preventDefault()
      selectAll(null, null)
      return
    }
  }

  // Append row button
  const appendRow = () => {
    if (!props.insertRows) return
    props.insertRows(numRows(), 1)

    // Scroll to the last row
    scrollToCell(props.numRows, undefined)
  }

  // Compute dimensions for active cell outline
  const calcOutline = (min?: CellIndex, max?: CellIndex) => {
    if (!min || !max) return undefined
    const left = columnSize(min[1])?.left ?? 0
    const right = columnSize(max[1])?.right ?? 0
    const width = right - left + px()
    const top = rowVirtualizer.options.paddingStart + min[0] * cellHeight()
    const height = numRows() > 0 ? (1 + max[0] - min[0]) * cellHeight() + px() : 0
    const bottom = top + height
    return { left, right, top, bottom, width, height }
  }
  const activeCellOutline = createMemo(() => calcOutline(activeCell(), activeCell()))
  const activeRangeOutline = createMemo(() => calcOutline(activeRange()?.min, activeRange()?.max))

  // Monitor scroll position
  const cellIntersectsLeft = createMemo(() => {
    const outline = activeRangeOutline()
    if (!outline) return false
    const x = viewport().left + rowHeaderWidth() - outline.left
    return x >= 0 && x <= outline.width
  })
  const cellIntersectsTop = createMemo(() => {
    const outline = activeRangeOutline()
    if (!outline) return false
    const y = viewport().top + colHeaderHeight() - outline.top
    return y >= 0 && y <= outline.height
  })

  return (
    <div
      ref={tableEl}
      class="solid-tabular/table"
      style={{ cursor: cellDragging() ? 'cell' : undefined }}
      onKeyDown={handleKeyDown}
      onCopy={handleCopy}
      onPaste={handlePaste}
      onScroll={ev => {
        if (shouldRestoreScroll) return
        props.onScrollPositionChange?.(ev.currentTarget.scrollLeft, ev.currentTarget.scrollTop)
      }}
      onPointerMove={onCellMove}
      onPointerUp={onCellUp}
      tabIndex={-1}
    >
      <div ref={focusEl} class="solid-tabular/focus-proxy" tabIndex={-1} />

      {/* Corner box */}
      <div class="solid-tabular/corner-box">
        <div
          style={{ width: `${rowHeaderWidth()}px`, height: `${colHeaderHeight()}px` }}
          onPointerDown={() => selectAll(null, null)}
        />
        <Outline
          rect={cellIntersectsLeft() && cellIntersectsTop() ? activeRangeOutline() : undefined}
          headerLeft={rowHeaderWidth()}
          headerTop={colHeaderHeight()}
          expand
        />
      </div>

      {/* Column headers */}
      <div class="solid-tabular/column-headers" style={{ width: `${tableWidth()}px` }}>
        <For each={visibleColumns()}>
          {column => (
            <ColumnHeader
              column={column}
              height={colHeaderHeight()}
              columnsEditable={props.columnsEditable}
              columnsResizeable={props.columnsResizeable}
              setColumnName={props.setColumnName}
              setColumnSize={props.setColumnSize}
              resetColumnSize={props.resetColumnSize}
              onPointerDown={ev => onCellDown(ev, null, column.index)}
            />
          )}
        </For>

        <Show when={props.columnsEditable}>
          <AddColumnButton
            tableWidth={tableWidth()}
            width={DEFAULT_COLUMN_SIZE}
            height={colHeaderHeight()}
            onPointerDown={() => props.insertColumns?.(numCols(), 1)}
          />
        </Show>

        <Outline rect={activeRangeOutline()} headerTop={colHeaderHeight()} expand={cellIntersectsTop()} />
      </div>

      {/* Row headers */}
      <div class="solid-tabular/row-headers">
        <For each={rowVirtualizer.getVirtualItems()}>
          {item => (
            <RowHeader
              index={item.index}
              width={rowHeaderWidth()}
              height={cellHeight()}
              y={item.start}
              onPointerDown={ev => onCellDown(ev, item.index, null)}
            />
          )}
        </For>

        <Outline rect={activeRangeOutline()} headerLeft={rowHeaderWidth()} expand={cellIntersectsLeft()} />
      </div>

      {/* Cells */}
      <div style={{ width: `${tableWidth() + 6}px`, height: `${tableHeight() + 6}px` }}>
        <For each={rowVirtualizer.getVirtualItems()}>
          {item => (
            <TableRow
              columns={visibleColumns()}
              row={item.index}
              top={item.start}
              height={item.size}
              getCellValue={props.getCellValue}
              setCellValue={props.setCellValue}
              onPointerDown={onCellDown}
              onMouseContextDown={onCellContextDown}
              onContextMenu={onContextMenu}
            />
          )}
        </For>

        {/* Rendered separately to avoid issues caused by row/column virtualisation. */}
        <Show when={activeCellData()} keyed>
          {({ row, column }) => (
            <CellInputContainer
              component={props.cellContent?.(column) ?? DEFAULT_CELL_CONTENT}
              rect={activeCellOutline()!}
              value={props.getCellValue(row, column)}
              setValue={value => props.setCellValue?.(row, column, value)}
              quickEdit={onQuickEdit}
              onFinishedEditing={focus}
            />
          )}
        </Show>

        <Outline rect={activeRangeOutline()} highlight={activeCellOutline()} expand />
      </div>

      {/* Add row button */}
      <Show when={props.rowsEditable}>
        <AddRowButton
          tableWidth={tableWidth()}
          cellHeight={cellHeight()}
          rowHeaderWidth={rowHeaderWidth()}
          onPointerDown={appendRow}
        />
      </Show>
    </div>
  )
}
