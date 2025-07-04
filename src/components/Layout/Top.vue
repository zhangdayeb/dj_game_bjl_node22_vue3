<!-- src/components/Layout/Top.vue -->
<template>
  <div class="top-section" :style="topSectionStyles">
    <!-- 视频播放器 -->
    <VideoPlayer
      ref="videoPlayerRef"
      :url="gameStore.videoUrl || videoUrl"
      :showControls="false"
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
import { ref, computed, type CSSProperties } from 'vue'
import { useGameStore } from '@/stores/gameStore'

// 组件导入
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer.vue'
import UserBalance from '@/components/FloatingUI/UserBalance.vue'
import RoundNumber from '@/components/FloatingUI/RoundNumber.vue'
import GameStatus from '@/components/FloatingUI/GameStatus.vue'
import Countdown from '@/components/FloatingUI/Countdown.vue'
import SettingsBtn from '@/components/FloatingUI/SettingsBtn.vue'

// Props
interface Props {
  height: number
  audioSettings: {
    bgmEnabled: boolean
    sfxEnabled: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  height: 350,
  audioSettings: () => ({ bgmEnabled: true, sfxEnabled: true })
})

// Emits
const emit = defineEmits<{
  videoLoad: []
  videoError: []
  balanceRefresh: []
  countdownChange: [seconds: number]
  bgmToggle: [enabled: boolean]
  sfxToggle: [enabled: boolean]
  bettingHistory: []
  vipCenter: []
  customerService: []
}>()

// Store
const gameStore = useGameStore()

// 组件引用
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

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

// 事件处理
const handleVideoLoad = () => {
  console.log('✅ 视频加载完成')
  emit('videoLoad')
}

const handleVideoError = () => {
  console.error('❌ 视频加载失败')
  emit('videoError')
}

const handleBalanceRefresh = () => {
  console.log('🔄 刷新余额')
  emit('balanceRefresh')
}

const handleCountdownChange = (seconds: number) => {
  console.log(`⏰ 倒计时变化: ${seconds}秒`)
  emit('countdownChange', seconds)

  // 根据倒计时控制视频缩放
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

const handleBgmToggle = (enabled: boolean) => {
  console.log(`🎵 背景音乐: ${enabled ? '开启' : '关闭'}`)
  emit('bgmToggle', enabled)
}

const handleSfxToggle = (enabled: boolean) => {
  console.log(`🔊 音效: ${enabled ? '开启' : '关闭'}`)
  emit('sfxToggle', enabled)
}

const handleBettingHistory = () => {
  console.log('📊 打开投注记录')
  emit('bettingHistory')
}

const handleVipCenter = () => {
  console.log('👑 跳转会员中心')
  emit('vipCenter')
}

const handleCustomerService = () => {
  console.log('🎧 联系客服')
  emit('customerService')
}

// 暴露方法给父组件
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
