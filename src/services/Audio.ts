// 🎵 基于 Howler.js 的音频系统 - 完全重构版
import { ref, computed, reactive, readonly } from 'vue'
import { Howl, Howler } from 'howler'

// 全局单例状态
let audioSystemInstance: ReturnType<typeof createAudioSystem> | null = null
let isGlobalInitialized = false

// 🎯 音频配置接口
export interface AudioConfig {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  enableSfx: boolean
  enableMusic: boolean
  enableVibration: boolean
}

// 🎯 音效定义接口
export interface SoundDefinition {
  id: string
  filename: string // 只需要文件名，不含扩展名
  volume?: number
  loop?: boolean
  category: 'sfx' | 'music'
  formats?: string[] // 支持的格式，默认 ['mp3', 'wav']
}

// 🎯 音频系统状态
export interface AudioSystemState {
  isInitialized: boolean
  isSupported: boolean
  isUnlocked: boolean
  backgroundMusicId: string | null
  backgroundMusicPosition: number
  isBgmUserPaused: boolean
  sfxQueueLength: number
  lastOperation: string
  errorCount: number
}

// 🎯 音效播放选项
export interface PlaySoundOptions {
  volume?: number
  loop?: boolean
  interrupt?: boolean
  fade?: { duration: number; from?: number; to?: number }
  onEnd?: () => void
  onPlay?: () => void
  onError?: (error: any) => void
}

// 🎯 音效队列项
interface SfxQueueItem {
  id: string
  howl: Howl
  options: PlaySoundOptions
  timestamp: number
  priority: number
}

// 🎯 iOS Safari 兼容性检测
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const isIOSSafari = isIOS && isSafari

// 🎯 音频文件路径管理 - iOS优化
const AUDIO_BASE_PATH = '/src/assets/audio'
const DEFAULT_FORMATS = isIOSSafari ? ['mp3'] : ['mp3', 'wav'] // iOS Safari 优先MP3

const getAudioSources = (filename: string, formats: string[] = DEFAULT_FORMATS): string[] => {
  return formats.map(format => `${AUDIO_BASE_PATH}/${filename}.${format}`)
}

// 🎯 核心音频系统创建函数
function createAudioSystem() {
  console.log('🎵 创建基于 Howler.js 的音频系统实例')

  // 音频配置
  const config = reactive<AudioConfig>({
    masterVolume: 0.8,
    sfxVolume: 0.7,
    musicVolume: 0.4,
    enableSfx: true,
    enableMusic: true,
    enableVibration: true
  })

  // 系统状态 - iOS Safari 优化
  const state = reactive<AudioSystemState>({
    isInitialized: false,
    isSupported: true,
    isUnlocked: false,
    backgroundMusicId: null,
    backgroundMusicPosition: 0,
    isBgmUserPaused: false,
    sfxQueueLength: 0,
    lastOperation: 'none',
    errorCount: 0
  })

  // 🎯 iOS Safari 特殊状态管理
  const iosState = reactive({
    hasUserInteracted: false,
    isPlayingSfx: false,
    backgroundMusicPausedForSfx: false,
    currentSfxId: null as string | null
  })

  // 音效实例缓存 - iOS Safari 限制缓存大小
  const soundCache = new Map<string, Howl>()
  const backgroundMusicCache = new Map<string, Howl>()
  const maxCacheSize = isIOSSafari ? 5 : 20 // iOS Safari 限制缓存

  // 音效播放队列 - iOS Safari 单个播放
  const sfxQueue = reactive<SfxQueueItem[]>([])
  let isProcessingQueue = false

  // 🎯 预定义音效库 - 百家乐音效系统
  const soundDefinitions: Record<string, SoundDefinition> = {
    // 庄家音效
    'banker0': { id: 'banker0', filename: 'banker0', category: 'sfx', volume: 0.8 },
    'banker1': { id: 'banker1', filename: 'banker1', category: 'sfx', volume: 0.8 },
    'banker2': { id: 'banker2', filename: 'banker2', category: 'sfx', volume: 0.8 },
    'banker3': { id: 'banker3', filename: 'banker3', category: 'sfx', volume: 0.8 },
    'banker4': { id: 'banker4', filename: 'banker4', category: 'sfx', volume: 0.8 },
    'banker5': { id: 'banker5', filename: 'banker5', category: 'sfx', volume: 0.8 },
    'banker6': { id: 'banker6', filename: 'banker6', category: 'sfx', volume: 0.8 },
    'banker7': { id: 'banker7', filename: 'banker7', category: 'sfx', volume: 0.8 },
    'banker8': { id: 'banker8', filename: 'banker8', category: 'sfx', volume: 0.8 },
    'banker9': { id: 'banker9', filename: 'banker9', category: 'sfx', volume: 0.8 },
    'bankerWin': { id: 'bankerWin', filename: 'bankerWin', category: 'sfx', volume: 0.8 },

    // 游戏控制音效
    'bet': { id: 'bet', filename: 'bet', category: 'sfx', volume: 0.7 },
    'betSound': { id: 'betSound', filename: 'betSound', category: 'sfx', volume: 0.7 },
    'betSuccess': { id: 'betSuccess', filename: 'betSuccess', category: 'sfx', volume: 0.7 },
    'bg': { id: 'bg', filename: 'bg', category: 'sfx', volume: 0.6 },
    'bigWin': { id: 'bigWin', filename: 'bigWin', category: 'sfx', volume: 0.9 },
    'celebration': { id: 'celebration', filename: 'celebration', category: 'sfx', volume: 0.8 },
    'coin': { id: 'coin', filename: 'coin', category: 'sfx', volume: 0.7 },
    'error': { id: 'error', filename: 'error', category: 'sfx', volume: 0.8 },
    'jackpot': { id: 'jackpot', filename: 'jackpot', category: 'sfx', volume: 1.0 },

    // 开牌语音
    'OPENCARD': { id: 'OPENCARD', filename: 'OPENCARD', category: 'sfx', volume: 0.8 },

    // 玩家音效
    'player0': { id: 'player0', filename: 'player0', category: 'sfx', volume: 0.8 },
    'player1': { id: 'player1', filename: 'player1', category: 'sfx', volume: 0.8 },
    'player2': { id: 'player2', filename: 'player2', category: 'sfx', volume: 0.8 },
    'player3': { id: 'player3', filename: 'player3', category: 'sfx', volume: 0.8 },
    'player4': { id: 'player4', filename: 'player4', category: 'sfx', volume: 0.8 },
    'player5': { id: 'player5', filename: 'player5', category: 'sfx', volume: 0.8 },
    'player6': { id: 'player6', filename: 'player6', category: 'sfx', volume: 0.8 },
    'player7': { id: 'player7', filename: 'player7', category: 'sfx', volume: 0.8 },
    'player8': { id: 'player8', filename: 'player8', category: 'sfx', volume: 0.8 },
    'player9': { id: 'player9', filename: 'player9', category: 'sfx', volume: 0.8 },
    'playerWin': { id: 'playerWin', filename: 'playerWin', category: 'sfx', volume: 0.8 },

    // 游戏状态音效
    'stop': { id: 'stop', filename: 'stop', category: 'sfx', volume: 0.7 },
    'tie': { id: 'tie', filename: 'tie', category: 'sfx', volume: 0.8 },
    'welcome': { id: 'welcome', filename: 'welcome', category: 'sfx', volume: 0.8 },
    'win': { id: 'win', filename: 'win', category: 'sfx', volume: 0.9 },

    // 背景音乐
    'background': { id: 'background', filename: 'bg', category: 'music', volume: 0.4, loop: true }
  }

  // 🎯 计算属性 - iOS Safari 优化
  const canPlayAudio = computed(() => {
    return state.isSupported && state.isUnlocked && state.isInitialized &&
           (isIOSSafari ? iosState.hasUserInteracted : true)
  })

  const effectiveVolume = computed(() => {
    // iOS Safari 音量调整
    const volumeMultiplier = isIOSSafari ? 0.8 : 1.0
    return {
      sfx: config.enableSfx ? config.masterVolume * config.sfxVolume * volumeMultiplier : 0,
      music: config.enableMusic ? config.masterVolume * config.musicVolume * volumeMultiplier : 0
    }
  })

  const isBackgroundMusicPlaying = computed(() => {
    if (!state.backgroundMusicId) return false
    const bgMusic = backgroundMusicCache.get(state.backgroundMusicId)
    return bgMusic && bgMusic.playing() && !state.isBgmUserPaused
  })

  // 🎯 初始化音频系统 - iOS Safari 优化
  const initializeAudio = async (): Promise<boolean> => {
    if (state.isInitialized) {
      console.log('🎵 音频系统已初始化，跳过重复初始化')
      return true
    }

    try {
      console.log('🎵 开始初始化 Howler.js 音频系统...', isIOSSafari ? '(iOS Safari模式)' : '')

      // 检查 Howler.js 是否可用
      if (typeof Howler === 'undefined') {
        console.error('❌ Howler.js 未加载')
        state.isSupported = false
        return false
      }

      // 设置全局 Howler 配置
      Howler.volume(config.masterVolume)

      // iOS Safari 不支持音频池，跳过设置
      if (!isIOSSafari) {
        try {
          if ('html5PoolSize' in Howler) {
            (Howler as any).html5PoolSize = 10
          }
        } catch (e) {
          console.warn('⚠️ 无法设置HTML5音频池大小，跳过')
        }
      }

      // 🎯 iOS Safari 用户交互检测
      if (isIOSSafari) {
        const enableUserInteraction = () => {
          iosState.hasUserInteracted = true
          console.log('✅ iOS Safari 用户交互已激活')
        }

        // 监听用户交互事件
        document.addEventListener('touchstart', enableUserInteraction, { once: true })
        document.addEventListener('touchend', enableUserInteraction, { once: true })
        document.addEventListener('click', enableUserInteraction, { once: true })

        console.log('🎯 iOS Safari 等待用户交互...')
      }

      state.isInitialized = true
      state.lastOperation = 'initialized'
      console.log('✅ Howler.js 音频系统初始化完成', isIOSSafari ? '(iOS Safari模式)' : '')
      return true
    } catch (error) {
      console.error('❌ 音频系统初始化失败:', error)
      state.isSupported = false
      state.errorCount++
      return false
    }
  }

  // 🎯 解锁音频上下文
  const unlockAudioContext = async (): Promise<boolean> => {
    if (state.isUnlocked) {
      console.log('🎵 音频上下文已解锁，跳过重复解锁')
      return true
    }

    try {
      console.log('🔓 正在解锁音频上下文...')

      // 使用 Howler.js 解锁音频上下文
      const unlockResult = await new Promise<boolean>((resolve) => {
        // 创建一个静音音频进行解锁
        const unlockSound = new Howl({
          src: getAudioSources('chip-select'),
          volume: 0,
          preload: false,
          onload: () => {
            unlockSound.play()
            unlockSound.stop()
            unlockSound.unload()
            resolve(true)
          },
          onloaderror: () => {
            resolve(true) // 即使失败也继续，不阻塞游戏
          }
        })

        // 超时保护
        setTimeout(() => resolve(true), 2000)
      })

      state.isUnlocked = unlockResult
      state.lastOperation = 'unlocked'
      console.log('✅ 音频上下文解锁成功')
      return true
    } catch (error) {
      console.warn('⚠️ 音频上下文解锁失败:', error)
      state.isUnlocked = true // 静默处理，不阻塞游戏
      state.errorCount++
      return true
    }
  }

  // 🎯 创建音效实例
  const createSoundInstance = (definition: SoundDefinition): Howl => {
    const sources = getAudioSources(definition.filename, definition.formats)

    return new Howl({
      src: sources,
      volume: definition.volume || 1.0,
      loop: definition.loop || false,
      preload: false, // 按需加载
      onload: () => {
        console.log(`🎵 音效加载成功: ${definition.id}`)
      },
      onloaderror: () => {
        console.error(`❌ 音效加载失败: ${definition.id}`)
        state.errorCount++
      },
      onplay: () => {
        console.log(`🎵 音效播放开始: ${definition.id}`)
      },
      onend: () => {
        console.log(`🎵 音效播放结束: ${definition.id}`)
      },
      onplayerror: () => {
        console.error(`❌ 音效播放错误: ${definition.id}`)
        state.errorCount++
      }
    })
  }

  // 🎯 处理音效队列
  const processQueue = async (): Promise<void> => {
    if (isProcessingQueue || sfxQueue.length === 0) return

    isProcessingQueue = true
    state.sfxQueueLength = sfxQueue.length

    try {
      while (sfxQueue.length > 0) {
        const item = sfxQueue.shift()!

        // 应用音量设置
        const finalVolume = (item.options.volume || 1.0) * effectiveVolume.value.sfx
        item.howl.volume(finalVolume)

        // 播放音效
        await new Promise<void>((resolve) => {
          const onEnd = () => {
            resolve()
          }

          const onStop = () => {
            resolve()
          }

          item.howl.once('end', onEnd)
          item.howl.once('stop', onStop)

          // 播放音效
          item.howl.play()

          // 如果不是循环音效，设置超时保护
          if (!item.howl.loop()) {
            setTimeout(() => {
              resolve()
            }, 5000) // 5秒超时
          }
        })

        // 清理非循环音效
        if (!item.howl.loop()) {
          item.howl.unload()
        }
      }
    } catch (error) {
      console.error('❌ 处理音效队列失败:', error)
      state.errorCount++
    } finally {
      isProcessingQueue = false
      state.sfxQueueLength = sfxQueue.length
    }
  }

  // 🎯 播放音效
  const playSound = async (
    soundId: string,
    options: PlaySoundOptions = {}
  ): Promise<boolean> => {
    if (!canPlayAudio.value) {
      console.warn('⚠️ 音频系统未就绪，跳过播放:', soundId)
      return false
    }

    try {
      const soundDef = soundDefinitions[soundId]
      if (!soundDef) {
        console.warn(`⚠️ 未找到音效定义: ${soundId}`)
        return false
      }

      const categoryVolume = effectiveVolume.value[soundDef.category]
      if (categoryVolume <= 0) {
        console.log(`🔇 ${soundDef.category} 类别音效已禁用，跳过播放:`, soundId)
        return false
      }

      // 背景音乐特殊处理
      if (soundDef.category === 'music') {
        return await playBackgroundMusic(soundId)
      }

      // 创建或获取音效实例
      let soundInstance = soundCache.get(soundId)
      if (!soundInstance) {
        soundInstance = createSoundInstance(soundDef)
        soundCache.set(soundId, soundInstance)
      }

      // 添加到队列
      const queueItem: SfxQueueItem = {
        id: soundId,
        howl: soundInstance,
        options,
        timestamp: Date.now(),
        priority: 1
      }

      sfxQueue.push(queueItem)

      // 触发震动
      if (config.enableVibration && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }

      // 处理队列
      processQueue()

      state.lastOperation = `play_${soundId}`
      console.log(`🎵 音效已添加到队列: ${soundId}`)
      return true
    } catch (error) {
      console.error(`❌ 播放音效失败 ${soundId}:`, error)
      state.errorCount++
      return false
    }
  }

  // 🎯 播放自定义音频文件
  const playAudioFile = async (
    filePath: string,
    options: PlaySoundOptions = {}
  ): Promise<boolean> => {
    if (!canPlayAudio.value) {
      console.warn('⚠️ 音频系统未就绪，跳过播放:', filePath)
      return false
    }

    try {
      // 支持绝对路径和相对路径
      const audioSources = filePath.startsWith('/') || filePath.startsWith('http')
        ? [filePath]
        : getAudioSources(filePath.replace(/\.[^/.]+$/, '')) // 移除扩展名

      const customSound = new Howl({
        src: audioSources,
        volume: options.volume || 1.0,
        loop: options.loop || false,
        preload: false,
        onload: () => {
          console.log('🎵 自定义音频加载成功:', filePath)
        },
        onloaderror: () => {
          console.error('❌ 自定义音频加载失败:', filePath)
          state.errorCount++
        },
        onplay: () => {
          if (options.onPlay) options.onPlay()
        },
        onend: () => {
          if (options.onEnd) options.onEnd()
          customSound.unload() // 播放完成后卸载
        }
      })

      // 应用音量设置
      const finalVolume = (options.volume || 1.0) * effectiveVolume.value.sfx
      customSound.volume(finalVolume)

      // 播放音频
      customSound.play()

      state.lastOperation = `play_file_${filePath}`
      console.log(`🎵 自定义音频播放: ${filePath}`)
      return true
    } catch (error) {
      console.error(`❌ 播放自定义音频失败 ${filePath}:`, error)
      state.errorCount++
      return false
    }
  }

  // 🎯 播放背景音乐
  const playBackgroundMusic = async (musicId: string = 'background'): Promise<boolean> => {
    if (!canPlayAudio.value || !config.enableMusic) {
      console.log('🔇 音频系统未就绪或音乐已禁用')
      return false
    }

    try {
      const musicDef = soundDefinitions[musicId]
      if (!musicDef || musicDef.category !== 'music') {
        console.error(`❌ 未找到背景音乐定义: ${musicId}`)
        return false
      }

      // 停止当前背景音乐
      if (state.backgroundMusicId && state.backgroundMusicId !== musicId) {
        await stopBackgroundMusic()
      }

      // 创建或获取背景音乐实例
      let musicInstance = backgroundMusicCache.get(musicId)
      if (!musicInstance) {
        musicInstance = new Howl({
          src: getAudioSources(musicDef.filename, musicDef.formats),
          volume: effectiveVolume.value.music,
          loop: true,
          preload: false,
          onload: () => {
            console.log(`🎵 背景音乐加载成功: ${musicId}`)
          },
          onloaderror: () => {
            console.error(`❌ 背景音乐加载失败: ${musicId}`)
            state.errorCount++
          },
          onplay: () => {
            console.log(`🎵 背景音乐播放开始: ${musicId}`)
          },
          onend: () => {
            console.log(`🎵 背景音乐播放结束: ${musicId}`)
          }
        })
        backgroundMusicCache.set(musicId, musicInstance)
      }

      // 如果已经在播放，跳过
      if (musicInstance.playing() && !state.isBgmUserPaused) {
        console.log('🎵 背景音乐已在播放中')
        return true
      }

      // 恢复播放位置
      if (state.backgroundMusicPosition > 0) {
        musicInstance.seek(state.backgroundMusicPosition)
      }

      // 开始播放
      musicInstance.play()
      state.backgroundMusicId = musicId
      state.isBgmUserPaused = false
      state.lastOperation = `play_background_${musicId}`

      console.log(`✅ 背景音乐播放成功: ${musicId}`)
      return true
    } catch (error) {
      console.error(`❌ 播放背景音乐失败 ${musicId}:`, error)
      state.errorCount++
      return false
    }
  }

  // 🎯 暂停背景音乐
  const pauseBackgroundMusic = (): void => {
    if (!state.backgroundMusicId) return

    const musicInstance = backgroundMusicCache.get(state.backgroundMusicId)
    if (musicInstance && musicInstance.playing()) {
      state.backgroundMusicPosition = musicInstance.seek() as number
      musicInstance.pause()
      state.isBgmUserPaused = true
      state.lastOperation = 'pause_background'
      console.log('⏸️ 背景音乐已暂停')
    }
  }

  // 🎯 恢复背景音乐
  const resumeBackgroundMusic = (): void => {
    if (!state.backgroundMusicId || !config.enableMusic) return

    const musicInstance = backgroundMusicCache.get(state.backgroundMusicId)
    if (musicInstance && !musicInstance.playing()) {
      musicInstance.play()
      state.isBgmUserPaused = false
      state.lastOperation = 'resume_background'
      console.log('▶️ 背景音乐已恢复')
    }
  }

  // 🎯 停止背景音乐
  const stopBackgroundMusic = async (): Promise<void> => {
    if (!state.backgroundMusicId) return

    const musicInstance = backgroundMusicCache.get(state.backgroundMusicId)
    if (musicInstance) {
      musicInstance.stop()
      state.backgroundMusicPosition = 0
      state.isBgmUserPaused = false
      state.lastOperation = 'stop_background'
      console.log('⏹️ 背景音乐已停止')
    }
  }

  // 🎯 切换背景音乐
  const toggleMusic = async (): Promise<void> => {
    config.enableMusic = !config.enableMusic

    if (config.enableMusic) {
      await playBackgroundMusic()
    } else {
      pauseBackgroundMusic()
    }

    saveConfig()
    state.lastOperation = 'toggle_music'
    console.log('🎵 背景音乐开关切换:', config.enableMusic ? '已开启' : '已关闭')
  }

  // 🎯 音量控制
  const setMasterVolume = (volume: number): void => {
    config.masterVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(config.masterVolume)
    updateBackgroundMusicVolume()
    saveConfig()
  }

  const setSfxVolume = (volume: number): void => {
    config.sfxVolume = Math.max(0, Math.min(1, volume))
    saveConfig()
  }

  const setMusicVolume = (volume: number): void => {
    config.musicVolume = Math.max(0, Math.min(1, volume))
    updateBackgroundMusicVolume()
    saveConfig()
  }

  const updateBackgroundMusicVolume = (): void => {
    if (state.backgroundMusicId) {
      const musicInstance = backgroundMusicCache.get(state.backgroundMusicId)
      if (musicInstance) {
        musicInstance.volume(effectiveVolume.value.music)
      }
    }
  }

  // 🎯 音效开关
  const toggleSfx = (): void => {
    config.enableSfx = !config.enableSfx
    saveConfig()
    state.lastOperation = 'toggle_sfx'
    console.log('🎵 音效开关切换:', config.enableSfx ? '开启' : '关闭')
  }

  // 🎯 播放开牌语音 - 百家乐版本
  const playOpenCardAudio = async (betId: string): Promise<boolean> => {
    if (!canPlayAudio.value || !config.enableSfx) {
      console.log('🔇 音频系统未就绪或音效已禁用，跳过开牌语音')
      return false
    }

    try {
      console.log('🎵 播放开牌语音:', betId)

      // 创建开牌语音实例
      const openCardSound = new Howl({
        src: getAudioSources(`open/${betId}`),
        volume: effectiveVolume.value.sfx,
        preload: false,
        onload: () => {
          console.log(`🎵 开牌语音加载成功: ${betId}`)
        },
        onloaderror: () => {
          console.error(`❌ 开牌语音加载失败: ${betId}`)
          state.errorCount++
        },
        onplay: () => {
          console.log(`🎵 开牌语音播放开始: ${betId}`)
        },
        onend: () => {
          console.log(`🎵 开牌语音播放结束: ${betId}`)
          openCardSound.unload() // 播放完成后卸载
        }
      })

      // 播放开牌语音
      openCardSound.play()
      state.lastOperation = `play_open_card_${betId}`

      console.log(`✅ 开牌语音播放: ${betId}`)
      return true
    } catch (error) {
      console.error('❌ 开牌语音播放失败:', error)
      state.errorCount++
      return false
    }
  }

  // 🎯 百家乐快捷播放方法
  const playBetSound = () => playSound('bet')
  const playBetSuccessSound = () => playSound('betSuccess')
  const playBetSoundEffect = () => playSound('betSound')
  const playErrorSound = () => playSound('error')
  const playWinSound = () => playSound('win')
  const playBigWinSound = () => playSound('bigWin')
  const playJackpotSound = () => playSound('jackpot')
  const playCelebrationSound = () => playSound('celebration')
  const playCoinSound = () => playSound('coin')
  const playWelcomeSound = () => playSound('welcome')
  const playStopSound = () => playSound('stop')
  const playTieSound = () => playSound('tie')
  const playOpenCardSound = () => playSound('OPENCARD')

  // 庄家点数语音
  const playBankerSound = (point: number) => playSound(`banker${point}`)
  const playBankerWinSound = () => playSound('bankerWin')

  // 玩家点数语音
  const playPlayerSound = (point: number) => playSound(`player${point}`)
  const playPlayerWinSound = () => playSound('playerWin')

  // 🎯 配置管理
  const saveConfig = (): void => {
    try {
      const configToSave = {
        ...config,
        backgroundMusicPosition: state.backgroundMusicPosition,
        isBgmUserPaused: state.isBgmUserPaused,
        backgroundMusicId: state.backgroundMusicId
      }
      localStorage.setItem('bjl_audio_config', JSON.stringify(configToSave))
      console.log('💾 音频配置已保存')
    } catch (error) {
      console.error('❌ 保存音频配置失败:', error)
      state.errorCount++
    }
  }

  const loadConfig = (): void => {
    try {
      const saved = localStorage.getItem('bjl_audio_config')
      if (saved) {
        const savedConfig = JSON.parse(saved)

        // 加载基础配置
        Object.assign(config, {
          masterVolume: savedConfig.masterVolume ?? config.masterVolume,
          sfxVolume: savedConfig.sfxVolume ?? config.sfxVolume,
          musicVolume: savedConfig.musicVolume ?? config.musicVolume,
          enableSfx: savedConfig.enableSfx ?? config.enableSfx,
          enableMusic: savedConfig.enableMusic ?? config.enableMusic,
          enableVibration: savedConfig.enableVibration ?? config.enableVibration
        })

        // 加载背景音乐状态
        state.backgroundMusicPosition = savedConfig.backgroundMusicPosition ?? 0
        state.isBgmUserPaused = savedConfig.isBgmUserPaused ?? false
        state.backgroundMusicId = savedConfig.backgroundMusicId ?? null

        console.log('📂 音频配置已加载:', config)
      }
    } catch (error) {
      console.error('❌ 加载音频配置失败:', error)
      state.errorCount++
    }
  }

  // 🎯 系统清理
  const cleanup = (): void => {
    console.log('🧹 清理音频系统...')

    // 停止所有音效
    sfxQueue.length = 0
    soundCache.forEach(sound => sound.unload())
    soundCache.clear()

    // 停止背景音乐
    backgroundMusicCache.forEach(music => music.unload())
    backgroundMusicCache.clear()

    // 重置状态
    state.backgroundMusicId = null
    state.backgroundMusicPosition = 0
    state.isBgmUserPaused = false
    state.lastOperation = 'cleanup'

    console.log('✅ 音频系统清理完成')
  }

  // 🎯 获取系统信息 - iOS Safari 优化
  const getAudioInfo = () => ({
    ...state,
    config: { ...config },
    queueLength: sfxQueue.length,
    cacheSize: soundCache.size,
    backgroundMusicCacheSize: backgroundMusicCache.size,
    howlerVersion: (Howler as unknown as { version?: string }).version || 'unknown',
    // iOS Safari 特殊信息
    platform: {
      isIOSSafari,
      isSafari,
      isIOS,
      hasUserInteracted: iosState.hasUserInteracted,
      isPlayingSfx: iosState.isPlayingSfx,
      backgroundMusicPausedForSfx: iosState.backgroundMusicPausedForSfx,
      maxCacheSize
    }
  })

  const getSfxStatus = () => ({
    enabled: config.enableSfx,
    volume: effectiveVolume.value.sfx,
    canPlay: canPlayAudio.value && config.enableSfx,
    queueLength: sfxQueue.length,
    isProcessing: isProcessingQueue,
    systemType: isIOSSafari ? 'ios_safari_optimized' : 'howler_based',
    currentSfxId: iosState.currentSfxId,
    hasUserInteracted: iosState.hasUserInteracted
  })

  // 🎯 iOS Safari 手动触发用户交互
  const triggerUserInteraction = (): void => {
    if (isIOSSafari && !iosState.hasUserInteracted) {
      iosState.hasUserInteracted = true
      console.log('✅ iOS Safari 用户交互已手动激活')
    }
  }

  // 🎯 自动启动背景音乐
  const startBackgroundMusicIfEnabled = async (): Promise<boolean> => {
    if (config.enableMusic && canPlayAudio.value && !state.isBgmUserPaused) {
      return await playBackgroundMusic()
    }
    return false
  }

  return {
    // 状态
    config,
    state: readonly(state),

    // 计算属性
    canPlayAudio,
    effectiveVolume,
    isBackgroundMusicPlaying,

    // 核心方法
    initializeAudio,
    unlockAudioContext,
    playSound,
    playAudioFile,

    // 背景音乐控制
    playBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    stopBackgroundMusic,
    startBackgroundMusicIfEnabled,

    // 音量和开关控制
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    toggleSfx,
    toggleMusic,
    updateBackgroundMusicVolume,

    // 快捷方法
    playBetSound,
    playBetSuccessSound,
    playBetSoundEffect,
    playErrorSound,
    playWinSound,
    playBigWinSound,
    playJackpotSound,
    playCelebrationSound,
    playCoinSound,
    playWelcomeSound,
    playStopSound,
    playTieSound,
    playOpenCardSound,
    playBankerSound,
    playBankerWinSound,
    playPlayerSound,
    playPlayerWinSound,

    // 开牌语音
    playOpenCardAudio,

    // 配置和系统管理
    saveConfig,
    loadConfig,
    cleanup,
    getAudioInfo,
    getSfxStatus,

    // 🎯 iOS Safari 专用方法
    triggerUserInteraction,

    // 🎯 iOS Safari 状态检查
    isIOSSafari: () => isIOSSafari,
    hasUserInteracted: () => iosState.hasUserInteracted,
    isPlayingSfx: () => iosState.isPlayingSfx
  }
}

// 🎯 单例模式导出
export const useAudio = () => {
  if (!audioSystemInstance) {
    console.log('🎵 首次创建 Howler.js 音频系统单例')
    audioSystemInstance = createAudioSystem()
    audioSystemInstance.loadConfig()
  }
  return audioSystemInstance
}

// 🎯 全局初始化
export const initializeGlobalAudioSystem = async (): Promise<boolean> => {
  if (isGlobalInitialized) {
    console.log('🎵 全局音频系统已初始化，跳过')
    return true
  }

  console.log('🎵 开始全局音频系统初始化 (Howler.js)')
  const audioSystem = useAudio()
  const result = await audioSystem.initializeAudio()

  if (result) {
    isGlobalInitialized = true
    console.log('✅ 全局音频系统初始化完成 (Howler.js)')
  }

  return result
}

// 🎯 全局解锁
export const unlockGlobalAudioContext = async (): Promise<boolean> => {
  const audioSystem = useAudio()
  return await audioSystem.unlockAudioContext()
}

// 🎯 全局清理
export const cleanupGlobalAudioSystem = (): void => {
  if (audioSystemInstance) {
    console.log('🎵 清理全局音频系统')
    audioSystemInstance.cleanup()
    audioSystemInstance = null
    isGlobalInitialized = false
  }
}
