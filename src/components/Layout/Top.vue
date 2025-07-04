<!-- src/components/Layout/Top.vue - 修复 TypeScript 错误版本 -->
<template>
  <div class="top-section" :style="topSectionStyles">
    <!-- 视频播放器 -->
    <VideoPlayer
      ref="videoPlayerRef"
      :videoUrl="currentVideoUrl"
      :showControls="false"
      :showZoomIndicator="false"
      :autoZoom="true"
      @videoLoad="handleVideoLoad"
      @videoError="handleVideoError"
    />

    <!-- 浮动UI状态层 -->
    <div class="floating-ui-layer">
      <UserBalance
        :balance="currentBalance"
        :currency="'CNY'"
        @refresh="handleBalanceRefresh"
      />
      <RoundNumber
        :roundNumber="currentGameNumber"
      />
      <GameStatus
        :gameStatus="currentGameStatus"
      />
      <Countdown
        :countdown="currentCountdown"
        :maxTime="30"
        @countdownChange="handleCountdownChange"
      />
      <SettingsBtn
        :initialBgmEnabled="audioSettings.bgmEnabled"
        :initialSfxEnabled="audioSettings.sfxEnabled"
        @bgmToggle="handleBgmToggle"
        @sfxToggle="handleSfxToggle"
        @bettingHistory="handleBettingHistory"
        @vipCenter="handleVipCenter"
        @customerService="handleCustomerService"
      />

      <!-- 🔥 新增：游戏统计组件 - 位于左下角 -->
      <GameCount ref="gameCountRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type CSSProperties } from 'vue'
import { useNetworkService } from '@/services/networkService'

// 组件导入
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer.vue'
import UserBalance from '@/components/FloatingUI/UserBalance.vue'
import RoundNumber from '@/components/FloatingUI/RoundNumber.vue'
import GameStatus from '@/components/FloatingUI/GameStatus.vue'
import Countdown from '@/components/FloatingUI/Countdown.vue'
import SettingsBtn from '@/components/FloatingUI/SettingsBtn.vue'
import GameCount from '@/components/FloatingUI/GameCount.vue' // 🔥 新增统计组件

// Props - 只需要高度
interface Props {
  height: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 350
})

// 🔥 使用网络服务获取真实数据
const {
  gameData,
  networkStatus,
  refreshData,
  toggleMusic,
  toggleSfx,
  registerStatisticsCallback,
  unregisterStatisticsCallback
} = useNetworkService()

// 组件引用
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()
const gameCountRef = ref<InstanceType<typeof GameCount>>() // 🔥 新增统计组件引用

// 🔥 内部音频设置状态
const audioSettings = ref({
  bgmEnabled: true,
  sfxEnabled: true
})

// 计算样式
const topSectionStyles = computed((): CSSProperties => ({
  height: `${props.height}px`,
  width: '100%',
  position: 'relative',
  background: '#000',
  borderRadius: '0 0 8px 8px',
  overflow: 'hidden',
  flexShrink: 0
}))

// 🔥 计算属性 - 从 networkService 获取真实数据
const currentVideoUrl = computed(() => {
  return gameData.videoUrl || 'https://example.com/live-stream.m3u8'
})

const currentBalance = computed(() => {
  return gameData.balance || 1000
})

const currentGameNumber = computed(() => {
  return gameData.gameNumber || 'T00124060610001'
})

const currentGameStatus = computed(() => {
  return gameData.gameStatus || 'waiting'
})

const currentCountdown = computed(() => {
  return gameData.countdown || 0
})

// 🔥 修复：视频事件处理器 - 移除不需要的参数
const handleVideoLoad = () => {
  console.log('🎥 视频加载完成')
}

// 🔥 修复：VideoPlayer 的 videoError 事件不传递参数
const handleVideoError = () => {
  console.error('❌ 视频加载失败')
}

// 余额刷新
const handleBalanceRefresh = async () => {
  try {
    console.log('🔄 刷新数据中...')
    await refreshData()
    console.log('✅ 数据刷新完成')
  } catch (error) {
    console.error('❌ 刷新失败:', error)
  }
}

// 倒计时变化处理
const handleCountdownChange = (newCountdown: number) => {
  console.log(`⏰ 倒计时变化: ${newCountdown}`)
}

// 🔥 修复：视频缩放处理 - 使用正确的 animateZoom 方法
const handleVideoZoom = (zoomLevel: number) => {
  console.log(`🔍 视频缩放: ${zoomLevel}`)

  // 根据游戏状态自动缩放
  switch (currentGameStatus.value) {
    case 'dealing':
      // 开牌时放大 - 使用 animateZoom 方法，传入目标缩放和动画时长
      videoPlayerRef.value?.animateZoom?.(1.5, 1000)

      // 5秒后缩小回正常
      setTimeout(() => {
        videoPlayerRef.value?.resetZoom?.()
      }, 5000)
      break
  }
}

// 🔥 音频设置处理
const handleBgmToggle = (enabled: boolean) => {
  audioSettings.value.bgmEnabled = enabled
  console.log(`🎵 背景音乐: ${enabled ? '开启' : '关闭'}`)
  // 🔥 调用网络服务的音频控制
  try {
    toggleMusic()
  } catch (error) {
    console.error('音频控制失败:', error)
  }
}

const handleSfxToggle = (enabled: boolean) => {
  audioSettings.value.sfxEnabled = enabled
  console.log(`🔊 音效: ${enabled ? '开启' : '关闭'}`)
  // 🔥 调用网络服务的音效控制
  try {
    toggleSfx()
  } catch (error) {
    console.error('音效控制失败:', error)
  }
}

// 🔥 SettingsBtn 事件处理 - 现在 SettingsBtn 内部处理所有面板
const handleBettingHistory = () => {
  console.log('📊 投注记录 - 由 SettingsBtn 内部处理')
  // SettingsBtn 组件内部会处理投注记录面板的显示
}

const handleVipCenter = () => {
  console.log('👑 跳转会员中心')
  // 这里可以实现跳转逻辑
  try {
    // 从URL参数或配置获取会员中心地址
    const vipUrl = '/vip' // 或者从环境变量获取
    window.open(vipUrl, '_blank')
  } catch (error) {
    console.error('跳转会员中心失败:', error)
  }
}

const handleCustomerService = () => {
  console.log('🎧 联系客服')
  // 这里可以实现客服逻辑
  try {
    // 从URL参数或配置获取客服地址
    const serviceUrl = '/customer-service' // 或者从环境变量获取
    window.open(serviceUrl, '_blank')
  } catch (error) {
    console.error('联系客服失败:', error)
  }
}

// 🔥 新增：统计数据刷新方法（由 networkService 的 3 秒定时器调用）
const refreshStatistics = async () => {
  if (gameCountRef.value?.refreshStatistics) {
    await gameCountRef.value.refreshStatistics()
  }
}

// 🔥 新增：获取当前统计数据
const getCurrentStatistics = () => {
  return gameCountRef.value?.statistics || null
}

// 组件挂载时的初始化
onMounted(() => {
  console.log('✅ Top 组件已挂载，包含统计功能')

  // 🔥 注册统计数据刷新回调到 networkService
  if (registerStatisticsCallback && gameCountRef.value?.refreshStatistics) {
    registerStatisticsCallback(async () => {
      if (gameCountRef.value?.refreshStatistics) {
        await gameCountRef.value.refreshStatistics()
      }
    })
    console.log('📊 统计数据刷新回调已注册到 networkService')
  }
})

// 🔥 新增：组件卸载时清理
onUnmounted(() => {
  console.log('🔧 Top 组件卸载，清理统计数据回调')

  // 取消注册统计数据刷新回调
  if (unregisterStatisticsCallback) {
    unregisterStatisticsCallback()
  }
})

// 暴露方法给父组件（如果需要外部控制）
defineExpose({
  videoPlayerRef,
  gameCountRef, // 🔥 暴露统计组件引用
  refreshStatistics, // 🔥 暴露统计刷新方法
  getCurrentStatistics, // 🔥 暴露获取统计数据方法
  // 暴露当前数据状态供调试
  currentVideoUrl,
  currentBalance,
  currentGameNumber,
  currentGameStatus,
  currentCountdown
})
</script>

<style scoped>
.top-section {
  position: relative;
  background: #000;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.floating-ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.floating-ui-layer > * {
  pointer-events: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-section {
    border-radius: 0 0 6px 6px;
  }
}

/* 🔥 确保统计组件在左下角正确显示 */
.floating-ui-layer :deep(.game-count-container) {
  z-index: 20; /* 确保统计组件在其他组件之上 */
}
</style>
