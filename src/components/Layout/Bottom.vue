<!-- src/components/Layout/Bottom.vue -->
<template>
  <div class="bottom-section" :style="bottomSectionStyles">
    <!-- 路珠标题栏（可选） -->
    <div class="roadmap-header" v-if="showHeader">
      <div class="header-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
        <span>游戏路珠</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="refreshRoadmap" title="刷新路珠">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        <button class="action-btn" @click="toggleFullscreen" title="全屏查看">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 路珠 iframe 容器 -->
    <div class="roadmap-container">
      <iframe
        ref="roadmapIframe"
        :src="roadmapUrl"
        frameborder="0"
        class="roadmap-iframe"
        title="游戏路珠"
        @load="handleIframeLoad"
        @error="handleIframeError"
      />

      <!-- 加载状态 -->
      <div class="loading-overlay" v-if="isLoading">
        <div class="loading-spinner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" class="spinner"/>
          </svg>
        </div>
        <span class="loading-text">加载路珠中...</span>
      </div>

      <!-- 错误状态 -->
      <div class="error-overlay" v-if="hasError">
        <div class="error-content">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <p class="error-title">路珠加载失败</p>
          <p class="error-message">{{ errorMessage }}</p>
          <button class="retry-btn" @click="retryLoad">重试</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'

// Props
interface Props {
  height: number
  roadmapUrl?: string
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 120,
  roadmapUrl: 'https://example.com/roadmap',
  showHeader: false
})

// Emits
const emit = defineEmits<{
  refresh: []
  fullscreen: []
  iframeLoad: []
  iframeError: [error: string]
}>()

// 响应式数据
const roadmapIframe = ref<HTMLIFrameElement>()
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

// 计算样式
const bottomSectionStyles = computed((): CSSProperties => ({
  height: `${props.height}px`,
  width: '100%',
  position: 'relative',
  background: '#1a1a1a',
  borderRadius: '8px 8px 0 0',
  overflow: 'hidden',
  flexShrink: 0
}))

// 事件处理
const handleIframeLoad = () => {
  console.log('✅ 路珠加载完成')
  isLoading.value = false
  hasError.value = false
  emit('iframeLoad')
}

const handleIframeError = () => {
  console.error('❌ 路珠加载失败')
  isLoading.value = false
  hasError.value = true
  errorMessage.value = '网络连接异常，请检查网络设置'
  emit('iframeError', errorMessage.value)
}

const refreshRoadmap = () => {
  console.log('🔄 刷新路珠')
  isLoading.value = true
  hasError.value = false

  if (roadmapIframe.value) {
    roadmapIframe.value.src = roadmapIframe.value.src
  }

  emit('refresh')
}

const toggleFullscreen = () => {
  console.log('📺 切换全屏')
  emit('fullscreen')
}

const retryLoad = () => {
  console.log('🔄 重试加载路珠')
  refreshRoadmap()
}
</script>

<style scoped>
.bottom-section {
  position: relative;
  background: #1a1a1a;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.roadmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.roadmap-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.roadmap-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.loading-spinner {
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

.spinner {
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.error-content {
  text-align: center;
  max-width: 200px;
}

.error-content svg {
  margin-bottom: 12px;
  color: #ff6b6b;
}

.error-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.error-message {
  margin: 0 0 12px 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.retry-btn {
  padding: 6px 12px;
  background: #40a9ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #1890ff;
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
  .roadmap-header {
    padding: 6px 10px;
  }

  .header-title {
    font-size: 11px;
  }

  .action-btn {
    width: 20px;
    height: 20px;
  }

  .action-btn svg {
    width: 12px;
    height: 12px;
  }
}
</style>
