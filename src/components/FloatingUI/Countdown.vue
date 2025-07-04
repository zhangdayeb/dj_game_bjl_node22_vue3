<!-- src/components/FloatingUI/Countdown.vue - 改进UI版 -->
<template>
  <div v-show="shouldShow" class="countdown">
    <div class="countdown-container">
      <div class="countdown-circle">
        <svg class="progress-ring" :width="circleSize" :height="circleSize">
          <circle
            class="progress-ring-background"
            :stroke-width="strokeWidth"
            :r="normalizedRadius"
            :cx="circleSize / 2"
            :cy="circleSize / 2"
          />
          <circle
            class="progress-ring-progress"
            :stroke-width="strokeWidth"
            :stroke-dasharray="circumference + ' ' + circumference"
            :style="{ strokeDashoffset: strokeDashoffset }"
            :r="normalizedRadius"
            :cx="circleSize / 2"
            :cy="circleSize / 2"
            :class="{ 'urgent': isUrgent }"
          />
        </svg>
        <!-- 🔥 修改：数字居中，去掉"秒"文字 -->
        <div class="countdown-number" :class="{ 'urgent': isUrgent }">{{ displayCountdown }}</div>
      </div>
      <!-- 🔥 移除：不再显示"秒"标签 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  countdown: number
  maxTime?: number
  alwaysShow?: boolean
  debugMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  countdown: 0,
  maxTime: 30,
  alwaysShow: false,
  debugMode: false
})

// Emits
const emit = defineEmits<{
  countdownChange: [value: number]
}>()

// 🔥 调整：增大圆圈尺寸，使其更明显
const circleSize = 50  // 从36增加到50
const strokeWidth = 4  // 从3增加到4
const normalizedRadius = (circleSize - strokeWidth * 2) / 2
const circumference = normalizedRadius * 2 * Math.PI

// 计算属性：显示的倒计时值
const displayCountdown = computed(() => {
  // 调试模式下，如果没有倒计时数据，显示默认值
  if (props.debugMode && props.countdown === 0) {
    return 30
  }
  return props.countdown
})

// 计算属性：是否应该显示组件
const shouldShow = computed(() => {
  if (props.alwaysShow || props.debugMode) {
    return true  // 强制显示或调试模式下始终显示
  }
  return props.countdown > 0  // 原逻辑：有倒计时才显示
})

// 计算属性：是否紧急状态（小于等于10秒）
const isUrgent = computed(() => {
  return displayCountdown.value <= 10 && displayCountdown.value > 0
})

// 计算属性：进度条偏移
const strokeDashoffset = computed(() => {
  const currentValue = displayCountdown.value
  const progress = currentValue / props.maxTime
  return circumference - progress * circumference
})

// 监听倒计时变化
watch(() => props.countdown, (newValue) => {
  console.log(`⏰ 倒计时变化: ${newValue}秒`)
  emit('countdownChange', newValue)
}, { immediate: true })

// 调试信息
watch(() => shouldShow.value, (newValue) => {
  if (props.debugMode) {
    console.log(`🔍 倒计时组件显示状态: ${newValue}`)
  }
})
</script>

<style scoped>
.countdown {
  position: absolute;
  top: 55px;
  left: 15px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 12px;  /* 🔥 增大圆角 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;  /* 🔥 增大内边距 */
  color: white;
  z-index: 15;
  animation: slideInDown 0.3s ease-out;
  display: block !important;
}

.countdown-container {
  display: flex;
  align-items: center;
  justify-content: center;  /* 🔥 居中对齐 */
}

.countdown-circle {
  position: relative;
  width: 50px;   /* 🔥 增大尺寸 */
  height: 50px;  /* 🔥 增大尺寸 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
}

.progress-ring-background {
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-ring-progress {
  fill: transparent;
  stroke: #52c41a;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease;
}

/* 紧急状态样式 */
.progress-ring-progress.urgent {
  stroke: #ff7875;
}

.countdown-number {
  font-size: 18px;      /* 🔥 增大字体 */
  font-weight: 700;     /* 🔥 加粗字体 */
  color: white;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
  /* 🔥 确保数字完全居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 紧急状态数字颜色 */
.countdown-number.urgent {
  color: #ff7875;
  text-shadow: 0 0 8px rgba(255, 120, 117, 0.5);  /* 🔥 添加发光效果 */
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

/* 紧急状态脉动动画 */
.countdown.urgent {
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);  /* 🔥 增大脉动幅度 */
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .countdown {
    top: 48px;
    left: 12px;
    padding: 10px;
  }

  .countdown-circle {
    width: 44px;
    height: 44px;
  }

  .countdown-number {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .countdown {
    top: 42px;
    left: 10px;
    padding: 8px;
  }

  .countdown-circle {
    width: 40px;
    height: 40px;
  }

  .countdown-number {
    font-size: 14px;
  }
}
</style>
