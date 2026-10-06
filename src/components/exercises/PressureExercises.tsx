import { useEffect, useState } from "react"

function PressureBlank({
  blank,
  values,
  checked,
  onChange,
}: {
  blank: {
    id: string
    before: string
    after: string
    options: string[]
    answer: string
  }
  values: Record<string, string>
  checked: boolean
  onChange: (id: string, value: string) => void
}) {
  const value = values[blank.id]
  return (
    <p className="analysis-line observation-line">
      <span>{blank.before} </span>
      <select
        className={`analysis-select${
          checked
            ? value === blank.answer
              ? " analysis-correct"
              : " analysis-incorrect"
            : ""
        }`}
        value={value || ""}
        onChange={(event) => onChange(blank.id, event.target.value)}
        aria-label={blank.before}
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
    </p>
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
    <section
      className="analysis-exercise pressure-exercise"
      aria-labelledby="pressure-exercise-title"
    >
      <div className="exercise-heading">
        <div>
          <h3 id="pressure-exercise-title">Cho hệ cân bằng trong xi-lanh</h3>
        </div>
        <button className="exercise-reset" onClick={() => setValues({})}>
          Làm lại
        </button>
      </div>
      <div className="pressure-equation">
        <strong>2NO₂(g)</strong>
        <span>⇌</span>
        <strong>N₂O₄(g)</strong>
      </div>
      <p className="pressure-colors">
        <span>(màu nâu đỏ)</span>
        <span>(không màu)</span>
      </p>
      <div className="pressure-answer-lines">
        {blanks.map((blank) => (
          <div className="analysis-line" key={blank.id}>
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
              aria-label={blank.before}
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
      before:
        "Sau khi giữ yên pít-tông, màu nâu đỏ nhạt dần chứng tỏ lượng khí NO₂ đã",
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
    <section
      className="analysis-exercise pressure-exercise"
      aria-labelledby="pressure-observation-title"
    >
      <div className="exercise-heading">
        <div>
          <h3 id="pressure-observation-title">
            Dựa vào diễn biến thí nghiệm, hãy điền vào chỗ trống
          </h3>
        </div>
        <button className="exercise-reset" onClick={() => setValues({})}>
          Làm lại
        </button>
      </div>
      <div className="observation-phase">
        <h4>
          Giai đoạn 1: Ngay khi đẩy pít-tông xuống{" "}
          <span>(thể tích giảm, áp suất tăng)</span>
        </h4>
        <p className="observation-note">
          Hiện tượng: Màu nâu đỏ đột ngột đậm lên rất rõ.
        </p>
        <PressureBlank
          blank={blanks[0]}
          values={values}
          checked={checked}
          onChange={(id, value) => {
            setValues((current) => ({ ...current, [id]: value }))
          }}
        />
        <PressureBlank
          blank={blanks[1]}
          values={values}
          checked={checked}
          onChange={(id, value) => {
            setValues((current) => ({ ...current, [id]: value }))
          }}
        />
      </div>
      <div className="observation-phase">
        <h4>
          Giai đoạn 2: Sau khi giữ yên pít-tông một thời gian{" "}
          <span>(hệ tự điều chỉnh)</span>
        </h4>
        <p className="observation-note">
          Hiện tượng: Màu nâu đỏ của hỗn hợp khí từ từ nhạt dần đi.
        </p>
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

export default function PressureExercises() {
  const [checked, setChecked] = useState(false)
  const [questionOneCorrect, setQuestionOneCorrect] = useState(false)
  const [questionTwoCorrect, setQuestionTwoCorrect] = useState(false)
  const [conclusionAnswer, setConclusionAnswer] = useState("")
  const conclusionCorrect = conclusionAnswer === "giảm"
  const allCorrect =
    questionOneCorrect && questionTwoCorrect && conclusionCorrect

  return (
    <>
      <PressureExercise
        checked={checked}
        onValidityChange={setQuestionOneCorrect}
      />
      <PressureObservationExercise
        checked={checked}
        onValidityChange={setQuestionTwoCorrect}
      />
      <section className="pressure-conclusion-check">
        <div className="pressure-conclusion-exercise">
          <h3>Kết luận</h3>
          <p>
            Khi đẩy pít-tông xuống (làm tăng áp suất chung của hệ), hệ cân bằng
            đã tự dịch chuyển theo chiều thuận. Chiều này trùng với chiều làm
            <select
              className={`analysis-select${
                checked
                  ? conclusionCorrect
                    ? " analysis-correct"
                    : " analysis-incorrect"
                  : ""
              }`}
              value={conclusionAnswer}
              onChange={(event) => {
                setConclusionAnswer(event.target.value)
                setChecked(false)
              }}
              aria-label="Từ điền vào phần kết luận"
            >
              <option value="" disabled>
                Chọn đáp án
              </option>
              <option value="tăng">tăng</option>
              <option value="giảm">giảm</option>
            </select>{" "}
            số mol khí trong bình.
          </p>
          <p>(Tương tự với trường hợp kéo pít-tông lên.)</p>
        </div>
        <button className="exercise-check" onClick={() => setChecked(true)}>
          Kiểm tra cả 3 phần
        </button>
        <p
          className={`exercise-feedback${
            checked && allCorrect ? " correct" : ""
          }`}
        >
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
              giảm áp suất, tức là chiều làm giảm số mol khí và ngược lại. Đối
              với phản ứng thuận nghịch có tổng số mol khí ở hai vế bằng nhau,
              cân bằng không bị chuyển dịch khi thay đổi áp suất chung.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
export { PressureExercises }
