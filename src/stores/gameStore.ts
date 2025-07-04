import { defineStore } from 'pinia'

// 游戏状态类型
export type GameStatus = 'waiting' | 'betting' | 'dealing' | 'result'

// 游戏状态接口
export interface GameState {
  gameNumber: string
  status: GameStatus
  countdown: number
}

// 游戏设置接口
export interface GameSettings {
  tableName: string
  limits: { min: number; max: number }
}

export const useGameStore = defineStore('game', {
  state: () => ({
    // 基本游戏状态
    gameState: {
      gameNumber: '',
      status: 'waiting' as GameStatus,
      countdown: 0
    },

    // 视频相关
    videoUrl: '',

    // 用户基本信息
    balance: 10000,

    // 游戏设置
    settings: {
      tableName: '百家乐001',
      limits: { min: 10, max: 50000 }
    },

    // 连接状态
    isConnected: false,

    // 回合数（用于生成局号）
    round: 1
  }),

  getters: {
    // 格式化余额显示
    formattedBalance: (state) => {
      return state.balance.toLocaleString()
    },

    // 游戏是否活跃
    isGameActive: (state) => {
      return ['betting', 'dealing'].includes(state.gameState.status)
    },

    // 完整局号
    fullGameNumber: (state) => {
      if (state.gameState.gameNumber) {
        return state.gameState.gameNumber
      }
      // 生成默认局号: B001 + 年月日 + 序号
      const now = new Date()
      const dateStr = now.getFullYear().toString().slice(-2) +
                      String(now.getMonth() + 1).padStart(2, '0') +
                      String(now.getDate()).padStart(2, '0')
      const sequence = String(state.round).padStart(4, '0')
      return `B001${dateStr}${sequence}`
    },

    // 游戏状态文本
    gameStatusText: (state) => {
      switch (state.gameState.status) {
        case 'waiting': return '等待开始'
        case 'betting': return '投注中'
        case 'dealing': return '发牌中'
        case 'result': return '结果公布'
        default: return '未知状态'
      }
    },

    // 是否可以投注
    canBet: (state) => {
      return state.gameState.status === 'betting' && state.gameState.countdown > 0
    }
  },

  actions: {
    // 更新游戏状态
    updateGameStatus(status: GameStatus) {
      this.gameState.status = status
      console.log(`🎮 游戏状态更新: ${status}`)
    },

    // 更新倒计时
    updateCountdown(seconds: number) {
      this.gameState.countdown = seconds
    },

    // 更新余额
    updateBalance(amount: number) {
      this.balance = amount
    },

    // 更新局号
    updateGameNumber(gameNumber: string) {
      this.gameState.gameNumber = gameNumber
    },

    // 更新视频URL
    updateVideoUrl(url: string) {
      this.videoUrl = url
    },

    // 生成新局号
    generateNewGameNumber() {
      const now = new Date()
      const dateStr = now.getFullYear().toString().slice(-2) +
                      String(now.getMonth() + 1).padStart(2, '0') +
                      String(now.getDate()).padStart(2, '0')
      const sequence = String(this.round).padStart(4, '0')
      const newGameNumber = `B001${dateStr}${sequence}`
      this.gameState.gameNumber = newGameNumber
      return newGameNumber
    },

    // 开始新回合
    startNewRound() {
      this.round++
      this.generateNewGameNumber()
      this.updateGameStatus('betting')
      this.updateCountdown(30)
    },

    // 更新桌台名称
    updateTableName(name: string) {
      this.settings.tableName = name
    },

    // 更新限注
    updateLimits(limits: { min: number; max: number }) {
      this.settings.limits = limits
    },

    // 更新连接状态
    updateConnectionStatus(connected: boolean) {
      this.isConnected = connected
    },

    // 构建带tableId的视频URL
    buildVideoUrlWithTableId(baseUrl: string, tableId: string | number): string {
      try {
        const url = new URL(baseUrl)
        const tableVideo = url.searchParams.get('tableVideo')

        if (tableVideo) {
          const newTableVideo = tableVideo + tableId
          url.searchParams.set('tableVideo', newTableVideo)
          return url.toString()
        }

        return baseUrl
      } catch (error) {
        console.error('构建视频URL失败:', error)
        return baseUrl
      }
    },

    // 初始化
    init() {
      console.log('🎮 游戏 Store 初始化')
      this.generateNewGameNumber()
      this.isConnected = true
      console.log('✅ 游戏 Store 初始化完成')
    }
  }
})
