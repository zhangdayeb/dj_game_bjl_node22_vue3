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
