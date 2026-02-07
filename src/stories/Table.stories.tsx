import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ActiveRange, Table } from 'src'
import { createSignal } from 'solid-js'
import { fn } from 'storybook/test'

const meta = {
  args: {
    columns: ['A', 'B', 'C', 'D', 'E'],
    numRows: 10,
    accentColor: '#de3b84',
    setCellValue: fn(),
  },
  render: props => {
    const [activeRange, setActiveRange] = createSignal<ActiveRange>()
    const [widths, setWidths] = createSignal(new Map<string, number>())

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
          {...props}
          getCellValue={(row, col) => `${col}${row}`}
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
  columns: string[]
  numRows: number
  accentColor: string
  setCellValue: (row: number, column: string, value: string) => void
}>

export default meta

type Story = StoryObj<typeof meta>

export const BasicUsage = {
  args: {},
} satisfies Story
