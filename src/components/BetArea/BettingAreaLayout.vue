<template>
  <div class="betting-area-layout">
    <!-- 主要投注区域 -->
    <div class="main-betting-zones">
      <!-- 第一排：龙7、庄对、幸运6、闲对、熊8 -->
      <div class="betting-row first-row">
        <Dragon7Zone class="zone-item side-bet" />
        <BankerPairZone class="zone-item side-bet" />
        <Lucky6Zone class="zone-item side-bet" />
        <PlayerPairZone class="zone-item side-bet" />
        <Panda8Zone class="zone-item side-bet" />
      </div>

      <!-- 第二排：庄、和、闲 -->
      <div class="betting-row second-row">
        <BankerZone class="zone-item main-bet" />
        <TieZone class="zone-item main-bet" />
        <PlayerZone class="zone-item main-bet" />
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
import { computed } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import { useGameStore } from '@/stores/gameStore'
import BankerPairZone from './BetZones/BankerPairZone.vue'
import BankerZone from './BetZones/BankerZone.vue'
import TieZone from './BetZones/TieZone.vue'
import PlayerZone from './BetZones/PlayerZone.vue'
import PlayerPairZone from './BetZones/PlayerPairZone.vue'
import Dragon7Zone from './BetZones/Dragon7Zone.vue'
import Lucky6Zone from './BetZones/Lucky6Zone.vue'
import Panda8Zone from './BetZones/Panda8Zone.vue'

const bettingStore = useBettingStore()
const gameStore = useGameStore()

// 计算属性 - 关联真实数据
const totalBetAmount = computed(() => bettingStore.totalBetAmount)
const balance = computed((): number => gameStore.balance || 0)
const selectedChip = computed((): number => bettingStore.selectedChip)
const lastBets = computed((): Record<string, number> => bettingStore.lastBets)

// 方法
const formatAmount = (amount: number | undefined | null): string => {
  // 参数验证和默认值处理
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0'
  }
  return amount.toLocaleString()
}

const getZoneName = (zone: string): string => {
  const zoneNames: Record<string, string> = {
    'banker-pair': '庄对',
    'banker': '庄',
    'tie': '和',
    'player': '闲',
    'player-pair': '闲对',
    'dragon7': '龙7',
    'lucky6': '幸运6',
    'panda8': '熊8'
  }
  return zoneNames[zone] || zone
}

const quickBet = (zone: string, amount: number): void => {
  // 检查游戏状态是否允许投注
  if (gameStore.gameState?.status === 'betting' || gameStore.gameState?.status === 'waiting') {
    bettingStore.placeBet(zone, amount)
  }
}
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

.main-betting-zones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.betting-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  justify-content: center;
}

/* 第一排：边注区域 */
.first-row {
  margin-bottom: 8px;
}

.first-row .zone-item {
  flex: 1;
  min-width: 60px;
  max-width: 80px;
  height: 60px;
}

/* 第二排：主要投注区域 */
.second-row .zone-item {
  flex: 1;
  min-width: 90px;
  max-width: 120px;
  height: 80px;
}

.side-bet {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.main-bet {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.zone-item:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

/* 响应式适配 */
@media (max-width: 768px) {
  .betting-area-layout {
    padding: 12px;
  }

  .main-betting-zones {
    gap: 8px;
  }

  .first-row .zone-item {
    min-width: 50px;
    max-width: 65px;
    height: 50px;
    font-size: 10px;
  }

  .second-row .zone-item {
    min-width: 70px;
    max-width: 90px;
    height: 70px;
    font-size: 14px;
  }

  .betting-stats {
    flex-direction: column;
    gap: 8px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }

  .history-bets {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .betting-row {
    gap: 6px;
  }

  .first-row .zone-item {
    min-width: 45px;
    max-width: 60px;
    height: 45px;
    font-size: 9px;
  }

  .second-row .zone-item {
    min-width: 65px;
    max-width: 80px;
    height: 65px;
    font-size: 13px;
  }
}

/* 投注状态样式 */
.zone-item.active {
  background: rgba(46, 204, 113, 0.3);
  border-color: #2ecc71;
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.5);
}

.zone-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zone-item.winning {
  animation: winningGlow 1s ease-in-out infinite alternate;
}

.zone-item.losing {
  animation: losingFade 0.5s ease-out;
}

@keyframes winningGlow {
  0% {
    box-shadow: 0 0 10px rgba(46, 204, 113, 0.7);
  }
  100% {
    box-shadow: 0 0 25px rgba(46, 204, 113, 1);
  }
}

@keyframes losingFade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}
</style>
