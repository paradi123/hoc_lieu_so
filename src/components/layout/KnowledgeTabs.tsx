import InteractiveVideoLesson, {
  type VideoQuestion,
} from "../../InteractiveVideoLesson"
import {
  IrreversibleReaction,
  ReversibleReaction,
} from "../../ReactionConcepts"
import { sections } from "../../data/curriculum"
import Icon from "../common/Icon"
import ConcentrationAssessment from "../exercises/ConcentrationAssessment"
import PressureExercises from "../exercises/PressureExercises"
import ExperimentFrame from "../simulations/ExperimentFrame"
import { useEffect, useState } from "react"


export interface KnowledgeTabsProps {
  activeTab: 0 | 1 | null
  onChange: (tab: 0 | 1 | null) => void
  videoQuestions: VideoQuestion[]
  videoSource: string
  knowledgeDone: boolean
  onAllKnowledgeDone: () => void
}
export default function KnowledgeTabs({
  activeTab,
  onChange,
  videoQuestions,
  videoSource,
  knowledgeDone,
  onAllKnowledgeDone,
}: KnowledgeTabsProps) {
  const [concentrationDone, setConcentrationDone] = useState(false)
  const [pressureDone, setPressureDone] = useState(false)

  useEffect(() => {
    if (concentrationDone && pressureDone) onAllKnowledgeDone()
  }, [concentrationDone, pressureDone, onAllKnowledgeDone])
  return (
    <section id="kien-thuc" className="content-section knowledge-section">
      {activeTab !== null && (
        <nav className="knowledge-subbar" aria-label="Chuyển đổi bài học">
          <div className="container knowledge-subbar-inner">
            <button onClick={() => onChange(null)}>
              ← Tổng quan kiến thức
            </button>
            {(sections[0].children ?? []).map((section, index) => (
              <button
                key={section.id}
                className={activeTab === index ? "active" : ""}
                onClick={() => {
                  onChange(index as 0 | 1)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                <span>{["I", "II"][index]}.</span>
                {section.label}
              </button>
            ))}
          </div>
        </nav>
      )}
      <div className="container">
        {activeTab === null ? (
          <>
            <div className="knowledge-landing-hero">
              <div>
                <span className="knowledge-landing-kicker">
                  BÀI 1 • HÓA HỌC 11
                </span>
                <h2>Khám phá cân bằng hóa học</h2>
                <p>
                  Học theo từng chủ đề với video tương tác, mô phỏng trực quan
                  và câu hỏi kiểm tra ngay trong bài.
                </p>
              </div>
              <div className="knowledge-stats" aria-label="Tổng quan bài học">
                <div>
                  <strong>02</strong>
                  <span>Chủ đề</span>
                </div>
                <div>
                  <strong>03</strong>
                  <span>Video & mô phỏng</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>Câu hỏi</span>
                </div>
              </div>
            </div>
            <div className="knowledge-selector">
              <div className="knowledge-selector-heading">
                <div>
                  <span>CHỌN NỘI DUNG HỌC</span>
                  <h3>Các mạch kiến thức</h3>
                </div>
                <small>Chọn một chủ đề để bắt đầu</small>
              </div>
              <div className="knowledge-window-grid" role="list">
                {(sections[0].children ?? []).map((section, index) => (
                  <button
                    key={section.id}
                    className="knowledge-window-card"
                    onClick={() => onChange(index as 0 | 1)}
                    role="listitem"
                  >
                    <span>{["I", "II", "III"][index]}</span>
                    <Icon name={section.icon} size={28} />
                    <strong>{section.label}</strong>
                    <small>
                      Xem nội dung và hoạt động học tập <b>→</b>
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : activeTab === 0 ? (
          <div className="knowledge-tab-panel" role="tabpanel">
            <button
              className="knowledge-back-button"
              onClick={() => onChange(null)}
            >
              ← Danh sách kiến thức
            </button>
            <IrreversibleReaction />
            <ReversibleReaction />
          </div>
        ) : (
          <div className="knowledge-tab-panel" role="tabpanel">
            <button
              className="knowledge-back-button"
              onClick={() => onChange(null)}
            >
              ← Danh sách kiến thức
            </button>
            <div className="knowledge-concept-banner">
              <span>KHÁI NIỆM TRỌNG TÂM</span>
              <h3>Cân bằng hóa học là cân bằng động</h3>
              <p>
                Khi tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch, nồng độ
                các chất không đổi theo thời gian nhưng phản ứng vẫn tiếp diễn.
              </p>
              <div className="knowledge-equation">
                v<sub>thuận</sub> = v<sub>nghịch</sub>
              </div>
            </div>
            <div className="knowledge-resource-heading">
              <span>VIDEO TƯƠNG TÁC VỀ CHUYỂN DỊCH CÂN BẰNG</span>
              <h3>Phần 1 · Quan sát ảnh hưởng của nhiệt độ</h3>
            </div>
            <InteractiveVideoLesson
              videoQuestions={videoQuestions}
              videoSource={videoSource}
              completionContent={
                <section
                  className="reaction-conclusion reversible-theory"
                  aria-live="polite"
                >
                  <div className="theory-title-row">
                    <span className="theory-index">2.</span>
                    <h4>Phản ứng thuận nghịch</h4>
                  </div>
                  <p className="theory-lead">
                    Phản ứng thuận nghịch là phản ứng xảy ra theo hai chiều
                    ngược nhau trong cùng điều kiện.
                  </p>
                  <p>
                    Phương trình hóa học của phản ứng thuận nghịch được biểu
                    diễn bằng hai nửa mũi tên ngược chiều nhau. Chiều từ trái
                    sang phải là chiều phản ứng thuận, chiều từ phải sang trái
                    là chiều phản ứng nghịch.
                  </p>
                  <div className="conclusion-equation">aA + bB ⇌ cC + dD</div>
                </section>
              }
            />
            <ExperimentFrame
              index="01"
              title="Mô phỏng 2NO₂(g) ⇌ N₂O₄(g)"
              prompt="Thay đổi nhiệt độ và quan sát sự chuyển dịch của cân bằng."
              simulation="no2"
            />
            <ExperimentFrame
              index="02"
              title="Thực hiện thí nghiệm mô phỏng ảnh hưởng của nồng độ"
              prompt="CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻ • Chỉ thị phenolphthalein • Mô phỏng tương tác"
              simulation="hi"
            />
            <ConcentrationAssessment onComplete={() => setConcentrationDone(true)} />
            <ExperimentFrame
              index="03"
              title="Ảnh hưởng của áp suất đến sự chuyển dịch cân bằng hóa học"
              prompt="Nén hoặc kéo pít-tông để thay đổi thể tích, áp suất và quan sát cân bằng 2NO₂(g) ⇌ N₂O₄(g)."
              simulation="pressure"
            />
            <div className="knowledge-finish-bar">
              {knowledgeDone ? (
                <div className="knowledge-finish-done">
                  <Icon name="check" size={18} />
                  Bạn đã hoàn thành phần Kiến thức. Phần Luyện tập đã được mở.
                </div>
              ) : (
                <button
                  type="button"
                  className="knowledge-finish-button"
                  onClick={onCompleteKnowledge}
                >
                  Hoàn thành phần Kiến thức & mở khoá Luyện tập
                </button>
              )}
            {!knowledgeDone && (
              <p className="knowledge-finish-hint">
                Hoàn thành đủ cả hai phần bài tập (Nồng độ & Áp suất) để tự động
                mở khoá phần Luyện tập.
              </p>
            )}
            </div>
            <PressureExercises onComplete={() => setPressureDone(true)} />
          </div>
        )}
      </div>
    </section>
  )
}
