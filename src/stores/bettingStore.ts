// src/stores/bettingStore.ts - 最终简化版
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

// 百家乐投注类型
export type BaccaratBetType =
  | 'banker'        // 庄
  | 'player'        // 闲
  | 'tie'           // 和
  | 'banker-pair'   // 庄对
  | 'player-pair'   // 闲对
  | 'lucky-6'       // 幸运6
  | 'dragon-7'      // 龙7
  | 'panda-8'       // 熊8

// 投注区域模拟数据
interface BetZoneData {
  totalAmount: number    // 总投注金额
  playerCount: number    // 投注人数
}

// 投注历史记录（用于撤销）
interface BetHistoryStep {
  betType: BaccaratBetType
  amount: number
  action: 'add' | 'remove'
  timestamp: number
}

// 默认筹码
export const DEFAULT_CHIPS = [1, 5, 10, 50, 100] as const

export const useBettingStore = defineStore('betting', () => {
  // 1. 撤销操作数据
  const betHistory = ref<BetHistoryStep[]>([])

  // 2. 上一局投注数据
  const lastRoundBets = ref<Record<BaccaratBetType, number>>({
    'banker': 0,
    'player': 0,
    'tie': 0,
    'banker-pair': 0,
    'player-pair': 0,
    'lucky-6': 0,
    'dragon-7': 0,
    'panda-8': 0
  })

  // 3. 当前选中筹码
  const selectedChip = ref(10)

  // 4. 投注区域模拟数据
  const zoneSimulationData = reactive<Record<BaccaratBetType, BetZoneData>>({
    'banker': { totalAmount: 12580, playerCount: 23 },
    'player': { totalAmount: 8960, playerCount: 18 },
    'tie': { totalAmount: 2340, playerCount: 6 },
    'banker-pair': { totalAmount: 1150, playerCount: 8 },
    'player-pair': { totalAmount: 980, playerCount: 7 },
    'lucky-6': { totalAmount: 650, playerCount: 4 },
    'dragon-7': { totalAmount: 320, playerCount: 3 },
    'panda-8': { totalAmount: 280, playerCount: 2 }
  })

  // 5. 用户投注金额
  const userBets = reactive<Record<BaccaratBetType, number>>({
    'banker': 0,
    'player': 0,
    'tie': 0,
    'banker-pair': 0,
    'player-pair': 0,
    'lucky-6': 0,
    'dragon-7': 0,
    'panda-8': 0
  })

  // 6. 中奖闪烁状态
  const winningFlash = reactive<Record<BaccaratBetType, boolean>>({
    'banker': false,
    'player': false,
    'tie': false,
    'banker-pair': false,
    'player-pair': false,
    'lucky-6': false,
    'dragon-7': false,
    'panda-8': false
  })

  // 7. 免佣状态
  const isCommissionFree = ref(false)

  // 📊 计算属性
  const totalUserBets = computed(() => {
    return Object.values(userBets).reduce((sum, amount) => sum + amount, 0)
  })

  const hasLastRoundData = computed(() => {
    return Object.values(lastRoundBets.value).some(amount => amount > 0)
  })

  // 🔧 核心方法

  // 选择筹码
  const selectChip = (amount: number): void => {
    if (DEFAULT_CHIPS.includes(amount as any)) {
      selectedChip.value = amount
      console.log(`✅ 选择筹码: ${amount}`)
    }
  }

  // 撤销上一步
  const undoLastBet = (): void => {
    if (betHistory.value.length === 0) {
      console.log('❌ 没有可撤销的操作')
      return
    }

    const lastStep = betHistory.value.pop()!
    const { betType, amount, action } = lastStep

    if (action === 'add') {
      // 撤销加注，减少投注
      userBets[betType] = Math.max(0, userBets[betType] - amount)
    } else {
      // 撤销减注，增加投注
      userBets[betType] += amount
    }

    console.log(`↩️ 撤销操作: ${betType} ${action} ${amount}`)
  }

  // 清空所有投注
  const clearAllBets = (): void => {
    // 记录清空操作到历史
    Object.entries(userBets).forEach(([betType, amount]) => {
      if (amount > 0) {
        betHistory.value.push({
          betType: betType as BaccaratBetType,
          amount,
          action: 'remove',
          timestamp: Date.now()
        })
      }
    })

    // 清空所有投注
    Object.keys(userBets).forEach(betType => {
      userBets[betType as BaccaratBetType] = 0
    })

    console.log('🗑️ 清空所有投注')
  }

  // 恢复上一局
  const restoreLastRound = (): void => {
    if (!hasLastRoundData.value) {
      console.log('❌ 没有上一局数据')
      return
    }

    // 先清空当前投注
    clearAllBets()

    // 恢复上一局数据
    Object.entries(lastRoundBets.value).forEach(([betType, amount]) => {
      if (amount > 0) {
        userBets[betType as BaccaratBetType] = amount
        // 记录恢复操作
        betHistory.value.push({
          betType: betType as BaccaratBetType,
          amount,
          action: 'add',
          timestamp: Date.now()
        })
      }
    })

    console.log('🔄 恢复上一局投注:', lastRoundBets.value)
  }

  // 更新模拟数据
  const updateSimulationData = (betType: BaccaratBetType, data: Partial<BetZoneData>): void => {
    Object.assign(zoneSimulationData[betType], data)
    console.log(`📊 更新模拟数据 ${betType}:`, data)
  }

  // 开始中奖闪烁
  const startWinningFlash = (betType: BaccaratBetType): void => {
    winningFlash[betType] = true
    console.log(`✨ 开始中奖闪烁: ${betType}`)

    // 3秒后自动停止闪烁
    setTimeout(() => {
      winningFlash[betType] = false
      console.log(`🔆 停止中奖闪烁: ${betType}`)
    }, 3000)
  }

  // 保存当前局为上一局
  const saveCurrentRound = (): void => {
    // 复制当前投注到上一局
    Object.keys(userBets).forEach(betType => {
      lastRoundBets.value[betType as BaccaratBetType] = userBets[betType as BaccaratBetType]
    })

    console.log('💾 保存当前局:', { ...lastRoundBets.value })
  }

  // 切换免佣状态
  const toggleCommissionFree = (): void => {
    isCommissionFree.value = !isCommissionFree.value
    console.log(`🎯 免佣状态: ${isCommissionFree.value ? '开启' : '关闭'}`)
  }

  // 获取总投注额
  const getTotalBetAmount = (): number => {
    return totalUserBets.value
  }

  // 格式化金额显示
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString()
  }

  // 添加投注记录到历史（供外部调用）
  const addBetToHistory = (betType: BaccaratBetType, amount: number): void => {
    betHistory.value.push({
      betType,
      amount,
      action: 'add',
      timestamp: Date.now()
    })

    userBets[betType] += amount
    console.log(`➕ 添加投注: ${betType} +${amount}`)
  }

  // 初始化
  const init = (): void => {
    console.log('🎰 投注 Store 初始化')

    // 重置所有状态
    betHistory.value = []
    selectedChip.value = 10
    isCommissionFree.value = false

    // 重置上一局投注
    Object.keys(lastRoundBets.value).forEach(betType => {
      lastRoundBets.value[betType as BaccaratBetType] = 0
    })

    // 重置用户投注
    Object.keys(userBets).forEach(betType => {
      userBets[betType as BaccaratBetType] = 0
    })

    // 重置闪烁状态
    Object.keys(winningFlash).forEach(betType => {
      winningFlash[betType as BaccaratBetType] = false
    })

    console.log('✅ 投注 Store 初始化完成')
  }

  return {
    // 状态
    betHistory,
    lastRoundBets,
    selectedChip,
    zoneSimulationData,
    userBets,
    winningFlash,
    isCommissionFree,

    // 计算属性
    totalUserBets,
    hasLastRoundData,

    // 方法
    selectChip,
    undoLastBet,
    clearAllBets,
    restoreLastRound,
    updateSimulationData,
    startWinningFlash,
    saveCurrentRound,
    toggleCommissionFree,
    getTotalBetAmount,
    formatAmount,
    addBetToHistory,
    init
  }
})
