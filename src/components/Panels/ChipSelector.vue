<template>
  <!-- 🔥 使用 uiStore 的显示状态 -->
  <div
    v-if="uiStore.showChipSelector"
    class="chip-selector-overlay"
    @click="handleOverlayClick"
  >
    <div class="chip-selector-panel" @click.stop>
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 class="panel-title">选择筹码</h2>
        </div>
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="panel-content">
        <!-- 🔥 当前选中的3个筹码显示 -->
        <div class="current-selection">
          <div class="selection-info">
            <span class="selection-label">当前选中筹码:</span>
            <div class="selected-chips-display">
              <div
                v-for="chip in selectedDisplayChips"
                :key="chip.id"
                class="selected-chip-item"
              >
                <img
                  :src="chip.image"
                  :alt="chip.name"
                  class="selected-chip-image"
                  @error="handleImageError"
                />
                <span class="chip-value">${{ chip.displayValue }}</span>
              </div>
              <div v-if="selectedDisplayChips.length === 0" class="no-selection">
                未选择任何筹码
              </div>
            </div>
          </div>
        </div>

        <!-- 筹码选择 -->
        <div class="chips-section">
          <h3 class="section-title">选择筹码</h3>
          <div class="chips-grid">
            <div
              v-for="chip in availableChips"
              :key="chip.id"
              class="chip-item"
              :class="{
                'active': selectedDisplayChips.some(sc => sc.id === chip.id),
                'disabled': !isAffordable(chip.value)
              }"
              @click="toggleChipSelection(chip)"
            >
              <div class="chip-image-container">
                <img
                  :src="chip.image"
                  :alt="chip.name"
                  class="chip-image"
                  @error="handleImageError"
                />
                <div class="chip-glow" :style="{ backgroundColor: getChipColor(chip.value) }"></div>
              </div>
              <div class="chip-label">
                <span class="chip-value">${{ chip.displayValue }}</span>
              </div>
              <div v-if="!isAffordable(chip.value)" class="insufficient-badge">
                余额不足
              </div>
              <!-- 🔥 选中状态指示器 -->
              <div v-if="selectedDisplayChips.some(sc => sc.id === chip.id)" class="selected-indicator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 面板底部 -->
      <div class="panel-footer">
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="handleClose">
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="selectedDisplayChips.length === 0"
            @click="confirmSelection"
          >
            确认选择 ({{ selectedDisplayChips.length }}/3)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import { useUIStore } from '@/stores/uiStore'

// 类型定义
interface ChipData {
  id: string
  value: number
  name: string
  image: string
  displayValue: string
}

// 🔥 引入 Stores
const bettingStore = useBettingStore()
const uiStore = useUIStore()

// 🔥 响应式数据 - 改为多选
const selectedDisplayChips = ref<ChipData[]>([])

// 计算属性
const currentBalance = computed(() => {
  return bettingStore?.balance || 99990.00
})

// 从 bettingStore 获取完整的筹码数据
const availableChips = computed((): ChipData[] => {
  return bettingStore?.availableChips || [
    { id: 'chip-1', value: 1, name: '1', image: '/src/assets/images/chips/B_01.png', displayValue: '1' },
    { id: 'chip-5', value: 5, name: '5', image: '/src/assets/images/chips/B_05.png', displayValue: '5' },
    { id: 'chip-10', value: 10, name: '10', image: '/src/assets/images/chips/B_10.png', displayValue: '10' },
    { id: 'chip-20', value: 20, name: '20', image: '/src/assets/images/chips/B_20.png', displayValue: '20' },
    { id: 'chip-50', value: 50, name: '50', image: '/src/assets/images/chips/B_50.png', displayValue: '50' },
    { id: 'chip-100', value: 100, name: '100', image: '/src/assets/images/chips/B_100.png', displayValue: '100' },
    { id: 'chip-500', value: 500, name: '500', image: '/src/assets/images/chips/B_500.png', displayValue: '500' },
    { id: 'chip-1000', value: 1000, name: '1K', image: '/src/assets/images/chips/B_1K.png', displayValue: '1K' },
    { id: 'chip-5000', value: 5000, name: '5K', image: '/src/assets/images/chips/B_5K.png', displayValue: '5K' },
    { id: 'chip-10000', value: 10000, name: '10K', image: '/src/assets/images/chips/B_10K.png', displayValue: '10K' },
    { id: 'chip-20000', value: 20000, name: '20K', image: '/src/assets/images/chips/B_20K.png', displayValue: '20K' },
    { id: 'chip-50000', value: 50000, name: '50K', image: '/src/assets/images/chips/B_50K.png', displayValue: '50K' }
  ]
})

// 🔥 3个默认推荐筹码 - 根据余额动态调整
const defaultChips = computed((): ChipData[] => {
  const balance = currentBalance.value
  let defaultValues: number[] = []

  // 根据余额智能推荐3个筹码
  if (balance >= 50000) {
    defaultValues = [100, 1000, 10000]
  } else if (balance >= 10000) {
    defaultValues = [50, 500, 5000]
  } else if (balance >= 1000) {
    defaultValues = [10, 50, 100]
  } else if (balance >= 100) {
    defaultValues = [1, 5, 10]
  } else {
    defaultValues = [1, 5, 10]
  }

  // 过滤出可用的筹码
  return availableChips.value.filter(chip =>
    defaultValues.includes(chip.value) && isAffordable(chip.value)
  ).slice(0, 3)
})

// 方法
const isAffordable = (amount: number): boolean => {
  return currentBalance.value >= amount
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getChipColor = (value: number): string => {
  // 根据筹码面额返回发光颜色
  if (value >= 10000) return '#ff6b35'     // 橙色 - 高额
  if (value >= 1000) return '#9b59b6'      // 紫色 - 中高额
  if (value >= 500) return '#e67e22'       // 橙色
  if (value >= 100) return '#3498db'       // 蓝色
  if (value >= 50) return '#2ecc71'        // 绿色
  if (value >= 20) return '#f39c12'        // 黄色
  if (value >= 10) return '#1abc9c'        // 青色
  if (value >= 5) return '#e74c3c'         // 红色
  return '#95a5a6' // 灰色 - 小额
}

// 🔥 切换筹码选择（最多3个）
const toggleChipSelection = (chip: ChipData) => {
  if (!isAffordable(chip.value)) {
    console.log('💰 余额不足，无法选择此筹码')
    return
  }

  const index = selectedDisplayChips.value.findIndex(sc => sc.id === chip.id)

  if (index >= 0) {
    // 如果已选中，则取消选择
    selectedDisplayChips.value.splice(index, 1)
    console.log('➖ 取消选择筹码:', chip.value)
  } else {
    // 如果未选中，检查是否已达到最大数量
    if (selectedDisplayChips.value.length >= 3) {
      console.log('⚠️ 最多只能选择3个筹码')
      return
    }

    // 添加到选择列表
    selectedDisplayChips.value.push(chip)
    console.log('➕ 选择筹码:', chip.value)
  }

  // 添加触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(30)
  }
}

// 🔥 确认选择 - 更新 bettingStore 的显示筹码并关闭面板
const confirmSelection = () => {
  if (selectedDisplayChips.value.length > 0) {
    try {
      // 🔥 更新 bettingStore 的显示筹码列表（如果有相关方法）
      if (bettingStore?.updateDisplayChips) {
        bettingStore.updateDisplayChips(selectedDisplayChips.value)
      }

      // 🔥 如果选择了筹码，将第一个设为当前选中筹码
      if (bettingStore?.selectChip && selectedDisplayChips.value[0]) {
        bettingStore.selectChip(selectedDisplayChips.value[0].value)
      }

      console.log('✅ 确认选择筹码:', selectedDisplayChips.value.map(c => c.value))

      // 🔥 关闭筹码选择器
      handleClose()

      // 添加成功反馈
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
    } catch (error) {
      console.error('❌ 确认选择筹码失败:', error)
    }
  }
}

// 🔥 使用 uiStore 关闭面板
const handleClose = () => {
  try {
    uiStore?.closeChipSelector?.()
    console.log('🔥 关闭筹码选择器 [通过 uiStore]')
  } catch (error) {
    console.error('❌ 关闭筹码选择器失败:', error)
  }
}

const handleOverlayClick = () => {
  handleClose()
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认占位图
  img.src = '/src/assets/images/chips/default.png'
  console.warn('⚠️ 筹码图片加载失败:', img.alt)
}

// 🔥 监听面板显示状态，自动选择当前显示的筹码
watch(() => uiStore.showChipSelector, (newVisible) => {
  if (newVisible) {
    // 打开时，获取当前显示的筹码列表
    const currentDisplayChips = bettingStore?.getDisplayChipsData || []

    if (currentDisplayChips.length > 0) {
      // 选择当前显示的筹码
      selectedDisplayChips.value = [...currentDisplayChips].slice(0, 3)
      console.log('🎯 自动选择当前显示筹码:', selectedDisplayChips.value.map(c => c.value))
    } else {
      // 如果没有显示筹码，选择默认的3个筹码
      const defaultSelection = availableChips.value
        .filter(chip => isAffordable(chip.value))
        .slice(0, 3)
      selectedDisplayChips.value = defaultSelection
      console.log('🎯 选择默认筹码:', selectedDisplayChips.value.map(c => c.value))
    }
  } else {
    // 关闭时重置选择
    selectedDisplayChips.value = []
  }
})

// 生命周期
onMounted(() => {
  console.log('🎰 筹码选择器组件挂载 [uiStore版]', {
    balance: currentBalance.value,
    availableChipsCount: availableChips.value.length,
    defaultChipsCount: defaultChips.value.length,
    hasUIStore: !!uiStore,
    hasBettingStore: !!bettingStore
  })
})
</script>

<style scoped>
/* 🔥 全屏遮罩层 */
.chip-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: overlayFadeIn 0.3s ease-out;
}

/* 🔥 主面板 - 全屏适配 */
.chip-selector-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  animation: panelSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
.panel-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(24, 144, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 🔥 内容区域 - 可滚动 */
.panel-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* 🔥 当前选中的筹码显示区域 */
.current-selection {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.selection-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selection-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.selected-chips-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selected-chip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 12px;
  min-width: 60px;
}

.selected-chip-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

.selected-chip-item .chip-value {
  color: #69c0ff;
  font-size: 12px;
  font-weight: 600;
}

.no-selection {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 20px;
  text-align: center;
}

/* 🔥 节标题 */
.section-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-left: 8px;
  border-left: 3px solid #1890ff;
}

/* 🔥 筹码选择区域 */
.chips-section {
  margin-bottom: 16px;
}

.chips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

/* 🔥 筹码项样式 */
.chip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  position: relative;
  min-height: 100px;
  justify-content: center;
}

.chip-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border-color: rgba(24, 144, 255, 0.3);
}

/* 🔥 选中状态 */
.chip-item.active {
  background: rgba(24, 144, 255, 0.15);
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.3), 0 8px 25px rgba(24, 144, 255, 0.4);
  transform: translateY(-2px);
}

/* 🔥 禁用状态 */
.chip-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02);
}

.chip-image-container {
  position: relative;
  margin-bottom: 8px;
}

.chip-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

/* 🔥 筹码发光效果 */
.chip-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0;
  filter: blur(15px);
  transition: opacity 0.3s ease;
  z-index: 1;
}

.chip-item:hover:not(.disabled) .chip-glow,
.chip-item.active .chip-glow {
  opacity: 0.4;
}

.chip-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.chip-label .chip-value {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

/* 🔥 选中状态指示器 */
.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
}

.insufficient-badge {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 77, 79, 0.9);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 🔥 底部按钮区域 */
.panel-footer {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 🔥 动画效果 */
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
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 🔥 移动端适配 */
@media (max-width: 768px) {
  .chip-selector-panel {
    border-radius: 0;
    max-width: 100vw;
    max-height: 100vh;
  }

  .panel-header {
    padding: 16px 20px;
  }

  .panel-content {
    padding: 20px;
  }

  .chips-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
  }

  .current-selection {
    padding: 16px;
  }

  .selected-chips-display {
    gap: 8px;
  }

  .selected-chip-item {
    min-width: 50px;
  }

  .selected-chip-image {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .chips-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .chip-item {
    min-height: 90px;
    padding: 10px 6px;
  }

  .chip-image {
    width: 40px !important;
    height: 40px !important;
  }

  .chip-glow {
    width: 50px !important;
    height: 50px !important;
  }

  .selected-chip-image {
    width: 28px;
    height: 28px;
  }
}
</style>
