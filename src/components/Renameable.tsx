import { createMemo, createSignal } from 'solid-js'
import { cn } from 'src/lib/classnames'
import './Renameable.css'

export interface RenameableProps {
  class?: string
  value: string
  setValue: (value: string) => void
  disabled?: boolean
  placeholder?: string
  allowEmpty?: boolean
  editOnDblClick?: boolean
  blur?: () => void
}

export function Renameable(props: RenameableProps) {
  let containerEl: HTMLDivElement | undefined
  let inputEl: HTMLInputElement | undefined

  // The current text in the input field, or `null` if not editing
  const [value, setValue] = createSignal<string | null>()

  // Focus drives the editing state
  const handleFocusIn = () => {
    setValue(props.value)
  }

  const handleFocusOut = () => {
    const newValue = value()?.trim()
    if (inputEl && newValue != null && (newValue !== '' || props.allowEmpty)) {
      props.setValue(newValue)
    }
    setValue(null)
  }

  // Methods to start, complete or cancel editing
  const startRename = () => {
    if (!inputEl) return
    inputEl.value = props.value
    inputEl.setSelectionRange(0, inputEl.value.length)
    inputEl.focus()
  }

  const endRename = () => {
    if (props.blur) {
      props.blur()
    } else {
      inputEl?.blur()
    }
  }

  const cancelRename = () => {
    setValue(null)
    endRename()
  }

  const handleDblClick = (ev: MouseEvent) => {
    if (props.editOnDblClick === false) return
    ev.preventDefault()
    startRename()
  }

  const handleKeyDown = (ev: KeyboardEvent) => {
    ev.stopPropagation()

    if (ev.key === 'Enter') {
      endRename()
      return
    }

    if (ev.key === 'Escape') {
      cancelRename()
      return
    }
  }

  const handleInput = () => {
    if (!inputEl) return
    setValue(inputEl.value)
  }

  const shownValue = createMemo(() => (value() ?? props.value) || (props.placeholder ?? ' '))

  return (
    <div
      data-solid-tabular-renameable
      class={props.class}
      onPointerDown={ev => value() != null && ev.stopPropagation()}
      onClick={ev => ev.stopPropagation()}
      onDblClick={handleDblClick}
      ref={containerEl}
    >
      <div class={cn({ empty: !props.value.length })} title={shownValue()}>
        {shownValue()}
      </div>
      <input
        ref={inputEl}
        name="input"
        tabIndex={-1}
        class={cn({ show: value() != null })}
        placeholder={props.placeholder}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocusIn={handleFocusIn}
        onFocusOut={handleFocusOut}
        disabled={props.disabled}
      />
    </div>
  )
}
