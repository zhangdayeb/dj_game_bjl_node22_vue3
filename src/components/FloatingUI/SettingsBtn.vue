<!-- src/components/FloatingUI/SettingsBtn.vue -->
<template>
  <div class="settings-btn">
    <button
      class="settings-button"
      @click="handleSettingsClick"
      :class="{ 'active': uiStore.showSettingsPanel }"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'

// 使用 UI Store
const uiStore = useUIStore()

// 处理设置按钮点击
const handleSettingsClick = () => {
  uiStore.toggleSettingsPanel()
}
</script>

<style scoped>
.settings-btn {
  position: absolute;
  top: 55px;
  right: 65px; /* 在余额按钮左边 */
  z-index: 15;
}

.settings-button {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.settings-button.active {
  background: rgba(64, 169, 255, 0.8);
  border-color: #40a9ff;
  color: white;
}

.settings-button.active:hover {
  background: rgba(64, 169, 255, 0.9);
}

@media (max-width: 768px) {
  .settings-btn {
    top: 48px;
    right: 58px;
  }

  .settings-button {
    width: 36px;
    height: 36px;
  }
}
</style>
