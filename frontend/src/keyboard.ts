import type { KeyboardEvent } from 'react'

type TextInputEl = HTMLInputElement | HTMLTextAreaElement

export function handleCtrlBackspaceWordDelete(
  e: KeyboardEvent<TextInputEl>,
  setValue: (next: string) => void,
): void {
  if (e.key !== 'Backspace' || !e.ctrlKey || e.metaKey || e.altKey) {
    return
  }

  const el = e.currentTarget
  const value = el.value
  const selectionStart = el.selectionStart
  const selectionEnd = el.selectionEnd

  if (selectionStart === null || selectionEnd === null) {
    return
  }

  e.preventDefault()

  let deleteFrom = selectionStart
  const deleteTo = selectionEnd

  if (selectionStart === selectionEnd) {
    while (deleteFrom > 0 && /\s/.test(value[deleteFrom - 1])) {
      deleteFrom -= 1
    }
    while (deleteFrom > 0 && !/\s/.test(value[deleteFrom - 1])) {
      deleteFrom -= 1
    }
  }

  const nextValue = value.slice(0, deleteFrom) + value.slice(deleteTo)
  setValue(nextValue)

  requestAnimationFrame(() => {
    el.setSelectionRange(deleteFrom, deleteFrom)
  })
}
