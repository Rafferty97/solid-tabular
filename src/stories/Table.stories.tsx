import { createMemo, createSignal, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { fn } from 'storybook/test'
import Papa from 'papaparse'
import { ActiveRange, createCheckboxContent, Table } from 'src'
import { CellContentProps } from 'src/table/Cell'

const meta = {
  args: {
    accentColor: '#de3b84',
    setCellValue: fn(),
  },
  render: props => {
    const [activeRange, setActiveRange] = createSignal<ActiveRange>()
    const [widths, setWidths] = createSignal(new Map<string, number>())

    const [fetchedData, setFetchedData] = createSignal<Record<string, unknown>[]>()

    onMount(() => {
      if (!props.url) return
      fetch(props.url)
        .then(resp => (resp.ok ? resp.text() : ''))
        .then(raw => {
          const parsed = Papa.parse<Record<string, unknown>>(raw, {
            header: true,
            skipEmptyLines: true,
          })
          setFetchedData(parsed.data)
        })
    })

    const data = createMemo(() => fetchedData() ?? props.data ?? [])
    const columns = createMemo(() => Object.keys(data()[0] ?? {}), undefined, {
      equals: (a, b) => String(a) === String(b),
    })
    const numRows = createMemo(() => data().length)

    return (
      <div
        style={{
          height: '100%',
          'border-radius': '6px',
          overflow: 'hidden',
          '--solid-tabular-accent-color': props.accentColor,
        }}
      >
        <Table
          columns={columns()}
          numRows={numRows()}
          getCellContent={props.getCellContent}
          getCellValue={(row, col) => data()[row]![col]!}
          setCellValue={(row, col, value) => {
            const newData = data().slice()
            newData[row] = { ...newData[row], [col]: value }
            setFetchedData(newData)
            props.setCellValue(row, col, value)
          }}
          activeRange={activeRange()}
          setActiveRange={setActiveRange}
          getColumnSize={col => widths().get(col)}
          setColumnSize={(col, size) => setWidths(w => new Map([...w, [col, size]]))}
          resetColumnSize={col => setWidths(w => new Map([...w].filter(e => e[0] !== col)))}
          columnsResizeable
        />
      </div>
    )
  },
} satisfies Meta<{
  data?: Record<string, unknown>[]
  url?: string
  accentColor: string
  setCellValue: (row: number, column: string, value: unknown) => void
  getCellContent?: (column: string) => Component<CellContentProps>
}>

export default meta

type Story = StoryObj<typeof meta>

export const BasicUsage = {
  args: {
    data: [
      { A: 1, B: 2, C: 3 },
      { A: 4, B: 5, C: 6 },
    ],
  },
} satisfies Story

export const MediumSizedTable = {
  args: {
    url: new URL('/src/stories/stats.csv', import.meta.url),
  },
} satisfies Story

const CheckboxContent = createCheckboxContent()

export const CustomCellContent = {
  args: {
    data: [
      { A: 1, B: 2, C: false },
      { A: 4, B: 5, C: true },
      { A: 2, B: 8, C: true },
      { A: 3, B: 9, C: false },
    ],
    cellContent: (col: string) => (col === 'C' ? CheckboxContent : undefined),
  },
} satisfies Story
