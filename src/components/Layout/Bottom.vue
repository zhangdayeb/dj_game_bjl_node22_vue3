<!-- src/components/Layout/Bottom.vue -->
<template>
  <div class="bottom-section" :style="bottomSectionStyles">
    <iframe
      ref="roadmapIframe"
      :src="roadmapUrl"
      frameborder="0"
      class="roadmap-iframe"
      title="游戏路珠"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type CSSProperties } from 'vue'
import { getGameParams } from '@/utils/urlParams'

// Props
interface Props {
  width: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 375
})

// 组件引用
const roadmapIframe = ref<HTMLIFrameElement>()

// 🔥 使用现有的参数解析工具
const gameParams = getGameParams()

// 从环境变量获取路珠基础URL
const getLzBaseUrl = (): string => {
  return import.meta.env.VITE_LZ_URL || 'https://lzh5bjl.oyfeit8.com/zh/bjl_xc_big_678.html'
}

// 计算路珠URL
const roadmapUrl = computed(() => {
  const baseUrl = getLzBaseUrl()
  const timestamp = Date.now()
  return `${baseUrl}?tableId=${gameParams.table_id}&user_id=${gameParams.user_id}&t=${timestamp}`
})

// 计算高度 = 宽度 * 0.35
const calculatedHeight = computed(() => {
  return Math.round(props.width * 0.35)
})

// 计算样式
const bottomSectionStyles = computed((): CSSProperties => ({
  width: `${props.width}px`,
  height: `${calculatedHeight.value}px`,
  position: 'relative',
  background: '#1a1a1a',
  borderRadius: '8px 8px 0 0',
  overflow: 'hidden',
  flexShrink: 0
}))

// 刷新方法
const refresh = (): void => {
  if (roadmapIframe.value) {
    const timestamp = Date.now()
    const baseUrl = getLzBaseUrl()
    const newUrl = `${baseUrl}?tableId=${gameParams.table_id}&user_id=${gameParams.user_id}&t=${timestamp}`
    roadmapIframe.value.src = newUrl
    console.log('🔄 刷新路珠:', newUrl)
  }
}

// 暴露刷新方法给父组件
defineExpose({
  refresh
})

// 组件挂载时的调试信息
onMounted(() => {
  if (import.meta.env.DEV) {
    console.log('🎯 Bottom 组件调试信息:', {
      width: props.width,
      height: calculatedHeight.value,
      tableId: gameParams.table_id,
      userId: gameParams.user_id,
      roadmapUrl: roadmapUrl.value,
      lzBaseUrl: getLzBaseUrl(),
      gameParams
    })
  }
})
</script>

<style scoped>
.bottom-section {
  position: relative;
  background: #1a1a1a;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.roadmap-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bottom-section {
    border-radius: 6px 6px 0 0;
  }
}
</style>
