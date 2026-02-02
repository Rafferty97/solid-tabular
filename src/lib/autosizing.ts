import { RecordSet, Row } from 'src/execution/recordset'
import { Column } from 'src/table/types'
import { measureTexts, TextMeasurementOptions } from './textMeasurement'
import { ColumnId } from 'src/state/common/id'

export type AutosizingOptions = TextMeasurementOptions & {
  /** Maximum number of rows to sample for width calculation */
  maxSampleSize?: number
  /** Minimum column width in pixels */
  minWidth?: number
  /** Maximum column width in pixels */
  maxWidth?: number
  /** Padding to add to text measurements */
  padding?: number
}

export interface ColumnWidthResult {
  columnId: ColumnId
  width: number
}

/**
 * Calculates optimal widths for columns using stratified sampling.
 */
export async function calculateColumnWidths(
  recordSet: RecordSet,
  columns: Column<ColumnId>[],
  options: AutosizingOptions = {},
) {
  const sampleData = await getStratifiedSample(recordSet, options.maxSampleSize ?? 1000)
  return columns.map(column => calculateColumnWidth(column, sampleData, options))
}

/**
 * Calculates optimal width for a single column.
 */
function calculateColumnWidth(
  column: Column<ColumnId>,
  sampleData: readonly Row[],
  options: AutosizingOptions,
): ColumnWidthResult {
  // Collect all text values to measure (including column name)
  const textValues: string[] = [column.name]

  // Add sample data values
  for (const row of sampleData) {
    const value = row[column.id as string]
    const textValue = formatValueForMeasurement(value)
    textValues.push(textValue)
  }

  // Measure all texts and filter outliers
  const widths = measureTexts(textValues, options)
    .filter(w => !isNaN(w) && w > 0)
    .sort((a, b) => a - b)

  // Handle edge case of no valid widths
  if (widths.length === 0) {
    return { columnId: column.id, width: options.minWidth ?? 200 }
  }

  // Calculate 95th percentile
  const percentileIndex = Math.floor(widths.length * 0.95)
  const safeIndex = Math.max(0, Math.min(percentileIndex, widths.length - 1))
  const percentile95 = widths[safeIndex]! // Safe because we know widths.length > 0

  // Calculate width with 1.5x cap on 95th percentile
  const maxWidth = Math.max(...widths)
  let width = Math.min(maxWidth, percentile95 * 1.5) + (options.padding ?? 40)

  // Apply min/max constraints
  width = options.minWidth ? Math.max(options.minWidth, width) : width
  width = options.maxWidth ? Math.min(options.maxWidth, width) : width

  return { columnId: column.id, width }
}

/**
 * Gets a stratified sample from the RecordSet.
 * Samples from beginning (33%), middle (33%), and end (34%) of the dataset.
 */
async function getStratifiedSample(
  recordSet: RecordSet,
  maxSampleSize: number,
): Promise<readonly Row[]> {
  const totalRows = recordSet.numRows

  if (totalRows === 0) return []
  if (totalRows <= maxSampleSize) {
    // If dataset is small enough, just get all rows
    return await recordSet.getRows(0, totalRows).then(rowset => rowset.rows)
  }

  // Divide sample size into three strata
  const strataSize = Math.floor(maxSampleSize / 3)
  const lastStrataSize = maxSampleSize - strataSize * 2

  // Calculate ranges for each stratum
  const beginningEnd = Math.min(strataSize, Math.floor(totalRows / 3))
  const middleStart = Math.floor(totalRows / 3)
  const middleEnd = Math.min(middleStart + strataSize, Math.floor((2 * totalRows) / 3))
  const endStart = Math.max(totalRows - lastStrataSize, Math.floor((2 * totalRows) / 3))

  // Fetch data from each stratum
  const [beginning, middle, end] = await Promise.all([
    recordSet.getRows(0, beginningEnd),
    recordSet.getRows(middleStart, middleEnd),
    recordSet.getRows(endStart, totalRows),
  ])

  // Combine all samples
  return [...beginning.rows, ...middle.rows, ...end.rows]
}

/**
 * Formats a cell value for width measurement.
 */
function formatValueForMeasurement(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }

  const str = String(value)

  // Limit extremely long strings
  const MAX_LENGTH = 512
  return str.length > MAX_LENGTH ? str.substring(0, MAX_LENGTH) : str
}
