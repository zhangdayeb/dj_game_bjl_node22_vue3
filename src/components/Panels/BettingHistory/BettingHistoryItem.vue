<template>
  <div :class="recordClasses">
    <!-- 记录头部 -->
    <div class="record-header">
      <div class="header-left">
        <div class="game-number">{{ record.game_number }}</div>
        <div class="bet-time">{{ formatDateTime(record.bet_time) }}</div>
      </div>
      <div class="header-right">
        <div class="status-badge" :style="{ backgroundColor: getStatusColor(record.status) }">
          {{ getStatusText(record.status) }}
        </div>
      </div>
    </div>

    <!-- 记录主体 -->
    <div class="record-main">
      <!-- 投注信息 -->
      <div class="amount-section">
        <div class="amount-row">
          <span class="amount-label">投注:</span>
          <span class="amount-value bet-amount">¥{{ formatMoney(record.total_bet_amount) }}</span>
        </div>
        
        <!-- 只在已开奖时显示中奖金额 -->
        <div v-if="record.status !== 'pending'" class="amount-row">
          <span class="amount-label">中奖:</span>
          <span class="amount-value win-amount">¥{{ formatMoney(record.total_win_amount) }}</span>
        </div>
      </div>

      <!-- 开奖结果 -->
      <div v-if="record.dice_results && record.dice_results.length > 0" class="dice-section">
        <div class="dice-label">开奖结果</div>
        <div class="dice-container">
          <div 
            v-for="(dice, index) in record.dice_results" 
            :key="index" 
            class="dice-item"
          >
            {{ dice }}
          </div>
        </div>
      </div>
    </div>

    <!-- 投注详情区域 (新增) -->
    <div v-if="hasBetDetails()" class="betting-detail-section">
      <div class="detail-row">
        <span class="detail-label">投注:</span>
        <span class="detail-value bet-detail">{{ getBettingContent() }}</span>
      </div>
      
      <div class="detail-row" v-if="getResultContent()">
        <span class="detail-label">开奖:</span>
        <span class="detail-value result-detail">{{ getResultContent() }}</span>
      </div>
      
      <div class="detail-row" v-if="getOdds()">
        <span class="detail-label">赔率:</span>
        <span class="detail-value odds-detail">{{ getOdds() }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">结果:</span>
        <span class="detail-value" :class="getResultClass()">{{ getFinalResult() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 根据实际数据结构定义接口
interface BetDetail {
  bet_type?: string
  bet_amount?: number
  bet_type_name?: string
  is_win?: boolean
  odds?: string
  rate_id?: number
  win_amount?: number
}

interface BettingRecord {
  id?: string | number
  game_number?: string | number
  table_id?: string
  user_id?: string
  bet_time?: string
  total_bet_amount?: number
  total_win_amount?: number
  dice_results?: string[]
  dice_total?: number
  status?: string
  currency?: string
  is_settled?: boolean
  net_amount?: number
  bet_details?: BetDetail[]
}

// Props
interface Props {
  record: BettingRecord
  showActions?: boolean
  clickable?: boolean
  theme?: 'default' | 'compact' | 'detailed'
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  clickable: false,
  theme: 'default'
})

// Emits
const emit = defineEmits<{
  'click': [record: BettingRecord]
}>()

// 计算属性
const recordClasses = computed(() => {
  const firstBetDetail = props.record.bet_details?.[0]
  const isWin = firstBetDetail?.is_win || false
  const winAmount = props.record.total_win_amount || 0
  
  return [
    'betting-record-item',
    {
      'clickable': props.clickable,
      'win-record': isWin || winAmount > 0,
      'lose-record': (!isWin || winAmount <= 0) && props.record.status !== 'pending',
      'pending-record': props.record.status === 'pending',
      'cancelled-record': props.record.status === 'cancelled',
      'processing-record': props.record.status === 'processing',
      [`theme-${props.theme}`]: true
    }
  ]
})

// 方法
const formatMoney = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status: string | undefined): string => {
  const statusMap: Record<string, string> = {
    'pending': '待开奖',
    'win': '已中奖',
    'lose': '未中奖',
    'lost': '未中奖',
    'cancelled': '已取消',
    'processing': '处理中'
  }
  return statusMap[status || ''] || '未知'
}

const getStatusColor = (status: string | undefined): string => {
  const colorMap: Record<string, string> = {
    'pending': '#ff9800',
    'win': '#4caf50',
    'lose': '#f44336',
    'lost': '#f44336',
    'cancelled': '#9e9e9e',
    'processing': '#2196f3'
  }
  return colorMap[status || ''] || '#9e9e9e'
}

// 检查是否有投注详情
const hasBetDetails = (): boolean => {
  return !!(props.record.bet_details && props.record.bet_details.length > 0 && props.record.bet_details[0].bet_type_name)
}

// 解析投注内容
const getBettingContent = (): string => {
  const firstBetDetail = props.record.bet_details?.[0]
  if (!firstBetDetail?.bet_type_name) return '-'
  
  try {
    // 从 bet_type_name 中提取 "购买：xxx" 部分
    const buyMatch = firstBetDetail.bet_type_name.match(/购买：([^,]+)/)
    if (buyMatch) {
      return buyMatch[1].trim()
    }
    
    // 如果没有找到"购买："，尝试提取第一个部分（如："大(11-17)"）
    const firstPart = firstBetDetail.bet_type_name.split('-')[0]
    if (firstPart) {
      return firstPart.trim()
    }
    
    return '-'
  } catch (error) {
    console.error('解析投注内容失败:', error)
    return '-'
  }
}

// 解析开奖结果内容
const getResultContent = (): string => {
  const firstBetDetail = props.record.bet_details?.[0]
  if (!firstBetDetail?.bet_type_name) return ''
  
  try {
    // 从 bet_type_name 中提取 "开：xxx" 部分，到"本次结果记录"之前或字符串末尾
    const openMatch = firstBetDetail.bet_type_name.match(/开：([^|]*(?:\|[^|]*)*?)(?=\|\|本次结果记录|$)/)
    if (openMatch) {
      return openMatch[1].trim()
    }
    
    // 如果没有找到"开："，尝试从逗号后面提取
    const commaIndex = firstBetDetail.bet_type_name.indexOf(',')
    if (commaIndex !== -1) {
      const afterComma = firstBetDetail.bet_type_name.substring(commaIndex + 1)
      // 移除"本次结果记录"及之后的内容
      const cleanResult = afterComma.replace(/\|\|本次结果记录.*$/, '').trim()
      return cleanResult
    }
    
    return ''
  } catch (error) {
    console.error('解析开奖结果失败:', error)
    return ''
  }
}

// 获取赔率
const getOdds = (): string => {
  const firstBetDetail = props.record.bet_details?.[0]
  if (!firstBetDetail?.odds) return ''
  
  return firstBetDetail.odds
}

// 获取最终结果
const getFinalResult = (): string => {
  if (props.record.status === 'pending') {
    return '待开奖'
  }
  
  if (props.record.status === 'cancelled') {
    return '已取消'
  }
  
  const firstBetDetail = props.record.bet_details?.[0]
  
  // 优先使用 bet_details 中的 is_win 字段
  if (firstBetDetail?.is_win !== undefined) {
    return firstBetDetail.is_win ? '中奖' : '未中奖'
  }
  
  // 否则根据 total_win_amount 判断
  const winAmount = props.record.total_win_amount || 0
  return winAmount > 0 ? '中奖' : '未中奖'
}

// 获取结果样式类
const getResultClass = (): string => {
  if (props.record.status === 'pending') {
    return 'pending-result'
  }
  
  if (props.record.status === 'cancelled') {
    return 'cancelled-result'
  }
  
  const firstBetDetail = props.record.bet_details?.[0]
  
  if (firstBetDetail?.is_win !== undefined) {
    return firstBetDetail.is_win ? 'win-result' : 'lose-result'
  }
  
  const winAmount = props.record.total_win_amount || 0
  return winAmount > 0 ? 'win-result' : 'lose-result'
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.record)
  }
}
</script>

<style scoped>
.betting-record-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.betting-record-item.clickable {
  cursor: pointer;
}

.betting-record-item.clickable:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 状态指示 - 左边框颜色 */
.betting-record-item.win-record {
  border-left: 4px solid #4caf50;
}

.betting-record-item.lose-record {
  border-left: 4px solid #f44336;
}

.betting-record-item.pending-record {
  border-left: 4px solid #ff9800;
}

.betting-record-item.cancelled-record {
  border-left: 4px solid #9e9e9e;
  opacity: 0.7;
}

.betting-record-item.processing-record {
  border-left: 4px solid #2196f3;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.header-left {
  flex: 1;
}

.game-number {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.bet-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  text-align: center;
  min-width: 60px;
}

.record-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.amount-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 40px;
  font-weight: 500;
}

.amount-value {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.amount-value.bet-amount {
  color: #2196f3;
}

.amount-value.win-amount {
  color: #4caf50;
}

.dice-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 120px;
}

.dice-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-weight: 500;
}

.dice-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dice-item {
  width: 24px;
  height: 24px;
  background: #ffffff;
  color: #000000;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 新增：投注详情区域样式 */
.betting-detail-section {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 40px;
  font-weight: 500;
}

.detail-value {
  font-size: 12px;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 8px;
}

.detail-value.bet-detail {
  color: #2196f3;
}

.detail-value.result-detail {
  color: #ff9800;
}

.detail-value.odds-detail {
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
}

.detail-value.win-result {
  color: #4caf50;
  font-weight: 600;
}

.detail-value.lose-result {
  color: #f44336;
  font-weight: 600;
}

.detail-value.pending-result {
  color: #ff9800;
  font-weight: 600;
}

.detail-value.cancelled-result {
  color: #9e9e9e;
  font-weight: 600;
}
</style>