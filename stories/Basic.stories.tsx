import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Table, type ActiveRange } from 'src'
import './main.css'

const meta = {
  title: 'Solid Tabular/Getting Started',
  component: Table,
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const BasicUsage: Story = {
  render: () => {
    const [activeRange, setActiveRange] = createSignal<ActiveRange>({ cell: [0, 0] })
    const [columnWidths, setColumnWidths] = createSignal(new Map<string, number>())

    return (
      <div class="table-wrap">
        <Table
          columns={[
            { id: '1', name: 'A' },
            { id: '2', name: 'B' },
            { id: '3', name: 'C' },
            { id: '4', name: 'D' },
            { id: '5', name: 'E' },
          ]}
          numRows={10}
          getCellValue={(row, col) => `${col.name}${row + 1}`}
          activeRange={activeRange()}
          setActiveRange={setActiveRange}
          getColumnSize={id => columnWidths().get(id)}
          setColumnSize={(id, width) =>
            setColumnWidths(m => {
              const newMap = new Map(m)
              newMap.set(id, width)
              return newMap
            })
          }
          resetColumnSize={id =>
            setColumnWidths(m => {
              const newMap = new Map(m)
              newMap.delete(id)
              return newMap
            })
          }
          cellsEditable
        />
      </div>
    )
  },
}
