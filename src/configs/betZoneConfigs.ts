// src/configs/betZoneConfigs.ts
// 🎯 投注区域统一配置文件

export interface BetZoneConfig {
  id: string                    // 唯一标识
  title: string                // 显示标题
  odds: string                 // 赔率显示
  type: 'main' | 'side'        // 区域类型：主要投注 | 边注
  theme: ThemeType             // 主题颜色
  category: 'first-row' | 'second-row'  // 布局分类
}

export type ThemeType = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow'

// 🔥 所有投注区域的统一配置
export const BET_ZONE_CONFIGS: Record<string, BetZoneConfig> = {
  // 第一排 - 边注区域
  'dragon-7': {
    id: 'dragon-7',
    title: '龙7',
    odds: '1:40',
    type: 'side',
    theme: 'orange',
    category: 'first-row'
  },
  'banker-pair': {
    id: 'banker-pair',
    title: '庄对',
    odds: '1:11',
    type: 'side',
    theme: 'blue',
    category: 'first-row'
  },
  'lucky-6': {
    id: 'lucky-6',
    title: '幸运6',
    odds: '1:12/20',
    type: 'side',
    theme: 'purple',
    category: 'first-row'
  },
  'player-pair': {
    id: 'player-pair',
    title: '闲对',
    odds: '1:11',
    type: 'side',
    theme: 'green',
    category: 'first-row'
  },
  'panda-8': {
    id: 'panda-8',
    title: '熊8',
    odds: '1:25',
    type: 'side',
    theme: 'yellow',
    category: 'first-row'
  },

  // 第二排 - 主要投注区域
  'banker': {
    id: 'banker',
    title: '庄',
    odds: '1:0.95',
    type: 'main',
    theme: 'red',
    category: 'second-row'
  },
  'tie': {
    id: 'tie',
    title: '和',
    odds: '1:8',
    type: 'main',
    theme: 'green',
    category: 'second-row'
  },
  'player': {
    id: 'player',
    title: '闲',
    odds: '1:1',
    type: 'main',
    theme: 'blue',
    category: 'second-row'
  }
}

// 🎨 主题色彩配置
export const THEME_COLORS: Record<ThemeType, {
  primary: string
  secondary: string
  gradient: string
  border: string
  hover: string
}> = {
  red: {
    primary: '#c0392b',
    secondary: '#e74c3c',
    gradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
    border: '#e74c3c',
    hover: 'rgba(231, 76, 60, 0.3)'
  },
  blue: {
    primary: '#1a4d72',
    secondary: '#3498db',
    gradient: 'linear-gradient(135deg, #1a4d72 0%, #2a5a8a 100%)',
    border: '#3498db',
    hover: 'rgba(52, 152, 219, 0.3)'
  },
  green: {
    primary: '#27ae60',
    secondary: '#2ecc71',
    gradient: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    border: '#2ecc71',
    hover: 'rgba(46, 204, 113, 0.3)'
  },
  orange: {
    primary: '#d35400',
    secondary: '#e67e22',
    gradient: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
    border: '#e67e22',
    hover: 'rgba(230, 126, 34, 0.3)'
  },
  purple: {
    primary: '#8e44ad',
    secondary: '#9b59b6',
    gradient: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
    border: '#9b59b6',
    hover: 'rgba(155, 89, 182, 0.3)'
  },
  yellow: {
    primary: '#e67e22',
    secondary: '#f39c12',
    gradient: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)',
    border: '#f39c12',
    hover: 'rgba(243, 156, 18, 0.3)'
  }
}

// 🎯 布局配置
export const LAYOUT_CONFIG = {
  'first-row': {
    className: 'first-row-zone',
    padding: '6px',
    fontSize: '12px',
    height: 'auto'
  },
  'second-row': {
    className: 'second-row-zone',
    padding: '8px',
    fontSize: '13px',
    height: '100%'
  }
}

// 🔧 工具函数
export const getZoneConfig = (zoneId: string): BetZoneConfig | null => {
  return BET_ZONE_CONFIGS[zoneId] || null
}

export const getZonesByCategory = (category: 'first-row' | 'second-row'): BetZoneConfig[] => {
  return Object.values(BET_ZONE_CONFIGS).filter(config => config.category === category)
}

export const getZonesByType = (type: 'main' | 'side'): BetZoneConfig[] => {
  return Object.values(BET_ZONE_CONFIGS).filter(config => config.type === type)
}
