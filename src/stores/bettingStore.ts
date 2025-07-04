// src/stores/bettingStore.ts - 最终修复版：兼容所有组件
import { defineStore } from 'pinia'
import { ref, computed, reactive, nextTick  } from 'vue'

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

// 筹码图片映射 - 根据实际文件完整映射
export const CHIP_IMAGE_MAP: Record<number, string> = {
  1: '/src/assets/images/chips/B_01.png',
  5: '/src/assets/images/chips/B_05.png',
  10: '/src/assets/images/chips/B_10.png',
  20: '/src/assets/images/chips/B_20.png',
  50: '/src/assets/images/chips/B_50.png',
  100: '/src/assets/images/chips/B_100.png',
  500: '/src/assets/images/chips/B_500.png',
  1000: '/src/assets/images/chips/B_1K.png',
  5000: '/src/assets/images/chips/B_5K.png',
  10000: '/src/assets/images/chips/B_10K.png',
  20000: '/src/assets/images/chips/B_20K.png',
  50000: '/src/assets/images/chips/B_50K.png',
  100000: '/src/assets/images/chips/B_100K.png',
  200000: '/src/assets/images/chips/B_200K.png',
  1000000: '/src/assets/images/chips/B_1M.png',
  5000000: '/src/assets/images/chips/B_5M.png',
  10000000: '/src/assets/images/chips/B_10M.png',
  20000000: '/src/assets/images/chips/B_20M.png',
  50000000: '/src/assets/images/chips/B_50M.png',
  100000000: '/src/assets/images/chips/B_100M.png',
  200000000: '/src/assets/images/chips/B_200M.png',
  500000000: '/src/assets/images/chips/B_500M.png',
  1000000000: '/src/assets/images/chips/B_1000M.png'
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

// 所有可用筹码 - 去掉"元"，名称简化
export const AVAILABLE_CHIPS: ChipData[] = [
  { id: 'chip-1', value: 1, name: '1', image: CHIP_IMAGE_MAP[1], displayValue: '1' },
  { id: 'chip-5', value: 5, name: '5', image: CHIP_IMAGE_MAP[5], displayValue: '5' },
  { id: 'chip-10', value: 10, name: '10', image: CHIP_IMAGE_MAP[10], displayValue: '10' },
  { id: 'chip-20', value: 20, name: '20', image: CHIP_IMAGE_MAP[20], displayValue: '20' },
  { id: 'chip-50', value: 50, name: '50', image: CHIP_IMAGE_MAP[50], displayValue: '50' },
  { id: 'chip-100', value: 100, name: '100', image: CHIP_IMAGE_MAP[100], displayValue: '100' },
  { id: 'chip-500', value: 500, name: '500', image: CHIP_IMAGE_MAP[500], displayValue: '500' },
  { id: 'chip-1000', value: 1000, name: '1K', image: CHIP_IMAGE_MAP[1000], displayValue: '1K' },
  { id: 'chip-5000', value: 5000, name: '5K', image: CHIP_IMAGE_MAP[5000], displayValue: '5K' },
  { id: 'chip-10000', value: 10000, name: '10K', image: CHIP_IMAGE_MAP[10000], displayValue: '10K' },
  { id: 'chip-20000', value: 20000, name: '20K', image: CHIP_IMAGE_MAP[20000], displayValue: '20K' },
  { id: 'chip-50000', value: 50000, name: '50K', image: CHIP_IMAGE_MAP[50000], displayValue: '50K' },
  { id: 'chip-100000', value: 100000, name: '100K', image: CHIP_IMAGE_MAP[100000], displayValue: '100K' },
  { id: 'chip-200000', value: 200000, name: '200K', image: CHIP_IMAGE_MAP[200000], displayValue: '200K' },
  { id: 'chip-1000000', value: 1000000, name: '1M', image: CHIP_IMAGE_MAP[1000000], displayValue: '1M' },
  { id: 'chip-5000000', value: 5000000, name: '5M', image: CHIP_IMAGE_MAP[5000000], displayValue: '5M' },
  { id: 'chip-10000000', value: 10000000, name: '10M', image: CHIP_IMAGE_MAP[10000000], displayValue: '10M' },
  { id: 'chip-20000000', value: 20000000, name: '20M', image: CHIP_IMAGE_MAP[20000000], displayValue: '20M' },
  { id: 'chip-50000000', value: 50000000, name: '50M', image: CHIP_IMAGE_MAP[50000000], displayValue: '50M' },
  { id: 'chip-100000000', value: 100000000, name: '100M', image: CHIP_IMAGE_MAP[100000000], displayValue: '100M' },
  { id: 'chip-200000000', value: 200000000, name: '200M', image: CHIP_IMAGE_MAP[200000000], displayValue: '200M' },
  { id: 'chip-500000000', value: 500000000, name: '500M', image: CHIP_IMAGE_MAP[500000000], displayValue: '500M' },
  { id: 'chip-1000000000', value: 1000000000, name: '1000M', image: CHIP_IMAGE_MAP[1000000000], displayValue: '1000M' }
]

// 🔥 统一默认筹码：3个筹码 [10, 50, 100]
export const DEFAULT_DISPLAY_CHIPS: ChipData[] = [
  { id: 'chip-10', value: 10, name: '10', image: CHIP_IMAGE_MAP[10], displayValue: '10' },
  { id: 'chip-50', value: 50, name: '50', image: CHIP_IMAGE_MAP[50], displayValue: '50' },
  { id: 'chip-100', value: 100, name: '100', image: CHIP_IMAGE_MAP[100], displayValue: '100' }
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
export const DEFAULT_CHIPS = [10, 50, 100] as const

export const useBettingStore = defineStore('betting', () => {
  // 基础状态
  const selectedChipRef = ref(10)
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

  // 🔥 修改：筹码相关状态 - 直接存储完整的筹码对象
  const displayChips = ref<ChipData[]>([...DEFAULT_DISPLAY_CHIPS])
  const availableChips = ref<ChipData[]>(AVAILABLE_CHIPS)

  // 🔥 修复：模拟数据更新定时器 - 使用 number 类型
  const simulationTimers = ref<Record<BaccaratBetType, number | null>>({
    'banker': null,
    'player': null,
    'tie': null,
    'banker-pair': null,
    'player-pair': null,
    'lucky-6': null,
    'dragon-7': null,
    'panda-8': null
  })

  // 🔥 新增：闪烁效果管理
  const blinkingZones = ref<Set<BaccaratBetType>>(new Set())

  // 🔥 关键修复：计算属性 - 避免重复定义
  const selectedChip = computed({
    get: () => selectedChipRef.value,
    set: (value: number) => {
      selectedChipRef.value = value
    }
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

  // 🔥 修改：计算属性 - 直接返回 displayChips
  const getDisplayChipsData = computed(() => {
    return displayChips.value
  })

  // 获取筹码图片数组（用于显示）
  const getChipImages = (amount: number): Array<{value: number, image: string}> => {
    if (amount <= 0) return []

    const chips: Array<{value: number, image: string}> = []
    let remaining = amount
    // 更新筹码面额数组
    const chipValues = [1000000000, 500000000, 200000000, 100000000, 50000000, 20000000, 10000000, 5000000, 1000000, 200000, 100000, 50000, 20000, 10000, 5000, 1000, 500, 100, 50, 20, 10, 5, 1]

    for (const value of chipValues) {
      while (remaining >= value && chips.length < 6) {
        chips.push({
          value,
          image: CHIP_IMAGE_MAP[value] || '/src/assets/images/chips/default.png'
        })
        remaining -= value
      }
    }

    return chips
  }

  // 🔥 修复后的投注计算函数 - src/stores/bettingStore.ts

  // 计算投注金额（修复累加投注逻辑）
  const calculateBetAmount = (betType: BaccaratBetType, selectedAmount: number): BetResult => {
    const limits = betLimits.value[betType]
    const zoneName = BET_ZONE_CONFIGS[betType].displayName

    if (!limits) {
      return { success: false, message: '投注区域配置错误' }
    }

    // 🔥 关键修复：获取当前该区域的投注金额
    const currentBetAmount = currentBets[betType] || 0

    let actualAmount = selectedAmount
    let adjustmentMessage = ''

    // 1. 余额检查
    if (actualAmount > balance.value) {
      actualAmount = balance.value
      adjustmentMessage = `按可用余额投注 $${balance.value.toLocaleString()}`
    }

    // 2. 如果当前没有投注，检查最小限红
    if (currentBetAmount === 0) {
      // 首次投注：确保满足最小限红
      if (actualAmount < limits.min) {
        actualAmount = limits.min
        adjustmentMessage = `投注金额已调整至最小限红 $${limits.min.toLocaleString()}`
      }
    } else {
      // 🔥 累加投注：直接使用筹码面额，不强制调整到最小限红
      // 只需检查累加后是否超过最大限红
      const newTotal = currentBetAmount + actualAmount
      if (newTotal > limits.max) {
        // 如果累加后超过最大限红，调整为最大限红减去当前投注
        actualAmount = limits.max - currentBetAmount
        if (actualAmount <= 0) {
          return {
            success: false,
            message: `${zoneName}已达最大限红 $${limits.max.toLocaleString()}`
          }
        }
        adjustmentMessage = `投注金额已调整，累计不超过最大限红 $${limits.max.toLocaleString()}`
      }
    }

    // 3. 最终余额检查
    if (actualAmount > balance.value) {
      return {
        success: false,
        message: `余额不足，需要 $${actualAmount.toLocaleString()}，当前余额 $${balance.value.toLocaleString()}`
      }
    }

    // 4. 检查最终投注总额是否满足限红要求
    const finalTotal = currentBetAmount + actualAmount
    if (finalTotal > limits.max) {
      return {
        success: false,
        message: `超过最大限红，${zoneName}最大投注为 $${limits.max.toLocaleString()}`
      }
    }

    return {
      success: true,
      amount: actualAmount,
      message: adjustmentMessage || `投注成功：${zoneName} +$${actualAmount.toLocaleString()} (总计: $${finalTotal.toLocaleString()})`
    }
  }

  // 🔥 修复后的执行投注函数
  const placeBet = (betType: BaccaratBetType, amount?: number): BetResult => {
    // 检查游戏状态
    if (gamePhase.value !== 'betting') {
      return { success: false, message: '当前不在投注阶段' }
    }

    // 🔥 使用当前选中的筹码值
    const actualAmount = selectedChipRef.value

    // 🔥 使用修复后的计算逻辑
    const result = calculateBetAmount(betType, actualAmount)
    if (!result.success) {
      return result
    }

    const finalAmount = result.amount!

    // 🔥 累加投注（这里不变，累加逻辑在calculateBetAmount中处理）
    currentBets[betType] += finalAmount
    simulationData[betType].userAmount = currentBets[betType]

    // 记录历史
    betHistory.value.push({
      betType,
      amount: finalAmount,
      action: 'add',
      timestamp: Date.now()
    })

    console.log(`💰 投注成功: ${betType} +${finalAmount} (总计: ${currentBets[betType]})`)

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

  // 🔥 关键修复：更新显示筹码方法 - 确保选中状态同步
  const updateDisplayChips = (chips: ChipData[]): void => {
    // 确保恰好 3 个筹码
    const validChips = chips.slice(0, 3)

    if (validChips.length === 0) {
      displayChips.value = [...DEFAULT_DISPLAY_CHIPS]
      selectedChipRef.value = DEFAULT_DISPLAY_CHIPS[0].value
      return
    }

    // 如果不足 3 个，用默认筹码补齐
    while (validChips.length < 3) {
      const defaultChip = DEFAULT_DISPLAY_CHIPS.find(chip =>
        !validChips.some(existing => existing.value === chip.value)
      )
      if (defaultChip) {
        validChips.push(defaultChip)
      } else {
        break
      }
    }

    // 🔥 强制刷新：先清空再设置，触发响应式更新
    displayChips.value = []
    nextTick(() => {
      displayChips.value = validChips

      // 🔥 强制选择第一个筹码，确保同步
      selectedChipRef.value = validChips[0].value

      // 🔥 强制触发响应式更新
      nextTick(() => {
        // 确保所有组件都能获取到最新值
        console.log(`✅ 强制更新完成: 选中筹码=${selectedChipRef.value}, 显示筹码=[${validChips.map(c => c.value).join(',')}]`)
      })
    })
  }

  // 🔥 修改：根据余额智能推荐显示筹码
  const updateDisplayChipsByBalance = (currentBalance: number): void => {
    let recommendedValues: number[] = []

    // 根据余额智能推荐3个筹码
    if (currentBalance >= 50000) {
      recommendedValues = [100, 1000, 10000]
    } else if (currentBalance >= 10000) {
      recommendedValues = [50, 500, 5000]
    } else if (currentBalance >= 1000) {
      recommendedValues = [10, 50, 100]
    } else if (currentBalance >= 100) {
      recommendedValues = [1, 5, 10]
    } else {
      recommendedValues = [1, 5, 10]
    }

    // 过滤出可用的筹码并转换为 ChipData 对象
    const recommendedChips = recommendedValues
      .map(value => availableChips.value.find(chip => chip.value === value))
      .filter(chip => chip !== undefined) as ChipData[]

    if (recommendedChips.length >= 3) {
      updateDisplayChips(recommendedChips.slice(0, 3))
    } else {
      // 如果推荐筹码不足，使用默认筹码
      updateDisplayChips(DEFAULT_DISPLAY_CHIPS)
    }
  }

  // 🔥 新增：闪烁效果管理方法
  const startBlinking = (zoneId: BaccaratBetType): void => {
    blinkingZones.value.add(zoneId)
  }

  const stopBlinking = (zoneId: BaccaratBetType): void => {
    blinkingZones.value.delete(zoneId)
  }

  const stopAllBlinking = (): void => {
    blinkingZones.value.clear()
  }

  const isZoneBlinking = (zoneId: BaccaratBetType): boolean => {
    return blinkingZones.value.has(zoneId)
  }

  // 开始模拟数据更新
  const startSimulationUpdates = (): void => {
    Object.keys(BET_ZONE_CONFIGS).forEach(betType => {
      const key = betType as BaccaratBetType
      const config = BET_ZONE_CONFIGS[key].simulationConfig

      simulationTimers.value[key] = window.setInterval(() => {
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
        window.clearInterval(simulationTimers.value[key]!)
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

  // 🔥 关键修复：选择筹码方法 - 统一接口
  const selectChip = (amount: number): void => {
    // 🔥 验证筹码是否在当前显示列表中
    const isValidChip = displayChips.value.some(chip => chip.value === amount)

    if (isValidChip) {
      selectedChipRef.value = amount
    } else {
      // 如果选择的筹码不在显示列表中，自动选择第一个
      if (displayChips.value.length > 0) {
        selectedChipRef.value = displayChips.value[0].value
      } else {
        selectedChipRef.value = 10 // 默认值
      }
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
    selectedChipRef.value = 10
    balance.value = 10000
    gamePhase.value = 'betting'
    isCommissionFree.value = false

    // 🔥 重置显示筹码为默认值
    displayChips.value = [...DEFAULT_DISPLAY_CHIPS]

    // 清空投注
    clearAllBets()

    // 重置上局数据
    Object.keys(lastBets).forEach(betType => {
      lastBets[betType as BaccaratBetType] = 0
    })

    // 清空闪烁效果
    stopAllBlinking()

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

    // 停止所有闪烁效果
    stopAllBlinking()

    // 停止模拟数据更新
    stopSimulationUpdates()
  }

  return {
    // 🔥 关键修复：只暴露计算属性接口，避免重复定义
    selectedChip,

    // 其他状态
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
    blinkingZones,

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

    // 🔥 新增：筹码管理方法
    updateDisplayChips,
    updateDisplayChipsByBalance,

    // 🔥 新增：闪烁效果方法
    startBlinking,
    stopBlinking,
    stopAllBlinking,
    isZoneBlinking,

    // 配置常量
    BET_ZONE_CONFIGS,
    CHIP_IMAGE_MAP,
    DEFAULT_DISPLAY_CHIPS
  }
})
