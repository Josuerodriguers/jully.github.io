import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './App.css'
import loveSong from './music/Chris Stapleton - Tennessee Whiskey.mp3'

const START_DATE = new Date('2018-03-20T00:00:00')
const PASSCODE = '20032018'

const images = [
  new URL('./imgs/WhatsApp Image 2026-03-20 at 09.52.17 (1).jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 09.52.17 (2).jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 09.52.17.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 09.52.18.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 10.02.32.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 10.04.29.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 10.04.55.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 10.05.52.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 10.07.03.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 12.17.26.jpeg', import.meta.url).href,
  new URL('./imgs/WhatsApp Image 2026-03-20 at 10.08.27.jpeg', import.meta.url).href,
]

const pad = (value: number) => String(value).padStart(2, '0')

function getCounterData() {
  const now = new Date()
  const diffMs = now.getTime() - START_DATE.getTime()

  if (diffMs < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, totalSeconds }
}

type ImageSize = {
  width: number
  height: number
  ratio: number
}

type HeartDrop = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
}

function App() {
  const [locked, setLocked] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [counter, setCounter] = useState(getCounterData())
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [heartRain, setHeartRain] = useState<HeartDrop[]>([])
  const [imageSize, setImageSize] = useState<ImageSize>({
    width: 4,
    height: 5,
    ratio: 4 / 5,
  })
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentImage = useMemo(() => images[currentIndex], [currentIndex])

  useEffect(() => {
    if (!locked) {
      const id = window.setInterval(() => setCounter(getCounterData()), 1000)
      return () => window.clearInterval(id)
    }
  }, [locked])

  useEffect(() => {
    if (!locked && !isImageOpen) {
      const slide = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, 4000)

      return () => window.clearInterval(slide)
    }
  }, [locked, isImageOpen])

  useEffect(() => {
    const img = new Image()
    img.src = currentImage

    img.onload = () => {
      const width = img.naturalWidth || 4
      const height = img.naturalHeight || 5
      const ratio = width / height

      setImageSize({ width, height, ratio })
    }
  }, [currentImage])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageOpen(false)
      }

      if (locked) return

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      }

      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [locked])

  useEffect(() => {
    if (isImageOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isImageOpen])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const playMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      audio.volume = 0.45
      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Não foi possível iniciar a música:', err)
    }
  }

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (audio.paused) {
        await audio.play()
        setIsPlaying(true)
      } else {
        audio.pause()
        setIsPlaying(false)
      }
    } catch (err) {
      console.error('Erro ao controlar a música:', err)
    }
  }

  const onUnlock = async () => {
    if (password.trim() === PASSCODE) {
      setLocked(false)
      setError('')
      setCounter(getCounterData())
      await playMusic()
      return
    }

    setError('Senha incorreta. Dica: nosso início 💌')
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const triggerHeartRain = () => {
    const drops: HeartDrop[] = Array.from({ length: 28 }, (_, index) => ({
      id: Date.now() + index,
      left: 5 + Math.random() * 90,
      size: 18 + Math.random() * 22,
      duration: 3 + Math.random() * 2.5,
      delay: Math.random() * 0.8,
      drift: -50 + Math.random() * 100,
    }))

    setHeartRain(drops)

    window.setTimeout(() => {
      setHeartRain([])
    }, 7000)
  }

  const aspectRatio = `${imageSize.width} / ${imageSize.height}`

  return (
    <>
      <audio ref={audioRef} src={loveSong} preload="auto" loop />

      {heartRain.length > 0 && (
        <div className="heart-rain" aria-hidden="true">
          {heartRain.map((heart, index) => {
            const heartSymbols = ['💖', '💘', '💕', '💗']
            const symbol = heartSymbols[index % heartSymbols.length]

            return (
              <span
                key={heart.id}
                className="heart-drop"
                style={
                  {
                    left: `${heart.left}%`,
                    fontSize: `${heart.size}px`,
                    animationDuration: `${heart.duration}s`,
                    animationDelay: `${heart.delay}s`,
                    ['--drift' as '--drift']: `${heart.drift}px`,
                  } as CSSProperties
                }
              >
                {symbol}
              </span>
            )
          })}
        </div>
      )}

      <div className="page">
        <div className="card">
          {locked ? (
            <div className="lock-card">
              <div className="lock-heart">💖</div>
              <h1>Bem-vindo! Momo</h1>
              <p className="lock-subtitle">Digite nossa data especial</p>

              <input
                type="password"
                placeholder="HeHe Adivinha..."
                maxLength={8}
                aria-label="Senha em data"
                value={password}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, '');
                  setPassword(onlyNumbers);
                }}
                onKeyDown={(e) => e.key === 'Enter' && void onUnlock()}
              />

              <button onClick={() => void onUnlock()}>Entrar</button>
              <p className="error">{error}</p>
            </div>
          ) : (
            <div className="main-card">
              <div className="top">
                <div>
                  <h1>Nossa história</h1>
                  <p className="subtitle">Desde 20 de março de 2018 e contando...</p>
                </div>

                <button
                  className="love-badge love-badge-btn"
                  title="Fazer chover corações"
                  type="button"
                  onClick={triggerHeartRain}
                >
                  💘
                </button>
              </div>

              <div className="music-player">
                <div className="music-info">
                  <span className="music-label">Tocando agora</span>
                  <strong className="music-title">Tennessee Whiskey — Chris Stapleton</strong>
                </div>

                <button
                  className="music-btn"
                  type="button"
                  onClick={() => void toggleMusic()}
                  aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                >
                  {isPlaying ? '⏸️ Pausar' : '▶️ Tocar'}
                </button>
              </div>

              <div className="content">
                <div className="counter-box">
                  <p className="counter-title">
                    Eu te amo há <span className="heart-inline">❤️</span>
                  </p>
                  <p className="counter-days">{counter.days.toLocaleString()} dias</p>
                  <p className="counter-time">
                    {pad(counter.hours)}h : {pad(counter.minutes)}m : {pad(counter.seconds)}s
                  </p>
                  <p className="counter-small">
                    Foram {counter.totalSeconds.toLocaleString()} segundos juntos
                  </p>
                </div>

                <div className="carousel-shell">
                  <div className="carousel-media">
                    <button
                      className="image-wrapper image-button"
                      type="button"
                      onClick={() => setIsImageOpen(true)}
                      aria-label="Abrir imagem em destaque"
                      style={{ aspectRatio }}
                    >
                      <img
                        src={currentImage}
                        alt={`Foto ${currentIndex + 1}`}
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.opacity = '0.3'
                          target.alt = 'Imagem não encontrada'
                        }}
                      />
                      <span className="zoom-hint">Clique para ampliar</span>
                    </button>
                  </div>

                  <div className="carousel-controls">
                    <button className="nav-btn" onClick={prevImage} aria-label="Foto anterior" type="button">
                      ❮
                    </button>

                    <p className="image-index">
                      {currentIndex + 1} / {images.length}
                    </p>

                    <button className="nav-btn" onClick={nextImage} aria-label="Próxima foto" type="button">
                      ❯
                    </button>
                  </div>
                </div>
              </div>

              <p className="bottom-message">eu tento entender o que sinto</p>
              <p className="bottom-message">mas toda vez que penso em você</p>
              <p className="bottom-message">eu deixo de querer entender</p>
              <p className="bottom-message">e só sinto</p>
              <p className="bottom-message">A cada dia te amo mais. 💞</p>
            </div>
          )}
        </div>
      </div>

      {isImageOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setIsImageOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setIsImageOpen(false)}
              aria-label="Fechar imagem"
              type="button"
            >
              ✕
            </button>

            <img
              src={currentImage}
              alt={`Foto ampliada ${currentIndex + 1}`}
              className="lightbox-image"
            />

            <p className="lightbox-index">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default App