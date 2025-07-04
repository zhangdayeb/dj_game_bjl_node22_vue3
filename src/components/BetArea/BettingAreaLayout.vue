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
  padding: 8px; /* 🔥 进一步减少padding，确保更多空间给内容 */
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  height: 100%;
  width: 100%; /* 🔥 确保占满父容器宽度 */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden; /* 🔥 防止内容溢出 */
}

.main-betting-zones {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 🔥 进一步减少gap，节省更多空间 */
  flex: 1;
  height: 100%;
  width: 100%; /* 🔥 确保占满宽度 */
  justify-content: space-between;
  min-height: 0;
  box-sizing: border-box;
}

.betting-row {
  display: flex;
  gap: 4px; /* 🔥 减少横向间距，确保右侧不被截断 */
  align-items: stretch;
  justify-content: space-between; /* 🔥 改为space-between，确保充分利用宽度 */
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
}

/* 🔥 重新平衡第一排和第二排的比例 */
.first-row {
  flex: 0.55; /* 🔥 适度增加第一排空间，从0.45调整到0.55 */
}

.first-row .zone-item {
  flex: 1;
  min-width: 0;
  max-width: none;
  height: 100%;
  min-height: 50px; /* 🔥 恢复合理的最小高度 */
  box-sizing: border-box;
}

/* 🔥 适度减少第二排空间，让比例更平衡 */
.second-row {
  flex: 1; /* 🔥 从1.2调整回1，让比例更协调 */
}

.second-row .zone-item {
  flex: 1;
  min-width: 0; /* 🔥 允许收缩，防止溢出 */
  max-width: none;
  height: 100%;
  min-height: 75px; /* 🔥 调整最小高度，确保内容显示完整但不过大 */
  box-sizing: border-box;
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

/* 🔥 优化响应式适配 */
@media (max-width: 768px) {
  .betting-area-layout {
    padding: 6px;
  }

  .main-betting-zones {
    gap: 3px;
  }

  .betting-row {
    gap: 3px;
  }

  .first-row {
    flex: 0.5; /* 🔥 手机端进一步平衡比例 */
  }

  .first-row .zone-item {
    min-height: 45px;
    font-size: 10px;
  }

  .second-row {
    flex: 1.1; /* 🔥 手机端给第二排稍多一点空间 */
  }

  .second-row .zone-item {
    min-height: 70px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .betting-area-layout {
    padding: 4px;
  }

  .main-betting-zones {
    gap: 2px;
  }

  .betting-row {
    gap: 2px;
  }

  .first-row {
    flex: 0.45;
  }

  .first-row .zone-item {
    min-height: 40px;
    font-size: 9px;
  }

  .second-row {
    flex: 1.2;
  }

  .second-row .zone-item {
    min-height: 65px;
    font-size: 13px;
  }
}

/* 🔥 确保所有zone-item不会溢出 */
.zone-item {
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 1; /* 🔥 允许收缩以适应容器 */
  max-width: calc(100% - 4px); /* 🔥 确保不超出容器边界 */
}

/* 🔥 针对极小屏幕或容器的额外保护 */
@media (max-width: 360px) {
  .betting-area-layout {
    padding: 2px;
  }

  .main-betting-zones {
    gap: 1px;
  }

  .betting-row {
    gap: 1px;
  }

  .first-row {
    flex: 0.4;
  }

  .second-row {
    flex: 1.3;
  }
}

/* 🔥 确保在父容器较小时也能正常显示 */
@container (max-width: 400px) {
  .betting-row {
    gap: 2px;
  }

  .zone-item {
    font-size: 10px;
  }
}
</style>
