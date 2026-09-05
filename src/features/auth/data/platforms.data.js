// Animations
import {
  tvEmojiAnimation,
  bagEmojiAnimation,
  gcapEmojiAnimation,
  adminEmojiAnimation,
  teacherEmojiAnimation,
  statsBarEmojiAnimation,
  womantechnologistEmojiAnimation,
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
    name: "Qabul Qiluvchi",
    isCurrent: false,
    animationData: womantechnologistEmojiAnimation,
    href: "https://reception.studytrack.uz",
  },
  {
    name: "Monitor",
    isCurrent: false,
    animationData: tvEmojiAnimation,
    href: "https://monitor.studytrack.uz",
  },
  {
    // Oxirida turadi: qolganlari MBSI ning o'z panellari, bu esa
    // qo'shni platforma.
    //
    // ⚠️ SESSIYA UMUMIY EMAS: diagnostika alohida tizim (o'z serveri, o'z
    // bazasi, o'z JWT siri). MBSI tokeni u yerda ishlamaydi — foydalanuvchi
    // o'z login va paroli bilan kiradi. Bu qator shunchaki KIRISH YO'LI.
    name: "Diagnostika o'quvchisi",
    isCurrent: false,
    animationData: statsBarEmojiAnimation,
    href: "https://diagnostika.abdukarimovs.uz",
  },
];

export default platforms;
