<template>
  <div
    class="bet-zone panda8-zone first-row-zone"
    :class="{
      'active': hasActiveBet,
      'winning': isWinning,
      'losing': isLosing
    }"
    @click="handleBetClick"
  >
    <div class="zone-header">
      <div class="zone-title">熊8</div>
      <div class="zone-odds">1:25</div>
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
          :alt="`${chip.value}元筹码`"
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
const ZONE_ID = 'panda-8'

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

// 获取筹码图片 - 使用公共方法
const chipImages = computed(() => {
  return bettingStore.getChipImages(betAmount.value)
})

// 方法
const handleBetClick = () => {
  // 无任何限制，直接执行投注
  const result = bettingStore.placeBet(ZONE_ID, bettingStore.selectedChip)

  if (result.success) {
    console.log('熊8投注成功:', result.amount)
    showStatusMessage(result.message, 'success')

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // 点击动画
    animateClick()
  } else {
    console.log('熊8投注失败:', result.message)
    showStatusMessage(result.message, 'error')
  }
}

const animateClick = () => {
  const element = document.querySelector('.panda8-zone')
  if (element) {
    element.classList.add('clicked')
    setTimeout(() => {
      element.classList.remove('clicked')
    }, 200)
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
/* 第一排边注区域样式 - 更亮的橙红色 */
.first-row-zone {
  position: relative;
  background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%);
  border: 2px solid #f39c12;
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

.first-row-zone:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
  border-color: #f1c40f;
}

.first-row-zone.active {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #e74c3c 0%, #f39c12 100%);
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.6);
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

.first-row-zone.clicked {
  animation: clickPulse 0.2s ease-out;
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
  color: #ffffff;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  width: 16px;
  height: 16px;
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
  color: #ffffff;
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

@keyframes clickPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
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
    width: 14px;
    height: 14px;
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
    width: 12px;
    height: 12px;
  }
}
</style>
