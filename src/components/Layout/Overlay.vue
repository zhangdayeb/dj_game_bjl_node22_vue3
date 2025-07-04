<!-- src/components/Layout/Overlay.vue -->
<template>
  <div class="overlay-system">
    <!-- 1. 历史投注记录面板 -->
    <transition name="panel-fade">
      <BettingHistoryPanel
        v-if="uiStore.showBettingHistory"
        @close="uiStore.closeBettingHistory"
      />
    </transition>

    <!-- 2. 设置控制面板 -->
    <transition name="panel-fade">
      <SettingsPanel
        v-if="uiStore.showSettingsPanel"
        @close="uiStore.closeSettingsPanel"
      />
    </transition>

    <!-- 3. 开牌效果 -->
    <transition name="effect-fade">
      <ResultEffect
        v-if="uiStore.showResultEffect"
        @close="uiStore.hideCardResult"
        @complete="uiStore.hideCardResult"
      />
    </transition>

    <!-- 4. 中奖效果 -->
    <transition name="effect-fade">
      <WinningEffect
        v-if="uiStore.showWinningEffect"
        @finished="uiStore.hideWinEffect"
      />
    </transition>

    <!-- 5. 筹码选择器 -->
    <transition name="panel-fade">
      <ChipSelector
        v-if="uiStore.showChipSelector"
        @close="uiStore.closeChipSelector"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'

// 组件导入
import BettingHistoryPanel from '@/components/Panels/BettingHistoryPanel.vue'
import SettingsPanel from '@/components/Panels/SettingsPanel.vue'
import ResultEffect from '@/components/Effects/ResultEffect.vue'
import WinningEffect from '@/components/Effects/WinningEffect.vue'
import ChipSelector from '@/components/Panels/ChipSelector.vue'

// 使用 UI Store
const uiStore = useUIStore()

// 键盘事件监听 - ESC 关闭面板
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    uiStore.closeAllPanels()
  }
}

// 生命周期
onMounted(() => {
  console.log('🎯 Overlay 组件已挂载')
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  console.log('🎯 Overlay 组件已卸载')
  document.removeEventListener('keydown', handleKeydown)
})

// 开发模式暴露调试方法
if (import.meta.env.DEV) {
  ;(window as any).uiDebug = {
    uiStore,
    openBettingHistory: uiStore.openBettingHistory,
    openSettingsPanel: uiStore.openSettingsPanel,
    showCardResult: uiStore.showCardResult,
    showWinEffect: uiStore.showWinEffect,
    openChipSelector: uiStore.openChipSelector,
    closeAll: uiStore.closeAllPanels
  }
  console.log('🐛 UI调试工具已添加到 window.uiDebug')
}
</script>

<style scoped>
.overlay-system {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.overlay-system > * {
  pointer-events: auto;
}

/* 面板过渡动画 */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.3s ease;
}

.panel-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 特效过渡动画 */
.effect-fade-enter-active,
.effect-fade-leave-active {
  transition: all 0.3s ease;
}

.effect-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.effect-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
