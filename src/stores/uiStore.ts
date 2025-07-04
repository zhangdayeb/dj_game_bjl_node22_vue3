// src/stores/uiStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // ===================== UI 显示状态控制 =====================

  // 1. 历史投注记录面板
  const showBettingHistory = ref(false)

  // 2. 设置控制面板
  const showSettingsPanel = ref(false)

  // 3. 开牌效果
  const showResultEffect = ref(false)

  // 4. 中奖效果
  const showWinningEffect = ref(false)

  // 5. 筹码选择器
  const showChipSelector = ref(false)

  // ===================== 计算属性 =====================
  const hasAnyPanelOpen = computed(() => {
    return showSettingsPanel.value ||
           showBettingHistory.value ||
           showChipSelector.value ||
           showResultEffect.value ||
           showWinningEffect.value
  })

  // ===================== 1. 历史投注记录方法 =====================
  const openBettingHistory = () => {
    showBettingHistory.value = true
    console.log('📊 打开投注记录')
  }

  const closeBettingHistory = () => {
    showBettingHistory.value = false
    console.log('📊 关闭投注记录')
  }

  const toggleBettingHistory = () => {
    showBettingHistory.value = !showBettingHistory.value
    console.log(`📊 切换投注记录: ${showBettingHistory.value ? '打开' : '关闭'}`)
  }

  // ===================== 2. 设置面板方法 =====================
  const openSettingsPanel = () => {
    showSettingsPanel.value = true
    console.log('🎛️ 打开设置面板')
  }

  const closeSettingsPanel = () => {
    showSettingsPanel.value = false
    console.log('🎛️ 关闭设置面板')
  }

  const toggleSettingsPanel = () => {
    showSettingsPanel.value = !showSettingsPanel.value
    console.log(`🎛️ 切换设置面板: ${showSettingsPanel.value ? '打开' : '关闭'}`)
  }

  // ===================== 3. 开牌效果方法 =====================
  const showCardResult = () => {
    showResultEffect.value = true
    console.log('🎴 显示开牌效果')
  }

  const hideCardResult = () => {
    showResultEffect.value = false
    console.log('🎴 关闭开牌效果')
  }

  // ===================== 4. 中奖效果方法 =====================
  const showWinEffect = () => {
    showWinningEffect.value = true
    console.log('🎉 显示中奖效果')
  }

  const hideWinEffect = () => {
    showWinningEffect.value = false
    console.log('🎉 关闭中奖效果')
  }

  // ===================== 5. 筹码选择器方法 =====================
  const openChipSelector = () => {
    showChipSelector.value = true
    console.log('🎰 打开筹码选择器')
  }

  const closeChipSelector = () => {
    showChipSelector.value = false
    console.log('🎰 关闭筹码选择器')
  }

  const toggleChipSelector = () => {
    showChipSelector.value = !showChipSelector.value
    console.log(`🎰 切换筹码选择器: ${showChipSelector.value ? '打开' : '关闭'}`)
  }

  // ===================== 通用方法 =====================
  const closeAllPanels = () => {
    showSettingsPanel.value = false
    showBettingHistory.value = false
    showChipSelector.value = false
    showResultEffect.value = false
    showWinningEffect.value = false
    console.log('🎯 关闭所有面板')
  }

  const closeAllModals = () => {
    showSettingsPanel.value = false
    showBettingHistory.value = false
    showChipSelector.value = false
    console.log('🎯 关闭所有模态框')
  }

  return {
    // =================== 状态 ===================
    showBettingHistory,
    showSettingsPanel,
    showResultEffect,
    showWinningEffect,
    showChipSelector,

    // =================== 计算属性 ===================
    hasAnyPanelOpen,

    // =================== 历史投注记录 ===================
    openBettingHistory,
    closeBettingHistory,
    toggleBettingHistory,

    // =================== 设置面板 ===================
    openSettingsPanel,
    closeSettingsPanel,
    toggleSettingsPanel,

    // =================== 开牌效果 ===================
    showCardResult,
    hideCardResult,

    // =================== 中奖效果 ===================
    showWinEffect,
    hideWinEffect,

    // =================== 筹码选择器 ===================
    openChipSelector,
    closeChipSelector,
    toggleChipSelector,

    // =================== 通用方法 ===================
    closeAllPanels,
    closeAllModals
  }
})
