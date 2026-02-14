import { createSignal } from 'solid-js'
import { TableProps } from 'src/table/Table'
import { ActiveRange } from 'src/table/types'

export function createTableState(data: Record<string, unknown>[]) {
  const columns = data[0] ? Object.keys(data[0]) : []
  const numRows = data.length

  const [activeRange, setActiveRange] = createSignal<ActiveRange>()

  const [widths, setWidths] = createSignal(new Map<string, number>())

  return {
    columns,
    numRows,
    getCellValue: (row, column) => data[row]?.[column],
    get activeRange() {
      return activeRange()
    },
    setActiveRange,
    getColumnSize: column => widths().get(column),
    setColumnSize: (column, width) => setWidths(w => new Map([...w, [column, width]])),
    resetColumnSize: column => setWidths(w => new Map([...w].filter(e => e[0] !== column))),
  } satisfies TableProps<string>
}
