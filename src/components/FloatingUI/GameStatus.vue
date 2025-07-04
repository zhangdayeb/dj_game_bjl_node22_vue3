<!-- src/components/FloatingUI/GameStatus.vue -->
<template>
  <div v-show="showStatus" class="game-status">
    <div class="status-container">
      <div class="status-icon">
        <div class="pulse-dot" :class="statusClass"></div>
      </div>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// Props
interface Props {
  gameStatus: 'waiting' | 'betting' | 'dealing' | 'result'
}

const props = withDefaults(defineProps<Props>(), {
  gameStatus: 'waiting'
})

// 响应式数据
const showStatus = ref(false)
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// 计算属性
const statusText = computed(() => {
  switch (props.gameStatus) {
    case 'betting':
      return '投注中'
    case 'dealing':
      return '开牌中'
    case 'result':
      return '结算中'
    case 'waiting':
      return '等待中'
    default:
      return '等待中'
  }
})

const statusClass = computed(() => {
  switch (props.gameStatus) {
    case 'betting':
      return 'betting'
    case 'dealing':
      return 'dealing'
    case 'result':
      return 'result'
    case 'waiting':
      return 'waiting'
    default:
      return 'waiting'
  }
})

// 监听状态变化
watch(() => props.gameStatus, (newStatus) => {
  // 清除之前的定时器
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
  }

  // 显示状态
  showStatus.value = true

  // 5秒后隐藏
  hideTimer.value = setTimeout(() => {
    showStatus.value = false
  }, 5000)
}, { immediate: true })

// 组件卸载时清理定时器
onUnmounted(() => {
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
  }
})
</script>

<style scoped>
.game-status {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  color: white;
  z-index: 15;
  animation: slideInDown 0.3s ease-out;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.pulse-dot.betting {
  background-color: #52c41a;
  box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
}

.pulse-dot.dealing {
  background-color: #ff7875;
  box-shadow: 0 0 0 0 rgba(255, 120, 117, 0.7);
}

.pulse-dot.result {
  background-color: #40a9ff;
  box-shadow: 0 0 0 0 rgba(64, 169, 255, 0.7);
}

.pulse-dot.waiting {
  background-color: #d9d9d9;
  box-shadow: 0 0 0 0 rgba(217, 217, 217, 0.7);
}

.status-text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 currentColor;
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-status {
    top: 12px;
    left: 12px;
    padding: 6px 10px;
  }

  .status-text {
    font-size: 12px;
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 480px) {
  .game-status {
    top: 10px;
    left: 10px;
    padding: 5px 8px;
  }

  .status-container {
    gap: 6px;
  }

  .status-text {
    font-size: 11px;
  }
}
</style>
