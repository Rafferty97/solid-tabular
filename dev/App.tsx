import { createSignal, type Component } from 'solid-js'
import styles from './App.module.css'
import { Table } from 'src'
import { ActiveRange } from 'src/table/types'

const App: Component = () => {
  const [activeRange, setActiveRange] = createSignal<ActiveRange>({ cell: [0, 0] })

  return (
    <div class={styles.App}>
      <Table
        columns={[
          { id: '1', name: 'A', width: 150 },
          { id: '2', name: 'B', width: 150 },
          { id: '3', name: 'C', width: 150 },
          { id: '4', name: 'D', width: 150 },
          { id: '5', name: 'E', width: 150 },
        ]}
        activeRange={activeRange()}
        setActiveRange={setActiveRange}
        getCellValue={i => (i % 2 ? null : 'hello')}
        numRows={5}
      />
    </div>
  )
}

export default App
