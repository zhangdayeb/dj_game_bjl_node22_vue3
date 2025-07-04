// src/services/networkService.ts
import { ref, reactive, computed, readonly, watch } from 'vue'
import { getValidatedParams } from '@/utils/urlParams'
import { getGlobalApiService, setGlobalApiService, createGameApiService } from '@/services/gameApi'
import { getWebSocketService } from '@/services/websocket'
import { useAudio, initializeGlobalAudioSystem } from '@/services/Audio'
import type { GameParams } from '@/utils/urlParams'
import type { GameStatus } from '@/types/game'
import type { TableInfo, UserInfo } from '@/services/gameApi'

/**
 * 构建视频URL - 将tableId附加到tableVideo参数
 * @param {string} baseVideoUrl - 基础视频URL
 * @param {string|number} tableId - 桌台ID
 * @returns {string} - 完整的视频URL
 */
function buildVideoUrl(baseVideoUrl: string, tableId: string | number): string {
  try {
    const url = new URL(baseVideoUrl)
    const tableVideo = url.searchParams.get('tableVideo')

    if (tableVideo) {
      // 将tableId附加到tableVideo参数后面
      const newTableVideo = tableVideo + tableId
      url.searchParams.set('tableVideo', newTableVideo)
      return url.toString()
    }

    return baseVideoUrl
  } catch (error) {
    console.error('构建视频URL时出错:', error)
    return baseVideoUrl
  }
}

// 🔥 新增：统计数据刷新回调管理
interface StatisticsRefreshCallback {
  (): Promise<void>
}

let statisticsRefreshCallback: StatisticsRefreshCallback | null = null

// 🔥 新增：注册统计数据刷新回调
export function registerStatisticsRefreshCallback(callback: StatisticsRefreshCallback): void {
  statisticsRefreshCallback = callback
  console.log('📊 统计数据刷新回调已注册')
}

// 🔥 新增：取消注册统计数据刷新回调
export function unregisterStatisticsRefreshCallback(): void {
  statisticsRefreshCallback = null
  console.log('📊 统计数据刷新回调已取消注册')
}

// 网络状态接口
interface NetworkStatus {
  isOnline: boolean
  isApiReady: boolean
  isWebSocketConnected: boolean
  isAudioReady: boolean
  retryCount: number
  lastError: string | null
}

// 游戏数据接口
interface GameData {
  gameStatus: GameStatus
  countdown: number
  gameNumber: string
  balance: number
  tableInfo: TableInfo | null
  userInfo: UserInfo | null
  videoUrl: string
  gameParams: GameParams
}

// 全局状态管理
const networkStatus = reactive<NetworkStatus>({
  isOnline: navigator.onLine,
  isApiReady: false,
  isWebSocketConnected: false,
  isAudioReady: false,
  retryCount: 0,
  lastError: null
})

const gameData = reactive<GameData>({
  gameStatus: 'waiting',
  countdown: 0,
  gameNumber: '',
  balance: 0,
  tableInfo: null,
  userInfo: null,
  videoUrl: '',
  gameParams: {
    user_id: '',
    game_type: '',
    table_id: '',
    token: ''
  }
})

// 服务实例
let wsService: any = null
let audioService: any = null
let updateTimer: number | null = null

// 网络状态监控
class NetworkMonitor {
  private static instance: NetworkMonitor

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor()
    }
    return NetworkMonitor.instance
  }

  init() {
    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    console.log('🔧 网络监控已初始化')
  }

  private handleOnline() {
    console.log('✅ 网络已连接')
    networkStatus.isOnline = true
    networkStatus.retryCount = 0
    networkStatus.lastError = null

    // 重新连接 WebSocket
    if (wsService && gameData.gameParams.user_id) {
      wsService.connect(gameData.gameParams).catch((error: any) => {
        console.error('❌ 网络恢复后 WebSocket 重连失败:', error)
      })
    }

    // 重新启动定时更新
    this.startPeriodicUpdates()
  }

  private handleOffline() {
    console.log('❌ 网络已断开')
    networkStatus.isOnline = false
    networkStatus.lastError = '网络已断开'
    this.stopPeriodicUpdates()
  }

  // 启动定时更新
  startPeriodicUpdates() {
    if (updateTimer) {
      this.stopPeriodicUpdates()
    }

    console.log('🔄 启动定时数据更新 (每3秒)')
    updateTimer = setInterval(async () => {
      if (!networkStatus.isOnline) {
        return
      }

      try {
        await this.updateGameData()
      } catch (error) {
        console.error('❌ 定时更新失败:', error)
        networkStatus.lastError = '数据更新失败'
      }
    }, 3000)
  }

  // 停止定时更新
  stopPeriodicUpdates() {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
      console.log('⏹️ 停止定时数据更新')
    }
  }

  // 🔥 修改：更新游戏数据（新增统计数据刷新）
  async updateGameData() {
    try {
      const apiService = getGlobalApiService()

      // 并发获取用户信息和台桌信息
      const [userInfo, tableInfo] = await Promise.all([
        apiService.getUserInfo().catch(() => null),
        apiService.getTableInfo().catch(() => null)
      ])

      // 更新用户信息
      if (userInfo) {
        gameData.userInfo = userInfo
        gameData.balance = userInfo.money_balance || 0
      }

      // 更新台桌信息
      if (tableInfo) {
        gameData.tableInfo = tableInfo

        // 从台桌信息解析游戏状态
        const status = this.parseGameStatus(tableInfo.run_status)
        gameData.gameStatus = status

        // 计算倒计时
        const countdown = this.calculateCountdown(tableInfo.start_time, tableInfo.countdown_time)
        gameData.countdown = countdown

        // 更新游戏局号
        const gameNumber = this.generateGameNumber(tableInfo)
        gameData.gameNumber = gameNumber
      }

      // 🔥 新增：同时刷新统计数据
      if (statisticsRefreshCallback) {
        try {
          await statisticsRefreshCallback()
          console.log('📊 统计数据已同步更新')
        } catch (error) {
          console.error('❌ 统计数据更新失败:', error)
          // 统计数据更新失败不影响主要数据流程
        }
      }

      // 清除错误状态
      if (networkStatus.lastError === '数据更新失败') {
        networkStatus.lastError = null
      }

      console.log('📊 数据更新成功:', {
        status: gameData.gameStatus,
        countdown: gameData.countdown,
        balance: gameData.balance,
        gameNumber: gameData.gameNumber
      })

    } catch (error) {
      console.error('❌ 数据更新失败:', error)
      throw error
    }
  }

  // 解析游戏状态
  private parseGameStatus(runStatus: number): GameStatus {
    switch (runStatus) {
      case 1: return 'betting'    // 投注中
      case 2: return 'dealing'    // 开牌中
      case 3: return 'waiting'    // 洗牌等待
      default: return 'waiting'
    }
  }

  // 计算倒计时
  private calculateCountdown(startTime: number, countdownTime: number): number {
    if (!startTime || !countdownTime) return 0

    const now = Math.floor(Date.now() / 1000)
    const elapsed = now - startTime
    const remaining = countdownTime - elapsed

    return Math.max(0, remaining)
  }

  // 生成游戏局号
  private generateGameNumber(tableInfo: TableInfo): string {
    const tableId = tableInfo.id || gameData.gameParams.table_id
    const xuehao = tableInfo.num_xue || 1
    const puhao = tableInfo.num_pu || 1

    return `T${tableId}_${xuehao}_${puhao}`
  }

  // 清理资源
  cleanup() {
    this.stopPeriodicUpdates()
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }
}

// 🔥 主要的网络服务初始化函数
export async function initializeNetworkService(): Promise<void> {
  try {
    console.log('🚀 开始初始化网络服务...')

    // 1. 解析并验证 URL 参数
    const { params, isValid, missing } = getValidatedParams()
    if (!isValid) {
      throw new Error(`缺少必需的URL参数: ${missing.join(', ')}`)
    }

    gameData.gameParams = params
    console.log('📋 URL 参数验证通过:', params)

    // 2. 初始化 API 服务
    const apiService = createGameApiService(params)
    setGlobalApiService(apiService)
    networkStatus.isApiReady = true
    console.log('🔧 API 服务初始化完成')

    // 3. 初始化 WebSocket 服务
    wsService = getWebSocketService()
    await wsService.connect(params)
    networkStatus.isWebSocketConnected = wsService.isConnected()
    console.log('🔧 WebSocket 服务初始化完成')

    // 4. 初始化音频服务
    audioService = useAudio()
    await initializeGlobalAudioSystem()
    networkStatus.isAudioReady = true
    console.log('🔧 音频服务初始化完成')

    // 5. 设置 WebSocket 事件处理
    setupWebSocketHandlers()

    // 6. 初始化网络监控
    NetworkMonitor.getInstance().init()

    // 7. 加载初始数据
    await loadInitialData()

    // 8. 启动定时更新
    NetworkMonitor.getInstance().startPeriodicUpdates()

    console.log('✅ 网络服务初始化完成')

  } catch (error) {
    console.error('❌ 网络服务初始化失败:', error)
    networkStatus.lastError = `初始化失败: ${error}`
    throw error
  }
}

// 设置 WebSocket 事件处理
function setupWebSocketHandlers() {
  if (!wsService) return

  // 连接成功
  wsService.on('connected', () => {
    console.log('✅ WebSocket 连接成功')
    networkStatus.isWebSocketConnected = true
    networkStatus.lastError = null
  })

  // 连接断开
  wsService.on('disconnected', (data: any) => {
    console.log('❌ WebSocket 连接断开:', data)
    networkStatus.isWebSocketConnected = false
  })

  // 接收消息
  wsService.on('message', (data: any) => {
    console.log('📨 收到 WebSocket 消息:', data)
    handleWebSocketMessage(data)
  })

  // 连接错误
  wsService.on('error', (error: any) => {
    console.error('❌ WebSocket 错误:', error)
    networkStatus.lastError = 'WebSocket 连接错误'
  })

  // 重连中
  wsService.on('reconnecting', (data: any) => {
    console.log('🔄 WebSocket 重连中:', data)
    networkStatus.retryCount = data.attempt
  })
}

// 处理 WebSocket 消息
function handleWebSocketMessage(data: any) {
  try {
    // 根据消息类型处理不同的数据
    if (data && typeof data === 'object') {
      // 游戏状态更新
      if (data.type === 'game_status' || data.game_status !== undefined) {
        gameData.gameStatus = data.game_status || data.status
        gameData.countdown = data.countdown || 0
        gameData.gameNumber = data.game_number || gameData.gameNumber
      }

      // 用户余额更新
      if (data.type === 'balance_update' || data.balance !== undefined) {
        gameData.balance = data.balance
      }

      // 台桌信息更新
      if (data.type === 'table_info' || data.table_info !== undefined) {
        gameData.tableInfo = data.table_info
      }

      // 开牌结果 - 只更新数据，不播放音效
      if (data.type === 'game_result') {
        // 可以在这里添加开牌结果的数据更新逻辑
        console.log('🎰 收到开牌结果:', data)
      }

      // 投注结果 - 只更新数据，不播放音效
      if (data.type === 'bet_result') {
        // 可以在这里添加投注结果的数据更新逻辑
        console.log('🎯 收到投注结果:', data)
      }
    }
  } catch (error) {
    console.error('❌ 处理 WebSocket 消息失败:', error)
  }
}

// 加载初始数据
async function loadInitialData(): Promise<void> {
  console.log('📡 开始加载初始数据...')

  try {
    const apiService = getGlobalApiService()

    // 🔥 重要：视频地址只在初始化时获取一次
    const [userInfo, tableInfo] = await Promise.all([
      apiService.getUserInfo(),
      apiService.getTableInfo()
    ])

    // 更新用户信息
    if (userInfo) {
      gameData.userInfo = userInfo
      gameData.balance = userInfo.money_balance || 0
    }

    // 更新台桌信息
    if (tableInfo) {
      gameData.tableInfo = tableInfo

      // 🔥 修改：设置视频地址时构建包含tableId的URL
      const tableId = tableInfo.id || gameData.gameParams.table_id

      if (tableInfo.video_near) {
        gameData.videoUrl = buildVideoUrl(tableInfo.video_near, tableId)
      } else if (tableInfo.video_far) {
        gameData.videoUrl = buildVideoUrl(tableInfo.video_far, tableId)
      }

      // 解析游戏状态
      const monitor = NetworkMonitor.getInstance()
      gameData.gameStatus = monitor['parseGameStatus'](tableInfo.run_status)
      gameData.countdown = monitor['calculateCountdown'](tableInfo.start_time, tableInfo.countdown_time)
      gameData.gameNumber = monitor['generateGameNumber'](tableInfo)
    }

    console.log('📊 初始数据加载完成:', {
      balance: gameData.balance,
      status: gameData.gameStatus,
      countdown: gameData.countdown,
      gameNumber: gameData.gameNumber,
      videoUrl: gameData.videoUrl
    })

  } catch (error) {
    console.error('❌ 初始数据加载失败:', error)

    // 设置默认值
    gameData.gameStatus = 'waiting'
    gameData.countdown = 0
    gameData.gameNumber = `T${gameData.gameParams.table_id}_1_1`
    gameData.balance = 0
    gameData.videoUrl = ''

    throw error
  }
}

// 清理网络服务
export function cleanupNetworkService(): void {
  console.log('🧹 清理网络服务...')

  // 🔥 新增：清理统计回调
  unregisterStatisticsRefreshCallback()

  // 清理定时器
  NetworkMonitor.getInstance().cleanup()

  // 断开 WebSocket
  if (wsService) {
    wsService.disconnect()
    wsService.removeAllListeners()
  }

  // 清理音频
  if (audioService) {
    audioService.cleanup()
  }

  console.log('✅ 网络服务已清理')
}

// 🔥 修改：导出响应式数据供组件使用（新增统计相关方法）
export function useNetworkService() {
  return {
    // 状态
    networkStatus: readonly(networkStatus),
    gameData: readonly(gameData),

    // 计算属性
    isReady: computed(() => networkStatus.isApiReady && networkStatus.isWebSocketConnected),
    isConnected: computed(() => networkStatus.isWebSocketConnected),
    hasError: computed(() => networkStatus.lastError !== null),

    // 方法
    initializeNetworkService,
    cleanupNetworkService,

    // 手动刷新数据
    refreshData: () => NetworkMonitor.getInstance().updateGameData(),

    // 🔥 新增：统计数据管理
    registerStatisticsCallback: registerStatisticsRefreshCallback,
    unregisterStatisticsCallback: unregisterStatisticsRefreshCallback,

    // 🔥 新增：手动刷新统计数据
    refreshStatistics: async () => {
      if (statisticsRefreshCallback) {
        try {
          await statisticsRefreshCallback()
          console.log('📊 手动刷新统计数据成功')
        } catch (error) {
          console.error('❌ 手动刷新统计数据失败:', error)
          throw error
        }
      }
    },

    // WebSocket 方法
    sendWebSocketMessage: (data: any) => {
      if (wsService) {
        wsService.send(data)
      }
    },

    // 音频方法
    playSound: (soundId: string) => {
      if (audioService) {
        audioService.playSound(soundId)
      }
    },

    // 背景音乐控制
    toggleMusic: () => {
      if (audioService) {
        audioService.toggleMusic()
      }
    },

    // 音效控制
    toggleSfx: () => {
      if (audioService) {
        audioService.toggleSfx()
      }
    }
  }
}

// 🔥 监听游戏数据变化的 Hook
export function useGameDataWatcher() {
  const watchers = {
    // 监听游戏状态变化
    onGameStatusChange: (callback: (status: GameStatus, oldStatus: GameStatus) => void) => {
      return watch(
        () => gameData.gameStatus,
        (newStatus, oldStatus) => {
          if (newStatus !== oldStatus) {
            callback(newStatus, oldStatus)
          }
        }
      )
    },

    // 监听倒计时变化
    onCountdownChange: (callback: (countdown: number, oldCountdown: number) => void) => {
      return watch(
        () => gameData.countdown,
        (newCountdown, oldCountdown) => {
          if (newCountdown !== oldCountdown) {
            callback(newCountdown, oldCountdown)
          }
        }
      )
    },

    // 监听余额变化
    onBalanceChange: (callback: (balance: number, oldBalance: number) => void) => {
      return watch(
        () => gameData.balance,
        (newBalance, oldBalance) => {
          if (newBalance !== oldBalance) {
            callback(newBalance, oldBalance)
          }
        }
      )
    },

    // 监听游戏局号变化
    onGameNumberChange: (callback: (gameNumber: string, oldGameNumber: string) => void) => {
      return watch(
        () => gameData.gameNumber,
        (newGameNumber, oldGameNumber) => {
          if (newGameNumber !== oldGameNumber) {
            callback(newGameNumber, oldGameNumber)
          }
        }
      )
    }
  }

  return watchers
}

// 默认导出
export default {
  initializeNetworkService,
  cleanupNetworkService,
  useNetworkService,
  useGameDataWatcher,
  // 🔥 新增：统计相关导出
  registerStatisticsRefreshCallback,
  unregisterStatisticsRefreshCallback
}
