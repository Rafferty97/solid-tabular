export function fuzzyMatch(haystack: string, needle: string) {
  haystack = haystack.toLowerCase()

  for (const piece of needle.toLowerCase().split(/[^\w]+/)) {
    const pos = haystack.search(piece)
    if (pos < 0) return false
  }

  return true
}
