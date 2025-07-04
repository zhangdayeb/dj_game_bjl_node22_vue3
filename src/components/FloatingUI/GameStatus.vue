<!-- src/components/FloatingUI/GameStatus.vue - 修复版 -->
<template>
  <div v-show="shouldShow" class="game-status">
    <div class="status-container">
      <div class="status-icon">
        <div class="pulse-dot" :class="statusClass"></div>
      </div>
      <span class="status-text">{{ displayStatusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// Props
interface Props {
  gameStatus: 'waiting' | 'betting' | 'dealing' | 'result'
  alwaysShow?: boolean  // 🔥 新增：是否始终显示
  debugMode?: boolean   // 🔥 新增：调试模式
  autoHide?: boolean    // 🔥 新增：是否自动隐藏
  hideDelay?: number    // 🔥 新增：自动隐藏延迟时间（秒）
}

const props = withDefaults(defineProps<Props>(), {
  gameStatus: 'waiting',
  alwaysShow: false,    // 🔥 默认不强制显示
  debugMode: false,     // 🔥 默认不开启调试模式
  autoHide: true,       // 🔥 默认开启自动隐藏
  hideDelay: 5          // 🔥 默认5秒后隐藏
})

// 响应式数据
const showStatus = ref(false)
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// 🔥 计算属性：显示的状态文本
const displayStatusText = computed(() => {
  const statusMap = {
    betting: '投注中',
    dealing: '开牌中',
    result: '结算中',
    waiting: '等待中'
  }

  // 调试模式下，确保有显示内容
  if (props.debugMode && !props.gameStatus) {
    return '调试模式'
  }

  return statusMap[props.gameStatus] || '等待中'
})

// 🔥 计算属性：是否应该显示组件
const shouldShow = computed(() => {
  if (props.alwaysShow || props.debugMode) {
    return true  // 强制显示或调试模式下始终显示
  }
  return showStatus.value  // 原逻辑：根据状态变化显示
})

// 🔥 计算属性：状态样式类
const statusClass = computed(() => {
  const currentStatus = props.gameStatus || 'waiting'
  switch (currentStatus) {
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

// 🔥 清除定时器函数
const clearHideTimer = () => {
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
}

// 🔥 设置自动隐藏定时器
const setAutoHide = () => {
  if (!props.autoHide || props.alwaysShow || props.debugMode) {
    return  // 不需要自动隐藏
  }

  clearHideTimer()
  hideTimer.value = setTimeout(() => {
    showStatus.value = false
    if (props.debugMode) {
      console.log('🔍 游戏状态组件自动隐藏')
    }
  }, props.hideDelay * 1000)
}

// 监听状态变化
watch(() => props.gameStatus, (newStatus, oldStatus) => {
  if (props.debugMode) {
    console.log(`🎮 游戏状态变化: ${oldStatus} → ${newStatus}`)
  }

  // 如果是强制显示模式，不需要处理显示逻辑
  if (props.alwaysShow || props.debugMode) {
    return
  }

  // 清除之前的定时器
  clearHideTimer()

  // 显示状态
  showStatus.value = true

  // 设置自动隐藏
  setAutoHide()
}, { immediate: true })

// 🔥 监听显示状态变化（调试用）
watch(() => shouldShow.value, (newValue) => {
  if (props.debugMode) {
    console.log(`🔍 游戏状态组件显示状态: ${newValue}`)
  }
})

// 🔥 初始化显示状态
if (props.alwaysShow || props.debugMode) {
  showStatus.value = true
} else {
  // 正常模式下，立即显示并设置自动隐藏
  showStatus.value = true
  setAutoHide()
}

// 组件卸载时清理定时器
onUnmounted(() => {
  clearHideTimer()
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
  /* 🔥 确保组件可见性 */
  display: block !important;
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
