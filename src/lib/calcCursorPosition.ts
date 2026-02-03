export function calcCursorPosition(node: HTMLElement, mouseX: number): number {
  const text = node.innerText
  const left = node.getBoundingClientRect().left

  node.innerText = ''
  let x = node.getBoundingClientRect().width

  let i = 0
  for (; i < text.length; i++) {
    node.innerText = text.substring(0, i + 1)
    const x2 = node.getBoundingClientRect().width
    if (mouseX - left < 0.5 * (x + x2)) {
      break
    }
    x = x2
  }

  node.innerText = text
  return i
}
