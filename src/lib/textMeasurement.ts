/**
 * Text measurement utilities for calculating column widths based on content.
 * Uses canvas-based text measurement for accurate width calculations.
 */

export interface TextMeasurementOptions {
  /** Font family to use for measurement */
  fontFamily?: string
  /** Font size in pixels */
  fontSize?: number
  /** Font weight */
  fontWeight?: string | number
}

/**
 * Canvas-based text measurement utility.
 * Provides accurate text width measurements using HTML5 Canvas.
 */
export class TextMeasurer {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private currentFont: string = ''

  constructor() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')!
  }

  measureText(text: string, options: TextMeasurementOptions = {}) {
    return this.measureTexts([text], options)[0]!
  }

  measureTexts(texts: string[], options: TextMeasurementOptions = {}) {
    const {
      fontFamily = 'system-ui, -apple-system, sans-serif',
      fontSize = 14,
      fontWeight = 'normal',
    } = options

    // Set font if it has changed
    const font = `${fontWeight} ${fontSize}px ${fontFamily}`
    if (this.currentFont !== font) {
      this.context.font = font
      this.currentFont = font
    }

    // Measure the texts
    return texts.map(text => Math.ceil(this.context.measureText(text).width))
  }
}

let sharedMeasurer: TextMeasurer | null = null

function getTextMeasurer(): TextMeasurer {
  if (!sharedMeasurer) {
    sharedMeasurer = new TextMeasurer()
  }
  return sharedMeasurer
}

/**
 * Convenience function to measure a single text value.
 */
export function measureText(text: string, options?: TextMeasurementOptions) {
  return getTextMeasurer().measureText(text, options)
}

/**
 * Convenience function to measure multiple text values.
 */
export function measureTexts(texts: string[], options?: TextMeasurementOptions) {
  return getTextMeasurer().measureTexts(texts, options)
}
