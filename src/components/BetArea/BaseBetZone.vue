<!-- src/components/BetArea/BetZones/BaseBetZone.vue -->
<template>
  <div
    class="bet-zone"
    :class="zoneClasses"
    :style="zoneStyles"
    @click="handleBetClick"
  >
    <!-- 区域头部 -->
    <div class="zone-header">
      <div class="zone-title">{{ config.title }}</div>
      <div class="zone-odds">{{ config.odds }}</div>
    </div>

    <!-- 边注区域内容 -->
    <div v-if="config.type === 'side'" class="bet-info">
      <div class="bet-amount" v-if="betAmount > 0">
        ${{ formatAmount(betAmount) }}
      </div>
      <div class="no-bet-placeholder" v-else>
        -
      </div>
    </div>

    <!-- 主要投注区域内容 -->
    <div v-else class="bet-content">
      <!-- 用户投注金额 -->
      <div class="user-bet-info">
        <div class="user-bet-amount" v-if="displayData.userAmount > 0">
          {{ formatAmount(displayData.userAmount) }}
        </div>
      </div>

      <!-- 其他用户信息 -->
      <div class="other-users-info">
        <div class="user-count">
          <span class="count-icon">👥</span>
          {{ displayData.otherPlayerCount }}
        </div>
        <div class="total-amount">
          <span class="money-icon">💰</span>
          ${{ formatAmount(displayData.otherTotalAmount) }}
        </div>
      </div>
    </div>

    <!-- 筹码显示 -->
    <div class="chips-container" v-if="shouldShowChips">
      <div class="chip-stack">
        <img
          v-for="(chip, index) in chipImages"
          :key="index"
          :src="chip.image"
          :alt="`${chip.value}筹码`"
          class="chip-image"
          :style="{
            zIndex: index + 1,
            transform: `translateY(-${index * 2}px) translateX(${index * 1}px)`
          }"
        />
      </div>
    </div>

    <!-- 中奖效果 -->
    <div class="win-effect" v-if="showWinEffect">
      <div class="win-amount">+${{ formatAmount(winAmount) }}</div>
    </div>

    <!-- 状态提示 -->
    <div class="bet-status-indicator" v-if="statusMessage">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import type { BetZoneConfig } from '@/configs/betZoneConfigs'
import { THEME_COLORS, LAYOUT_CONFIG } from '@/configs/betZoneConfigs'

// 🔥 内部定义类型，避免导入复杂性
type BaccaratBetType =
  | 'banker' | 'player' | 'tie' | 'banker-pair'
  | 'player-pair' | 'lucky-6' | 'dragon-7' | 'panda-8'

// Props
interface Props {
  config: BetZoneConfig
}

const props = defineProps<Props>()
const bettingStore = useBettingStore()

// 响应式状态
const isWinning = ref(false)
const isLosing = ref(false)
const showWinEffect = ref(false)
const winAmount = ref(0)
const statusMessage = ref('')

// 🎯 核心计算属性
const betAmount = computed(() => {
  return bettingStore.currentBets[props.config.id as BaccaratBetType] || 0
})

const hasActiveBet = computed(() => {
  return betAmount.value > 0
})

const isBlinking = computed(() => {
  return bettingStore.isZoneBlinking?.(props.config.id as BaccaratBetType) || false
})

// 🎨 样式计算
const zoneClasses = computed(() => {
  const layoutClass = LAYOUT_CONFIG[props.config.category].className
  const themeClass = `${props.config.theme}-theme`
  const typeClass = `${props.config.type}-zone`

  return [
    layoutClass,
    themeClass,
    typeClass,
    {
      'active': hasActiveBet.value,
      'winning': isWinning.value,
      'losing': isLosing.value,
      'blinking': isBlinking.value
    }
  ]
})

const zoneStyles = computed(() => {
  const theme = THEME_COLORS[props.config.theme]
  const layout = LAYOUT_CONFIG[props.config.category]

  return {
    background: theme.gradient,
    borderColor: theme.border,
    padding: layout.padding,
    fontSize: layout.fontSize,
    height: layout.height
  }
})

// 🎲 筹码和显示逻辑
const shouldShowChips = computed(() => {
  if (props.config.type === 'side') {
    return betAmount.value > 0
  } else {
    return displayData.value.userAmount > 0
  }
})

const chipImages = computed(() => {
  if (props.config.type === 'side') {
    return bettingStore.getChipImages?.(betAmount.value) || []
  } else {
    return displayData.value.chipImages || []
  }
})

const displayData = computed(() => {
  if (props.config.type === 'main') {
    return bettingStore.getBetZoneDisplayData?.(props.config.id as BaccaratBetType) || {
      userAmount: 0,
      otherPlayerCount: 0,
      otherTotalAmount: 0,
      chipImages: []
    }
  }
  return {
    userAmount: 0,
    otherPlayerCount: 0,
    otherTotalAmount: 0,
    chipImages: []
  }
})

// 🎯 交互方法
const handleBetClick = () => {
  // 🔥 类型安全的投注调用
  try {
    const result = bettingStore.placeBet?.(props.config.id as BaccaratBetType)

    if (result?.success) {
      showStatusMessage(result.message, 'success')

      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      animateClick()
    } else {
      showStatusMessage(result?.message || '投注失败', 'error')
    }
  } catch (error) {
    console.error('投注错误:', error)
    showStatusMessage('投注系统错误', 'error')
  }
}

const animateClick = () => {
  const element = document.querySelector(`.${props.config.theme}-theme`)
  if (element) {
    element.classList.add('clicked')
    setTimeout(() => {
      element.classList.remove('clicked')
    }, 150)
  }
}

const formatAmount = (amount: number | undefined | null): string => {
  return bettingStore.formatAmount?.(amount) || '0'
}

const showStatusMessage = (message: string, type: 'success' | 'error' = 'success') => {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, type === 'success' ? 2000 : 3000)
}

// 🏆 动画方法 (供外部调用)
const showWinAnimation = (amount: number) => {
  winAmount.value = amount
  isWinning.value = true
  showWinEffect.value = true

  setTimeout(() => {
    isWinning.value = false
    showWinEffect.value = false
  }, 3000)
}

const showLoseAnimation = () => {
  isLosing.value = true
  setTimeout(() => {
    isLosing.value = false
  }, 2000)
}

// 暴露方法供父组件调用
defineExpose({
  showWinAnimation,
  showLoseAnimation
})
</script>

<style scoped>
/* 🎯 基础样式 */
.bet-zone {
  position: relative;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid;
  box-sizing: border-box;
}

/* 🎨 布局分类样式 */
.first-row-zone {
  /* 第一排边注区域 */
}

.second-row-zone {
  /* 第二排主要投注区域 */
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
  max-width: 100%;
}

/* 🎯 状态样式 */
.bet-zone:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px var(--theme-hover-color, rgba(0, 0, 0, 0.3));
}

.bet-zone.active {
  border-color: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.4);
}

.bet-zone.winning {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%) !important;
  border-color: #2ecc71 !important;
  animation: winPulse 2s ease-in-out infinite;
}

.bet-zone.losing {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%) !important;
  border-color: #95a5a6 !important;
  animation: losePulse 1s ease-in-out 3;
}

.bet-zone.clicked {
  animation: clickPulse 0.15s ease-out;
}

.bet-zone.blinking {
  animation: blinkEffect 1s ease-in-out infinite;
}

/* 🎯 内容区域样式 */
.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.zone-title {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.zone-odds {
  color: #f1c40f;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid rgba(241, 196, 15, 0.3);
  font-size: 0.8em;
}

/* 边注区域内容 */
.bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 18px;
  flex: 1;
}

.bet-amount {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.no-bet-placeholder {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
}

/* 主要投注区域内容 */
.bet-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.user-bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 18px;
}

.user-bet-amount {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.other-users-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8em;
}

.user-count,
.total-amount {
  display: flex;
  align-items: center;
  gap: 3px;
}

.count-icon,
.money-icon {
  font-size: 0.9em;
}

.total-amount {
  font-weight: 600;
}

/* 🎲 筹码样式 */
.chips-container {
  position: absolute;
  bottom: 4px;
  right: 4px;
  pointer-events: none;
}

.chip-stack {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: -2px;
}

.chip-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

/* 🏆 效果样式 */
.win-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: winEffect 3s ease-out forwards;
}

.win-amount {
  font-weight: bold;
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 1.1em;
}

.bet-status-indicator {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #f39c12;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  white-space: nowrap;
  z-index: 100;
}

/* 🎬 动画定义 */
@keyframes blinkEffect {
  0%, 50% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
    border-color: #ffd700;
  }
  51%, 100% {
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.6);
  }
}

@keyframes winPulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(46, 204, 113, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(46, 204, 113, 0.8);
  }
}

@keyframes losePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
}

@keyframes clickPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes winEffect {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(1.5);
  }
}

/* 📱 响应式适配 */
@media (max-width: 768px) {
  .first-row-zone {
    padding: 4px;
    font-size: 11px;
  }

  .first-row-zone .zone-title {
    font-size: 11px;
  }

  .first-row-zone .zone-odds {
    font-size: 8px;
  }

  .second-row-zone {
    padding: 6px;
    font-size: 12px;
  }

  .second-row-zone .zone-title {
    font-size: 16px;
  }

  .chip-image {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .first-row-zone {
    padding: 3px;
    font-size: 10px;
  }

  .second-row-zone {
    padding: 4px;
    font-size: 11px;
  }

  .second-row-zone .zone-title {
    font-size: 14px;
  }

  .chip-image {
    width: 40px;
    height: 40px;
  }
}
</style>
