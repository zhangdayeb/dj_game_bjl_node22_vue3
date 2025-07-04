<!-- src/components/Panels/SettingsPanel.vue -->
<template>
  <div class="settings-panel-overlay" @click="handleOverlayClick">
    <div class="settings-panel" @click.stop>
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </div>
          <h2 class="panel-title">设置</h2>
        </div>
        <button class="close-btn" @click="handleClose">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="panel-content">
        <!-- 音效设置区域 -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </div>
            <h3 class="section-title">音效设置</h3>
          </div>

          <div class="setting-items">
            <!-- 背景音乐开关 -->
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">背景音乐</div>
                <div class="setting-desc">游戏背景音乐开关</div>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input
                    type="checkbox"
                    v-model="bgmEnabled"
                    @change="handleBgmToggle"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <!-- 音效开关 -->
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">音效</div>
                <div class="setting-desc">游戏音效开关</div>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input
                    type="checkbox"
                    v-model="sfxEnabled"
                    @change="handleSfxToggle"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能菜单区域 -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </div>
            <h3 class="section-title">功能菜单</h3>
          </div>

          <div class="menu-items">
            <!-- 投注记录 -->
            <div class="menu-item" @click="handleBettingHistory">
              <div class="menu-icon betting">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <div class="menu-info">
                <div class="menu-label">投注记录</div>
                <div class="menu-desc">查看历史投注记录</div>
              </div>
              <div class="menu-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>

            <!-- 个人中心 -->
            <div class="menu-item" @click="handleVipCenter">
              <div class="menu-icon personal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </div>
              <div class="menu-info">
                <div class="menu-label">个人中心</div>
                <div class="menu-desc">个人信息管理</div>
              </div>
              <div class="menu-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>

            <!-- 客服 -->
            <div class="menu-item" @click="handleCustomerService">
              <div class="menu-icon service">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 3-3V10c0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
              <div class="menu-info">
                <div class="menu-label">客服</div>
                <div class="menu-desc">在线客服支持</div>
              </div>
              <div class="menu-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUIStore } from '@/stores/uiStore'

// UI Store
const uiStore = useUIStore()

// 本地状态 - 这些是组件内部的数据
const bgmEnabled = ref(true)
const sfxEnabled = ref(true)

// 事件定义
const emit = defineEmits<{
  close: []
}>()

// 事件处理
const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const handleBgmToggle = () => {
  console.log(`🎵 背景音乐: ${bgmEnabled.value ? '开启' : '关闭'}`)
  // 这里调用实际的音频控制服务
}

const handleSfxToggle = () => {
  console.log(`🔊 音效: ${sfxEnabled.value ? '开启' : '关闭'}`)
  // 这里调用实际的音效控制服务
}

const handleBettingHistory = () => {
  uiStore.openBettingHistory()
  emit('close') // 关闭当前设置面板
}

const handleVipCenter = () => {
  console.log('👑 跳转会员中心')
  window.open('/vip', '_blank')
}

const handleCustomerService = () => {
  console.log('🎧 联系客服')
  window.open('/customer-service', '_blank')
}
</script>

<style scoped>
.settings-panel-overlay {
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

.settings-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
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
  background: rgba(64, 169, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #40a9ff;
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
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: rgba(255, 255, 255, 0.6);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0;
}

.setting-items,
.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item,
.menu-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.setting-item:hover,
.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-info {
  flex: 1;
}

.setting-label,
.menu-label {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.setting-desc,
.menu-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon.betting {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.menu-icon.personal {
  background: rgba(24, 144, 255, 0.2);
  color: #40a9ff;
}

.menu-icon.service {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.menu-info {
  flex: 1;
}

.menu-arrow {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.menu-item:hover .menu-arrow {
  color: rgba(255, 255, 255, 0.8);
  transform: translateX(2px);
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #40a9ff;
}

input:checked + .slider:before {
  transform: translateX(24px);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-panel-overlay {
    padding: 10px;
  }

  .settings-panel {
    max-width: none;
    width: 95%;
  }

  .panel-header {
    padding: 16px 20px;
  }

  .panel-content {
    padding: 20px;
  }
}
</style>
