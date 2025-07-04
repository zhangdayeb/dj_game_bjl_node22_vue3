<!-- src/components/BetArea/ChipDisplay.vue - 优化版：保持原布局+增强效果 -->
<template>
  <div class="chip-display">
    <!-- 🔥 保持原始横向布局，只增强效果 -->
    <div class="chip-control-layout">
      <!-- 撤销按钮 -->
      <button
        class="control-btn undo-btn"
        :class="{ 'disabled': !canUndo, 'has-history': betHistoryCount > 0 }"
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
        <!-- 投注计数指示器 -->
        <div class="bet-count-indicator" v-if="betHistoryCount > 0">{{ betHistoryCount }}</div>
      </button>

      <!-- 重复按钮 -->
      <button
        class="control-btn repeat-btn"
        :class="{ 'disabled': !canRepeat, 'available': canRepeat }"
        :disabled="!canRepeat"
        @click="handleRepeat"
        title="重复上一局投注"
      >
        <div class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
          </svg>
        </div>
        <span class="btn-text">重复</span>
        <!-- 上次投注金额提示 -->
        <div class="last-bet-amount" v-if="lastBetAmount > 0">¥{{ formatAmount(lastBetAmount) }}</div>
      </button>

      <!-- 🔥 筹码选择区域 - 保持原始布局，只增强效果 -->
      <div class="chip-selection-area">
        <div
          v-for="chip in displayChips"
          :key="chip.id"
          class="chip-item"
          :class="{
            'active': chip.value === currentChip
          }"
          @click="handleChipSelect(chip)"

        >
          <div class="chip-image-container">
            <img
              :src="chip.image"
              :alt="chip.name"
              class="chip-image"
              @error="handleImageError"
            />

            <!-- 🔥 去掉余额不足遮罩 -->
            <!-- <div class="insufficient-overlay" v-if="!isAffordable(chip.value)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div> -->
          </div>
          <div class="chip-info">
            <span class="chip-value">{{ formatChipValue(chip.value) }}</span>
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
        <span class="btn-text">{{ isCommissionFree ? '免佣中' : '免佣' }}</span>
        <!-- 免佣状态指示灯 -->
        <div class="commission-status-dot" v-if="isCommissionFree"></div>
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

    <!-- 🔥 去掉余额不足全局提示 -->
    <!-- <div class="balance-warning" v-if="!isAffordable(currentChip)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      <span>余额不足，请选择较小面额筹码</span>
    </div> -->

    <!-- 🔥 筹码选择器弹窗 -->
    <ChipSelector
      v-if="showChipSelector"
      @close="showChipSelector = false"
      @select="handleChipSelectorSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import ChipSelector from '@/components/Panels/ChipSelector.vue'
// 🔥 ChipData 类型定义
interface ChipData {
  id: string | number
  value: number
  name: string
  image: string
  displayValue: string
}

// Props
interface Props {
  chipCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  chipCount: 3
})

// 响应式状态
const showChipSelector = ref(false)

// Store
let bettingStore: any = null

try {
  bettingStore = useBettingStore()
} catch (error) {
  console.error('❌ BettingStore 初始化失败:', error)
  // 创建默认对象避免错误
  bettingStore = {
    selectedChip: 10,
    balance: 10000,
    currentBets: {},
    confirmedBets: {},
    lastBets: {},
    totalBetAmount: 0,
    availableBalance: 10000,
    bettingPhase: 'betting',
    isCommissionFree: false,
    getDisplayChipsData: [],
    selectChip: () => {},
    clearBets: () => {},
    rebet: () => {},
    toggleCommissionFree: () => {}
  }
}

// 🔥 默认筹码数据
const defaultChipsData: ChipData[] = [
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

// 计算属性
const displayChips = computed(() => {
  const storeChips = bettingStore?.getDisplayChipsData || []
  const chips = storeChips.length > 0 ? storeChips : defaultChipsData
  return chips.slice(0, props.chipCount)
})

const currentChip = computed(() => {
  return bettingStore?.selectedChip || 10
})

const availableBalance = computed(() => {
  return bettingStore?.availableBalance || 0
})

const totalBetAmount = computed(() => {
  return bettingStore?.totalBetAmount || 0
})

const isCommissionFree = computed(() => {
  return bettingStore?.isCommissionFree || false
})

const canUndo = computed(() => {
  try {
    const currentBets = bettingStore?.currentBets || {}
    return Object.keys(currentBets).some(key => {
      const amount = currentBets[key]
      return typeof amount === 'number' && amount > 0
    })
  } catch (error) {
    return false
  }
})

const canRepeat = computed(() => {
  try {
    const lastBets = bettingStore?.lastBets || {}
    return Object.keys(lastBets).some(key => {
      const amount = lastBets[key]
      return typeof amount === 'number' && amount > 0
    })
  } catch (error) {
    return false
  }
})

const betHistoryCount = computed(() => {
  try {
    const currentBets = bettingStore?.currentBets || {}
    return Object.keys(currentBets).filter(key => {
      const amount = currentBets[key]
      return typeof amount === 'number' && amount > 0
    }).length
  } catch (error) {
    return 0
  }
})

const lastBetAmount = computed(() => {
  try {
    const lastBets = bettingStore?.lastBets || {}
    return Object.values(lastBets).reduce((sum: number, amount: unknown) => {
      const numAmount = typeof amount === 'number' ? amount : 0
      return sum + numAmount
    }, 0)
  } catch (error) {
    return 0
  }
})

// 方法
const isAffordable = (chipValue: number): boolean => {
  // 🔥 去掉余额限制，任何筹码都可以选择
  return true
}

const formatChipValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toString()
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString()
}

// 事件处理方法
const handleChipSelect = (chip: ChipData) => {
  // 🔥 去掉余额检查，直接选择筹码
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
    bettingStore?.clearBets?.()
    console.log('↩️ 执行撤销操作')
  } catch (error) {
    console.error('❌ 撤销失败:', error)
  }
}

const handleRepeat = () => {
  if (!canRepeat.value) return

  try {
    bettingStore?.rebet?.()
    console.log('🔄 执行重复投注')
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
  showChipSelector.value = true
  console.log('📱 打开筹码选择器')
}

const handleChipSelectorSelect = (chip: ChipData) => {
  handleChipSelect(chip)
  showChipSelector.value = false
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/src/assets/images/chips/default.png'
  console.warn('⚠️ 筹码图片加载失败')
}

// 生命周期
onMounted(() => {
  console.log('🎰 筹码显示组件挂载 [优化版]', {
    selectedChip: currentChip.value,
    balance: availableBalance.value,
    displayChipsCount: displayChips.value.length
  })
})
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

/* 🔥 保持原始横向布局 */
.chip-control-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

/* 🔥 筹码选择区域 - 保持原始设计 */
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-width: 64px;
  flex-shrink: 0;
  position: relative;
}

.chip-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* 🔥 选中状态增强 */
.chip-item.active {
  background: rgba(24, 144, 255, 0.2);
  border-color: rgba(24, 144, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.3), 0 6px 20px rgba(24, 144, 255, 0.2);
  transform: scale(1.15);
}

.chip-image-container {
  position: relative;
  width: 52px;
  height: 52px;
  margin-bottom: 6px;
}

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
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.chip-item.active .chip-image {
  filter: drop-shadow(0 4px 12px rgba(24, 144, 255, 0.4));
}

.chip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chip-value {
  font-size: 14px;
  font-weight: 700;
  color: white;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.chip-item.active .chip-value {
  font-size: 16px;
  color: #69c0ff;
}

/* 🔥 控制按钮增强效果 */
.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  min-width: 64px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* 🔥 悬停光扫效果 */
.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.control-btn:hover:not(.disabled)::before {
  left: 100%;
}

.control-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.control-btn:active:not(.disabled) {
  transform: translateY(0);
}

.control-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 🔥 特定按钮状态增强 */
.undo-btn.has-history {
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(24, 144, 255, 0.2);
  animation: undoGlow 3s ease-in-out infinite;
}

.repeat-btn.available {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.2);
  color: #95de64;
}

.control-btn-commission.active {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.15);
  animation: commissionActive 3s ease-in-out infinite;
}

.control-btn-more {
  background: rgba(24, 144, 255, 0.12);
  border-color: rgba(24, 144, 255, 0.25);
  color: #40a9ff;
}

.control-btn-more:hover:not(.disabled) {
  background: rgba(24, 144, 255, 0.25);
  color: #69c0ff;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.control-btn:hover:not(.disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-text {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 🔥 指示器和徽章 */
.bet-count-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid rgba(0, 0, 0, 0.8);
}

.last-bet-amount {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(82, 196, 26, 0.9);
  color: white;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.commission-status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #52c41a;
  border-radius: 50%;
  animation: statusDotBlink 2s ease-in-out infinite;
}

/* 🔥 动画定义 */
@keyframes undoGlow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.4);
  }
}

@keyframes commissionActive {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.15);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.3);
  }
}

@keyframes statusDotBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 🔥 响应式设计 - 保持原有断点 */
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
