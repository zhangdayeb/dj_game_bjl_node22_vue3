<!-- src/components/FloatingUI/Countdown.vue -->
<template>
  <div v-show="showCountdown" class="countdown">
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
          />
        </svg>
        <div class="countdown-number">{{ countdown }}</div>
      </div>
      <span class="countdown-label">秒</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  countdown: number
  maxTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  countdown: 0,
  maxTime: 30
})

// Emits
const emit = defineEmits<{
  countdownChange: [value: number]
}>()

// 响应式数据
const circleSize = 36
const strokeWidth = 3
const normalizedRadius = (circleSize - strokeWidth * 2) / 2
const circumference = normalizedRadius * 2 * Math.PI

// 计算属性
const showCountdown = computed(() => props.countdown > 0)

const strokeDashoffset = computed(() => {
  const progress = props.countdown / props.maxTime
  return circumference - progress * circumference
})

// 监听倒计时变化
watch(() => props.countdown, (newValue) => {
  emit('countdownChange', newValue)
}, { immediate: true })
</script>

<style scoped>
.countdown {
  position: absolute;
  top: 55px;
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

.countdown-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-circle {
  position: relative;
  width: 36px;
  height: 36px;
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
  transition: stroke-dashoffset 0.5s ease-in-out;
}

.countdown-number {
  font-size: 14px;
  font-weight: 600;
  color: white;
  position: relative;
  z-index: 1;
}

.countdown-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
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

/* 倒计时颜色变化 */
.countdown-container:has(.countdown-number:is([data-urgent])) .progress-ring-progress {
  stroke: #ff7875;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .countdown {
    top: 48px;
    left: 12px;
    padding: 6px 10px;
  }

  .countdown-circle {
    width: 32px;
    height: 32px;
  }

  .countdown-number {
    font-size: 13px;
  }

  .countdown-label {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .countdown {
    top: 42px;
    left: 10px;
    padding: 5px 8px;
  }

  .countdown-container {
    gap: 6px;
  }

  .countdown-circle {
    width: 28px;
    height: 28px;
  }

  .countdown-number {
    font-size: 12px;
  }
}
</style>
