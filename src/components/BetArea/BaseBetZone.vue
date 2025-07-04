<!-- src/components/BetArea/BetZones/BaseBetZone.vue -->
<template>
  <div
    ref="betZoneRef"
    class="bet-zone"
    :class="zoneClasses"
    :style="zoneStyles"
    @click="handleBetClick"
  >
    <!-- 区域头部 -->
    <div class="zone-header">
      <div class="zone-title">{{ config.title }}</div>
      <div class="zone-odds">{{ config.odds }}</div>
    </div>

    <!-- 边注区域内容 -->
    <div v-if="config.type === 'side'" class="bet-info">
      <div class="bet-amount" v-if="betAmount > 0">
        ${{ formatAmount(betAmount) }}
      </div>
      <div class="no-bet-placeholder" v-else>
        -
      </div>
    </div>

    <!-- 主要投注区域内容 -->
    <div v-else class="bet-content">
      <!-- 用户投注金额 -->
      <div class="user-bet-info">
        <div class="user-bet-amount" v-if="displayData.userAmount > 0">
          {{ formatAmount(displayData.userAmount) }}
        </div>
      </div>

      <!-- 其他用户信息 -->
      <div class="other-users-info">
        <div class="user-count">
          <span class="count-icon">👥</span>
          {{ displayData.otherPlayerCount }}
        </div>
        <div class="total-amount">
          <span class="money-icon">💰</span>
          ${{ formatAmount(displayData.otherTotalAmount) }}
        </div>
      </div>
    </div>

    <!-- 🔥 修改：垂直堆叠的筹码显示 -->
    <div class="chips-container" v-if="shouldShowChips">
      <div class="chip-stack">
        <img
          v-for="(chip, index) in chipImages.slice(0, 6)"
          :key="`chip-${index}`"
          :src="chip.image"
          :alt="`${chip.value}筹码`"
          class="chip-image"
          :style="{
            '--chip-index': chipImages.length - index,
            animationDelay: `${index * 50}ms`
          }"
        />

        <!-- 🔥 筹码数量徽章 -->
        <div
          v-if="chipImages.length > 6"
          class="chip-count-badge"
          :title="`总共${chipImages.length}个筹码`"
        >
          {{ chipImages.length }}
        </div>
      </div>
    </div>

    <!-- 中奖效果 -->
    <div class="win-effect" v-if="showWinEffect">
      <div class="win-amount">+${{ formatAmount(winAmount) }}</div>
    </div>

    <!-- 状态提示 -->
    <div class="bet-status-indicator" v-if="statusMessage">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'
import type { BetZoneConfig } from '@/configs/betZoneConfigs'
import { THEME_COLORS, LAYOUT_CONFIG } from '@/configs/betZoneConfigs'

// 🔥 新增：导入音频服务
import { useAudio } from '@/services/Audio'

// 🔥 内部定义类型，避免导入复杂性
type BaccaratBetType =
  | 'banker' | 'player' | 'tie' | 'banker-pair'
  | 'player-pair' | 'lucky-6' | 'dragon-7' | 'panda-8'

// Props
interface Props {
  config: BetZoneConfig
}

const props = defineProps<Props>()
const bettingStore = useBettingStore()

// 🔥 新增：使用音频组合式函数
const { playAudioFile } = useAudio()

// 🔥 新增：组件引用
const betZoneRef = ref<HTMLElement>()

// 响应式状态
const isWinning = ref(false)
const isLosing = ref(false)
const showWinEffect = ref(false)
const winAmount = ref(0)
const statusMessage = ref('')

// 🎯 核心计算属性
const betAmount = computed(() => {
  return bettingStore.currentBets[props.config.id as BaccaratBetType] || 0
})

const hasActiveBet = computed(() => {
  return betAmount.value > 0
})

const isBlinking = computed(() => {
  return bettingStore.isZoneBlinking?.(props.config.id as BaccaratBetType) || false
})

// 🎨 样式计算
const zoneClasses = computed(() => {
  const layoutClass = LAYOUT_CONFIG[props.config.category].className
  const themeClass = `${props.config.theme}-theme`
  const typeClass = `${props.config.type}-zone`

  return [
    layoutClass,
    themeClass,
    typeClass,
    {
      'active': hasActiveBet.value,
      'winning': isWinning.value,
      'losing': isLosing.value,
      'blinking': isBlinking.value
    }
  ]
})

const zoneStyles = computed(() => {
  const theme = THEME_COLORS[props.config.theme]
  const layout = LAYOUT_CONFIG[props.config.category]

  return {
    background: theme.gradient,
    borderColor: theme.border,
    padding: layout.padding,
    fontSize: layout.fontSize,
    height: layout.height
  }
})

// 🎲 筹码和显示逻辑
const shouldShowChips = computed(() => {
  if (props.config.type === 'side') {
    return betAmount.value > 0
  } else {
    return displayData.value.userAmount > 0
  }
})

const chipImages = computed(() => {
  if (props.config.type === 'side') {
    return bettingStore.getChipImages?.(betAmount.value) || []
  } else {
    return displayData.value.chipImages || []
  }
})

const displayData = computed(() => {
  if (props.config.type === 'main') {
    return bettingStore.getBetZoneDisplayData?.(props.config.id as BaccaratBetType) || {
      userAmount: 0,
      otherPlayerCount: 0,
      otherTotalAmount: 0,
      chipImages: []
    }
  }
  return {
    userAmount: 0,
    otherPlayerCount: 0,
    otherTotalAmount: 0,
    chipImages: []
  }
})

// 🔥 新增：播放音效的方法
const playChipSound = async (): Promise<void> => {
  try {
    await playAudioFile('/src/assets/audio/chip.mp3', {
      volume: 0.7, // 适中的音量
    })
  } catch (error) {
    console.warn('播放筹码音效失败:', error)
  }
}

// 🔥 新增：获取筹码选择器位置的方法
const getChipSelectorPosition = (): { x: number; y: number } | null => {
  try {
    // 尝试多种可能的筹码选择器选择器
    const possibleSelectors = [
      '[class*="chip-selector"]',
      '[class*="chip-area"]',
      '[class*="betting-panel"]',
      '.chip-container',
      '.chips-panel',
      // 根据图片推测可能的类名
      '.betting-chips',
      '.game-chips',
      '[data-testid="chip-selector"]'
    ]

    let chipSelector: HTMLElement | null = null

    for (const selector of possibleSelectors) {
      chipSelector = document.querySelector(selector)
      if (chipSelector) break
    }

    // 如果找不到筹码选择器，尝试查找包含数字10、50、100的元素
    if (!chipSelector) {
      const allElements = document.querySelectorAll('*')
      for (const element of allElements) {
        const text = element.textContent?.trim()
        if (text && ['10', '50', '100'].includes(text)) {
          const parent = element.closest('[class*="chip"]') || element.parentElement
          if (parent && (parent as HTMLElement).offsetWidth > 0 && (parent as HTMLElement).offsetHeight > 0) {
            chipSelector = parent as HTMLElement
            break
          }
        }
      }
    }

    // 如果还是找不到，使用屏幕底部中心作为默认位置
    if (!chipSelector) {
      console.warn('未找到筹码选择器，使用默认位置')
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight - 100
      }
    }

    const rect = chipSelector.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  } catch (error) {
    console.error('获取筹码选择器位置失败:', error)
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight - 100
    }
  }
}

// 🔥 新增：获取当前选中筹码信息的方法
const getCurrentChipInfo = (): { value: number; image: string } => {
  try {
    // 从 bettingStore 获取当前选中的筹码
    const currentChipValue = bettingStore.selectedChip || 10

    // 获取筹码图片 - 使用 bettingStore 中的方法或映射
    let chipImage = ''

    // 尝试从 displayChips 或 availableChips 中找到对应的筹码图片
    const displayChips = bettingStore.getDisplayChipsData || bettingStore.displayChips || []
    const matchedChip = displayChips.find((chip: any) => chip.value === currentChipValue)

    if (matchedChip && matchedChip.image) {
      chipImage = matchedChip.image
    } else {
      // 使用 CHIP_IMAGE_MAP 的映射格式
      chipImage = `/src/assets/images/chips/chip-${currentChipValue}.png`
    }

    return {
      value: currentChipValue,
      image: chipImage
    }
  } catch (error) {
    console.error('获取当前筹码信息失败:', error)
    // 返回默认筹码信息
    return {
      value: 10,
      image: '/src/assets/images/chips/chip-10.png'
    }
  }
}

// 🔥 新增：创建筹码飞行动画的方法
const createChipFlyAnimation = async (): Promise<void> => {
  try {
    if (!betZoneRef.value) {
      console.warn('投注区域引用不存在，跳过筹码飞行动画')
      return
    }

    // 获取起点位置（筹码选择器）
    const startPos = getChipSelectorPosition()
    if (!startPos) {
      console.warn('无法获取筹码选择器位置，跳过飞行动画')
      return
    }

    // 获取终点位置（当前投注区域）
    const targetRect = betZoneRef.value.getBoundingClientRect()
    const endPos = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    }

    // 获取当前筹码信息
    const chipInfo = getCurrentChipInfo()

    // 创建飞行筹码元素
    const flyingChip = document.createElement('div')
    flyingChip.className = 'flying-chip'
    flyingChip.innerHTML = `
      <img
        src="${chipInfo.image}"
        alt="${chipInfo.value}筹码"
        style="width: 45px; height: 45px; border-radius: 50%;"
      />
    `

    // 设置初始样式
    Object.assign(flyingChip.style, {
      position: 'fixed',
      left: `${startPos.x - 22.5}px`, // 居中对齐
      top: `${startPos.y - 22.5}px`,
      zIndex: '9999',
      pointerEvents: 'none',
      transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // 平滑的缓动函数
      transform: 'scale(1)',
      opacity: '1'
    })

    // 添加到页面
    document.body.appendChild(flyingChip)

    // 等待一帧确保元素已渲染
    await nextTick()

    // 开始飞行动画
    requestAnimationFrame(() => {
      Object.assign(flyingChip.style, {
        left: `${endPos.x - 22.5}px`,
        top: `${endPos.y - 22.5}px`,
        transform: 'scale(0.8)', // 飞行过程中稍微缩小
      })
    })

    // 动画完成后清理
    setTimeout(() => {
      // 添加消失效果
      Object.assign(flyingChip.style, {
        transform: 'scale(0)',
        opacity: '0',
        transition: 'all 0.2s ease-in'
      })

      // 完全移除元素
      setTimeout(() => {
        if (flyingChip.parentNode) {
          flyingChip.parentNode.removeChild(flyingChip)
        }
      }, 200)
    }, 600) // 飞行动画时长

  } catch (error) {
    console.error('创建筹码飞行动画失败:', error)
  }
}

// 🎯 交互方法
const handleBetClick = async () => {
  // 🔥 新增：并行执行音效和飞行动画
  const audioPromise = playChipSound()
  const animationPromise = createChipFlyAnimation()

  // 🔥 类型安全的投注调用
  try {
    const result = bettingStore.placeBet?.(props.config.id as BaccaratBetType)

    if (result?.success) {
      showStatusMessage(result.message, 'success')

      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      animateClick()
    } else {
      showStatusMessage(result?.message || '投注失败', 'error')
    }
  } catch (error) {
    console.error('投注错误:', error)
    showStatusMessage('投注系统错误', 'error')
  }

  // 🔥 等待音效和动画完成（不阻塞投注逻辑）
  try {
    await Promise.all([audioPromise, animationPromise])
  } catch (error) {
    console.warn('音效或动画执行失败:', error)
  }
}

const animateClick = () => {
  const element = document.querySelector(`.${props.config.theme}-theme`)
  if (element) {
    element.classList.add('clicked')
    setTimeout(() => {
      element.classList.remove('clicked')
    }, 150)
  }
}

const formatAmount = (amount: number | undefined | null): string => {
  return bettingStore.formatAmount?.(amount) || '0'
}

const showStatusMessage = (message: string, type: 'success' | 'error' = 'success') => {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, type === 'success' ? 2000 : 3000)
}

// 🏆 动画方法 (供外部调用)
const showWinAnimation = (amount: number) => {
  winAmount.value = amount
  isWinning.value = true
  showWinEffect.value = true

  setTimeout(() => {
    isWinning.value = false
    showWinEffect.value = false
  }, 3000)
}

const showLoseAnimation = () => {
  isLosing.value = true
  setTimeout(() => {
    isLosing.value = false
  }, 2000)
}

// 暴露方法供父组件调用
defineExpose({
  showWinAnimation,
  showLoseAnimation
})
</script>

<style scoped>
/* 🎯 基础样式 */
.bet-zone {
  position: relative;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid;
  box-sizing: border-box;
}

/* 🎨 布局分类样式 */
.first-row-zone {
  /* 第一排边注区域 */
}

.second-row-zone {
  /* 第二排主要投注区域 */
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
  max-width: 100%;
}

/* 🎯 状态样式 */
.bet-zone:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px var(--theme-hover-color, rgba(0, 0, 0, 0.3));
}

.bet-zone.active {
  border-color: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.4);
}

.bet-zone.winning {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%) !important;
  border-color: #2ecc71 !important;
  animation: winPulse 2s ease-in-out infinite;
}

.bet-zone.losing {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%) !important;
  border-color: #95a5a6 !important;
  animation: losePulse 1s ease-in-out 3;
}

.bet-zone.clicked {
  animation: clickPulse 0.15s ease-out;
}

.bet-zone.blinking {
  animation: blinkEffect 1s ease-in-out infinite;
}

/* 🎯 内容区域样式 */
.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.zone-title {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.zone-odds {
  color: #f1c40f;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid rgba(241, 196, 15, 0.3);
  font-size: 0.8em;
}

/* 边注区域内容 */
.bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 18px;
  flex: 1;
}

.bet-amount {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.no-bet-placeholder {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
}

/* 主要投注区域内容 */
.bet-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.user-bet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 18px;
}

.user-bet-amount {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.other-users-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8em;
}

.user-count,
.total-amount {
  display: flex;
  align-items: center;
  gap: 3px;
}

.count-icon,
.money-icon {
  font-size: 0.9em;
}

.total-amount {
  font-weight: 600;
}

/* 🔥 修改：垂直堆叠的筹码样式 */
.chips-container {
  position: absolute;
  bottom: 6px;
  right: 6px;
  pointer-events: none;
  max-width: 80px;
  max-height: calc(100% - 40px); /* 留出区域标题和投注信息的空间 */
  overflow: hidden;
}

.chip-stack {
  display: flex;
  flex-direction: column; /* 🔥 改为垂直排列 */
  align-items: center;
  justify-content: flex-end; /* 🔥 从底部开始堆叠 */
  gap: 0; /* 移除间距，让筹码紧密堆叠 */
  position: relative;
  height: 100%;
}

.chip-image {
  width: 45px;  /* 🔥 缩小筹码尺寸 */
  height: 45px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;

  /* 🔥 垂直堆叠的关键样式 */
  margin-top: -12px; /* 让筹码重叠，模拟真实堆叠效果 */
  z-index: var(--chip-index, 1);
}

/* 🔥 第一个筹码不需要上边距 */
.chip-image:first-child {
  margin-top: 0;
  z-index: 1;
}

/* 🔥 为每个筹码设置递增的 z-index，确保正确的层叠顺序 */
.chip-image:nth-child(1) { z-index: 6; }
.chip-image:nth-child(2) { z-index: 5; }
.chip-image:nth-child(3) { z-index: 4; }
.chip-image:nth-child(4) { z-index: 3; }
.chip-image:nth-child(5) { z-index: 2; }
.chip-image:nth-child(6) { z-index: 1; }

/* 🔥 hover 效果 - 整个筹码堆的交互 */
.chips-container:hover .chip-image {
  transform: translateY(-2px);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 0 2px rgba(255, 255, 255, 0.2);
}

/* 🔥 筹码计数徽章 */
.chip-count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
}

/* 🔥 筹码堆叠动画效果 */
@keyframes chipStack {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chip-image {
  animation: chipStack 0.3s ease-out;
  animation-fill-mode: both;
}

/* 🔥 新增：飞行筹码的全局样式 */
:global(.flying-chip) {
  pointer-events: none;
  z-index: 9999;
}

:global(.flying-chip img) {
  display: block;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 🏆 效果样式 */
.win-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: winEffect 3s ease-out forwards;
}

.win-amount {
  font-weight: bold;
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 1.1em;
}

.bet-status-indicator {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #f39c12;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  white-space: nowrap;
  z-index: 100;
}

/* 🎬 动画定义 */
@keyframes blinkEffect {
  0%, 50% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
    border-color: #ffd700;
  }
  51%, 100% {
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.6);
  }
}

@keyframes winPulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(46, 204, 113, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(46, 204, 113, 0.8);
  }
}

@keyframes losePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
}

@keyframes clickPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes winEffect {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(1.5);
  }
}

/* 🔥 响应式调整 - 移动端进一步缩小 */
@media (max-width: 768px) {
  .first-row-zone {
    padding: 4px;
    font-size: 11px;
  }

  .first-row-zone .zone-title {
    font-size: 11px;
  }

  .first-row-zone .zone-odds {
    font-size: 8px;
  }

  .second-row-zone {
    padding: 6px;
    font-size: 12px;
  }

  .second-row-zone .zone-title {
    font-size: 16px;
  }

  .chips-container {
    bottom: 4px;
    right: 4px;
    max-width: 60px;
  }

  .chip-image {
    width: 35px;
    height: 35px;
    margin-top: -10px;
  }

  .chip-image:first-child {
    margin-top: 0;
  }

  .chip-count-badge {
    width: 16px;
    height: 16px;
    font-size: 8px;
    top: -6px;
    right: -6px;
  }
}

@media (max-width: 480px) {
  .first-row-zone {
    padding: 3px;
    font-size: 10px;
  }

  .second-row-zone {
    padding: 4px;
    font-size: 11px;
  }

  .second-row-zone .zone-title {
    font-size: 14px;
  }

  .chips-container {
    bottom: 3px;
    right: 3px;
    max-width: 50px;
  }

  .chip-image {
    width: 30px;
    height: 30px;
    margin-top: -8px;
  }

  .chip-count-badge {
    width: 14px;
    height: 14px;
    font-size: 7px;
    top: -5px;
    right: -5px;
  }
}

/* 🔥 为不同主题的投注区域调整筹码位置 */
.main-zone .chips-container {
  bottom: 8px;
  right: 8px;
}

.side-zone .chips-container {
  bottom: 4px;
  right: 4px;
  max-width: 60px;
}

/* 🔥 特别优化：较小的边注区域 */
.side-zone .chip-image {
  width: 32px;
  height: 32px;
  margin-top: -8px;
}
</style>
