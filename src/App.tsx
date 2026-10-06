import { useEffect, useRef, useState } from "react"
import {
  initialVideoQuestions,
  VIDEO_SOURCE,
  type VideoQuestion,
} from "./InteractiveVideoLesson"
import Icon from "./components/common/Icon"
import KnowledgeTabs from "./components/layout/KnowledgeTabs"
import TeacherDashboard from "./components/teacher/TeacherDashboard"
import { appConfig } from "./config/appConfig"
import { sections } from "./data/curriculum"
import { initialQuestions } from "./data/questions"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useStudyMonitoring } from "./hooks/useStudyMonitoring"
import type { ProgressRecord, Question } from "./types/lesson"

export default function App() {
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [questionBank, setQuestionBank] = useLocalStorage(
    "chemlab-questions",
    initialQuestions,
  )
  const [progressRecords, setProgressRecords] =
    useLocalStorage<ProgressRecord[]>("chemlab-progress", [])
  const [videoQuestions, setVideoQuestions] = useLocalStorage<VideoQuestion[]>(
    "chemlab-video-questions",
    initialVideoQuestions,
  )
  const [videoSource, setVideoSource] = useLocalStorage(
    "chemlab-video-source",
    VIDEO_SOURCE,
  )
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL
    if (
      videoSource.startsWith("/videos/") &&
      !videoSource.startsWith(basePath)
    ) {
      setVideoSource(`${basePath}${videoSource.slice(1)}`)
    }
  }, [setVideoSource, videoSource])
  const [studentName, setStudentName] = useState("")
  const [teacherPasscode, setTeacherPasscode] = useState("")
  const [showTeacherLogin, setShowTeacherLogin] = useState(false)
  const [teacherLoginError, setTeacherLoginError] = useState("")
  const [hasStarted, setHasStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [sectionProgress, setSectionProgress] = useLocalStorage(
    "chemlab-section-progress",
    { knowledge: false, quiz: false, application: false },
  )
  // Normalize stored shape (older builds may have a different object)
  const safeSectionProgress =
    sectionProgress &&
    typeof sectionProgress === "object" &&
    "knowledge" in sectionProgress &&
    "quiz" in sectionProgress &&
    "application" in sectionProgress
      ? sectionProgress
      : { knowledge: false, quiz: false, application: false }
  const [lockNotice, setLockNotice] = useState("")
  const [knowledgeTab, setKnowledgeTab] = useState<0 | 1 | null>(null)
  const [activeLessonTab, setActiveLessonTab] = useState("kien-thuc")
  const [essayAnswer, setEssayAnswer] = useLocalStorage<string>(
    "chemlab-application-essay",
    "",
  )
  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, number>>({})
  const progressSaved = useRef(false)
  const { violationCount, showWarning, setShowWarning, isLocked } =
    useStudyMonitoring({
      enabled: appConfig.studyMonitoringEnabled,
      hasStarted,
    })

  const goToSection = (id: string) => {
    if (isSectionLocked(id)) {
      setLockNotice(lockReason(id))
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setLockNotice("")
    const nextTab = ["kham-pha", "video-bai-giang", "thi-nghiem"].includes(id)
      ? "kien-thuc"
      : id
    setActiveLessonTab(nextTab)
    if (nextTab === "kien-thuc") setKnowledgeTab(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const isSectionLocked = (id: string) => {
    if (id === "kien-thuc") return false
    if (id === "luyen-tap") return !safeSectionProgress.knowledge
    if (id === "van-dung") return !safeSectionProgress.knowledge || !safeSectionProgress.quiz
    return false
  }
  const lockReason = (id: string) => {
    if (id === "luyen-tap" && !safeSectionProgress.knowledge)
      return "Hoàn thành phần I – Kiến thức trước."
    if (id === "van-dung") {
      if (!safeSectionProgress.knowledge) return "Hoàn thành phần I – Kiến thức trước."
      if (!safeSectionProgress.quiz) return "Hoàn thành phần II – Luyện tập trước."
    }
    return ""
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
  // Auto-mark quiz done once results show with passing score
  useEffect(() => {
    if (showResults && score >= 6 && !safeSectionProgress.quiz) {
      setSectionProgress({ ...safeSectionProgress, quiz: true })
    }
  }, [showResults, score, safeSectionProgress, setSectionProgress])
  const markKnowledgeDone = () => {
    if (safeSectionProgress.knowledge) return
    setSectionProgress({ ...safeSectionProgress, knowledge: true })
  }
  const hasEssayContent = essayAnswer.trim().length > 0
  const passesQuiz = hasCompletedQuiz && score >= 6
  const canCompleteCourse = passesQuiz && hasEssayContent

  const finalizeCourse = () => {
    if (!canCompleteCourse) return
    setSectionProgress({ ...safeSectionProgress, application: true })
    setCourseCompleted(true)
  }

  const restartCourse = () => {
    setSelectedAnswers({})
    setShowResults(false)
    setCourseCompleted(false)
    setActiveLessonTab("kien-thuc")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
            onClick={() => {
              goToSection("kien-thuc")
              setKnowledgeTab(null)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
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
            {sections.map((section, index) => {
              const locked = isSectionLocked(section.id)
              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  aria-disabled={locked}
                  className={
                    (activeLessonTab === section.id
                      ? "nav-item active"
                      : "nav-item") + (locked ? " nav-item-locked" : "")
                  }
                >
                  <span>{["I", "II", "III"][index]}</span>
                  {section.label}
                  {locked && <Icon name="close" size={14} />}
                </button>
              )
            })}
          </nav>
          <div className="topbar-user-area">
            {studentName && (
              <button
                className="student-badge"
                onClick={() => setHasStarted(false)}
                title="Bấm để đổi tên học sinh"
              >
                <span className="student-badge-avatar">🎓</span>
                <span className="student-badge-name">{studentName}</span>
                <span className="student-badge-edit">✏️</span>
              </button>
            )}
            <div className="class-badge">LỚP 11</div>
            {appConfig.teacherAccessEnabled && (
              <button
                className="teacher-login-trigger"
                onClick={() => setShowTeacherLogin(true)}
              >
                Giáo viên
              </button>
            )}
          </div>
        </div>
      </header>
      {lockNotice && (
        <div className="container">
          <div className="lock-notice-bar">{lockNotice}</div>
        </div>
      )}

      <main>
        {activeLessonTab === "kien-thuc" && knowledgeTab === null && (
          <section className="hero">
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
                  Cùng khám phá thế giới vi mô, nơi các phản ứng không hề dừng
                  lại — chúng chỉ tìm thấy một nhịp điệu cân bằng.
                </p>
                <div className="hero-actions">
                  <button
                    className="hero-primary-btn"
                    onClick={() => setKnowledgeTab(0)}
                  >
                    <Icon name="book" size={18} />
                    Bắt đầu học chủ đề I
                  </button>
                  <button
                    className="hero-secondary-btn"
                    onClick={() => goToSection("luyen-tap")}
                  >
                    <Icon name="quiz" size={18} />
                    Luyện tập trắc nghiệm
                  </button>
                </div>
              </div>

              <div
                className="hero-visual"
                aria-label="Minh họa cân bằng hóa học"
              >
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
          </section>
        )}

        {activeLessonTab === "kien-thuc" && (
          <KnowledgeTabs
            activeTab={knowledgeTab}
            onChange={setKnowledgeTab}
            videoQuestions={videoQuestions}
            videoSource={videoSource}
            knowledgeDone={safeSectionProgress.knowledge}
            onAllKnowledgeDone={markKnowledgeDone}
          />
        )}

        {activeLessonTab === "luyen-tap" && (
          <section id="luyen-tap" className="content-section quiz-section">
            <div className="container">
              <div className="study-section-hero quiz-hero">
                <div>
                  <span>PHẦN II • LUYỆN TẬP</span>
                  <h2>Kiểm tra mức độ nắm bài</h2>
                  <p>
                    Chọn đáp án cho từng câu hỏi và nhận phản hồi, giải thích
                    ngay sau mỗi lựa chọn.
                  </p>
                </div>
                <div className="study-section-stats">
                  <div>
                    <strong>{questionBank.length}</strong>
                    <span>Câu hỏi</span>
                  </div>
                  <div>
                    <strong>01</strong>
                    <span>Bài luyện tập</span>
                  </div>
                  <div>
                    <strong>✓</strong>
                    <span>Phản hồi tức thì</span>
                  </div>
                </div>
              </div>

              <div className="study-section-panel quiz-panel">
                <div className="study-panel-heading">
                  <div>
                    <span>LUYỆN TẬP NHANH</span>
                    <h3>Chọn đáp án đúng</h3>
                  </div>
                  <small>
                    {answeredCount}/{questionBank.length} câu đã trả lời
                  </small>
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
          <section
            id="van-dung"
            className="content-section application-section"
          >
            <div className="container">
              <div className="study-section-hero application-hero">
                <div>
                  <span>PHẦN III • VẬN DỤNG</span>
                  <h2>Đưa kiến thức vào thực tế</h2>
                  <p>
                    Vận dụng nguyên lý chuyển dịch cân bằng để phân tích một vấn
                    đề gần gũi trong đời sống.
                  </p>
                </div>
                <div className="study-section-stats">
                  <div>
                    <strong>01</strong>
                    <span>Tình huống</span>
                  </div>
                  <div>
                    <strong>03</strong>
                    <span>Gợi ý</span>
                  </div>
                  <div>
                    <strong>H₂S</strong>
                    <span>Chủ đề thực tế</span>
                  </div>
                </div>
              </div>
              <div className="study-section-panel application-panel">
                <div className="study-panel-heading">
                  <div>
                    <span>THỬ THÁCH THỰC TẾ</span>
                    <h3>Kỹ sư xử lý hồ nước sinh thái</h3>
                  </div>
                  <small>Vận dụng nguyên lý Le Chatelier</small>
                </div>
                <article className="scenario-card">
                  <div className="scenario-brief">
                    <span className="role-badge">
                      <Icon name="spark" size={18} /> VAI TRÒ CỦA BẠN
                    </span>
                    <h3>Kỹ sư xử lý hồ nước sinh thái</h3>
                    <p>
                      Một hồ nước sinh thái xuất hiện mùi trứng thối do khí H₂S
                      hòa tan. Trong nước tồn tại cân bằng:
                    </p>
                    <div className="scenario-equation">
                      H₂S(aq) ⇌ H⁺(aq) + HS⁻(aq)
                    </div>
                  </div>
                  <div className="mission-panel">
                    <span>NHIỆM VỤ THỰC TẾ</span>
                    <h3>Đề xuất phương án giảm mùi H₂S</h3>
                    <p>
                      Dựa vào nguyên lý Le Chatelier, hãy lựa chọn biện pháp tác
                      động đến pH hoặc loại bỏ một cấu tử để cân bằng chuyển
                      dịch theo chiều làm giảm H₂S.
                    </p>
                    <div className="mission-hints">
                      <div>
                        <b>01</b>
                        <span>
                          Dự đoán chiều chuyển dịch khi giảm nồng độ H⁺.
                        </span>
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
                <article className="scenario-card essay-card">
                  <div className="scenario-brief">
                    <span className="role-badge">
                      <Icon name="pencil" size={18} /> BÀI TỰ LUẬN
                    </span>
                    <h3>Trình bày lời giải của bạn</h3>
                    <p>
                      Dựa trên tình huống phía trên, hãy viết câu trả lời tự luận
                      của em vào ô bên dưới. Bài làm được lưu tự động trên trình
                      duyệt này.
                    </p>
                  </div>
                  <div className="essay-panel">
                    <label htmlFor="application-essay" className="essay-label">
                      Nội dung trả lời
                    </label>
                    <textarea
                      id="application-essay"
                      className="essay-textarea"
                      rows={10}
                      placeholder="Nhập câu trả lời tự luận của em tại đây..."
                      value={essayAnswer}
                      onChange={(event) => setEssayAnswer(event.target.value)}
                    />
                    <div className="essay-meta">
                      <span>
                        {essayAnswer.trim().length === 0
                          ? "Chưa có nội dung"
                          : `${essayAnswer.trim().length} ký tự`}
                      </span>
                      <button
                        type="button"
                        className="essay-clear"
                        onClick={() => setEssayAnswer("")}
                        disabled={essayAnswer.length === 0}
                      >
                        Xoá bài làm
                      </button>
                    </div>
                  </div>
                </article>
                <div className="course-finalize">
                  <div className="course-finish-status">
                    <strong>Điều kiện hoàn thành khoá học</strong>
                    <ul>
                      <li className={hasCompletedQuiz ? "pass" : "fail"}>
                        {hasCompletedQuiz ? "✓" : "○"} Làm đủ 12 câu trắc nghiệm
                      </li>
                      <li className={score >= 6 ? "pass" : "fail"}>
                        {score >= 6 ? "✓" : "○"} Đạt tối thiểu 6/12 câu đúng
                      </li>
                      <li className={hasEssayContent ? "pass" : "fail"}>
                        {hasEssayContent ? "✓" : "○"} Hoàn thành bài tự luận
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="course-finish-button"
                    disabled={!canCompleteCourse}
                    onClick={finalizeCourse}
                  >
                    {canCompleteCourse
                      ? "Kết thúc bài học"
                      : "Hoàn thành đủ điều kiện để kết thúc bài học"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      {courseCompleted && (
        <div className="monitor-overlay completion-overlay" role="dialog" aria-modal="true">
          <div className="monitor-dialog completion-dialog">
            <div className="monitor-icon completion-icon">
              <Icon name="spark" size={28} />
            </div>
            <span>CHÚC MỪNG HOÀN THÀNH KHOÁ HỌC</span>
            <h2>Đánh giá cá nhân của {studentName}</h2>

            <div className="completion-summary">
              <div className="completion-stat">
                <strong>{score}/{questionBank.length}</strong>
                <small>Trắc nghiệm</small>
              </div>
              <div className="completion-stat">
                <strong>{essayAnswer.trim().length}</strong>
                <small>Ký tự tự luận</small>
              </div>
              <div className="completion-stat">
                <strong>{resultLabel}</strong>
                <small>Xếp loại</small>
              </div>
            </div>

            <div className="completion-grade">
              {score >= Math.ceil(questionBank.length * 0.9)
                ? "A"
                : score >= Math.ceil(questionBank.length * 0.7)
                  ? "B"
                  : score >= 6
                    ? "C"
                    : "D"}
            </div>

            <p className="completion-message">{resultMessage}</p>

            <div className="completion-essay">
              <strong>Bài tự luận của bạn</strong>
              <blockquote>{essayAnswer.trim()}</blockquote>
            </div>

            <div className="completion-actions">
              <button className="result-secondary-button" onClick={restartCourse}>
                Học lại từ đầu
              </button>
            </div>
          </div>
        </div>
      )}


      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            <Icon name="atom" />
            <span>
              <strong>CHEMLAB</strong>
              <span className="footer-brand-sub">Học liệu số Hóa học 11</span>
            </span>
          </div>
          <span className="footer-divider" aria-hidden="true" />
          <div className="footer-contributors">
            <span className="footer-contributors-label">Người thực hiện dự án</span>
            <ul>
              <li>Phạm Việt Hương</li>
              <li>Nguyễn Thị Phương Thảo</li>
            </ul>
          </div>
          <span className="footer-divider" aria-hidden="true" />
          <div className="footer-school">
            <img
              src="/logo_ued.png"
              alt="Logo trường Đại học Giáo dục - Đại học Quốc gia Hà Nội"
              className="footer-school-logo"
              loading="lazy"
            />
            <div className="footer-school-text">
              <strong>Trường Đại học Giáo dục - Đại học Quốc gia Hà Nội</strong>
              <small>Đơn vị triển khai</small>
            </div>
          </div>
        </div>
      </footer>

      <nav className="mobile-nav" aria-label="Điều hướng di động">
        {sections.map((section) => {
          const locked = isSectionLocked(section.id)
          return (
            <button
              key={section.id}
              onClick={() => goToSection(section.id)}
              aria-disabled={locked}
              className={
                (activeLessonTab === section.id ? "active" : "") +
                (locked ? " mobile-nav-locked" : "")
              }
            >
              <Icon name={locked ? "close" : section.icon} size={20} />
              <span>{section.label}</span>
            </button>
          )
        })}
      </nav>

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
                <small className="teacher-login-error">
                  {teacherLoginError}
                </small>
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
              <strong>
                {score}/{questionBank.length}
              </strong>
              <small>câu đúng</small>
            </div>
            <div className="result-badge">{resultLabel}</div>
            <p>{resultMessage}</p>
            <div className="result-actions">
              <button onClick={() => setShowResults(false)}>
                Xem lại bài học
              </button>
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
    </div>
  )
}
