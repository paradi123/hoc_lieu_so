import ConcentrationSimulation from "./ConcentrationSimulation"
import NO2Simulation from "./NO2Simulation"
import PressureSimulation from "./PressureSimulation"

export default function ExperimentFrame({
  index,
  title,
  prompt,
  simulation,
}: {
  index: string
  title: string
  prompt: string
  simulation: "hi" | "no2" | "pressure"
}) {
  return (
    <article
      className={`experiment-card${
        simulation === "no2"
          ? " no2-experiment"
          : simulation === "hi"
            ? " concentration-experiment"
            : " pressure-experiment"
      }`}
    >
      <div className="experiment-title">
        <span>THÍ NGHIỆM {index}</span>
        <h3>{title}</h3>
        <p>{prompt}</p>
      </div>
      <div className="lab-frame-shell">
        <div className="lab-toolbar">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>PHÒNG THÍ NGHIỆM MÔ PHỎNG</span>
          <div className="embed-status">
            <i /> MÔ PHỎNG ĐANG HOẠT ĐỘNG
          </div>
        </div>
        <div
          className={`simulation-wrap ${
            simulation === "no2" ? "no2-wrap" : ""
          }`}
        >
          {simulation === "hi" ? (
            <ConcentrationSimulation />
          ) : simulation === "pressure" ? (
            <PressureSimulation />
          ) : (
            <NO2Simulation />
          )}
        </div>
      </div>
    </article>
  )
}
export { ExperimentFrame }
