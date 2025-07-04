<template>
  <div class="game-section" :style="sectionStyles">
    <!-- 顶部视频区域 -->
    <div class="video-section" :style="videoSectionStyles">
      <VideoPlayer
        ref="videoPlayerRef"
        :videoUrl="videoUrl"
        :showControls="false"
        :showZoomIndicator="false"
        :autoZoom="true"
        @zoomChange="handleZoomChange"
        @videoLoad="handleVideoLoad"
        @videoError="handleVideoError"
      />

      <!-- 浮动UI层 -->
      <div class="floating-ui-layer">
        <GameHeader />
        <UserBalance />
        <RoundNumber />
        <GameStatus />
        <Countdown @countdownChange="handleCountdownChange" />
        <SettingsBtn @click="showSettings = true" />
      </div>
    </div>

    <!-- 中间投注区域 -->
    <div class="betting-section" :style="bettingSectionStyles">
      <!-- 使用整合后的投注区域布局 -->
      <BettingAreaLayout />
    </div>

    <!-- 底部路珠区域 -->
    <div class="roadmap-section" :style="roadmapSectionStyles">
      <iframe
        :src="roadmapUrl"
        frameborder="0"
        class="roadmap-iframe"
        title="游戏路珠"
      />
    </div>

    <!-- 覆盖层系统 -->
    <div class="overlay-system">
      <!-- 特效层 -->
      <ResultEffect
        v-if="showResultEffect"
        @close="showResultEffect = false"
      />
      <WinningEffect
        v-if="showWinningEffect"
        @close="showWinningEffect = false"
      />

      <!-- 面板层 -->
      <BettingHistoryModal
        v-if="showBettingHistory"
        @close="showBettingHistory = false"
      />
      <SettingsPanel
        v-if="showSettings"
        @close="showSettings = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { CSSProperties } from 'vue'

// 组件导入
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer.vue'

// 整合后的投注区域布局
import BettingAreaLayout from '@/components/BetArea/BettingAreaLayout.vue'

// 特效组件
import ResultEffect from '@/components/Effects/ResultEffect.vue'
import WinningEffect from '@/components/Effects/WinningEffect.vue'

// 浮动UI组件
import GameHeader from '@/components/FloatingUI/GameHeader.vue'
import UserBalance from '@/components/FloatingUI/UserBalance.vue'
import RoundNumber from '@/components/FloatingUI/RoundNumber.vue'
import GameStatus from '@/components/FloatingUI/GameStatus.vue'
import Countdown from '@/components/FloatingUI/Countdown.vue'
import SettingsBtn from '@/components/FloatingUI/SettingsBtn.vue'

// 面板组件
import BettingHistoryModal from '@/components/Panels/BettingHistory/BettingHistoryModal.vue'
import SettingsPanel from '@/components/Panels/SettingsPanel.vue'
import ChipSelector from '@/components/Panels/ChipSelector.vue'

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

// 组件引用
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

// 面板状态
const showSettings = ref(false)
const showBettingHistory = ref(false)
const showResultEffect = ref(false)
const showWinningEffect = ref(false)

// 视频URL
const videoUrl = ref('https://example.com/live-stream.m3u8')
const roadmapUrl = ref('https://example.com/roadmap')

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

  // 不同浏览器的安全边距
  const safeMargin = browserInfo.isiOSSafari ? 20 :
                    browserInfo.isTelegram ? 15 :
                    browserInfo.isiOS ? 10 : 5

  return {
    total: realHeight - safeMargin,
    video: 350, // 固定视频高度
    roadmap: 120, // 固定路珠高度
    betting: Math.max(200, realHeight - 350 - 120 - safeMargin - 20) // 剩余空间给投注区
  }
}

// 计算样式
const sectionStyles = computed((): CSSProperties => {
  const heights = calculateHeights()
  return {
    height: `${heights.total}px`,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
})

const videoSectionStyles = computed((): CSSProperties => {
  const heights = calculateHeights()
  return {
    height: `${heights.video}px`,
    width: '100%',
    position: 'relative',
    background: '#000',
    borderRadius: '0 0 8px 8px',
    overflow: 'hidden',
    flexShrink: 0
  }
})

const bettingSectionStyles = computed((): CSSProperties => {
  const heights = calculateHeights()
  return {
    height: `${heights.betting}px`,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    flex: 1,
    overflow: 'hidden'
  }
})

const roadmapSectionStyles = computed((): CSSProperties => {
  const heights = calculateHeights()
  return {
    height: `${heights.roadmap}px`,
    width: '100%',
    position: 'relative',
    background: '#1a1a1a',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
    flexShrink: 0
  }
})

// 事件处理
const handleZoomChange = (zoom: number) => {
  console.log('📹 视频缩放变化:', zoom)
}

const handleVideoLoad = () => {
  console.log('✅ 视频加载完成')
}

const handleVideoError = () => {
  console.error('❌ 视频加载失败')
}

// 倒计时控制视频缩放
const handleCountdownChange = (seconds: number, phase: string) => {
  if (!videoPlayerRef.value) return

  console.log(`⏰ 倒计时变化: ${seconds}秒, 阶段: ${phase}`)

  switch (phase) {
    case 'betting':
      // 投注阶段 - 保持正常大小
      videoPlayerRef.value.resetZoom()
      break

    case 'dealing':
      // 开牌阶段 - 根据倒计时放大
      if (seconds <= 10) {
        const zoomLevel = 1 + (10 - seconds) * 0.05 // 逐渐放大
        videoPlayerRef.value.setZoom(zoomLevel, true)
      }
      break

    case 'result':
      // 结果阶段 - 最大放大
      videoPlayerRef.value.animateZoom(1.5, 1000)

      // 5秒后缩小回正常
      setTimeout(() => {
        videoPlayerRef.value?.resetZoom()
      }, 5000)
      break
  }
}

// 容器尺寸更新
const updateContainerSize = () => {
  const container = document.querySelector('.game-section') as HTMLElement
  if (container) {
    containerWidth.value = container.offsetWidth
  }
}

// 窗口大小变化处理
const handleResize = () => {
  viewportHeight.value = getRealViewportHeight()
  nextTick(() => {
    updateContainerSize()
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

// 监听visualViewport变化（主要针对iOS Safari）
const handleVisualViewportChange = () => {
  if (window.visualViewport) {
    viewportHeight.value = window.visualViewport.height
    nextTick(() => {
      updateContainerSize()
    })
  }
}

// 组件生命周期
onMounted(() => {
  console.log('🎮 GameSection 组件已挂载')
  console.log('🔧 浏览器信息:', browserInfo)
  console.log('📺 视频地址:', videoUrl.value)
  console.log('🎯 路珠地址:', roadmapUrl.value)

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
    viewportHeight: viewportHeight.value,
    containerWidth: containerWidth.value
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

.video-section {
  position: relative;
  background: #000;
  border-radius: 0 0 8px 8px;
  overflow: hidden;

  .floating-ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;

    > * {
      pointer-events: auto;
    }
  }
}

.betting-section {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  flex: 1;
  overflow: hidden;
}

.roadmap-section {
  position: relative;
  background: #1a1a1a;
  border-radius: 8px 8px 0 0;
  overflow: hidden;

  .roadmap-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  }
}

.overlay-system {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;

  > * {
    pointer-events: auto;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .betting-section {
    padding: 8px;
  }
}

/* Safari 特殊样式 */
@supports (-webkit-touch-callout: none) {
  .game-section {
    /* iOS Safari 特殊处理 */
    -webkit-overflow-scrolling: touch;
  }
}

/* 安全区域适配 */
.game-section {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>
