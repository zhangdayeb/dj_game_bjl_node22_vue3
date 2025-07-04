<!-- src/components/Layout/Middle.vue -->
<template>
  <div class="middle-section" :style="middleSectionStyles">
    <!-- 投注区域布局 -->
    <div class="betting-area-wrapper">
      <BettingAreaLayout />
    </div>

    <!-- 筹码显示区域 -->
    <ChipDisplay
      :selectedChips="bettingStore.getDisplayChipsData || []"
      :currentChip="bettingStore.selectedChip || 10"
      :canUndo="canUndo"
      :canRepeat="bettingStore.hasLastRoundData || false"
      @chipSelect="handleChipSelect"
      @undo="handleUndo"
      @repeat="handleRepeat"
      @more="handleMoreChips"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import { useBettingStore } from '@/stores/bettingStore'

// 组件导入
import BettingAreaLayout from '@/components/BetArea/BettingAreaLayout.vue'
import ChipDisplay from '@/components/BetArea/ChipDisplay.vue'

// Props
interface Props {
  height: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 400
})

// Emits
const emit = defineEmits<{
  chipSelect: [chipValue: number]
  undo: []
  repeat: []
  moreChips: []
}>()

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
    selectChip: () => {},
    undoLastBet: () => {},
    restoreLastRound: () => {}
  }
}

// 计算属性
const canUndo = computed(() => {
  try {
    return bettingStore?.betHistory?.length > 0 || false
  } catch (error) {
    return false
  }
})

// 计算样式
const middleSectionStyles = computed((): CSSProperties => ({
  height: `${props.height}px`,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  flex: 1,
  overflow: 'hidden'
}))

// 事件处理
const handleChipSelect = (chipValue: number) => {
  try {
    bettingStore?.selectChip?.(chipValue)
    console.log(`🎯 选择筹码: ${chipValue}`)
    emit('chipSelect', chipValue)
  } catch (error) {
    console.error('❌ 选择筹码失败:', error)
  }
}

const handleUndo = () => {
  try {
    bettingStore?.undoLastBet?.()
    console.log('↩️ 执行撤销操作')
    emit('undo')
  } catch (error) {
    console.error('❌ 撤销失败:', error)
  }
}

const handleRepeat = () => {
  try {
    bettingStore?.restoreLastRound?.()
    console.log('🔄 执行重复操作')
    emit('repeat')
  } catch (error) {
    console.error('❌ 重复投注失败:', error)
  }
}

const handleMoreChips = () => {
  console.log('📱 打开筹码选择器')
  emit('moreChips')
}
</script>

<style scoped>
.middle-section {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  flex: 1;
  overflow: hidden;
}

.betting-area-wrapper {
  flex: 1;
  overflow: hidden;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .middle-section {
    padding: 8px;
  }

  .betting-area-wrapper {
    margin-bottom: 8px;
  }
}
</style>
