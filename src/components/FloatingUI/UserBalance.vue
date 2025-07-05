<!-- src/components/FloatingUI/UserBalance.vue - 修复版 -->
<template>
  <div class="user-balance">
    <div class="balance-container">
      <div class="balance-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
        </svg>
      </div>
      <!-- 🔥 修复：移除 balance-label，只保留图标和数值 -->
      <div class="balance-info">
        <div class="balance-value">{{ formattedBalance }}</div>
      </div>
      <div class="refresh-btn" @click="handleRefresh" :class="{ 'refreshing': isRefreshing }">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  balance: number
  currency?: string
}

const props = withDefaults(defineProps<Props>(), {
  balance: 0,
  currency: 'CNY'
})

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const isRefreshing = ref(false)

// 🔥 修复：优化余额格式化逻辑
const formattedBalance = computed(() => {
  const balance = props.balance

  // 🔥 调试：确保有默认值显示
  if (!balance || balance === 0) {
    return '0.00'
  }

  if (balance >= 10000) {
    return `${(balance / 10000).toFixed(1)}万`
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`
  } else {
    return balance.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
})

// 方法
const handleRefresh = async () => {
  if (isRefreshing.value) return

  console.log('🔄 余额刷新按钮被点击')
  isRefreshing.value = true
  emit('refresh')

  // 模拟刷新动画
  setTimeout(() => {
    isRefreshing.value = false
    console.log('✅ 余额刷新完成')
  }, 1500)
}
</script>

<style scoped>
.user-balance {
  position: absolute;
  top: 55px;
  right: 15px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  color: white;
  z-index: 15;
  animation: slideInRight 0.3s ease-out;
  /* 🔥 确保组件始终可见（调试用） */
  display: block !important;
  visibility: visible !important;
}

.balance-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(82, 196, 26, 0.2);
  border-radius: 50%;
  color: #52c41a;
  flex-shrink: 0;
}

.balance-info {
  display: flex;
  flex-direction: column;
  /* 🔥 修复：移除 gap，因为只有一个元素 */
  min-width: 0;
  flex: 1;
}

/* 🔥 移除：删除 balance-label 样式，因为不再需要 */

.balance-value {
  font-size: 13px;
  font-weight: 600;
  color: #52c41a;
  line-height: 1.2;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  /* 🔥 确保文字可见 */
  min-width: max-content;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  /* 🔥 确保按钮可点击 */
  pointer-events: auto;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.05);
}

.refresh-btn:active {
  transform: scale(0.95);
}

.refresh-btn.refreshing {
  animation: spin 1.5s linear infinite;
  pointer-events: none;
}

.refresh-btn.refreshing svg {
  animation: spin 1.5s linear infinite;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-balance {
    top: 48px;
    right: 12px;
    padding: 6px 10px;
  }

  .balance-icon {
    width: 20px;
    height: 20px;
  }

  .balance-icon svg {
    width: 16px;
    height: 16px;
  }

  .balance-value {
    font-size: 12px;
  }

  .refresh-btn {
    width: 22px;
    height: 22px;
  }

  .refresh-btn svg {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .user-balance {
    top: 42px;
    right: 10px;
    padding: 5px 8px;
  }

  .balance-container {
    gap: 6px;
  }

  .balance-icon {
    width: 18px;
    height: 18px;
  }

  .balance-icon svg {
    width: 14px;
    height: 14px;
  }

  .balance-value {
    font-size: 11px;
    letter-spacing: 0.3px;
  }

  .refresh-btn {
    width: 20px;
    height: 20px;
  }

  .refresh-btn svg {
    width: 10px;
    height: 10px;
  }
}
</style>
