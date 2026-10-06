import type { Question } from "../types/lesson"

export const initialQuestions: Question[] = [
  {
    question: "Cân bằng hóa học liên quan đến loại phản ứng",
    answers: [
      "không thuận nghịch.",
      "thuận nghịch.",
      "một chiều.",
      "oxi hóa – khử.",
    ],
    correct: 1,
    explanation:
      "Cân bằng hóa học chỉ xảy ra với phản ứng thuận nghịch.",
  },
  {
    question:
      "Điền vào khoảng trống trong câu sau bằng cụm từ thích hợp: \"Cân bằng hóa học là trạng thái của phản ứng thuận nghịch khi tốc độ phản ứng thuận... tốc độ phản ứng nghịch\".",
    answers: ["lớn hơn", "bằng", "nhỏ hơn", "khác"],
    correct: 1,
    explanation:
      "Tại trạng thái cân bằng, tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch.",
  },
  {
    question: "Khi phản ứng thuận nghịch ở trạng thái cân bằng thì nó",
    answers: [
      "không xảy ra nữa",
      "vẫn tiếp tục xảy ra.",
      "chỉ xảy ra theo chiều thuận.",
      "chỉ xảy ra theo chiều nghịch.",
    ],
    correct: 1,
    explanation:
      "Cân bằng hóa học là cân bằng động: phản ứng thuận và nghịch vẫn xảy ra nhưng với tốc độ bằng nhau.",
  },
  {
    question: "Đối với một hệ ở trạng thái cân bằng, nếu thêm vào chất xúc tác thì:",
    answers: [
      "Chỉ làm tăng tốc độ phản ứng thuận",
      "Chỉ làm tăng tốc độ phản ứng nghịch",
      "Làm tăng tốc độ phản ứng thuận và nghịch với số lần như nhau.",
      "Không làm tăng tốc độ của phản ứng thuận và nghịch",
    ],
    correct: 2,
    explanation:
      "Chất xúc tác làm tăng đồng thời tốc độ phản ứng thuận và nghịch với cùng số lần, không làm chuyển dịch cân bằng.",
  },
  {
    question: "Phản ứng thuận nghịch là phản ứng",
    answers: [
      "trong cùng điều kiện, phản ứng xảy ra theo hai chiều trái ngược nhau.",
      "có phương trình hóa học được biểu diễn bằng mũi tên một chiều.",
      "chỉ xảy ra theo một chiều nhất định.",
      "xảy ra giữa hai chất khí.",
    ],
    correct: 0,
    explanation:
      "Phản ứng thuận nghịch xảy ra theo hai chiều ngược nhau trong cùng điều kiện.",
  },
  {
    question:
      "Sự dịch chuyển cân bằng hóa học là sự di chuyển từ trạng thái cân bằng hóa học này sang trạng thái cân bằng hóa học khác do",
    answers: [
      "không cần có tác động của các yếu tố từ bên ngoài tác động lên cân bằng.",
      "tác động của các yếu tố từ bên ngoài tác động lên cân bằng.",
      "tác động của các yếu tố từ bên trong tác động lên cân bằng.",
      "cân bằng hóa học tác động lên các yếu tố bên ngoài.",
    ],
    correct: 1,
    explanation:
      "Sự dịch chuyển cân bằng xảy ra do tác động của các yếu tố bên ngoài như nồng độ, nhiệt độ, áp suất.",
  },
  {
    question: "Các yếu tố ảnh hưởng đến cân bằng hóa học là:",
    answers: [
      "nồng độ, nhiệt độ và chất xúc tác.",
      "nồng độ, áp suất và diện tích bề mặt.",
      "nồng độ, nhiệt độ và áp suất.",
      "áp suất, nhiệt độ và chất xúc tác.",
    ],
    correct: 2,
    explanation:
      "Ba yếu tố làm chuyển dịch cân bằng: nồng độ, nhiệt độ và áp suất. Chất xúc tác không làm chuyển dịch cân bằng.",
  },
  {
    question:
      "Sự dịch chuyển cân bằng hóa học là sự di chuyển từ trạng thái cân bằng hóa học này sang trạng thái cân bằng hóa học khác do",
    answers: [
      "không cần có tác động của các yếu tố từ bên ngoài tác động lên cân bằng.",
      "tác động của các yếu tố từ bên ngoài tác động lên cân bằng.",
      "tác động của các yếu tố từ bên trong tác động lên cân bằng.",
      "cân bằng hóa học tác động lên các yếu tố bên ngoài.",
    ],
    correct: 1,
    explanation:
      "Sự dịch chuyển cân bằng xảy ra do tác động của các yếu tố bên ngoài.",
  },
  {
    question: "Đối với một hệ ở trạng thái cân bằng, nếu thêm chất xúc tác thì:",
    answers: [
      "Chỉ làm tăng tốc độ phản ứng thuận.",
      "Chỉ làm tăng tốc độ phản ứng nghịch.",
      "Làm tăng tốc độ phản ứng thuận và phản ứng nghịch như nhau.",
      "Không làm tăng tốc độ phản ứng thuận và phản ứng nghịch.",
    ],
    correct: 2,
    explanation:
      "Chất xúc tác tăng đồng thời tốc độ phản ứng thuận và nghịch như nhau.",
  },
  {
    question: "Phát biểu nào sau đây đúng?",
    answers: [
      "Bất cứ phản ứng nào cũng phải đạt đến trạng thái cân bằng hóa học.",
      "Khi phản ứng thuận nghịch ở trạng thái cân bằng thì phản ứng dừng lại.",
      "Chỉ có những phản ứng thuận nghịch mới có trạng thái cân bằng hóa học.",
      "Ở trạng thái cân bằng, khối lượng các chất ở 2 vế của phương trình phản ứng phải bằng nhau.",
    ],
    correct: 2,
    explanation:
      "Chỉ có phản ứng thuận nghịch mới có trạng thái cân bằng hóa học.",
  },
  {
    question:
      "Sự phá vỡ cân bằng cũ để chuyển sang một cân bằng mới do các yếu tố bên ngoài tác động được gọi là",
    answers: [
      "sự biến đổi chất.",
      "sự dịch chuyển cân bằng.",
      "sự chuyển đổi vận tốc phản ứng.",
      "sự biến đổi hằng số cân bằng.",
    ],
    correct: 1,
    explanation:
      "Định nghĩa sự dịch chuyển cân bằng: chuyển từ cân bằng này sang cân bằng khác do yếu tố bên ngoài.",
  },
  {
    question:
      "Điền vào khoảng trống bằng cụm từ thích hợp: \"Cân bằng hóa học là cân bằng …(1) … vì tại cân bằng phản ứng …(2) …\"",
    answers: [
      "(1) tĩnh; (2) dừng lại.",
      "(1) động; (2) dừng lại.",
      "(1) tĩnh; (2) tiếp tục xảy ra.",
      "(1) động; (2) tiếp tục xảy ra.",
    ],
    correct: 3,
    explanation:
      "Cân bằng hóa học là cân bằng động vì phản ứng thuận nghịch vẫn tiếp tục xảy ra ở trạng thái cân bằng.",
  },
]