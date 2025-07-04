<template>
  <div v-if="show" class="result-effect-overlay">
    <div class="result-effect-container">
      <!-- 背景遮罩 -->
      <div class="backdrop" @click="handleBackdropClick"></div>

      <!-- 开牌区域 -->
      <div class="cards-display">
        <!-- 庄家区域 -->
        <div class="player-section banker-section">
          <div class="player-title">庄家</div>
          <div class="cards-container">
            <div
              v-for="(card, index) in bankerCards"
              :key="`banker-${index}`"
              class="card-slot"
              :class="{ 'card-revealed': card.revealed }"
              :style="{
                animationDelay: `${index * cardRevealDelay}ms`,
                zIndex: 10 + index
              }"
            >
              <!-- 牌背面 -->
              <div class="card-back">
                <img :src="cardBackImage" alt="牌背" />
              </div>

              <!-- 牌正面 -->
              <div class="card-front" v-if="card.image">
                <img :src="getCardImage(card.image)" :alt="card.image" />
              </div>
            </div>
          </div>

          <!-- 庄家点数 -->
          <div class="player-score" :class="{ 'score-revealed': scoreRevealed }">
            <span class="score-label">点数:</span>
            <span class="score-value">{{ bankerScore }}</span>
          </div>
        </div>

        <!-- VS 分隔符 -->
        <div class="vs-separator">
          <div class="vs-text">VS</div>
        </div>

        <!-- 闲家区域 -->
        <div class="player-section player-section-right">
          <div class="player-title">闲家</div>
          <div class="cards-container">
            <div
              v-for="(card, index) in playerCards"
              :key="`player-${index}`"
              class="card-slot"
              :class="{ 'card-revealed': card.revealed }"
              :style="{
                animationDelay: `${(bankerCards.length + index) * cardRevealDelay}ms`,
                zIndex: 10 + index
              }"
            >
              <!-- 牌背面 -->
              <div class="card-back">
                <img :src="cardBackImage" alt="牌背" />
              </div>

              <!-- 牌正面 -->
              <div class="card-front" v-if="card.image">
                <img :src="getCardImage(card.image)" :alt="card.image" />
              </div>
            </div>
          </div>

          <!-- 闲家点数 -->
          <div class="player-score" :class="{ 'score-revealed': scoreRevealed }">
            <span class="score-label">点数:</span>
            <span class="score-value">{{ playerScore }}</span>
          </div>
        </div>
      </div>

      <!-- 结果显示 -->
      <div class="result-display" :class="{ 'result-revealed': resultRevealed }">
        <div class="result-winner" :class="winnerClass">
          <div class="winner-text">{{ winnerText }}</div>
          <div class="winner-subtitle" v-if="specialWin">{{ specialWin }}</div>
        </div>

        <!-- 中奖区域闪烁效果 -->
        <div class="flash-areas" v-if="flashAreas.length > 0">
          <div class="flash-text">中奖区域</div>
          <div class="flash-items">
            <span
              v-for="area in flashAreas"
              :key="area"
              class="flash-item"
            >
              {{ area }}
            </span>
          </div>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <button class="close-button" @click="handleClose" v-if="showCloseButton">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// 牌面数据接口
interface CardData {
  image: string
  revealed: boolean
}

// 开牌结果数据接口
interface ResultData {
  result: any        // 游戏计算结果
  info: {
    zhuang: Record<string, string>  // 庄家牌面信息
    xian: Record<string, string>    // 闲家牌面信息
  }
  pai_flash: string[]  // 中奖区域闪烁效果
}

interface Props {
  show: boolean
  resultData?: ResultData
  autoClose?: boolean
  closeDuration?: number
  cardRevealDelay?: number
  allowBackdropClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoClose: true,
  closeDuration: 8000,
  cardRevealDelay: 800,
  allowBackdropClose: false
})

const emit = defineEmits<{
  close: []
  complete: []
}>()

// 状态管理
const bankerCards = ref<CardData[]>([])
const playerCards = ref<CardData[]>([])
const scoreRevealed = ref(false)
const resultRevealed = ref(false)
const showCloseButton = ref(false)

// 计算属性
const bankerScore = computed(() => {
  return props.resultData?.result?.zhuang_score || 0
})

const playerScore = computed(() => {
  return props.resultData?.result?.xian_score || 0
})

const winnerText = computed(() => {
  const result = props.resultData?.result
  if (!result) return ''

  if (result.zhuang_score > result.xian_score) {
    return '庄家获胜'
  } else if (result.xian_score > result.zhuang_score) {
    return '闲家获胜'
  } else {
    return '平局'
  }
})

const winnerClass = computed(() => {
  const result = props.resultData?.result
  if (!result) return ''

  if (result.zhuang_score > result.xian_score) {
    return 'winner-banker'
  } else if (result.xian_score > result.zhuang_score) {
    return 'winner-player'
  } else {
    return 'winner-tie'
  }
})

const specialWin = computed(() => {
  // 可以根据特殊胜利条件添加逻辑
  return ''
})

const flashAreas = computed(() => {
  return props.resultData?.pai_flash || []
})

// 牌背图片
const cardBackImage = computed(() => {
  return '/src/assets/images/poker/m.png'
})

// 获取牌面图片
const getCardImage = (cardName: string) => {
  return `/src/assets/images/poker/${cardName}`
}

// 初始化牌面数据
const initializeCards = () => {
  if (!props.resultData?.info) return

  const { zhuang, xian } = props.resultData.info

  // 初始化庄家牌
  bankerCards.value = Object.values(zhuang).map(cardImage => ({
    image: cardImage,
    revealed: false
  }))

  // 初始化闲家牌
  playerCards.value = Object.values(xian).map(cardImage => ({
    image: cardImage,
    revealed: false
  }))

  console.log('🎴 初始化牌面:', {
    banker: bankerCards.value,
    player: playerCards.value
  })
}

// 开始翻牌动画
const startRevealAnimation = () => {
  if (!props.show) return

  const totalCards = bankerCards.value.length + playerCards.value.length

  // 依次翻牌
  bankerCards.value.forEach((card, index) => {
    setTimeout(() => {
      card.revealed = true
    }, index * props.cardRevealDelay)
  })

  playerCards.value.forEach((card, index) => {
    setTimeout(() => {
      card.revealed = true
    }, (bankerCards.value.length + index) * props.cardRevealDelay)
  })

  // 显示点数
  setTimeout(() => {
    scoreRevealed.value = true
  }, totalCards * props.cardRevealDelay + 500)

  // 显示结果
  setTimeout(() => {
    resultRevealed.value = true
    showCloseButton.value = true
    emit('complete')
  }, totalCards * props.cardRevealDelay + 1500)

  // 自动关闭
  if (props.autoClose) {
    setTimeout(() => {
      handleClose()
    }, props.closeDuration)
  }
}

// 重置状态
const resetState = () => {
  bankerCards.value = []
  playerCards.value = []
  scoreRevealed.value = false
  resultRevealed.value = false
  showCloseButton.value = false
}

// 处理关闭
const handleClose = () => {
  emit('close')
}

// 处理背景点击
const handleBackdropClick = () => {
  if (props.allowBackdropClose) {
    handleClose()
  }
}

// 监听显示状态
watch(() => props.show, (newShow) => {
  if (newShow) {
    resetState()
    initializeCards()

    // 延迟开始动画，确保DOM已渲染
    setTimeout(() => {
      startRevealAnimation()
    }, 300)
  }
})

// 监听结果数据变化
watch(() => props.resultData, (newData) => {
  if (newData && props.show) {
    resetState()
    initializeCards()
    setTimeout(() => {
      startRevealAnimation()
    }, 300)
  }
})

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.result-effect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
}

.result-effect-container {
  position: relative;
  width: 90%;
  max-width: 800px;
  background: linear-gradient(135deg, #1a4d3a 0%, #2d5016 100%);
  border-radius: 20px;
  border: 3px solid gold;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.cards-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
}

.player-section {
  flex: 1;
  text-align: center;
}

.player-title {
  font-size: 24px;
  font-weight: bold;
  color: gold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  min-height: 120px;
}

.card-slot {
  position: relative;
  width: 80px;
  height: 120px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.card-slot.card-revealed {
  transform: rotateY(180deg);
  animation: cardReveal 0.8s ease-out forwards;
}

.card-back,
.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.card-back {
  background: linear-gradient(135deg, #8B0000, #A52A2A);
  border: 2px solid #FFD700;
}

.card-front {
  transform: rotateY(180deg);
  background: white;
  border: 2px solid #333;
}

.card-back img,
.card-front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.vs-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vs-text {
  font-size: 36px;
  font-weight: bold;
  color: gold;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: pulse 2s infinite;
}

.player-score {
  font-size: 18px;
  font-weight: bold;
  color: white;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out;
}

.player-score.score-revealed {
  opacity: 1;
  transform: translateY(0);
}

.score-label {
  color: #ccc;
  margin-right: 8px;
}

.score-value {
  color: gold;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.result-display {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
}

.result-display.result-revealed {
  opacity: 1;
  transform: translateY(0);
}

.result-winner {
  margin-bottom: 20px;
}

.winner-text {
  font-size: 32px;
  font-weight: bold;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
}

.winner-subtitle {
  font-size: 18px;
  opacity: 0.9;
}

.winner-banker {
  color: #ff6b6b;
}

.winner-player {
  color: #4ecdc4;
}

.winner-tie {
  color: #ffe66d;
}

.flash-areas {
  margin-top: 20px;
}

.flash-text {
  font-size: 16px;
  color: #ccc;
  margin-bottom: 10px;
}

.flash-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.flash-item {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
  animation: flashPulse 1s infinite;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cardReveal {
  0% {
    transform: rotateY(0deg) scale(0.8);
  }
  50% {
    transform: rotateY(90deg) scale(1.1);
  }
  100% {
    transform: rotateY(180deg) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes flashPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-effect-container {
    width: 95%;
    padding: 20px;
  }

  .cards-display {
    flex-direction: column;
    gap: 30px;
  }

  .vs-separator {
    order: 1;
  }

  .player-section {
    order: 0;
  }

  .player-section-right {
    order: 2;
  }

  .player-title {
    font-size: 20px;
  }

  .vs-text {
    font-size: 28px;
  }

  .winner-text {
    font-size: 24px;
  }

  .card-slot {
    width: 60px;
    height: 90px;
  }
}
</style>
