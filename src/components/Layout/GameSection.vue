<template>
  <div class="game-section" :style="sectionStyles">
    <!-- 1. 顶部视频和状态区域 -->
    <TopSection
      :height="heights.video"
      :audioSettings="audioSettings"
      @videoLoad="handleVideoLoad"
      @videoError="handleVideoError"
      @balanceRefresh="handleBalanceRefresh"
      @countdownChange="handleCountdownChange"
      @bgmToggle="handleBgmToggle"
      @sfxToggle="handleSfxToggle"
      @bettingHistory="openBettingHistory"
      @vipCenter="handleVipCenter"
      @customerService="handleCustomerService"
    />

    <!-- 2. 中间投注区域和筹码 -->
    <MiddleSection
      :height="heights.betting"
      @chipSelect="handleChipSelect"
      @undo="handleUndo"
      @repeat="handleRepeat"
      @moreChips="openChipSelector"
    />

    <!-- 3. 底部路珠区域 -->
    <BottomSection
      :height="heights.roadmap"
      :roadmapUrl="roadmapUrl"
      :showHeader="false"
      @refresh="handleRoadmapRefresh"
      @fullscreen="handleRoadmapFullscreen"
      @iframeLoad="handleRoadmapLoad"
      @iframeError="handleRoadmapError"
    />

    <!-- 4. 各种弹出层 -->
    <OverlaySection
      :showResultEffect="showResultEffect"
      :showWinningEffect="showWinningEffect"
      :showBettingHistory="showBettingHistory"
      :showSettings="showSettings"
      :showChipSelector="showChipSelector"
      :showModal="showModal"
      :availableChips="bettingStore?.availableChips || []"
      :selectedChips="bettingStore?.displayChips || []"
      :maxSelection="5"
      :notifications="notifications"
      @resultEffectClose="showResultEffect = false"
      @winningEffectClose="showWinningEffect = false"
      @bettingHistoryClose="showBettingHistory = false"
      @settingsClose="showSettings = false"
      @chipSelectorConfirm="handleChipSelectorConfirm"
      @chipSelectorCancel="closeChipSelector"
      @chipSelectorClose="closeChipSelector"
      @modalClose="showModal = false"
      @notificationDismiss="dismissNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { CSSProperties } from 'vue'

// Store 导入
import { useGameStore } from '@/stores/gameStore'
import { useBettingStore } from '@/stores/bettingStore'

// 拆分后的组件导入
import TopSection from './Top.vue'
import MiddleSection from './Middle.vue'
import BottomSection from './Bottom.vue'
import OverlaySection from './Overlay.vue'

// 通知类型
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

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
    init: () => Promise.resolve()
  }
  bettingStore = {
    selectedChip: 10,
    displayChips: ['chip-10', 'chip-50', 'chip-100'],
    availableChips: [],
    selectChip: () => {},
    updateDisplayChips: () => {},
    undoLastBet: () => {},
    restoreLastRound: () => {},
    init: () => Promise.resolve()
  }
}

// 浏览器检测
const getBrowserInfo = () => {
  const ua = navigator.userAgent.toLowerCase()
  return {
    isSafari: /safari/.test(ua) && !/chrome/.test(ua),
    isiOS: /iphone|ipad|ipod/.test(ua),
    isTelegram: /telegram/.test(ua) || window.TelegramWebApp,
    isChrome: /chrome/.test(ua),
    isiOSSafari: /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua)
  }
}

// 响应式数据
const viewportHeight = ref(window.innerHeight)
const containerWidth = ref(0)
const browserInfo = getBrowserInfo()

// 面板状态
const showSettings = ref(false)
const showBettingHistory = ref(false)
const showResultEffect = ref(false)
const showWinningEffect = ref(false)
const showChipSelector = ref(false)
const showModal = ref(false)

// 音频设置状态
const audioSettings = ref({
  bgmEnabled: true,
  sfxEnabled: true
})

// 路珠URL
const roadmapUrl = ref('https://example.com/roadmap')

// 通知系统
const notifications = ref<Notification[]>([])

// 获取真实视口高度
const getRealViewportHeight = () => {
  if (window.visualViewport) {
    return window.visualViewport.height
  }
  return window.innerHeight || document.documentElement.clientHeight
}

// 高度计算
const calculateHeights = () => {
  const realHeight = getRealViewportHeight()
  const safeMargin = browserInfo.isiOSSafari ? 20 :
                    browserInfo.isTelegram ? 15 :
                    browserInfo.isiOS ? 10 : 5

  return {
    total: realHeight - safeMargin,
    video: 350,
    roadmap: 120,
    betting: Math.max(200, realHeight - 350 - 120 - safeMargin - 20)
  }
}

// 计算属性
const heights = computed(() => calculateHeights())

const sectionStyles = computed((): CSSProperties => ({
  height: `${heights.value.total}px`,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%)',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}))

// 🔥 事件处理方法

// 视频相关事件
const handleVideoLoad = () => {
  console.log('✅ 视频加载完成')
  showNotification('success', '视频已加载', '直播画面加载成功', 2000)
}

const handleVideoError = () => {
  console.error('❌ 视频加载失败')
  showNotification('error', '视频加载失败', '请检查网络连接或刷新页面', 5000)
}

const handleBalanceRefresh = () => {
  console.log('🔄 刷新余额')
  showNotification('info', '刷新余额', '正在获取最新余额信息...', 1500)
}

const handleCountdownChange = (seconds: number) => {
  console.log(`⏰ 倒计时变化: ${seconds}秒`)
  // 这里可以添加倒计时相关的业务逻辑
}

// 音频设置事件
const handleBgmToggle = (enabled: boolean) => {
  audioSettings.value.bgmEnabled = enabled
  console.log(`🎵 背景音乐: ${enabled ? '开启' : '关闭'}`)
  showNotification('info', '背景音乐', `已${enabled ? '开启' : '关闭'}背景音乐`, 1500)
}

const handleSfxToggle = (enabled: boolean) => {
  audioSettings.value.sfxEnabled = enabled
  console.log(`🔊 音效: ${enabled ? '开启' : '关闭'}`)
  showNotification('info', '音效', `已${enabled ? '开启' : '关闭'}音效`, 1500)
}

// 面板控制事件
const openBettingHistory = () => {
  showBettingHistory.value = true
  console.log('📊 打开投注记录')
}

const handleVipCenter = () => {
  console.log('👑 跳转会员中心')
  showNotification('info', '会员中心', '正在跳转到会员中心...', 2000)
}

const handleCustomerService = () => {
  console.log('🎧 联系客服')
  showNotification('info', '客服服务', '正在连接客服，请稍候...', 2000)
}

// 筹码相关事件
const handleChipSelect = (chipValue: number) => {
  console.log(`🎯 选择筹码: ${chipValue}`)
  showNotification('success', '筹码选择', `已选择 ${chipValue} 元筹码`, 1000)
}

const handleUndo = () => {
  console.log('↩️ 执行撤销操作')
  showNotification('info', '撤销操作', '已撤销上一步投注', 1500)
}

const handleRepeat = () => {
  console.log('🔄 执行重复操作')
  showNotification('info', '重复投注', '已恢复上一局投注', 1500)
}

const openChipSelector = () => {
  showChipSelector.value = true
  console.log('📱 打开筹码选择器')
}

const closeChipSelector = () => {
  showChipSelector.value = false
  console.log('🔒 关闭筹码选择器')
}

const handleChipSelectorConfirm = (chipIds: string[]) => {
  try {
    bettingStore?.updateDisplayChips?.(chipIds)
    showChipSelector.value = false
    console.log('✅ 确认筹码选择:', chipIds)
    showNotification('success', '筹码设置', `已更新筹码显示设置`, 2000)
  } catch (error) {
    console.error('❌ 筹码设置失败:', error)
    showNotification('error', '设置失败', '筹码设置更新失败', 3000)
  }
}

// 路珠相关事件
const handleRoadmapRefresh = () => {
  console.log('🔄 刷新路珠')
  showNotification('info', '路珠刷新', '正在刷新路珠数据...', 1500)
}

const handleRoadmapFullscreen = () => {
  console.log('📺 路珠全屏')
  showNotification('info', '全屏查看', '路珠全屏功能开发中...', 2000)
}

const handleRoadmapLoad = () => {
  console.log('✅ 路珠加载完成')
}

const handleRoadmapError = (error: string) => {
  console.error('❌ 路珠加载失败:', error)
  showNotification('error', '路珠加载失败', error, 5000)
}

// 通知系统
const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  duration: number = 3000
) => {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    duration,
    dismissible: true
  }

  notifications.value.push(notification)

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      dismissNotification(notification.id)
    }, duration)
  }
}

const dismissNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 窗口大小变化处理
const handleResize = () => {
  viewportHeight.value = getRealViewportHeight()
  nextTick(() => {
    const container = document.querySelector('.game-section') as HTMLElement
    if (container) {
      containerWidth.value = container.offsetWidth
    }
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
    nextTick(() => {
      const container = document.querySelector('.game-section') as HTMLElement
      if (container) {
        containerWidth.value = container.offsetWidth
      }
    })
  }
}

// 组件生命周期
onMounted(async () => {
  console.log('🎮 GameSection 组件已挂载')

  try {
    // 初始化 Store
    await gameStore?.init?.()
    await bettingStore?.init?.()
    console.log('✅ Store 初始化完成')

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

    // 显示欢迎消息
    showNotification('success', '欢迎回来', '游戏系统已就绪', 3000)

  } catch (error) {
    console.error('❌ 初始化失败:', error)
    showNotification('error', '初始化失败', '系统初始化出现问题，请刷新页面', 5000)
  }
})

onUnmounted(() => {
  console.log('🎮 GameSection 组件已卸载')

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

// 调试信息
if (import.meta.env.DEV) {
  console.log('🔧 GameSection 调试信息:', {
    browserInfo,
    heights: heights.value,
    gameStore: gameStore?.$state,
    bettingStore: {
      selectedChip: bettingStore?.selectedChip,
      displayChips: bettingStore?.displayChips
    }
  })
}
</script>

<style scoped>
.game-section {
  width: 100%;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%);
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 安全区域适配 */
.game-section {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Safari 特殊样式 */
@supports (-webkit-touch-callout: none) {
  .game-section {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
