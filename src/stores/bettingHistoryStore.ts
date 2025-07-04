// src/stores/bettingHistoryStore.ts - 简化版
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGlobalApiService } from '@/services/gameApi'
import type { BettingHistoryParams, BettingHistoryItem } from '@/services/gameApi'

// 简化的投注记录类型 - 基于 API 响应格式
export interface BettingRecord {
  id: string                  // 注单号
  xue_number: string          // 靴号
  pu_number: string           // 铺号
  bet_amt: number            // 下注金额
  win_amt: number            // 中奖金额
  delta_amt: number          // 变化金额
  detail: string             // 投注明细JSON
  result: string             // 游戏结果
  close_status: number       // 结束状态
  created_at: string         // 创建时间
}

export const useBettingHistoryStore = defineStore('bettingHistory', () => {
  // 核心状态
  const records = ref<BettingRecord[]>([])
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 固定每页大小
  const pageSize = 20

  // 计算属性
  const isEmpty = computed(() => records.value.length === 0)
  const isLoading = computed(() => loading.value)
  const canLoadMore = computed(() => hasMore.value && !loading.value && !error.value)

  // 基本统计
  const basicStats = computed(() => {
    if (records.value.length === 0) {
      return {
        totalBet: 0,
        totalWin: 0,
        netAmount: 0,
        totalGames: 0
      }
    }

    const totalBet = records.value.reduce((sum, record) => {
      const betAmount = typeof record.bet_amt === 'number' ? record.bet_amt : 0
      return sum + betAmount
    }, 0)

    const totalWin = records.value.reduce((sum, record) => {
      const winAmount = typeof record.win_amt === 'number' ? record.win_amt : 0
      return sum + winAmount
    }, 0)

    const netAmount = records.value.reduce((sum, record) => {
      const deltaAmount = typeof record.delta_amt === 'number' ? record.delta_amt : 0
      return sum + deltaAmount
    }, 0)

    const totalGames = records.value.length

    return {
      totalBet,
      totalWin,
      netAmount,
      totalGames
    }
  })

  // 加载记录
  const loadRecords = async (page: number = 1, append: boolean = false): Promise<void> => {
    try {
      console.log(`📚 加载投注记录 - 页码: ${page}, 追加: ${append}`)

      loading.value = true
      error.value = null

      const apiService = getGlobalApiService()
      const gameParams = apiService.getGameParams()

      const params: BettingHistoryParams = {
        user_id: parseInt(gameParams.user_id),
        table_id: gameParams.table_id,
        game_type: parseInt(gameParams.game_type),
        page,
        page_size: pageSize
      }

      const response = await apiService.getBettingHistory(params)

      console.log('📥 API 响应:', response)

      // 使用 API 返回的数据格式
      const newRecords = response.items || []

      // 数据清洗 - 适配 API 返回的格式
      const cleanedRecords: BettingRecord[] = newRecords.map((record: BettingHistoryItem) => ({
        id: record.id,
        xue_number: record.xue_number,
        pu_number: record.pu_number,
        bet_amt: record.bet_amt,
        win_amt: record.win_amt,
        delta_amt: record.delta_amt,
        detail: record.detail,
        result: record.result,
        close_status: record.close_status,
        created_at: record.created_at
      }))

      // 更新记录
      if (append && page > 1) {
        records.value = [...records.value, ...cleanedRecords]
        console.log('➕ 追加记录，总数量:', records.value.length)
      } else {
        records.value = cleanedRecords
        console.log('🔄 替换记录，新数量:', cleanedRecords.length)
      }

      // 更新分页信息
      currentPage.value = page
      hasMore.value = response.has_next || false

      console.log('✅ 记录加载完成', {
        currentPage: currentPage.value,
        hasMore: hasMore.value,
        totalRecords: records.value.length
      })

    } catch (err: any) {
      console.error('❌ 加载投注记录失败:', err)
      error.value = err.message || '加载失败'
    } finally {
      loading.value = false
    }
  }

  // 加载更多
  const loadMore = async (): Promise<void> => {
    if (!canLoadMore.value) {
      console.log('⚠️ 无法加载更多')
      return
    }

    console.log('📄 加载更多记录')
    await loadRecords(currentPage.value + 1, true)
  }

  // 刷新
  const refresh = async (): Promise<void> => {
    console.log('🔄 刷新投注记录')
    currentPage.value = 1
    hasMore.value = true
    await loadRecords(1, false)
  }

  // 清除错误
  const clearError = (): void => {
    error.value = null
  }

  // 格式化金额
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString()
  }

  // 格式化时间
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN')
  }

  // 初始化
  const init = async (): Promise<void> => {
    console.log('📚 投注历史 Store 初始化')

    // 重置状态
    records.value = []
    currentPage.value = 1
    hasMore.value = true
    loading.value = false
    error.value = null

    // 加载初始数据
    try {
      await loadRecords(1, false)
      console.log('✅ 投注历史初始化完成')
    } catch (err) {
      console.error('❌ 投注历史初始化失败:', err)
    }
  }

  return {
    // 状态
    records,
    currentPage,
    hasMore,
    loading,
    error,

    // 计算属性
    isEmpty,
    isLoading,
    canLoadMore,
    basicStats,

    // 方法
    loadRecords,
    loadMore,
    refresh,
    clearError,
    formatAmount,
    formatTime,
    init
  }
})
