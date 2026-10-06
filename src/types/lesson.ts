export type Question = {
  question: string
  answers: string[]
  correct: number
  explanation: string
}

export type ProgressRecord = {
  id: string
  studentName: string
  score: number
  total: number
  completedAt: string
}
