<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-tabular&background=tiles&project=%20" alt="solid-tabular">
</p>

# solid-tabular

[![npm version](https://img.shields.io/npm/v/solid-tabular.svg?style=flat)](https://www.npmjs.com/package/solid-tabular)
[![bundle size](https://img.shields.io/bundlephobia/minzip/solid-tabular?style=flat)](https://bundlephobia.com/package/solid-tabular)
[![license](https://img.shields.io/npm/l/solid-tabular.svg?style=flat)](https://github.com/Rafferty97/solid-tabular/blob/main/LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=flat&logo=pnpm)](https://pnpm.io/)


Spreadsheet-like table UI for SolidJS.

__Demo:__ https://alexanderrafferty.com/projects/solid-tabular/

⚠️ This library is currently in early development, and breaking changes will definitely occur.

## Features

- 🚀 **Virtualization**: Efficiently renders large datasets using `@tanstack/solid-virtual`.
- 🖱️ **Selection**: Excel-like cell and range selection.
- ✏️ **Editing**: In-place cell editing.
- 📏 **Resizing**: Draggable column resizing.
- 📋 **Clipboard**: Copy and paste support.
- ⌨️ **Keyboard Navigation**: Arrow keys, Tab, Enter, etc.
- 🎨 **Customizable**: CSS variables for theming.

## Installation

```bash
npm install solid-tabular
# or
pnpm add solid-tabular
# or
yarn add solid-tabular
```

## Basic Usage

The example below shows how to display a static data table with default column widths.

```tsx
import { createSignal } from 'solid-js'
import { Table, ActiveRange } from 'solid-tabular'
import 'solid-tabular/dist/index.css'

function App() {
  const [activeRange, setActiveRange] = createSignal<ActiveRange>()
  
  const columns = ['A', 'B', 'C']
  
  const [data, setData] = createSignal([
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3'],
  ])

  return (
    <div style={{ height: '500px' }}>
      <Table
        columns={columns}
        numRows={data().length}
        getCellValue={(row, col) => data()[row][columns.indexOf(col)]}
        activeRange={activeRange()}
        setActiveRange={setActiveRange}
      />
    </div>
  )
}
```

## API

### `Table` Component

The `Table` component is the main entry point, and has two generic type parameters `Column` and `Value`.

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Column[]` | Array of column objects. |
| `numRows` | `number` | Total number of rows. |
| `getCellValue` | `(row: number, column: Column) => Value` | Function to get the value for a cell. |
| `setCellValue` | `(row: number, column: Column, value: Value) => void` | Function to update the value of a cell. |
| `activeRange` | `ActiveRange` | The current selection state. |
| `setActiveRange` | `(range: ActiveRange) => void` | Callback to update the selection state. |
| `columnsResizeable` | `boolean` | Enables column resizing. |
| `columnsEditable` | `boolean` | Enables column operations (insert/delete/rename). |
| `rowsEditable` | `boolean` | Enables row operations (insert/delete). |
| `cellHeight` | `number` | Height of cells in pixels (default: 29). |
| `getColumnSize` | `(column: Column) => number` | Get column width. |
| `setColumnSize` | `(column: Column, width: number) => void` | Set column width. |
| `resetColumnSize` | `(column: Column) => void` | Reset column width. |
| `getColumnName` | `(column: Column) => string` | Get column name. |
| `setColumnName` | `(column: Column, name: string) => void` | Set column name. |
| `insertColumns` | `(index: number, count: number) => void` | Insert columns. |
| `insertRows` | `(index: number, count: number) => void` | Insert rows. |
| `removeColumns` | `(index: number, count: number) => void` | Remove columns. |
| `removeRows` | `(index: number, count: number) => void` | Remove rows. |
| `onCopy` | `(min: CellIndex, max: CellIndex) => void` | Called when cells are copied. |
| `onPaste` | `(min: CellIndex, max: CellIndex) => void` | Called when cells are pasted. |
| `onClear` | `(min: CellIndex, max: CellIndex) => void` | Called when cells are cleared (delete key). |

### Theming

You can customize the appearance using CSS variables:

```css
.my-table {
  /* General */
  --solid-tabular-font: 0.875rem 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --solid-tabular-bg-color: oklch(92.8% 0.006 264.531);
  --solid-tabular-text-color: black;

  /* Cells */
  --solid-tabular-cell-color: white;
  --solid-tabular-cell-hover-color: oklch(96.7% 0.003 264.542);
  --solid-tabular-border-color: oklch(87.2% 0.01 258.338);
  --solid-tabular-placeholder-color: oklch(70.7% 0.022 261.325);

  /* Headers */
  --solid-tabular-header-color: var(--solid-tabular-cell-color);
  --solid-tabular-rownum-color: inherit;
  --solid-tabular-font-size-row-num: 1em;

  /* Selection & Accents */
  --solid-tabular-accent-color: oklch(45.7% 0.24 277.023);
  --solid-tabular-shade-color: rgba(0, 0, 0, 0.12);
}
```

