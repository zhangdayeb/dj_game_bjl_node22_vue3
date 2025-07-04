// src/types/global.d.ts - 全局类型定义
declare global {
  interface Window {
    TelegramWebApp?: any
    visualViewport?: {
      height: number
      width: number
      addEventListener: (event: string, callback: () => void) => void
      removeEventListener: (event: string, callback: () => void) => void
    }
  }
}

export {}
