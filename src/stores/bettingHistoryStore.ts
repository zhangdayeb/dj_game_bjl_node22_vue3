// src/stores/bettingHistoryStore.ts - 百家乐版本
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { getGlobalApiService } from '@/services/gameApi'

// 百家乐投注记录类型
export interface BaccaratBettingRecord {
  id: string
  game_number: string
  table_id: string
  user_id: string
  bet_time: string
  settle_time?: string

  // 投注详情
  bet_details: Array<{
    bet_type: string          // 投注类型
    bet_amount: number        // 投注金额
    odds: string             // 赔率
    win_amount: number       // 赢得金额
    zone_name: string        // 投注区域名称
  }>

  // 金额统计
  total_bet_amount: number
  total_win_amount: number
  net_amount: number

  // 百家乐特有数据
  banker_cards: string[]     // 庄家牌
  player_cards: string[]     // 闲家牌
  banker_score: number       // 庄家点数
  player_score: number       // 闲家点数
  game_result: string        // 游戏结果 (banker/player/tie)

  // 状态
  status: string             // 投注状态
  is_settled: boolean        // 是否已结算
  currency: string
}

// 投注历史查询参数
export interface BettingHistoryParams {
  page: number
  pageSize: number
  start_date?: string
  end_date?: string
  game_result?: string       // 按游戏结果筛选
  bet_type?: string         // 按投注类型筛选
}

export const useBettingHistoryStore = defineStore('bettingHistory', () => {
  // 基础状态
  const records = ref<BaccaratBettingRecord[]>([])
  const totalRecords = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const hasMore = ref(true)
  const lastFetchTime = ref<number>(0)

  // 加载状态
  const loadingState = reactive({
    loading: false,
    refreshing: false,
    loadingMore: false,
    error: null as string | null
  })

  // 筛选条件
  const filters = reactive({
    dateStart: null as string | null,
    dateEnd: null as string | null,
    gameResult: null as string | null,    // 'banker' | 'player' | 'tie'
    betType: null as string | null        // 投注类型筛选
  })

  // 计算属性
  const isEmpty = computed(() => records.value.length === 0)
  const isLoading = computed(() =>
    loadingState.loading || loadingState.refreshing || loadingState.loadingMore
  )
  const canLoadMore = computed(() =>
    hasMore.value && !isLoading.value && !loadingState.error
  )

  // 判断数据是否过期
  const isDataStale = computed(() => {
    const staleThreshold = 30000 // 30秒
    return !lastFetchTime.value || (Date.now() - lastFetchTime.value > staleThreshold)
  })

  // 统计信息计算
  const currentPageStats = computed(() => {
    const currentRecords = records.value
    if (currentRecords.length === 0) {
      return {
        totalBet: 0,
        totalWin: 0,
        netAmount: 0,
        winCount: 0,
        loseCount: 0,
        tieCount: 0,
        winRate: 0,
        bankerWins: 0,
        playerWins: 0,
        tieWins: 0
      }
    }

    const totalBet = currentRecords.reduce((sum, record) => sum + record.total_bet_amount, 0)
    const totalWin = currentRecords.reduce((sum, record) => sum + record.total_win_amount, 0)
    const netAmount = currentRecords.reduce((sum, record) => sum + record.net_amount, 0)

    const winCount = currentRecords.filter(record => record.net_amount > 0).length
    const loseCount = currentRecords.filter(record => record.net_amount < 0).length
    const tieCount = currentRecords.filter(record => record.net_amount === 0).length

    const winRate = currentRecords.length > 0 ? (winCount / currentRecords.length) * 100 : 0

    // 百家乐特有统计
    const bankerWins = currentRecords.filter(record => record.game_result === 'banker').length
    const playerWins = currentRecords.filter(record => record.game_result === 'player').length
    const tieWins = currentRecords.filter(record => record.game_result === 'tie').length

    return {
      totalBet,
      totalWin,
      netAmount,
      winCount,
      loseCount,
      tieCount,
      winRate: Math.round(winRate * 100) / 100,
      bankerWins,
      playerWins,
      tieWins
    }
  })

  // 构建查询参数
  const buildQueryParams = (page: number = currentPage.value): BettingHistoryParams => {
    const params: BettingHistoryParams = {
      page,
      pageSize: pageSize.value
    }

    // 添加筛选条件
    if (filters.dateStart) {
      params.start_date = filters.dateStart
    }

    if (filters.dateEnd) {
      params.end_date = filters.dateEnd
    }

    if (filters.gameResult) {
      params.game_result = filters.gameResult
    }

    if (filters.betType) {
      params.bet_type = filters.betType
    }

    return params
  }

  // 获取投注记录
  const fetchRecords = async (page: number = 1, append: boolean = false): Promise<void> => {
    try {
      console.log(`🔄 百家乐历史记录: 获取投注记录 - 页码: ${page}, 追加: ${append}`)

      const params = buildQueryParams(page)

      // 设置加载状态
      if (page === 1) {
        if (append) {
          loadingState.refreshing = true
        } else {
          loadingState.loading = true
        }
      } else {
        loadingState.loadingMore = true
      }

      loadingState.error = null

      const apiService = getGlobalApiService()
      const response = await apiService.getBettingHistory(params)

      console.log('📥 百家乐历史: API 响应信息:', {
        response,
        recordsLength: response.records?.length || 0
      })

      const { records: newRecords = [], pagination = null } = response

      // 数据清洗和映射 - 百家乐特有处理
      const cleanedRecords: BaccaratBettingRecord[] = newRecords.map((record: any, index: number) => {
        return {
          id: record.id || record.ID || `${Date.now()}-${index}`,
          game_number: record.game_number || record.gameNumber || `B${Date.now()}`,
          table_id: record.table_id || record.tableId || '1',
          user_id: record.user_id || record.userId || '1',
          bet_time: record.bet_time || record.betTime || new Date().toISOString(),
          settle_time: record.settle_time || record.settleTime,

          bet_details: Array.isArray(record.bet_details) ? record.bet_details :
                      Array.isArray(record.betDetails) ? record.betDetails : [],
          total_bet_amount: Number(record.total_bet_amount || record.totalBetAmount || 0),
          total_win_amount: Number(record.total_win_amount || record.totalWinAmount || 0),
          net_amount: Number(record.net_amount || record.netAmount ||
            (Number(record.total_win_amount || record.totalWinAmount || 0) -
             Number(record.total_bet_amount || record.totalBetAmount || 0))),

          // 百家乐特有数据
          banker_cards: Array.isArray(record.banker_cards) ? record.banker_cards :
                       Array.isArray(record.bankerCards) ? record.bankerCards : [],
          player_cards: Array.isArray(record.player_cards) ? record.player_cards :
                       Array.isArray(record.playerCards) ? record.playerCards : [],
          banker_score: Number(record.banker_score || record.bankerScore || 0),
          player_score: Number(record.player_score || record.playerScore || 0),
          game_result: record.game_result || record.gameResult || 'unknown',

          status: record.status || 'pending',
          is_settled: Boolean(record.is_settled || record.isSettled || false),
          currency: record.currency || 'CNY'
        } as BaccaratBettingRecord
      })

      // 更新记录
      if (append && page > 1) {
        records.value = [...records.value, ...cleanedRecords]
        console.log('➕ 百家乐历史: 追加数据，总记录数量:', records.value.length)
      } else {
        records.value = cleanedRecords
        console.log('🔄 百家乐历史: 替换数据，新记录数量:', cleanedRecords.length)
      }

      // 更新分页信息
      currentPage.value = pagination?.current_page || page
      totalPages.value = pagination?.total_pages || Math.ceil(records.value.length / pageSize.value)
      totalRecords.value = pagination?.total_records || records.value.length
      hasMore.value = pagination?.has_more || false
      lastFetchTime.value = Date.now()

      console.log(`✅ 百家乐历史: 数据加载完成`, {
        totalRecords: records.value.length,
        currentPage: currentPage.value,
        hasMore: hasMore.value
      })

    } catch (error: any) {
      console.error('❌ 百家乐历史: 获取投注记录失败:', error)
      loadingState.error = error.message || '获取投注记录失败'
      throw error
    } finally {
      loadingState.loading = false
      loadingState.refreshing = false
      loadingState.loadingMore = false
    }
  }

  // 强制刷新数据
  const forceRefresh = async (): Promise<void> => {
    try {
      console.log('🚀 百家乐历史: 强制刷新投注记录数据')
      loadingState.loading = true
      loadingState.error = null

      records.value = []
      currentPage.value = 1
      hasMore.value = true
      lastFetchTime.value = 0

      await fetchRecords(1, false)
      console.log('✅ 百家乐历史: 强制刷新完成')

    } catch (error: any) {
      console.error('❌ 百家乐历史: 强制刷新失败:', error)
      loadingState.error = error.message || '刷新数据失败'
      throw error
    } finally {
      loadingState.loading = false
    }
  }

  // 标记数据过期
  const markDataStale = (): void => {
    lastFetchTime.value = 0
    console.log('📝 百家乐历史: 数据已标记为过期')
  }

  // 应用筛选条件
  const applyFilters = async (newFilters: {
    dateStart?: string | null
    dateEnd?: string | null
    gameResult?: string | null
    betType?: string | null
  }): Promise<void> => {
    console.log('🔍 百家乐历史: 应用筛选条件:', newFilters)

    Object.assign(filters, newFilters)
    await fetchRecords(1, false)
  }

  // 重置筛选条件
  const resetFilters = async (): Promise<void> => {
    console.log('🔄 百家乐历史: 重置筛选条件')
    filters.dateStart = null
    filters.dateEnd = null
    filters.gameResult = null
    filters.betType = null
    await fetchRecords(1, false)
  }

  // 按游戏结果筛选
  const filterByGameResult = async (result: string | null): Promise<void> => {
    await applyFilters({ gameResult: result })
  }

  // 按投注类型筛选
  const filterByBetType = async (betType: string | null): Promise<void> => {
    await applyFilters({ betType })
  }

  // 刷新记录
  const refreshRecords = async (): Promise<void> => {
    console.log('🔄 百家乐历史: 刷新记录')
    await fetchRecords(1, true)
  }

  // 加载更多记录
  const loadMoreRecords = async (): Promise<void> => {
    if (canLoadMore.value) {
      console.log('📄 百家乐历史: 加载更多记录')
      await fetchRecords(currentPage.value + 1, true)
    }
  }

  // 清除错误
  const clearError = (): void => {
    loadingState.error = null
  }

  // 初始化
  const init = async (): Promise<void> => {
    console.log('🚀 百家乐历史: 初始化投注记录')

    // 重置状态
    records.value = []
    totalRecords.value = 0
    totalPages.value = 0
    currentPage.value = 1
    hasMore.value = true
    lastFetchTime.value = 0

    // 重置筛选条件
    filters.dateStart = null
    filters.dateEnd = null
    filters.gameResult = null
    filters.betType = null

    clearError()

    console.log('🔄 百家乐历史: 状态已重置')

    // 获取初始数据
    try {
      console.log('📡 百家乐历史: 开始获取初始数据')
      await fetchRecords(1, false)
      console.log('✅ 百家乐历史: 初始化完成')
    } catch (error) {
      console.error('❌ 百家乐历史: 初始化失败:', error)
    }
  }

  return {
    // 状态
    records,
    totalRecords,
    totalPages,
    currentPage,
    pageSize,
    hasMore,
    lastFetchTime,
    loadingState,
    filters,

    // 计算属性
    isEmpty,
    isLoading,
    canLoadMore,
    isDataStale,
    currentPageStats,

    // 方法
    fetchRecords,
    forceRefresh,
    markDataStale,
    applyFilters,
    resetFilters,
    filterByGameResult,
    filterByBetType,
    refreshRecords,
    loadMoreRecords,
    clearError,
    init
  }
})
