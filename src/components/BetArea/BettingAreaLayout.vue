<template>
  <div class="betting-area-layout">
    <!-- 投注区域标题 -->
    <div class="betting-header">
      <h2 class="betting-title">投注区域</h2>
      <div class="betting-status">
        <span class="status-indicator" :class="gamePhase">{{ getGamePhaseText() }}</span>
        <span class="countdown" v-if="countdown > 0">{{ countdown }}s</span>
      </div>
    </div>

    <!-- 主要投注区域 -->
    <div class="main-betting-zones">
      <!-- 第一排：庄对、庄、和、闲、闲对 -->
      <div class="betting-row main-row">
        <BankerPairZone class="zone-item" />
        <BankerZone class="zone-item banker-main" />
        <TieZone class="zone-item tie-main" />
        <PlayerZone class="zone-item player-main" />
        <PlayerPairZone class="zone-item" />
      </div>

      <!-- 第二排：边注区域 -->
      <div class="betting-row side-bets-row">
        <Dragon7Zone class="zone-item side-bet" />
        <Lucky6Zone class="zone-item side-bet" />
        <Panda8Zone class="zone-item side-bet" />
      </div>
    </div>

    <!-- 投注统计信息 -->
    <div class="betting-stats">
      <div class="stat-item">
        <span class="stat-label">总投注</span>
        <span class="stat-value">${{ formatAmount(totalBetAmount) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">余额</span>
        <span class="stat-value">${{ formatAmount(balance) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">选中筹码</span>
        <span class="stat-value">${{ selectedChip }}</span>
      </div>
    </div>

    <!-- 投注历史快捷按钮 -->
    <div class="betting-history-quick" v-if="lastBets && Object.keys(lastBets).length > 0">
      <div class="history-title">上轮投注</div>
      <div class="history-bets">
        <div
          v-for="(amount, zone) in lastBets"
          :key="zone"
          class="history-bet-item"
          @click="quickBet(String(zone), Number(amount))"
        >
          <span class="bet-zone-name">{{ getZoneName(String(zone)) }}</span>
          <span class="bet-amount">${{ formatAmount(Number(amount)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import BankerPairZone from './BetZones/BankerPairZone.vue'
import BankerZone from './BetZones/BankerZone.vue'
import TieZone from './BetZones/TieZone.vue'
import PlayerZone from './BetZones/PlayerZone.vue'
import PlayerPairZone from './BetZones/PlayerPairZone.vue'
import Dragon7Zone from './BetZones/Dragon7Zone.vue'
import Lucky6Zone from './BetZones/Lucky6Zone.vue'
import Panda8Zone from './BetZones/Panda8Zone.vue'

const bettingStore = useBettingStore()

// 响应式数据
const countdown = ref(30)
const gamePhase = ref<'waiting' | 'betting' | 'dealing' | 'result'>('betting')

// 计算属性
const totalBetAmount = computed(() => bettingStore.totalBetAmount)

const balance = computed((): number => bettingStore.balance)
const selectedChip = computed((): number => bettingStore.selectedChip)
const lastBets = computed((): Record<string, number> => bettingStore.lastBets)

// 方法
const formatAmount = (amount: number): string => {
  return amount.toLocaleString()
}

const getGamePhaseText = (): string => {
  switch (gamePhase.value) {
    case 'waiting':
      return '等待开始'
    case 'betting':
      return '投注中'
    case 'dealing':
      return '开牌中'
    case 'result':
      return '结果公布'
    default:
      return '未知状态'
  }
}

const getZoneName = (zone: string): string => {
  const zoneNames: Record<string, string> = {
    'banker-pair': '庄对',
    'banker': '庄',
    'tie': '和',
    'player': '闲',
    'player-pair': '闲对',
    'dragon7': '超级7',
    'lucky6': '幸运6',
    'panda8': '庄对'
  }
  return zoneNames[zone] || zone
}

const quickBet = (zone: string, amount: number): void => {
  if (gamePhase.value === 'betting') {
    bettingStore.placeBet(zone, amount)
  }
}

// 游戏状态循环
onMounted(() => {
  const gameLoop = () => {
    // 投注阶段
    gamePhase.value = 'betting'
    countdown.value = 30

    const bettingInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(bettingInterval)

        // 开牌阶段
        gamePhase.value = 'dealing'
        countdown.value = 0

        setTimeout(() => {
          // 结果阶段
          gamePhase.value = 'result'

          setTimeout(() => {
            // 等待阶段
            gamePhase.value = 'waiting'

            setTimeout(() => {
              gameLoop() // 重新开始循环
            }, 3000)
          }, 5000)
        }, 3000)
      }
    }, 1000)
  }

  gameLoop()
})
</script>

<style scoped>
.betting-area-layout {
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.betting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.betting-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.betting-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  min-width: 80px;
}

.status-indicator.waiting {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
  color: #ffffff;
}

.status-indicator.betting {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: #ffffff;
  animation: bettingPulse 2s ease-in-out infinite;
}

.status-indicator.dealing {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: #ffffff;
}

.status-indicator.result {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: #ffffff;
}

.countdown {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  min-width: 40px;
  text-align: center;
}

.main-betting-zones {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.betting-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.main-row {
  justify-content: center;
}

.side-bets-row {
  justify-content: center;
}

.zone-item {
  flex: 1;
  min-width: 120px;
  max-width: 180px;
}

.banker-main, .player-main {
  flex: 1.5;
}

.tie-main {
  flex: 1.2;
}

.side-bet {
  flex: 1;
  max-width: 140px;
}

.betting-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #f39c12;
  font-family: 'Courier New', monospace;
}

.betting-history-quick {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.history-bets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-bet-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.history-bet-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.bet-zone-name {
  color: #ffffff;
  font-weight: 500;
}

.bet-amount {
  color: #f39c12;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* 动画效果 */
@keyframes bettingPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.8);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .betting-area-layout {
    padding: 12px;
  }

  .betting-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .betting-title {
    font-size: 20px;
  }

  .betting-row {
    flex-direction: column;
    gap: 6px;
  }

  .main-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .side-bets-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .zone-item {
    min-width: unset;
    max-width: unset;
  }

  .betting-stats {
    flex-direction: column;
    gap: 8px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .main-row {
    grid-template-columns: 1fr;
  }

  .side-bets-row {
    grid-template-columns: 1fr;
  }

  .history-bets {
    flex-direction: column;
  }
}
</style>
