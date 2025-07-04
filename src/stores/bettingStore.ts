// src/stores/bettingStore.ts - 百家乐版本
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

// 游戏阶段
export type GamePhase = 'waiting' | 'betting' | 'dealing' | 'result'

// 扩展的投注阶段
export type ExtendedBettingPhase =
  | 'waiting'     // 等待开始
  | 'betting'     // 可以投注
  | 'confirmed'   // 已确认投注，可继续加注
  | 'dealing'     // 发牌中，禁止投注
  | 'result'      // 结果阶段

// 投注设置
interface BettingSettings {
  vibrationEnabled: boolean
  debugMode: boolean
  soundEnabled: boolean
}

// 百家乐投注类型映射（根据您的 constants.ts）
const getBetTypeId = (betType: string): number => {
  const betTypeMap: Record<string, number> = {
    'banker': 8,       // 庄 (ID: 8)
    'player': 6,       // 闲 (ID: 6)
    'tie': 7,          // 和 (ID: 7)
    'banker-pair': 4,  // 庄对 (ID: 4)
    'player-pair': 2,  // 闲对 (ID: 2)
    'lucky-6': 3,      // 幸运6 (ID: 3)
    'dragon-7': 9,     // 龙7 (ID: 9)
    'panda-8': 10      // 熊8 (ID: 10)
  }

  const mappedId = betTypeMap[betType]

  if (!mappedId) {
    console.error(`❌ 未找到百家乐投注类型映射: ${betType}`)
    console.error(`❌ 可用的投注类型:`, Object.keys(betTypeMap))
    throw new Error(`未找到百家乐投注类型映射: ${betType}`)
  }

  console.log(`✅ 百家乐投注类型映射: ${betType} -> ${mappedId}`)
  return mappedId
}

// 获取投注区域信息
const getBetZoneInfo = (betType: string) => {
  const betZoneMap: Record<string, { name: string; odds: string; rateId: number }> = {
    'banker': { name: '庄', odds: '1:1/0.95', rateId: 8 },
    'player': { name: '闲', odds: '1:1', rateId: 6 },
    'tie': { name: '和', odds: '1:8', rateId: 7 },
    'banker-pair': { name: '庄对', odds: '1:11', rateId: 4 },
    'player-pair': { name: '闲对', odds: '1:11', rateId: 2 },
    'lucky-6': { name: '幸运6', odds: '1:12/20', rateId: 3 },
    'dragon-7': { name: '龙7', odds: '1:40', rateId: 9 },
    'panda-8': { name: '熊8', odds: '1:25', rateId: 10 }
  }

  return betZoneMap[betType]
}

export const useBettingStore = defineStore('betting', () => {
  // 基础状态
  const balance = ref(10000)
  const selectedChip = ref(10)
  const currentBets = ref<Record<string, number>>({})      // 当前正在投注的金额
  const confirmedBets = ref<Record<string, number>>({})    // 已确认的投注
  const lastBets = ref<Record<string, number>>({})         // 上轮投注
  const gamePhase = ref<GamePhase>('betting')              // 游戏阶段
  const bettingPhase = ref<ExtendedBettingPhase>('betting') // 详细的投注阶段
  const isConnected = ref(true)

  // 设置配置
  const settings = reactive<BettingSettings>({
    vibrationEnabled: true,
    debugMode: true,
    soundEnabled: true
  })

  // 计算属性 - 总投注金额
  const totalBetAmount = computed(() => {
    const currentTotal = Object.values(currentBets.value).reduce((sum, amount) => sum + amount, 0)
    return currentTotal
  })

  // 已确认的投注总额
  const confirmedBetAmount = computed(() => {
    const confirmedTotal = Object.values(confirmedBets.value).reduce((sum, amount) => sum + amount, 0)
    return confirmedTotal
  })

  // 所有投注总额（已确认 + 当前）
  const allBetsAmount = computed(() => {
    return confirmedBetAmount.value + totalBetAmount.value
  })

  // 显示用的投注数据（合并已确认和当前投注）
  const displayBets = computed(() => {
    const combined: Record<string, { current: number; confirmed: number; total: number }> = {}

    // 处理已确认的投注
    Object.entries(confirmedBets.value).forEach(([betType, amount]) => {
      if (!combined[betType]) {
        combined[betType] = { current: 0, confirmed: 0, total: 0 }
      }
      combined[betType].confirmed = amount
    })

    // 处理当前投注
    Object.entries(currentBets.value).forEach(([betType, amount]) => {
      if (!combined[betType]) {
        combined[betType] = { current: 0, confirmed: 0, total: 0 }
      }
      combined[betType].current = amount
    })

    // 计算总额
    Object.keys(combined).forEach(betType => {
      combined[betType].total = combined[betType].current + combined[betType].confirmed
    })

    return combined
  })

  // 可用余额（扣除当前投注）
  const availableBalance = computed(() => {
    return balance.value - totalBetAmount.value
  })

  // 投注能力判断
  const canPlaceBet = computed(() => {
    return true  // 总是允许投注，无条件响应点击
  })

  // 投注数量统计
  const betCount = computed(() => {
    return Object.keys(currentBets.value).length
  })

  // 已确认投注数量
  const confirmedBetCount = computed(() => {
    return Object.keys(confirmedBets.value).length
  })

  // 是否有活跃投注
  const hasActiveBets = computed(() => {
    return betCount.value > 0
  })

  // 是否有已确认的投注
  const hasConfirmedBets = computed(() => {
    return confirmedBetCount.value > 0
  })

  // 格式化余额显示
  const formattedBalance = computed(() => {
    return balance.value.toLocaleString()
  })

  // 调试日志
  const debugLog = (message: string, data?: any): void => {
    if (settings.debugMode) {
      console.log(`🎰 [百家乐投注] ${message}`, data || '')
    }
  }

  // 选择筹码
  const selectChip = (amount: number): void => {
    if (amount > 0 && amount <= balance.value) {
      selectedChip.value = amount
      debugLog('选择筹码', amount)
    }
  }

  // 下注方法
  const placeBet = (betType: BaccaratBetType, amount?: number): boolean => {
    const betAmount = amount || selectedChip.value

    // 基本的金额验证
    if (betAmount <= 0) {
      debugLog('下注失败 - 金额无效', { betAmount })
      return false
    }

    // 检查余额
    if (betAmount > availableBalance.value) {
      debugLog('下注失败 - 余额不足', {
        betAmount,
        availableBalance: availableBalance.value
      })
      return false
    }

    // 添加到当前投注
    if (!currentBets.value[betType]) {
      currentBets.value[betType] = 0
    }
    currentBets.value[betType] += betAmount

    // 获取投注区域信息
    const zoneInfo = getBetZoneInfo(betType)

    debugLog('百家乐下注成功', {
      betType,
      amount: betAmount,
      total: currentBets.value[betType],
      zone: zoneInfo?.name,
      odds: zoneInfo?.odds
    })

    return true
  }

  // 确认当前投注
  const confirmCurrentBets = (): void => {
    if (hasActiveBets.value) {
      // 将当前投注合并到已确认投注
      Object.entries(currentBets.value).forEach(([betType, amount]) => {
        if (!confirmedBets.value[betType]) {
          confirmedBets.value[betType] = 0
        }
        confirmedBets.value[betType] += amount
      })

      // 清空当前投注
      currentBets.value = {}

      // 更新投注阶段
      bettingPhase.value = 'confirmed'

      debugLog('确认投注完成', {
        confirmedBets: confirmedBets.value,
        bettingPhase: bettingPhase.value
      })
    }
  }

  // 取消指定投注
  const cancelBet = (betType: BaccaratBetType): void => {
    if (currentBets.value[betType]) {
      const amount = currentBets.value[betType]
      delete currentBets.value[betType]
      debugLog('取消投注', { betType, amount })
    }
  }

  // 清空当前投注
  const clearBets = (): void => {
    currentBets.value = {}
    debugLog('清空当前投注')
  }

  // 清空已确认投注
  const clearConfirmedBets = (): void => {
    // 保存为上次投注（用于重复投注）
    lastBets.value = { ...confirmedBets.value }
    confirmedBets.value = {}
    debugLog('清空已确认投注，保存为上次投注', lastBets.value)
  }

  // 清空所有投注
  const clearAllBets = (): void => {
    currentBets.value = {}
    confirmedBets.value = {}
    debugLog('清空所有投注')
  }

  // 重复上次投注
  const rebet = (): void => {
    if (Object.keys(lastBets.value).length === 0) {
      debugLog('重复投注失败 - 没有上次投注记录')
      return
    }

    // 计算上次投注总额
    const lastBetTotal = Object.values(lastBets.value).reduce((sum, amount) => sum + amount, 0)

    if (lastBetTotal > availableBalance.value) {
      debugLog('重复投注失败 - 余额不足', {
        required: lastBetTotal,
        available: availableBalance.value
      })
      return
    }

    // 复制上次投注到当前投注
    currentBets.value = { ...lastBets.value }
    debugLog('重复投注成功', currentBets.value)
  }

  // 兼容性方法：确认投注
  const confirmBets = (): void => {
    confirmCurrentBets()
  }

  // 更新余额
  const updateBalance = (newBalance: number): void => {
    if (newBalance >= 0) {
      balance.value = newBalance
      debugLog('更新余额', newBalance)
    }
  }

  // 更新游戏阶段
  const updateGamePhase = (phase: GamePhase): void => {
    gamePhase.value = phase
    debugLog('更新游戏阶段', phase)

    // 自动更新投注阶段
    if (phase === 'betting' && bettingPhase.value === 'waiting') {
      bettingPhase.value = 'betting'
    }
  }

  // 手动更新投注阶段
  const updateBettingPhase = (phase: ExtendedBettingPhase): void => {
    bettingPhase.value = phase
    debugLog('更新投注阶段', phase)
  }

  // 处理游戏结果（清场）
  const handleGameResult = (gameResult: any): void => {
    debugLog('处理游戏结果 - 执行清场', gameResult)

    // 清除已确认的投注，将其保存为上次投注
    clearConfirmedBets()

    // 如果还有未确认的当前投注，也清除
    if (hasActiveBets.value) {
      currentBets.value = {}
    }

    // 设置为结果阶段
    bettingPhase.value = 'result'

    debugLog('游戏结果处理完成', {
      phase: bettingPhase.value,
      lastBets: lastBets.value
    })
  }

  // 切换调试模式
  const toggleDebugMode = (): void => {
    settings.debugMode = !settings.debugMode
    console.log(`百家乐调试模式已${settings.debugMode ? '开启' : '关闭'}`)
  }

  // 切换震动模式
  const toggleVibration = (): void => {
    settings.vibrationEnabled = !settings.vibrationEnabled
    debugLog('切换震动模式', settings.vibrationEnabled)
  }

  // 切换声音模式
  const toggleSound = (): void => {
    settings.soundEnabled = !settings.soundEnabled
    debugLog('切换声音模式', settings.soundEnabled)
  }

  // 初始化方法
  const init = (): void => {
    debugLog('初始化百家乐投注 Store')

    if (!selectedChip.value || selectedChip.value <= 0) {
      selectedChip.value = 10
    }

    if (!currentBets.value) currentBets.value = {}
    if (!confirmedBets.value) confirmedBets.value = {}
    if (!lastBets.value) lastBets.value = {}

    // 设置初始状态
    gamePhase.value = 'betting'
    bettingPhase.value = 'betting'
    isConnected.value = true

    debugLog('百家乐投注 Store 初始化完成', {
      balance: balance.value,
      selectedChip: selectedChip.value,
      gamePhase: gamePhase.value,
      bettingPhase: bettingPhase.value,
      canPlaceBet: canPlaceBet.value
    })
  }

  return {
    // 导出映射函数
    getBetTypeId,
    getBetZoneInfo,

    // 状态
    balance,
    selectedChip,
    currentBets,
    confirmedBets,
    lastBets,
    gamePhase,
    bettingPhase,
    isConnected,
    settings,

    // 计算属性
    totalBetAmount,
    confirmedBetAmount,
    allBetsAmount,
    displayBets,
    availableBalance,
    canPlaceBet,
    betCount,
    confirmedBetCount,
    hasActiveBets,
    hasConfirmedBets,
    formattedBalance,

    // 方法
    selectChip,
    placeBet,
    confirmCurrentBets,
    cancelBet,
    clearBets,
    clearConfirmedBets,
    clearAllBets,
    rebet,
    confirmBets,          // 保持兼容性
    updateBalance,
    updateGamePhase,
    updateBettingPhase,
    handleGameResult,
    toggleDebugMode,
    toggleVibration,
    toggleSound,
    init
  }
})
