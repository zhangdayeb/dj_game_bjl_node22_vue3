// src/types/game.ts - 游戏相关类型
export type GameStatus = 'waiting' | 'betting' | 'dealing' | 'result'

export interface GameState {
  gameNumber: string
  status: GameStatus
  countdown: number
}

export interface GameSettings {
  tableName: string
  limits: { min: number; max: number }
}
