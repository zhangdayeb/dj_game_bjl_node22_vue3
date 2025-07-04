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
          <div class="records-count" v-if="!store.isEmpty">
            ({{ store.totalRecords }}条)
          </div>
        </div>
        <div class="header-right">
          <button
            class="refresh-btn"
            @click="handleRefresh"
            :disabled="store.isLoading"
            title="刷新"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="{ 'spinning': store.isLoading }"
            >
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
          <button class="close-btn" @click="handleClose" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="!store.isEmpty">
        <div class="stat-item">
          <span class="stat-label">总投注</span>
          <span class="stat-value">{{ store.formatAmount(store.basicStats.totalBet) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总收益</span>
          <span
            class="stat-value"
            :class="{
              'positive': store.basicStats.netAmount > 0,
              'negative': store.basicStats.netAmount < 0
            }"
          >
            {{ store.basicStats.netAmount >= 0 ? '+' : '' }}{{ store.formatAmount(store.basicStats.netAmount) }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">胜率</span>
          <span class="stat-value">{{ store.basicStats.winRate.toFixed(1) }}%</span>
        </div>
      </div>

      <!-- 面板内容 -->
      <div class="panel-content">
        <!-- 加载状态 -->
        <div v-if="store.isLoading && store.isEmpty" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="store.error && store.isEmpty" class="error-state">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
            </svg>
          </div>
          <p>{{ store.error }}</p>
          <button class="retry-btn" @click="handleRefresh">
            重试
          </button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="store.isEmpty" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <p>暂无投注记录</p>
        </div>

        <!-- 记录列表 -->
        <div v-else class="records-container">
          <div class="records-list">
            <div
              v-for="record in store.records"
              :key="record.id"
              class="record-item"
              :class="store.getRecordStatus(record)"
            >
              <div class="record-header">
                <div class="game-info">
                  <span class="game-number">{{ record.pu_number }}</span>
                  <span class="game-time">{{ store.formatTime(record.created_at) }}</span>
                </div>
                <div class="result-badge" :class="store.getRecordStatus(record)">
                  {{ store.getStatusText(record) }}
                </div>
              </div>

              <div class="record-content">
                <div class="bet-details">
                  <div class="bet-summary">
                    投注: {{ store.formatAmount(record.bet_amt) }}
                  </div>
                  <div class="bet-zones" v-if="getBetZones(record).length > 0">
                    <span
                      v-for="zone in getBetZones(record)"
                      :key="zone.name"
                      class="bet-zone"
                    >
                      {{ zone.name }}: {{ store.formatAmount(zone.amount) }}
                    </span>
                  </div>
                </div>

                <div class="result-info">
                  <div class="game-result" v-if="record.result">
                    结果: {{ record.result }}
                  </div>
                  <div
                    class="win-amount"
                    :class="{
                      'positive': record.delta_amt > 0,
                      'negative': record.delta_amt < 0,
                      'neutral': record.delta_amt === 0
                    }"
                  >
                    {{ record.delta_amt >= 0 ? '+' : '' }}{{ store.formatAmount(Math.abs(record.delta_amt)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="load-more-section">
            <!-- 加载中状态 -->
            <div v-if="store.isLoading" class="loading-more">
              <div class="loading-spinner small"></div>
              <span>加载中...</span>
            </div>

            <!-- 加载更多按钮 -->
            <button
              v-else-if="store.canLoadMore"
              class="load-more-btn"
              @click="handleLoadMore"
            >
              加载更多
            </button>

            <!-- 没有更多数据 -->
            <div v-else class="no-more">
              <span>已加载全部记录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBettingHistoryStore } from '@/stores/bettingHistoryStore'
import type { BettingRecord } from '@/stores/bettingHistoryStore'

// 事件定义
const emit = defineEmits<{
  close: []
}>()

// 使用 Store
const store = useBettingHistoryStore()

// 计算投注区域
const getBetZones = (record: BettingRecord) => {
  const detail = store.parseBetDetail(record.detail)
  return Object.entries(detail)
    .filter(([_, amount]) => Number(amount) > 0)
    .map(([zone, amount]) => ({
      name: store.getZoneName(zone),
      amount: Number(amount)
    }))
}

// 事件处理
const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const handleRefresh = async () => {
  try {
    store.clearError()
    await store.refresh()
  } catch (error) {
    console.error('❌ 刷新投注记录失败:', error)
  }
}

const handleLoadMore = async () => {
  try {
    await store.loadMore()
  } catch (error) {
    console.error('❌ 加载更多记录失败:', error)
  }
}
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
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  animation: panelSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
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

.records-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn,
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

.refresh-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

.stats-section {
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 24px;
  display: flex;
  gap: 32px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.stat-value.positive {
  color: #52c41a;
}

.stat-value.negative {
  color: #ff4d4f;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
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

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-bottom: 0;
  margin-right: 8px;
}

.empty-icon,
.error-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.error-icon {
  color: #ff4d4f;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: rgba(64, 169, 255, 0.1);
  border: 1px solid rgba(64, 169, 255, 0.3);
  border-radius: 6px;
  color: #40a9ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(64, 169, 255, 0.2);
}

.records-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0;
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

.record-item.pending {
  border-color: rgba(255, 193, 7, 0.3);
  background: rgba(255, 193, 7, 0.05);
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

.win-amount.neutral {
  color: rgba(255, 255, 255, 0.6);
}

.load-more-section {
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.load-more-btn {
  padding: 10px 24px;
  background: rgba(64, 169, 255, 0.1);
  border: 1px solid rgba(64, 169, 255, 0.3);
  border-radius: 8px;
  color: #40a9ff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.load-more-btn:hover {
  background: rgba(64, 169, 255, 0.2);
  transform: translateY(-1px);
}

.no-more {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
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
    width: 100%;
    max-height: 95vh;
  }

  .panel-header {
    padding: 16px 20px;
  }

  .stats-section {
    padding: 12px 20px;
    gap: 20px;
  }

  .records-container {
    padding: 0 20px;
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
