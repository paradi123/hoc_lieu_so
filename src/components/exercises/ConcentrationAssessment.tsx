import { useEffect, useState } from "react"

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
  const allCorrect = answers.every(
    (answer) => placements[answer.id] === answer.id,
  )
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
    <section
      className="concentration-exercise"
      aria-labelledby="concentration-exercise-title"
    >
      <div className="exercise-heading">
        <div>
          <h3 id="concentration-exercise-title">
            Quan sát thí nghiệm và điền thông tin vào bảng
          </h3>
        </div>
        <button className="exercise-reset" onClick={reset}>
          Làm lại
        </button>
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
              className={`answer-chip${
                placedAnswerIds.has(answer.id) ? " placed" : ""
              }`}
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

function AnalysisBlank({
  blank,
  value,
  checked,
  onChange,
}: {
  blank: {
    id: string
    prompt: string
    options: string[]
    suffix: string
    answer: string
  }
  value?: string
  checked: boolean
  onChange: (value: string) => void
}) {
  const resultClass = checked
    ? value === blank.answer
      ? " analysis-correct"
      : " analysis-incorrect"
    : ""
  return (
    <div className="analysis-line">
      <span>{blank.prompt} </span>
      <select
        className={`analysis-select${resultClass}`}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Đáp án cho ${blank.prompt}`}
      >
        <option value="" disabled>
          Chọn đáp án
        </option>
        {blank.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span> {blank.suffix}</span>
    </div>
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
    {
      id: "increase-reactant",
      prompt: "Khi thêm tinh thể CH₃COONa, chúng ta đã làm",
      options: ["tăng", "giảm"],
      suffix: "nồng độ của chất tham gia phản ứng.",
      answer: "tăng",
    },
    {
      id: "tube-2-product",
      prompt:
        "Màu hồng ở ống 2 trở nên đậm hơn chứng tỏ nồng độ chất nào ở vế phải tăng lên?",
      options: ["NaOH", "CH₃COOH"],
      suffix: "",
      answer: "NaOH",
    },
    {
      id: "tube-2-direction",
      prompt: "Điều này cho thấy cân bằng của hệ đã chuyển dịch theo",
      options: ["chiều thuận", "chiều nghịch"],
      suffix: "để tiêu bớt lượng CH₃COONa vừa thêm vào.",
      answer: "chiều thuận",
    },
    {
      id: "increase-product",
      prompt: "Khi thêm dung dịch CH₃COOH, chúng ta đã làm",
      options: ["tăng", "giảm"],
      suffix: "nồng độ của một chất sản phẩm.",
      answer: "tăng",
    },
    {
      id: "tube-3-naoh",
      prompt:
        "Màu hồng ở ống 3 bị nhạt đi hoặc mất màu chứng tỏ nồng độ NaOH đã",
      options: ["tăng lên", "giảm đi"],
      suffix: ".",
      answer: "giảm đi",
    },
    {
      id: "tube-3-direction",
      prompt: "Điều này cho thấy cân bằng của hệ đã chuyển dịch theo",
      options: ["chiều thuận", "chiều nghịch"],
      suffix: "để tiêu bớt lượng CH₃COOH vừa được thêm vào.",
      answer: "chiều nghịch",
    },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const allCorrect = blanks.every((blank) => values[blank.id] === blank.answer)
  useEffect(() => onValidityChange(allCorrect), [allCorrect, onValidityChange])

  return (
    <section
      className="analysis-exercise"
      aria-labelledby="analysis-exercise-title"
    >
      <div className="exercise-heading">
        <div>
          <h3 id="analysis-exercise-title">
            Điền từ thích hợp hoặc chọn phương án đúng
          </h3>
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
        Dựa vào hiện tượng màu sắc thu được từ bảng trên, hãy phân tích bản chất
        chuyển dịch của hệ.
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
      before:
        "Khi ta tăng nồng độ của một chất (tham gia hoặc sản phẩm), cân bằng sẽ chuyển dịch theo chiều làm",
      after: "nồng độ chất đó (tức là chiều phản ứng tiêu thụ bớt chất đó).",
      options: ["tăng", "giảm"],
      answer: "giảm",
    },
    {
      id: "decrease-concentration",
      before:
        "Ngược lại, khi ta giảm nồng độ của một chất, cân bằng sẽ chuyển dịch theo chiều làm",
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
    <section
      className="analysis-exercise rule-exercise"
      aria-labelledby="rule-exercise-title"
    >
      <div className="exercise-heading">
        <div>
          <h3 id="rule-exercise-title">
            Khái quát quy luật ảnh hưởng của nồng độ
          </h3>
        </div>
        <button className="exercise-reset" onClick={reset}>
          Làm lại
        </button>
      </div>
      <p className="analysis-instruction">
        Từ các phân tích trên, hãy điền từ thích hợp để khái quát quy luật chung
        về ảnh hưởng của nồng độ đến chiều chuyển dịch cân bằng hóa học.
      </p>
      <div className="rule-list">
        {blanks.map((blank, index) => (
          <div className="rule-item" key={blank.id}>
            <span className="rule-bullet">•</span>
            <span>{blank.before} </span>
            <select
              className={`analysis-select${
                checked
                  ? values[blank.id] === blank.answer
                    ? " analysis-correct"
                    : " analysis-incorrect"
                  : ""
              }`}
              value={values[blank.id] || ""}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  [blank.id]: event.target.value,
                }))
              }}
              aria-label={`Đáp án quy luật ${index + 1}`}
            >
              <option value="" disabled>
                Chọn đáp án
              </option>
              {blank.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span> {blank.after}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ConcentrationAssessment({
  onComplete,
}: {
  onComplete?: () => void
}) {
  const [exercisesChecked, setExercisesChecked] = useState(false)
  const [tableCorrect, setTableCorrect] = useState(false)
  const [analysisCorrect, setAnalysisCorrect] = useState(false)
  const [ruleCorrect, setRuleCorrect] = useState(false)

  const allExercisesCorrect = tableCorrect && analysisCorrect && ruleCorrect

  useEffect(() => {
    if (exercisesChecked && allExercisesCorrect && onComplete) {
      onComplete()
    }
  }, [exercisesChecked, allExercisesCorrect, onComplete])

  return (
    <div className="concentration-assessment-module">
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
        <button
          className="exercise-check"
          onClick={() => setExercisesChecked(true)}
        >
          Kiểm tra cả 3 phần
        </button>
        <p
          className={`exercise-feedback${
            exercisesChecked && allExercisesCorrect ? " correct" : ""
          }`}
        >
          {!exercisesChecked
            ? "Hoàn thành cả ba phần rồi bấm nút kiểm tra."
            : allExercisesCorrect
              ? "Chính xác! Em đã hoàn thành cả ba phần."
              : "Một số đáp án chưa đúng. Hãy kiểm tra lại các phần được đánh dấu."}
        </p>
        {exercisesChecked && allExercisesCorrect && (
          <div className="concentration-theory-reveal">
            Khi tăng nồng độ một chất trong phản ứng thì cân bằng hóa học bị phá
            vỡ và chuyển dịch theo chiều làm giảm nồng độ của chất đó, và ngược
            lại.
          </div>
        )}
      </section>
    </div>
  )
}
export { ConcentrationAssessment }
