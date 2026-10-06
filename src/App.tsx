import { useEffect, useRef, useState } from "react"
import InteractiveVideoLesson, {
  initialVideoQuestions,
  VIDEO_SOURCE,
  type VideoQuestion,
} from "./InteractiveVideoLesson"
import {
  IrreversibleReaction,
  ReversibleReaction,
} from "./ReactionConcepts"
import { appConfig } from "./config/appConfig"
import { initialQuestions } from "./data/questions"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useStudyMonitoring } from "./hooks/useStudyMonitoring"
import type { ProgressRecord, Question } from "./types/lesson"

type IconName = "atom" | "book" | "video" | "flask" | "quiz" | "arrow" | "check" | "close" | "external" | "spark"

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    atom: (
      <>
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.8"
          transform="rotate(120 12 12)"
        />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3z" />
      </>
    ),
    flask: (
      <path d="M9 3h6m-5 0v5.5L4.7 18a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3L14 8.5V3M8 14h8" />
    ),
    quiz: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M15 9h2M15 15h2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    external: (
      <path d="M14 4h6v6m0-6-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    ),
    spark: (
      <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8zM18.5 15l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

type MiniSection = {
  id: string
  label: string
  icon: IconName
}

type MainSection = MiniSection & {
  children?: MiniSection[]
}

const sections: MainSection[] = [
  {
    id: "kien-thuc",
    label: "Kiến thức",
    icon: "book",
    children: [
      {
        id: "phan-ung-thuan-nghich",
        label: "Phản ứng một chiều và thuận nghịch",
        icon: "arrow",
      },
      {
        id: "trang-thai-can-bang",
        label: "Những yếu tố ảnh hưởng đến chuyển dịch cân bằng",
        icon: "atom",
      },
    ],
  },
  { id: "luyen-tap", label: "Luyện tập", icon: "quiz" as IconName },
  { id: "van-dung", label: "Vận dụng", icon: "spark" as IconName },
]

function App() {
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [questionBank, setQuestionBank] = useLocalStorage(
    "chemlab-questions",
    initialQuestions,
  )
  const [progressRecords, setProgressRecords] = useLocalStorage<ProgressRecord[]>(
    "chemlab-progress",
    [],
  )
  const [videoQuestions, setVideoQuestions] = useLocalStorage<VideoQuestion[]>(
    "chemlab-video-questions",
    initialVideoQuestions,
  )
  const [videoSource, setVideoSource] = useLocalStorage(
    "chemlab-video-source",
    VIDEO_SOURCE,
  )
  const [studentName, setStudentName] = useState("")
  const [teacherPasscode, setTeacherPasscode] = useState("")
  const [showTeacherLogin, setShowTeacherLogin] = useState(false)
  const [teacherLoginError, setTeacherLoginError] = useState("")
  const [hasStarted, setHasStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [knowledgeTab, setKnowledgeTab] = useState<0 | 1 | null>(null)
  const [activeLessonTab, setActiveLessonTab] = useState("kien-thuc")
  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, number>>({})
  const progressSaved = useRef(false)
  const {
    violationCount,
    showWarning,
    setShowWarning,
    isLocked,
  } = useStudyMonitoring({
    enabled: appConfig.studyMonitoringEnabled,
    hasStarted,
  })

  const goToSection = (id: string) => {
    const nextTab = ["kham-pha", "video-bai-giang", "thi-nghiem"].includes(id)
      ? "kien-thuc"
      : id
    setActiveLessonTab(nextTab)
    if (nextTab === "kien-thuc") setKnowledgeTab(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const score = Object.entries(selectedAnswers).filter(
    ([questionIndex, answerIndex]) =>
      questionBank[Number(questionIndex)].correct === answerIndex,
  ).length
  const hasCompletedQuiz = answeredCount === questionBank.length
  const resultLabel =
    score === questionBank.length
      ? "Xuất sắc"
      : score >= Math.ceil(questionBank.length / 2)
        ? "Đạt yêu cầu"
        : "Cần ôn tập thêm"
  const resultMessage =
    score === questionBank.length
      ? "Bạn đã nắm rất chắc các khái niệm trọng tâm của bài học."
      : score >= Math.ceil(questionBank.length / 2)
        ? "Bạn đã hoàn thành bài học. Hãy xem lại những câu trả lời chưa đúng."
        : "Hãy xem lại phần lý thuyết và thử làm lại bài luyện tập một lần nữa."

  useEffect(() => {
    if (!showResults || progressSaved.current) return
    const record: ProgressRecord = {
      id: `${Date.now()}-${studentName}`,
      studentName,
      score,
      total: questionBank.length,
      completedAt: new Date().toISOString(),
    }
    const nextRecords = [...progressRecords, record]
    setProgressRecords(nextRecords)
    progressSaved.current = true
  }, [showResults, studentName, score, questionBank.length, progressRecords])

  const startLesson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = studentName.trim()
    if (!trimmedName) return
    setStudentName(trimmedName)
    setHasStarted(true)
  }

  const chooseRole = (nextRole: "student" | "teacher") => {
    if (nextRole === "teacher") {
      setShowTeacherLogin(true)
      setTeacherLoginError("")
      return
    }
    setRole(nextRole)
    setHasStarted(false)
  }

  const submitTeacherLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (teacherPasscode !== "0000") {
      setTeacherLoginError("Mã truy cập chưa đúng. Vui lòng thử lại.")
      return
    }
    setShowTeacherLogin(false)
    setTeacherPasscode("")
    setTeacherLoginError("")
    setRole("teacher")
  }

  const saveQuestions = (nextQuestions: Question[]) => {
    setQuestionBank(nextQuestions)
    setSelectedAnswers({})
  }

  if (role === "teacher") {
    return (
      <TeacherDashboard
        questions={questionBank}
        progressRecords={progressRecords}
        videoQuestions={videoQuestions}
        videoSource={videoSource}
        onSaveQuestions={saveQuestions}
        onSaveVideoQuestions={setVideoQuestions}
        onSaveVideoSource={(source) => {
          setVideoSource(source)
        }}
        onExit={() => setRole("student")}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <button
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="brand-mark">
              <Icon name="atom" size={25} />
            </span>
            <span>
              <strong>CHEMLAB</strong>
              <small>HÓA HỌC 11</small>
            </span>
          </button>
          <nav className="desktop-nav" aria-label="Điều hướng bài học">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => goToSection(section.id)}
                className={activeLessonTab === section.id ? "nav-item active" : "nav-item"}
              >
                <span>{["I", "II", "III"][index]}</span>
                {section.label}
              </button>
            ))}
          </nav>
          <div className="class-badge">LỚP 11</div>
        </div>
      </header>

      <main>
        {false && <section className="hero">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span>BÀI 1</span>
                <i />
                CHƯƠNG TRÌNH HÓA HỌC 11
              </div>
              <h1>
                Khái niệm về
                <em>cân bằng hóa học</em>
              </h1>
              <p>
                Cùng khám phá thế giới vi mô, nơi các phản ứng không hề dừng lại
                — chúng chỉ tìm thấy một nhịp điệu cân bằng.
              </p>
            </div>

            <div className="hero-visual" aria-label="Minh họa cân bằng hóa học">
              <div className="visual-card">
                <div className="molecule molecule-left">
                  <span className="atom atom-blue" />
                  <span className="bond" />
                  <span className="atom atom-blue" />
                  <small>Chất phản ứng</small>
                </div>
                <div className="equilibrium-symbol">
                  <span>⇌</span>
                  <small>CÂN BẰNG ĐỘNG</small>
                </div>
                <div className="molecule molecule-right">
                  <span className="atom atom-orange" />
                  <span className="bond" />
                  <span className="atom atom-teal" />
                  <small>Sản phẩm</small>
                </div>
                <div className="visual-note">
                  <Icon name="spark" />
                  <span>Tốc độ thuận</span>
                  <b>=</b>
                  <span>Tốc độ nghịch</span>
                </div>
              </div>
              <div className="floating-label label-one">
                v<sub>t</sub>
              </div>
              <div className="floating-label label-two">
                v<sub>n</sub>
              </div>
            </div>
          </div>
        </section>}

        {activeLessonTab === "kien-thuc" && (
          <KnowledgeTabs
            activeTab={knowledgeTab}
            onChange={setKnowledgeTab}
            videoQuestions={videoQuestions}
            videoSource={videoSource}
          />
        )}

        {activeLessonTab === "luyen-tap" && (
          <section id="luyen-tap" className="content-section quiz-section">
          <div className="container">
            <div className="study-section-hero quiz-hero">
              <div>
                <span>PHẦN II • LUYỆN TẬP</span>
                <h2>Kiểm tra mức độ nắm bài</h2>
                <p>Chọn đáp án cho từng câu hỏi và nhận phản hồi, giải thích ngay sau mỗi lựa chọn.</p>
              </div>
              <div className="study-section-stats">
                <div><strong>{questionBank.length}</strong><span>Câu hỏi</span></div>
                <div><strong>01</strong><span>Bài luyện tập</span></div>
                <div><strong>✓</strong><span>Phản hồi tức thì</span></div>
              </div>
            </div>

            <div className="study-section-panel quiz-panel">
              <div className="study-panel-heading">
                <div>
                  <span>LUYỆN TẬP NHANH</span>
                  <h3>Chọn đáp án đúng</h3>
                </div>
                <small>{answeredCount}/{questionBank.length} câu đã trả lời</small>
              </div>
              <div className="quiz-layout">
              <div className="question-list">
                {questionBank.map((item, questionIndex) => {
                  const selected = selectedAnswers[questionIndex]
                  const hasAnswered = selected !== undefined
                  const isCorrect = selected === item.correct
                  return (
                    <article className="question-card" key={item.question}>
                      <div className="question-title">
                        <span>
                          CÂU {String(questionIndex + 1).padStart(2, "0")}
                        </span>
                        <h3>{item.question}</h3>
                      </div>
                      <div className="answer-grid">
                        {item.answers.map((answer, answerIndex) => {
                          const isSelected = selected === answerIndex
                          const stateClass = isSelected
                            ? isCorrect
                              ? " selected correct"
                              : " selected wrong"
                            : ""
                          return (
                            <button
                              key={answer}
                              className={`answer${stateClass}`}
                              onClick={() =>
                                setSelectedAnswers((current) => ({
                                  ...current,
                                  [questionIndex]: answerIndex,
                                }))
                              }
                            >
                              <span>
                                {String.fromCharCode(65 + answerIndex)}
                              </span>
                              {answer}
                              {isSelected && (
                                <Icon
                                  name={isCorrect ? "check" : "close"}
                                  size={18}
                                />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      {hasAnswered && (
                        <div
                          className={`feedback ${
                            isCorrect ? "success" : "error"
                          }`}
                          role="status"
                        >
                          <Icon name={isCorrect ? "check" : "close"} />
                          <p>
                            <strong>
                              {isCorrect ? "Chính xác!" : "Chưa chính xác."}
                            </strong>
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>

              <aside className="score-card">
                <span>TIẾN ĐỘ CỦA BẠN</span>
                <div
                  className="score-ring"
                  style={
                    {
                      "--score": `${(answeredCount / questionBank.length) * 100}%`,
                    } as React.CSSProperties
                  }
                >
                  <div>
                    <strong>{answeredCount}</strong>
                    <small>/ {questionBank.length}</small>
                  </div>
                </div>
                <h3>
                  {answeredCount === questionBank.length
                    ? `${score}/${questionBank.length} câu đúng`
                    : "Tiếp tục nhé!"}
                </h3>
                <p>
                  {answeredCount === questionBank.length
                    ? "Bạn đã hoàn thành phần luyện tập."
                    : "Hoàn thành các câu hỏi để xem kết quả."}
                </p>
                <div className="progress-track">
                  <i
                    style={{
                      width: `${(answeredCount / questionBank.length) * 100}%`,
                    }}
                  />
                </div>
                {answeredCount > 0 && (
                  <button
                    className="reset-button"
                    onClick={() => {
                      setSelectedAnswers({})
                      setShowResults(false)
                    }}
                  >
                    Làm lại từ đầu
                  </button>
                )}
                {hasCompletedQuiz && (
                  <button
                    className="result-button"
                    onClick={() => setShowResults(true)}
                  >
                    Xem đánh giá kết quả
                  </button>
                )}
              </aside>
            </div>
          </div>
          </div>
          </section>
        )}

        {activeLessonTab === "van-dung" && (
          <section id="van-dung" className="content-section application-section">
          <div className="container">
            <div className="study-section-hero application-hero">
              <div>
                <span>PHẦN III • VẬN DỤNG</span>
                <h2>Đưa kiến thức vào thực tế</h2>
                <p>Vận dụng nguyên lí chuyển dịch cân bằng để phân tích một vấn đề gần gũi trong đời sống.</p>
              </div>
              <div className="study-section-stats">
                <div><strong>01</strong><span>Tình huống</span></div>
                <div><strong>03</strong><span>Gợi ý</span></div>
                <div><strong>H₂S</strong><span>Chủ đề thực tế</span></div>
              </div>
            </div>
            <div className="study-section-panel application-panel">
              <div className="study-panel-heading">
                <div>
                  <span>THỬ THÁCH THỰC TẾ</span>
                  <h3>Kỹ sư xử lý hồ nước sinh thái</h3>
                </div>
                <small>Vận dụng nguyên lí Le Chatelier</small>
              </div>
            <article className="scenario-card">
              <div className="scenario-brief">
                <span className="role-badge">
                  <Icon name="spark" size={18} /> VAI TRÒ CỦA BẠN
                </span>
                <h3>Kỹ sư xử lý hồ nước sinh thái</h3>
                <p>
                  Một hồ nước sinh thái xuất hiện mùi trứng thối do khí H₂S hòa
                  tan. Trong nước tồn tại cân bằng:
                </p>
                <div className="scenario-equation">
                  H₂S(aq) ⇌ H⁺(aq) + HS⁻(aq)
                </div>
              </div>
              <div className="mission-panel">
                <span>NHIỆM VỤ THỰC TẾ</span>
                <h3>Đề xuất phương án giảm mùi H₂S</h3>
                <p>
                  Dựa vào nguyên lí Le Chatelier, hãy lựa chọn biện pháp tác
                  động đến pH hoặc loại bỏ một cấu tử để cân bằng chuyển dịch
                  theo chiều làm giảm H₂S.
                </p>
                <div className="mission-hints">
                  <div>
                    <b>01</b>
                    <span>Dự đoán chiều chuyển dịch khi giảm nồng độ H⁺.</span>
                  </div>
                  <div>
                    <b>02</b>
                    <span>
                      Giải thích vì sao sục khí có thể hỗ trợ xử lý mùi.
                    </span>
                  </div>
                  <div>
                    <b>03</b>
                    <span>Đề xuất cách làm an toàn cho hệ sinh thái.</span>
                  </div>
                </div>
              </div>
            </article>
            </div>
          </div>
          </section>
        )}
      </main>

      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            <Icon name="atom" />
            <span>
              <strong>CHEMLAB</strong>Học liệu số Hóa học 11
            </span>
          </div>
          <p>Nội dung mẫu • Sẵn sàng để giáo viên tùy chỉnh</p>
        </div>
      </footer>

      {role === null && (
        <div className="monitor-overlay student-entry-overlay">
          <div className="monitor-dialog role-dialog">
            <div className="monitor-icon entry-icon">
              <Icon name="atom" size={28} />
            </div>
            <span>CHEMLAB • HÓA HỌC 11</span>
            <h2>Chọn vai trò của bạn</h2>
            <p>Chọn cách truy cập để bắt đầu sử dụng học liệu.</p>
            <div className="role-choice-grid">
              <button onClick={() => chooseRole("student")}>
                <Icon name="book" size={24} />
                <strong>Học sinh</strong>
                <small>Học bài và làm bài luyện tập</small>
              </button>
              {appConfig.teacherAccessEnabled && (
                <button onClick={() => chooseRole("teacher")}>
                  <Icon name="quiz" size={24} />
                  <strong>Giáo viên</strong>
                  <small>Xem số liệu và chỉnh sửa câu hỏi</small>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showTeacherLogin && (
        <div className="monitor-overlay teacher-login-overlay">
          <div className="monitor-dialog teacher-login-dialog">
            <div className="monitor-icon entry-icon">
              <Icon name="quiz" size={28} />
            </div>
            <span>KHU VỰC GIÁO VIÊN</span>
            <h2>Nhập mã truy cập</h2>
            <p>Mã này dùng để mở dashboard quản lý học liệu.</p>
            <form className="student-entry-form" onSubmit={submitTeacherLogin}>
              <label htmlFor="teacher-passcode">Mã giáo viên</label>
              <input
                id="teacher-passcode"
                className="student-name-input"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={teacherPasscode}
                onChange={(event) => {
                  setTeacherPasscode(event.target.value.replace(/\D/g, ""))
                  setTeacherLoginError("")
                }}
                placeholder="Nhập 4 chữ số"
                autoFocus
                required
              />
              {teacherLoginError && (
                <small className="teacher-login-error">{teacherLoginError}</small>
              )}
              <button type="submit">Vào khu vực giáo viên</button>
              <button
                type="button"
                className="teacher-cancel-button"
                onClick={() => setShowTeacherLogin(false)}
              >
                Quay lại
              </button>
            </form>
          </div>
        </div>
      )}

      {role === "student" && !hasStarted && (
        <div className="monitor-overlay student-entry-overlay">
          <div className="monitor-dialog student-entry-dialog">
            <div className="monitor-icon entry-icon">
              <Icon name="atom" size={28} />
            </div>
            <span>BẮT ĐẦU BÀI HỌC</span>
            <h2>Chào mừng em đến với CHEMLAB</h2>
            <p>Nhập tên để hệ thống ghi nhận kết quả học tập của em.</p>
            <form className="student-entry-form" onSubmit={startLesson}>
              <label htmlFor="student-name">Tên học sinh</label>
              <input
                id="student-name"
                className="student-name-input"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Ví dụ: Phạm Quang Vũ"
                autoFocus
                required
              />
              <button type="submit">Bắt đầu học</button>
            </form>
          </div>
        </div>
      )}

      {showResults && (
        <div className="monitor-overlay result-overlay">
          <div className="monitor-dialog result-dialog">
            <div className="monitor-icon result-icon">
              <Icon name="check" size={28} />
            </div>
            <span>ĐÁNH GIÁ HOÀN THÀNH HỌC LIỆU</span>
            <h2>{studentName}</h2>
            <div className="result-score">
              <strong>{score}/{questionBank.length}</strong>
              <small>câu đúng</small>
            </div>
            <div className="result-badge">{resultLabel}</div>
            <p>{resultMessage}</p>
            <div className="result-actions">
              <button onClick={() => setShowResults(false)}>Xem lại bài học</button>
              <button
                className="result-secondary-button"
                onClick={() => {
                  setSelectedAnswers({})
                  setShowResults(false)
                }}
              >
                Làm lại bài
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarning && !isLocked && (
        <div
          className="monitor-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="warning-title"
        >
          <div className="monitor-dialog warning-dialog">
            <div className="monitor-icon">
              <Icon name="close" size={28} />
            </div>
            <span>GIÁM SÁT HỌC TẬP • LẦN {violationCount}/2</span>
            <h2 id="warning-title">
              Cảnh báo: Bạn đang rời khỏi trang học tập!
            </h2>
            <p>
              Hãy tập trung hoàn thành bài học. Bài học sẽ bị khóa ở lần vi phạm
              thứ 3.
            </p>
            <button onClick={() => setShowWarning(false)}>
              Tôi đã hiểu, tiếp tục học
            </button>
          </div>
        </div>
      )}

      {isLocked && (
        <div
          className="monitor-overlay locked"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="locked-title"
        >
          <div className="monitor-dialog locked-dialog">
            <div className="monitor-icon">
              <Icon name="close" size={30} />
            </div>
            <span>BÀI HỌC ĐÃ BỊ KHÓA</span>
            <h2 id="locked-title">
              Bạn đã thoát màn hình quá số lần quy định.
            </h2>
            <p>Bài học đã bị khóa, vui lòng liên hệ giáo viên!</p>
            <div className="locked-count">
              03 <small>LẦN VI PHẠM</small>
            </div>
          </div>
        </div>
      )}

      <nav
        className="mobile-nav"
        aria-label="Điều hướng bài học trên điện thoại"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => goToSection(section.id)}
            className={activeLessonTab === section.id ? "active" : ""}
          >
            <Icon name={section.icon} />
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function KnowledgeTabs({
  activeTab,
  onChange,
  videoQuestions,
  videoSource,
}: {
  activeTab: 0 | 1 | null
  onChange: (tab: 0 | 1 | null) => void
  videoQuestions: VideoQuestion[]
  videoSource: string
}) {
  const [exercisesChecked, setExercisesChecked] = useState(false)
  const [tableCorrect, setTableCorrect] = useState(false)
  const [analysisCorrect, setAnalysisCorrect] = useState(false)
  const [ruleCorrect, setRuleCorrect] = useState(false)
  const allExercisesCorrect = tableCorrect && analysisCorrect && ruleCorrect

  return (
    <section id="kien-thuc" className="content-section knowledge-section">
      <div className="container">
        {activeTab === null ? (
          <>
            <div className="knowledge-landing-hero">
              <div>
                <span className="knowledge-landing-kicker">BÀI 1 • HÓA HỌC 11</span>
                <h2>Khám phá cân bằng hóa học</h2>
                <p>
                  Học theo từng chủ đề với video tương tác, mô phỏng trực quan
                  và câu hỏi kiểm tra ngay trong bài.
                </p>
              </div>
              <div className="knowledge-stats" aria-label="Tổng quan bài học">
                <div><strong>02</strong><span>Chủ đề</span></div>
                <div><strong>03</strong><span>Video & mô phỏng</span></div>
                <div><strong>11</strong><span>Câu hỏi</span></div>
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
                    <small>Xem nội dung và hoạt động học tập <b>→</b></small>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : activeTab === 0 ? (
          <div className="knowledge-tab-panel" role="tabpanel">
            <button className="knowledge-back-button" onClick={() => onChange(null)}>
              ← Danh sách kiến thức
            </button>
            <IrreversibleReaction />
            <ReversibleReaction />
          </div>
        ) : (
          <div className="knowledge-tab-panel" role="tabpanel">
            <button className="knowledge-back-button" onClick={() => onChange(null)}>
              ← Danh sách kiến thức
            </button>
            <div className="knowledge-concept-banner">
              <span>KHÁI NIỆM TRỌNG TÂM</span>
              <h3>Cân bằng hóa học là cân bằng động</h3>
              <p>
                Khi tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch, nồng độ
                các chất không đổi theo thời gian nhưng phản ứng vẫn tiếp diễn.
              </p>
              <div className="knowledge-equation">v<sub>thuận</sub> = v<sub>nghịch</sub></div>
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
                    Phương trình hoá học của phản ứng thuận nghịch được biểu
                    diễn bằng hai nửa mũi tên ngược chiều nhau. Chiều từ trái
                    sang phải là chiều phản ứng thuận, chiều từ phải sang trái
                    là chiều phản ứng nghịch.
                  </p>
                  <div className="conclusion-equation">
                    aA + bB ⇌ cC + dD
                  </div>
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
            <ConcentrationExercise
              checked={exercisesChecked}
              onValidityChange={setTableCorrect}
            />
            <ConcentrationAnalysisExercise
              checked={exercisesChecked}
              onValidityChange={setAnalysisCorrect}
            />
            <ConcentrationRuleExercise
              checked={exercisesChecked}
              onValidityChange={setRuleCorrect}
            />
            <section className="combined-exercise-check">
              <button className="exercise-check" onClick={() => setExercisesChecked(true)}>
                Kiểm tra cả 3 phần
              </button>
              <p className={`exercise-feedback${exercisesChecked && allExercisesCorrect ? " correct" : ""}`}>
                {!exercisesChecked
                  ? "Hoàn thành cả ba phần rồi bấm nút kiểm tra."
                  : allExercisesCorrect
                    ? "Chính xác! Em đã hoàn thành cả ba phần."
                    : "Một số đáp án chưa đúng. Hãy kiểm tra lại các phần được đánh dấu."}
              </p>
              {exercisesChecked && allExercisesCorrect && (
                <div className="concentration-theory-reveal">
                  Khi tăng nồng độ một chất trong phản ứng thì cân bằng hóa học bị phá vỡ
                  và chuyển dịch theo chiều làm giảm nồng độ của chất đó và ngược lại.
                </div>
              )}
            </section>
            <ExperimentFrame
              index="03"
              title="Ảnh hưởng của áp suất đến sự chuyển dịch cân bằng hóa học"
              prompt="Nén hoặc kéo pít-tông để thay đổi thể tích, áp suất và quan sát cân bằng 2NO₂(g) ⇌ N₂O₄(g)."
              simulation="pressure"
            />
            <PressureExercises />
          </div>
        )}
      </div>
    </section>
  )
}

function TeacherDashboard({
  questions,
  progressRecords,
  videoQuestions,
  videoSource,
  onSaveQuestions,
  onSaveVideoQuestions,
  onSaveVideoSource,
  onExit,
}: {
  questions: Question[]
  progressRecords: ProgressRecord[]
  videoQuestions: VideoQuestion[]
  videoSource: string
  onSaveQuestions: (questions: Question[]) => void
  onSaveVideoQuestions: (questions: VideoQuestion[]) => void
  onSaveVideoSource: (source: string) => void
  onExit: () => void
}) {
  const [draftQuestions, setDraftQuestions] = useState(questions)
  const [draftVideoQuestions, setDraftVideoQuestions] = useState(videoQuestions)
  const [videoSaved, setVideoSaved] = useState(false)
  const [videoFileName, setVideoFileName] = useState(
    videoSource.startsWith("data:") ? "Video đã tải lên" : "bai-1-anh-huong-nhiet-do.mp4",
  )
  const [saved, setSaved] = useState(false)
  const studentCount = new Set(progressRecords.map((record) => record.studentName)).size
  const completedCount = progressRecords.length
  const averageScore = completedCount
    ? Math.round(
        (progressRecords.reduce(
          (total, record) => total + (record.score / record.total) * 100,
          0,
        ) /
          completedCount) *
          10,
      ) / 10
    : 0

  const updateQuestion = (index: number, update: Partial<Question>) => {
    setDraftQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...update } : question,
      ),
    )
    setSaved(false)
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, text: string) => {
    setDraftQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question
        const answers = [...question.answers]
        answers[answerIndex] = text
        return { ...question, answers }
      }),
    )
    setSaved(false)
  }

  const saveChanges = () => {
    onSaveQuestions(draftQuestions)
    setSaved(true)
  }

  const updateVideoQuestion = (
    index: number,
    update: Partial<VideoQuestion>,
  ) => {
    setDraftVideoQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? ({ ...question, ...update } as VideoQuestion) : question,
      ),
    )
    setVideoSaved(false)
  }

  const changeVideoQuestionType = (index: number, type: "choice" | "fill") => {
    setDraftVideoQuestions((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index || question.type === type) return question
        if (type === "choice") {
          const answer = question.type === "fill" ? question.fields[0]?.acceptedAnswers[0] || "Đáp án" : "Đáp án đúng"
          return {
            id: question.id,
            time: question.time,
            type: "choice",
            question: question.question,
            choices: [
              { key: "A", text: answer },
              { key: "B", text: "Phương án B" },
              { key: "C", text: "Phương án C" },
              { key: "D", text: "Phương án D" },
            ],
            correctAnswer: "A",
            explanation: question.explanation,
          }
        }
        return {
          id: question.id,
          time: question.time,
          type: "fill",
          question: question.question,
          fields: [{ key: "answer", label: "Đáp án", acceptedAnswers: question.type === "choice" ? [question.choices[0]?.text || ""] : [""] }],
          explanation: question.explanation,
        }
      }),
    )
    setVideoSaved(false)
  }

  const saveVideoChanges = () => {
    onSaveVideoQuestions(draftVideoQuestions)
    setVideoSaved(true)
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") return
      onSaveVideoSource(reader.result)
      setVideoFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="teacher-shell">
      <header className="teacher-header">
        <div>
          <span className="teacher-kicker">CHEMLAB • KHU VỰC GIÁO VIÊN</span>
          <h1>Bảng điều khiển lớp học</h1>
          <p>Theo dõi tiến trình và cập nhật nội dung luyện tập.</p>
        </div>
        <button className="teacher-exit-button" onClick={onExit}>
          <Icon name="arrow" size={16} /> Về màn hình chọn vai trò
        </button>
      </header>

      <main className="teacher-main">
        <section className="teacher-stat-grid" aria-label="Thống kê lớp học">
          <article className="teacher-stat-card">
            <span>HỌC SINH ĐÃ HOÀN THÀNH</span>
            <strong>{studentCount}</strong>
            <small>Số học sinh khác nhau</small>
          </article>
          <article className="teacher-stat-card teal-stat">
            <span>LƯỢT HOÀN THÀNH</span>
            <strong>{completedCount}</strong>
            <small>Tổng số bài đã nộp</small>
          </article>
          <article className="teacher-stat-card orange-stat">
            <span>ĐIỂM TRUNG BÌNH</span>
            <strong>{averageScore}%</strong>
            <small>Trên các lượt đã nộp</small>
          </article>
        </section>

        <section className="teacher-panel">
          <div className="teacher-panel-heading">
            <div>
              <span>TIẾN TRÌNH HỌC SINH</span>
              <h2>Kết quả gần đây</h2>
            </div>
            <span className="teacher-local-note">Dữ liệu lưu trên trình duyệt này</span>
          </div>
          {progressRecords.length === 0 ? (
            <div className="teacher-empty-state">
              Chưa có lượt hoàn thành nào. Học sinh sẽ xuất hiện ở đây sau khi xem
              kết quả.
            </div>
          ) : (
            <div className="progress-table-wrap">
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Điểm</th>
                    <th>Đánh giá</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {[...progressRecords].reverse().map((record) => {
                    const percentage = Math.round((record.score / record.total) * 100)
                    return (
                      <tr key={record.id}>
                        <td>{record.studentName}</td>
                        <td><strong>{record.score}/{record.total}</strong></td>
                        <td><span className="progress-result">{percentage}%</span></td>
                        <td>{new Date(record.completedAt).toLocaleString("vi-VN")}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="teacher-panel video-editor-panel">
          <div className="teacher-panel-heading">
            <div>
              <span>VIDEO TAB 01</span>
              <h2>Cấu hình video tương tác</h2>
            </div>
            <button className="save-question-button" onClick={saveVideoChanges}>
              <Icon name="check" size={16} /> {videoSaved ? "Đã lưu" : "Lưu cấu hình video"}
            </button>
          </div>
          <label className="video-upload-control">
            <span>Tải video bài giảng</span>
            <small>{videoFileName}</small>
            <input type="file" accept="video/*" onChange={handleVideoUpload} />
          </label>
          <div className="video-editor-list">
            {draftVideoQuestions.map((videoQuestion, index) => (
              <article className="video-editor-row" key={videoQuestion.id}>
                <div className="video-editor-index">CÂU {String(index + 1).padStart(2, "0")}</div>
                <label>
                  Xuất hiện tại (giây)
                  <input
                    type="number"
                    min="0"
                    value={videoQuestion.time}
                    onChange={(event) => updateVideoQuestion(index, { time: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Loại câu hỏi
                  <select
                    value={videoQuestion.type}
                    onChange={(event) => changeVideoQuestionType(index, event.target.value as "choice" | "fill")}
                  >
                    <option value="choice">Trắc nghiệm</option>
                    <option value="fill">Điền đáp án</option>
                  </select>
                </label>
                <label className="video-editor-question">
                  Nội dung hiển thị
                  <input
                    value={videoQuestion.question}
                    onChange={(event) => updateVideoQuestion(index, { question: event.target.value })}
                  />
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="teacher-panel question-editor-panel">
          <div className="teacher-panel-heading">
            <div>
              <span>NGÂN HÀNG CÂU HỎI</span>
              <h2>Chỉnh sửa phần luyện tập</h2>
            </div>
            <button className="save-question-button" onClick={saveChanges}>
              <Icon name="check" size={16} /> {saved ? "Đã lưu" : "Lưu thay đổi"}
            </button>
          </div>
          <div className="question-editor-list">
            {draftQuestions.map((question, questionIndex) => (
              <article className="question-editor-card" key={questionIndex}>
                <div className="editor-card-label">CÂU {String(questionIndex + 1).padStart(2, "0")}</div>
                <label>
                  Nội dung câu hỏi
                  <textarea
                    value={question.question}
                    onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })}
                    rows={2}
                  />
                </label>
                <div className="answer-editor-grid">
                  {question.answers.map((answer, answerIndex) => (
                    <label key={answerIndex}>
                      Đáp án {String.fromCharCode(65 + answerIndex)}
                      <input
                        value={answer}
                        onChange={(event) => updateAnswer(questionIndex, answerIndex, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <div className="editor-bottom-row">
                  <label>
                    Đáp án đúng
                    <select
                      value={question.correct}
                      onChange={(event) => updateQuestion(questionIndex, { correct: Number(event.target.value) })}
                    >
                      {question.answers.map((_, answerIndex) => (
                        <option key={answerIndex} value={answerIndex}>
                          {String.fromCharCode(65 + answerIndex)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="explanation-field">
                    Giải thích
                    <input
                      value={question.explanation}
                      onChange={(event) => updateQuestion(questionIndex, { explanation: event.target.value })}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function ExperimentFrame({
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
      className={`experiment-card${simulation === "no2" ? " no2-experiment" : simulation === "hi" ? " concentration-experiment" : " pressure-experiment"}`}
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
        <div className={`simulation-wrap ${simulation === "no2" ? "no2-wrap" : ""}`}>
          {simulation === "hi" ? <ConcentrationSimulation /> : simulation === "pressure" ? <PressureSimulation /> : <NO2Simulation />}
        </div>
      </div>
    </article>
  )
}

function NO2Simulation() {
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
          style={{ "--gas-opacity": no2Ratio.toFixed(2) } as React.CSSProperties}
          aria-label={`Bình khí ở ${temperature} độ C`}
        >
          <div className="gas-particles">
            {Array.from({ length: no2Count }).map((_, index) => (
              <i className="gas-particle no2-particle" key={`no2-${index}`} />
            ))}
            {Array.from({ length: n2o4Count }).map((_, index) => (
              <i className="gas-particle n2o4-particle" key={`n2o4-${index}`} />
            ))}
          </div>
          <span>Màu nâu đỏ tăng khi nồng độ NO₂ tăng</span>
        </div>
        <div className="particle-legend">
          <span><i className="legend-no2" /> NO₂ (nâu đỏ)</span>
          <span><i className="legend-n2o4" /> N₂O₄ (không màu)</span>
        </div>
      </div>
      <div className="simulation-controls">
        <div className="formula-display no2-formula">
          <span>2NO₂(g)</span><strong>⇌</strong><span>N₂O₄(g)</span>
        </div>
        <p className="simulation-state">{direction}</p>
        <div className="temperature-readout">
          <div><span>NHIỆT ĐỘ</span><strong>{temperature}°C</strong></div>
          <div><span>TỈ LỆ NO₂</span><strong>{Math.round(no2Ratio * 100)}%</strong></div>
        </div>
        <label className="temperature-control">
          <span><b>Lạnh</b><b>Nóng</b></span>
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

function PressureSimulation() {
  const [piston, setPiston] = useState(20)
  const [no2Ratio, setNo2Ratio] = useState(0.6)
  const [animating, setAnimating] = useState(false)
  const [particlesVisible, setParticlesVisible] = useState(true)
  const [status, setStatus] = useState("Kéo pít-tông hoặc chọn Nén/Kéo để quan sát hiện tượng.")
  const volume = Math.max(0.3, 1 - (piston - 20) / 80)
  const pressure = 1 / volume
  const gasOpacity = Math.min(0.82, (no2Ratio / volume) * 0.5)

  const movePiston = (nextPiston: number, mode: "compress" | "expand") => {
    if (animating || nextPiston === piston) return
    setAnimating(true)
    setPiston(nextPiston)
    setStatus(mode === "compress"
      ? "Nén pít-tông: thể tích giảm → áp suất tăng → màu khí đậm lên tức thì."
      : "Kéo pít-tông: thể tích tăng → áp suất giảm → màu khí nhạt đi tức thì.")
    window.setTimeout(() => {
      setNo2Ratio(mode === "compress" ? 0.35 : 0.6)
      setStatus(mode === "compress"
        ? "Cân bằng dịch chuyển chiều thuận: NO₂ → N₂O₄, số mol khí giảm nên màu nhạt dần."
        : "Cân bằng dịch chuyển chiều nghịch: N₂O₄ → NO₂, số mol khí tăng nên màu đậm lên.")
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
              style={{ top: `${piston + 5}%`, backgroundColor: `rgba(180, 70, 30, ${gasOpacity})` }}
            >
              {particlesVisible && Array.from({ length: 30 }, (_, index) => (
                <i
                  className={`pressure-particle ${index < Math.round(no2Ratio * 30) ? "no2" : "n2o4"}`}
                  key={index}
                  style={{
                    left: `${8 + (index * 37) % 84}%`,
                    top: `${10 + (index * 61) % 78}%`,
                    animationDelay: `${-(index % 7) * 0.22}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="pressure-legend">
          <span><i className="legend-no2" /> NO₂ (nâu đỏ)</span>
          <span><i className="legend-n2o4" /> N₂O₄ (không màu)</span>
        </div>
      </div>
      <div className="pressure-controls">
        <div className="formula-display no2-formula"><span>2NO₂(g)</span><strong>⇌</strong><span>N₂O₄(g)</span></div>
        <p className="simulation-state">{status}</p>
        <div className="pressure-readout">
          <div><span>ÁP SUẤT</span><strong>{pressure.toFixed(1)} atm</strong></div>
          <div><span>THỂ TÍCH</span><strong>{Math.round(volume * 100)}%</strong></div>
          <div><span>TỈ LỆ NO₂</span><strong>{Math.round(no2Ratio * 100)}%</strong></div>
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
          <small>Thể tích lớn hơn <b>•</b> Thể tích nhỏ hơn</small>
        </label>
        <div className="pressure-actions">
          <button onClick={() => movePiston(60, "compress")} disabled={animating || piston >= 60}>Nén pít-tông</button>
          <button onClick={() => movePiston(20, "expand")} disabled={animating || piston <= 20}>Kéo pít-tông</button>
          <button onClick={() => setParticlesVisible((visible) => !visible)}>{particlesVisible ? "Ẩn hạt khí" : "Hiện hạt khí"}</button>
          <button onClick={reset}>Đặt lại</button>
        </div>
      </div>
    </div>
  )
}

function ConcentrationSimulation() {
  const [prepared, setPrepared] = useState(false)
  const [saltAdded, setSaltAdded] = useState(false)
  const [acidAdded, setAcidAdded] = useState(false)
  const participantLevel = !prepared ? 0 : saltAdded ? 76 : acidAdded ? 64 : 42
  const productLevel = !prepared ? 0 : saltAdded ? 91 : acidAdded ? 48 : 72

  const reset = () => {
    setPrepared(false)
    setSaltAdded(false)
    setAcidAdded(false)
  }

  return (
    <div className="concentration-simulation">
      <header className="concentration-header">
        <div>
          <span>THÍ NGHIỆM 02 • ẢNH HƯỞNG CỦA NỒNG ĐỘ</span>
          <h3>Nghiên cứu ảnh hưởng của nồng độ đến sự chuyển dịch cân bằng</h3>
          <div className="concentration-equation">
            CH₃COONa + H₂O ⇌ CH₃COOH + NaOH
          </div>
        </div>
      </header>

      <div className="concentration-stage">
        <div className="concentration-instructions">
          <p>Cho vài giọt phenolphthalein vào dung dịch CH₃COONa và lắc đều.</p>
          <p>
            Chia dung dịch vào ba ống nghiệm có thể tích gần bằng nhau. Ống (1)
            để so sánh, ống (2) thêm tinh thể CH₃COONa, ống (3) thêm dung dịch
            CH₃COOH.
          </p>
        </div>
        <div className="concentration-tools">
          <button
            className={prepared ? "tool-button active" : "tool-button"}
            onClick={() => setPrepared(true)}
          >
            <span className="tool-icon">🧪</span>
            <b>01</b> Chuẩn bị mẫu
          </button>
          <button
            className={saltAdded ? "tool-button active" : "tool-button"}
            disabled={!prepared}
            onClick={() => setSaltAdded(true)}
          >
            <span className={saltAdded ? "tool-icon spoon pour" : "tool-icon spoon"}>🥄</span>
            <b>02</b> Thêm tinh thể vào ống (2)
          </button>
          <button
            className={acidAdded ? "tool-button active" : "tool-button"}
            disabled={!prepared}
            onClick={() => setAcidAdded(true)}
          >
            <span className={acidAdded ? "tool-icon dropper squeeze" : "tool-icon dropper"}>💧</span>
            <b>03</b> Nhỏ CH₃COOH vào ống (3)
          </button>
          <button className="tool-button reset" onClick={reset}>
            Đặt lại
          </button>
        </div>

        <div className="test-tubes" aria-label="Ba ống nghiệm mô phỏng">
          <TestTube
            label="Ống (1) Đối chứng"
            state={prepared ? "prepared" : "empty"}
          />
          <TestTube
            label="Ống (2)"
            state={saltAdded ? "salt" : prepared ? "prepared" : "empty"}
          />
          <TestTube
            label="Ống (3)"
            state={acidAdded ? "acid" : prepared ? "prepared" : "empty"}
          />
        </div>
        <div className="tube-rack" aria-hidden="true" />
        <div className="concentration-meter is-visible" aria-label="Thanh biểu diễn nồng độ">
          <div className="meter-row participant">
            <div className="meter-label">[CH₃COO⁻] <span>Chất tham gia</span></div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{ "--meter-width": `${participantLevel}%` } as React.CSSProperties}
                key={`participant-${participantLevel}`}
              />
            </div>
          </div>
          <div className="meter-row product">
            <div className="meter-label">[CH₃COOH] <span>Sản phẩm</span></div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{ "--meter-width": `${productLevel}%` } as React.CSSProperties}
                key={`product-${productLevel}`}
              />
            </div>
          </div>
        </div>
        <p className="concentration-status">
          {!prepared
            ? "Nhấn “Chuẩn bị mẫu” để bắt đầu thí nghiệm."
            : !saltAdded && !acidAdded
              ? "Mẫu đối chứng đã sẵn sàng. Chọn thao tác tiếp theo."
              : "Quan sát màu dung dịch và sự dịch chuyển cân bằng trong các ống nghiệm."}
        </p>
      </div>
    </div>
  )
}

function ConcentrationExercise({
  checked,
  onValidityChange,
}: {
  checked: boolean
  onValidityChange: (correct: boolean) => void
}) {
  const answers = [
    { id: "tube-1", text: "Dung dịch có màu hồng nhạt" },
    { id: "tube-2", text: "Màu hồng trở nên đậm hơn" },
    { id: "tube-3", text: "Màu hồng nhạt đi hoặc mất màu" },
  ]
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [draggedAnswer, setDraggedAnswer] = useState<string | null>(null)

  const placedAnswerIds = new Set(Object.values(placements))
  const allCorrect = answers.every((answer) => placements[answer.id] === answer.id)
  useEffect(() => onValidityChange(allCorrect), [allCorrect, onValidityChange])

  const reset = () => {
    setPlacements({})
    setDraggedAnswer(null)
  }

  const placeAnswer = (rowId: string, answerId = draggedAnswer) => {
    if (!answerId) return
    setPlacements((current) => {
      const next = { ...current }
      Object.keys(next).forEach((key) => {
        if (next[key] === answerId) delete next[key]
      })
      next[rowId] = answerId
      return next
    })
    setDraggedAnswer(null)
  }

  return (
    <section className="concentration-exercise" aria-labelledby="concentration-exercise-title">
      <div className="exercise-heading">
        <div>
          <h3 id="concentration-exercise-title">Quan sát thí nghiệm và điền thông tin vào bảng</h3>
        </div>
        <button className="exercise-reset" onClick={reset}>Làm lại</button>
      </div>
      <div className="exercise-table-wrap">
        <table className="exercise-table">
          <thead>
            <tr>
              <th>Ống nghiệm</th>
              <th>Tác động vào hệ</th>
              <th>Hiện tượng màu sắc quan sát được</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ống 1</td>
              <td>Đối chứng</td>
              <ExerciseDropZone
                rowId="tube-1"
                value={placements["tube-1"]}
                answers={answers}
                checked={checked}
                onDropAnswer={placeAnswer}
              />
            </tr>
            <tr>
              <td>Ống 2</td>
              <td>Thêm tinh thể CH₃COONa</td>
              <ExerciseDropZone
                rowId="tube-2"
                value={placements["tube-2"]}
                answers={answers}
                checked={checked}
                onDropAnswer={placeAnswer}
              />
            </tr>
            <tr>
              <td>Ống 3</td>
              <td>Thêm dung dịch CH₃COOH</td>
              <ExerciseDropZone
                rowId="tube-3"
                value={placements["tube-3"]}
                answers={answers}
                checked={checked}
                onDropAnswer={placeAnswer}
              />
            </tr>
          </tbody>
        </table>
      </div>
      <div className="exercise-answer-bank">
        <strong>Kéo đáp án vào ô trống:</strong>
        <div className="answer-chips">
          {answers.map((answer) => (
            <button
              className={`answer-chip${placedAnswerIds.has(answer.id) ? " placed" : ""}`}
              draggable={!placedAnswerIds.has(answer.id)}
              key={answer.id}
              onDragStart={() => setDraggedAnswer(answer.id)}
              onDragEnd={() => setDraggedAnswer(null)}
              onClick={() => {
                const emptyRow = answers.find((item) => !placements[item.id])
                if (emptyRow) {
                  placeAnswer(emptyRow.id, answer.id)
                }
              }}
            >
              {answer.text}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExerciseDropZone({
  rowId,
  value,
  answers,
  checked,
  onDropAnswer,
}: {
  rowId: string
  value?: string
  answers: { id: string; text: string }[]
  checked: boolean
  onDropAnswer: (rowId: string) => void
}) {
  const answer = answers.find((item) => item.id === value)
  const resultClass = checked
    ? answer?.id === rowId
      ? " correct"
      : " incorrect"
    : ""
  return (
    <td
      className={`exercise-drop-zone${answer ? " filled" : ""}${resultClass}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDropAnswer(rowId)}
    >
      {answer ? answer.text : <span>Thả đáp án vào đây</span>}
    </td>
  )
}

function ConcentrationAnalysisExercise({
  checked,
  onValidityChange,
}: {
  checked: boolean
  onValidityChange: (correct: boolean) => void
}) {
  const blanks = [
    { id: "increase-reactant", prompt: "Khi thêm tinh thể CH₃COONa, chúng ta đã làm", options: ["tăng", "giảm"], suffix: "nồng độ của chất tham gia phản ứng.", answer: "tăng" },
    { id: "tube-2-product", prompt: "Màu hồng ở ống 2 trở nên đậm hơn chứng tỏ nồng độ chất nào ở vế phải tăng lên?", options: ["NaOH", "CH₃COOH"], suffix: "", answer: "NaOH" },
    { id: "tube-2-direction", prompt: "Điều này cho thấy cân bằng của hệ đã dịch chuyển theo", options: ["chiều thuận", "chiều nghịch"], suffix: "để tiêu bớt lượng CH₃COONa vừa thêm vào.", answer: "chiều thuận" },
    { id: "increase-product", prompt: "Khi thêm dung dịch CH₃COOH, chúng ta đã làm", options: ["tăng", "giảm"], suffix: "nồng độ của một chất sản phẩm.", answer: "tăng" },
    { id: "tube-3-naoh", prompt: "Màu hồng ở ống 3 bị nhạt đi hoặc mất màu chứng tỏ nồng độ NaOH đã bị", options: ["tăng lên", "giảm đi"], suffix: ".", answer: "giảm đi" },
    { id: "tube-3-direction", prompt: "Điều này cho thấy cân bằng của hệ đã dịch chuyển theo", options: ["chiều thuận", "chiều nghịch"], suffix: "để tiêu bớt lượng CH₃COOH vừa được thêm vào.", answer: "chiều nghịch" },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const allCorrect = blanks.every((blank) => values[blank.id] === blank.answer)
  useEffect(() => onValidityChange(allCorrect), [allCorrect, onValidityChange])

  return (
    <section className="analysis-exercise" aria-labelledby="analysis-exercise-title">
      <div className="exercise-heading">
        <div>
          <h3 id="analysis-exercise-title">Điền từ thích hợp hoặc chọn phương án đúng</h3>
        </div>
        <button
          className="exercise-reset"
          onClick={() => {
            setValues({})
          }}
        >
          Làm lại
        </button>
      </div>
      <p className="analysis-instruction">
        Dựa vào hiện tượng màu sắc thu được từ bảng trên, hãy phân tích bản chất chuyển dịch của hệ.
      </p>
      <div className="analysis-group">
        <h4>a) Phân tích ống nghiệm (2)</h4>
        {blanks.slice(0, 3).map((blank) => (
          <AnalysisBlank
            key={blank.id}
            blank={blank}
            value={values[blank.id]}
            checked={checked}
            onChange={(value) => {
              setValues((current) => ({ ...current, [blank.id]: value }))
            }}
          />
        ))}
      </div>
      <div className="analysis-group">
        <h4>b) Phân tích ống nghiệm (3)</h4>
        {blanks.slice(3).map((blank) => (
          <AnalysisBlank
            key={blank.id}
            blank={blank}
            value={values[blank.id]}
            checked={checked}
            onChange={(value) => {
              setValues((current) => ({ ...current, [blank.id]: value }))
            }}
          />
        ))}
      </div>
    </section>
  )
}

function AnalysisBlank({
  blank,
  value,
  checked,
  onChange,
}: {
  blank: { id: string; prompt: string; options: string[]; suffix: string; answer: string }
  value?: string
  checked: boolean
  onChange: (value: string) => void
}) {
  const resultClass = checked ? (value === blank.answer ? " analysis-correct" : " analysis-incorrect") : ""
  return (
    <div className="analysis-line">
      <span>{blank.prompt} </span>
      <select
        className={`analysis-select${resultClass}`}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Đáp án cho ${blank.prompt}`}
      >
        <option value="" disabled>Chọn đáp án</option>
        {blank.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <span> {blank.suffix}</span>
    </div>
  )
}

function ConcentrationRuleExercise({
  checked,
  onValidityChange,
}: {
  checked: boolean
  onValidityChange: (correct: boolean) => void
}) {
  const blanks = [
    {
      id: "increase-concentration",
      before: "Khi ta tăng nồng độ của một chất (tham gia hoặc sản phẩm), cân bằng sẽ dịch chuyển theo chiều làm",
      after: "nồng độ chất đó (tức là chiều phản ứng tiêu thụ bớt chất đó).",
      options: ["tăng", "giảm"],
      answer: "giảm",
    },
    {
      id: "decrease-concentration",
      before: "Ngược lại, khi ta giảm nồng độ của một chất, cân bằng sẽ dịch chuyển theo chiều làm",
      after: "nồng độ chất đó (tức là chiều phản ứng sinh ra thêm chất đó).",
      options: ["tăng", "giảm"],
      answer: "tăng",
    },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const allCorrect = blanks.every((blank) => values[blank.id] === blank.answer)
  useEffect(() => onValidityChange(allCorrect), [allCorrect, onValidityChange])

  const reset = () => {
    setValues({})
  }

  return (
    <section className="analysis-exercise rule-exercise" aria-labelledby="rule-exercise-title">
      <div className="exercise-heading">
        <div>
          <h3 id="rule-exercise-title">Khái quát quy luật ảnh hưởng của nồng độ</h3>
        </div>
        <button className="exercise-reset" onClick={reset}>Làm lại</button>
      </div>
      <p className="analysis-instruction">
        Từ các phân tích trên, hãy điền từ thích hợp để khái quát quy luật chung về ảnh hưởng của nồng độ đến chiều dịch chuyển cân bằng hóa học.
      </p>
      <div className="rule-list">
        {blanks.map((blank, index) => (
          <div className="rule-item" key={blank.id}>
            <span className="rule-bullet">•</span>
            <span>{blank.before} </span>
            <select
              className={`analysis-select${checked ? (values[blank.id] === blank.answer ? " analysis-correct" : " analysis-incorrect") : ""}`}
              value={values[blank.id] || ""}
              onChange={(event) => {
                setValues((current) => ({ ...current, [blank.id]: event.target.value }))
              }}
              aria-label={`Đáp án quy luật ${index + 1}`}
            >
              <option value="" disabled>Chọn đáp án</option>
              {blank.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <span> {blank.after}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PressureExercises() {
  const [checked, setChecked] = useState(false)
  const [questionOneCorrect, setQuestionOneCorrect] = useState(false)
  const [questionTwoCorrect, setQuestionTwoCorrect] = useState(false)
  const [conclusionAnswer, setConclusionAnswer] = useState("")
  const conclusionCorrect = conclusionAnswer === "giảm"
  const allCorrect = questionOneCorrect && questionTwoCorrect && conclusionCorrect

  return (
    <>
      <PressureExercise checked={checked} onValidityChange={setQuestionOneCorrect} />
      <PressureObservationExercise checked={checked} onValidityChange={setQuestionTwoCorrect} />
      <section className="pressure-conclusion-check">
        <div className="pressure-conclusion-exercise">
          <h3>Kết luận</h3>
          <p>
            Khi đẩy pít-tông xuống (làm tăng áp suất chung của hệ), hệ cân bằng
            đã tự dịch chuyển theo chiều thuận. Chiều này trùng với chiều làm
            <select
              className={`analysis-select${checked ? (conclusionCorrect ? " analysis-correct" : " analysis-incorrect") : ""}`}
              value={conclusionAnswer}
              onChange={(event) => {
                setConclusionAnswer(event.target.value)
                setChecked(false)
              }}
              aria-label="Từ điền vào phần kết luận"
            >
              <option value="" disabled>Chọn đáp án</option>
              <option value="tăng">tăng</option>
              <option value="giảm">giảm</option>
            </select>
            {" "}số mol khí trong bình.
          </p>
          <p>(Tương tự với trường hợp kéo pít-tông lên.)</p>
        </div>
        <button className="exercise-check" onClick={() => setChecked(true)}>
          Kiểm tra cả 3 phần
        </button>
        <p className={`exercise-feedback${checked && allCorrect ? " correct" : ""}`}>
          {!checked
            ? "Hoàn thành Câu 1 và Câu 2 rồi bấm nút kiểm tra."
            : allCorrect
              ? "Chính xác! Em đã hoàn thành các câu hỏi về ảnh hưởng của áp suất."
              : "Một số đáp án chưa đúng. Hãy xem lại hai phần bài tập."}
        </p>
        {checked && allCorrect && (
          <div className="pressure-theory-reveal">
            <h3>Kết luận đúng</h3>
            <p>
              Khi đẩy pít-tông xuống, làm tăng áp suất chung của hệ, hệ cân bằng
              tự dịch chuyển theo chiều thuận. Chiều này trùng với chiều làm
              <strong> giảm số mol khí</strong> trong bình.
            </p>
            <p>(Tương tự với trường hợp kéo pít-tông lên.)</p>
            <p>
              Khi tăng áp suất chung của hệ, cân bằng chuyển dịch theo chiều làm
              giảm áp suất, tức là chiều làm giảm số mol khí và ngược lại.
              Đối với phản ứng thuận nghịch có tổng số mol khí ở hai vế bằng
              nhau, cân bằng không bị chuyển dịch khi thay đổi áp suất chung.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

function PressureExercise({
  checked,
  onValidityChange,
}: {
  checked: boolean
  onValidityChange: (correct: boolean) => void
}) {
  const blanks = [
    {
      id: "left-moles",
      before: "Tổng số hệ số chất khí ở vế trái (chất tham gia):",
      after: "(Vì hệ số NO₂ trong phương trình là 2).",
      options: ["1 mol", "2 mol", "3 mol"],
      answer: "2 mol",
    },
    {
      id: "right-moles",
      before: "Tổng số hệ số chất khí ở vế phải (chất sản phẩm):",
      after: "(Vì hệ số N₂O₄ trong phương trình là 1).",
      options: ["1 mol", "2 mol", "4 mol"],
      answer: "1 mol",
    },
    {
      id: "forward-direction",
      before: "Chiều thuận là chiều làm",
      after: "số mol khí.",
      options: ["tăng", "giảm"],
      answer: "giảm",
    },
    {
      id: "reverse-direction",
      before: "Chiều nghịch là chiều làm",
      after: "số mol khí.",
      options: ["tăng", "giảm"],
      answer: "tăng",
    },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const allCorrect = blanks.every((blank) => values[blank.id] === blank.answer)
  useEffect(() => onValidityChange(allCorrect), [allCorrect, onValidityChange])

  return (
    <section className="analysis-exercise pressure-exercise" aria-labelledby="pressure-exercise-title">
      <div className="exercise-heading">
        <div>
          <h3 id="pressure-exercise-title">Cho hệ cân bằng trong xi-lanh</h3>
        </div>
        <button className="exercise-reset" onClick={() => setValues({})}>
          Làm lại
        </button>
      </div>
      <div className="pressure-equation">
        <strong>2NO₂(g)</strong><span>⇌</span><strong>N₂O₄(g)</strong>
        <small>Δ<sub>r</sub>H°<sub>298</sub> &lt; 0</small>
      </div>
      <p className="pressure-colors"><span>(màu nâu đỏ)</span><span>(không màu)</span></p>
      <div className="pressure-answer-lines">
        {blanks.map((blank) => (
          <div className="analysis-line" key={blank.id}>
            <span>{blank.before} </span>
            <select
              className={`analysis-select${checked ? (values[blank.id] === blank.answer ? " analysis-correct" : " analysis-incorrect") : ""}`}
              value={values[blank.id] || ""}
              onChange={(event) => {
                setValues((current) => ({ ...current, [blank.id]: event.target.value }))
              }}
              aria-label={blank.before}
            >
              <option value="" disabled>Chọn đáp án</option>
              {blank.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <span>
              {blank.id === "left-moles" || blank.id === "right-moles"
                ? checked && values[blank.id] === blank.answer
                  ? blank.after
                  : ""
                : blank.after}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PressureObservationExercise({
  checked,
  onValidityChange,
}: {
  checked: boolean
  onValidityChange: (correct: boolean) => void
}) {
  const blanks = [
    {
      id: "instant-concentration",
      before: "Ngay khi nén bình, màu nâu đỏ đậm lên do",
      after: "khí NO₂ tăng đột ngột vì thể tích giảm.",
      options: ["nồng độ", "nhiệt độ"],
      answer: "nồng độ",
    },
    {
      id: "not-shifted",
      before: "Hiện tượng tức thời này chưa phải do",
      after: "dịch chuyển.",
      options: ["cân bằng", "áp suất"],
      answer: "cân bằng",
    },
    {
      id: "no2-decreases",
      before: "Sau khi giữ yên pít-tông, màu nâu đỏ nhạt dần chứng tỏ lượng khí NO₂ đã",
      after: ".",
      options: ["bớt đi", "tăng lên"],
      answer: "bớt đi",
    },
    {
      id: "n2o4-increases",
      before: "Đồng thời lượng khí N₂O₄ không màu được",
      after: "thêm.",
      options: ["sinh ra", "tiêu thụ"],
      answer: "sinh ra",
    },
    {
      id: "shift-forward",
      before: "Điều này chứng minh cân bằng đã dịch chuyển theo",
      after: ".",
      options: ["chiều thuận", "chiều nghịch"],
      answer: "chiều thuận",
    },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const allCorrect = blanks.every((blank) => values[blank.id] === blank.answer)
  useEffect(() => onValidityChange(allCorrect), [allCorrect, onValidityChange])

  return (
    <section className="analysis-exercise pressure-exercise" aria-labelledby="pressure-observation-title">
      <div className="exercise-heading">
        <div>
          <h3 id="pressure-observation-title">Dựa vào diễn biến thí nghiệm, hãy điền vào chỗ trống</h3>
        </div>
        <button className="exercise-reset" onClick={() => setValues({})}>
          Làm lại
        </button>
      </div>
      <div className="observation-phase">
        <h4>Giai đoạn 1: Ngay khi đẩy pít-tông xuống <span>(thể tích giảm, áp suất tăng)</span></h4>
        <p className="observation-note">Hiện tượng: Màu nâu đỏ đột ngột đậm lên rất rõ.</p>
        <PressureBlank blank={blanks[0]} values={values} checked={checked} onChange={(id, value) => {
          setValues((current) => ({ ...current, [id]: value }))
        }} />
        <PressureBlank blank={blanks[1]} values={values} checked={checked} onChange={(id, value) => {
          setValues((current) => ({ ...current, [id]: value }))
        }} />
      </div>
      <div className="observation-phase">
        <h4>Giai đoạn 2: Sau khi giữ yên pít-tông một thời gian <span>(hệ tự điều chỉnh)</span></h4>
        <p className="observation-note">Hiện tượng: Màu nâu đỏ của hỗn hợp khí từ từ nhạt dần đi.</p>
        {blanks.slice(2).map((blank) => (
          <PressureBlank
            key={blank.id}
            blank={blank}
            values={values}
            checked={checked}
            onChange={(id, value) => {
              setValues((current) => ({ ...current, [id]: value }))
            }}
          />
        ))}
      </div>
    </section>
  )
}

function PressureBlank({
  blank,
  values,
  checked,
  onChange,
}: {
  blank: { id: string; before: string; after: string; options: string[]; answer: string }
  values: Record<string, string>
  checked: boolean
  onChange: (id: string, value: string) => void
}) {
  const value = values[blank.id]
  return (
    <p className="analysis-line observation-line">
      <span>{blank.before} </span>
      <select
        className={`analysis-select${checked ? (value === blank.answer ? " analysis-correct" : " analysis-incorrect") : ""}`}
        value={value || ""}
        onChange={(event) => onChange(blank.id, event.target.value)}
        aria-label={blank.before}
      >
        <option value="" disabled>Chọn đáp án</option>
        {blank.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <span> {blank.after}</span>
    </p>
  )
}

function TestTube({
  label,
  state,
}: {
  label: string
  state: "empty" | "prepared" | "salt" | "acid"
}) {
  return (
    <div className="test-tube-card">
      <div className="test-tube-label">{label}</div>
      <div className={`test-tube ${state}`}>
        <div className="tube-liquid" />
        {state === "salt" && <div className="crystals" aria-label="Tinh thể đang rơi"><i>✦</i><i>✦</i><i>✦</i></div>}
        {state === "acid" && <div className="drop-stream" aria-label="Giọt axit đang nhỏ"><i /><i /><i /></div>}
        {state !== "empty" && <div className="phenolphthalein" />}
      </div>
      <span>
        {state === "salt"
          ? "Màu hồng đậm hơn"
          : state === "acid"
            ? "Màu hồng nhạt đi"
            : "Dung dịch CH₃COONa + phenolphthalein"}
      </span>
    </div>
  )
}

function SectionHeading({
  number,
  kicker,
  title,
  description,
  light = false,
}: {
  number: string
  kicker: string
  title: string
  description: string
  light?: boolean
}) {
  return (
    <div className={`section-heading${light ? " light" : ""}`}>
      <div className="section-number">{number}</div>
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default App
