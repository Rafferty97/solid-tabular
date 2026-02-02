import type { Component } from 'solid-js'
import styles from './App.module.css'
import { Table } from 'src'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Table
        columns={[{ id: '1', name: 'a', width: 200 }]}
        activeRange={{ cell: [0, 0] }}
        getCellValue={() => 'hello'}
        numRows={1}
      />
    </div>
  )
}

export default App
