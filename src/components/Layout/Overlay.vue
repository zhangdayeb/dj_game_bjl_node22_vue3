<!-- src/components/Layout/Overlay.vue -->
<template>
  <div class="overlay-system">
    <!-- 开牌特效 -->
    <transition name="result-fade">
      <ResultEffect
        v-if="showResultEffect"
        :show="showResultEffect"
        :resultData="resultData"
        :autoClose="true"
        :closeDuration="8000"
        @close="handleResultEffectClose"
        @complete="handleResultEffectComplete"
      />
    </transition>

    <!-- 中奖特效 -->
    <transition name="winning-fade">
      <WinningEffect
        v-if="showWinningEffect"
        :show="showWinningEffect"
        :winAmount="winAmount"
        :winType="winType"
        :duration="5000"
        @finished="handleWinningEffectFinished"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useBettingStore } from '@/stores/bettingStore'

// 组件导入
import ResultEffect from '@/components/Effects/ResultEffect.vue'
import WinningEffect from '@/components/Effects/WinningEffect.vue'

// Store 初始化
let gameStore: any = null
let bettingStore: any = null

try {
  gameStore = useGameStore()
  bettingStore = useBettingStore()
} catch (error) {
  console.error('❌ Store 初始化失败:', error)
  // 创建默认对象避免错误
  gameStore = {
    gameState: { status: 'waiting' },
    balance: 10000
  }
  bettingStore = {
    winningFlash: {},
    totalUserBets: 0
  }
}

// 响应式数据
const showResultEffect = ref(false)
const showWinningEffect = ref(false)
const resultData = ref<any>(null)
const winAmount = ref(0)
const winType = ref<'normal' | 'big' | 'super' | 'jackpot'>('normal')

// 计算属性 - 从共享数据中获取显示状态
const shouldShowResultEffect = computed(() => {
  return gameStore?.gameState?.status === 'result'
})

const shouldShowWinningEffect = computed(() => {
  // 检查是否有中奖区域在闪烁
  if (!bettingStore?.winningFlash) return false

  const hasWinning = Object.values(bettingStore.winningFlash).some(
    (isFlashing: any) => isFlashing === true
  )

  return hasWinning && winAmount.value > 0
})

// 监听游戏状态变化 - 触发开牌特效
watch(shouldShowResultEffect, (newVal) => {
  if (newVal) {
    console.log('🎴 触发开牌特效')

    // 模拟开牌结果数据（实际项目中应该从 API 获取）
    resultData.value = {
      result: {
        zhuang_score: Math.floor(Math.random() * 10),
        xian_score: Math.floor(Math.random() * 10)
      },
      info: {
        zhuang: {
          card1: 'h1.png',
          card2: 's5.png',
          card3: 'd3.png'
        },
        xian: {
          card1: 'c7.png',
          card2: 'h9.png'
        }
      },
      pai_flash: ['庄', '庄对'] // 中奖区域
    }

    showResultEffect.value = true
  }
})

// 监听中奖状态变化 - 触发中奖特效
watch(shouldShowWinningEffect, (newVal) => {
  if (newVal) {
    console.log('🎉 触发中奖特效')

    // 计算中奖金额（基于用户投注）
    const totalBets = bettingStore?.totalUserBets || 0
    const calculatedWinAmount = totalBets * 2 // 简单的 2倍赔率计算

    winAmount.value = calculatedWinAmount

    // 根据中奖金额确定特效类型
    if (calculatedWinAmount >= 10000) {
      winType.value = 'jackpot'
    } else if (calculatedWinAmount >= 5000) {
      winType.value = 'super'
    } else if (calculatedWinAmount >= 1000) {
      winType.value = 'big'
    } else {
      winType.value = 'normal'
    }

    showWinningEffect.value = true
  }
})

// 监听余额变化 - 检测中奖
let previousBalance = ref(gameStore?.balance || 0)
watch(() => gameStore?.balance, (newBalance) => {
  if (newBalance > previousBalance.value) {
    const winAmount = newBalance - previousBalance.value
    if (winAmount > 0) {
      console.log('💰 检测到余额增加，触发中奖特效:', winAmount)
      handleWinDetected(winAmount)
    }
  }
  previousBalance.value = newBalance
})

// 方法
const handleWinDetected = (amount: number) => {
  winAmount.value = amount

  // 根据中奖金额确定特效类型
  if (amount >= 10000) {
    winType.value = 'jackpot'
  } else if (amount >= 5000) {
    winType.value = 'super'
  } else if (amount >= 1000) {
    winType.value = 'big'
  } else {
    winType.value = 'normal'
  }

  showWinningEffect.value = true
}

const handleResultEffectClose = () => {
  console.log('🎴 关闭开牌特效')
  showResultEffect.value = false
  resultData.value = null
}

const handleResultEffectComplete = () => {
  console.log('🎴 开牌特效播放完成')

  // 检查是否有中奖，如果有则触发中奖特效
  if (resultData.value?.pai_flash && resultData.value.pai_flash.length > 0) {
    // 延迟一秒后触发中奖特效
    setTimeout(() => {
      const mockWinAmount = 1000 + Math.random() * 5000
      handleWinDetected(mockWinAmount)
    }, 1000)
  }
}

const handleWinningEffectFinished = () => {
  console.log('🎉 中奖特效播放完成')
  showWinningEffect.value = false
  winAmount.value = 0
}

// 🔥 暴露方法给外部调用（用于测试或手动触发）
const triggerResultEffect = (data?: any) => {
  console.log('🎴 手动触发开牌特效')
  resultData.value = data || {
    result: {
      zhuang_score: Math.floor(Math.random() * 10),
      xian_score: Math.floor(Math.random() * 10)
    },
    info: {
      zhuang: {
        card1: 'h1.png',
        card2: 's5.png'
      },
      xian: {
        card1: 'c7.png',
        card2: 'h9.png'
      }
    },
    pai_flash: ['庄']
  }
  showResultEffect.value = true
}

const triggerWinningEffect = (amount: number = 1000, type: 'normal' | 'big' | 'super' | 'jackpot' = 'normal') => {
  console.log('🎉 手动触发中奖特效')
  winAmount.value = amount
  winType.value = type
  showWinningEffect.value = true
}

// 🔥 开发模式下暴露调试方法
if (import.meta.env.DEV) {
  ;(window as any).overlayDebug = {
    triggerResultEffect,
    triggerWinningEffect,
    showResultEffect,
    showWinningEffect,
    resultData,
    winAmount,
    winType
  }
}

// 生命周期
onMounted(() => {
  console.log('🎯 Overlay 组件已挂载')
  if (gameStore?.balance) {
    previousBalance.value = gameStore.balance
  }
})

onUnmounted(() => {
  console.log('🎯 Overlay 组件已卸载')
})
</script>

<style scoped>
.overlay-system {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.overlay-system > * {
  pointer-events: auto;
}

/* 开牌特效过渡动画 */
.result-fade-enter-active {
  transition: all 0.3s ease-out;
}

.result-fade-leave-active {
  transition: all 0.3s ease-in;
}

.result-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.result-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 中奖特效过渡动画 */
.winning-fade-enter-active {
  transition: all 0.5s ease-out;
}

.winning-fade-leave-active {
  transition: all 0.5s ease-in;
}

.winning-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.winning-fade-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .overlay-system {
    /* 移动端适配 */
  }
}
</style>
