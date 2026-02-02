import { DataType } from 'src/execution/types'

export function isArrayOrStruct(ty: DataType) {
  return unwrapNullable(ty).t.match(/^(list|struct)$/i)
}

export function isNumeric(ty: DataType) {
  return unwrapNullable(ty).t.match(/^(float|int|uint)/i)
}

export function unwrapNullable(ty: DataType): DataType
export function unwrapNullable(ty: DataType | undefined): DataType | undefined
export function unwrapNullable(ty: DataType | undefined): DataType | undefined {
  if (!ty) return undefined
  let out = ty
  while (out.t === 'Nullable') out = out.c
  return out
}
