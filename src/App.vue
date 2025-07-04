<template>
  <div id="app">
    <!-- 全局配置提供者 -->
    <n-config-provider
      :theme="gameTheme"
      :theme-overrides="themeOverrides"
    >
      <!-- 全局消息提供者 -->
      <n-message-provider>
        <n-notification-provider>
          <!-- 主应用内容 -->
          <div class="app-container">
            <!-- 主游戏区域 - 后续用你的专门布局替换 -->
            <GameSection />
          </div>
        </n-notification-provider>
      </n-message-provider>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NNotificationProvider,
  darkTheme
} from 'naive-ui'

// 引入你的专门布局组件
import GameSection from '@/components/Layout/GameSection.vue'

// 主题配置
const gameTheme = computed(() => darkTheme)

// 主题覆盖配置
const themeOverrides = {
  common: {
    primaryColor: '#27ae60',
    primaryColorHover: '#2ecc71',
    primaryColorPressed: '#229954',

    errorColor: '#e74c3c',
    warningColor: '#f39c12',
    successColor: '#27ae60',

    textColorBase: '#ffffff',
    textColor1: 'rgba(255, 255, 255, 0.95)',
    textColor2: 'rgba(255, 255, 255, 0.82)',

    baseColor: 'rgba(13, 40, 24, 0.95)',
    modalColor: 'rgba(0, 0, 0, 0.9)',
  }
}
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b4332 100%);
}
</style>
