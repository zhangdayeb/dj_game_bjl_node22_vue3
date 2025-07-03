// src/utils/urlParams.ts
// 百家乐游戏参数获取工具 - 简化版

// 游戏参数接口
export interface GameParams {
  user_id: string
  game_type: string
  table_id: string
  token: string
}

/**
 * 从URL获取游戏参数
 * 示例URL: http://localhost:3000/?table_id=5&game_type=3&user_id=8&token=abc123
 */
export const getGameParams = (): GameParams => {
  const urlParams = new URLSearchParams(window.location.search)

  return {
    user_id: urlParams.get('user_id') || '',
    game_type: urlParams.get('game_type') || '',
    table_id: urlParams.get('table_id') || '',
    token: urlParams.get('token') || ''
  }
}

/**
 * 检查参数是否完整
 */
export const hasValidParams = (params: GameParams): boolean => {
  return !!(params.user_id && params.game_type && params.table_id && params.token)
}

/**
 * 获取参数并验证完整性
 */
export const getValidatedParams = (): {
  params: GameParams
  isValid: boolean
  missing: string[]
} => {
  const params = getGameParams()
  const missing: string[] = []

  if (!params.user_id) missing.push('user_id')
  if (!params.game_type) missing.push('game_type')
  if (!params.table_id) missing.push('table_id')
  if (!params.token) missing.push('token')

  return {
    params,
    isValid: missing.length === 0,
    missing
  }
}
