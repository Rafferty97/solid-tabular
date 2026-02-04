import { createSignal, type Component } from 'solid-js'
import { Table } from 'src'
import { ActiveRange } from 'src/table/types'
import { textContent } from 'src/components/CellContent'
import './app.css'

const App: Component = () => {
  const [activeRange, setActiveRange] = createSignal<ActiveRange>({ cell: [0, 0] })
  const [columnWidths, setColumnWidths] = createSignal(new Map<string, number>())

  return (
    <div class="app">
      <Table
        columns={[
          { id: '1', name: 'A', component: textContent() },
          { id: '2', name: 'B', component: textContent() },
          { id: '3', name: 'C', component: textContent() },
          { id: '4', name: 'D', component: textContent() },
          { id: '5', name: 'E', component: textContent() },
        ]}
        numRows={50}
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
        columnsEditable
        rowsEditable
      />
    </div>
  )
}

export default App
