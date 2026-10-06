import { useState } from "react"
import HISimulation from "./HISimulation"
import InteractiveVideoLesson, {
  type VideoQuestion,
} from "./InteractiveVideoLesson"

const ONE_WAY_VIDEO_SOURCE =
  `${import.meta.env.BASE_URL}videos/vid 1 Na2SO4 tác dụng với dung dịch BaCL2 - Giáo Dục Số (720p, h264).mp4?v=2`

const ONE_WAY_QUESTIONS: VideoQuestion[] = [
  {
    id: "ket-tua-moi",
    time: 79,
    type: "choice",
    question: "Sau khi phản ứng xảy ra, trong ống nghiệm xuất hiện chất gì mới?",
    choices: [
      { key: "A", text: "Kết tủa màu trắng (Barium sulfate – BaSO₄)" },
      { key: "B", text: "Kết tủa màu trắng (Sodium chloride – NaCl)" },
      { key: "C", text: "Bọt khí không màu thoát ra khỏi dung dịch" },
      { key: "D", text: "Kết tủa màu xanh lam (Copper(II) hydroxide – Cu(OH)₂)" },
    ],
    correctAnswer: "A",
    explanation:
      "Na₂SO₄ tác dụng với BaCl₂ tạo BaSO₄ không tan, xuất hiện ngay dưới dạng kết tủa màu trắng đục.",
  },
  {
    id: "co-phan-ung-nguoc",
    time: 85,
    type: "choice",
    question:
      "Sau khi phản ứng hoàn toàn, BaSO₄ và NaCl có thể tự phản ứng ngược để tạo lại BaCl₂ và Na₂SO₄ ban đầu không?",
    choices: [
      { key: "A", text: "Có" },
      { key: "B", text: "Không" },
    ],
    correctAnswer: "B",
    explanation:
      "Không. Trong cùng điều kiện, sản phẩm không tự chuyển ngược thành các chất ban đầu.",
  },
  {
    id: "dien-khai-niem",
    time: 90,
    type: "fill",
    question: "Hoàn thành kết luận về chiều diễn ra của phản ứng:",
    fields: [
      {
        key: "a",
        label: "Phản ứng diễn ra theo (a) … chiều",
        acceptedAnswers: ["một", "mot", "1"],
      },
      {
        key: "b",
        label: "Từ (b) …",
        acceptedAnswers: ["chất ban đầu", "chat ban dau", "ban đầu", "ban dau"],
      },
      {
        key: "c",
        label: "Sang (c) …",
        acceptedAnswers: ["chất sản phẩm", "chat san pham", "sản phẩm", "san pham"],
      },
    ],
    explanation:
      "Phản ứng một chiều chỉ diễn ra từ chất ban đầu tạo thành sản phẩm trong cùng điều kiện.",
  },
]

export function IrreversibleReaction() {
  return (
    <article className="one-way-part">
      <header className="reaction-section-header">
        <div className="reaction-section-number">01</div>
        <div>
          <span>PHẦN 1 • PHẢN ỨNG MỘT CHIỀU</span>
          <h3>Quan sát sự tạo thành kết tủa BaSO₄</h3>
          <p>Xem video, trả lời câu hỏi theo mốc và rút ra kết luận.</p>
        </div>
      </header>
      <InteractiveVideoLesson
        title="Quan sát sự tạo thành kết tủa BaSO₄"
        videoSource={ONE_WAY_VIDEO_SOURCE}
        videoQuestions={ONE_WAY_QUESTIONS}
        completionContent={
          <section className="reaction-conclusion one-way-theory" aria-live="polite">
          <div className="theory-title-row">
            <span className="theory-index">1.</span>
            <h4>Phản ứng một chiều</h4>
          </div>
          <ul>
            <li>
              Là phản ứng chỉ xảy ra theo một chiều, từ chất phản ứng{" "}
              <b>→</b> sản phẩm.
            </li>
            <li>
              Khi phản ứng kết thúc, chỉ còn sản phẩm, không có xu hướng tạo
              lại chất ban đầu.
            </li>
            <li>
              Trong phương trình hóa học (PTHH), mũi tên biểu diễn:
            </li>
          </ul>
          <div className="conclusion-equation">A + B → C + D</div>
          <div className="theory-example">
            <span>Ví dụ quan sát được trong video</span>
            <strong>Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl</strong>
          </div>
          </section>
        }
      />
    </article>
  )
}

export function ReversibleReaction() {
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [isPart2Answered, setIsPart2Answered] = useState(false)

  const submitAnswer = () => {
    if (selectedAnswer === "dynamic") {
      setFeedback("correct")
      setIsPart2Answered(true)
    } else {
      setFeedback("incorrect")
    }
  }

  return (
    <article className="reaction-learning-part reversible-part">
      <div className="reaction-part-heading">
        <div className="part-number">02</div>
        <div>
          <span>PHẦN 2 • PHẢN ỨNG THUẬN NGHỊCH</span>
          <h3>Quan sát hai chiều của phản ứng H₂ + I₂ ⇌ 2HI</h3>
          <p>Tương tác với mô phỏng, trả lời câu hỏi rồi rút ra kết luận.</p>
        </div>
      </div>

      <div className="learning-flow">
        <span className="active">1. Mô phỏng</span>
        <i />
        <span className={selectedAnswer ? "active" : ""}>2. Trả lời</span>
        <i />
        <span className={isPart2Answered ? "active" : ""}>3. Kết luận</span>
      </div>

      <section className="reversible-simulation-shell">
        <div className="reaction-card-label">
          <span>THÍ NGHIỆM MÔ PHỎNG</span>
          <b>TƯƠNG TÁC TRỰC TIẾP</b>
        </div>
        <HISimulation />
      </section>

      <section className="reversible-question-card">
        <div>
          <span>CÂU HỎI SAU MÔ PHỎNG</span>
          <h4>
            Khi hệ đạt cân bằng, phản ứng thuận và phản ứng nghịch có dừng lại
            không?
          </h4>
        </div>
        <div className="reversible-answer-area">
          <div className="reaction-choice-list compact-choices">
            <button
              className={selectedAnswer === "stop" ? "selected" : ""}
              onClick={() => {
                setSelectedAnswer("stop")
                setFeedback(null)
              }}
            >
              <span>A</span>Cả hai phản ứng dừng hoàn toàn
            </button>
            <button
              className={selectedAnswer === "dynamic" ? "selected" : ""}
              onClick={() => {
                setSelectedAnswer("dynamic")
                setFeedback(null)
              }}
            >
              <span>B</span>Hai phản ứng vẫn diễn ra với tốc độ bằng nhau
            </button>
          </div>
          <button className="reaction-submit" onClick={submitAnswer}>
            Nộp câu trả lời
          </button>
          {feedback && (
            <div className={`reaction-feedback ${feedback}`} role="status">
              <strong>
                {feedback === "correct"
                  ? "Chính xác!"
                  : "Chưa đúng, hãy thử lại."}
              </strong>
            </div>
          )}
        </div>
      </section>

      {isPart2Answered && (
        <section
          className="reaction-conclusion reversible-theory-card"
          aria-live="polite"
        >
          <p className="reversible-definition">
            Phản ứng thuận nghịch là phản ứng xảy ra theo hai chiều ngược nhau
            trong cùng điều kiện.
          </p>
          <p className="reversible-explanation">
            Phương trình hóa học của phản ứng thuận nghịch được biểu diễn bằng
            hai nửa mũi tên ngược chiều nhau. Chiều từ trái sang phải là chiều
            phản ứng thuận, chiều từ phải sang trái là chiều phản ứng nghịch.
          </p>
          <div className="conclusion-equation">
            aA + bB ⇌ cC + dD
          </div>
        </section>
      )}
    </article>
  )
}
