import { useEffect, useRef, useState } from "react"
import p5 from "p5"

type ChemicalValues = {
  h2: number
  i2: number
  hi: number
}

type HistoryPoint = ChemicalValues & {
  time: number
}

type Particle = {
  species: keyof ChemicalValues
  x: number
  y: number
  vx: number
  vy: number
}

const VOLUME = 10
const KC = 64
const EMPTY_VALUES: ChemicalValues = { h2: 0, i2: 0, hi: 0 }

// Tìm nghiệm trong miền vật lý bằng phương pháp chia đôi.
function calculateEquilibrium(initial: ChemicalValues): ChemicalValues {
  const lower = -initial.hi / 2 + 1e-8
  const upper = Math.min(initial.h2, initial.i2) - 1e-8

  if (lower >= upper) return initial

  let left = lower
  let right = upper
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const extent = (left + right) / 2
    const h2 = initial.h2 - extent
    const i2 = initial.i2 - extent
    const hi = initial.hi + 2 * extent
    const quotient = (hi * hi) / (h2 * i2)

    if (quotient < KC) left = extent
    else right = extent
  }

  const extent = (left + right) / 2
  return {
    h2: Math.max(0, initial.h2 - extent),
    i2: Math.max(0, initial.i2 - extent),
    hi: Math.max(0, initial.hi + 2 * extent),
  }
}

function MoleculeCanvas({
  values,
  isRunning,
  isBalanced,
}: {
  values: ChemicalValues
  isRunning: boolean
  isBalanced: boolean
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef(values)
  const stateRef = useRef({ isRunning, isBalanced })

  useEffect(() => {
    valuesRef.current = values
    stateRef.current = { isRunning, isBalanced }
  }, [values, isRunning, isBalanced])

  useEffect(() => {
    if (!hostRef.current) return

    // Xóa canvas cũ khi React Strict Mode hoặc hot reload khởi tạo lại p5.
    hostRef.current.replaceChildren()

    const sketch = (p: p5) => {
      const particles: Particle[] = []
      let equilibriumFlash = 0

      const targetCounts = () => {
        const raw = {
          h2: Math.round(valuesRef.current.h2 * 9),
          i2: Math.round(valuesRef.current.i2 * 9),
          hi: Math.round(valuesRef.current.hi * 9),
        }
        const total = raw.h2 + raw.i2 + raw.hi
        const scale = total > 58 ? 58 / total : 1
        return {
          h2: Math.round(raw.h2 * scale),
          i2: Math.round(raw.i2 * scale),
          hi: Math.round(raw.hi * scale),
        }
      }

      const createParticle = (species: keyof ChemicalValues): Particle => ({
        species,
        x: p.random(45, Math.max(46, p.width - 45)),
        y: p.random(58, p.height - 45),
        vx: p.random(-0.75, 0.75),
        vy: p.random(-0.75, 0.75),
      })

      const syncParticles = () => {
        const targets = targetCounts()
        ;(["h2", "i2", "hi"] as const).forEach((species) => {
          const indices = particles
            .map((particle, index) => (particle.species === species ? index : -1))
            .filter((index) => index >= 0)
          const difference = targets[species] - indices.length

          if (difference > 0) {
            for (let count = 0; count < difference; count += 1) {
              particles.push(createParticle(species))
            }
          } else if (difference < 0) {
            indices
              .slice(difference)
              .reverse()
              .forEach((index) => particles.splice(index, 1))
          }
        })
      }

      const drawAtom = (
        x: number,
        y: number,
        diameter: number,
        color: p5.Color,
      ) => {
        p.noStroke()
        p.fill(0, 0, 0, 28)
        p.circle(x + 2, y + 3, diameter)
        p.fill(color)
        p.circle(x, y, diameter)
        p.fill(255, 255, 255, 80)
        p.circle(x - diameter * 0.18, y - diameter * 0.18, diameter * 0.28)
      }

      const drawMolecule = (particle: Particle) => {
        const angle = p.atan2(particle.vy, particle.vx)
        p.push()
        p.translate(particle.x, particle.y)
        p.rotate(angle)
        p.stroke(100, 118, 130, 150)
        p.strokeWeight(3)

        if (particle.species === "h2") {
          p.line(-7, 0, 7, 0)
          drawAtom(-7, 0, 11, p.color("#75cef2"))
          drawAtom(7, 0, 11, p.color("#75cef2"))
        } else if (particle.species === "i2") {
          p.line(-9, 0, 9, 0)
          drawAtom(-9, 0, 18, p.color("#9b56b5"))
          drawAtom(9, 0, 18, p.color("#9b56b5"))
        } else {
          p.line(-7, 0, 8, 0)
          drawAtom(-7, 0, 11, p.color("#75cef2"))
          drawAtom(8, 0, 17, p.color("#ef4e5b"))
        }
        p.pop()
      }

      p.setup = () => {
        const width = hostRef.current?.clientWidth ?? 420
        const renderer = p.createCanvas(width, 340).parent(hostRef.current!)
        hostRef.current
          ?.querySelectorAll("canvas")
          .forEach((canvas) => {
            if (canvas !== renderer.elt) canvas.remove()
          })
        p.pixelDensity(Math.min(window.devicePixelRatio, 2))
      }

      p.draw = () => {
        p.clear()
        syncParticles()

        // Bình kín 10 L trong suốt.
        p.noStroke()
        p.fill(211, 237, 244, 75)
        p.rect(24, 24, p.width - 48, p.height - 44, 30, 30, 54, 54)
        p.noFill()
        p.stroke(255, 255, 255, 215)
        p.strokeWeight(7)
        p.rect(24, 24, p.width - 48, p.height - 44, 30, 30, 54, 54)
        p.stroke(104, 151, 169, 70)
        p.strokeWeight(1)
        p.rect(29, 29, p.width - 58, p.height - 54, 26, 26, 48, 48)

        particles.forEach((particle) => {
          particle.vx += p.random(-0.045, 0.045)
          particle.vy += p.random(-0.045, 0.045)
          particle.vx = p.constrain(particle.vx, -1.15, 1.15)
          particle.vy = p.constrain(particle.vy, -1.15, 1.15)
          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.x < 46 || particle.x > p.width - 46) particle.vx *= -1
          if (particle.y < 56 || particle.y > p.height - 38) particle.vy *= -1
          drawMolecule(particle)
        })

        // Chớp sáng nhẹ biểu diễn va chạm hai chiều ở cân bằng động.
        if (stateRef.current.isBalanced && p.frameCount % 100 === 0) {
          equilibriumFlash = 14
        }
        if (equilibriumFlash > 0 && particles.length > 1) {
          const first = particles[p.frameCount % particles.length]
          p.noFill()
          p.stroke(255, 196, 83, equilibriumFlash * 12)
          p.strokeWeight(2)
          p.circle(first.x, first.y, 34 - equilibriumFlash)
          equilibriumFlash -= 1
        }

        p.noStroke()
        p.fill("#143a55")
        p.textStyle(p.BOLD)
        p.textSize(11)
        p.textAlign(p.RIGHT)
        p.text("BÌNH KÍN • 10 L", p.width - 40, 48)
      }

      p.windowResized = () => {
        const width = hostRef.current?.clientWidth ?? 420
        p.resizeCanvas(width, 340)
      }
    }

    const instance = new p5(sketch)
    return () => {
      instance.remove()
      hostRef.current?.replaceChildren()
    }
  }, [])

  return <div className="p5-molecule-canvas" ref={hostRef} />
}

function ConcentrationChart({ history }: { history: HistoryPoint[] }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef(history)

  useEffect(() => {
    historyRef.current = history
  }, [history])

  useEffect(() => {
    if (!hostRef.current) return

    hostRef.current.replaceChildren()

    const sketch = (p: p5) => {
      const colors = {
        h2: "#67bfe5",
        i2: "#9b56b5",
        hi: "#ef4e5b",
      }

      p.setup = () => {
        const renderer = p
          .createCanvas(hostRef.current?.clientWidth ?? 600, 250)
          .parent(hostRef.current!)
        hostRef.current
          ?.querySelectorAll("canvas")
          .forEach((canvas) => {
            if (canvas !== renderer.elt) canvas.remove()
          })
        p.pixelDensity(Math.min(window.devicePixelRatio, 2))
      }

      p.draw = () => {
        p.background("#ffffff")
        const left = 58
        const right = p.width - 18
        const top = 22
        const bottom = p.height - 42
        const points = historyRef.current
        const maxTime = Math.max(8, points.at(-1)?.time ?? 8)
        const maxConcentration = Math.max(
          0.2,
          ...points.flatMap((point) => [point.h2, point.i2, point.hi]),
        )

        p.stroke("#e5edf1")
        p.strokeWeight(1)
        p.textSize(9)
        p.textStyle(p.NORMAL)
        for (let row = 0; row <= 4; row += 1) {
          const y = p.map(row, 0, 4, bottom, top)
          p.line(left, y, right, y)
          p.noStroke()
          p.fill("#8397a3")
          p.textAlign(p.RIGHT, p.CENTER)
          p.text(((maxConcentration * row) / 4).toFixed(2), left - 8, y)
          p.stroke("#e5edf1")
        }

        p.stroke("#78909d")
        p.line(left, top, left, bottom)
        p.line(left, bottom, right, bottom)

        ;(["h2", "i2", "hi"] as const).forEach((species) => {
          p.noFill()
          p.stroke(colors[species])
          p.strokeWeight(2.5)
          p.beginShape()
          points.forEach((point) => {
            const x = p.map(point.time, 0, maxTime, left, right)
            const y = p.map(
              point[species],
              0,
              maxConcentration,
              bottom,
              top,
            )
            p.vertex(x, y)
          })
          p.endShape()
        })

        p.noStroke()
        p.fill("#647b88")
        p.textSize(9)
        p.textAlign(p.CENTER)
        p.text("Thời gian (s)", (left + right) / 2, p.height - 12)
        p.push()
        p.translate(13, (top + bottom) / 2)
        p.rotate(-p.HALF_PI)
        p.text("Nồng độ (mol/L)", 0, 0)
        p.pop()
      }

      p.windowResized = () => {
        p.resizeCanvas(hostRef.current?.clientWidth ?? 600, 250)
      }
    }

    const instance = new p5(sketch)
    return () => {
      instance.remove()
      hostRef.current?.replaceChildren()
    }
  }, [])

  return <div className="p5-chart" ref={hostRef} />
}

function ExperimentControl({
  title,
  subtitle,
  fields,
  onChange,
  onRun,
  onReset,
  disabled,
}: {
  title: React.ReactNode
  subtitle: string
  fields: Array<{
    key: "h2" | "i2" | "hi"
    label: string
    value: number
  }>
  onChange: (key: "h2" | "i2" | "hi", value: number) => void
  onRun: () => void
  onReset: () => void
  disabled: boolean
}) {
  return (
    <section className="hi-control-card">
      <span>{subtitle}</span>
      <h4>{title}</h4>
      <div className="fixed-conditions">
        <span>10 L</span>
        <span>445°C</span>
      </div>
      {fields.map((field) => (
        <label className="mole-control" key={field.key}>
          <span>
            Số mol đầu {field.label}
            <input
              type="number"
              min="0"
              max="3"
              step="0.1"
              value={field.value}
              onChange={(event) =>
                onChange(
                  field.key,
                  Math.max(0, Math.min(3, Number(event.target.value))),
                )
              }
            />
          </span>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={field.value}
            onChange={(event) =>
              onChange(field.key, Number(event.target.value))
            }
          />
        </label>
      ))}
      <div className="hi-control-actions">
        <button className="hi-run" onClick={onRun} disabled={disabled}>
          Chạy mô phỏng
        </button>
        <button onClick={onReset}>Đặt lại</button>
      </div>
    </section>
  )
}

export default function HISimulation() {
  const [inputs, setInputs] = useState({ h2: 1, i2: 1, hi: 2 })
  const [current, setCurrent] = useState<ChemicalValues>(EMPTY_VALUES)
  const [equilibrium, setEquilibrium] = useState<ChemicalValues | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [running, setRunning] = useState(false)
  const [balanced, setBalanced] = useState(false)
  const [activeExperiment, setActiveExperiment] = useState<1 | 2 | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [error, setError] = useState("")
  const soundEnabledRef = useRef(true)
  const timerRef = useRef<number | null>(null)
  const bubbleTimerRef = useRef<number | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const lastSliderSoundRef = useRef(0)

  const getAudio = () => {
    if (!soundEnabledRef.current) return null
    if (!audioRef.current) {
      audioRef.current = new AudioContext()
    }
    if (audioRef.current.state === "suspended") audioRef.current.resume()
    return audioRef.current
  }

  const playTone = (
    frequency: number,
    duration: number,
    volume = 0.035,
    type: OscillatorType = "sine",
    delay = 0,
  ) => {
    const context = getAudio()
    if (!context) return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + delay
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.03)
  }

  const playClick = () => {
    playTone(230, 0.08, 0.03, "triangle")
    playTone(350, 0.1, 0.02, "triangle", 0.04)
  }

  const playChime = () => {
    playTone(523, 0.5, 0.035, "sine")
    playTone(659, 0.55, 0.03, "sine", 0.12)
    playTone(784, 0.7, 0.025, "sine", 0.24)
  }

  const playSlider = () => {
    const now = performance.now()
    if (now - lastSliderSoundRef.current < 90) return
    lastSliderSoundRef.current = now
    playTone(420, 0.045, 0.012, "sine")
  }

  const stopTimers = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    if (bubbleTimerRef.current !== null) {
      window.clearInterval(bubbleTimerRef.current)
    }
    timerRef.current = null
    bubbleTimerRef.current = null
  }

  useEffect(() => () => stopTimers(), [])

  const startBubbling = () => {
    if (!soundEnabledRef.current) return
    bubbleTimerRef.current = window.setInterval(() => {
      playTone(95 + Math.random() * 35, 0.18, 0.007, "sine")
    }, 620)
  }

  const runExperiment = (experiment: 1 | 2) => {
    const initial: ChemicalValues =
      experiment === 1
        ? { h2: inputs.h2, i2: inputs.i2, hi: 0 }
        : { h2: 0, i2: 0, hi: inputs.hi }

    if (
      Object.values(initial).some((value) => value < 0) ||
      (experiment === 1 && (initial.h2 === 0 || initial.i2 === 0)) ||
      (experiment === 2 && initial.hi === 0)
    ) {
      setError("Số mol phải không âm và chất đầu của thí nghiệm phải lớn hơn 0.")
      return
    }

    stopTimers()
    playClick()
    setError("")
    setActiveExperiment(experiment)
    setBalanced(false)
    setRunning(true)
    setCurrent(initial)
    const target = calculateEquilibrium(initial)
    setEquilibrium(target)
    setHistory([
      {
        time: 0,
        h2: initial.h2 / VOLUME,
        i2: initial.i2 / VOLUME,
        hi: initial.hi / VOLUME,
      },
    ])
    startBubbling()

    const startedAt = performance.now()
    timerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000
      const linearProgress = Math.min(1, elapsed / 8)
      const progress = 1 - Math.pow(1 - linearProgress, 3)
      const next = {
        h2: initial.h2 + (target.h2 - initial.h2) * progress,
        i2: initial.i2 + (target.i2 - initial.i2) * progress,
        hi: initial.hi + (target.hi - initial.hi) * progress,
      }
      setCurrent(next)
      setHistory((previous) => [
        ...previous.slice(-159),
        {
          time: elapsed,
          h2: next.h2 / VOLUME,
          i2: next.i2 / VOLUME,
          hi: next.hi / VOLUME,
        },
      ])

      if (linearProgress >= 1) {
        stopTimers()
        setCurrent(target)
        setRunning(false)
        setBalanced(true)
        playChime()
      }
    }, 100)
  }

  const reset = (experiment?: 1 | 2) => {
    stopTimers()
    setRunning(false)
    setBalanced(false)
    setActiveExperiment(null)
    setCurrent(EMPTY_VALUES)
    setEquilibrium(null)
    setHistory([])
    setError("")
    if (experiment === 1) {
      setInputs((previous) => ({ ...previous, h2: 1, i2: 1 }))
    }
    if (experiment === 2) {
      setInputs((previous) => ({ ...previous, hi: 2 }))
    }
  }

  const updateInput = (key: "h2" | "i2" | "hi", value: number) => {
    setInputs((previous) => ({ ...previous, [key]: value }))
    playSlider()
  }

  const toggleSound = () => {
    setSoundEnabled((currentValue) => {
      const nextValue = !currentValue
      soundEnabledRef.current = nextValue
      if (!nextValue) audioRef.current?.suspend()
      else audioRef.current?.resume()
      return nextValue
    })
  }

  return (
    <div className="hi-lab">
      <header className="hi-lab-header">
        <div>
          <span>MÔ PHỎNG</span>
          <h3>
            Cân bằng hóa học H₂ + I₂ ⇌ 2HI <em>ở 445°C</em>
          </h3>
        </div>
        <button
          className={soundEnabled ? "sound-toggle active" : "sound-toggle"}
          onClick={toggleSound}
          aria-pressed={soundEnabled}
        >
          <i />
          {soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}
        </button>
      </header>

      <div className="hi-dashboard">
        <div className="hi-vessel-panel">
          <div className="vessel-status">
            <span>
              {activeExperiment ? `THÍ NGHIỆM ${activeExperiment}` : "SẴN SÀNG"}
            </span>
            <b className={balanced ? "balanced" : running ? "running" : ""}>
              {balanced
                ? "ĐÃ CÂN BẰNG"
                : running
                  ? "ĐANG PHẢN ỨNG"
                  : "CHỜ KHỞI ĐỘNG"}
            </b>
          </div>
          <MoleculeCanvas
            values={current}
            isRunning={running}
            isBalanced={balanced}
          />
          <div className="hi-molecule-legend">
            <span><i className="h2-key" /> H₂</span>
            <span><i className="i2-key" /> I₂</span>
            <span><i className="hi-key" /> HI</span>
          </div>
        </div>

        <div className="hi-controls-row">
          <ExperimentControl
            subtitle="THÍ NGHIỆM 1"
            title={<>H₂ + I₂ → 2HI</>}
            fields={[
              { key: "h2", label: "H₂", value: inputs.h2 },
              { key: "i2", label: "I₂", value: inputs.i2 },
            ]}
            onChange={updateInput}
            onRun={() => runExperiment(1)}
            onReset={() => reset(1)}
            disabled={running}
          />

          <ExperimentControl
            subtitle="THÍ NGHIỆM 2"
            title={<>2HI → H₂ + I₂</>}
            fields={[{ key: "hi", label: "HI", value: inputs.hi }]}
            onChange={updateInput}
            onRun={() => runExperiment(2)}
            onReset={() => reset(2)}
            disabled={running}
          />
        </div>
      </div>

      {error && <div className="hi-error" role="alert">{error}</div>}

      <section className="hi-chart-card">
        <div className="hi-card-heading">
          <div>
            <span>BIỂU ĐỒ THỜI GIAN THỰC</span>
            <h4>Nồng độ theo thời gian</h4>
          </div>
          <div className="chart-keys">
            <span className="h2-line">H₂</span>
            <span className="i2-line">I₂</span>
            <span className="hi-line">HI</span>
          </div>
        </div>
        <ConcentrationChart history={history} />
      </section>

    </div>
  )
}
