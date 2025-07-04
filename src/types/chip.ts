// src/types/chip.ts - 筹码相关类型
export interface ChipData {
  id: string
  value: number
  name: string
  image: string
  displayValue: string
}

export interface ChipSelectionEvent {
  chipId: string
  chipValue: number
  chipData: ChipData
}
