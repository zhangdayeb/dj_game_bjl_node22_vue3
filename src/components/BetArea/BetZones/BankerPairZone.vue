<template>
  <div
    class="bet-zone banker-pair-zone first-row-zone"
    :class="{
      'active': hasActiveBet,
      'winning': isWinning,
      'losing': isLosing,
      'blinking': isBlinking
    }"
    @click="handleBetClick"
  >
    <div class="zone-header">
      <div class="zone-title">庄对</div>
      <div class="zone-odds">1:11</div>
    </div>

    <div class="bet-info">
      <div class="bet-amount" v-if="betAmount > 0">
        ${{ formatAmount(betAmount) }}
      </div>
      <div class="no-bet-placeholder" v-else>
        -
      </div>
    </div>

    <!-- 投注筹码显示 -->
    <div class="chips-container" v-if="betAmount > 0">
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

const bettingStore = useBettingStore()

// 投注区域ID
const ZONE_ID = 'banker-pair'

// 响应式数据
const isWinning = ref(false)
const isLosing = ref(false)
const showWinEffect = ref(false)
const winAmount = ref(0)
const statusMessage = ref('')

// 计算属性
const betAmount = computed(() => {
  return bettingStore.currentBets[ZONE_ID] || 0
})

const hasActiveBet = computed(() => {
  return betAmount.value > 0
})

// 🔥 新增：闪烁状态
const isBlinking = computed(() => {
  return bettingStore.isZoneBlinking(ZONE_ID)
})

// 获取筹码图片 - 使用公共方法
const chipImages = computed(() => {
  return bettingStore.getChipImages(betAmount.value)
})

// 方法
const handleBetClick = () => {
  // 无任何限制，直接执行投注
  const result = bettingStore.placeBet(ZONE_ID, bettingStore.selectedChip)

  if (result.success) {
    console.log('庄对投注成功:', result.amount)
    showStatusMessage(result.message, 'success')

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // 简化点击动画
    animateClick()
  } else {
    console.log('庄对投注失败:', result.message)
    showStatusMessage(result.message, 'error')
  }
}

const animateClick = () => {
  const element = document.querySelector('.banker-pair-zone')
  if (element) {
    element.classList.add('clicked')
    setTimeout(() => {
      element.classList.remove('clicked')
    }, 150)
  }
}

// 使用公共格式化方法
const formatAmount = (amount: number | undefined | null): string => {
  return bettingStore.formatAmount(amount)
}

const showStatusMessage = (message: string, type: 'success' | 'error' = 'success') => {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, 2000)
}

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
</script>

<style scoped>
/* 🔥 简化第一排边注区域样式 - 蓝色 */
.first-row-zone {
  position: relative;
  background: linear-gradient(135deg, #1a4d72 0%, #2a5a8a 100%);
  border: 2px solid #3498db;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 12px;
  height: 100%;
}

/* 🔥 简化hover效果 */
.first-row-zone:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
}

/* 🔥 简化active状态 - 移除复杂颜色变化 */
.first-row-zone.active {
  border-color: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.4);
}

.first-row-zone.winning {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-color: #2ecc71;
  animation: winPulse 2s ease-in-out infinite;
}

.first-row-zone.losing {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
  border-color: #95a5a6;
  animation: losePulse 1s ease-in-out 3;
}

/* 🔥 简化点击效果 */
.first-row-zone.clicked {
  animation: clickPulse 0.15s ease-out;
}

/* 🔥 新增：闪烁效果 */
.first-row-zone.blinking {
  animation: blinkEffect 1s ease-in-out infinite;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.zone-title {
  font-size: 13px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.zone-odds {
  font-size: 9px;
  color: #f1c40f;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 18px;
  flex: 1;
}

.bet-amount {
  font-size: 11px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
}

.no-bet-placeholder {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
}

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

.win-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: winEffect 3s ease-out forwards;
}

.win-amount {
  font-size: 12px;
  font-weight: bold;
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
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
  font-size: 10px;
  white-space: nowrap;
  z-index: 100;
}

/* 🔥 闪烁动画 */
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

/* 动画效果 */
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

/* 🔥 简化点击动画 */
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

/* 响应式适配 */
@media (max-width: 768px) {
  .first-row-zone {
    padding: 4px;
    font-size: 11px;
  }

  .zone-title {
    font-size: 11px;
  }

  .zone-odds {
    font-size: 8px;
  }

  .bet-amount {
    font-size: 10px;
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

  .zone-title {
    font-size: 10px;
  }

  .zone-odds {
    font-size: 7px;
  }

  .bet-amount {
    font-size: 9px;
  }

  .chip-image {
    width: 40px;
    height: 40px;
  }
}
</style>
