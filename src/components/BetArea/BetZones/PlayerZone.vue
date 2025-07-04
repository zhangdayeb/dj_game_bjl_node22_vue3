<template>
  <div
    class="bet-zone player-zone second-row-zone"
    :class="{
      'active': hasActiveBet,
      'winning': isWinning,
      'losing': isLosing,
      'blinking': isBlinking
    }"
    @click="handleBetClick"
  >
    <div class="zone-header">
      <div class="zone-title">闲</div>
      <div class="zone-odds">1:1</div>
    </div>

    <div class="bet-content">
      <!-- 用户自己的投注金额 -->
      <div class="user-bet-info">
        <div class="user-bet-amount" v-if="displayData.userAmount > 0">
          {{ formatAmount(displayData.userAmount) }}
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
const ZONE_ID = 'player'

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

// 🔥 新增：闪烁状态
const isBlinking = computed(() => {
  return bettingStore.isZoneBlinking(ZONE_ID)
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
    console.log('闲投注成功:', result.amount)
    showStatusMessage(result.message, 'success')

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // 简化点击动画
    animateClick()
  } else {
    console.log('闲投注失败:', result.message)
    showStatusMessage(result.message, 'error')
  }
}

const animateClick = () => {
  const element = document.querySelector('.player-zone')
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
/* 🔥 修复第二排主要投注区域样式 - 蓝色主题 */
.second-row-zone {
  position: relative;
  background: linear-gradient(135deg, #1f4e79 0%, #2980b9 100%);
  border: 2px solid #3498db; /* 🔥 减小边框厚度 */
  border-radius: 10px; /* 🔥 减小圆角 */
  padding: 8px; /* 🔥 减小内边距 */
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3); /* 🔥 减小阴影 */
  font-size: 13px; /* 🔥 减小字体 */
  height: 100%;
  max-width: 100%; /* 🔥 防止超出 */
  box-sizing: border-box; /* 🔥 确保边框计入总宽度 */
}

/* 🔥 简化hover效果 */
.second-row-zone:hover {
  transform: translateY(-1px); /* 🔥 减小移动距离 */
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3); /* 🔥 减弱阴影 */
}

/* 🔥 简化active状态 - 移除过多颜色变化 */
.second-row-zone.active {
  border-color: #f39c12;
  box-shadow: 0 0 12px rgba(243, 156, 18, 0.5); /* 🔥 减弱发光效果 */
}

.second-row-zone.winning {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-color: #2ecc71;
  animation: winPulse 2s ease-in-out infinite;
}

.second-row-zone.losing {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
  border-color: #95a5a6;
  animation: losePulse 1s ease-in-out 3;
}

/* 🔥 简化点击效果 */
.second-row-zone.clicked {
  animation: clickPulse 0.15s ease-out; /* 🔥 减短动画时间 */
}

/* 🔥 新增：闪烁效果 */
.second-row-zone.blinking {
  animation: blinkEffect 1s ease-in-out infinite;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px; /* 🔥 减小间距 */
}

.zone-title {
  font-size: 18px; /* 🔥 减小标题字体 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}

.zone-odds {
  font-size: 11px; /* 🔥 减小赔率字体 */
  color: #f1c40f;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 6px; /* 🔥 减小内边距 */
  border-radius: 6px;
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.bet-content {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 🔥 减小间距 */
  flex: 1;
}

.user-bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 18px; /* 🔥 减小最小高度 */
}

.user-bet-amount {
  font-size: 12px; /* 🔥 减小字体 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 3px 6px; /* 🔥 减小内边距 */
  border-radius: 4px;
}

.other-users-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px; /* 🔥 减小字体 */
  color: rgba(255, 255, 255, 0.9);
}

.user-count {
  display: flex;
  align-items: center;
  gap: 3px; /* 🔥 减小间距 */
}

.count-icon {
  font-size: 11px; /* 🔥 减小图标 */
}

.total-amount {
  display: flex;
  align-items: center;
  gap: 3px; /* 🔥 减小间距 */
  font-weight: 600;
}

.money-icon {
  font-size: 11px; /* 🔥 减小图标 */
}

.chips-container {
  position: absolute;
  bottom: 6px; /* 🔥 调整位置 */
  right: 6px;
  pointer-events: none;
}

.chip-stack {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: -2px;
}

.chip-image {
  width: 20px; /* 🔥 减小筹码图片尺寸 */
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
  font-size: 16px; /* 🔥 减小字体 */
  font-weight: bold;
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.bet-status-indicator {
  position: absolute;
  bottom: -28px; /* 🔥 调整位置 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #f39c12;
  padding: 4px 8px; /* 🔥 减小内边距 */
  border-radius: 4px;
  font-size: 11px; /* 🔥 减小字体 */
  white-space: nowrap;
  z-index: 100;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

/* 🔥 闪烁动画 */
@keyframes blinkEffect {
  0%, 50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    border-color: #ffd700;
  }
  51%, 100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.6);
  }
}

/* 其他动画效果 */
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
    transform: scale(1.02); /* 🔥 减小缩放比例 */
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

/* 🔥 加强响应式适配 */
@media (max-width: 768px) {
  .second-row-zone {
    padding: 6px;
    font-size: 12px;
  }

  .zone-title {
    font-size: 16px;
  }

  .zone-odds {
    font-size: 10px;
    padding: 2px 4px;
  }

  .user-bet-amount {
    font-size: 11px;
  }

  .other-users-info {
    font-size: 9px;
  }

  .chip-image {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .second-row-zone {
    padding: 4px;
    font-size: 11px;
  }

  .zone-title {
    font-size: 14px;
  }

  .zone-odds {
    font-size: 9px;
    padding: 2px 3px;
  }

  .user-bet-amount {
    font-size: 10px;
    padding: 2px 4px;
  }

  .other-users-info {
    font-size: 8px;
  }

  .chip-image {
    width: 16px;
    height: 16px;
  }

  .bet-status-indicator {
    font-size: 10px;
    padding: 3px 6px;
  }
}

/* 🔥 额外的小屏幕适配 */
@media (max-width: 360px) {
  .second-row-zone {
    padding: 3px;
    font-size: 10px;
  }

  .zone-title {
    font-size: 13px;
  }

  .zone-odds {
    font-size: 8px;
  }

  .user-bet-amount {
    font-size: 9px;
  }

  .other-users-info {
    font-size: 8px;
  }

  .chip-image {
    width: 14px;
    height: 14px;
  }
}
</style>
