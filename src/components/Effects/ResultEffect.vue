<!-- src/components/Effects/ResultEffect.vue -->
<template>
  <div class="result-effect-overlay">
    <div class="result-effect-container">
      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="sparkle" v-for="i in 20" :key="i" :style="getSparkleStyle(i)"></div>
      </div>

      <!-- 主要内容 -->
      <div class="result-content" :class="{ 'revealed': allCardsRevealed }">
        <!-- 标题 -->
        <div class="effect-title">
          <h2>开牌结果</h2>
        </div>

        <!-- 卡牌区域 -->
        <div class="cards-section">
          <!-- 庄家牌 -->
          <div class="player-cards banker-cards">
            <div class="player-label">庄家</div>
            <div class="cards-container">
              <div
                v-for="(card, index) in bankerCards"
                :key="`banker-${index}`"
                class="card-wrapper"
                :style="{ animationDelay: `${index * 0.3}s` }"
              >
                <div class="card" :class="{ 'revealed': card.revealed }">
                  <div class="card-front">
                    <img :src="getCardImage(card.image)" :alt="card.image" />
                  </div>
                  <div class="card-back">
                    <img :src="cardBackImage" alt="牌背" />
                  </div>
                </div>
              </div>
            </div>
            <div class="score" :class="{ 'revealed': scoreRevealed }">
              {{ bankerScore }}
            </div>
          </div>

          <!-- VS 标识 -->
          <div class="vs-indicator">
            <span>VS</span>
          </div>

          <!-- 闲家牌 -->
          <div class="player-cards player-cards-section">
            <div class="player-label">闲家</div>
            <div class="cards-container">
              <div
                v-for="(card, index) in playerCards"
                :key="`player-${index}`"
                class="card-wrapper"
                :style="{ animationDelay: `${(bankerCards.length + index) * 0.3}s` }"
              >
                <div class="card" :class="{ 'revealed': card.revealed }">
                  <div class="card-front">
                    <img :src="getCardImage(card.image)" :alt="card.image" />
                  </div>
                  <div class="card-back">
                    <img :src="cardBackImage" alt="牌背" />
                  </div>
                </div>
              </div>
            </div>
            <div class="score" :class="{ 'revealed': scoreRevealed }">
              {{ playerScore }}
            </div>
          </div>
        </div>

        <!-- 结果显示 -->
        <div class="result-display" :class="[winnerClass, { 'revealed': resultRevealed }]">
          <div class="winner-text">{{ winnerText }}</div>
          <div v-if="specialWin" class="special-win">{{ specialWin }}</div>
        </div>

        <!-- 中奖区域闪烁 -->
        <div v-if="flashAreas.length > 0" class="flash-areas">
          <div class="flash-title">中奖区域</div>
          <div class="flash-zones">
            <span
              v-for="area in flashAreas"
              :key="area"
              class="flash-zone"
            >
              {{ area }}
            </span>
          </div>
        </div>

        <!-- 关闭按钮 -->
        <button
          v-if="showCloseButton"
          class="close-button"
          @click="handleClose"
        >
          继续游戏
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 类型定义
interface CardData {
  image: string
  revealed: boolean
}

interface ResultData {
  result: {
    zhuang_score: number
    xian_score: number
  }
  info: {
    zhuang: Record<string, string>
    xian: Record<string, string>
  }
  pai_flash?: string[]
}

// Props
interface Props {
  resultData?: ResultData | null
  autoClose?: boolean
  closeDuration?: number
  cardRevealDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  resultData: null,
  autoClose: true,
  closeDuration: 8000,
  cardRevealDelay: 800
})

// 事件定义
const emit = defineEmits<{
  close: []
  complete: []
}>()

// 响应式数据
const bankerCards = ref<CardData[]>([])
const playerCards = ref<CardData[]>([])
const scoreRevealed = ref(false)
const resultRevealed = ref(false)
const showCloseButton = ref(false)
const allCardsRevealed = ref(false)

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
  const banker = bankerScore.value
  const player = playerScore.value

  if (banker === 8 || banker === 9) return '天牌'
  if (player === 8 || player === 9) return '天牌'
  if (banker === 6 && bankerCards.value.length === 2) return '幸运6'
  if (banker === 7 && bankerCards.value.length === 3) return '龙7'
  if (player === 8 && playerCards.value.length === 3) return '熊猫8'

  return ''
})

const flashAreas = computed(() => {
  return props.resultData?.pai_flash || []
})

const cardBackImage = computed(() => {
  return '/src/assets/images/poker/m.png'
})

// 方法
const getCardImage = (cardName: string) => {
  return `/src/assets/images/poker/${cardName}`
}

const getSparkleStyle = (index: number) => {
  const randomX = Math.random() * 100
  const randomY = Math.random() * 100
  const randomDelay = Math.random() * 3
  const randomDuration = 2 + Math.random() * 2

  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  }
}

const initializeCards = () => {
  if (!props.resultData?.info) {
    // 默认数据用于测试
    bankerCards.value = [
      { image: 'h1.png', revealed: false },
      { image: 's5.png', revealed: false }
    ]
    playerCards.value = [
      { image: 'c7.png', revealed: false },
      { image: 'h9.png', revealed: false }
    ]
    return
  }

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

const startRevealAnimation = () => {
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

  // 显示分数
  setTimeout(() => {
    scoreRevealed.value = true
  }, totalCards * props.cardRevealDelay + 500)

  // 显示结果
  setTimeout(() => {
    resultRevealed.value = true
    allCardsRevealed.value = true
  }, totalCards * props.cardRevealDelay + 1000)

  // 显示关闭按钮
  setTimeout(() => {
    showCloseButton.value = true
  }, totalCards * props.cardRevealDelay + 1500)

  // 自动关闭
  if (props.autoClose) {
    setTimeout(() => {
      handleComplete()
    }, props.closeDuration)
  }
}

const handleClose = () => {
  emit('close')
}

const handleComplete = () => {
  emit('complete')
}

// 生命周期
onMounted(() => {
  console.log('🎴 开牌特效组件挂载')
  initializeCards()

  // 开始动画
  setTimeout(() => {
    startRevealAnimation()
  }, 500)
})

onUnmounted(() => {
  console.log('🎴 开牌特效组件卸载')
})
</script>

<style scoped>
.result-effect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayFadeIn 0.5s ease-out;
}

.result-effect-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #ffd700, #ffeb3b);
  border-radius: 50%;
  animation: sparkleFloat 3s ease-in-out infinite;
}

.result-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: contentSlideIn 0.8s ease-out;
}

.result-content.revealed {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.effect-title h2 {
  color: #ffd700;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 30px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.cards-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.player-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.player-label {
  font-size: 18px;
  font-weight: 600;
  color: white;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cards-container {
  display: flex;
  gap: 8px;
}

.card-wrapper {
  animation: cardDrop 0.6s ease-out forwards;
  opacity: 0;
}

.card {
  width: 80px;
  height: 112px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s ease-in-out;
  cursor: pointer;
}

.card.revealed {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-front {
  transform: rotateY(180deg);
}

.card-back {
  transform: rotateY(0deg);
}

.card-front img,
.card-back img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.score {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 12px;
  border: 2px solid #ffd700;
  min-width: 60px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s ease-out;
}

.score.revealed {
  opacity: 1;
  transform: scale(1);
  animation: scoreReveal 0.5s ease-out;
}

.vs-indicator {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.result-display {
  margin: 30px 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.result-display.revealed {
  opacity: 1;
  transform: translateY(0);
}

.winner-text {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 0 15px currentColor;
}

.winner-text {
  animation: winnerGlow 2s ease-in-out infinite alternate;
}

.result-display.winner-banker .winner-text {
  color: #ff6b6b;
}

.result-display.winner-player .winner-text {
  color: #4ecdc4;
}

.result-display.winner-tie .winner-text {
  color: #ffd93d;
}

.special-win {
  font-size: 18px;
  color: #ffd700;
  font-weight: 600;
  animation: specialWinPulse 1s ease-in-out infinite alternate;
}

.flash-areas {
  margin: 20px 0;
  padding: 16px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.flash-title {
  font-size: 16px;
  color: #ffd700;
  font-weight: 600;
  margin-bottom: 8px;
}

.flash-zones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.flash-zone {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  animation: flashZoneBlink 1s ease-in-out infinite alternate;
}

.close-button {
  background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
  color: #1a1a2e;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  opacity: 0;
  animation: buttonFadeIn 0.5s ease-out 0.3s forwards;
}

.close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}

/* 动画 */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes contentSlideIn {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cardDrop {
  to {
    opacity: 1;
    transform: translateY(0);
  }
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
}

@keyframes scoreReveal {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes winnerGlow {
  from {
    text-shadow: 0 0 15px currentColor;
  }
  to {
    text-shadow: 0 0 25px currentColor, 0 0 35px currentColor;
  }
}

@keyframes specialWinPulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

@keyframes flashZoneBlink {
  from {
    background: rgba(255, 215, 0, 0.2);
  }
  to {
    background: rgba(255, 215, 0, 0.4);
  }
}

@keyframes sparkleFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

@keyframes buttonFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-content {
    padding: 20px;
  }

  .effect-title h2 {
    font-size: 24px;
  }

  .cards-section {
    flex-direction: column;
    gap: 20px;
  }

  .vs-indicator {
    order: 2;
    font-size: 18px;
    padding: 8px 16px;
  }

  .banker-cards {
    order: 1;
  }

  .player-cards-section {
    order: 3;
  }

  .card {
    width: 60px;
    height: 84px;
  }

  .winner-text {
    font-size: 24px;
  }

  .cards-container {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .result-effect-container {
    padding: 10px;
  }

  .result-content {
    padding: 16px;
  }

  .effect-title h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .card {
    width: 50px;
    height: 70px;
  }

  .score {
    font-size: 18px;
    padding: 6px 12px;
  }

  .winner-text {
    font-size: 20px;
  }
}
</style>
