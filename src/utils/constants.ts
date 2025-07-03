// 投注区域配置
export const BET_ZONES = [
  { id: 8, name: '庄', odds: '1:1/0.95', rateId: 8 },
  { id: 6, name: '闲', odds: '1:1', rateId: 6 },
  { id: 7, name: '和', odds: '1:8', rateId: 7 },
  { id: 4, name: '庄对', odds: '1:11', rateId: 4 },
  { id: 2, name: '闲对', odds: '1:11', rateId: 2 },
  { id: 3, name: '幸运6', odds: '1:12/20', rateId: 3 },
  { id: 9, name: '龙7', odds: '1:40', rateId: 9 },
  { id: 10, name: '熊8', odds: '1:25', rateId: 10 }
] as const;

// 默认筹码面额
export const DEFAULT_CHIPS = [1, 5, 10, 50, 100] as const;
