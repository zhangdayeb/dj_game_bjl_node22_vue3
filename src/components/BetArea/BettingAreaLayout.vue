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

    <!-- 状态提示框 -->
    <div class="status-toast" v-if="statusMessage" :class="statusType">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
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

// 状态提示
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'warning'>('success')

// 显示状态提示
const showStatusMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// 初始化stores
onMounted(() => {
  bettingStore.init()
  if (gameStore.init) {
    gameStore.init()
  }
})

// 计算属性 - 关联真实数据
const totalBetAmount = computed(() => bettingStore.totalBetAmount)
const balance = computed((): number => gameStore.balance || 0)
const selectedChip = computed((): number => bettingStore.selectedChip)
const lastBets = computed((): Record<string, number> => bettingStore.lastBets)

// 游戏状态监听
const gameState = computed(() => gameStore.gameState)
const countdown = computed(() => gameStore.gameState?.countdown || 0)

// 监听倒计时，在倒计时结束前2秒自动发送投注订单
watch(() => countdown.value, (newCountdown) => {
  if (newCountdown === 2 && bettingStore.hasActiveBets) {
    autoConfirmBets()
  }
})

// 自动确认投注订单（倒计时2秒时）
const autoConfirmBets = async () => {
  try {
    if (bettingStore.hasActiveBets) {
      // 这里可以添加向服务器发送投注的API调用
      // await sendBetsToServer(bettingStore.currentBets)

      console.log('✅ 倒计时2秒，投注数据已准备发送')
      showStatusMessage('投注数据已准备发送到服务器', 'success')
    }
  } catch (error) {
    console.error('❌ 自动发送投注订单失败:', error)
    showStatusMessage('自动发送失败，请检查网络', 'error')
  }
}

// 方法
const formatAmount = (amount: number | undefined | null): string => {
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
  const canBet = gameStore.canBet || gameStore.gameState?.status === 'betting'

  if (canBet) {
    const result = bettingStore.placeBet(zone as any, amount)
    if (result.success) {
      console.log(`快速投注成功: ${zone} - ${result.amount}`)
      showStatusMessage(result.message, 'success')
    } else {
      showStatusMessage(result.message, 'error')
    }
  } else {
    showStatusMessage('当前不在投注阶段', 'warning')
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
  position: relative;
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
  justify-content: center;
  width: 100%;
}

/* 第一排：边注区域 - 横向占满 */
.first-row {
  margin-bottom: 8px;
}

.first-row .zone-item {
  flex: 1;
  min-width: 0;
  max-width: none;
  height: 50px;
}

/* 第二排：主要投注区域 - 横向占满 */
.second-row .zone-item {
  flex: 1;
  min-width: 0;
  max-width: none;
  height: 80px;
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

/* 状态提示框 */
.status-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

.status-toast.success {
  background: rgba(46, 204, 113, 0.9);
  color: white;
}

.status-toast.error {
  background: rgba(231, 76, 60, 0.9);
  color: white;
}

.status-toast.warning {
  background: rgba(243, 156, 18, 0.9);
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
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
    height: 45px;
    font-size: 10px;
  }

  .second-row .zone-item {
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
    height: 40px;
    font-size: 9px;
  }

  .second-row .zone-item {
    height: 65px;
    font-size: 13px;
  }
}
</style>
