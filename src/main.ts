// src/main.ts
import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 🎨 Naive UI 按需导入（推荐）
// import {
//   // Layout
//   NLayout, NLayoutHeader, NLayoutSider, NLayoutContent,
//   // Button
//   NButton, NButtonGroup,
//   // Form
//   NForm, NFormItem, NInput, NSelect,
//   // Data Display
//   NTable, NCard, NList, NListItem,
//   // Feedback
//   NMessage, NNotification, NModal, NDrawer,
//   // Navigation
//   NMenu, NTabs, NTabPane, NBreadcrumb,
//   // Other
//   NIcon, NBadge, NTag, NSpace, NGrid, NGridItem,
//   // Provider
//   NConfigProvider, NMessageProvider, NNotificationProvider
// } from 'naive-ui'

// 🎨 或者完整导入（简单但包体积大）
import naive from 'naive-ui'

// 🔧 VueUse 核心功能（按需导入，性能更好）
// import { useMouse, useWindowSize, useLocalStorage } from '@vueuse/core'

// 🔥 创建 Vue 应用实例
const app = createApp(App)

// 🍍 创建 Pinia 实例
const pinia = createPinia()

// 🍍 注册 Pinia（必须在其他插件之前）
app.use(pinia)

// 🎨 注册 Naive UI
app.use(naive)

// 🎨 如果使用按需导入，则这样注册：
// app.use(NButton).use(NInput).use(NCard) // 等等...

// 🔧 全局配置（可选）
app.config.globalProperties.$NAIVE = naive

// 🔥 挂载应用
app.mount('#app')

// 🎵 Howler.js 全局配置（可选）
// import { Howl } from 'howler'
// 可以在这里配置全局音频设置

// 🌐 Axios 全局配置（可选）
// import axios from 'axios'
// axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
// axios.defaults.timeout = 10000

// 🔧 开发环境的额外配置
if (import.meta.env.DEV) {
  console.log('🚀 开发环境已启动')
  console.log('🔧 API Base URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('🔧 WebSocket URL:', import.meta.env.VITE_WS_URL)
  console.log('🍍 Pinia 状态管理已启用')
}
