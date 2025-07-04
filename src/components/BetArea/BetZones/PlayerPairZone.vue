<template>
  <div
    class="bet-zone player-pair-zone"
    :class="{
      'active': hasActiveBet,
      'disabled': isDisabled,
      'winning': isWinning,
      'losing': isLosing
    }"
    @click="handleBetClick"
  >
    <div class="zone-header">
      <div class="zone-title">闲对</div>
      <div class="zone-odds">1:11</div>
    </div>

    <div class="bet-info">
      <div class="bet-amount" v-if="betAmount > 0">
        ${{ formatAmount(betAmount) }}
      </div>
      <div class="player-count" v-if="playerCount > 0">
        <span class="count-icon">👥</span>
        {{ playerCount }}
      </div>
    </div>

    <!-- 筹码显示 -->
    <div class="chips-container" v-if="betAmount > 0">
      <div class="chip-stack">
        <div class="chip" v-for="(chip, index) in displayChips" :key="index">
          {{ chip }}
        </div>
      </div>
    </div>

    <!-- 中奖效果 -->
    <div class="win-effect" v-if="showWinEffect">
      <div class="win-amount">+${{ formatAmount(winAmount) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'

const bettingStore = useBettingStore()

// 投注区域ID
const ZONE_ID = 'player-pair'

// 响应式数据
const isWinning = ref(false)
const isLosing = ref(false)
const showWinEffect = ref(false)
const winAmount = ref(0)
const playerCount = ref(0)

// 计算属性
const betAmount = computed(() => {
  return bettingStore.currentBets[ZONE_ID] || 0
})

const hasActiveBet = computed(() => {
  return betAmount.value > 0
})

const isDisabled = computed(() => {
  return bettingStore.gamePhase !== 'betting' || bettingStore.balance < bettingStore.selectedChip
})

const displayChips = computed((): number[] => {
  if (betAmount.value <= 0) return []

  const chips: number[] = []
  let remaining = betAmount.value
  const chipValues: readonly number[] = [100, 50, 25, 10, 5, 1]

  for (const value of chipValues) {
    while (remaining >= value && chips.length < 5) {
      chips.push(value)
      remaining -= value
    }
  }

  return chips
})

// 方法
const handleBetClick = () => {
  if (isDisabled.value) return

  const success = bettingStore.placeBet(ZONE_ID, bettingStore.selectedChip)
  if (success) {
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // 点击动画
    animateClick()
  }
}

const animateClick = () => {
  const element = document.querySelector('.player-pair-zone')
  if (element) {
    element.classList.add('clicked')
    setTimeout(() => {
      element.classList.remove('clicked')
    }, 200)
  }
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString()
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

// 监听游戏结果
onMounted(() => {
  // 模拟玩家数量变化
  const updatePlayerCount = () => {
    playerCount.value = Math.floor(Math.random() * 18) + 2
  }

  updatePlayerCount()
  const interval = setInterval(updatePlayerCount, 30000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.bet-zone {
  position: relative;
  background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
  border: 2px solid #9b59b6;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.bet-zone:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(155, 89, 182, 0.3);
  border-color: #bb8fce;
}

.bet-zone.active {
  border-color: #f39c12;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
}

.bet-zone.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(30%);
}

.bet-zone.winning {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-color: #2ecc71;
  animation: winPulse 2s ease-in-out infinite;
}

.bet-zone.losing {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
  border-color: #95a5a6;
  animation: losePulse 1s ease-in-out 3;
}

.bet-zone.clicked {
  animation: clickPulse 0.2s ease-out;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.zone-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.zone-odds {
  font-size: 14px;
  color: #f1c40f;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.bet-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bet-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f39c12;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.player-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #bdc3c7;
}

.count-icon {
  font-size: 10px;
}

.chips-container {
  position: absolute;
  bottom: 8px;
  right: 8px;
  pointer-events: none;
}

.chip-stack {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 2px;
}

.chip {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #f39c12 0%, #e67e22 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid #ffffff;
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
  font-size: 20px;
  font-weight: bold;
  color: #2ecc71;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

/* 动画效果 */
@keyframes winPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(46, 204, 113, 0.8);
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
  .bet-zone {
    padding: 8px;
    min-height: 100px;
  }

  .zone-title {
    font-size: 16px;
  }

  .zone-odds {
    font-size: 12px;
  }

  .bet-amount {
    font-size: 14px;
  }
}
</style>
