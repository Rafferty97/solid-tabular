import { createSignal, type Component } from 'solid-js'
import styles from './App.module.css'
import { Table } from 'src'
import { ActiveRange } from 'src/table/types'

const App: Component = () => {
  const [activeRange, setActiveRange] = createSignal<ActiveRange>({ cell: [0, 0] })
  const [columnWidths, setColumnWidths] = createSignal(new Map<string, number>())

  return (
    <div class={styles.App}>
      <Table
        columns={[
          { id: '1', name: 'A' },
          { id: '2', name: 'B' },
          { id: '3', name: 'C' },
          { id: '4', name: 'D' },
          { id: '5', name: 'E' },
        ]}
        numRows={5}
        getCellValue={i => (i % 2 ? null : 'hello')}
        activeRange={activeRange()}
        setActiveRange={setActiveRange}
        getColumnSize={id => columnWidths().get(id)}
        setColumnSize={(id, width) =>
          setColumnWidths(m => {
            const newMap = new Map(m)
            if (width) newMap.set(id, width)
            else newMap.delete(id)
            return newMap
          })
        }
      />
    </div>
  )
}

export default App
