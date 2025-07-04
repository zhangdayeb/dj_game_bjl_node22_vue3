<!-- src/components/Layout/Top.vue -->
<template>
  <div class="top-section" :style="topSectionStyles">
    <!-- 视频播放器 -->
    <VideoPlayer
      ref="videoPlayerRef"
      :videoUrl="gameStore.videoUrl || videoUrl"
      :showControls="false"
      :showZoomIndicator="false"
      :autoZoom="true"
      @videoLoad="handleVideoLoad"
      @videoError="handleVideoError"
    />

    <!-- 浮动UI状态层 -->
    <div class="floating-ui-layer">
      <UserBalance
        :balance="gameStore.balance || 10000"
        :currency="'CNY'"
        @refresh="handleBalanceRefresh"
      />
      <RoundNumber
        :roundNumber="gameStore.fullGameNumber || 'B00125010001'"
      />
      <GameStatus
        :gameStatus="gameStore.gameState?.status || 'waiting'"
      />
      <Countdown
        :countdown="gameStore.gameState?.countdown || 0"
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
import { useGameStore } from '@/stores/gameStore'

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

// Store
const gameStore = useGameStore()

// 组件引用
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

// 🔥 内部音频设置状态
const audioSettings = ref({
  bgmEnabled: true,
  sfxEnabled: true
})

// 默认视频URL
const videoUrl = ref('https://example.com/live-stream.m3u8')

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

// 🔥 自动数据同步 - 监听 Store 变化
onMounted(() => {
  console.log('🎮 Top 组件已挂载')
  console.log('📊 当前游戏状态:', gameStore.gameState)
  console.log('💰 当前余额:', gameStore.balance)
  console.log('🎯 当前局号:', gameStore.fullGameNumber)
})

// 🔥 视频相关事件处理
const handleVideoLoad = () => {
  console.log('✅ 视频加载完成')
}

const handleVideoError = () => {
  console.error('❌ 视频加载失败')
}

const handleBalanceRefresh = () => {
  console.log('🔄 刷新余额')
  // 可以调用 gameStore 的刷新余额方法
  try {
    // gameStore.refreshBalance?.()
    console.log('余额刷新请求已发送')
  } catch (error) {
    console.error('余额刷新失败:', error)
  }
}

// 🔥 倒计时处理 - 自动控制视频缩放
const handleCountdownChange = (seconds: number) => {
  console.log(`⏰ 倒计时变化: ${seconds}秒`)

  if (!videoPlayerRef.value) return

  const phase = gameStore.gameState?.status || 'waiting'

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
  // 这里可以调用音频控制API
}

const handleSfxToggle = (enabled: boolean) => {
  audioSettings.value.sfxEnabled = enabled
  console.log(`🔊 音效: ${enabled ? '开启' : '关闭'}`)
  // 这里可以调用音效控制API
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
  videoPlayerRef
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
