import { createMemo, createSignal, onMount } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { fn } from 'storybook/test'
import { ActiveRange, Table } from 'src'
import Papa from 'papaparse'

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
          columns={Object.keys(data()[0] ?? {})}
          numRows={data().length}
          getCellValue={(row, col) => data()[row]![col]!}
          setCellValue={props.setCellValue}
          activeRange={activeRange()}
          setActiveRange={setActiveRange}
          getColumnSize={col => widths().get(col)}
          setColumnSize={(col, size) => setWidths(w => new Map([...w, [col, size]]))}
          resetColumnSize={col => setWidths(w => new Map([...w].filter(e => e[0] !== col)))}
          columnsResizeable
          getCellEditable={() => true}
        />
      </div>
    )
  },
} satisfies Meta<{
  data?: Record<string, unknown>[]
  url?: string
  accentColor: string
  setCellValue: (row: number, column: string, value: unknown) => void
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
