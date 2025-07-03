// src/services/httpClient.ts
import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// 简单的配置接口
interface HttpConfig {
  baseURL: string
  timeout: number
}

// 业务错误类型
interface BusinessError extends Error {
  businessError: boolean
  code: number
}

// 网络错误类型
interface NetworkError extends Error {
  originalError: AxiosError
  statusCode?: number
}

// 安全获取环境变量
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    return import.meta.env[key] || defaultValue
  } catch (error) {
    return defaultValue
  }
}

// 默认配置
const defaultConfig: HttpConfig = {
  baseURL: getEnvVar('VITE_API_BASE_URL', 'https://bjlapi.oyfeit8.com'),
  timeout: 10000
}

export class HttpClient {
  private client: AxiosInstance
  private authToken: string | null = null

  constructor(config: Partial<HttpConfig> = {}) {
    const finalConfig = { ...defaultConfig, ...config }
    this.client = this.createAxiosInstance(finalConfig)
    this.setupInterceptors()
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token: string): void {
    this.authToken = token
  }

  /**
   * 清除认证令牌
   */
  clearAuthToken(): void {
    this.authToken = null
  }

  /**
   * 获取认证令牌
   */
  getAuthToken(): string | null {
    return this.authToken
  }

  /**
   * 创建 Axios 实例
   */
  private createAxiosInstance(config: HttpConfig): AxiosInstance {
    return axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器 - 自动添加 x-csrf-token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers['x-csrf-token'] = this.authToken
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器 - 处理业务错误
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 检查业务状态码
        if (response.data && typeof response.data.code !== 'undefined') {
          // 成功状态码：200 或 1
          if (response.data.code === 200 || response.data.code === 1) {
            return response
          }
          // 业务错误
          else {
            const error = new Error(response.data.message || '操作失败') as BusinessError
            error.businessError = true
            error.code = response.data.code
            throw error
          }
        }
        return response
      },
      (error: AxiosError) => {
        // 网络错误或 HTTP 错误
        const message = this.getErrorMessage(error)
        const customError = new Error(message) as NetworkError
        customError.originalError = error
        customError.statusCode = error.response?.status
        throw customError
      }
    )
  }

  /**
   * 获取错误信息
   */
  private getErrorMessage(error: AxiosError): string {
    if (!error.response) {
      return '网络连接失败'
    }

    const status = error.response.status
    switch (status) {
      case 401:
        return '认证失败，请重新登录'
      case 403:
        return '权限不足'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器内部错误'
      default:
        return `请求失败 (${status})`
    }
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get(url, { params })
    return response.data?.data || response.data
  }

  /**
   * POST 请求
   */
  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post(url, data)
    return response.data?.data || response.data
  }

  /**
   * 更新基础URL
   */
  updateBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL
  }

  /**
   * 获取 Axios 实例（用于高级用法）
   */
  getAxiosInstance(): AxiosInstance {
    return this.client
  }
}

// 创建默认实例
export const httpClient = new HttpClient()

// 导出便捷方法
export const setAuthToken = (token: string) => httpClient.setAuthToken(token)
export const clearAuthToken = () => httpClient.clearAuthToken()
export const getAuthToken = () => httpClient.getAuthToken()

// 导出请求方法
export const get = <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> =>
  httpClient.get<T>(url, params)

export const post = <T = unknown>(url: string, data?: unknown): Promise<T> =>
  httpClient.post<T>(url, data)

// 默认导出
export default httpClient
