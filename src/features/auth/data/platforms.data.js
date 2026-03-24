// Animations
import {
  tvEmojiAnimation,
  bagEmojiAnimation,
  gcapEmojiAnimation,
  adminEmojiAnimation,
  teacherEmojiAnimation,
} from "@/shared/assets/animations";

const platforms = [
  {
    name: "Admin",
    isCurrent: true,
    animationData: adminEmojiAnimation,
  },
  {
    name: "O'qituvchi",
    isCurrent: false,
    animationData: teacherEmojiAnimation,
    href: "https://teacher.studytrack.uz",
  },
  {
    name: "O'quvchi",
    isCurrent: false,
    animationData: gcapEmojiAnimation,
    href: "https://student.studytrack.uz",
  },
  {
    name: "Ishchi",
    isCurrent: false,
    animationData: bagEmojiAnimation,
    href: "https://worker.studytrack.uz",
  },
  {
    name: "Monitor",
    isCurrent: false,
    animationData: tvEmojiAnimation,
    href: "https://monitor.studytrack.uz",
  },
];

export default platforms;
