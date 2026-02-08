export async function copyTableToClipboard(table: string[][]) {
  const textData = table.map(row => row.map(s => s.replace(/[\t\r\n]/g, '')).join('\t')).join('\n')

  const htmlTable = document.createElement('table')
  for (const row of table) {
    const htmlRow = document.createElement('tr')
    htmlTable.appendChild(htmlRow)
    for (const cell of row) {
      const htmlCell = document.createElement('td')
      htmlRow.appendChild(htmlCell)
      htmlCell.innerText = cell
    }
  }
  const htmlData = htmlTable.outerHTML

  const textBlob = new Blob([textData], { type: 'text/plain' })
  const htmlBlob = new Blob([htmlData], { type: 'text/html' })

  const clipboardItem = new ClipboardItem({
    'text/plain': textBlob,
    'text/html': htmlBlob,
  })

  await navigator.clipboard.write([clipboardItem])
}

export async function pasteTableFromClipboard(): Promise<string[][] | null> {
  try {
    const clipboardItems = await navigator.clipboard.read()

    for (const item of clipboardItems) {
      if (item.types.includes('text/html')) {
        const blob = await item.getType('text/html')
        const html = await blob.text()
        return parseHtmlTable(html)
      }
    }

    for (const item of clipboardItems) {
      if (item.types.includes('text/plain')) {
        const blob = await item.getType('text/plain')
        const text = await blob.text()
        return parseTextTable(text)
      }
    }
  } catch (_err) {
    // Ignore error, try readText
  }

  try {
    const text = await navigator.clipboard.readText()
    return parseTextTable(text)
  } catch (_err) {
    // console.error('Failed to read clipboard', e)
    return null
  }
}

function parseHtmlTable(html: string): string[][] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const table = doc.querySelector('table')

  if (!table) return []

  const data: string[][] = []
  for (const row of Array.from(table.rows)) {
    const rowData: string[] = []
    for (const cell of Array.from(row.cells)) {
      rowData.push(cell.innerText)
    }
    data.push(rowData)
  }
  return data
}

function parseTextTable(text: string): string[][] {
  const rows = text.split(/\r\n|\n|\r/)
  if (rows[rows.length - 1] === '') {
    rows.pop()
  }
  return rows.map(row => row.split('\t'))
}
