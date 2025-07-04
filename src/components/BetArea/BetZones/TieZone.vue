<template>
  <div
    class="bet-zone tie-zone second-row-zone"
    :class="{
      'active': hasActiveBet,
      'winning': isWinning,
      'losing': isLosing
    }"
    @click="handleBetClick"
  >
    <div class="zone-header">
      <div class="zone-title">和</div>
      <div class="zone-odds">1:8</div>
    </div>

    <div class="bet-content">
      <!-- 用户自己的投注金额 -->
      <div class="user-bet-info">
        <div class="user-bet-amount" v-if="displayData.userAmount > 0">
          我的投注: ${{ formatAmount(displayData.userAmount) }}
        </div>
      </div>

      <!-- 其他用户信息 - 简化显示 -->
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

    <!-- 用户投注筹码显示 (使用图片) -->
    <div class="chips-container" v-if="displayData.userAmount > 0">
      <div class="chip-stack">
        <img
          v-for="(chip, index) in displayData.chipImages"
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
const ZONE_ID = 'tie'

// 响应式数据
const isWinning = ref(false)
const isLosing = ref(false)
const showWinEffect = ref(false)
const winAmount = ref(0)
const statusMessage = ref('')

// 计算属性
const hasActiveBet = computed(() => {
  return (bettingStore.currentBets[ZONE_ID] || 0) > 0
})

// 获取显示数据（包含用户投注、其他用户数据、筹码图片）- 使用公共方法
const displayData = computed(() => {
  return bettingStore.getBetZoneDisplayData(ZONE_ID)
})

// 方法
const handleBetClick = () => {
  // 无任何限制，直接执行投注
  const result = bettingStore.placeBet(ZONE_ID, bettingStore.selectedChip)

  if (result.success) {
    console.log('和投注成功:', result.amount)
    showStatusMessage(result.message, 'success')

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // 点击动画
    animateClick()
  } else {
    console.log('和投注失败:', result.message)
    showStatusMessage(result.message, 'error')
  }
}

const animateClick = () => {
  const element = document.querySelector('.tie-zone')
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
  }, 3000)
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
/* 第二排主要投注区域样式 - 绿色 */
.second-row-zone {
  position: relative;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border: 3px solid #2ecc71;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  font-size: 14px;
  height: 100%;
}

.second-row-zone:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
  border-color: #58d68d;
}

.second-row-zone.active {
  border-color: #f39c12;
  background: linear-gradient(135deg, #f39c12 0%, #2ecc71 100%);
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.7);
}

.second-row-zone.winning {
  background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
  border-color: #f39c12;
  animation: winPulse 2s ease-in-out infinite;
}

.second-row-zone.losing {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
  border-color: #95a5a6;
  animation: losePulse 1s ease-in-out 3;
}

.second-row-zone.clicked {
  animation: clickPulse 0.2s ease-out;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.zone-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.zone-odds {
  font-size: 12px;
  color: #f1c40f;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.bet-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.user-bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20px;
}

.user-bet-amount {
  font-size: 13px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
}

.other-users-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
}

.user-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.count-icon {
  font-size: 12px;
}

.total-amount {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.money-icon {
  font-size: 12px;
}

.chips-container {
  position: absolute;
  bottom: 8px;
  right: 8px;
  pointer-events: none;
}

.chip-stack {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: -2px;
}

.chip-image {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  font-size: 18px;
  font-weight: bold;
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.bet-status-indicator {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #f39c12;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

/* 动画效果 */
@keyframes winPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(243, 156, 18, 0.8);
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
  .second-row-zone {
    padding: 10px;
    font-size: 12px;
  }

  .zone-title {
    font-size: 18px;
  }

  .zone-odds {
    font-size: 10px;
  }

  .user-bet-amount {
    font-size: 11px;
  }

  .other-users-info {
    font-size: 10px;
  }

  .chip-image {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .second-row-zone {
    padding: 8px;
    font-size: 11px;
  }

  .zone-title {
    font-size: 16px;
  }

  .zone-odds {
    font-size: 9px;
  }

  .user-bet-amount {
    font-size: 10px;
  }

  .other-users-info {
    font-size: 9px;
  }

  .chip-image {
    width: 18px;
    height: 18px;
  }
}
</style>
