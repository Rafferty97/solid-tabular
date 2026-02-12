import { createMemo, JSXElement, onCleanup, Show } from 'solid-js'
import { calcCursorPosition } from 'src/lib/calcCursorPosition'
import { CellContentProps } from '../table/Cell'
import { createEvent, Handler } from 'src/lib/createEvent'
import { cn } from 'src/lib/classnames'
import './CellContent.css'

export type CellFormat = Partial<{
  align: Alignment
  content: (value: unknown) => string
  prefix: (value: unknown) => JSXElement
  suffix: (value: unknown) => JSXElement
  color: string
}>

export type Alignment = 'left' | 'center' | 'right'

type InputProps = CellContentProps & {
  focus: Handler<{ start: number; end?: number }>
}

export const createTextContent = (format: CellFormat = {}) => {
  const Input = (props: InputProps) => {
    let inputEl: HTMLInputElement | undefined
    let quickMode = true

    const value = createMemo(() => (props.value != null ? String(props.value) : ''))

    const edit = (start: number, end: number | null, quick: boolean) => {
      if (!inputEl) return
      quickMode = quick
      inputEl.scrollLeft = 0
      inputEl.setSelectionRange(start, end ?? inputEl.value.length)
      inputEl.focus({ preventScroll: true })
    }
    props.focus(({ start, end }) => edit(start, end ?? null, false))
    props.quickEdit(() => edit(0, null, true))

    onCleanup(() => inputEl === document.activeElement && props.setValue(inputEl.value))

    const handleInputKeyDown = (ev: KeyboardEvent) => {
      if (!inputEl) return

      // Let these bubble up to the Table
      if (ev.key === 'Tab' || ev.key === 'Enter') {
        return
      }
      if (quickMode && ev.key.startsWith('Arrow')) {
        return
      }

      if (ev.key === 'Escape') {
        ev.preventDefault()
        inputEl.value = value()
        props.onFinishedEditing()
        return
      }

      // Handle all other keys natively
      ev.stopPropagation()
    }

    return (
      <div class="solid-tabular/text-content-input">
        <input
          ref={inputEl}
          name="cellinput" // not needed, but suppresses warnings in Chrome
          style={{ 'text-align': format.align }}
          value={value()}
          onChange={ev => props.setValue(ev.currentTarget.value)}
          onKeyDown={handleInputKeyDown}
          onPointerDown={ev => ev.stopPropagation()}
          onClick={() => (quickMode = false)}
          onDblClick={ev => ev.stopPropagation()}
          onPaste={ev => ev.stopPropagation()}
          tabIndex={-1}
        />
      </div>
    )
  }

  return (props: CellContentProps) => {
    let contentEl: HTMLDivElement | undefined

    const [onFocus, emitFocus] = createEvent<{ start: number; end?: number }>()

    const handleDoubleClick = (ev: MouseEvent) => {
      // FIXME: check if editable?
      ev.stopPropagation()
      const pos = contentEl ? calcCursorPosition(contentEl, ev.pageX) : 0
      emitFocus({ start: pos, end: pos })
    }

    return (
      <div
        onDblClick={handleDoubleClick}
        class="solid-tabular/text-content"
        style={{ color: format.color ?? 'inherit' }}
      >
        {format.prefix?.(props.value)}
        <div
          class={cn('solid-tabular/text-content-inner', {
            'solid-tabular/align-right': format.align === 'right',
            'solid-tabular/align-center': format.align === 'center',
          })}
        >
          <span ref={contentEl}>{format.content?.(props.value) ?? String(props.value)}</span>
        </div>
        {format.suffix?.(props.value)}
        <Show when={props.editing}>
          <Input {...props} focus={onFocus} />
        </Show>
      </div>
    )
  }
}

export const createCheckboxContent = () => (props: CellContentProps) => {
  let inputEl: HTMLInputElement | undefined

  props.quickEdit(ev => {
    if (ev.code === 'Space' && !ev.repeat) {
      ev.preventDefault()
      props.setValue(!props.value)
    }
  })

  return (
    <div class="solid-tabular/checkbox-content">
      <label onPointerDown={ev => ev.stopPropagation()}>
        <input
          ref={inputEl}
          type="checkbox"
          class="solid-tabular/sr-only"
          checked={!!props.value}
          onChange={ev => props.setValue(ev.target.checked)}
          // disabled={props.readonly}
        />
        <div
          class={cn(
            'solid-tabular/checkbox-box',
            props.value ? 'solid-tabular/checked' : 'solid-tabular/unchecked',
            // props.readonly ? 'solid-tabular/readonly' : 'solid-tabular/editable',
          )}
        >
          {!!props.value && (
            <svg class="solid-tabular/checkbox-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13.5 4.5l-7 7-4-4"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.5 4.5l-7 7-4-4"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          )}
        </div>
      </label>
    </div>
  )
}
