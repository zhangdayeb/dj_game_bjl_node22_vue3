// src/stores/bettingStore.ts - 增强版，支持筹码选择器
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

// 🔥 新增：筹码数据接口
export interface ChipData {
  id: string
  value: number
  name: string
  image: string
  displayValue: string
}

// 🔥 新增：所有可用筹码
export const AVAILABLE_CHIPS: ChipData[] = [
  { id: 'chip-1', value: 1, name: '1元', image: '/src/assets/images/chips/1.png', displayValue: '1' },
  { id: 'chip-5', value: 5, name: '5元', image: '/src/assets/images/chips/5.png', displayValue: '5' },
  { id: 'chip-10', value: 10, name: '10元', image: '/src/assets/images/chips/10.png', displayValue: '10' },
  { id: 'chip-25', value: 25, name: '25元', image: '/src/assets/images/chips/25.png', displayValue: '25' },
  { id: 'chip-50', value: 50, name: '50元', image: '/src/assets/images/chips/50.png', displayValue: '50' },
  { id: 'chip-100', value: 100, name: '100元', image: '/src/assets/images/chips/100.png', displayValue: '100' },
  { id: 'chip-500', value: 500, name: '500元', image: '/src/assets/images/chips/500.png', displayValue: '500' },
  { id: 'chip-1000', value: 1000, name: '1000元', image: '/src/assets/images/chips/1000.png', displayValue: '1K' }
]

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

// 默认筹码（保持兼容性）
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

  // 🔥 新增：筹码选择器相关状态
  const displayChips = ref<string[]>(['chip-10', 'chip-50', 'chip-100']) // 默认显示的筹码ID
  const availableChips = ref(AVAILABLE_CHIPS) // 所有可用筹码

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

  // 🔥 新增：获取显示的筹码数据
  const getDisplayChipsData = computed(() => {
    return availableChips.value.filter(chip =>
      displayChips.value.includes(chip.id)
    )
  })

  // 🔥 新增：获取当前筹码数据
  const getCurrentChipData = computed(() => {
    return availableChips.value.find(chip => chip.value === selectedChip.value)
  })

  // 🔥 新增：检查筹码是否可用
  const isChipAvailable = computed(() => {
    return (chipValue: number) => {
      return availableChips.value.some(chip => chip.value === chipValue)
    }
  })

  // 🔧 核心方法

  // 选择筹码
  const selectChip = (amount: number): void => {
    const chip = availableChips.value.find(c => c.value === amount)
    if (chip) {
      selectedChip.value = amount
      console.log(`✅ 选择筹码: ${amount}`)
    } else {
      console.warn(`❌ 筹码 ${amount} 不可用`)
    }
  }

  // 🔥 新增：更新显示筹码
  const updateDisplayChips = (chipIds: string[]): void => {
    // 验证所有 chipId 都存在
    const validChipIds = chipIds.filter(id =>
      availableChips.value.some(chip => chip.id === id)
    )

    if (validChipIds.length === 0) {
      console.warn('❌ 没有有效的筹码ID')
      return
    }

    displayChips.value = validChipIds
    console.log(`🎯 更新显示筹码:`, validChipIds)

    // 如果当前选中的筹码不在显示列表中，切换到第一个
    const currentChipExists = validChipIds.some(id => {
      const chip = availableChips.value.find(c => c.id === id)
      return chip?.value === selectedChip.value
    })

    if (!currentChipExists && validChipIds.length > 0) {
      const firstChip = availableChips.value.find(c => c.id === validChipIds[0])
      if (firstChip) {
        selectedChip.value = firstChip.value
        console.log(`🔄 自动切换到筹码: ${firstChip.value}`)
      }
    }
  }

  // 🔥 新增：根据ID获取筹码数据
  const getChipById = (id: string): ChipData | undefined => {
    return availableChips.value.find(chip => chip.id === id)
  }

  // 🔥 新增：根据值获取筹码数据
  const getChipByValue = (value: number): ChipData | undefined => {
    return availableChips.value.find(chip => chip.value === value)
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

  // 🔥 新增：重置筹码设置为默认
  const resetChipSettings = (): void => {
    displayChips.value = ['chip-10', 'chip-50', 'chip-100']
    selectedChip.value = 10
    console.log('🔄 重置筹码设置为默认')
  }

  // 初始化
  const init = (): void => {
    console.log('🎰 投注 Store 初始化')

    // 重置所有状态
    betHistory.value = []
    selectedChip.value = 10
    isCommissionFree.value = false

    // 🔥 重置筹码设置
    displayChips.value = ['chip-10', 'chip-50', 'chip-100']

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
    displayChips,
    availableChips,
    zoneSimulationData,
    userBets,
    winningFlash,
    isCommissionFree,

    // 计算属性
    totalUserBets,
    hasLastRoundData,
    getDisplayChipsData,
    getCurrentChipData,
    isChipAvailable,

    // 方法
    selectChip,
    updateDisplayChips,
    getChipById,
    getChipByValue,
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
    resetChipSettings,
    init
  }
})
