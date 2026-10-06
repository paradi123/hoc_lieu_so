import type { Question } from "../types/lesson"

export const initialQuestions: Question[] = [
  {
    question: "Phản ứng thuận nghịch là phản ứng?",
    answers: [
      "Chỉ xảy ra theo một chiều nhất định.",
      "Xảy ra giữa hai chất khí.",
      "Xảy ra theo hai chiều ngược nhau trong cùng điều kiện.",
      "Có phương trình hoá học được biểu diễn bằng mũi tên một chiều.",
    ],
    correct: 2,
    explanation:
      "Phản ứng thuận nghịch có thể diễn ra đồng thời theo chiều thuận và chiều nghịch trong cùng điều kiện.",
  },
  {
    question:
      "Yếu tố nào sau đây luôn luôn không làm dịch chuyển cân bằng của hệ phản ứng?",
    answers: ["Nhiệt độ.", "Áp suất.", "Nồng độ.", "Chất xúc tác."],
    correct: 3,
    explanation:
      "Chất xúc tác làm tăng đồng thời tốc độ phản ứng thuận và nghịch, giúp hệ nhanh đạt cân bằng nhưng không làm cân bằng chuyển dịch.",
  },
]
