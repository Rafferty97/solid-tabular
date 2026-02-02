import {
  For,
  Show,
  createMemo,
  createSignal,
  mapArray,
  onMount,
  onCleanup,
  createEffect,
} from 'solid-js'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { isEqual } from 'src/lib/isEqual'
import type { ActiveRange, CellIndex, Column } from './types'
import { devicePixelRatio, createSize } from '../lib/devicePixelRatio'
import { isPrintableKey } from '../lib/isPrintableKey'
import { findIndex } from '../lib/findIndex'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { CellInputContainer } from './Cell'
import { Outline } from './Outline'
import { watchViewport } from './viewport'
import { Z_INDEX } from './zIndex'
import { modifierKey } from 'src/lib/shortcut'
import { CellContextMenu } from './ContextMenu'
import { createEvent } from 'solid-events'
import { TextContent } from './CellContent'
import './Table.css'

const DEFAULT_COLUMN_SIZE = 200

export interface TableProps<K = string> {
  /** The columns. */
  columns: Column<K>[]
  /** The number of rows. */
  numRows: number
  /** Whether columns can be inserted, removed, modified and re-ordered. */
  columnsEditable?: boolean
  /** Whether rows can be inserted, removed and re-ordered. */
  rowsEditable?: boolean
  /** The state of the selected cell or cells in the table. */
  activeRange: ActiveRange
  /** Sets the state of the selected cell or cells in the table. */
  setActiveRange?: (range: ActiveRange) => void
  /** The ID of the column that is being edited by another (external) UI. */
  extActiveColumn?: K
  /** Gets the value in a cell. */
  getCellValue(row: number, column: Column<K>): unknown
  /** Sets the value of the given cell. */
  setCellValue?: (rowIdx: number, colId: K, value: unknown) => void
  /** Gets the width of the given column. */
  getColumnSize?: (colId: K) => number | null | undefined
  /** Sets or resets the width of the given column. If `width` is `null`, this indicates a size reset. */
  setColumnSize?: (colId: K, width: number | null) => void
  /** Sets the name of the given column. */
  setColumnName?: (colId: K, name: string) => void
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
  onCellContextMenu?: (ev: MouseEvent, rowIdx: number, colId: string) => void
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

export type { ActiveRange, CellIndex }

export default function Table<K = string>(props: TableProps<K>) {
  // The root DOM element of the table
  let tableEl: HTMLDivElement | undefined

  // The element that proxies cell focus
  let focusEl: HTMLDivElement | undefined

  // Cell input events
  const [onFocus, emitFocus] = createEvent<{ start: number; end?: number }>()
  const [onQuickEdit, emitQuickEdit] = createEvent<void>()

  // Row and column counts
  const numRows = () => props.numRows
  const numCols = () => props.columns.length

  // The active cell range
  const activeRange = createMemo(() => {
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
      cell[0] === max[0] ? min[0] : max[0],
      cell[1] === max[1] ? min[1] : max[1],
    ] as const
    const size = [1 + max[0] - min[0], 1 + max[1] - min[1]] as const
    return { cell, shiftCell, min, max, size }
  })

  // The active cell, which may be within a range
  const activeCell = () => activeRange().cell

  // Details about the active cell
  const activeCellData = createMemo(
    () => {
      const [rowIdx, colIdx] = activeCell()
      const column = props.columns[colIdx]
      if (rowIdx >= props.numRows || !column) return undefined
      return { rowIdx, column }
    },
    undefined,
    { equals: isEqual },
  )

  // Whether a range is selected as opposed to a single cell
  const rangeIsSelected = () => activeRange().size[0] > 1 || activeRange().size[1] > 1

  // Calculate some measurements
  const px = () => 1 / devicePixelRatio()
  const cellHeight = createSize(29)
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
      const nextRange: [number, number] = [
        instance.range?.startIndex ?? 0,
        instance.range?.endIndex ?? 0,
      ]
      if (viewportRange[0] !== nextRange[0] || viewportRange[1] !== nextRange[1]) {
        viewportRange = nextRange
        props.onViewportChanged?.(viewportRange[0], viewportRange[1])
      }
    },
    overscan: 10, // FIXME: Right number?
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

  // Scroll to the externally active column
  const extActiveColumnIdx = createMemo(() =>
    props.columns.findIndex(c => c.id === props.extActiveColumn),
  )
  createEffect(() => {
    const colIndex = extActiveColumnIdx()
    if (colIndex >= 0) scrollToCell(undefined, colIndex)
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
      const rawWidth = props.getColumnSize?.(column.id) ?? DEFAULT_COLUMN_SIZE
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
  const visibleColumnRange = createMemo(() => {
    const { left, right } = viewport()
    const start = Math.max(findIndex(horizSizes().columns, c => c.right >= left) - 1, 0)
    const end = Math.min(findIndex(horizSizes().columns, c => c.left >= right) + 1, numCols())
    return { start, end }
  })
  const visibleColumns = mapArray(
    () => props.columns.slice(visibleColumnRange().start, visibleColumnRange().end),
    (column, localIndex) => {
      const index = () => localIndex() + visibleColumnRange().start
      const size = createMemo(() => horizSizes().columns[index()]) // FIXME: Can use memo here?
      return {
        id: column.id,
        get name() {
          return column.name
        },
        get format() {
          return column.format ?? {}
        },
        get component() {
          return column.component ?? TextContent
        },
        get icon() {
          return column.icon
        },
        get readonly() {
          return column.readonly ?? false
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
  const moveToCell = (i: number, j: number) => {
    i = Math.max(Math.min(i, numRows() - 1), 0)
    j = Math.max(Math.min(j, numCols() - 1), 0)
    const cell = [i, j] as const
    props.setActiveRange?.({ cell })
    scrollToCell(i, j)
    focus()
  }

  // Moves the cell range to the given cell
  const rangeToCell = (i: number, j: number) => {
    i = Math.max(Math.min(i, numRows() - 1), 0)
    j = Math.max(Math.min(j, numCols() - 1), 0)

    const { cell } = props.activeRange
    const min = [Math.min(cell[0], i), Math.min(cell[1], j)] as const
    const max = [Math.max(cell[0], i), Math.max(cell[1], j)] as const
    props.setActiveRange?.({ cell, range: { min, max } })
    scrollToCell(i, j)
    focus()
  }

  // Moves focus to the given cell, but only if it is outside the active range
  const moveToCellIfOutside = (i: number, j: number) => {
    i = Math.max(Math.min(i, numRows() - 1), 0)
    j = Math.max(Math.min(j, numCols() - 1), 0)
    const cell = [i, j] as const

    const { min, max } = activeRange()
    if (i < min[0] || i > max[0] || j < min[1] || j > max[1]) {
      props.setActiveRange?.({ cell })
      scrollToCell(i, j)
      focus()
    }
  }

  // Handle cell and cell range selection by mouse
  const [cellDragging, setCellDragging] = createSignal(false)

  const onCellDown = (ev: MouseEvent, i: number, j: number) => {
    if (ev.shiftKey) {
      rangeToCell(i, j)
    } else {
      moveToCell(i, j)
    }
    setCellDragging(true)
    document.addEventListener('mouseup', () => setCellDragging(false), { once: true })
  }

  const onCellContextDown = (_ev: MouseEvent, i: number, j: number) => {
    moveToCellIfOutside(i, j)
  }

  const onContextMenu = (_ev: MouseEvent, i: number, j: number) => {
    moveToCellIfOutside(i, j)
  }

  onMount(() => {
    let [x, y] = [0, 0]

    const handler = (ev?: MouseEvent) => {
      if (!cellDragging()) return
      if (ev) {
        const rect = tableEl!.getBoundingClientRect()
        x = ev.pageX + viewport().left - rect.left
        y = ev.pageY + viewport().top - rect.top
      }
      const i = Math.floor((y - colHeaderHeight()) / cellHeight())
      const j = findIndex(horizSizes().columns, c => c.right > x)
      rangeToCell(i, j)
    }

    document.addEventListener('mousemove', handler)
    onCleanup(() => document.removeEventListener('mousemove', handler))
  })

  // Start editing a cell, with an optional cursor position
  const editCell = (pos: number) => {
    const cell = activeCellData()
    if (!cell) return

    if (pos && !cell.column.readonly) {
      emitFocus({ start: pos, end: pos })
    } else {
      emitFocus({ start: 0 })
    }
  }

  // Start editing a cell in "quick mode"
  const quickEditCell = () => {
    const cell = activeCellData()
    if (cell && !cell.column.readonly) {
      emitQuickEdit()
    }
  }

  // Handle cell copy and paste events
  const handleCopy = async (ev?: ClipboardEvent) => {
    ev?.preventDefault()

    const range = activeRange()
    props.onCopy?.(range.min, range.max)
  }

  const handlePaste = async (ev?: ClipboardEvent) => {
    ev?.preventDefault()
    if (!props.rowsEditable) return

    const range = activeRange()
    props.onPaste?.(range.min, range.max)
  }

  const handleClear = async () => {
    if (!props.rowsEditable) return

    const range = activeRange()
    props.onClear?.(range.min, range.max)
  }

  // Handle keyboard events
  const handleKeyDown = (ev: KeyboardEvent) => {
    const { cell, shiftCell, min, max } = activeRange()

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
      const [row, col] = [cell[0], cell[1] + (ev.shiftKey ? -delta : delta)]
      if (col >= numCols()) {
        if (row >= numRows() - 1) {
          props.insertRows?.(numRows(), 1)
        }
        moveToCell(row + 1, 0)
      } else if (col < 0 && row > 0) {
        moveToCell(row - 1, numCols() - 1)
      } else {
        moveToCell(row, col)
      }
      return
    }

    if (ev.key == 'Enter') {
      ev.preventDefault()
      if (cell[0] >= numRows() - 1 && !ev.shiftKey) {
        props.insertRows?.(numRows(), 1)
      }
      moveToCell(cell[0] + (ev.shiftKey ? -delta : delta), cell[1])
      return
    }

    if (isPrintableKey(ev) || ev.key === 'Backspace') {
      if (!props.columns[activeCell()[1]]?.readonly) {
        quickEditCell()
      } else {
        ev.preventDefault()
      }
      return
    }

    if (ev.key === 'Delete') {
      props.onClear?.(min, max)
      return
    }

    if (ev.key === 'a' && ev[modifierKey] && !ev.shiftKey) {
      ev.preventDefault()
      const min = [0, 0] as const
      const max = [numRows() - 1, numCols() - 1] as const
      props.setActiveRange?.({ ...props.activeRange, range: { min, max } })
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
  const calcOutline = (min: CellIndex, max: CellIndex) => {
    const left = columnSize(min[1])?.left ?? 0
    const right = columnSize(max[1])?.right ?? 0
    const width = right - left + px()
    const top = rowVirtualizer.options.paddingStart + min[0] * cellHeight()
    const height = numRows() > 0 ? (1 + max[0] - min[0]) * cellHeight() + px() : 0
    const bottom = top + height
    return { left, right, top, bottom, width, height }
  }
  const activeCellOutline = createMemo(() => calcOutline(activeCell(), activeCell()))
  const activeRangeOutline = createMemo(() => calcOutline(activeRange().min, activeRange().max))

  // Monitor scroll position
  const cellIntersectsLeft = createMemo(() => {
    const outline = activeRangeOutline()
    const x = viewport().left + rowHeaderWidth() - outline.left
    return x >= 0 && x <= outline.width
  })
  const cellIntersectsTop = createMemo(() => {
    const outline = activeRangeOutline()
    const y = viewport().top + colHeaderHeight() - outline.top
    return y >= 0 && y <= outline.height
  })

  return (
    <div
      ref={tableEl}
      data-solid-tabular-table
      onKeyDown={handleKeyDown}
      onCopy={handleCopy}
      onPaste={handlePaste}
      onScroll={ev => {
        if (shouldRestoreScroll) return
        props.onScrollPositionChange?.(ev.currentTarget.scrollLeft, ev.currentTarget.scrollTop)
      }}
      tabIndex={-1}
    >
      <div ref={focusEl} class="focus-proxy" tabIndex={-1} contentEditable />

      {/* Corner box */}
      <div class="corner-box" style={{ 'z-index': Z_INDEX.CORNER_BOX }}>
        <div style={{ width: `${rowHeaderWidth()}px`, height: `${colHeaderHeight()}px` }}>
          <span>#</span>
        </div>
        <Outline
          rect={cellIntersectsLeft() && cellIntersectsTop() ? activeRangeOutline() : undefined}
          headerLeft={rowHeaderWidth()}
          headerTop={colHeaderHeight()}
          expand
        />
      </div>

      {/* Column headers */}
      <div
        class="column-headers"
        style={{ width: `${tableWidth()}px`, 'z-index': Z_INDEX.TABLE_HEADER }}
      >
        <TableHeader
          height={colHeaderHeight()}
          columns={visibleColumns()}
          columnsEditable={props.columnsEditable}
          onResizeColumn={props.setColumnSize}
          setColumnName={props.setColumnName}
          removeColumn={id =>
            props.removeColumns?.(
              props.columns.findIndex(c => c.id === id),
              1,
            )
          }
          extActiveColumn={props.extActiveColumn}
        />
        {/* Add column button */}
        <Show when={props.columnsEditable}>
          <div class="add-column-btn" style={{ left: `${tableWidth()}px` }}>
            <div
              style={{ width: `80px`, height: `${colHeaderHeight()}px` }}
              onMouseDown={ev => ev.button === 0 && props.insertColumns?.(numCols(), 1)}
            >
              +
            </div>
          </div>
        </Show>
        <Outline
          rect={activeRangeOutline()}
          headerTop={colHeaderHeight()}
          expand={cellIntersectsTop()}
        />
      </div>

      {/* Row headers */}
      <div class="row-headers" style={{ 'z-index': Z_INDEX.ROW_HEADER }}>
        <For each={rowVirtualizer.getVirtualItems()}>
          {item => (
            <div
              class="row-header"
              style={{
                width: `${rowHeaderWidth()}px`,
                height: `${cellHeight()}px`,
                transform: `translateY(${item.start}px)`,
              }}
            >
              <span>{item.index + 1}</span>
            </div>
          )}
        </For>
        <Outline
          rect={activeRangeOutline()}
          headerLeft={rowHeaderWidth()}
          expand={cellIntersectsLeft()}
        />
      </div>

      {/* Cells */}
      <CellContextMenu
        editable={props.rowsEditable === true && props.columnsEditable === true}
        copy={handleCopy}
        paste={handlePaste}
        clear={handleClear}
        insertRows={() => props.insertRows?.(activeRange().min[0], activeRange().size[0])}
        insertColumns={() => props.insertColumns?.(activeRange().min[1], activeRange().size[1])}
        removeRows={() => props.removeRows?.(activeRange().min[0], activeRange().size[0])}
        removeColumns={() => props.removeColumns?.(activeRange().min[1], activeRange().size[1])}
      >
        <div style={{ width: `${tableWidth() + 6}px`, height: `${tableHeight() + 6}px` }}>
          <For each={rowVirtualizer.getVirtualItems()}>
            {item => (
              <TableRow
                columns={visibleColumns()}
                rowIdx={item.index}
                top={item.start}
                height={item.size}
                isActive={item.index >= activeRange().min[0] && item.index <= activeRange().max[0]}
                getCellValue={props.getCellValue}
                setCellValue={props.setCellValue}
                onMouseDown={onCellDown}
                onMouseContextDown={onCellContextDown}
                onContextMenu={onContextMenu}
                onEditCell={editCell}
                extActiveColumn={props.extActiveColumn}
              />
            )}
          </For>

          {/* Cell input */}
          <Show when={activeCellData()} keyed>
            {({ rowIdx, column }) => (
              <CellInputContainer
                rect={activeCellOutline()}
                format={column.format ?? {}}
                value={props.getCellValue(rowIdx, column)}
                readonly={column.readonly}
                setCellValue={value => props.setCellValue?.(rowIdx, column.id, value)}
                onFinishedEditing={focus}
                focus={onFocus}
                quickEdit={onQuickEdit}
              />
            )}
          </Show>

          {/* Active cell range outline */}
          <Outline rect={activeRangeOutline()} shade={rangeIsSelected()} expand />
        </div>
      </CellContextMenu>

      {/* New row button */}
      <Show when={props.rowsEditable}>
        <div
          class="-mt-[6px] flex cursor-pointer border-t border-gray-300 bg-white hover:bg-gray-100"
          style={{
            width: `${tableWidth()}px`,
            height: `${cellHeight()}px`,
            'z-index': Z_INDEX.NEW_ROW,
          }}
          onMouseDown={ev => ev.button === 0 && appendRow()}
        >
          <div class="sticky left-0 z-10 flex flex-none items-center py-1 pr-2">
            <span class="pr-2 text-right text-gray-400" style={{ width: `${rowHeaderWidth()}px` }}>
              +
            </span>
            <span class="pl-1 text-sm">Add row</span>
          </div>
        </div>
      </Show>
    </div>
  )
}
