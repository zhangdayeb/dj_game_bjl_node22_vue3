<!-- src/components/BetArea/ChipDisplay.vue -->
<template>
  <div class="chip-display">
    <!-- 筹码选择区域 -->
    <div class="chip-selection-area">
      <div class="chip-items">
        <div
          v-for="chip in displayChips"
          :key="chip.id"
          class="chip-item"
          :class="{ 'active': chip.value === currentChip }"
          @click="handleChipSelect(chip)"
        >
          <div class="chip-image-container">
            <img
              :src="chip.image"
              :alt="chip.name"
              class="chip-image"
              @error="handleImageError"
            />
            <div class="chip-selection-indicator" v-if="chip.value === currentChip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
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
          class="control-btn"
          :class="{ 'disabled': !canUndo }"
          :disabled="!canUndo"
          @click="handleUndo"
          title="撤销上一步"
        >
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </div>
          <span class="btn-text">撤销</span>
        </button>

        <!-- 重复按钮 -->
        <button
          class="control-btn"
          :class="{ 'disabled': !canRepeat }"
          :disabled="!canRepeat"
          @click="handleRepeat"
          title="重复上一局"
        >
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
            </svg>
          </div>
          <span class="btn-text">重复</span>
        </button>

        <!-- 🔥 新增：免佣按钮 -->
        <button
          class="control-btn control-btn-commission"
          :class="{ 'active': isCommissionFree }"
          @click="handleCommissionToggle"
          :title="isCommissionFree ? '关闭免佣' : '开启免佣'"
        >
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          </div>
          <span class="btn-text">{{ isCommissionFree ? '免佣' : '佣金' }}</span>
        </button>

        <!-- 更多按钮 -->
        <button
          class="control-btn control-btn-more"
          @click="handleMore"
          title="选择更多筹码"
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
import { computed } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import type { ChipData } from '@/stores/bettingStore'

// Store
let bettingStore: any = null

try {
  bettingStore = useBettingStore()
} catch (error) {
  console.error('❌ BettingStore 初始化失败:', error)
  // 创建默认对象避免错误
  bettingStore = {
    selectedChip: 10,
    getDisplayChipsData: [],
    hasLastRoundData: false,
    betHistory: [],
    isCommissionFree: false,
    selectChip: () => {},
    undoLastBet: () => {},
    restoreLastRound: () => {},
    toggleCommissionFree: () => {}
  }
}

// 计算属性
const displayChips = computed(() => {
  return bettingStore?.getDisplayChipsData || []
})

const currentChip = computed(() => {
  return bettingStore?.selectedChip || 10
})

const canUndo = computed(() => {
  try {
    return bettingStore?.betHistory?.length > 0 || false
  } catch (error) {
    return false
  }
})

const canRepeat = computed(() => {
  try {
    return bettingStore?.hasLastRoundData || false
  } catch (error) {
    return false
  }
})

// 🔥 新增：免佣状态
const isCommissionFree = computed(() => {
  try {
    return bettingStore?.isCommissionFree || false
  } catch (error) {
    return false
  }
})

// 事件处理方法
const handleChipSelect = (chip: ChipData) => {
  try {
    bettingStore?.selectChip?.(chip.value)
    console.log(`🎯 选择筹码: ${chip.value}`)
  } catch (error) {
    console.error('❌ 选择筹码失败:', error)
  }
}

const handleUndo = () => {
  if (!canUndo.value) return

  try {
    bettingStore?.undoLastBet?.()
    console.log('↩️ 执行撤销操作')
  } catch (error) {
    console.error('❌ 撤销失败:', error)
  }
}

const handleRepeat = () => {
  if (!canRepeat.value) return

  try {
    bettingStore?.restoreLastRound?.()
    console.log('🔄 执行重复操作')
  } catch (error) {
    console.error('❌ 重复投注失败:', error)
  }
}

// 🔥 新增：免佣切换处理
const handleCommissionToggle = () => {
  try {
    bettingStore?.toggleCommissionFree?.()
    console.log(`🎯 免佣状态切换: ${isCommissionFree.value ? '关闭' : '开启'}`)
  } catch (error) {
    console.error('❌ 免佣状态切换失败:', error)
  }
}

const handleMore = () => {
  console.log('📱 打开筹码选择器')
  // 这里可以添加打开筹码选择器的逻辑
  // 比如触发全局事件或者直接操作某个状态
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认占位图
  img.src = '/src/assets/images/chips/default.png'
  console.warn('⚠️ 筹码图片加载失败')
}
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
  margin-top: auto;
  flex-shrink: 0;
}

.chip-selection-area {
  flex: 1;
  min-width: 0;
}

.chip-items {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding: 4px;

  /* 隐藏滚动条但保持功能 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chip-items::-webkit-scrollbar {
  display: none;
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

.control-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn-more {
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(24, 144, 255, 0.2);
  color: #40a9ff;
}

.control-btn-more:hover {
  background: rgba(24, 144, 255, 0.2);
  border-color: rgba(24, 144, 255, 0.3);
  color: #69c0ff;
}

/* 🔥 新增：免佣按钮样式 */
.control-btn-commission {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transition: all 0.3s ease;
}

.control-btn-commission:hover {
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.control-btn-commission.active {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffc107;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2);
}

.control-btn-commission.active .btn-icon {
  animation: commissionPulse 2s ease-in-out infinite;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

@keyframes indicatorPulse {
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

/* 🔥 新增：免佣按钮动画 */
@keyframes commissionPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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
