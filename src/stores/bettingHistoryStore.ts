// src/stores/bettingHistoryStore.ts - 优化版（百家乐）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGlobalApiService } from '@/services/gameApi'
import type { BettingHistoryParams, BettingHistoryItem } from '@/services/gameApi'

// 投注记录类型 - 基于 BJL API 响应格式
export interface BettingRecord {
  id: string                  // 注单号
  user_id: string             // 用户ID
  table_id: string            // 台桌ID
  xue_number: string          // 靴号
  pu_number: string           // 铺号
  bet_amt: number            // 下注金额
  win_amt: number            // 中奖金额
  delta_amt: number          // 变化金额
  detail: string             // 投注明细JSON
  result: string             // 游戏结果
  close_status: number       // 结束状态 (1:待开牌, 2:已结算, 3:台面作废, 4:修改结果)
  created_at: string         // 创建时间
  updated_at: string         // 更新时间
}

// 投注明细类型
export interface BetDetail {
  [zone: string]: number     // 投注区域和金额
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
  const totalRecords = computed(() => records.value.length)

  // 基本统计
  const basicStats = computed(() => {
    if (records.value.length === 0) {
      return {
        totalBet: 0,
        totalWin: 0,
        netAmount: 0,
        totalGames: 0,
        winRate: 0
      }
    }

    const totalBet = records.value.reduce((sum, record) => {
      return sum + (Number(record.bet_amt) || 0)
    }, 0)

    const totalWin = records.value.reduce((sum, record) => {
      return sum + (Number(record.win_amt) || 0)
    }, 0)

    const netAmount = records.value.reduce((sum, record) => {
      return sum + (Number(record.delta_amt) || 0)
    }, 0)

    const winCount = records.value.filter(record => Number(record.delta_amt) > 0).length
    const totalGames = records.value.length
    const winRate = totalGames > 0 ? (winCount / totalGames) * 100 : 0

    return {
      totalBet,
      totalWin,
      netAmount,
      totalGames,
      winRate
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

      console.log('📤 请求参数:', params)

      const response = await apiService.getBettingHistory(params)

      console.log('📥 API 响应:', response)

      // 使用 API 返回的数据格式
      const newRecords = response.items || []

      // 数据清洗和验证
      const cleanedRecords: BettingRecord[] = newRecords.map((record: BettingHistoryItem) => ({
        id: record.id || '',
        user_id: record.user_id || '',
        table_id: record.table_id || '',
        xue_number: record.xue_number || '',
        pu_number: record.pu_number || '',
        bet_amt: Number(record.bet_amt) || 0,
        win_amt: Number(record.win_amt) || 0,
        delta_amt: Number(record.delta_amt) || 0,
        detail: record.detail || '{}',
        result: record.result || '',
        close_status: Number(record.close_status) || 1,
        created_at: record.created_at || '',
        updated_at: record.updated_at || ''
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
      error.value = err?.message || err?.data?.message || '加载失败'

      // 如果是第一页加载失败，清空记录
      if (page === 1) {
        records.value = []
      }
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

  // 重置状态
  const reset = (): void => {
    console.log('🔄 重置投注记录状态')
    records.value = []
    currentPage.value = 1
    hasMore.value = true
    loading.value = false
    error.value = null
  }

  // 清除错误
  const clearError = (): void => {
    error.value = null
  }

  // 工具方法 - 格式化金额
  const formatAmount = (amount: number | string): string => {
    const num = Number(amount) || 0
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // 工具方法 - 格式化时间
  const formatTime = (timeString: string): string => {
    if (!timeString) return '--'

    try {
      const date = new Date(timeString)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '--'
    }
  }

  // 工具方法 - 解析投注明细
  const parseBetDetail = (detailJson: string): BetDetail => {
    try {
      return JSON.parse(detailJson || '{}')
    } catch {
      return {}
    }
  }

  // 工具方法 - 获取记录状态
  const getRecordStatus = (record: BettingRecord): 'win' | 'lose' | 'pending' | 'void' => {
    // 根据 close_status 判断状态
    switch (record.close_status) {
      case 1: // 待开牌
        return 'pending'
      case 2: // 已结算
        return Number(record.delta_amt) > 0 ? 'win' : 'lose'
      case 3: // 台面作废
        return 'void'
      case 4: // 修改结果
        return Number(record.delta_amt) > 0 ? 'win' : 'lose'
      default:
        return 'pending'
    }
  }

  // 工具方法 - 获取状态文本
  const getStatusText = (record: BettingRecord): string => {
    const status = getRecordStatus(record)
    const statusMap = {
      'win': '已中奖',
      'lose': '未中奖',
      'pending': '进行中',
      'void': '已作废'
    }
    return statusMap[status]
  }

  // 工具方法 - 获取百家乐区域名称（基于真实配置）
  const getZoneName = (zone: string | number): string => {
    // 支持通过 rateId 或区域名称获取
    const zoneMap: Record<string | number, string> = {
      // 通过 rateId 映射
      8: '庄',
      6: '闲',
      7: '和',
      4: '庄对',
      2: '闲对',
      3: '幸运6',
      9: '龙7',
      10: '熊8',

      // 通过区域名称映射（兼容性）
      'banker': '庄',
      'player': '闲',
      'tie': '和',
      'banker_pair': '庄对',
      'player_pair': '闲对',
      'lucky_6': '幸运6',
      'dragon_7': '龙7',
      'panda_8': '熊8'
    }
    return zoneMap[zone] || String(zone)
  }

  // 工具方法 - 获取结果状态样式类
  const getStatusClass = (record: BettingRecord): string => {
    return getRecordStatus(record)
  }

  // 初始化
  const init = async (): Promise<void> => {
    console.log('📚 百家乐投注历史 Store 初始化')

    // 重置状态
    reset()

    // 加载初始数据
    try {
      await loadRecords(1, false)
      console.log('✅ 百家乐投注历史初始化完成')
    } catch (err) {
      console.error('❌ 百家乐投注历史初始化失败:', err)
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
    totalRecords,
    basicStats,

    // 方法
    loadRecords,
    loadMore,
    refresh,
    reset,
    clearError,
    init,

    // 工具方法
    formatAmount,
    formatTime,
    parseBetDetail,
    getRecordStatus,
    getStatusText,
    getZoneName,
    getStatusClass
  }
})
