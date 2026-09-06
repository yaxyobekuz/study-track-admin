/**
 * BIR EKRANLI REJIM SHARTI — YAGONA MANBA.
 *
 * Shart IKKI joyda kerak va ular bir-biriga zid bo'lsa sahifa buziladi:
 *   1. CSS — `tailwind.config.js` dagi `fitscreen` ekrani (sahifani
 *      viewportga qulflaydi: `h-[calc(100dvh-72px)] overflow-hidden`);
 *   2. JS — `useMediaQuery(FIT_QUERY)`, u `useFitRows` o'lchovi
 *      ISHLATILADIMI yo'qmi shuni hal qiladi.
 *
 * Nima uchun JS ham biladi: oddiy oqimda (rejimdan tashqarida) konteyner
 * balandligi KONTENTDAN kelib chiqadi — o'lchangan son qatorni
 * kamaytiradi, kamaygan ro'yxat konteynerni yana pasaytiradi va ro'yxat
 * o'z-o'zini yeb `min` gacha qisqarib qolardi. Rejimni baribir MEDIA
 * SO'ROVI belgilaydi, JS faqat natijani ishlatish/ishlatmaslikni.
 *
 * ⚠️ MATN `tailwind.config.js` DAGI `raw` BILAN AYNAN BIR XIL bo'lishi
 * shart. Shuning uchun u konstanta sifatida shu yerda yotadi va
 * komponentlarda qayta yozilmaydi — ikki nusxa bir kun ajralib ketardi.
 *
 * ⚠️ BALANDLIK CHEGARASI 960px — O'LCHANGAN qiymat, taxmin emas.
 * Chrome'da, haqiqiy CSS bilan, AYNAN 1280x960 da (ya'ni chegaraning
 * o'zida, "1080p da sig'yapti" degan qulay nuqtada emas) olingan
 * qat'iy xarajatlar. IXCHAMLASHDAN KEYINGI raqamlar (fitscreen'da
 * sarlavha paneli `p-2.5`, KPI kartasi `p-2.5`, `DashboardCard`
 * `dense` da `p-3` + 27.6px sarlavha bloki + `pb-2` + 1px chiziq,
 * `CardLink` 30px):
 *
 *   72   sahifa qobig'idan tashqaridagi qism (layout padding + tablar)
 *   58   sarlavha paneli (ilgari 66: `p-3.5` → `p-2.5`)
 *   81.1 KPI qatori (ilgari 85.5: qiymat `text-xl leading-tight` (25px)
 *        → `T.valueKpi` 22px `leading-none` — matn ustuni 39 → 36px va
 *        endi ikonka bilan teng; pastki satr 10 → 10.5px (+0.6). Ustiga
 *        reja progress chizig'i 6px = 3px oraliq + 3px chiziq; to'r
 *        qatori `stretch`, ya'ni chiziqsiz kartalar ham shu balandlikda).
 *        ⚠️ O'zgarish nishoni `shrink-0 whitespace-nowrap` — usiz 1280px
 *        da "+0.11 p.p." ikki qatorga bo'linib, qator 98px bo'lardi.
 *   32   to'rt bo'shliq (`gap-2`: 8 + 8 sahifada, 8 + 8 to'r ichida)
 *   ─────
 *   243.1 → bitta karta qatori = (960 − 243.1) / 3 = 239.0
 *   (1920×965 da: 240.6)
 *
 * Kartaning o'z ramkasi 90.6px (ilgari 90.3: 24 padding + 27.6 sarlavha
 * bloki (12.5px bold `leading-tight` 15.6 + izoh 12) + 8 sarlavha
 * ostidagi `pb-2` + 1 chiziq (`border-b`, dizayn tizimi
 * `SURFACE.cardHeader`) + 30 pastki havola; tananing o'z `mt` i endi
 * YO'Q — bo'shliqni sarlavhaning `pb-2` si beradi), ya'ni CHEGARADA
 * o'lchanadigan maydon = 148.3px (ilgari 147.2); 1920×965 da 150.0px.
 * Maqsad ≥ 145px — bajarildi.
 * ⚠️ `leading-tight` `DashboardCard` da O'LCHAM tokenidan KEYIN turadi:
 * oldin tursa twMerge uni o'chirib, sarlavha 18.75px bo'lib bloki 3px
 * o'sardi (o'lchangan: 39.8 → 36.6).
 * ⚠️ Sarlavha paneli 58px FAQAT bir qatorda tursa: "Jonli" indikatori
 * shuning uchun `2xl` dan boshlab chiziladi (1280px da panel 106px
 * bo'lib, AI tahlil 1+1 ga tushardi).
 *
 * ⚠️ `bodyClassName` bilan `mt-3 fitscreen:mt-2` beradigan karta bu
 * bo'shliqni IKKI MARTA olib, ramkasini 99.3px qilardi — shuning uchun
 * `DashboardCard` `dense` da tana margin'ini `bodyClassName` dan KEYIN
 * `mt-0` bilan STRUKTURAVIY bosadi; kartalar bergan `mt-*` hisobga
 * kirmaydi.
 *
 * ⚠️ Kirish animatsiyasi (`animate-fade-up`, `animate-grow-x`) faqat
 * `transform`/`opacity` — bu hisobga TA'SIR QILMAYDI: o'lchov
 * animatsiya paytida ham yakuniy layout'ni ko'radi. Karta `ring` va
 * soyasi (`SURFACE.card`) box-shadow — balandlikka qo'shilmaydi.
 *
 * ⚠️ HAR BIR KARTA shu 148.3px ga sig'ishi tekshirilgan — chegara
 * BITTA kartadan chiqarilmaydi. Ilgari hisob faqat "Sinflar bo'yicha
 * natija" jadvalidan olingan edi va yonidagi ikki karta undan ko'proq
 * talab qilib, 960-1044px oralig'ida jimgina kesib ko'rsatardi.
 * O'lchangan talablar (yon panel ochiq, karta kengligi 314.7px):
 *
 *   Sinflar bo'yicha natija   36.5 sarlavha + 26 JAMI + 3×26 = 140.5 (3 bosqich)
 *   Top 5 o'quvchi            36.5 sarlavha + 4×26           = 140.5 (4 qator)
 *   O'qituvchilar KPI         36.5 sarlavha + 4×26           = 140.5 (4 qator)
 *   To'garaklar (2×2)         2×64 + 8 oraliq                = 136
 *   Olimpiada                 76 plitkalar + 20 ajratuvchi + 28 = 124 (1 yutuq)
 *   AI tahlil                 57 xulosa + 19 yorliq + 55 vazifa = 131 (1 + 1)
 *
 * (O'lchangan, 1280×960, yon panel ochiq, karta 325.3px: sahifa
 * surilmaydi, karta ichida surgich yo'q, kesilgan element yo'q.)
 * Eng talabchani endi jadvallar (140.5, zaxira 7.8px).
 * ⚠️ AI tahlil kartasi bu ro'yxatda BOSHQACHA o'qiladi: uning ikki
 * plitkasi qat'iy balandlikda emas, qoldiq joyni to'ldiradi (`flex-1`),
 * ya'ni 131px — TALAB emas, eng KAM zarur balandlik (matni kesilmasdan
 * ko'rinishi uchun). Undan ortiq joy plitkalarga havo bo'lib qo'shiladi.
 * Karta bittadan yozuv ko'rsatadi (`InsightsCard` → `INSIGHT_LIMIT`) va
 * `useFitRows` ni ISHLATMAYDI.
 *
 * ⚠️ Jadval sarlavhasi 36.5 —
 * FAQAT so'zlar ustunga sig'sa: tor kartada (xl..2xl) katak bo'shlig'i
 * `px-1.5`, "A'lo va yaxshi" / "Topshiriq" ustunlari yashirin, aks holda
 * `break-words` sarlavhani 68-84px qilib, qatorni yarim kesardi
 * (`TableCards.jsx`). Olimpiada plitkalari kattalashtirilsa, uning yangi
 * balandligi SHU jadvalga yozilishi va 148.3px ga sig'ishi shart. Yangi
 * karta yoki mavjud kartaga yangi qator qo'shilsa — xuddi shu qoida.
 *
 * ⚠️ Chegarani PASAYTIRMANG. 800px da o'lchanadigan maydon atigi 71px
 * bo'ladi va uchala jadval kartasi ham eng kam ikki qatorini sig'dira
 * olmay, oxirgi qatorni YARIM KESIB ko'rsatardi — bu foydalanuvchi uch
 * marta rad etgan aynan o'sha nuqson. Undan past ekranda ODDIY OQIM
 * ishlaydi: kartalar tabiiy balandlikda, sahifa suriladi, ro'yxatlar
 * to'liq — halol zaxira.
 */
export const FIT_QUERY = "(min-width: 1280px) and (min-height: 960px)";

export default FIT_QUERY;
