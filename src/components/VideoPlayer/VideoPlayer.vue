<template>
  <div class="video-player">
    <!-- 视频容器 -->
    <div class="video-container" :style="containerStyles">
      <iframe
        ref="videoIframe"
        :src="videoUrl"
        frameborder="0"
        allowfullscreen
        scrolling="no"
        class="video-iframe"
        :style="videoStyles"
        @load="onVideoLoad"
        @error="onVideoError"
      />
    </div>

    <!-- 可选的控制按钮 -->
    <div v-if="showControls" class="video-controls">
      <button @click="zoomIn" class="control-btn" :disabled="isMaxZoom">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M15.5,14H20.5L17.5,17L15.5,14M9,3L12,6L15,3H9M20.5,10V8.5L17.5,11.5L20.5,10M4,10L7,7L4,4V10M8,21L12,18L16,21H8M15,12L12,15L9,12H15Z"/>
        </svg>
        <span>放大</span>
      </button>

      <button @click="zoomOut" class="control-btn" :disabled="isMinZoom">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M15.5,14H20.5L17.5,17L15.5,14M9,3L12,6L15,3H9M20.5,10V8.5L17.5,11.5L20.5,10M4,10L7,7L4,4V10M8,21L12,18L16,21H8M15,12L12,15L9,12H15Z"/>
        </svg>
        <span>缩小</span>
      </button>

      <button @click="resetZoom" class="control-btn">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
        </svg>
        <span>重置</span>
      </button>
    </div>

    <!-- 缩放级别指示器 -->
    <div v-if="showZoomIndicator" class="zoom-indicator">
      <span class="zoom-text">{{ Math.round(currentZoom * 100) }}%</span>
    </div>

    <!-- 加载状态指示器 -->
    <div v-if="showLoadingIndicator" class="loading-indicator">
      <div class="loading-spinner"></div>
      <span>视频加载中...</span>
    </div>

    <!-- 错误状态指示器 -->
    <div v-if="hasError" class="error-indicator">
      <div class="error-icon">⚠️</div>
      <span>视频加载失败</span>
      <button @click="reloadVideo" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { CSSProperties } from 'vue'

interface Props {
  videoUrl: string           // 视频地址
  autoZoom?: boolean        // 是否启用自动缩放
  zoomLevel?: number        // 初始缩放级别
  showControls?: boolean    // 是否显示控制按钮
  showZoomIndicator?: boolean // 是否显示缩放指示器
  minZoom?: number          // 最小缩放级别
  maxZoom?: number          // 最大缩放级别
  zoomStep?: number         // 缩放步长
  animationDuration?: number // 动画持续时间(ms)
}

const props = withDefaults(defineProps<Props>(), {
  autoZoom: false,
  zoomLevel: 1.0,
  showControls: true,
  showZoomIndicator: false,
  minZoom: 0.5,
  maxZoom: 2.0,
  zoomStep: 0.2,
  animationDuration: 300
})

// 事件定义
const emit = defineEmits<{
  zoomChange: [zoom: number]
  videoLoad: []
  videoError: []
}>()

// 模板引用
const videoIframe = ref<HTMLIFrameElement>()

// 状态管理
const currentZoom = ref(props.zoomLevel)
const isZooming = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)

// 计算属性
const showLoadingIndicator = computed(() => !isLoaded.value && !hasError.value)

const isMinZoom = computed(() => currentZoom.value <= props.minZoom)
const isMaxZoom = computed(() => currentZoom.value >= props.maxZoom)

// 容器样式
const containerStyles = computed((): CSSProperties => ({
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  height: '100%'
}))

// 视频样式
const videoStyles = computed((): CSSProperties => ({
  transform: `scale(${currentZoom.value})`,
  transition: isZooming.value ? `transform ${props.animationDuration}ms ease-in-out` : 'none',
  transformOrigin: 'center center'
}))

// 缩放方法
const setZoom = (newZoom: number, animate = true) => {
  // 限制缩放范围
  const clampedZoom = Math.max(props.minZoom, Math.min(props.maxZoom, newZoom))

  if (clampedZoom === currentZoom.value) {
    return
  }

  console.log(`🔍 设置缩放级别: ${clampedZoom}`)

  if (animate) {
    isZooming.value = true

    // 动画结束后关闭动画状态
    setTimeout(() => {
      isZooming.value = false
    }, props.animationDuration)
  }

  currentZoom.value = clampedZoom
  emit('zoomChange', clampedZoom)
}

// 放大
const zoomIn = () => {
  const newZoom = currentZoom.value + props.zoomStep
  setZoom(newZoom, true)
}

// 缩小
const zoomOut = () => {
  const newZoom = currentZoom.value - props.zoomStep
  setZoom(newZoom, true)
}

// 重置缩放
const resetZoom = () => {
  setZoom(1.0, true)
}

// 获取当前缩放级别
const getCurrentZoom = () => {
  return currentZoom.value
}

// 渐进缩放（用于动画效果）
const animateZoom = (targetZoom: number, duration = 1000) => {
  const startZoom = currentZoom.value
  const zoomDiff = targetZoom - startZoom
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用 easeInOutQuad 缓动函数
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    const newZoom = startZoom + (zoomDiff * easedProgress)
    setZoom(newZoom, false)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// 视频加载事件
const onVideoLoad = () => {
  console.log('✅ 视频加载完成')
  isLoaded.value = true
  hasError.value = false
  emit('videoLoad')
}

// 视频错误事件
const onVideoError = () => {
  console.error('❌ 视频加载失败')
  isLoaded.value = false
  hasError.value = true
  emit('videoError')
}

// 重新加载视频
const reloadVideo = () => {
  console.log('🔄 重新加载视频')
  hasError.value = false
  isLoaded.value = false

  if (videoIframe.value) {
    const currentSrc = videoIframe.value.src
    videoIframe.value.src = ''
    setTimeout(() => {
      if (videoIframe.value) {
        videoIframe.value.src = currentSrc
      }
    }, 100)
  }
}

// 监听 zoomLevel prop 变化
watch(() => props.zoomLevel, (newZoom) => {
  if (newZoom !== currentZoom.value) {
    setZoom(newZoom, true)
  }
})

// 监听 videoUrl 变化
watch(() => props.videoUrl, () => {
  hasError.value = false
  isLoaded.value = false
})

// 组件挂载时初始化
onMounted(() => {
  console.log('🎬 VideoPlayer 组件已挂载')
  console.log('📺 视频地址:', props.videoUrl)
  console.log('🔍 初始缩放:', currentZoom.value)
})

// 暴露方法给父组件
defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  setZoom,
  getCurrentZoom,
  animateZoom,
  reloadVideo
})
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
  border-radius: 8px;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
  display: block;
}

.video-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 20;
}

.control-btn {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.95);
  transform: translateY(-1px);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn span {
  font-size: 11px;
  font-weight: 500;
}

.zoom-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 20;
}

.zoom-text {
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 14px;
  z-index: 15;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 14px;
  z-index: 15;
  background: rgba(220, 53, 69, 0.8);
  padding: 20px;
  border-radius: 8px;
}

.error-icon {
  font-size: 24px;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-controls {
    top: 5px;
    right: 5px;
    gap: 4px;
  }

  .control-btn {
    padding: 6px 8px;
    font-size: 10px;
    min-width: 50px;
  }

  .control-btn span {
    font-size: 10px;
  }

  .zoom-indicator {
    top: 5px;
    left: 5px;
    padding: 4px 8px;
    font-size: 10px;
  }

  .loading-indicator,
  .error-indicator {
    font-size: 12px;
    padding: 15px;
  }
}

/* 防止缩放时出现滚动条 */
.video-container::-webkit-scrollbar {
  display: none;
}

.video-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
