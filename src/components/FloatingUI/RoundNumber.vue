<!-- src/components/FloatingUI/RoundNumber.vue - 修复版 -->
<template>
  <div class="round-number">
    <div class="round-container">
      <div class="round-info">
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

// 🔥 修复：改进局号格式化逻辑
const formattedRoundNumber = computed(() => {
  if (!props.roundNumber) {
    // 🔥 修改：按照新的格式生成默认局号
    // 格式：T + tableID + 日期 + 靴号 + 铺号
    const now = new Date()
    const tableId = '1' // 默认桌台ID
    const dateStr = now.getFullYear().toString().slice(-2) +
                    String(now.getMonth() + 1).padStart(2, '0') +
                    String(now.getDate()).padStart(2, '0')
    const xuehao = '001' // 默认靴号
    const puhao = '001' // 默认铺号

    return `T${tableId}${dateStr}${xuehao}${puhao}`
  }

  // 🔥 如果传入的局号格式不正确，进行格式化
  let formattedNumber = props.roundNumber

  // 如果是旧格式 T1_1_1，转换为新格式
  if (formattedNumber.includes('_')) {
    const parts = formattedNumber.split('_')
    if (parts.length === 3) {
      const tableId = parts[0].replace('T', '')
      const now = new Date()
      const dateStr = now.getFullYear().toString().slice(-2) +
                      String(now.getMonth() + 1).padStart(2, '0') +
                      String(now.getDate()).padStart(2, '0')
      const xuehao = String(parts[1]).padStart(3, '0')
      const puhao = String(parts[2]).padStart(3, '0')

      formattedNumber = `T${tableId}${dateStr}${xuehao}${puhao}`
    }
  }

  return formattedNumber
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
  /* 🔥 确保组件始终可见（调试用） */
  display: block !important;
  visibility: visible !important;
}

.round-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.round-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.round-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  /* 🔥 确保文字可见 */
  min-width: max-content;
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

  .round-value {
    font-size: 10px;
    letter-spacing: 0.3px;
  }
}
</style>
