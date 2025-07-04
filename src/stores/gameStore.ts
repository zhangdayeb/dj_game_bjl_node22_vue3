// src/stores/gameStore.ts - 百家乐版本
import { defineStore } from 'pinia'

// 百家乐游戏状态
export interface BaccaratGameState {
  videoUrl: string                    // 单一视频流
  gameNumber: string                  // 局号
  status: 'waiting' | 'betting' | 'dealing' | 'result'  // 游戏状态
  countdown: number                   // 倒计时
  round: number                       // 回合数
  // 百家乐特有状态
  bankerCards: string[]              // 庄家牌
  playerCards: string[]              // 闲家牌
  gameResult: string | null          // 游戏结果 (banker/player/tie)
  bankerScore: number                // 庄家点数
  playerScore: number                // 闲家点数
}

// 用户余额
export interface UserBalance {
  total: number
  currency: string
}

// 游戏设置
export interface GameSettings {
  tableName: string
  limits: { min: number; max: number }
  language: string
  dealerName?: string               // 荷官名称
  tableTheme?: string              // 桌台主题
}

export const useGameStore = defineStore('game', {
  state: (): {
    gameState: BaccaratGameState
    userBalance: UserBalance
    settings: GameSettings
    isConnected: boolean
  } => ({
    gameState: {
      videoUrl: '',
      gameNumber: '',
      status: 'waiting',
      countdown: 0,
      round: 1,
      // 百家乐特有状态
      bankerCards: [],
      playerCards: [],
      gameResult: null,
      bankerScore: 0,
      playerScore: 0
    },
    userBalance: {
      total: 10000,
      currency: 'CNY'
    },
    settings: {
      tableName: '百家乐001',
      limits: { min: 10, max: 50000 },
      language: 'zh',
      dealerName: '荷官小美',
      tableTheme: 'classic'
    },
    isConnected: false
  }),

  getters: {
    // 格式化余额显示
    formattedBalance: (state) => {
      return `${state.userBalance.currency} ${state.userBalance.total.toLocaleString()}`
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
      const tableId = 'B001'  // B代表百家乐
      const now = new Date()
      const dateStr = now.getFullYear().toString().slice(-2) +
                      String(now.getMonth() + 1).padStart(2, '0') +
                      String(now.getDate()).padStart(2, '0')
      const sequence = String(state.gameState.round).padStart(4, '0')
      return `${tableId}${dateStr}${sequence}`
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
    },

    // 游戏结果文本
    gameResultText: (state) => {
      switch (state.gameState.gameResult) {
        case 'banker': return '庄家胜'
        case 'player': return '闲家胜'
        case 'tie': return '和局'
        default: return ''
      }
    }
  },

  actions: {
    // 更新游戏状态
    updateGameStatus(status: BaccaratGameState['status']) {
      this.gameState.status = status
      console.log(`🎮 游戏状态更新: ${status}`)
      this.notifyCocos('gameStatusChange', { status })
    },

    // 更新倒计时
    updateCountdown(seconds: number) {
      this.gameState.countdown = seconds
    },

    // 更新余额
    updateBalance(amount: number) {
      this.userBalance.total = amount
      this.notifyCocos('balanceChange', { balance: amount })
    },

    // 更新局号
    updateGameNumber(gameNumber: string) {
      this.gameState.gameNumber = gameNumber
      this.gameState.round++
    },

    // 更新视频URL
    updateVideoUrl(videoUrl: string) {
      this.gameState.videoUrl = videoUrl
    },

    // 生成新局号
    generateNewGameNumber() {
      const tableId = 'B001'
      const now = new Date()
      const dateStr = now.getFullYear().toString().slice(-2) +
                      String(now.getMonth() + 1).padStart(2, '0') +
                      String(now.getDate()).padStart(2, '0')
      const sequence = String(this.gameState.round).padStart(4, '0')
      const newGameNumber = `${tableId}${dateStr}${sequence}`
      this.gameState.gameNumber = newGameNumber
      return newGameNumber
    },

    // 开始新回合
    startNewRound() {
      this.gameState.round++
      this.generateNewGameNumber()
      this.resetGameData()
      this.updateGameStatus('betting')
      this.updateCountdown(30)
    },

    // 重置游戏数据
    resetGameData() {
      this.gameState.bankerCards = []
      this.gameState.playerCards = []
      this.gameState.gameResult = null
      this.gameState.bankerScore = 0
      this.gameState.playerScore = 0
    },

    // 更新庄家牌
    updateBankerCards(cards: string[]) {
      this.gameState.bankerCards = cards
      this.gameState.bankerScore = this.calculateScore(cards)
    },

    // 更新闲家牌
    updatePlayerCards(cards: string[]) {
      this.gameState.playerCards = cards
      this.gameState.playerScore = this.calculateScore(cards)
    },

    // 计算百家乐点数
    calculateScore(cards: string[]): number {
      let total = 0
      for (const card of cards) {
        const value = this.getCardValue(card)
        total += value
      }
      return total % 10
    },

    // 获取牌面值
    getCardValue(card: string): number {
      const rank = card.slice(0, -1) // 去掉花色
      if (['J', 'Q', 'K'].includes(rank)) return 0
      if (rank === 'A') return 1
      return parseInt(rank) || 0
    },

    // 更新游戏结果
    updateGameResult(result: string) {
      this.gameState.gameResult = result
      this.updateGameStatus('result')
    },

    // 更新荷官名称
    updateDealerName(name: string) {
      this.settings.dealerName = name
    },

    // 更新桌台主题
    updateTableTheme(theme: string) {
      this.settings.tableTheme = theme
    },

    // 通知 Cocos 引擎
    notifyCocos(event: string, data: any) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(`vue-to-cocos-${event}`, {
          detail: data
        }))
      }
    },

    // 初始化
    init() {
      console.log('🎮 百家乐游戏 Store 初始化')
      this.generateNewGameNumber()
      this.isConnected = true
    }
  }
})
