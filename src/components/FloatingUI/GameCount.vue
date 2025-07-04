<!-- src/components/GameInfo/GameCount.vue -->
<template>
  <div class="game-count-container">
    <div class="count-item" :class="{ 'loading': loading }">
      <div class="count-label">庄</div>
      <div class="count-value zhuang">{{ loading ? '-' : statistics.zhuang }}</div>
    </div>

    <div class="count-item" :class="{ 'loading': loading }">
      <div class="count-label">闲</div>
      <div class="count-value xian">{{ loading ? '-' : statistics.xian }}</div>
    </div>

    <div class="count-item" :class="{ 'loading': loading }">
      <div class="count-label">和</div>
      <div class="count-value he">{{ loading ? '-' : statistics.he }}</div>
    </div>

    <div class="count-item total" :class="{ 'loading': loading }">
      <div class="count-label">总数</div>
      <div class="count-value">{{ loading ? '-' : totalCount }}</div>
    </div>

    <!-- 刷新按钮 -->
    <button
      class="refresh-btn"
      @click="refreshStatistics"
      :disabled="loading"
      :title="loading ? '正在加载...' : '刷新统计'"
    >
      <svg
        class="refresh-icon"
        :class="{ 'spinning': loading }"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4c-4.42,0 -7.99,3.58 -7.99,8s3.57,8 7.99,8c3.73,0 6.84,-2.55 7.73,-6h-2.08c-0.82,2.33 -3.04,4 -5.65,4c-3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6c1.66,0 3.14,0.69 4.22,1.78L13,11h7V4L17.65,6.35z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getGlobalApiService } from '@/services/gameApi'
import type { TableStatisticsResponse } from '@/services/gameApi'

// 响应式数据
const loading = ref(false)
const error = ref<string | null>(null)
const statistics = ref<TableStatisticsResponse>({
  zhuang: 0,
  xian: 0,
  he: 0,
  zhuangDui: 0,
  xianDui: 0,
  zhuangXianDui: 0
})

// 计算属性 - 总数
const totalCount = computed(() => {
  return statistics.value.zhuang + statistics.value.xian + statistics.value.he
})

// 刷新统计数据 - 只提供手动刷新接口
const refreshStatistics = async () => {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null

    const apiService = getGlobalApiService()
    const data = await apiService.getCurrentShoeStatistics()

    statistics.value = data
    console.log('📊 统计数据更新:', data)

  } catch (err) {
    console.error('❌ 获取统计数据失败:', err)
    error.value = err instanceof Error ? err.message : '获取统计数据失败'

    // 如果获取失败，保持之前的数据，不重置为0
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化
onMounted(async () => {
  console.log('🎯 GameCount 组件已挂载 - 等待外部统一刷新')

  // 只记录挂载，不自动加载数据
  // 数据会由外部的 3 秒定时器统一刷新
})

// 组件卸载时清理
onUnmounted(() => {
  console.log('🔧 GameCount 组件已卸载')
})

// 暴露方法给父组件
defineExpose({
  refreshStatistics,
  statistics: computed(() => statistics.value),
  loading: computed(() => loading.value),
  totalCount
})
</script>

<style scoped>
.game-count-container {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 20;
  color: white;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 32px;
  transition: all 0.2s ease;
}

.count-item.loading {
  opacity: 0.6;
}

.count-item.total {
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 8px;
  margin-left: 4px;
}

.count-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  line-height: 1;
}

.count-value {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: white;
  min-height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 不同类型的数值颜色 */
.count-value.zhuang {
  color: #ff6b6b; /* 红色 - 庄 */
}

.count-value.xian {
  color: #4ecdc4; /* 青色 - 闲 */
}

.count-value.he {
  color: #45b7d1; /* 蓝色 - 和 */
}

.total .count-value {
  color: #ffd93d; /* 金色 - 总数 */
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  transition: transform 0.2s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
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
  .game-count-container {
    bottom: 8px;
    left: 8px;
    padding: 6px 10px;
    gap: 6px;
  }

  .count-item {
    min-width: 28px;
  }

  .count-label {
    font-size: 9px;
  }

  .count-value {
    font-size: 12px;
  }

  .refresh-btn {
    padding: 3px;
  }

  .refresh-icon {
    width: 12px;
    height: 12px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .game-count-container {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.15);
  }
}

/* 动画效果 */
.count-item:hover {
  transform: scale(1.05);
}

.count-value {
  transition: all 0.3s ease;
}

/* 数值变化时的动画 */
.count-value {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
