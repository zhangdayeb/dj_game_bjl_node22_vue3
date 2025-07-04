<!-- src/components/BetArea/ChipSelector.vue -->
<template>
  <div class="chip-selector">
    <div class="chip-selector-header">
      <div class="header-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <span class="header-title">筹码选择</span>
    </div>

    <div class="chip-container">
      <div class="chip-list">
        <div
          v-for="chip in availableChips"
          :key="chip.id"
          class="chip-item"
          :class="{
            'active': selectedChips.includes(chip.id),
            'disabled': !selectedChips.includes(chip.id) && selectedChips.length >= 5
          }"
          @click="handleChipClick(chip)"
        >
          <div class="chip-image-container">
            <img
              :src="chip.image"
              :alt="chip.name"
              class="chip-image"
              @error="handleImageError"
            />
            <div class="chip-overlay">
              <div class="chip-checkmark" v-if="selectedChips.includes(chip.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="chip-info">
            <span class="chip-value">{{ chip.displayValue }}</span>
            <span class="chip-label">{{ chip.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chip-selector-footer">
      <div class="selected-count">
        已选择 {{ selectedChips.length }}/5
      </div>
      <button
        class="reset-btn"
        @click="resetSelection"
        :disabled="selectedChips.length === 0"
      >
        重置选择
      </button>
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
  category: 'basic' | 'standard' | 'premium'
}

// 筹码数据配置
const chipConfigs: ChipData[] = [
  // 基础筹码
  { id: 'b_01', name: '1元', value: 1, displayValue: '1', image: '/src/assets/images/chips/B_01.png', category: 'basic' },
  { id: 'b_5', name: '5元', value: 5, displayValue: '5', image: '/src/assets/images/chips/B_05.png', category: 'basic' },
  { id: 'b_10', name: '10元', value: 10, displayValue: '10', image: '/src/assets/images/chips/B_10.png', category: 'basic' },
  { id: 'b_20', name: '20元', value: 20, displayValue: '20', image: '/src/assets/images/chips/B_20.png', category: 'basic' },
  { id: 'b_50', name: '50元', value: 50, displayValue: '50', image: '/src/assets/images/chips/B_50.png', category: 'basic' },
  { id: 'b_100', name: '100元', value: 100, displayValue: '100', image: '/src/assets/images/chips/B_100.png', category: 'basic' },

  // 千元筹码
  { id: 'b_1k', name: '1千', value: 1000, displayValue: '1K', image: '/src/assets/images/chips/B_1K.png', category: 'standard' },
  { id: 'b_5k', name: '5千', value: 5000, displayValue: '5K', image: '/src/assets/images/chips/B_5K.png', category: 'standard' },
  { id: 'b_10k', name: '1万', value: 10000, displayValue: '10K', image: '/src/assets/images/chips/B_10K.png', category: 'standard' },
  { id: 'b_20k', name: '2万', value: 20000, displayValue: '20K', image: '/src/assets/images/chips/B_20K.png', category: 'standard' },
  { id: 'b_50k', name: '5万', value: 50000, displayValue: '50K', image: '/src/assets/images/chips/B_50K.png', category: 'standard' },
  { id: 'b_100k', name: '10万', value: 100000, displayValue: '100K', image: '/src/assets/images/chips/B_100K.png', category: 'standard' },

  // 大额筹码
  { id: 'b_1m', name: '100万', value: 1000000, displayValue: '1M', image: '/src/assets/images/chips/B_1M.png', category: 'premium' },
  { id: 'b_5m', name: '500万', value: 5000000, displayValue: '5M', image: '/src/assets/images/chips/B_5M.png', category: 'premium' },
  { id: 'b_10m', name: '1000万', value: 10000000, displayValue: '10M', image: '/src/assets/images/chips/B_10M.png', category: 'premium' },
  { id: 'b_20m', name: '2000万', value: 20000000, displayValue: '20M', image: '/src/assets/images/chips/B_20M.png', category: 'premium' },
  { id: 'b_50m', name: '5000万', value: 50000000, displayValue: '50M', image: '/src/assets/images/chips/B_50M.png', category: 'premium' },
  { id: 'b_100m', name: '1亿', value: 100000000, displayValue: '100M', image: '/src/assets/images/chips/B_100M.png', category: 'premium' },
  { id: 'b_200m', name: '2亿', value: 200000000, displayValue: '200M', image: '/src/assets/images/chips/B_200M.png', category: 'premium' },
  { id: 'b_500m', name: '5亿', value: 500000000, displayValue: '500M', image: '/src/assets/images/chips/B_500M.png', category: 'premium' },
  { id: 'b_1000m', name: '10亿', value: 1000000000, displayValue: '1000M', image: '/src/assets/images/chips/B_1000M.png', category: 'premium' },
]

// Props
interface Props {
  maxSelection?: number
  defaultSelection?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  maxSelection: 5,
  defaultSelection: () => ['b_01', 'b_5', 'b_10', 'b_20', 'b_50'] // 默认选择前5个
})

// Emits
const emit = defineEmits<{
  selectionChange: [chips: ChipData[]]
  chipClick: [chip: ChipData]
}>()

// 响应式数据
const selectedChips = ref<string[]>([...props.defaultSelection])
const availableChips = ref<ChipData[]>(chipConfigs)

// 计算属性
const selectedChipData = computed(() => {
  return availableChips.value.filter(chip => selectedChips.value.includes(chip.id))
})

// 方法
const handleChipClick = (chip: ChipData) => {
  const isSelected = selectedChips.value.includes(chip.id)

  if (isSelected) {
    // 取消选择
    selectedChips.value = selectedChips.value.filter(id => id !== chip.id)
  } else {
    // 选择筹码
    if (selectedChips.value.length < props.maxSelection) {
      selectedChips.value.push(chip.id)
    }
  }

  // 发出事件
  emit('chipClick', chip)
  emit('selectionChange', selectedChipData.value)
}

const resetSelection = () => {
  selectedChips.value = [...props.defaultSelection]
  emit('selectionChange', selectedChipData.value)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认占位图
  img.src = '/src/assets/images/chips/chip.png'
}

// 生命周期
onMounted(() => {
  // 初始化时发出选择事件
  emit('selectionChange', selectedChipData.value)
})
</script>

<style scoped>
.chip-selector {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  color: white;
  margin-bottom: 16px;
}

.chip-selector-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffc107;
  flex-shrink: 0;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.chip-container {
  margin-bottom: 16px;
}

.chip-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
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
}

.chip-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chip-item.active {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.3);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.chip-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chip-item.disabled:hover {
  transform: none;
  box-shadow: none;
}

.chip-image-container {
  position: relative;
  width: 48px;
  height: 48px;
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
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.chip-item.active .chip-overlay {
  opacity: 1;
}

.chip-checkmark {
  width: 20px;
  height: 20px;
  background: #40a9ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: checkmarkBounce 0.3s ease-out;
}

.chip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.chip-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  line-height: 1;
}

.chip-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.chip-selector-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.reset-btn {
  background: rgba(255, 77, 79, 0.15);
  color: #ff7875;
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.25);
  transform: scale(1.05);
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes checkmarkBounce {
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
.chip-list::-webkit-scrollbar {
  width: 6px;
}

.chip-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.chip-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.chip-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chip-selector {
    padding: 12px;
  }

  .chip-list {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 8px;
  }

  .chip-image-container {
    width: 40px;
    height: 40px;
    margin-bottom: 6px;
  }

  .chip-checkmark {
    width: 16px;
    height: 16px;
  }

  .chip-value {
    font-size: 11px;
  }

  .chip-label {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .chip-selector {
    padding: 10px;
  }

  .chip-list {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
    max-height: 240px;
  }

  .chip-item {
    padding: 6px;
  }

  .chip-image-container {
    width: 36px;
    height: 36px;
    margin-bottom: 4px;
  }

  .chip-checkmark {
    width: 14px;
    height: 14px;
  }

  .chip-value {
    font-size: 10px;
  }

  .chip-label {
    font-size: 8px;
  }

  .header-title {
    font-size: 13px;
  }

  .selected-count {
    font-size: 11px;
  }

  .reset-btn {
    font-size: 11px;
    padding: 3px 8px;
  }
}
</style>
