import { useState } from "react"

export function CanvaTube({
  label,
  number,
  state = "idle",
}: {
  label: string
  number: string
  state?: "idle" | "salt" | "acid"
}) {
  return (
    <article className={`canva-tube-station canva-${state}`}>
      <span className="canva-tube-label">{label}</span>
      <div className="canva-tube" aria-label={`Ống nghiệm số ${number}`}>
        <div className="canva-tube-rim" />
        {state === "salt" && (
          <div className="canva-crystals">
            <i>✦</i>
            <i>✦</i>
            <i>✦</i>
          </div>
        )}
        {state === "acid" && (
          <div className="canva-drops">
            <i />
            <i />
            <i />
          </div>
        )}
        <div className="canva-liquid" />
      </div>
      <span className="canva-tube-number">{number}</span>
    </article>
  )
}

export default function ConcentrationSimulation() {
  const [saltAdded, setSaltAdded] = useState(false)
  const [acidAdded, setAcidAdded] = useState(false)

  const playTone = (type: "salt" | "acid" | "reset") => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const notes =
      type === "salt"
        ? [880, 1320]
        : type === "acid"
          ? [470, 390]
          : [760, 560, 390]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime + index * 0.12
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.05, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.2)
    })
    window.setTimeout(() => void context.close(), 700)
  }

  return (
    <div className="canva-concentration-simulation">
      <header className="canva-concentration-header">
        <div>
          <span>THÍ NGHIỆM 02 • ẢNH HƯỞNG CỦA NỒNG ĐỘ</span>
          <h3>Phòng thí nghiệm cân bằng</h3>
          <p>Khám phá ảnh hưởng của nồng độ</p>
        </div>
        <strong>CH₃COONa + H₂O ⇌ CH₃COOH + NaOH</strong>
      </header>
      <div className="canva-concentration-board">
        <div className="canva-instruction-chip">
          Hãy quan sát màu dung dịch và thực hiện từng thao tác!
        </div>
        <div
          className="canva-tube-stage"
          aria-label="Ba ống nghiệm trong phòng thí nghiệm"
        >
          <CanvaTube label="Đối chứng" number="1" />
          <CanvaTube
            label="Tăng nồng độ muối"
            number="2"
            state={saltAdded ? "salt" : "idle"}
          />
          <CanvaTube
            label="Thêm axit"
            number="3"
            state={acidAdded ? "acid" : "idle"}
          />
        </div>
        <div className="canva-bench" aria-hidden="true" />
      </div>
      <div className="canva-concentration-actions">
        <button
          className="canva-salt-button"
          disabled={saltAdded}
          onClick={() => {
            setSaltAdded(true)
            playTone("salt")
          }}
        >
          Thêm tinh thể CH₃COONa (Ống 2)
        </button>
        <button
          className="canva-acid-button"
          disabled={acidAdded}
          onClick={() => {
            setAcidAdded(true)
            playTone("acid")
          }}
        >
          Thêm dung dịch CH₃COOH (Ống 3)
        </button>
        <button
          className="canva-reset-button"
          onClick={() => {
            setSaltAdded(false)
            setAcidAdded(false)
            playTone("reset")
          }}
        >
          Làm lại
        </button>
      </div>
      <aside className="canva-explanation" aria-live="polite">
        <span aria-hidden="true">💡</span>
        {!saltAdded && !acidAdded && (
          <p>
            Chọn một thao tác để xem cân bằng hóa học chuyển dịch như thế nào.
          </p>
        )}
        {saltAdded && (
          <p className="salt-message">
            Cân bằng chuyển dịch theo chiều thuận (tạo ra nhiều NaOH hơn) làm
            phenolphthalein hóa hồng đậm.
          </p>
        )}
        {acidAdded && (
          <p className="acid-message">
            Cân bằng chuyển dịch theo chiều nghịch (tiêu hao NaOH) làm dung dịch
            mất màu.
          </p>
        )}
      </aside>
      <p className="canva-concentration-footer">
        Mẹo: Phenolphthalein có màu hồng trong môi trường bazơ và không màu khi
        độ bazơ giảm.
      </p>
    </div>
  )
}
export { ConcentrationSimulation }
