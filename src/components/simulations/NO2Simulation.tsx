import { useEffect, useMemo, useState } from "react"
import type React from "react"

type Particle = { x: number; y: number; dx: number; dy: number; dur: number; delay: number }

function generateParticles(count: number, temperature: number): Particle[] {
  // higher temperature → larger Brownian displacements and quicker motion
  const speed = 0.4 + (temperature / 60) * 1.6
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const magnitude = (4 + Math.random() * 10) * speed
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: Math.cos(angle) * magnitude,
      dy: Math.sin(angle) * magnitude,
      dur: 1.4 + Math.random() * (2.6 / speed),
      delay: -Math.random() * 3,
    }
  })
}


export default function NO2Simulation() {
  const [temperature, setTemperature] = useState(25)
  const [no2Ratio, setNo2Ratio] = useState(0.32)
  const targetRatio = 0.12 + 0.76 / (1 + Math.exp(-(temperature - 35) / 8))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNo2Ratio((current) => {
        if (Math.abs(current - targetRatio) < 0.005) return targetRatio
        return current + (targetRatio - current) * 0.09
      })
    }, 70)
    return () => window.clearInterval(timer)
  }, [targetRatio])

  const no2Count = Math.round(no2Ratio * 18)

  const n2o4Count = Math.round((18 - no2Count) / 2)
  const no2Particles = useMemo(
    () => generateParticles(no2Count, temperature),
    [no2Count, temperature],
  )
  const n2o4Particles = useMemo(
    () => generateParticles(n2o4Count, temperature),
    [n2o4Count, temperature],
  )

  const direction =
    temperature >= 36
      ? "Nhiệt độ cao: cân bằng chuyển dịch sang trái, tạo thêm NO₂."
      : temperature <= 18
        ? "Nhiệt độ thấp: cân bằng chuyển dịch sang phải, tạo thêm N₂O₄."
        : "Hệ đang thích nghi với nhiệt độ môi trường."

  return (
    <div className="chem-simulation no2-simulation">
      <div className="simulation-stage">
        <div className="stage-topline">
          <span>BÌNH KHÍ KÍN</span>
          <b>{temperature}°C</b>
        </div>
        <div
          className="gas-chamber"
          style={
            { "--gas-opacity": no2Ratio.toFixed(2) } as React.CSSProperties
          }
          aria-label={`Bình khí ở ${temperature} độ C`}
        >
          <div className="gas-particles">
            {no2Particles.map((p, index) => (
              <i
                className="gas-particle no2-particle"
                key={`no2-${index}`}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  "--dx1": `${p.dx}px`,
                  "--dy1": `${-p.dy}px`,
                  "--dx2": `${-p.dy}px`,
                  "--dy2": `${p.dx}px`,
                  "--dx3": `${p.dx * 0.6}px`,
                  "--dy3": `${p.dy * 0.6}px`,
                  "--dx4": `${-p.dx * 0.8}px`,
                  "--dy4": `${p.dy * 0.8}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties}
              />
            ))}
            {n2o4Particles.map((p, index) => (
              <i
                className="gas-particle n2o4-particle"
                key={`n2o4-${index}`}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  "--dx1": `${p.dx}px`,
                  "--dy1": `${-p.dy}px`,
                  "--dx2": `${-p.dy}px`,
                  "--dy2": `${p.dx}px`,
                  "--dx3": `${p.dx * 0.6}px`,
                  "--dy3": `${p.dy * 0.6}px`,
                  "--dx4": `${-p.dx * 0.8}px`,
                  "--dy4": `${p.dy * 0.8}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
          <span>Màu nâu đỏ tăng khi nồng độ NO₂ tăng</span>
        </div>
        <div className="particle-legend">
          <span>
            <i className="legend-no2" /> NO₂ (nâu đỏ)
          </span>
          <span>
            <i className="legend-n2o4" /> N₂O₄ (không màu)
          </span>
        </div>
      </div>
      <div className="simulation-controls">
        <div className="formula-display no2-formula">
          <span>2NO₂(g)</span>
          <strong>⇌</strong>
          <span>N₂O₄(g)</span>
        </div>
        <p className="simulation-state">{direction}</p>
        <div className="temperature-readout">
          <div>
            <span>NHIỆT ĐỘ</span>
            <strong>{temperature}°C</strong>
          </div>
          <div>
            <span>TỈ LỆ NO₂</span>
            <strong>{Math.round(no2Ratio * 100)}%</strong>
          </div>
        </div>
        <label className="temperature-control">
          <span>
            <b>Lạnh</b>
            <b>Nóng</b>
          </span>
          <input
            type="range"
            min="5"
            max="60"
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
          />
        </label>
        <div className="preset-buttons">
          <button onClick={() => setTemperature(10)}>Làm lạnh 10°C</button>
          <button onClick={() => setTemperature(25)}>Phòng 25°C</button>
          <button onClick={() => setTemperature(55)}>Đun nóng 55°C</button>
        </div>
      </div>
    </div>
  )
}
export { NO2Simulation }
