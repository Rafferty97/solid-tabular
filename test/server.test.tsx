import { describe, expect, it } from 'vitest'
import { isServer, renderToString } from 'solid-js/web'
import { Table } from 'src'

describe('environment', () => {
  it('runs on server', () => {
    expect(typeof window).toBe('undefined')
    expect(isServer).toBe(true)
  })
})

describe('Table', () => {
  it('renders a table component', () => {
    renderToString(() => (
      <Table columns={[]} numRows={0} activeRange={{ cell: [0, 0] }} getCellValue={() => null} />
    ))
  })
})
