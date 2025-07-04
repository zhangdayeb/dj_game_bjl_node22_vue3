<!-- src/components/FloatingUI/RoundNumber.vue -->
<template>
  <div class="round-number">
    <div class="round-container">
      <div class="round-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <div class="round-info">
        <div class="round-label">局号</div>
        <div class="round-value">{{ formattedRoundNumber }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  roundNumber: string
}

const props = withDefaults(defineProps<Props>(), {
  roundNumber: ''
})

// 计算属性
const formattedRoundNumber = computed(() => {
  if (!props.roundNumber) {
    // 生成默认局号
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hour = now.getHours().toString().padStart(2, '0')
    const minute = now.getMinutes().toString().padStart(2, '0')
    return `T${year}${month}${day}${hour}${minute}001`
  }

  return props.roundNumber
})
</script>

<style scoped>
.round-number {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  color: white;
  z-index: 15;
  animation: slideInRight 0.3s ease-out;
}

.round-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.round-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(24, 144, 255, 0.2);
  border-radius: 50%;
  color: #40a9ff;
  flex-shrink: 0;
}

.round-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.round-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
  white-space: nowrap;
}

.round-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .round-number {
    top: 12px;
    right: 12px;
    padding: 6px 10px;
  }

  .round-icon {
    width: 18px;
    height: 18px;
  }

  .round-icon svg {
    width: 14px;
    height: 14px;
  }

  .round-label {
    font-size: 9px;
  }

  .round-value {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .round-number {
    top: 10px;
    right: 10px;
    padding: 5px 8px;
  }

  .round-container {
    gap: 6px;
  }

  .round-icon {
    width: 16px;
    height: 16px;
  }

  .round-icon svg {
    width: 12px;
    height: 12px;
  }

  .round-label {
    font-size: 8px;
  }

  .round-value {
    font-size: 10px;
    letter-spacing: 0.3px;
  }
}
</style>
