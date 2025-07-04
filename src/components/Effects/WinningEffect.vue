<!-- src/components/Effects/WinningEffect.vue -->
<template>
  <div class="winning-effect-overlay">
    <div class="winning-effect-container">
      <!-- 背景粒子效果 -->
      <div class="particles-bg">
        <div
          v-for="i in particleCount"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>

      <!-- 爆炸光效 -->
      <div class="explosion-effect" :class="{ 'active': showExplosion }">
        <div class="explosion-ring" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
      </div>

      <!-- 主要内容 -->
      <div class="winning-content" :class="[`type-${winType}`, { 'revealed': contentRevealed }]">
        <!-- 中奖标题 -->
        <div class="win-title" :class="winType">
          <h1>{{ getWinTitle() }}</h1>
          <div class="title-decoration">
            <span v-for="i in 5" :key="i" class="decoration-star" :style="{ animationDelay: `${i * 0.1}s` }">★</span>
          </div>
        </div>

        <!-- 金额显示 -->
        <div class="amount-display">
          <div class="amount-label">恭喜获得</div>
          <div class="amount-value" :class="winType">
            <span class="currency">$</span>
            <span class="number">{{ animatedAmount }}</span>
          </div>
          <div class="amount-decoration">
            <div class="glow-ring"></div>
            <div class="pulse-ring"></div>
          </div>
        </div>

        <!-- 特效装饰 -->
        <div class="decorative-elements">
          <!-- 飘动的金币 -->
          <div class="floating-coins">
            <div
              v-for="i in coinCount"
              :key="i"
              class="coin"
              :style="getCoinStyle(i)"
            >
              💰
            </div>
          </div>

          <!-- 闪烁的钻石 -->
          <div class="diamonds" v-if="winType === 'jackpot'">
            <div
              v-for="i in 8"
              :key="i"
              class="diamond"
              :style="getDiamondStyle(i)"
            >
              💎
            </div>
          </div>

          <!-- 彩带效果 -->
          <div class="confetti" v-if="winType !== 'normal'">
            <div
              v-for="i in confettiCount"
              :key="i"
              class="confetti-piece"
              :style="getConfettiStyle(i)"
            ></div>
          </div>
        </div>

        <!-- 倍数显示 -->
        <div v-if="multiplier > 1" class="multiplier-display">
          <span class="multiplier-text">{{ multiplier }}倍中奖!</span>
        </div>

        <!-- 继续按钮 -->
        <button
          v-if="showContinueButton"
          class="continue-button"
          @click="handleContinue"
        >
          <span>继续游戏</span>
          <div class="button-glow"></div>
        </button>
      </div>

      <!-- 烟花效果 -->
      <div v-if="winType === 'jackpot'" class="fireworks">
        <div
          v-for="i in 6"
          :key="i"
          class="firework"
          :style="getFireworkStyle(i)"
        >
          <div class="firework-spark" v-for="j in 8" :key="j" :style="getSparkStyle(j)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  winAmount?: number
  winType?: 'normal' | 'big' | 'super' | 'jackpot'
  duration?: number
  multiplier?: number
  autoClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  winAmount: 1000,
  winType: 'normal',
  duration: 5000,
  multiplier: 1,
  autoClose: true
})

// 事件定义
const emit = defineEmits<{
  finished: []
}>()

// 响应式数据
const animatedAmount = ref(0)
const contentRevealed = ref(false)
const showExplosion = ref(false)
const showContinueButton = ref(false)
const animationFrame = ref<number>()

// 计算属性
const particleCount = computed(() => {
  switch (props.winType) {
    case 'normal': return 20
    case 'big': return 40
    case 'super': return 60
    case 'jackpot': return 100
    default: return 20
  }
})

const coinCount = computed(() => {
  switch (props.winType) {
    case 'normal': return 3
    case 'big': return 6
    case 'super': return 10
    case 'jackpot': return 15
    default: return 3
  }
})

const confettiCount = computed(() => {
  switch (props.winType) {
    case 'big': return 30
    case 'super': return 50
    case 'jackpot': return 80
    default: return 0
  }
})

// 方法
const getWinTitle = () => {
  switch (props.winType) {
    case 'normal': return '恭喜中奖!'
    case 'big': return '大奖来了!'
    case 'super': return '超级大奖!'
    case 'jackpot': return '🎉 JACKPOT 🎉'
    default: return '恭喜中奖!'
  }
}

const getParticleStyle = (index: number) => {
  const angle = (index / particleCount.value) * 360
  const radius = 50 + Math.random() * 100
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 3

  return {
    left: '50%',
    top: '50%',
    transform: `rotate(${angle}deg) translateY(-${radius}px)`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getCoinStyle = (index: number) => {
  const randomX = 10 + Math.random() * 80
  const randomY = 20 + Math.random() * 60
  const delay = Math.random() * 1
  const duration = 3 + Math.random() * 2

  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getDiamondStyle = (index: number) => {
  const angle = (index / 8) * 360
  const radius = 150
  const delay = index * 0.2

  return {
    left: '50%',
    top: '50%',
    transform: `rotate(${angle}deg) translateY(-${radius}px)`,
    animationDelay: `${delay}s`
  }
}

const getConfettiStyle = (index: number) => {
  const randomX = Math.random() * 100
  const randomRotation = Math.random() * 360
  const delay = Math.random() * 0.5
  const duration = 3 + Math.random() * 2
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${randomX}%`,
    top: '-10px',
    backgroundColor: color,
    transform: `rotate(${randomRotation}deg)`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getFireworkStyle = (index: number) => {
  const positions = [
    { x: 20, y: 20 },
    { x: 80, y: 20 },
    { x: 50, y: 40 },
    { x: 15, y: 60 },
    { x: 85, y: 60 },
    { x: 50, y: 80 }
  ]
  const pos = positions[index] || { x: 50, y: 50 }
  const delay = index * 0.3

  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    animationDelay: `${delay}s`
  }
}

const getSparkStyle = (index: number) => {
  const angle = (index / 8) * 360
  const delay = Math.random() * 0.2

  return {
    transform: `rotate(${angle}deg) translateY(-30px)`,
    animationDelay: `${delay}s`
  }
}

const animateAmount = () => {
  const duration = 2000 // 2秒动画
  const steps = 60
  const increment = props.winAmount / steps
  let current = 0
  let step = 0

  const animate = () => {
    if (step < steps) {
      current += increment
      animatedAmount.value = Math.floor(current)
      step++
      animationFrame.value = requestAnimationFrame(animate)
    } else {
      animatedAmount.value = props.winAmount
    }
  }

  animate()
}

const startAnimation = () => {
  // 爆炸效果
  setTimeout(() => {
    showExplosion.value = true
  }, 100)

  // 内容显示
  setTimeout(() => {
    contentRevealed.value = true
  }, 300)

  // 金额动画
  setTimeout(() => {
    animateAmount()
  }, 500)

  // 继续按钮
  setTimeout(() => {
    showContinueButton.value = true
  }, 3000)

  // 自动关闭
  if (props.autoClose) {
    setTimeout(() => {
      handleFinished()
    }, props.duration)
  }
}

const handleContinue = () => {
  handleFinished()
}

const handleFinished = () => {
  emit('finished')
}

// 生命周期
onMounted(() => {
  console.log('🎉 中奖特效组件挂载', {
    amount: props.winAmount,
    type: props.winType
  })
  startAnimation()
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  console.log('🎉 中奖特效组件卸载')
})
</script>

<style scoped>
.winning-effect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, rgba(0, 0, 0, 0.9) 100%);
  backdrop-filter: blur(4px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayFadeIn 0.5s ease-out;
}

.winning-effect-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #ffd700 0%, #ffb300 100%);
  border-radius: 50%;
  animation: particleFloat 4s ease-out infinite;
}

.explosion-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.explosion-effect.active .explosion-ring {
  animation: explosionRing 0.8s ease-out;
}

.explosion-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid #ffd700;
  border-radius: 50%;
  opacity: 0;
}

.winning-content {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  border-radius: 24px;
  border: 3px solid transparent;
  background-clip: padding-box;
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.winning-content.revealed {
  opacity: 1;
  transform: scale(1);
}

.winning-content::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffd700);
  border-radius: 24px;
  z-index: -1;
  animation: borderGlow 3s ease-in-out infinite;
}

.winning-content.type-normal::before {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1, #4ecdc4);
}

.winning-content.type-big::before {
  background: linear-gradient(45deg, #ffd700, #ffb300, #ffd700);
}

.winning-content.type-super::before {
  background: linear-gradient(45deg, #ff6b6b, #ff4757, #ff6b6b);
}

.winning-content.type-jackpot::before {
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #96ceb4, #feca57, #ffd700);
  background-size: 300% 300%;
  animation: rainbowGlow 2s ease-in-out infinite;
}

.win-title {
  margin-bottom: 30px;
  position: relative;
}

.win-title h1 {
  font-size: 36px;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: titlePulse 2s ease-in-out infinite;
}

.win-title.normal h1 {
  color: #4ecdc4;
  text-shadow: 0 0 20px rgba(78, 205, 196, 0.6);
}

.win-title.big h1 {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.win-title.super h1 {
  color: #ff6b6b;
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.6);
}

.win-title.jackpot h1 {
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: rainbowText 2s ease-in-out infinite, titlePulse 2s ease-in-out infinite;
}

.title-decoration {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.decoration-star {
  color: #ffd700;
  font-size: 20px;
  animation: starTwinkle 1.5s ease-in-out infinite;
}

.amount-display {
  position: relative;
  margin: 40px 0;
}

.amount-label {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  font-weight: 500;
}

.amount-value {
  font-size: 48px;
  font-weight: 900;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 30px currentColor;
}

.amount-value.normal {
  color: #4ecdc4;
}

.amount-value.big {
  color: #ffd700;
}

.amount-value.super {
  color: #ff6b6b;
}

.amount-value.jackpot {
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: rainbowText 2s ease-in-out infinite;
}

.currency {
  font-size: 0.7em;
  vertical-align: top;
  margin-right: 4px;
}

.number {
  animation: numberCount 0.1s ease-out;
}

.amount-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.glow-ring,
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid currentColor;
}

.glow-ring {
  width: 200px;
  height: 200px;
  opacity: 0.3;
  animation: ringGlow 3s ease-in-out infinite;
}

.pulse-ring {
  width: 150px;
  height: 150px;
  opacity: 0.5;
  animation: ringPulse 2s ease-in-out infinite;
}

.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-coins {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.coin {
  position: absolute;
  font-size: 24px;
  animation: coinFloat 4s ease-in-out infinite;
}

.diamonds {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.diamond {
  position: absolute;
  font-size: 20px;
  animation: diamondSpin 3s linear infinite;
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  animation: confettiFall 4s linear infinite;
}

.multiplier-display {
  margin: 20px 0;
  padding: 12px 24px;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #ffd700;
  border-radius: 12px;
  display: inline-block;
}

.multiplier-text {
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
  animation: multiplierGlow 1.5s ease-in-out infinite;
}

.continue-button {
  background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
  color: #1a1a2e;
  border: none;
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 30px;
  opacity: 0;
  animation: buttonFadeIn 0.8s ease-out forwards;
}

.continue-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(255, 215, 0, 0.4);
}

.continue-button span {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: buttonShine 2s ease-in-out infinite;
}

.fireworks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.firework {
  position: absolute;
  animation: fireworkBurst 2s ease-out infinite;
}

.firework-spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #ffd700 0%, #ff6b6b 50%, #4ecdc4 100%);
  border-radius: 50%;
  animation: sparkFly 1.5s ease-out infinite;
}

/* 动画定义 */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
}

@keyframes explosionRing {
  0% {
    width: 50px;
    height: 50px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes numberCount {
  from {
    transform: translateY(-5px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes ringGlow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.6;
  }
}

@keyframes ringPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}

@keyframes coinFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

@keyframes diamondSpin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes multiplierGlow {
  0%, 100% {
    text-shadow: 0 0 10px #ffd700;
  }
  50% {
    text-shadow: 0 0 20px #ffd700, 0 0 30px #ffd700;
  }
}

@keyframes buttonFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes buttonShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes fireworkBurst {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes sparkFly {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--random-x, 0), var(--random-y, 0));
    opacity: 0;
  }
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@keyframes rainbowGlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes rainbowText {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .winning-content {
    padding: 30px 20px;
    margin: 20px;
  }

  .win-title h1 {
    font-size: 28px;
  }

  .amount-value {
    font-size: 36px;
  }

  .amount-label {
    font-size: 16px;
  }

  .glow-ring {
    width: 150px;
    height: 150px;
  }

  .pulse-ring {
    width: 120px;
    height: 120px;
  }

  .continue-button {
    padding: 14px 32px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .winning-content {
    padding: 20px 16px;
    margin: 10px;
  }

  .win-title h1 {
    font-size: 24px;
  }

  .amount-value {
    font-size: 32px;
  }

  .decoration-star {
    font-size: 16px;
  }

  .coin {
    font-size: 20px;
  }

  .diamond {
    font-size: 16px;
  }

  .continue-button {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>
