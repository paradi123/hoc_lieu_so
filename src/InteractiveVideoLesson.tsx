import { useEffect, useRef, useState, type ReactNode } from "react"

// ==================== DỮ LIỆU BÀI GIẢNG DỄ CHỈNH SỬA ====================
export const VIDEO_LESSON_TITLE = "Ảnh hưởng của nhiệt độ đến chuyển dịch cân bằng"
export const VIDEO_SOURCE = `${import.meta.env.BASE_URL}videos/bai-1-anh-huong-nhiet-do.mp4`

export type ChoiceQuestion = {
  id: string
  time: number
  type: "choice"
  question: string
  image?: string
  imageAlt?: string
  choices: Array<{ key: string; text: string }>,
  correctAnswer: string
  explanation: string
}

export type FillQuestion = {
  id: string
  time: number
  type: "fill"
  question: string
  image?: string
  imageAlt?: string
  fields: Array<{
    key: string
    label: string
    acceptedAnswers: string[]
  }>
  hint?: string
  explanation: string
}

export type VideoQuestion = ChoiceQuestion | FillQuestion

// Có thể thêm đáp án dự phòng vào acceptedAnswers. Hệ thống không phân biệt dấu.
export const initialVideoQuestions: VideoQuestion[] = [
  {
    id: "mau-phenolphthalein",
    time: 48,
    type: "choice",
    question:
      "Khi kỹ thuật viên cho phenolphthalein vào dung dịch CH₃COONa, dung dịch có màu gì?",
    image: `${import.meta.env.BASE_URL}images/phenolphthalein-ch3coona.png`,
    imageAlt:
      "Cốc thủy tinh chứa dung dịch CH₃COONa sau khi nhỏ phenolphthalein có màu hồng nhạt.",
    choices: [
      { key: "A", text: "Hồng nhạt" },
      { key: "B", text: "Hồng" },
      { key: "C", text: "Đỏ" },
      { key: "D", text: "Cam" },
    ],
    correctAnswer: "A",
    explanation:
      "Muối CH₃COONa thủy phân trong nước tạo môi trường bazơ yếu nên phenolphthalein chuyển màu hồng nhạt.",
  },
  {
    id: "ong-nghiem-nuoc-da",
    time: 94,
    type: "fill",
    question:
      "Khi ngâm ống nghiệm vào nước đá, hãy hoàn thành ba nhận xét:",
    image: `${import.meta.env.BASE_URL}images/video-shared-ongnghiem.png`,
    imageAlt:
      "Ba ống nghiệm chứa dung dịch CH₃COONa + phenolphthalein trên giá đỡ, ống bên trái có màu hồng đậm, hai ống còn lại nhạt hơn.",
    fields: [
      {
        key: "a",
        label: "Màu hồng thay đổi như thế nào ?",
        acceptedAnswers: ["nhạt dần", "nhạt", "nhạt đi", "nhạt dần đi"],
      },
      {
        key: "b",
        label: "Cân bằng dịch chuyển theo chiều thuận hay nghịch ?",
        acceptedAnswers: ["nghịch", "chiều nghịch"],
      },
      {
        key: "c",
        label: "Đó là chiều toả hay thu nhiệt ?",
        acceptedAnswers: ["tỏa nhiệt", "toả nhiệt", "chiều tỏa nhiệt"],
      },
    ],
    hint: "Chú ý biến thiên enthalpy (ΔH) của phản ứng.",
    explanation:
      "Khi làm lạnh, cân bằng ưu tiên chiều tỏa nhiệt, tức chiều nghịch; màu hồng vì thế nhạt dần.",
  },
  {
    id: "ong-nghiem-nuoc-nong",
    time: 98,
    type: "fill",
    question:
      "Khi ngâm ống nghiệm vào nước nóng, hãy hoàn thành ba nhận xét:",
    image: `${import.meta.env.BASE_URL}images/video-shared-ongnghiem.png`,
    imageAlt:
      "Ba ống nghiệm chứa dung dịch CH₃COONa + phenolphthalein trên giá đỡ, ống bên trái có màu hồng đậm, hai ống còn lại nhạt hơn.",
    fields: [
      {
        key: "a",
        label: "Màu hồng thay đổi như thế nào ?",
        acceptedAnswers: ["đậm dần", "đậm", "đậm lên", "đậm dần lên"],
      },
      {
        key: "b",
        label: "Cân bằng dịch chuyển theo chiều thuận hay nghịch ?",
        acceptedAnswers: ["thuận", "chiều thuận"],
      },
      {
        key: "c",
        label: "Đó là chiều toả hay thu nhiệt ?",
        acceptedAnswers: ["thu nhiệt", "chiều thu nhiệt"],
      },
    ],
    hint: "Chú ý biến thiên enthalpy (ΔH) của phản ứng.",
    explanation:
      "Khi tăng nhiệt độ, cân bằng ưu tiên chiều thu nhiệt, tức chiều thuận; màu hồng đậm dần.",
  },
]

// Chuẩn hóa để bỏ qua dấu tiếng Việt, khoảng trắng và khác biệt chữ hoa/thường.
function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[.,;:!?()[\]{}]/g, "")
    .replace(/\s+/g, " ")
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export default function InteractiveVideoLesson({
  videoSource = VIDEO_SOURCE,
  videoQuestions = initialVideoQuestions,
  title = VIDEO_LESSON_TITLE,
  onComplete,
  completionContent,
}: {
  videoSource?: string
  videoQuestions?: VideoQuestion[]
  title?: string
  onComplete?: () => void
  completionContent?: ReactNode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoFrameRef = useRef<HTMLDivElement>(null)
  const successTimerRef = useRef<number | null>(null)
  const seekingGuardRef = useRef(false)
  const lastAllowedTimeRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [firstTryIds, setFirstTryIds] = useState<Set<string>>(new Set())
  const [attempts, setAttempts] = useState<Record<string, number>>({})
  const [fillValues, setFillValues] = useState<Record<string, string>>({})
  const [incorrectFields, setIncorrectFields] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const activeQuestion =
    activeIndex === null ? null : videoQuestions[activeIndex]

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current)
      }
    },
    [],
  )

  const openQuestion = (questionIndex: number) => {
    const video = videoRef.current
    const question = videoQuestions[questionIndex]
    if (!video || completedIds.has(question.id) || activeIndex !== null) return

    video.pause()
    if (Math.abs(video.currentTime - question.time) > 0.35) {
      seekingGuardRef.current = true
      video.currentTime = question.time
      window.setTimeout(() => {
        seekingGuardRef.current = false
      }, 0)
    }
    setFeedback(null)
    setIncorrectFields(new Set())
    setFillValues({})
    setActiveIndex(questionIndex)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    if (!seekingGuardRef.current && !video.seeking) {
      lastAllowedTimeRef.current = video.currentTime
      setCurrentTime(video.currentTime)
    }
    if (activeIndex !== null) return

    const nextIndex = videoQuestions.findIndex(
      (question) =>
        !completedIds.has(question.id) &&
        video.currentTime >= question.time - 0.08,
    )
    if (nextIndex >= 0) openQuestion(nextIndex)
  }

  const handleSeeking = () => {
    const video = videoRef.current
    if (!video || seekingGuardRef.current) return

    if (Math.abs(video.currentTime - lastAllowedTimeRef.current) > 0.35) {
      seekingGuardRef.current = true
      video.currentTime = lastAllowedTimeRef.current
      window.setTimeout(() => {
        seekingGuardRef.current = false
      }, 0)
    }
  }

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video || activeQuestion || showSummary) return
    if (video.paused) video.play().catch(() => undefined)
    else video.pause()
  }

  const toggleMuted = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const openFullscreen = () => {
    videoFrameRef.current?.requestFullscreen?.().catch(() => undefined)
  }

  const finishQuestion = (wasFirstTry: boolean) => {
    if (!activeQuestion) return
    const completedQuestion = activeQuestion

    setCompletedIds((current) => {
      const next = new Set(current)
      next.add(completedQuestion.id)
      return next
    })
    if (wasFirstTry) {
      setFirstTryIds((current) => {
        const next = new Set(current)
        next.add(completedQuestion.id)
        return next
      })
    }
    setFeedback("correct")

    successTimerRef.current = window.setTimeout(() => {
      setActiveIndex(null)
      setFeedback(null)
      videoRef.current?.play().catch(() => undefined)
    }, 2000)
  }

  const registerIncorrectAttempt = (fieldKeys: string[] = []) => {
    if (!activeQuestion) return
    setAttempts((current) => ({
      ...current,
      [activeQuestion.id]: (current[activeQuestion.id] ?? 0) + 1,
    }))
    setIncorrectFields(new Set(fieldKeys))
    setFeedback("incorrect")
  }

  const chooseAnswer = (answer: string) => {
    if (!activeQuestion || activeQuestion.type !== "choice") return
    const previousAttempts = attempts[activeQuestion.id] ?? 0
    if (answer === activeQuestion.correctAnswer) {
      setAttempts((current) => ({
        ...current,
        [activeQuestion.id]: previousAttempts + 1,
      }))
      finishQuestion(previousAttempts === 0)
    } else {
      registerIncorrectAttempt()
    }
  }

  const submitFillAnswers = () => {
    if (!activeQuestion || activeQuestion.type !== "fill") return
    const previousAttempts = attempts[activeQuestion.id] ?? 0
    const wrongKeys = activeQuestion.fields
      .filter((field) => {
        const studentAnswer = normalizeAnswer(fillValues[field.key] ?? "")
        return !field.acceptedAnswers.some(
          (answer) => normalizeAnswer(answer) === studentAnswer,
        )
      })
      .map((field) => field.key)

    if (wrongKeys.length === 0) {
      setAttempts((current) => ({
        ...current,
        [activeQuestion.id]: previousAttempts + 1,
      }))
      finishQuestion(previousAttempts === 0)
    } else {
      registerIncorrectAttempt(wrongKeys)
    }
  }

  const reviewLesson = () => {
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current)
    }
    setActiveIndex(null)
    setCompletedIds(new Set())
    setFirstTryIds(new Set())
    setAttempts({})
    setFeedback(null)
    setShowSummary(false)
    setFillValues({})
    setIncorrectFields(new Set())
    if (videoRef.current) {
      seekingGuardRef.current = true
      videoRef.current.currentTime = 0
      lastAllowedTimeRef.current = 0
      setCurrentTime(0)
      window.setTimeout(() => {
        seekingGuardRef.current = false
      }, 0)
      videoRef.current.play().catch(() => undefined)
    }
  }

  return (
    <div className="interactive-video-lesson">
      <div className="video-lesson-heading">
        <div>
          <span>BÀI GIẢNG VIDEO TƯƠNG TÁC</span>
          <h3>{title}</h3>
        </div>
        <div className="video-question-count">
          <strong>{completedIds.size}/{videoQuestions.length}</strong>
          <span>CÂU ĐÃ HOÀN THÀNH</span>
        </div>
      </div>

      <div className="video-frame" ref={videoFrameRef}>
        <video
          ref={videoRef}
          src={videoSource}
          preload="metadata"
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false)
            setShowSummary(true)
            onComplete?.()
          }}
          onClick={togglePlayback}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (
              ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
            ) {
              event.preventDefault()
            }
          }}
        >
          Trình duyệt của bạn không hỗ trợ phát video HTML5.
        </video>

        <div className="locked-video-controls">
          <button
            className={isPlaying ? "pause-control" : "play-control"}
            onClick={togglePlayback}
            aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
          >
            <i />
          </button>
          <div
            className="locked-progress"
            role="progressbar"
            aria-label="Tiến độ video, không thể tua"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
          >
            <i
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            className={isMuted ? "mute-control muted" : "mute-control"}
            onClick={toggleMuted}
            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            <i />
          </button>
          <button
            className="fullscreen-control"
            onClick={openFullscreen}
            aria-label="Mở toàn màn hình"
          >
            <i />
          </button>
        </div>

        {activeQuestion && (
          <div
            className="video-question-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-question-title"
          >
            <div className="video-question-card">
              <div className="question-meta">
                <span>CÂU {String(activeIndex! + 1).padStart(2, "0")}</span>
                <b>TẠM DỪNG TẠI {formatTime(activeQuestion.time)}</b>
              </div>
              <h4 id="video-question-title">{activeQuestion.question}</h4>

              {activeQuestion.image && (
                <figure className="video-question-figure">
                  <img
                    src={activeQuestion.image}
                    alt={activeQuestion.imageAlt ?? ""}
                    loading="lazy"
                  />
                </figure>
              )}

              {activeQuestion.type === "choice" ? (
                <div className="video-choice-list">
                  {activeQuestion.choices.map((choice) => (
                    <button
                      key={choice.key}
                      onClick={() => chooseAnswer(choice.key)}
                      disabled={feedback === "correct"}
                    >
                      <span>{choice.key}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="video-fill-list">
                  {activeQuestion.fields.map((field) => (
                    <label
                      key={field.key}
                      className={
                        incorrectFields.has(field.key) ? "field-incorrect" : ""
                      }
                    >
                      <span>{field.label}</span>
                      <input
                        type="text"
                        value={fillValues[field.key] ?? ""}
                        placeholder="Nhập từ còn thiếu…"
                        autoComplete="off"
                        disabled={feedback === "correct"}
                        onChange={(event) => {
                          setFillValues((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                          setFeedback(null)
                          setIncorrectFields((current) => {
                            const next = new Set(current)
                            next.delete(field.key)
                            return next
                          })
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") submitFillAnswers()
                        }}
                      />
                    </label>
                  ))}
                  <button
                    className="check-fill-button"
                    onClick={submitFillAnswers}
                    disabled={feedback === "correct"}
                  >
                    Kiểm tra đáp án
                  </button>
                  <p className="accent-note">
                    Hệ thống chấp nhận đáp án không dấu và các cách viết tương đương.
                  </p>
                </div>
              )}

              {feedback === "incorrect" &&
                activeQuestion.type === "fill" &&
                activeQuestion.hint && (
                  <div className="video-hint" role="note">
                      💡 <span>Gợi ý: {activeQuestion.hint}</span>
                  </div>
                )}

              {feedback && (
                <div
                  className={`video-feedback ${feedback}`}
                  role="status"
                  aria-live="polite"
                >
                  <div>{feedback === "correct" ? "✓" : "×"}</div>
                  <p>
                    <strong>
                      {feedback === "correct"
                        ? "Chính xác!"
                        : "Chưa đúng, thử lại nhé"}
                    </strong>
                    {feedback === "correct" && activeQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showSummary && (
          <div className="video-summary-overlay">
            {completionContent ? (
              <div className="video-completion-theory">
                {completionContent}
                <button onClick={reviewLesson}>Xem lại video</button>
              </div>
            ) : (
              <div className="video-summary-card">
                <span>HOÀN THÀNH BÀI GIẢNG</span>
                <div className="summary-score">
                  <strong>{firstTryIds.size}</strong>
                  <i>/</i>
                  <b>{videoQuestions.length}</b>
                </div>
                <h4>Số câu đúng ngay lần đầu</h4>
                <p>
                  Bạn đã hoàn thành toàn bộ video và trả lời tất cả câu hỏi bắt buộc.
                </p>
                <button onClick={reviewLesson}>Xem lại bài</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="video-timeline-info">
        <div className="timeline-track">
          {videoQuestions.map((question, index) => (
            <span
              key={question.id}
              className={completedIds.has(question.id) ? "completed" : ""}
              style={{
                left: `${duration > 0 ? (question.time / duration) * 100 : (index + 1) * 25}%`,
              }}
              title={`${completedIds.has(question.id) ? "Đã hoàn thành" : "Chưa hoàn thành"} • ${formatTime(question.time)}`}
            >
              {completedIds.has(question.id) ? "✓" : index + 1}
            </span>
          ))}
        </div>
        <p>
          Thanh tiến độ chỉ dùng để theo dõi. Video không cho phép tua hoặc nhảy thời gian.
        </p>
      </div>
    </div>
  )
}
