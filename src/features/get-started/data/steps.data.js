import timeAnimation from "@/shared/assets/animations/time.json";
import folderAnimation from "@/shared/assets/animations/folder.json";
import statsAnimation from "@/shared/assets/animations/stats-bar.json";
import greetingAnimation from "@/shared/assets/animations/greeting.json";

const stepsData = [
  {
    number: 1,
    title: "Xush kelibsiz!",
    description: `Platformada o'quvchi baholari va statistikalarini qulay va tez kuzating.`,
    animationData: greetingAnimation,
    button: "Boshlash",
  },
  {
    number: 2,
    title: "Baholarni Nazorat Qiling",
    description: `Fanlar bo'yicha baholarni ko'ring va umumiy o'zlashtirish darajasini bir joyda boshqaring.`,
    animationData: folderAnimation,
    button: "Keyingi",
  },
  {
    number: 3,
    title: "Statistikani Tahlil Qiling",
    description: `Natijalar o'sishini grafik va ko'rsatkichlar orqali kuzating hamda rivojlanishni baholang.`,
    animationData: statsAnimation,
    button: "Keyingi",
  },
  {
    number: 4,
    title: "Real Vaqt Nazorati",
    description: `Barcha ma'lumotlarni real vaqt rejimida tekshiring va ta'lim jarayonini nazorat ostida saqlang.`,
    animationData: timeAnimation,
    button: "Yakunlash",
  },
];

export default stepsData;
