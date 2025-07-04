<!-- src/components/Layout/Top.vue - 修复版 -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type CSSProperties } from 'vue'
import { useNetworkService } from '@/services/networkService'

// 组件导入
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer.vue'
import UserBalance from '@/components/FloatingUI/UserBalance.vue'
import RoundNumber from '@/components/FloatingUI/RoundNumber.vue'
import GameStatus from '@/components/FloatingUI/GameStatus.vue'
import Countdown from '@/components/FloatingUI/Countdown.vue'
import SettingsBtn from '@/components/FloatingUI/SettingsBtn.vue'

// Props - 只需要高度
interface Props {
  height: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 350
})

// 🔥 使用网络服务获取真实数据
const { gameData, networkStatus, refreshData, toggleMusic, toggleSfx } = useNetworkService()

// 组件引用
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

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
  return gameData.balance || 10000
})

const currentGameNumber = computed(() => {
  return gameData.gameNumber || 'B00125010001'
})

const currentGameStatus = computed(() => {
  return gameData.gameStatus || 'waiting'
})

const currentCountdown = computed(() => {
  return gameData.countdown || 0
})

// 🔥 自动数据同步 - 监听 networkService 数据变化
onMounted(() => {
  console.log('🎮 Top 组件已挂载')
  console.log('📊 当前游戏数据:', gameData)
  console.log('💰 当前余额:', gameData.balance)
  console.log('🎯 当前局号:', gameData.gameNumber)
  console.log('🎬 当前视频URL:', gameData.videoUrl)
  console.log('🔗 网络状态:', networkStatus)
})

// 🔥 视频相关事件处理
const handleVideoLoad = () => {
  console.log('✅ 视频加载完成')
  console.log('🎬 加载的视频URL:', currentVideoUrl.value)
}

const handleVideoError = () => {
  console.error('❌ 视频加载失败')
  console.error('🎬 失败的视频URL:', currentVideoUrl.value)
}

const handleBalanceRefresh = () => {
  console.log('🔄 刷新余额')
  // 🔥 调用网络服务的刷新方法
  try {
    refreshData()
    console.log('余额刷新请求已发送')
  } catch (error) {
    console.error('余额刷新失败:', error)
  }
}

// 🔥 倒计时处理 - 自动控制视频缩放
const handleCountdownChange = (seconds: number) => {
  console.log(`⏰ 倒计时变化: ${seconds}秒`)

  if (!videoPlayerRef.value) return

  const phase = currentGameStatus.value

  switch (phase) {
    case 'betting':
      // 投注阶段 - 保持正常大小
      videoPlayerRef.value.resetZoom?.()
      break

    case 'dealing':
      // 开牌阶段 - 根据倒计时放大
      if (seconds <= 10) {
        const zoomLevel = 1 + (10 - seconds) * 0.05
        videoPlayerRef.value.setZoom?.(zoomLevel, true)
      }
      break

    case 'result':
      // 结果阶段 - 最大放大
      videoPlayerRef.value.animateZoom?.(1.5, 1000)

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

// 暴露方法给父组件（如果需要外部控制）
defineExpose({
  videoPlayerRef,
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
</style>
