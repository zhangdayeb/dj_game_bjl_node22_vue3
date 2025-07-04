<!-- src/components/BetArea/ChipDisplay.vue -->
<template>
  <div class="chip-display">
    <!-- 筹码选择区域 -->
    <div class="chip-selection-area">
      <div class="chip-items">
        <div
          v-for="(chip, index) in displayChips"
          :key="chip.id"
          class="chip-item"
          :class="{ 'active': selectedChipId === chip.id }"
          @click="handleChipSelect(chip)"
        >
          <div class="chip-image-container">
            <img
              :src="chip.image"
              :alt="chip.name"
              class="chip-image"
              @error="handleImageError"
            />
            <div class="chip-selection-indicator" v-if="selectedChipId === chip.id">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div class="chip-info">
            <span class="chip-value">{{ chip.displayValue }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制按钮区域 -->
    <div class="control-area">
      <div class="control-buttons">
        <!-- 撤销按钮 -->
        <button
          class="control-btn undo-btn"
          @click="handleUndo"
          :disabled="!canUndo"
          :title="'撤销'"
        >
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </div>
          <span class="btn-text">撤销</span>
        </button>

        <!-- 重复上一局按钮 -->
        <button
          class="control-btn repeat-btn"
          @click="handleRepeat"
          :disabled="!canRepeat"
          :title="'重复上一局'"
        >
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
            </svg>
          </div>
          <span class="btn-text">重复</span>
        </button>

        <!-- 更多按钮 -->
        <button
          class="control-btn more-btn"
          @click="handleMore"
          :title="'更多选项'"
        >
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <span class="btn-text">更多</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 筹码数据类型
interface ChipData {
  id: string
  name: string
  value: number
  displayValue: string
  image: string
}

// Props
interface Props {
  selectedChips?: ChipData[]
  defaultSelectedIndex?: number
  canUndo?: boolean
  canRepeat?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedChips: () => [],
  defaultSelectedIndex: 0,
  canUndo: false,
  canRepeat: false
})

// Emits
const emit = defineEmits<{
  chipSelect: [chip: ChipData]
  undo: []
  repeat: []
  more: []
}>()

// 默认筹码数据（当没有传入selectedChips时使用）
const defaultChips: ChipData[] = [
  { id: 'b_01', name: '1元', value: 1, displayValue: '1', image: '/src/assets/images/chips/B_01.png' },
  { id: 'b_5', name: '5元', value: 5, displayValue: '5', image: '/src/assets/images/chips/B_05.png' },
  { id: 'b_10', name: '10元', value: 10, displayValue: '10', image: '/src/assets/images/chips/B_10.png' },
  { id: 'b_20', name: '20元', value: 20, displayValue: '20', image: '/src/assets/images/chips/B_20.png' },
  { id: 'b_50', name: '50元', value: 50, displayValue: '50', image: '/src/assets/images/chips/B_50.png' }
]

// 响应式数据
const selectedChipId = ref<string>('')

// 计算属性
const displayChips = computed(() => {
  return props.selectedChips.length > 0 ? props.selectedChips : defaultChips
})

// 方法
const handleChipSelect = (chip: ChipData) => {
  selectedChipId.value = chip.id
  emit('chipSelect', chip)
}

const handleUndo = () => {
  if (props.canUndo) {
    emit('undo')
  }
}

const handleRepeat = () => {
  if (props.canRepeat) {
    emit('repeat')
  }
}

const handleMore = () => {
  emit('more')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认占位图
  img.src = '/src/assets/images/chips/chip.png'
}

// 生命周期
onMounted(() => {
  // 设置默认选中的筹码
  if (displayChips.value.length > 0) {
    const defaultIndex = Math.min(props.defaultSelectedIndex, displayChips.value.length - 1)
    selectedChipId.value = displayChips.value[defaultIndex].id
    emit('chipSelect', displayChips.value[defaultIndex])
  }
})
</script>

<style scoped>
.chip-display {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  color: white;
}

.chip-selection-area {
  flex: 1;
}

.chip-items {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding: 4px;
}

.chip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 60px;
  flex-shrink: 0;
}

.chip-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chip-item.active {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.chip-image-container {
  position: relative;
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
}

.chip-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.chip-selection-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #40a9ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid rgba(0, 0, 0, 0.8);
  animation: indicatorPulse 0.3s ease-out;
}

.chip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chip-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  line-height: 1;
}

.control-area {
  flex-shrink: 0;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  min-width: 60px;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.undo-btn {
  border-color: rgba(255, 193, 7, 0.3);
}

.undo-btn:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.4);
}

.undo-btn .btn-icon {
  color: #ffc107;
}

.repeat-btn {
  border-color: rgba(82, 196, 26, 0.3);
}

.repeat-btn:hover:not(:disabled) {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.4);
}

.repeat-btn .btn-icon {
  color: #52c41a;
}

.more-btn {
  border-color: rgba(135, 208, 104, 0.3);
}

.more-btn:hover:not(:disabled) {
  background: rgba(135, 208, 104, 0.1);
  border-color: rgba(135, 208, 104, 0.4);
}

.more-btn .btn-icon {
  color: #87d068;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-text {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
}

@keyframes indicatorPulse {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 滚动条样式 */
.chip-items::-webkit-scrollbar {
  height: 4px;
}

.chip-items::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.chip-items::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.chip-items::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chip-display {
    flex-direction: column;
    gap: 12px;
    padding: 10px 12px;
  }

  .chip-selection-area {
    width: 100%;
  }

  .chip-items {
    gap: 8px;
  }

  .chip-item {
    min-width: 50px;
    padding: 6px;
  }

  .chip-image-container {
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
  }

  .chip-selection-indicator {
    width: 16px;
    height: 16px;
    top: -2px;
    right: -2px;
  }

  .chip-selection-indicator svg {
    width: 10px;
    height: 10px;
  }

  .chip-value {
    font-size: 11px;
  }

  .control-area {
    width: 100%;
  }

  .control-buttons {
    justify-content: center;
    gap: 6px;
  }

  .control-btn {
    min-width: 50px;
    padding: 6px 8px;
  }

  .btn-icon svg {
    width: 16px;
    height: 16px;
  }

  .btn-text {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .chip-display {
    gap: 8px;
    padding: 8px 10px;
  }

  .chip-items {
    gap: 6px;
  }

  .chip-item {
    min-width: 44px;
    padding: 4px;
  }

  .chip-image-container {
    width: 36px;
    height: 36px;
  }

  .chip-selection-indicator {
    width: 14px;
    height: 14px;
  }

  .chip-selection-indicator svg {
    width: 8px;
    height: 8px;
  }

  .chip-value {
    font-size: 10px;
  }

  .control-buttons {
    gap: 4px;
  }

  .control-btn {
    min-width: 44px;
    padding: 4px 6px;
  }

  .btn-icon svg {
    width: 14px;
    height: 14px;
  }

  .btn-text {
    font-size: 8px;
  }
}
</style>
