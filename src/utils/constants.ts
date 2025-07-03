// 投注区域配置
export const BET_ZONES = [
  { id: 'banker', name: '庄', odds: 1.95 },
  { id: 'player', name: '闲', odds: 2.0 },
  { id: 'tie', name: '和', odds: 9.0 },
  { id: 'banker_pair', name: '庄对', odds: 12.0 },
  { id: 'player_pair', name: '闲对', odds: 12.0 },
  { id: 'lucky6', name: '幸运6', odds: 21.0 },
  { id: 'dragon7', name: '龙7', odds: 41.0 },
  { id: 'panda8', name: '熊8', odds: 26.0 }
] as const;

// 默认筹码面额
export const DEFAULT_CHIPS = [1, 5, 10, 50, 100] as const;
