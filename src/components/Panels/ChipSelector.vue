<!-- src/components/Panels/ChipSelector.vue -->
<template>
  <div class="chip-selector-overlay" @click="handleOverlayClick">
    <div class="chip-selector-panel" @click.stop>
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </div>
          <h2 class="panel-title">选择筹码</h2>
        </div>
        <button class="close-btn" @click="handleClose">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="panel-content">
        <!-- 当前选中显示 -->
        <div class="current-selection">
          <div class="selection-label">当前选中筹码</div>
          <div class="current-chip" v-if="selectedChip">
            <div class="chip-preview">
              <img :src="selectedChip.image" :alt="selectedChip.name" @error="handleImageError" />
              <div class="chip-glow" :style="{ background: getChipColor(selectedChip.value) + '40' }"></div>
            </div>
            <div class="chip-info">
              <div class="chip-value">${{ selectedChip.displayValue }}</div>
              <div class="chip-name">{{ selectedChip.name }}</div>
            </div>
          </div>
        </div>

        <!-- 筹码分类标签 -->
        <div class="chip-categories">
          <button
            v-for="category in chipCategories"
            :key="category.id"
            class="category-tab"
            :class="{ 'active': currentCategory === category.id }"
            @click="setCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- 筹码网格 -->
        <div class="chip-grid">
          <div
            v-for="chip in filteredChips"
            :key="chip.id"
            class="chip-item"
            :class="{
              'selected': selectedChip?.id === chip.id,
              'affordable': isAffordable(chip.value),
              'disabled': !isAffordable(chip.value)
            }"
            @click="selectChip(chip)"
          >
            <div class="chip-container">
              <div class="chip-image-container">
                <img :src="chip.image" :alt="chip.name" @error="handleImageError" />
                <div class="chip-border" :style="{ borderColor: getChipColor(chip.value) }"></div>
                <div class="chip-glow" :style="{ background: getChipColor(chip.value) + '20' }"></div>

                <!-- 选中标识 -->
                <div v-if="selectedChip?.id === chip.id" class="selected-indicator">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                </div>

                <!-- 不可用遮罩 -->
                <div v-if="!isAffordable(chip.value)" class="disabled-mask">
                  <span class="insufficient-text">余额不足</span>
                </div>
              </div>

              <div class="chip-details">
                <div class="chip-value">${{ chip.displayValue }}</div>
                <div class="chip-name">{{ chip.name }}</div>
              </div>
            </div>

            <!-- 悬浮效果 -->
            <div class="hover-effect" :style="{ background: getChipColor(chip.value) + '10' }"></div>
          </div>
        </div>

        <!-- 快捷金额设置 -->
        <div class="quick-amounts">
          <div class="section-title">快捷选择</div>
          <div class="quick-buttons">
            <button
              v-for="amount in quickAmounts"
              :key="amount"
              class="quick-btn"
              :class="{ 'affordable': currentBalance >= amount }"
              :disabled="currentBalance < amount"
              @click="selectByAmount(amount)"
            >
              ${{ formatDisplayValue(amount) }}
            </button>
          </div>
        </div>

        <!-- 余额信息 -->
        <div class="balance-display">
          <div class="balance-item">
            <span class="label">当前余额:</span>
            <span class="value balance">${{ formatAmount(currentBalance) }}</span>
          </div>
          <div class="balance-item" v-if="bettingStore?.totalBetAmount">
            <span class="label">已投注:</span>
            <span class="value bet-amount">${{ formatAmount(bettingStore.totalBetAmount) }}</span>
          </div>
          <div class="balance-item">
            <span class="label">可用余额:</span>
            <span class="value available">${{ formatAmount(availableBalance) }}</span>
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
            :disabled="!selectedChip"
            @click="confirmSelection"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'

// 类型定义
interface ChipData {
  id: string
  value: number
  name: string
  image: string
  displayValue: string
}

interface ChipCategory {
  id: string
  name: string
  range: [number, number]
}

// 事件定义
const emit = defineEmits<{
  close: []
  chipSelect: [chip: ChipData]
}>()

// Store
const bettingStore = useBettingStore()

// 响应式数据
const selectedChip = ref<ChipData | null>(null)
const currentCategory = ref<string>('common')

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
    { id: 'chip-50000', value: 50000, name: '50K', image: '/src/assets/images/chips/B_50K.png', displayValue: '50K' },
    { id: 'chip-100000', value: 100000, name: '100K', image: '/src/assets/images/chips/B_100K.png', displayValue: '100K' },
    { id: 'chip-200000', value: 200000, name: '200K', image: '/src/assets/images/chips/B_200K.png', displayValue: '200K' },
    { id: 'chip-1000000', value: 1000000, name: '1M', image: '/src/assets/images/chips/B_1M.png', displayValue: '1M' },
    { id: 'chip-5000000', value: 5000000, name: '5M', image: '/src/assets/images/chips/B_5M.png', displayValue: '5M' },
    { id: 'chip-10000000', value: 10000000, name: '10M', image: '/src/assets/images/chips/B_10M.png', displayValue: '10M' },
    { id: 'chip-20000000', value: 20000000, name: '20M', image: '/src/assets/images/chips/B_20M.png', displayValue: '20M' },
    { id: 'chip-50000000', value: 50000000, name: '50M', image: '/src/assets/images/chips/B_50M.png', displayValue: '50M' },
    { id: 'chip-100000000', value: 100000000, name: '100M', image: '/src/assets/images/chips/B_100M.png', displayValue: '100M' },
    { id: 'chip-200000000', value: 200000000, name: '200M', image: '/src/assets/images/chips/B_200M.png', displayValue: '200M' },
    { id: 'chip-500000000', value: 500000000, name: '500M', image: '/src/assets/images/chips/B_500M.png', displayValue: '500M' },
    { id: 'chip-1000000000', value: 1000000000, name: '1000M', image: '/src/assets/images/chips/B_1000M.png', displayValue: '1000M' }
  ]
})

// 当前余额
const currentBalance = computed(() => {
  return bettingStore?.balance || 50000
})

// 可用余额
const availableBalance = computed(() => {
  const totalBets = bettingStore?.totalBetAmount || 0
  return Math.max(0, currentBalance.value - totalBets)
})

// 筹码分类
const chipCategories: ChipCategory[] = [
  { id: 'common', name: '常用', range: [1, 1000] },
  { id: 'medium', name: '中等', range: [1000, 100000] },
  { id: 'high', name: '高额', range: [100000, 10000000] },
  { id: 'vip', name: 'VIP', range: [10000000, 1000000000] }
]

// 过滤后的筹码
const filteredChips = computed(() => {
  const category = chipCategories.find(cat => cat.id === currentCategory.value)
  if (!category) return availableChips.value

  return availableChips.value.filter(chip =>
    chip.value >= category.range[0] && chip.value <= category.range[1]
  )
})

// 快捷金额
const quickAmounts = computed(() => {
  // 根据余额动态生成快捷金额
  const balance = currentBalance.value
  if (balance >= 1000000) {
    return [1000, 10000, 100000, 1000000, 10000000]
  } else if (balance >= 100000) {
    return [100, 1000, 10000, 100000, 1000000]
  } else if (balance >= 10000) {
    return [50, 500, 1000, 5000, 10000]
  } else if (balance >= 1000) {
    return [10, 50, 100, 500, 1000]
  } else {
    return [1, 5, 10, 50, 100]
  }
})

// 方法
const isAffordable = (amount: number): boolean => {
  return availableBalance.value >= amount
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDisplayValue = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(0)}B`
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`
  } else {
    return amount.toString()
  }
}

const getChipColor = (value: number): string => {
  // 根据筹码面额返回颜色
  if (value >= 1000000000) return '#ff0080' // 粉红色 - 超级高额
  if (value >= 100000000) return '#8b00ff'  // 紫色 - 极高额
  if (value >= 10000000) return '#ff4500'   // 橙红色 - 超高额
  if (value >= 1000000) return '#ffd700'    // 金色 - 高额
  if (value >= 100000) return '#ff6b35'     // 橙色
  if (value >= 10000) return '#e74c3c'      // 红色
  if (value >= 1000) return '#9b59b6'       // 紫色
  if (value >= 500) return '#e67e22'        // 橙色
  if (value >= 100) return '#3498db'        // 蓝色
  if (value >= 50) return '#2ecc71'         // 绿色
  if (value >= 20) return '#f39c12'         // 黄色
  if (value >= 10) return '#1abc9c'         // 青色
  if (value >= 5) return '#e74c3c'          // 红色
  return '#95a5a6' // 灰色 - 小额
}

const setCategory = (categoryId: string) => {
  currentCategory.value = categoryId
  console.log('🏷️ 切换筹码分类:', categoryId)
}

const selectChip = (chip: ChipData) => {
  if (!isAffordable(chip.value)) {
    console.log('💰 余额不足，无法选择此筹码')
    return
  }

  selectedChip.value = chip
  console.log('🎰 选择筹码:', chip)
}

const selectByAmount = (amount: number) => {
  // 找到最接近的筹码面额
  const closestChip = availableChips.value
    .filter(chip => chip.value <= amount && isAffordable(chip.value))
    .sort((a, b) => Math.abs(amount - a.value) - Math.abs(amount - b.value))[0]

  if (closestChip) {
    selectChip(closestChip)
  }
}

const confirmSelection = () => {
  if (selectedChip.value) {
    // 更新 bettingStore 的选中筹码
    if (bettingStore?.selectChip) {
      bettingStore.selectChip(selectedChip.value.value)
    }

    emit('chipSelect', selectedChip.value)
    console.log('✅ 确认选择筹码:', selectedChip.value)
  }
}

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认占位图
  img.src = '/src/assets/images/chips/default.png'
  console.warn('⚠️ 筹码图片加载失败:', img.alt)
}

// 生命周期
onMounted(() => {
  // 默认选择当前选中的筹码
  const currentSelectedValue = bettingStore?.selectedChip || 10
  const defaultChip = availableChips.value.find(chip => chip.value === currentSelectedValue)

  if (defaultChip && isAffordable(defaultChip.value)) {
    selectedChip.value = defaultChip
  } else {
    // 如果当前选中的筹码不可用，选择第一个可用的筹码
    const firstAffordable = availableChips.value.find(chip => isAffordable(chip.value))
    if (firstAffordable) {
      selectedChip.value = firstAffordable
    }
  }

  console.log('🎰 筹码选择器组件挂载', {
    selectedChip: selectedChip.value,
    balance: currentBalance.value,
    availableChipsCount: availableChips.value.length
  })
})
</script>

<style scoped>
.chip-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: overlayFadeIn 0.3s ease-out;
}

.chip-selector-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  animation: panelSlideIn 0.3s ease-out;
}

.panel-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 32px;
  height: 32px;
  background: rgba(147, 84, 222, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9254de;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
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

.panel-content {
  padding: 24px;
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.current-selection {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: center;
}

.selection-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.current-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.chip-preview {
  position: relative;
  width: 60px;
  height: 60px;
}

.chip-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.chip-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  animation: chipGlow 2s ease-in-out infinite;
}

.chip-info {
  text-align: left;
}

.chip-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.chip-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.chip-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.category-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.category-tab.active {
  background: rgba(147, 84, 222, 0.3);
  border-color: #9254de;
  color: #d3adf7;
}

.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.chip-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chip-item:hover {
  transform: translateY(-4px);
}

.chip-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.chip-item.disabled:hover {
  transform: none;
}

.chip-container {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chip-item.selected .chip-container {
  border-color: #9254de;
  background: rgba(146, 84, 222, 0.1);
  box-shadow: 0 0 20px rgba(146, 84, 222, 0.3);
}

.chip-item.affordable:hover .chip-container {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.chip-image-container {
  position: relative;
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
}

.chip-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.chip-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.chip-item.selected .chip-border {
  border-color: currentColor;
  animation: borderPulse 2s ease-in-out infinite;
}

.selected-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  animation: checkmarkBounce 0.3s ease-out;
}

.disabled-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #ff4d4f;
  text-align: center;
  padding: 4px;
}

.chip-details {
  color: white;
}

.chip-details .chip-value {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.chip-details .chip-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.chip-item:hover .hover-effect {
  opacity: 1;
}

.quick-amounts {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 12px;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.quick-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.quick-btn.affordable {
  color: white;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.balance-display {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.balance-item:last-child {
  margin-bottom: 0;
}

.balance-item .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.balance-item .value {
  font-size: 16px;
  font-weight: 600;
}

.balance-item .value.balance {
  color: #52c41a;
}

.balance-item .value.bet-amount {
  color: #faad14;
}

.balance-item .value.available {
  color: #1890ff;
}

.panel-footer {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 80px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.btn-primary {
  background: #9254de;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #b37feb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(146, 84, 222, 0.3);
}

/* 动画 */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes chipGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes borderPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
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
    max-width: none;
    width: 95%;
  }

  .panel-content {
    padding: 20px;
  }

  .chip-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 12px;
  }

  .chip-image-container {
    width: 60px;
    height: 60px;
  }

  .chip-categories {
    flex-wrap: wrap;
  }

  .category-tab {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .chip-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
  }

  .chip-image-container {
    width: 50px;
    height: 50px;
  }

  .chip-details .chip-value {
    font-size: 14px;
  }

  .chip-details .chip-name {
    font-size: 11px;
  }

  .quick-buttons {
    justify-content: center;
  }

  .current-chip {
    flex-direction: column;
    gap: 8px;
  }

  .chip-preview {
    width: 50px;
    height: 50px;
  }
}
</style>
