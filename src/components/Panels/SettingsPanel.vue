<!-- src/components/Panels/SettingsPanel.vue -->
<template>
  <div class="settings-panel-overlay" @click="handleOverlayClick">
    <div class="settings-panel" @click.stop>
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">背景音乐</div>
                <div class="setting-desc">游戏背景音乐开关</div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="bgmEnabled"
                  @change="handleBgmToggle"
                >
                <span class="slider">
                  <span class="slider-thumb"></span>
                </span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">音效</div>
                <div class="setting-desc">游戏音效开关</div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="sfxEnabled"
                  @change="handleSfxToggle"
                >
                <span class="slider">
                  <span class="slider-thumb"></span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- 功能菜单区域 -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 class="section-title">功能菜单</h3>
          </div>

          <div class="menu-items">
            <div class="menu-item" @click="handleRecharge">
              <div class="menu-icon recharge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              </div>
              <div class="menu-info">
                <div class="menu-label">充值</div>
                <div class="menu-desc">账户充值</div>
              </div>
              <div class="menu-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>

            <div class="menu-item" @click="handlePersonalCenter">
              <div class="menu-icon personal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
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

// Props
interface Props {
  show?: boolean
  initialBgmEnabled?: boolean
  initialSfxEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  initialBgmEnabled: true,
  initialSfxEnabled: true
})

// Emits
const emit = defineEmits<{
  close: []
  bgmToggle: [enabled: boolean]
  sfxToggle: [enabled: boolean]
}>()

// 响应式数据
const bgmEnabled = ref(props.initialBgmEnabled)
const sfxEnabled = ref(props.initialSfxEnabled)

// 方法
const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const handleBgmToggle = () => {
  console.log('🎵 背景音乐切换:', bgmEnabled.value)
  emit('bgmToggle', bgmEnabled.value)
}

const handleSfxToggle = () => {
  console.log('🔊 音效切换:', sfxEnabled.value)
  emit('sfxToggle', sfxEnabled.value)
}

const handleRecharge = () => {
  console.log('💳 跳转充值页面')
  window.open('https://www.google.com', '_blank')
}

const handlePersonalCenter = () => {
  console.log('👤 跳转个人中心')
  window.open('https://www.google.com', '_blank')
}

const handleCustomerService = () => {
  console.log('🎧 跳转客服页面')
  window.open('https://www.google.com', '_blank')
}
</script>

<style scoped>
.settings-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.settings-panel {
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 32px;
  height: 32px;
  background: rgba(24, 144, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #40a9ff;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.05);
}

.panel-content {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
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
  gap: 12px;
  margin-bottom: 16px;
}

.section-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.setting-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.setting-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.switch {
  position: relative;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 26px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.slider-thumb {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background: #40a9ff;
  border-color: #40a9ff;
}

input:checked + .slider .slider-thumb {
  transform: translateX(22px);
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
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

.menu-icon.recharge {
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
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-label {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.menu-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.menu-arrow {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.menu-item:hover .menu-arrow {
  color: rgba(255, 255, 255, 0.8);
  transform: translateX(2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
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
  .settings-panel {
    width: 95%;
    max-width: none;
  }

  .panel-header {
    padding: 16px 20px;
  }

  .panel-title {
    font-size: 16px;
  }

  .panel-content {
    padding: 20px;
  }

  .settings-section {
    margin-bottom: 24px;
  }

  .setting-item,
  .menu-item {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .settings-panel {
    width: 98%;
    border-radius: 12px;
  }

  .panel-header {
    padding: 14px 16px;
  }

  .header-icon {
    width: 28px;
    height: 28px;
  }

  .panel-title {
    font-size: 15px;
  }

  .close-btn {
    width: 32px;
    height: 32px;
  }

  .panel-content {
    padding: 16px;
  }

  .settings-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 15px;
  }

  .setting-item,
  .menu-item {
    padding: 10px;
  }

  .menu-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
