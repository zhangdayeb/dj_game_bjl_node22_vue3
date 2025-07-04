<!-- src/components/FloatingUI/SettingsBtn.vue -->
<template>
  <div class="settings-btn" ref="settingsRef">
    <button class="settings-trigger" @click="toggleSettings" :class="{ 'active': showPanel }">
      <div class="hamburger-menu" :class="{ 'active': showPanel }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- 设置面板 -->
    <div class="settings-panel" :class="{ 'show': showPanel }">
      <div class="panel-header">
        <h3>设置</h3>
        <button class="close-btn" @click="closeSettings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="panel-content">
        <!-- 音效设置 -->
        <div class="settings-section">
          <h4>音效设置</h4>
          <div class="setting-item">
            <span class="setting-label">背景音乐</span>
            <label class="switch">
              <input type="checkbox" v-model="bgmEnabled" @change="handleBgmToggle">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <span class="setting-label">音效</span>
            <label class="switch">
              <input type="checkbox" v-model="sfxEnabled" @change="handleSfxToggle">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="settings-section">
          <h4>功能菜单</h4>
          <div class="menu-item" @click="handleBettingHistory">
            <div class="menu-icon">💰</div>
            <span class="menu-label">投注记录</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="handleVipCenter">
            <div class="menu-icon">👑</div>
            <span class="menu-label">会员中心</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="handleCustomerService">
            <div class="menu-icon">🎧</div>
            <span class="menu-label">在线客服</span>
            <span class="menu-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  initialBgmEnabled?: boolean
  initialSfxEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialBgmEnabled: true,
  initialSfxEnabled: true
})

// Emits
const emit = defineEmits<{
  bgmToggle: [enabled: boolean]
  sfxToggle: [enabled: boolean]
  bettingHistory: []
  vipCenter: []
  customerService: []
}>()

// 响应式数据
const showPanel = ref(false)
const bgmEnabled = ref(props.initialBgmEnabled)
const sfxEnabled = ref(props.initialSfxEnabled)
const settingsRef = ref<HTMLDivElement>()

// 方法
const toggleSettings = () => {
  showPanel.value = !showPanel.value
}

const closeSettings = () => {
  showPanel.value = false
}

const handleBgmToggle = () => {
  emit('bgmToggle', bgmEnabled.value)
}

const handleSfxToggle = () => {
  emit('sfxToggle', sfxEnabled.value)
}

const handleBettingHistory = () => {
  emit('bettingHistory')
  closeSettings()
}

const handleVipCenter = () => {
  emit('vipCenter')
  closeSettings()
}

const handleCustomerService = () => {
  emit('customerService')
  closeSettings()
}

const handleClickOutside = (event: Event) => {
  if (settingsRef.value && !settingsRef.value.contains(event.target as Node)) {
    showPanel.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.settings-btn {
  position: absolute;
  top: 95px;
  right: 15px;
  z-index: 20;
}

.settings-trigger {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  animation: slideInRight 0.3s ease-out;
}

.settings-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.settings-trigger.active {
  background: rgba(24, 144, 255, 0.2);
  border-color: rgba(24, 144, 255, 0.4);
}

.hamburger-menu {
  width: 16px;
  height: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-menu span {
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.hamburger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.settings-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 240px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-panel.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
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
}

.panel-content {
  padding: 16px 20px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.setting-label {
  font-size: 13px;
  color: white;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
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
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.3s;
  border-radius: 18px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #40a9ff;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  padding-left: 8px;
  padding-right: 8px;
}

.menu-icon {
  font-size: 16px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 13px;
  color: white;
}

.menu-arrow {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-btn {
    top: 85px;
    right: 12px;
  }

  .settings-trigger {
    width: 36px;
    height: 36px;
  }

  .hamburger-menu {
    width: 14px;
    height: 14px;
  }

  .settings-panel {
    width: 220px;
  }

  .panel-header {
    padding: 14px 16px;
  }

  .panel-content {
    padding: 14px 16px;
  }
}

@media (max-width: 480px) {
  .settings-btn {
    top: 75px;
    right: 10px;
  }

  .settings-trigger {
    width: 32px;
    height: 32px;
  }

  .hamburger-menu {
    width: 12px;
    height: 12px;
  }

  .settings-panel {
    width: 200px;
    right: -10px;
  }

  .panel-header {
    padding: 12px 14px;
  }

  .panel-header h3 {
    font-size: 14px;
  }

  .close-btn {
    width: 24px;
    height: 24px;
  }

  .panel-content {
    padding: 12px 14px;
  }

  .settings-section h4 {
    font-size: 13px;
  }

  .setting-label,
  .menu-label {
    font-size: 12px;
  }
}
</style>
