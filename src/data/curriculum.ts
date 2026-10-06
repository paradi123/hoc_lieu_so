import type { IconName } from "../components/common/Icon"

export type MiniSection = {
  id: string
  label: string
  icon: IconName
}

export type MainSection = MiniSection & {
  children?: MiniSection[]
}

export const sections: MainSection[] = [
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
  { id: "luyen-tap", label: "Luyện tập", icon: "quiz" },
  { id: "van-dung", label: "Vận dụng", icon: "spark" },
]
