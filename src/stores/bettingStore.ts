// src/stores/bettingStore.ts - 完整修复版
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

// 筹码数据接口
export interface ChipData {
  id: string
  value: number
  name: string
  image: string
  displayValue: string
}

// 筹码图片映射 - 统一管理
export const CHIP_IMAGE_MAP: Record<number, string> = {
  1: '/images/chips/1.png',
  5: '/images/chips/5.png',
  10: '/images/chips/10.png',
  25: '/images/chips/25.png',
  50: '/images/chips/50.png',
  100: '/images/chips/100.png',
  500: '/images/chips/500.png',
  1000: '/images/chips/1000.png'
}

// 投注区域配置
interface BetZoneConfig {
  id: BaccaratBetType
  rateId: number
  displayName: string
  odds: string
  minBetField: string
  maxBetField: string
  simulationConfig: {
    playerCountRange: [number, number]
    amountRange: [number, number]
    increaseInterval: number
  }
}

// 投注区域配置映射
export const BET_ZONE_CONFIGS: Record<BaccaratBetType, BetZoneConfig> = {
  'banker': {
    id: 'banker',
    rateId: 8,
    displayName: '庄',
    odds: '1:0.95',
    minBetField: 'bjl_xian_hong_zhuang_min',
    maxBetField: 'bjl_xian_hong_zhuang_max',
    simulationConfig: {
      playerCountRange: [15, 40],
      amountRange: [8000, 50000],
      increaseInterval: 3000
    }
  },
  'player': {
    id: 'player',
    rateId: 6,
    displayName: '闲',
    odds: '1:1',
    minBetField: 'bjl_xian_hong_xian_min',
    maxBetField: 'bjl_xian_hong_xian_max',
    simulationConfig: {
      playerCountRange: [12, 35],
      amountRange: [6000, 45000],
      increaseInterval: 3000
    }
  },
  'tie': {
    id: 'tie',
    rateId: 7,
    displayName: '和',
    odds: '1:8',
    minBetField: 'bjl_xian_hong_he_min',
    maxBetField: 'bjl_xian_hong_he_max',
    simulationConfig: {
      playerCountRange: [3, 15],
      amountRange: [1000, 15000],
      increaseInterval: 3000
    }
  },
  'banker-pair': {
    id: 'banker-pair',
    rateId: 4,
    displayName: '庄对',
    odds: '1:11',
    minBetField: 'bjl_xian_hong_zhuang_dui_min',
    maxBetField: 'bjl_xian_hong_zhuang_dui_max',
    simulationConfig: {
      playerCountRange: [5, 20],
      amountRange: [500, 8000],
      increaseInterval: 3000
    }
  },
  'player-pair': {
    id: 'player-pair',
    rateId: 2,
    displayName: '闲对',
    odds: '1:11',
    minBetField: 'bjl_xian_hong_xian_dui_min',
    maxBetField: 'bjl_xian_hong_xian_dui_max',
    simulationConfig: {
      playerCountRange: [4, 18],
      amountRange: [400, 7000],
      increaseInterval: 3000
    }
  },
  'lucky-6': {
    id: 'lucky-6',
    rateId: 3,
    displayName: '幸运6',
    odds: '1:12/20',
    minBetField: 'bjl_xian_hong_lucky6_min',
    maxBetField: 'bjl_xian_hong_lucky6_max',
    simulationConfig: {
      playerCountRange: [2, 12],
      amountRange: [200, 5000],
      increaseInterval: 3000
    }
  },
  'dragon-7': {
    id: 'dragon-7',
    rateId: 9,
    displayName: '龙7',
    odds: '1:40',
    minBetField: 'bjl_xian_hong_long7_min',
    maxBetField: 'bjl_xian_hong_long7_max',
    simulationConfig: {
      playerCountRange: [1, 8],
      amountRange: [100, 3000],
      increaseInterval: 3000
    }
  },
  'panda-8': {
    id: 'panda-8',
    rateId: 10,
    displayName: '熊8',
    odds: '1:25',
    minBetField: 'bjl_xian_hong_xiong8_min',
    maxBetField: 'bjl_xian_hong_xiong8_max',
    simulationConfig: {
      playerCountRange: [1, 10],
      amountRange: [100, 4000],
      increaseInterval: 3000
    }
  }
}

// 所有可用筹码
export const AVAILABLE_CHIPS: ChipData[] = [
  { id: 'chip-1', value: 1, name: '1元', image: CHIP_IMAGE_MAP[1], displayValue: '1' },
  { id: 'chip-5', value: 5, name: '5元', image: CHIP_IMAGE_MAP[5], displayValue: '5' },
  { id: 'chip-10', value: 10, name: '10元', image: CHIP_IMAGE_MAP[10], displayValue: '10' },
  { id: 'chip-25', value: 25, name: '25元', image: CHIP_IMAGE_MAP[25], displayValue: '25' },
  { id: 'chip-50', value: 50, name: '50元', image: CHIP_IMAGE_MAP[50], displayValue: '50' },
  { id: 'chip-100', value: 100, name: '100元', image: CHIP_IMAGE_MAP[100], displayValue: '100' },
  { id: 'chip-500', value: 500, name: '500元', image: CHIP_IMAGE_MAP[500], displayValue: '500' },
  { id: 'chip-1000', value: 1000, name: '1000元', image: CHIP_IMAGE_MAP[1000], displayValue: '1K' }
]

// 投注区域模拟数据
interface BetZoneData {
  totalAmount: number
  playerCount: number
  userAmount: number  // 用户投注金额
}

// 投注历史记录
interface BetHistoryStep {
  betType: BaccaratBetType
  amount: number
  action: 'add' | 'remove'
  timestamp: number
}

// 投注结果
interface BetResult {
  success: boolean
  amount?: number
  message: string
}

// 限红配置（从台桌信息获取）
interface BetLimits {
  [key: string]: {
    min: number
    max: number
  }
}

// 默认筹码（保持兼容性）
export const DEFAULT_CHIPS = [1, 5, 10, 50, 100] as const

export const useBettingStore = defineStore('betting', () => {
  // 基础状态
  const selectedChip = ref(10)
  const balance = ref(10000)
  const gamePhase = ref<'waiting' | 'betting' | 'dealing' | 'result'>('betting')
  const isCommissionFree = ref(false)

  // 投注数据
  const currentBets = reactive<Record<BaccaratBetType, number>>({
    'banker': 0,
    'player': 0,
    'tie': 0,
    'banker-pair': 0,
    'player-pair': 0,
    'lucky-6': 0,
    'dragon-7': 0,
    'panda-8': 0
  })

  // 投注历史（用于撤销）
  const betHistory = ref<BetHistoryStep[]>([])

  // 上一局投注数据（用于重复投注）
  const lastBets = reactive<Record<BaccaratBetType, number>>({
    'banker': 0,
    'player': 0,
    'tie': 0,
    'banker-pair': 0,
    'player-pair': 0,
    'lucky-6': 0,
    'dragon-7': 0,
    'panda-8': 0
  })

  // 模拟数据
  const simulationData = reactive<Record<BaccaratBetType, BetZoneData>>({
    'banker': { totalAmount: 12580, playerCount: 23, userAmount: 0 },
    'player': { totalAmount: 8960, playerCount: 18, userAmount: 0 },
    'tie': { totalAmount: 2340, playerCount: 6, userAmount: 0 },
    'banker-pair': { totalAmount: 1150, playerCount: 8, userAmount: 0 },
    'player-pair': { totalAmount: 980, playerCount: 7, userAmount: 0 },
    'lucky-6': { totalAmount: 650, playerCount: 4, userAmount: 0 },
    'dragon-7': { totalAmount: 320, playerCount: 3, userAmount: 0 },
    'panda-8': { totalAmount: 280, playerCount: 2, userAmount: 0 }
  })

  // 限红配置（默认值，实际从台桌信息获取）
  const betLimits = ref<BetLimits>({
    'banker': { min: 10, max: 50000 },
    'player': { min: 10, max: 50000 },
    'tie': { min: 10, max: 10000 },
    'banker-pair': { min: 10, max: 5000 },
    'player-pair': { min: 10, max: 5000 },
    'lucky-6': { min: 10, max: 3000 },
    'dragon-7': { min: 10, max: 1000 },
    'panda-8': { min: 10, max: 2000 }
  })

  // 筹码相关状态
  const displayChips = ref<string[]>(['chip-10', 'chip-50', 'chip-100'])
  const availableChips = ref(AVAILABLE_CHIPS)

  // 模拟数据更新定时器
  const simulationTimers = ref<Record<BaccaratBetType, NodeJS.Timeout | null>>({
    'banker': null,
    'player': null,
    'tie': null,
    'banker-pair': null,
    'player-pair': null,
    'lucky-6': null,
    'dragon-7': null,
    'panda-8': null
  })

  // 计算属性
  const totalBetAmount = computed(() => {
    return Object.values(currentBets).reduce((sum, amount) => sum + amount, 0)
  })

  const hasActiveBets = computed(() => {
    return totalBetAmount.value > 0
  })

  const hasLastRoundData = computed(() => {
    return Object.values(lastBets).some(amount => amount > 0)
  })

  const getDisplayChipsData = computed(() => {
    return availableChips.value.filter(chip =>
      displayChips.value.includes(chip.id)
    )
  })

  // 获取筹码图片数组（用于显示）
  const getChipImages = (amount: number): Array<{value: number, image: string}> => {
    if (amount <= 0) return []

    const chips: Array<{value: number, image: string}> = []
    let remaining = amount
    const chipValues = [1000, 500, 100, 50, 25, 10, 5, 1]

    for (const value of chipValues) {
      while (remaining >= value && chips.length < 6) {
        chips.push({
          value,
          image: CHIP_IMAGE_MAP[value] || '/images/chips/default.png'
        })
        remaining -= value
      }
    }

    return chips
  }

  // 计算投注金额（包含限红和余额检查）
  const calculateBetAmount = (betType: BaccaratBetType, selectedAmount: number): BetResult => {
    const limits = betLimits.value[betType]
    const zoneName = BET_ZONE_CONFIGS[betType].displayName

    if (!limits) {
      return { success: false, message: '投注区域配置错误' }
    }

    let finalAmount = selectedAmount
    let adjustmentMessage = ''

    // 1. 余额检查
    if (finalAmount > balance.value) {
      finalAmount = balance.value
      adjustmentMessage = `按可用余额投注 $${balance.value.toLocaleString()}`
    }

    // 2. 最终检查：如果最小限红 > 余额，则投注失败
    if (limits.min > balance.value) {
      return {
        success: false,
        message: `余额不足，${zoneName}最小投注为 $${limits.min.toLocaleString()}，当前余额 $${balance.value.toLocaleString()}`
      }
    }

    // 3. 限红检查
    if (finalAmount < limits.min) {
      finalAmount = limits.min
      adjustmentMessage = `投注金额已调整至最小限红 $${limits.min.toLocaleString()}`
    }

    if (finalAmount > limits.max) {
      finalAmount = limits.max
      adjustmentMessage = `投注金额已调整至最大限红 $${limits.max.toLocaleString()}`
    }

    return {
      success: true,
      amount: finalAmount,
      message: adjustmentMessage || `投注成功：${zoneName} $${finalAmount.toLocaleString()}`
    }
  }

  // 执行投注
  const placeBet = (betType: BaccaratBetType, amount: number): BetResult => {
    // 检查游戏状态
    if (gamePhase.value !== 'betting') {
      return { success: false, message: '当前不在投注阶段' }
    }

    // 计算投注金额
    const result = calculateBetAmount(betType, amount)
    if (!result.success) {
      return result
    }

    const finalAmount = result.amount!

    // 执行投注
    currentBets[betType] += finalAmount
    simulationData[betType].userAmount = currentBets[betType]

    // 记录历史
    betHistory.value.push({
      betType,
      amount: finalAmount,
      action: 'add',
      timestamp: Date.now()
    })

    console.log(`✅ 投注成功: ${betType} +${finalAmount}`)
    return result
  }

  // 撤销投注
  const undoLastBet = (): boolean => {
    if (betHistory.value.length === 0) {
      return false
    }

    const lastStep = betHistory.value.pop()!
    const { betType, amount, action } = lastStep

    if (action === 'add') {
      currentBets[betType] = Math.max(0, currentBets[betType] - amount)
    } else {
      currentBets[betType] += amount
    }

    // 更新模拟数据
    simulationData[betType].userAmount = currentBets[betType]

    console.log(`↩️ 撤销操作: ${betType} ${action} ${amount}`)
    return true
  }

  // 重复上局投注
  const repeatLastBets = (): boolean => {
    if (!hasLastRoundData.value) {
      return false
    }

    // 清空当前投注
    clearAllBets()

    // 恢复上局投注
    let hasSuccess = false
    Object.entries(lastBets).forEach(([betType, amount]) => {
      if (amount > 0) {
        const result = placeBet(betType as BaccaratBetType, amount)
        if (result.success) {
          hasSuccess = true
        }
      }
    })

    return hasSuccess
  }

  // 清空所有投注
  const clearAllBets = (): void => {
    Object.keys(currentBets).forEach(betType => {
      const key = betType as BaccaratBetType
      currentBets[key] = 0
      simulationData[key].userAmount = 0
    })
    betHistory.value = []
  }

  // 保存当前投注为上局数据
  const saveCurrentAsLastBets = (): void => {
    Object.keys(currentBets).forEach(betType => {
      const key = betType as BaccaratBetType
      lastBets[key] = currentBets[key]
    })
  }

  // 开始模拟数据更新
  const startSimulationUpdates = (): void => {
    Object.keys(BET_ZONE_CONFIGS).forEach(betType => {
      const key = betType as BaccaratBetType
      const config = BET_ZONE_CONFIGS[key].simulationConfig

      simulationTimers.value[key] = setInterval(() => {
        const data = simulationData[key]

        // 随机增加人数（1-3人）
        const playerIncrease = Math.floor(Math.random() * 3) + 1
        data.playerCount += playerIncrease

        // 随机增加金额
        const [minAmount, maxAmount] = config.amountRange
        const amountIncrease = Math.floor(Math.random() * (maxAmount * 0.1)) + (minAmount * 0.1)
        data.totalAmount += amountIncrease

      }, config.increaseInterval)
    })
  }

  // 停止模拟数据更新
  const stopSimulationUpdates = (): void => {
    Object.keys(simulationTimers.value).forEach(betType => {
      const key = betType as BaccaratBetType
      if (simulationTimers.value[key]) {
        clearInterval(simulationTimers.value[key]!)
        simulationTimers.value[key] = null
      }
    })
  }

  // 更新限红配置
  const updateBetLimits = (tableInfo: any): void => {
    Object.keys(BET_ZONE_CONFIGS).forEach(betType => {
      const key = betType as BaccaratBetType
      const config = BET_ZONE_CONFIGS[key]

      betLimits.value[key] = {
        min: tableInfo[config.minBetField] || 10,
        max: tableInfo[config.maxBetField] || 50000
      }
    })
  }

  // 获取投注区域显示数据
  const getBetZoneDisplayData = (betType: BaccaratBetType) => {
    const data = simulationData[betType]
    return {
      userAmount: currentBets[betType],
      otherPlayerCount: data.playerCount,
      otherTotalAmount: data.totalAmount + data.userAmount,
      chipImages: getChipImages(currentBets[betType])
    }
  }

  // 选择筹码
  const selectChip = (amount: number): void => {
    const chip = availableChips.value.find(c => c.value === amount)
    if (chip) {
      selectedChip.value = amount
      console.log(`✅ 选择筹码: ${amount}`)
    }
  }

  // 切换免佣状态
  const toggleCommissionFree = (): void => {
    isCommissionFree.value = !isCommissionFree.value
  }

  // 格式化金额
  const formatAmount = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0'
    }
    return amount.toLocaleString()
  }

  // 初始化
  const init = (): void => {
    console.log('🎰 投注 Store 初始化')

    // 重置状态
    selectedChip.value = 10
    balance.value = 10000
    gamePhase.value = 'betting'
    isCommissionFree.value = false

    // 清空投注
    clearAllBets()

    // 重置上局数据
    Object.keys(lastBets).forEach(betType => {
      lastBets[betType as BaccaratBetType] = 0
    })

    // 开始模拟数据更新
    startSimulationUpdates()

    console.log('✅ 投注 Store 初始化完成')
  }

  // 清场（开牌时调用）
  const clearRound = (): void => {
    console.log('🧹 执行清场')

    // 保存当前投注为上局
    saveCurrentAsLastBets()

    // 清空当前投注
    clearAllBets()

    // 停止模拟数据更新
    stopSimulationUpdates()
  }

  return {
    // 状态
    selectedChip,
    balance,
    gamePhase,
    isCommissionFree,
    currentBets,
    betHistory,
    lastBets,
    simulationData,
    betLimits,
    displayChips,
    availableChips,

    // 计算属性
    totalBetAmount,
    hasActiveBets,
    hasLastRoundData,
    getDisplayChipsData,

    // 方法
    placeBet,
    undoLastBet,
    repeatLastBets,
    clearAllBets,
    saveCurrentAsLastBets,
    startSimulationUpdates,
    stopSimulationUpdates,
    updateBetLimits,
    getBetZoneDisplayData,
    getChipImages,
    selectChip,
    toggleCommissionFree,
    formatAmount,
    init,
    clearRound,

    // 配置常量
    BET_ZONE_CONFIGS,
    CHIP_IMAGE_MAP
  }
})
