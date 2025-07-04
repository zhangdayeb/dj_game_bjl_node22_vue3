<!-- src/components/Panels/BettingHistoryPanel.vue -->
<template>
  <div class="betting-history-overlay" @click="handleOverlayClick">
    <div class="betting-history-panel" @click.stop>
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <h2 class="panel-title">投注记录</h2>
        </div>
        <button class="close-btn" @click="handleClose">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="panel-content">
        <!-- 筛选器 -->
        <div class="filter-section">
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.value"
              class="filter-tab"
              :class="{ 'active': currentFilter === tab.value }"
              @click="setFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
          <button class="refresh-btn" @click="refreshHistory" :disabled="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :class="{ 'spinning': loading }">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>

        <!-- 记录列表 -->
        <div class="records-container">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="filteredRecords.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <p>暂无投注记录</p>
          </div>

          <div v-else class="records-list">
            <div
              v-for="record in filteredRecords"
              :key="record.id"
              class="record-item"
              :class="{
                'win': record.status === 'win',
                'lose': record.status === 'lose',
                'pending': record.status === 'pending'
              }"
            >
              <div class="record-header">
                <div class="game-info">
                  <span class="game-number">{{ record.gameNumber }}</span>
                  <span class="game-time">{{ formatTime(record.timestamp) }}</span>
                </div>
                <div class="result-badge" :class="record.status">
                  {{ getStatusText(record.status) }}
                </div>
              </div>

              <div class="record-content">
                <div class="bet-details">
                  <div class="bet-summary">
                    投注: ${{ formatAmount(record.totalBet) }}
                  </div>
                  <div class="bet-zones">
                    <span
                      v-for="(amount, zone) in record.bets"
                      :key="zone"
                      class="bet-zone"
                    >
                      {{ getZoneName(zone) }}: ${{ formatAmount(amount) }}
                    </span>
                  </div>
                </div>

                <div class="result-info">
                  <div class="game-result">
                    结果: {{ record.result }}
                  </div>
                  <div class="win-amount" :class="{ 'positive': record.winAmount > 0, 'negative': record.winAmount < 0 }">
                    {{ record.winAmount >= 0 ? '+' : '' }}${{ formatAmount(Math.abs(record.winAmount)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore && !loading" class="load-more">
          <button class="load-more-btn" @click="loadMore">
            加载更多
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 类型定义
interface BettingRecord {
  id: string
  gameNumber: string
  timestamp: number
  bets: Record<string, number>
  totalBet: number
  result: string
  winAmount: number
  status: 'win' | 'lose' | 'pending'
}

// 事件定义
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const loading = ref(false)
const records = ref<BettingRecord[]>([])
const currentFilter = ref<string>('all')
const page = ref(1)
const hasMore = ref(true)

// 筛选标签
const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '已中奖', value: 'win' },
  { label: '未中奖', value: 'lose' },
  { label: '进行中', value: 'pending' }
]

// 计算属性
const filteredRecords = computed(() => {
  if (currentFilter.value === 'all') {
    return records.value
  }
  return records.value.filter(record => record.status === currentFilter.value)
})

// 方法
const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const setFilter = (filter: string) => {
  currentFilter.value = filter
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getStatusText = (status: string): string => {
  const statusMap = {
    'win': '已中奖',
    'lose': '未中奖',
    'pending': '进行中'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getZoneName = (zone: string): string => {
  const zoneMap = {
    'banker': '庄',
    'player': '闲',
    'tie': '和',
    'banker-pair': '庄对',
    'player-pair': '闲对',
    'lucky-6': '幸运6',
    'dragon-7': '龙7',
    'panda-8': '熊8'
  }
  return zoneMap[zone as keyof typeof zoneMap] || zone
}

const loadBettingHistory = async (pageNum: number = 1) => {
  loading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    const mockData: BettingRecord[] = Array.from({ length: 10 }, (_, i) => {
      const gameIndex = pageNum * 10 + i
      const totalBet = Math.floor(Math.random() * 1000) + 100
      const winAmount = Math.random() > 0.5 ? totalBet * (Math.random() * 3 + 0.5) - totalBet : -totalBet

      return {
        id: `record-${Date.now()}-${gameIndex}`,
        gameNumber: `T${(Date.now() - gameIndex * 120000).toString().slice(-12)}`,
        timestamp: Date.now() - gameIndex * 120000,
        bets: {
          'banker': Math.floor(Math.random() * 500),
          'player': Math.floor(Math.random() * 300),
          'tie': Math.floor(Math.random() * 200)
        },
        totalBet,
        result: ['庄胜', '闲胜', '和局'][Math.floor(Math.random() * 3)],
        winAmount,
        status: winAmount > 0 ? 'win' : 'lose'
      }
    })

    if (pageNum === 1) {
      records.value = mockData
    } else {
      records.value.push(...mockData)
    }

    // 模拟是否还有更多数据
    hasMore.value = pageNum < 5

    console.log('📊 投注记录加载完成', { page: pageNum, total: records.value.length })
  } catch (error) {
    console.error('❌ 加载投注记录失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshHistory = async () => {
  page.value = 1
  await loadBettingHistory(1)
}

const loadMore = async () => {
  page.value++
  await loadBettingHistory(page.value)
}

// 生命周期
onMounted(() => {
  loadBettingHistory(1)
})
</script>

<style scoped>
.betting-history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: overlayFadeIn 0.3s ease-out;
}

.betting-history-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow: hidden;
  animation: panelSlideIn 0.3s ease-out;
}

.panel-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 32px;
  height: 32px;
  background: rgba(82, 196, 26, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52c41a;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.panel-content {
  padding: 24px;
  max-height: calc(85vh - 80px);
  overflow-y: auto;
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.filter-tab.active {
  background: rgba(64, 169, 255, 0.2);
  border-color: #40a9ff;
  color: #40a9ff;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

.records-container {
  min-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #40a9ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.record-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.record-item.win {
  border-color: rgba(82, 196, 26, 0.3);
  background: rgba(82, 196, 26, 0.05);
}

.record-item.lose {
  border-color: rgba(255, 77, 79, 0.3);
  background: rgba(255, 77, 79, 0.05);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-number {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.game-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.result-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.result-badge.win {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.result-badge.lose {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.result-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.bet-details {
  flex: 1;
}

.bet-summary {
  font-size: 14px;
  color: white;
  margin-bottom: 8px;
}

.bet-zones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bet-zone {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.result-info {
  text-align: right;
}

.game-result {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.win-amount {
  font-size: 16px;
  font-weight: 600;
}

.win-amount.positive {
  color: #52c41a;
}

.win-amount.negative {
  color: #ff4d4f;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 10px 24px;
  background: rgba(64, 169, 255, 0.1);
  border: 1px solid rgba(64, 169, 255, 0.3);
  border-radius: 8px;
  color: #40a9ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: rgba(64, 169, 255, 0.2);
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .betting-history-overlay {
    padding: 10px;
  }

  .betting-history-panel {
    max-width: none;
    width: 95%;
  }

  .panel-content {
    padding: 16px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-tabs {
    justify-content: center;
  }

  .record-content {
    flex-direction: column;
    gap: 12px;
  }

  .result-info {
    text-align: left;
  }
}
</style>
