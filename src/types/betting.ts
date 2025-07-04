// src/types/betting.ts - 投注相关类型
export type BaccaratBetType =
  | 'banker'        // 庄
  | 'player'        // 闲
  | 'tie'           // 和
  | 'banker-pair'   // 庄对
  | 'player-pair'   // 闲对
  | 'lucky-6'       // 幸运6
  | 'dragon-7'      // 龙7
  | 'panda-8'       // 熊8

export interface BetZoneData {
  totalAmount: number    // 总投注金额
  playerCount: number    // 投注人数
}

export interface BetHistoryStep {
  betType: BaccaratBetType
  amount: number
  action: 'add' | 'remove'
  timestamp: number
}
