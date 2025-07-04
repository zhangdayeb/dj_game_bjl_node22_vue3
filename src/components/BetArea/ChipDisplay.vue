<!-- src/components/BetArea/ChipDisplay.vue - 改进版 -->
<template>
  <div class="chip-display">
    <div class="chip-control-layout">
      <!-- 撤销按钮 -->
      <button
        class="control-btn"
        :class="{ 'disabled': !canUndo }"
        :disabled="!canUndo"
        @click="handleUndo"
        title="撤销上一步"
      >
        <div class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
          </svg>
        </div>
        <span class="btn-text">重复</span>
      </button>

      <!-- 🔥 筹码选择区域 - 只显示3个 -->
      <div class="chip-selection-area">
        <div
          v-for="chip in defaultChips"
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
          <div class="chip-info">
            <span class="chip-value">{{ chip.displayValue }}</span>
          </div>
        </div>
      </div>

      <!-- 免佣按钮 -->
      <button
        class="control-btn control-btn-commission"
        :class="{ 'active': isCommissionFree }"
        @click="handleCommissionToggle"
        :title="isCommissionFree ? '关闭免佣' : '开启免佣'"
      >
        <div class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </div>
        <span class="btn-text">{{ isCommissionFree ? '免佣' : '免佣' }}</span>
      </button>

      <!-- 更多按钮 -->
      <button
        class="control-btn control-btn-more"
        @click="handleMore"
        title="选择更多筹码"
      >
        <div class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <span class="btn-text">更多</span>
      </button>
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

// 🔥 默认显示的3个筹码
const defaultChips = computed(() => {
  const allChips = bettingStore?.getDisplayChipsData || []

  // 如果store中有数据，取前3个
  if (allChips.length >= 3) {
    return allChips.slice(0, 3)
  }

  // 否则返回默认的3个筹码
  return [
    {
      id: 1,
      value: 10,
      name: '10元',
      displayValue: '10',
      image: '/src/assets/images/chips/chip-10.png'
    },
    {
      id: 2,
      value: 50,
      name: '50元',
      displayValue: '50',
      image: '/src/assets/images/chips/chip-50.png'
    },
    {
      id: 3,
      value: 100,
      name: '100元',
      displayValue: '100',
      image: '/src/assets/images/chips/chip-100.png'
    }
  ]
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
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  color: white;
  margin-top: auto;
  flex-shrink: 0;
}

/* 🔥 新布局：横向排列所有元素 */
.chip-control-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

/* 🔥 筹码选择区域 */
.chip-selection-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.chip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-width: 64px;
  flex-shrink: 0;
}

.chip-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* 🔥 选中状态：变大效果 */
.chip-item.active {
  background: rgba(24, 144, 255, 0.2);
  border-color: rgba(24, 144, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.3);
  transform: scale(1.15);
}

.chip-image-container {
  position: relative;
  width: 52px;   /* 🔥 增大基础尺寸 */
  height: 52px;
  margin-bottom: 6px;
}

/* 🔥 选中的筹码图片更大 */
.chip-item.active .chip-image-container {
  width: 58px;
  height: 58px;
}

.chip-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.chip-selection-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: #40a9ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid rgba(0, 0, 0, 0.8);
  animation: indicatorPulse 0.4s ease-out;
}

.chip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chip-value {
  font-size: 14px;   /* 🔥 增大字体 */
  font-weight: 700;  /* 🔥 加粗 */
  color: white;
  line-height: 1;
}

/* 🔥 选中状态的文字更大 */
.chip-item.active .chip-value {
  font-size: 16px;
  color: #69c0ff;
}

/* 🔥 控制按钮样式优化 */
.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 12px;   /* 🔥 增大内边距 */
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  min-width: 64px;      /* 🔥 增大最小宽度 */
  flex-shrink: 0;
}

.control-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.control-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn-more {
  background: rgba(24, 144, 255, 0.12);
  border-color: rgba(24, 144, 255, 0.25);
  color: #40a9ff;
}

.control-btn-more:hover:not(.disabled) {
  background: rgba(24, 144, 255, 0.25);
  border-color: rgba(24, 144, 255, 0.4);
  color: #69c0ff;
}

.control-btn-commission {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transition: all 0.3s ease;
}

.control-btn-commission:hover:not(.disabled) {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.control-btn-commission.active {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.5);
  color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
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
  font-size: 12px;    /* 🔥 增大字体 */
  font-weight: 600;   /* 🔥 加粗 */
  white-space: nowrap;
  line-height: 1;
}

@keyframes indicatorPulse {
  0% {
    transform: scale(0.7);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

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
    padding: 10px 12px;
  }

  .chip-control-layout {
    gap: 8px;
  }

  .chip-selection-area {
    gap: 6px;
  }

  .chip-item {
    min-width: 52px;
    padding: 6px;
  }

  .chip-image-container {
    width: 44px;
    height: 44px;
  }

  .chip-item.active .chip-image-container {
    width: 48px;
    height: 48px;
  }

  .chip-value {
    font-size: 12px;
  }

  .chip-item.active .chip-value {
    font-size: 14px;
  }

  .control-btn {
    min-width: 52px;
    padding: 8px 10px;
  }

  .btn-icon svg {
    width: 18px;
    height: 18px;
  }

  .btn-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .chip-display {
    padding: 8px 10px;
  }

  .chip-control-layout {
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .chip-selection-area {
    order: 1;
    width: 100%;
    justify-content: center;
    margin: 8px 0;
  }

  .chip-item {
    min-width: 48px;
    padding: 4px;
  }

  .chip-image-container {
    width: 40px;
    height: 40px;
  }

  .chip-item.active .chip-image-container {
    width: 44px;
    height: 44px;
  }

  .control-btn {
    min-width: 48px;
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
</style>
