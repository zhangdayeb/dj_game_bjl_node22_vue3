<!-- src/components/BetArea/BettingAreaLayout.vue -->
<template>
  <div class="betting-area-layout">
    <!-- 主要投注区域 -->
    <div class="main-betting-zones">
      <!-- 第一排：边注区域 -->
      <div class="betting-row first-row">
        <BaseBetZone
          v-for="config in firstRowZones"
          :key="config.id"
          :config="config"
          :ref="(el) => setZoneRef(config.id, el)"
          class="zone-item side-bet"
        />
      </div>

      <!-- 第二排：主要投注区域 -->
      <div class="betting-row second-row">
        <BaseBetZone
          v-for="config in secondRowZones"
          :key="config.id"
          :config="config"
          :ref="(el) => setZoneRef(config.id, el)"
          class="zone-item main-bet"
        />
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
import BaseBetZone from './BaseBetZone.vue'
import { getZonesByCategory, type BetZoneConfig } from '@/configs/betZoneConfigs'

const bettingStore = useBettingStore()
const gameStore = useGameStore()

// 状态提示
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'info'>('info')

// 组件引用管理
const zoneRefs = ref<Record<string, any>>({})

// 🎯 配置驱动的区域列表
const firstRowZones = computed((): BetZoneConfig[] => {
  return getZonesByCategory('first-row')
})

const secondRowZones = computed((): BetZoneConfig[] => {
  return getZonesByCategory('second-row')
})

// 🔧 工具方法
const setZoneRef = (zoneId: string, el: any) => {
  if (el) {
    zoneRefs.value[zoneId] = el
  }
}

const showGlobalMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  statusMessage.value = message
  statusType.value = type

  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// 🏆 游戏结果处理
const handleGameResult = (result: any) => {
  // 根据游戏结果触发相应区域的动画
  const { winningZones, losingZones } = result

  // 播放中奖动画
  winningZones.forEach((zoneId: string) => {
    const zoneRef = zoneRefs.value[zoneId]
    if (zoneRef && zoneRef.showWinAnimation) {
      const winAmount = bettingStore.currentBets[zoneId] * getWinMultiplier(zoneId)
      zoneRef.showWinAnimation(winAmount)
    }
  })

  // 播放输钱动画
  losingZones.forEach((zoneId: string) => {
    const zoneRef = zoneRefs.value[zoneId]
    if (zoneRef && zoneRef.showLoseAnimation) {
      zoneRef.showLoseAnimation()
    }
  })
}

const getWinMultiplier = (zoneId: string): number => {
  // 根据赔率计算倍数 (简化版)
  const oddsMap: Record<string, number> = {
    'dragon-7': 40,
    'banker-pair': 11,
    'lucky-6': 12, // 简化处理
    'player-pair': 11,
    'panda-8': 25,
    'banker': 0.95,
    'tie': 8,
    'player': 1
  }
  return oddsMap[zoneId] || 1
}

// 🎮 游戏状态监听
watch(() => gameStore.gameState.status, (newStatus) => {
  if (newStatus === 'result') {
    // 模拟游戏结果
    setTimeout(() => {
      const mockResult = {
        winningZones: ['player'], // 示例：闲家赢
        losingZones: ['banker', 'tie']
      }
      handleGameResult(mockResult)
    }, 1000)
  }
})

// 🎯 初始化
onMounted(() => {
  // 初始化投注store
  if (bettingStore.init) {
    bettingStore.init()
  }

  showGlobalMessage('欢迎来到百家乐游戏', 'info')
})
</script>

<style scoped>
/* 🎯 布局容器 */
.betting-area-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  container-type: inline-size; /* 🔥 启用容器查询 */
}

.main-betting-zones {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

/* 🎯 行布局 */
.betting-row {
  display: flex;
  gap: 4px;
  overflow: hidden;
}

.first-row {
  flex: 1; /* 🔥 第一排占较少空间 */
  min-height: 50px;
}

.second-row {
  flex: 1; /* 🔥 第二排占主要空间 */
  min-height: 80px;
}

/* 🎯 区域项目 */
.zone-item {
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
  max-width: calc(100% - 4px);
  flex-shrink: 1;
}

.side-bet {
  /* 边注区域特殊样式 */
}

.main-bet {
  /* 主要投注区域特殊样式 */
}

/* 🎯 状态提示 */
.status-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
  border: 1px solid;
}

.status-toast.success {
  border-color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
  backdrop-filter: blur(4px);
}

.status-toast.error {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  backdrop-filter: blur(4px);
}

.status-toast.info {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.1);
  backdrop-filter: blur(4px);
}

/* 🎬 动画 */
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

/* 📱 响应式适配 */
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
    flex: 1;
    min-height: 45px;
  }

  .second-row {
    flex: 1.1;
    min-height: 70px;
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
    flex: 1;
    min-height: 40px;
  }

  .second-row {
    flex: 1.2;
    min-height: 65px;
  }
}

/* 🔧 容器查询 (现代浏览器支持) */
@container (max-width: 400px) {
  .betting-row {
    gap: 2px;
  }

  .zone-item {
    font-size: 10px;
  }
}

@container (max-width: 300px) {
  .betting-row {
    gap: 1px;
  }
}
</style>
