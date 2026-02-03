import { createRoot } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Table } from 'src'
import { describe, expect, it } from 'vitest'

describe('environment', () => {
  it('runs on client', () => {
    expect(typeof window).toBe('object')
    expect(isServer).toBe(false)
  })
})

describe('Table', () => {
  it('renders a table component', () => {
    createRoot(() => (
      <Table columns={[]} numRows={0} activeRange={{ cell: [0, 0] }} getCellValue={() => null} />
    ))
  })
})
