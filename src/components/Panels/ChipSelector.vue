<!-- src/components/Panels/ChipSelector.vue -->
<template>
  <div class="chip-selector-overlay" @click="handleOverlayClick">
    <div class="chip-selector-panel" @click.stop>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 class="header-title">筹码选择</h3>
        </div>
        <button class="close-btn" @click="handleCancel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 说明文字 -->
      <div class="panel-description">
        <p>选择要在投注区域显示的筹码（最多{{ maxSelection }}个）</p>
      </div>

      <!-- 筹码网格 -->
      <div class="chip-grid">
        <div
          v-for="chip in availableChips"
          :key="chip.id"
          class="chip-item"
          :class="{
            'selected': localSelectedChips.includes(chip.id),
            'disabled': !localSelectedChips.includes(chip.id) && localSelectedChips.length >= maxSelection
          }"
          @click="handleChipToggle(chip)"
        >
          <div class="chip-image-container">
            <img
              :src="chip.image"
              :alt="chip.name"
              class="chip-image"
              @error="handleImageError"
            />
            <div class="chip-overlay">
              <!-- 选中状态 -->
              <div class="chip-checkmark" v-if="localSelectedChips.includes(chip.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <!-- 禁用状态 -->
              <div class="chip-disabled-mask" v-else-if="!localSelectedChips.includes(chip.id) && localSelectedChips.length >= maxSelection">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="chip-info">
            <span class="chip-value">{{ chip.displayValue }}</span>
            <span class="chip-name">{{ chip.name }}</span>
          </div>
        </div>
      </div>

      <!-- 选择状态显示 -->
      <div class="selection-status">
        <div class="status-info">
          <span class="status-text">
            已选择 {{ localSelectedChips.length }}/{{ maxSelection }} 个筹码
          </span>
        </div>
        <div class="selected-chips-preview" v-if="localSelectedChips.length > 0">
          <div class="preview-label">当前选择：</div>
          <div class="preview-chips">
            <span
              v-for="chipId in localSelectedChips"
              :key="chipId"
              class="preview-chip"
            >
              {{ getChipById(chipId)?.displayValue }}
            </span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="panel-footer">
        <button
          class="btn btn-secondary"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          class="btn btn-reset"
          @click="handleReset"
        >
          重置
        </button>
        <button
          class="btn btn-primary"
          @click="handleConfirm"
          :disabled="localSelectedChips.length === 0"
        >
          确认选择
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ChipData } from '@/stores/bettingStore'

// Props
interface Props {
  availableChips: ChipData[]
  selectedChips: string[]
  maxSelection?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxSelection: 5
})

// Emits
const emit = defineEmits<{
  confirm: [chipIds: string[]]
  cancel: []
  close: []
}>()

// 本地状态
const localSelectedChips = ref<string[]>([...props.selectedChips])

// 监听 props 变化
watch(() => props.selectedChips, (newSelection) => {
  localSelectedChips.value = [...newSelection]
}, { immediate: true })

// 计算属性
const getChipById = (id: string) => {
  return props.availableChips.find(chip => chip.id === id)
}

// 事件处理
const handleChipToggle = (chip: ChipData) => {
  const index = localSelectedChips.value.indexOf(chip.id)

  if (index > -1) {
    // 取消选择
    localSelectedChips.value.splice(index, 1)
    console.log(`➖ 取消选择筹码: ${chip.name}`)
  } else {
    // 检查是否达到最大选择数量
    if (localSelectedChips.value.length >= props.maxSelection) {
      console.warn(`⚠️ 最多只能选择 ${props.maxSelection} 个筹码`)
      return
    }

    // 添加选择
    localSelectedChips.value.push(chip.id)
    console.log(`➕ 选择筹码: ${chip.name}`)
  }
}

const handleConfirm = () => {
  if (localSelectedChips.value.length === 0) {
    console.warn('⚠️ 至少选择一个筹码')
    return
  }

  emit('confirm', [...localSelectedChips.value])
  console.log('✅ 确认筹码选择:', localSelectedChips.value)
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
  console.log('❌ 取消筹码选择')
}

const handleReset = () => {
  // 重置为默认选择
  localSelectedChips.value = ['chip-10', 'chip-50', 'chip-100']
  console.log('🔄 重置筹码选择为默认')
}

const handleOverlayClick = () => {
  handleCancel()
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认占位图
  img.src = '/src/assets/images/chips/default.png'
  console.warn('⚠️ 筹码图片加载失败，使用默认图片')
}
</script>

<style scoped>
.chip-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: overlayFadeIn 0.3s ease-out;
}

.chip-selector-panel {
  background: rgba(0, 0, 0, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: panelSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 28px;
  height: 28px;
  background: rgba(24, 144, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #40a9ff;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.panel-description {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-description p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  padding: 24px;
}

.chip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.chip-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.chip-item.selected {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.chip-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chip-image-container {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
}

.chip-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.chip-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  pointer-events: none;
}

.chip-checkmark {
  width: 24px;
  height: 24px;
  background: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.4);
  animation: checkmarkBounce 0.3s ease-out;
}

.chip-disabled-mask {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
}

.chip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.chip-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
  line-height: 1;
}

.chip-name {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1;
}

.selection-status {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.status-info {
  margin-bottom: 12px;
}

.status-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.selected-chips-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.preview-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preview-chip {
  padding: 2px 6px;
  background: rgba(24, 144, 255, 0.2);
  border-radius: 4px;
  font-size: 11px;
  color: #40a9ff;
  border: 1px solid rgba(24, 144, 255, 0.3);
}

.panel-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.btn-reset {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.btn-reset:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.3);
  color: #ffd54f;
}

.btn-primary {
  background: #40a9ff;
  color: white;
  border: 1px solid #40a9ff;
}

.btn-primary:hover:not(:disabled) {
  background: #1890ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 169, 255, 0.3);
}

/* 动画 */
@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes checkmarkBounce {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chip-selector-overlay {
    padding: 10px;
  }

  .chip-selector-panel {
    max-height: 90vh;
  }

  .panel-header {
    padding: 16px 20px;
  }

  .header-title {
    font-size: 16px;
  }

  .chip-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
    padding: 20px;
  }

  .chip-item {
    padding: 12px 6px;
  }

  .chip-image-container {
    width: 50px;
    height: 50px;
  }

  .panel-footer {
    padding: 16px 20px;
    flex-direction: column;
  }

  .btn {
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .chip-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 10px;
    padding: 16px;
  }

  .chip-image-container {
    width: 45px;
    height: 45px;
  }

  .chip-value {
    font-size: 13px;
  }

  .chip-name {
    font-size: 10px;
  }
}
</style>
