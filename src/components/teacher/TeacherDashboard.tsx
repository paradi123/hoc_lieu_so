import { useState } from "react"
import type { VideoQuestion } from "../../InteractiveVideoLesson"
import type { ProgressRecord, Question } from "../../types/lesson"
import Icon from "../common/Icon"

export interface TeacherDashboardProps {
  questions: Question[]
  progressRecords: ProgressRecord[]
  videoQuestions: VideoQuestion[]
  videoSource: string
  onSaveQuestions: (questions: Question[]) => void
  onSaveVideoQuestions: (questions: VideoQuestion[]) => void
  onSaveVideoSource: (source: string) => void
  onExit: () => void
}

export default function TeacherDashboard({
  questions,
  progressRecords,
  videoQuestions,
  videoSource,
  onSaveQuestions,
  onSaveVideoQuestions,
  onSaveVideoSource,
  onExit,
}: TeacherDashboardProps) {
  const [draftQuestions, setDraftQuestions] = useState(questions)
  const [draftVideoQuestions, setDraftVideoQuestions] = useState(videoQuestions)
  const [videoSaved, setVideoSaved] = useState(false)
  const [videoFileName, setVideoFileName] = useState(
    videoSource.startsWith("data:")
      ? "Video đã tải lên"
      : "bai-1-anh-huong-nhiet-do.mp4",
  )
  const [saved, setSaved] = useState(false)
  const studentCount = new Set(
    progressRecords.map((record) => record.studentName),
  ).size
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

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    text: string,
  ) => {
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
        questionIndex === index
          ? { ...question, ...update } as VideoQuestion
          : question,
      ),
    )
    setVideoSaved(false)
  }

  const changeVideoQuestionType = (index: number, type: "choice" | "fill") => {
    setDraftVideoQuestions((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index || question.type === type) return question
        if (type === "choice") {
          const answer =
            question.type === "fill"
              ? question.fields[0]?.acceptedAnswers[0] || "Đáp án"
              : "Đáp án đúng"
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
          fields: [
            {
              key: "answer",
              label: "Đáp án",
              acceptedAnswers:
                question.type === "choice"
                  ? [question.choices[0]?.text || ""]
                  : [""],
            },
          ],
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
            <span className="teacher-local-note">
              Dữ liệu lưu trên trình duyệt này
            </span>
          </div>
          {progressRecords.length === 0 ? (
            <div className="teacher-empty-state">
              Chưa có lượt hoàn thành nào. Học sinh sẽ xuất hiện ở đây sau khi
              xem kết quả.
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
                    const percentage = Math.round(
                      (record.score / record.total) * 100,
                    )
                    return (
                      <tr key={record.id}>
                        <td>{record.studentName}</td>
                        <td>
                          <strong>
                            {record.score}/{record.total}
                          </strong>
                        </td>
                        <td>
                          <span className="progress-result">{percentage}%</span>
                        </td>
                        <td>
                          {new Date(record.completedAt).toLocaleString("vi-VN")}
                        </td>
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
              <Icon name="check" size={16} />{" "}
              {videoSaved ? "Đã lưu" : "Lưu cấu hình video"}
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
                <div className="video-editor-index">
                  CÂU {String(index + 1).padStart(2, "0")}
                </div>
                <label>
                  Xuất hiện tại (giây)
                  <input
                    type="number"
                    min="0"
                    value={videoQuestion.time}
                    onChange={(event) =>
                      updateVideoQuestion(index, {
                        time: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Loại câu hỏi
                  <select
                    value={videoQuestion.type}
                    onChange={(event) =>
                      changeVideoQuestionType(
                        index,
                        event.target.value as "choice" | "fill",
                      )
                    }
                  >
                    <option value="choice">Trắc nghiệm</option>
                    <option value="fill">Điền đáp án</option>
                  </select>
                </label>
                <label className="video-editor-question">
                  Nội dung hiển thị
                  <input
                    value={videoQuestion.question}
                    onChange={(event) =>
                      updateVideoQuestion(index, {
                        question: event.target.value,
                      })
                    }
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
              <Icon name="check" size={16} />{" "}
              {saved ? "Đã lưu" : "Lưu thay đổi"}
            </button>
          </div>
          <div className="question-editor-list">
            {draftQuestions.map((question, questionIndex) => (
              <article className="question-editor-card" key={questionIndex}>
                <div className="editor-card-label">
                  CÂU {String(questionIndex + 1).padStart(2, "0")}
                </div>
                <label>
                  Nội dung câu hỏi
                  <textarea
                    value={question.question}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        question: event.target.value,
                      })
                    }
                    rows={2}
                  />
                </label>
                <div className="answer-editor-grid">
                  {question.answers.map((answer, answerIndex) => (
                    <label key={answerIndex}>
                      Đáp án {String.fromCharCode(65 + answerIndex)}
                      <input
                        value={answer}
                        onChange={(event) =>
                          updateAnswer(
                            questionIndex,
                            answerIndex,
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
                <div className="editor-bottom-row">
                  <label>
                    Đáp án đúng
                    <select
                      value={question.correct}
                      onChange={(event) =>
                        updateQuestion(questionIndex, {
                          correct: Number(event.target.value),
                        })
                      }
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
                      onChange={(event) =>
                        updateQuestion(questionIndex, {
                          explanation: event.target.value,
                        })
                      }
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
