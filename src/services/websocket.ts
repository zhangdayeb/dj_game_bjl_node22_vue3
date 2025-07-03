// src/services/websocket.ts
// 简化版百家乐 WebSocket 服务

// 连接状态类型
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// 事件回调类型
type EventCallback = (data: unknown) => void

// 游戏参数接口
interface GameParams {
  table_id: string
  game_type: string
  user_id: string
  token: string
}

// WebSocket 配置
interface WSConfig {
  url: string
  heartbeatInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  connectionTimeout: number
}

export class SimpleWebSocketService {
  private static instance: SimpleWebSocketService | null = null

  private ws: WebSocket | null = null
  private config: WSConfig
  private gameParams: GameParams | null = null
  private status: ConnectionStatus = 'disconnected'
  private reconnectCount = 0
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private eventListeners: Map<string, Set<EventCallback>> = new Map()
  private isManualDisconnect = false

  private constructor() {
    this.config = {
      url: import.meta.env.VITE_WS_URL || 'wss://wssbjl.oyfeit8.com',
      heartbeatInterval: 30000,    // 30秒心跳
      reconnectAttempts: 5,        // 重连5次
      reconnectDelay: 5000,        // 5秒间隔
      connectionTimeout: 10000     // 10秒连接超时
    }

    this.initEventListeners()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): SimpleWebSocketService {
    if (!SimpleWebSocketService.instance) {
      SimpleWebSocketService.instance = new SimpleWebSocketService()
    }
    return SimpleWebSocketService.instance
  }

  /**
   * 初始化事件监听器
   */
  private initEventListeners(): void {
    const events = ['connected', 'disconnected', 'message', 'error', 'reconnecting']
    events.forEach(event => {
      this.eventListeners.set(event, new Set())
    })
  }

  /**
   * 连接 WebSocket
   */
  async connect(gameParams: GameParams): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.gameParams = gameParams
    this.isManualDisconnect = false

    return new Promise((resolve, reject) => {
      this.setStatus('connecting')

      try {
        this.ws = new WebSocket(this.config.url)

        const timeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close()
            reject(new Error('连接超时'))
          }
        }, this.config.connectionTimeout)

        this.ws.onopen = () => {
          clearTimeout(timeout)
          this.setStatus('connected')
          this.reconnectCount = 0
          this.startHeartbeat()
          this.sendUserInfo()
          this.emit('connected', { timestamp: Date.now() })
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.ws.onclose = (event) => {
          clearTimeout(timeout)
          this.handleClose(event)
        }

        this.ws.onerror = (error) => {
          clearTimeout(timeout)
          this.setStatus('error')
          this.emit('error', { message: '连接错误', error })
          reject(error)
        }
      } catch (error) {
        this.setStatus('error')
        this.emit('error', { message: '创建连接失败', error })
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isManualDisconnect = true
    this.stopHeartbeat()
    this.stopReconnect()

    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }

    this.setStatus('disconnected')
  }

  /**
   * 发送消息
   */
  send(message: string | object): boolean {
    if (!this.isConnected()) {
      console.warn('WebSocket 未连接，消息发送失败')
      return false
    }

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      this.ws!.send(data)
      return true
    } catch (error) {
      console.error('发送消息失败:', error)
      return false
    }
  }

  /**
   * 发送心跳
   */
  private sendHeartbeat(): void {
    this.send('ping')
  }

  /**
   * 发送用户信息
   */
  private sendUserInfo(): void {
    if (!this.gameParams) return

    const userInfo = {
      user_id: this.gameParams.user_id,
      table_id: parseInt(this.gameParams.table_id),
      game_type: parseInt(this.gameParams.game_type)
    }

    this.send(userInfo)
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    // 忽略心跳回复
    if (event.data === 'pong') {
      return
    }

    try {
      // 尝试解析 JSON，失败则直接转发原始数据
      let data: unknown
      try {
        data = JSON.parse(event.data)
      } catch {
        data = event.data
      }

      // 直接转发原始数据给事件处理器
      this.emit('message', data)
    } catch (error) {
      this.emit('error', { message: '消息处理失败', error })
    }
  }

  /**
   * 处理连接关闭
   */
  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat()
    this.setStatus('disconnected')

    this.emit('disconnected', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    })

    // 非手动断开且未超过重连次数则尝试重连
    if (!this.isManualDisconnect && this.reconnectCount < this.config.reconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectCount++
    this.setStatus('reconnecting')

    this.emit('reconnecting', {
      attempt: this.reconnectCount,
      maxAttempts: this.config.reconnectAttempts,
      delay: this.config.reconnectDelay
    })

    this.reconnectTimer = window.setTimeout(() => {
      if (this.gameParams && !this.isManualDisconnect) {
        this.connect(this.gameParams).catch(() => {
          // 重连失败，继续尝试或放弃
        })
      }
    }, this.config.reconnectDelay)
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 停止重连
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 设置连接状态
   */
  private setStatus(status: ConnectionStatus): void {
    this.status = status
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件 ${event} 的监听器执行失败:`, error)
        }
      })
    }
  }

  /**
   * 添加事件监听器
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  /**
   * 清除所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.eventListeners.get(event)?.clear()
    } else {
      this.eventListeners.forEach(listeners => listeners.clear())
    }
  }

  /**
   * 获取连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * 判断是否已连接
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 获取连接信息
   */
  getConnectionInfo(): {
    status: ConnectionStatus
    url: string
    reconnectCount: number
    isConnected: boolean
  } {
    return {
      status: this.status,
      url: this.config.url,
      reconnectCount: this.reconnectCount,
      isConnected: this.isConnected()
    }
  }

  /**
   * 手动重连
   */
  async reconnect(): Promise<void> {
    if (!this.gameParams) {
      throw new Error('无法重连：缺少游戏参数')
    }

    this.disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000))
    this.reconnectCount = 0
    await this.connect(this.gameParams)
  }

  /**
   * 更新游戏参数
   */
  updateGameParams(params: GameParams): void {
    this.gameParams = params
    if (this.isConnected()) {
      this.sendUserInfo()
    }
  }

  /**
   * 销毁实例（用于测试或完全清理）
   */
  static destroy(): void {
    if (SimpleWebSocketService.instance) {
      SimpleWebSocketService.instance.disconnect()
      SimpleWebSocketService.instance.removeAllListeners()
      SimpleWebSocketService.instance = null
    }
  }
}

// 便捷的全局访问方法
export const getWebSocketService = (): SimpleWebSocketService => {
  return SimpleWebSocketService.getInstance()
}

// 默认导出
export default SimpleWebSocketService
