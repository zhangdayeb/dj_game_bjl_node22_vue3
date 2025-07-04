<template>
  <div class="game-section" :style="sectionStyles">
    <!-- 网络初始化遮罩 -->
    <div v-if="showInitializationOverlay" class="initialization-overlay">
      <div class="init-container">
        <!-- 加载状态 -->
        <div v-if="!initializationComplete" class="loading-section">
          <div class="loading-spinner"></div>
          <h2 class="loading-title">正在初始化游戏...</h2>
          <p class="loading-text">{{ initializationStatus }}</p>
          <div class="loading-progress">
            <div class="progress-bar" :style="{ width: initializationProgress + '%' }"></div>
          </div>
        </div>

        <!-- 欢迎界面 -->
        <div v-else class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">欢迎光临百家乐游戏</h1>
            <button
              class="welcome-button"
              @click="handleWelcomeClick"
              :disabled="!canStartGame"
            >
              开始游戏
            </button>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-if="hasInitializationError" class="error-section">
          <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h2 class="error-title">初始化失败</h2>
            <p class="error-message">{{ initializationError }}</p>
            <button class="retry-button" @click="retryInitialization">
              重试
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏主界面 -->
    <div v-else class="game-main">
      <!-- 1. 顶部视频和状态区域 -->
      <TopSection :height="heights.video" />

      <!-- 2. 中间投注区域和筹码 -->
      <MiddleSection :height="heights.betting" />

      <!-- 3. 底部路珠区域 -->
      <BottomSection :width="containerWidth" />

      <!-- 4. 弹出层 - 只包含开牌和中奖特效 -->
      <OverlaySection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { CSSProperties } from 'vue'

// 🔥 导入网络服务
import { useNetworkService, useGameDataWatcher, initializeNetworkService, cleanupNetworkService } from '@/services/networkService'

// Store 导入
import { useGameStore } from '@/stores/gameStore'
import { useBettingStore } from '@/stores/bettingStore'

// 组件导入
import TopSection from './Top.vue'
import MiddleSection from './Middle.vue'
import BottomSection from './Bottom.vue'
import OverlaySection from './Overlay.vue'

// 🔥 网络服务
const {
  networkStatus,
  gameData,
  isReady,
  isConnected,
  hasError,
  playSound,
  toggleMusic,
  toggleSfx
} = useNetworkService()

// 🔥 游戏数据监听
const {
  onGameStatusChange,
  onBalanceChange,
  onCountdownChange,
  onGameNumberChange
} = useGameDataWatcher()

// 🔥 安全的 Store 使用
let gameStore: any = null
let bettingStore: any = null

try {
  gameStore = useGameStore()
  bettingStore = useBettingStore()
} catch (error) {
  console.error('❌ Store 初始化失败:', error)
  // 创建默认对象避免错误
  gameStore = {
    balance: 10000,
    videoUrl: '',
    fullGameNumber: 'B00125010001',
    gameState: { status: 'waiting', countdown: 0 },
    updateGameStatus: () => {},
    updateBalance: () => {},
    init: () => Promise.resolve()
  }
  bettingStore = {
    selectedChip: 10,
    init: () => Promise.resolve()
  }
}

// 🔥 初始化状态
const showInitializationOverlay = ref(true)
const initializationComplete = ref(false)
const initializationStatus = ref('正在连接服务器...')
const initializationProgress = ref(0)
const hasInitializationError = ref(false)
const initializationError = ref('')

// 浏览器检测
const getBrowserInfo = () => {
  const ua = navigator.userAgent.toLowerCase()
  return {
    isSafari: /safari/.test(ua) && !/chrome/.test(ua),
    isiOS: /iphone|ipad|ipod/.test(ua),
    isTelegram: /telegram/.test(ua) || (window as any).TelegramWebApp,
    isChrome: /chrome/.test(ua),
    isiOSSafari: /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua)
  }
}

// 响应式数据
const viewportHeight = ref(window.innerHeight)
const containerWidth = ref(375) // 默认宽度
const browserInfo = getBrowserInfo()

// 🔥 计算属性
const canStartGame = computed(() => {
  return initializationComplete.value && isReady.value && !hasError.value
})

const formattedBalance = computed(() => {
  return gameData.balance ? gameData.balance.toLocaleString() : '0'
})

const connectionStatusClass = computed(() => {
  if (!networkStatus.isOnline) return 'status-offline'
  if (hasError.value) return 'status-error'
  if (isConnected.value) return 'status-connected'
  return 'status-connecting'
})

const connectionStatusText = computed(() => {
  if (!networkStatus.isOnline) return '离线'
  if (hasError.value) return '错误'
  if (isConnected.value) return '已连接'
  return '连接中'
})

// 🔥 修复：获取真实视口高度
const getRealViewportHeight = () => {
  if (window.visualViewport) {
    return window.visualViewport.height
  }
  return window.innerHeight || document.documentElement.clientHeight || screen.height
}

// 🔥 修复：简化高度计算，避免空白区域
const calculateHeights = () => {
  const realHeight = getRealViewportHeight()

  // 🔥 不再减去多余的边距，让内容填满整个屏幕
  const totalHeight = realHeight

  // 计算各区域高度
  const videoHeight = 350
  const roadmapHeight = Math.round(containerWidth.value * 0.35) // 路珠高度 = 宽度 * 0.35
  const bettingHeight = Math.max(200, totalHeight - videoHeight - roadmapHeight)

  return {
    total: totalHeight,
    video: videoHeight,
    roadmap: roadmapHeight,
    betting: bettingHeight
  }
}

// 计算属性
const heights = computed(() => calculateHeights())

// 🔥 修复：容器样式，确保填满整个屏幕
const sectionStyles = computed((): CSSProperties => ({
  height: `${heights.value.total}px`,
  minHeight: '100vh', // 🔥 新增：确保至少填满整个视口
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%)',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}))

// 🔥 欢迎按钮点击处理
const handleWelcomeClick = async () => {
  try {
    console.log('🎮 用户点击开始游戏')

    // 播放欢迎音效
    playSound('welcome')

    // 等待一下让音效播放
    await new Promise(resolve => setTimeout(resolve, 100))

    // 隐藏欢迎界面
    showInitializationOverlay.value = false

    console.log('✅ 游戏界面已激活')
  } catch (error) {
    console.error('❌ 启动游戏失败:', error)
  }
}

// 🔥 重试初始化
const retryInitialization = async () => {
  hasInitializationError.value = false
  initializationError.value = ''
  initializationComplete.value = false
  initializationProgress.value = 0

  await performInitialization()
}

// 🔥 执行初始化
const performInitialization = async () => {
  try {
    console.log('🚀 开始游戏初始化...')

    // 1. 网络服务初始化
    initializationStatus.value = '正在连接服务器...'
    initializationProgress.value = 20

    await initializeNetworkService()

    // 2. Store 初始化
    initializationStatus.value = '正在初始化游戏数据...'
    initializationProgress.value = 50

    await gameStore?.init?.()
    await bettingStore?.init?.()

    // 3. 设置数据监听
    initializationStatus.value = '正在设置数据监听...'
    initializationProgress.value = 70

    setupDataWatchers()

    // 4. 完成初始化
    initializationStatus.value = '初始化完成'
    initializationProgress.value = 100

    // 等待一下再显示欢迎界面
    await new Promise(resolve => setTimeout(resolve, 500))

    initializationComplete.value = true

    console.log('✅ 游戏初始化完成')

  } catch (error) {
    console.error('❌ 初始化失败:', error)
    hasInitializationError.value = true
    initializationError.value = error instanceof Error ? error.message : '未知错误'
  }
}

// 🔥 设置数据监听
const setupDataWatchers = () => {
  // 监听游戏状态变化
  onGameStatusChange((newStatus, oldStatus) => {
    console.log('🎮 游戏状态变化:', oldStatus, '→', newStatus)
    gameStore?.updateGameStatus?.(newStatus)
  })

  // 监听余额变化
  onBalanceChange((newBalance, oldBalance) => {
    console.log('💰 余额变化:', oldBalance, '→', newBalance)
    gameStore?.updateBalance?.(newBalance)
  })

  // 监听倒计时变化
  onCountdownChange((newCountdown, oldCountdown) => {
    console.log('⏰ 倒计时变化:', oldCountdown, '→', newCountdown)
  })

  // 监听游戏局号变化
  onGameNumberChange((newGameNumber, oldGameNumber) => {
    console.log('🎯 游戏局号变化:', oldGameNumber, '→', newGameNumber)
  })
}

// 🔥 修复：窗口大小变化处理
const handleResize = () => {
  viewportHeight.value = getRealViewportHeight()

  nextTick(() => {
    const container = document.querySelector('.game-section') as HTMLElement
    if (container) {
      containerWidth.value = container.offsetWidth
    }
  })

  // 🔥 调试信息
  console.log('📐 屏幕尺寸更新:', {
    viewportHeight: viewportHeight.value,
    containerWidth: containerWidth.value,
    totalHeight: heights.value.total
  })
}

// 防抖处理
let resizeTimer: number | null = null
const debouncedResize = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
  resizeTimer = setTimeout(handleResize, 100)
}

// 监听visualViewport变化（iOS Safari）
const handleVisualViewportChange = () => {
  if (window.visualViewport) {
    viewportHeight.value = window.visualViewport.height
  }
}

// 组件生命周期
onMounted(async () => {
  console.log('🎮 GameSection 组件已挂载')

  try {
    // 🔥 开始初始化
    await performInitialization()

    // 初始化尺寸
    handleResize()

    // 监听事件
    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', debouncedResize)

    // iOS Safari 特殊处理
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange)
    }

    // 监听容器大小变化
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerWidth.value = entry.contentRect.width
        }
      })

      const container = document.querySelector('.game-section')
      if (container) {
        resizeObserver.observe(container)
      }
    }

  } catch (error) {
    console.error('❌ 组件初始化失败:', error)
  }
})

onUnmounted(() => {
  console.log('🎮 GameSection 组件已卸载')

  // 🔥 清理网络服务
  cleanupNetworkService()

  // 清理事件监听
  window.removeEventListener('resize', debouncedResize)
  window.removeEventListener('orientationchange', debouncedResize)

  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
    window.visualViewport.removeEventListener('scroll', handleVisualViewportChange)
  }

  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
})
</script>

<style scoped>
/* 🔥 修复：容器样式，确保完全填满屏幕 */
.game-section {
  width: 100%;
  min-height: 100vh; /* 🔥 确保最小高度为视口高度 */
  background: linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%);
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* 🔥 移除了之前的 padding，避免重复计算 */
  margin: 0;
  padding: 0;

  /* 🔥 确保在各种设备上都能正确显示 */
  box-sizing: border-box;
}

/* 🔥 初始化遮罩 - 确保完全覆盖 */
.initialization-overlay {
  position: fixed; /* 🔥 改为 fixed，确保覆盖整个屏幕 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.init-container {
  text-align: center;
  color: white;
  padding: 40px 20px;
  max-width: 400px;
  width: 100%;
  position: relative;
}

/* 🔥 加载状态 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.loading-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.loading-progress {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #81c784 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 🔥 欢迎界面 */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* 🔥 调整最小高度 */
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 40px 0;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.welcome-button {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.welcome-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.welcome-button:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 🔥 错误状态 */
.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* 🔥 调整最小高度 */
}

.error-content {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #ff6b6b;
}

.error-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 30px 0;
}

.retry-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: linear-gradient(135deg, #ee5a52 0%, #e74c3c 100%);
  transform: translateY(-2px);
}

/* 🔥 游戏主界面 */
.game-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 🔥 确保游戏主界面也能完全填满 */
  min-height: inherit;
}

/* 🔥 移除了之前的安全区域 padding，因为会造成空白 */

/* Safari 特殊样式 */
@supports (-webkit-touch-callout: none) {
  .game-section {
    -webkit-overflow-scrolling: touch;
  }
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 28px;
  }

  .welcome-button {
    padding: 14px 32px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 24px;
  }

  .welcome-button {
    padding: 12px 24px;
    font-size: 14px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .init-container {
    padding: 20px;
  }

  .welcome-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .welcome-section,
  .error-section {
    min-height: 50vh; /* 🔥 横屏时调整高度 */
  }
}

/* 🔥 针对不同设备的特殊处理 */
@media screen and (max-height: 667px) {
  /* iPhone SE/8 等小屏设备 */
  .welcome-section,
  .error-section {
    min-height: 50vh;
  }

  .init-container {
    padding: 20px 15px;
  }
}

/* 🔥 确保在所有情况下都没有底部空白 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>
