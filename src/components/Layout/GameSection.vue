<template>
  <div class="game-section" :style="sectionStyles">
    <!-- 1. 顶部视频和状态区域 -->
    <TopSection :height="heights.video" />

    <!-- 2. 中间投注区域和筹码 -->
    <MiddleSection :height="heights.betting" />

    <!-- 3. 底部路珠区域 -->
    <BottomSection :width="containerWidth" />

    <!-- 4. 弹出层 - 只包含开牌和中奖特效 -->
    <OverlaySection />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { CSSProperties } from 'vue'

// Store 导入
import { useGameStore } from '@/stores/gameStore'
import { useBettingStore } from '@/stores/bettingStore'

// 组件导入
import TopSection from './Top.vue'
import MiddleSection from './Middle.vue'
import BottomSection from './Bottom.vue'
import OverlaySection from './Overlay.vue'

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

  // 计算各区域高度
  const videoHeight = 350
  const roadmapHeight = Math.round(containerWidth.value * 0.35) // 路珠高度 = 宽度 * 0.35
  const availableHeight = realHeight - safeMargin - 20 // 留出间距
  const bettingHeight = Math.max(200, availableHeight - videoHeight - roadmapHeight)

  return {
    total: availableHeight,
    video: videoHeight,
    roadmap: roadmapHeight,
    betting: bettingHeight
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

// 🔥 简化的窗口大小变化处理
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


  } catch (error) {
    console.error('❌ 初始化失败:', error)
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

/* 响应式设计 */
@media (max-width: 768px) {
  .game-section {
    /* 移动端特定样式 */
  }
}

@media (max-width: 480px) {
  .game-section {
    /* 小屏幕特定样式 */
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .game-section {
    /* 横屏模式特定样式 */
  }
}
</style>
