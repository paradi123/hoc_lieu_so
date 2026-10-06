import { useState } from "react"

export default function PressureSimulation() {
  const [piston, setPiston] = useState(20)
  const [no2Ratio, setNo2Ratio] = useState(0.6)
  const [animating, setAnimating] = useState(false)
  const [particlesVisible, setParticlesVisible] = useState(true)
  const [status, setStatus] = useState(
    "Kéo pít-tông hoặc chọn Nén/Kéo để quan sát hiện tượng.",
  )
  const volume = Math.max(0.3, 1 - (piston - 20) / 80)
  const pressure = 1 / volume
  const gasOpacity = Math.min(0.82, (no2Ratio / volume) * 0.5)

  const movePiston = (nextPiston: number, mode: "compress" | "expand") => {
    if (animating || nextPiston === piston) return
    setAnimating(true)
    setPiston(nextPiston)
    setStatus(
      mode === "compress"
        ? "Nén pít-tông: thể tích giảm → áp suất tăng → màu khí đậm lên tức thì."
        : "Kéo pít-tông: thể tích tăng → áp suất giảm → màu khí nhạt đi tức thì.",
    )
    window.setTimeout(() => {
      setNo2Ratio(mode === "compress" ? 0.35 : 0.6)
      setStatus(
        mode === "compress"
          ? "Cân bằng dịch chuyển chiều thuận: NO₂ → N₂O₄, số mol khí giảm nên màu nhạt dần."
          : "Cân bằng dịch chuyển chiều nghịch: N₂O₄ → NO₂, số mol khí tăng nên màu đậm lên.",
      )
      setAnimating(false)
    }, 800)
  }

  const reset = () => {
    if (animating) return
    setPiston(20)
    setNo2Ratio(0.6)
    setStatus("Kéo pít-tông hoặc chọn Nén/Kéo để quan sát hiện tượng.")
  }

  return (
    <div className="pressure-simulation">
      <div className="pressure-stage">
        <div className="stage-topline">
          <span>BÌNH KHÍ CÓ PÍT-TÔNG</span>
          <b>{pressure.toFixed(1)} atm</b>
        </div>
        <div className="pressure-cylinder">
          <div className="cylinder-wall">
            <div className="cylinder-piston" style={{ top: `${piston}%` }} />
            <div
              className={`cylinder-gas${animating ? " equilibrium-shift" : ""}`}
              style={{
                top: `${piston + 5}%`,
                backgroundColor: `rgba(180, 70, 30, ${gasOpacity})`,
              }}
            >
              {particlesVisible &&
                Array.from({ length: 30 }, (_, index) => (
                  <i
                    className={`pressure-particle ${
                      index < Math.round(no2Ratio * 30) ? "no2" : "n2o4"
                    }`}
                    key={index}
                    style={{
                      left: `${8 + ((index * 37) % 84)}%`,
                      top: `${10 + ((index * 61) % 78)}%`,
                      animationDelay: `${-(index % 7) * 0.22}s`,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
        <div className="pressure-legend">
          <span>
            <i className="legend-no2" /> NO₂ (nâu đỏ)
          </span>
          <span>
            <i className="legend-n2o4" /> N₂O₄ (không màu)
          </span>
        </div>
      </div>
      <div className="pressure-controls">
        <div className="formula-display no2-formula">
          <span>2NO₂(g)</span>
          <strong>⇌</strong>
          <span>N₂O₄(g)</span>
        </div>
        <p className="simulation-state">{status}</p>
        <div className="pressure-readout">
          <div>
            <span>ÁP SUẤT</span>
            <strong>{pressure.toFixed(1)} atm</strong>
          </div>
          <div>
            <span>THỂ TÍCH</span>
            <strong>{Math.round(volume * 100)}%</strong>
          </div>
          <div>
            <span>TỈ LỆ NO₂</span>
            <strong>{Math.round(no2Ratio * 100)}%</strong>
          </div>
        </div>
        <label className="piston-slider">
          <span>Vị trí pít-tông</span>
          <input
            type="range"
            min="20"
            max="60"
            value={piston}
            disabled={animating}
            onChange={(event) => {
              setPiston(Number(event.target.value))
              setStatus("Điều chỉnh pít-tông để thay đổi áp suất.")
            }}
          />
          <small>
            Thể tích lớn hơn <b>•</b> Thể tích nhỏ hơn
          </small>
        </label>
        <div className="pressure-actions">
          <button
            onClick={() => movePiston(60, "compress")}
            disabled={animating || piston >= 60}
          >
            Nén pít-tông
          </button>
          <button
            onClick={() => movePiston(20, "expand")}
            disabled={animating || piston <= 20}
          >
            Kéo pít-tông
          </button>
          <button onClick={() => setParticlesVisible((visible) => !visible)}>
            {particlesVisible ? "Ẩn hạt khí" : "Hiện hạt khí"}
          </button>
          <button onClick={reset}>Đặt lại</button>
        </div>
      </div>
    </div>
  )
}
export { PressureSimulation }
