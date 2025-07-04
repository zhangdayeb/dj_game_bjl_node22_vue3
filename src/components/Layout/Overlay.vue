<!-- src/components/Layout/Overlay.vue -->
<template>
  <div class="overlay-system">
    <!-- 特效层 -->
    <transition name="effect-fade">
      <ResultEffect
        v-if="showResultEffect"
        @close="handleResultEffectClose"
      />
    </transition>

    <transition name="effect-fade">
      <WinningEffect
        v-if="showWinningEffect"
        @close="handleWinningEffectClose"
      />
    </transition>

    <!-- 面板层 -->
    <transition name="panel-slide">
      <BettingHistoryModal
        v-if="showBettingHistory"
        @close="handleBettingHistoryClose"
      />
    </transition>

    <transition name="panel-slide">
      <SettingsPanel
        v-if="showSettings"
        @close="handleSettingsClose"
      />
    </transition>

    <!-- 筹码选择器 -->
    <transition name="chip-selector-fade">
      <ChipSelector
        v-if="showChipSelector"
        :availableChips="availableChips"
        :selectedChips="selectedChips"
        :maxSelection="maxSelection"
        @confirm="handleChipSelectorConfirm"
        @cancel="handleChipSelectorCancel"
        @close="handleChipSelectorClose"
      />
    </transition>

    <!-- 通用模态框 -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showModal" @click="handleModalBackdropClick">
        <div class="modal-content" @click.stop>
          <slot name="modal"></slot>
        </div>
      </div>
    </transition>

    <!-- 通知消息 -->
    <transition-group name="notification" tag="div" class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="[
          `notification-${notification.type}`,
          { 'notification-dismissible': notification.dismissible }
        ]"
      >
        <div class="notification-icon">
          <svg v-if="notification.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else-if="notification.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else-if="notification.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div class="notification-content">
          <div class="notification-title" v-if="notification.title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button
          v-if="notification.dismissible"
          class="notification-close"
          @click="dismissNotification(notification.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

// 组件导入
import ResultEffect from '@/components/Effects/ResultEffect.vue'
import WinningEffect from '@/components/Effects/WinningEffect.vue'
import BettingHistoryModal from '@/components/Panels/BettingHistory/BettingHistoryModal.vue'
import SettingsPanel from '@/components/Panels/SettingsPanel.vue'
import ChipSelector from '@/components/Panels/ChipSelector.vue'

// 通知类型
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

// Props
interface Props {
  showResultEffect: boolean
  showWinningEffect: boolean
  showBettingHistory: boolean
  showSettings: boolean
  showChipSelector: boolean
  showModal: boolean
  availableChips: any[]
  selectedChips: string[]
  maxSelection: number
  notifications: Notification[]
}

const props = withDefaults(defineProps<Props>(), {
  showResultEffect: false,
  showWinningEffect: false,
  showBettingHistory: false,
  showSettings: false,
  showChipSelector: false,
  showModal: false,
  availableChips: () => [],
  selectedChips: () => [],
  maxSelection: 5,
  notifications: () => []
})

// Emits
const emit = defineEmits<{
  // 特效事件
  resultEffectClose: []
  winningEffectClose: []

  // 面板事件
  bettingHistoryClose: []
  settingsClose: []

  // 筹码选择器事件
  chipSelectorConfirm: [chipIds: string[]]
  chipSelectorCancel: []
  chipSelectorClose: []

  // 模态框事件
  modalClose: []

  // 通知事件
  notificationDismiss: [id: string]
}>()

// 事件处理
const handleResultEffectClose = () => {
  console.log('🎭 关闭结果特效')
  emit('resultEffectClose')
}

const handleWinningEffectClose = () => {
  console.log('🎉 关闭中奖特效')
  emit('winningEffectClose')
}

const handleBettingHistoryClose = () => {
  console.log('📊 关闭投注记录')
  emit('bettingHistoryClose')
}

const handleSettingsClose = () => {
  console.log('⚙️ 关闭设置面板')
  emit('settingsClose')
}

const handleChipSelectorConfirm = (chipIds: string[]) => {
  console.log('✅ 确认筹码选择:', chipIds)
  emit('chipSelectorConfirm', chipIds)
}

const handleChipSelectorCancel = () => {
  console.log('❌ 取消筹码选择')
  emit('chipSelectorCancel')
}

const handleChipSelectorClose = () => {
  console.log('🔒 关闭筹码选择器')
  emit('chipSelectorClose')
}

const handleModalBackdropClick = () => {
  console.log('🔒 点击模态框背景关闭')
  emit('modalClose')
}

const dismissNotification = (id: string) => {
  console.log(`🔔 关闭通知: ${id}`)
  emit('notificationDismiss', id)
}
</script>

<style scoped>
.overlay-system {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.overlay-system > * {
  pointer-events: auto;
}

/* 模态框样式 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

/* 通知容器 */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  border-left: 4px solid;
  color: white;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.notification-success {
  border-left-color: #52c41a;
}

.notification-error {
  border-left-color: #ff4d4f;
}

.notification-warning {
  border-left-color: #faad14;
}

.notification-info {
  border-left-color: #40a9ff;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-success .notification-icon {
  color: #52c41a;
}

.notification-error .notification-icon {
  color: #ff4d4f;
}

.notification-warning .notification-icon {
  color: #faad14;
}

.notification-info .notification-icon {
  color: #40a9ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: white;
}

.notification-message {
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

.notification-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 动画效果 */
.effect-fade-enter-active,
.effect-fade-leave-active {
  transition: all 0.3s ease;
}

.effect-fade-enter-from,
.effect-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.chip-selector-fade-enter-active,
.chip-selector-fade-leave-active {
  transition: all 0.3s ease;
}

.chip-selector-fade-enter-from,
.chip-selector-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .notification-item {
    min-width: auto;
    max-width: none;
  }
}
</style>
