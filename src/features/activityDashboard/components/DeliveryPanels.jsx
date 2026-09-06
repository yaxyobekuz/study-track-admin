// React
import { useMemo } from "react";

// Icons
import { MousePointerClick, Send } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useCountUp from "@/shared/hooks/useCountUp";

// Tokens
import { BAR, CHIP, MOTION, ROW, T, contentDelay, pct } from "../data/pulse.tokens";

// Components
import Panel from "./Panel";

/** Bar kengligi uchun foizni 0..100 oralig'iga qisadi. */
const clampPct = (value) => Math.min(100, Math.max(0, Number(value) || 0));

/** Sonni o'zbekcha ajratgich bilan — bo'sh qiymat "0". */
const num = (value) => (Number(value) || 0).toLocaleString("uz-UZ");

/**
 * KIRISH ANIMATSIYASI QADAMI — CHEKLANGAN.
 *
 * ⚠️ Indeks 10 da to'xtaydi: uzun ro'yxatda har qator o'z navbatini
 * kutsa, oxirgi qator sakkiz soniyadan keyin paydo bo'lardi va
 * foydalanuvchi uni "yuklanmagan" deb o'ylardi. Birinchi o'nta qator
 * xoreografiyani ko'rsatadi, qolgani ular bilan birga kiradi.
 */
const stepDelay = (delay, index) => contentDelay(delay, Math.min(index, 10));

/* ═══════════════════════ XABAR YETKAZISH ═══════════════════════ */

/**
 * YETKAZISH OSTONALARI — chip ohangini shu ikki son hal qiladi.
 *
 * ⚠️ 100% KUTILMAYDI va oston shuning uchun 98 da turadi: botni
 * bloklagan yoki o'chirib qo'ygan bir nechta hisob har doim bo'ladi va
 * ular bizning xatoyimiz emas. Ostona 100 bo'lsa, karta deyarli har
 * kuni sariq yonib turar va ogohlantirish ma'nosini yo'qotardi.
 *
 * 90% dan past — bu allaqachon tizimli nosozlik (token, tarmoq, navbat):
 * o'nta ota-onadan biri hisobotni umuman ko'rmayapti.
 */
const RATE_GOOD = 98;
const RATE_WARN = 90;

/**
 * Yetkazish foizini chip ohangiga aylantiradi.
 *
 * ⚠️ `null` uchun `neutral`: hech narsa yuborilmagani (maxraj nol) va
 * yuborilib yetmagani — ikki xil holat. Ikkalasini ham qizil chizsak,
 * xabar yuborilmagan tinch davr "falokat" bo'lib ko'rinardi.
 */
const rateTone = (rate, hasDenominator = true) => {
  // ⚠️ MAXRAJ NOLGA TENG BO'LSA — `neutral`. Server nol maxrajda
  // `null` emas, **0** qaytaradi, ya'ni birorta xabar yuborilmagan
  // davr "0% yetkazildi" bo'lib qip-qizil chiqardi. Yuborilmagan
  // xabarni "yetkazilmadi" deb ko'rsatish yolg'on.
  if (!hasDenominator) return "neutral";
  if (rate == null || Number.isNaN(rate)) return "neutral";
  if (rate >= RATE_GOOD) return "good";
  if (rate >= RATE_WARN) return "warn";
  return "alert";
};

/**
 * BAR RANGI — chip ohangi bilan BITTA manbadan.
 *
 * ⚠️ Bar rangi qo'lda yozilmaydi: chip "sariq", bar esa "yashil" bo'lib
 * qolsa, bitta ko'rsatkich ikki xil baho berardi. Ohangni `rateTone`
 * hal qiladi, bu jadval faqat uni sinfga o'giradi.
 */
const RATE_FILL = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  alert: "bg-rose-500",
  neutral: "bg-slate-300",
};

/**
 * XABAR YETKAZISH — ikki xil oqim bitta kartada.
 *
 * ⚠️ "O'QILDI" DEGAN RAQAM YO'Q va u kelajakda ham qo'shilmaydi:
 * Telegram Bot API o'qish tasdig'ini BERMAYDI. Bot uchun mavjud
 * yagona fakt — "Telegram so'rovni qabul qildi" (yuborildi) yoki
 * "rad etdi" (yetkazilmadi). Shuning uchun ekranda ham, izohda ham
 * faqat shu ikki so'z ishlatiladi; "o'qildi" deb yozilsa, raqam
 * o'ylab topilgan bo'lardi va rahbar unga qarab qaror qabul qilardi.
 * Karta ostidagi ingichka izoh aynan shuni ochiq aytadi.
 *
 * ⚠️ IKKI BLOK — IKKI XIL MANBA. Kunlik hisobotni BOT o'zi yuboradi
 * (`ActivityEvent`), ommaviy xabarni esa ODAM admin paneldan
 * (`MessageDeliveryStatus`). Ularning maxraji ham, javobgari ham
 * boshqa — bitta raqamga qo'shilsa, "yetkazish 94%" degan son qaysi
 * oqim buzilganini aytmasdi.
 *
 * ⚠️ BLOKLAR ORASIDAGI AJRATUVCHI — KARTA CHETIGACHA CHO'ZILGAN
 * HAIRLINE. Ilgari bu yerda ikkita kulrang plitka va ular orasida
 * bo'shliq turardi; plitka fon bilan ajralardi-yu, kartaning ichida
 * "ikkinchi karta" bo'lib ko'rinardi. Endi ikkala blok ham kartaning
 * o'z sirtida yotadi va ularni faqat ingichka chiziq ajratadi
 * (`ROW.list` doktrinasi): bu kontur emas, ichki TARTIB chizig'i —
 * kartaning chegarasizligi buzilmaydi.
 *
 * @param {object} props
 * @param {object} props.data - butun `activity/overview` javobi
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0] - kirish animatsiyasi kechikishi (ms)
 * @param {string} [props.className]
 */
export const DeliveryPanel = ({ data, isLoading, isError, delay = 0, className }) => {
  const reports = data?.delivery?.reports;
  const broadcast = data?.delivery?.broadcast;

  // ⚠️ Bo'shlik shartida `failed` ham bor: hammasi yetkazilmagan davr
  // "ma'lumot yo'q" emas, aksincha — eng muhim holat.
  const isEmpty =
    (reports?.sent ?? 0) === 0 &&
    (reports?.failed ?? 0) === 0 &&
    (broadcast?.total ?? 0) === 0;

  return (
    <Panel
      title="Xabar yetkazish"
      hint="Davr ichida yuborilgan xabarlar"
      icon={Send}
      tone="good"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      emptyText="Bu davrda birorta xabar yuborilmagan"
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ReportsBlock reports={reports} delay={contentDelay(delay, 0)} />

        {/* Ajratuvchi — karta chetigacha cho'zilgan hairline (blok ichida) */}
        <BroadcastBlock broadcast={broadcast} delay={contentDelay(delay, 1)} />

        {/* ⚠️ Bu izoh bezak emas, OGOHLANTIRISH: raqamlarni "nechta
            ota-ona o'qidi" deb o'qish mumkin emas */}
        <p className={cn(T.hint, "mt-auto pt-4 text-slate-400")}>
          Telegram o'qilganini bildirmaydi — bu yerda faqat yetkazilgani
          ko'rsatiladi.
        </p>
      </div>
    </Panel>
  );
};

/**
 * KUNLIK HISOBOT — bot har kuni ota-onalarga yuboradigan baho hisoboti.
 *
 * ⚠️ Kartaning ENG KATTA RAQAMI shu blokda va bu ataylab: kunlik
 * hisobot avtomatik ishlaydi, ya'ni u buzilganda hech kim shikoyat
 * qilmaydi — ekran o'zi aytishi kerak. Ommaviy xabarni esa odam
 * yuboradi va u natijani baribir ko'radi.
 *
 * ⚠️ YORUG'LIK BANDI (`BAR.sheen`) FAQAT SHU BARDA. Kartaning asosiy
 * ko'rsatkichi shu, qolgan barlar esa jim turadi: har ustunda harakat
 * bo'lsa, u "bu yerga qara" degan ma'nosini yo'qotib, oddiy bezakka
 * aylanardi.
 */
const ReportsBlock = ({ reports, delay }) => {
  const sent = useCountUp(Number(reports?.sent ?? 0), { duration: 950 });
  const failed = reports?.failed ?? 0;

  const hasDenominator = (reports?.sent ?? 0) + (reports?.failed ?? 0) > 0;
  const tone = rateTone(reports?.rate, hasDenominator);

  return (
    <div className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between gap-2">
        <p className={T.label}>Kunlik hisobot</p>
        <span className={cn(CHIP.base, CHIP.tone[tone])}>{pct(reports?.rate)}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={cn(T.value, T.size2xl)}>{num(sent)}</span>
        <span className={cn(T.meta, "text-slate-400")}>ta yetkazildi</span>

        {failed > 0 && (
          <span className={cn(CHIP.base, CHIP.tone.alert, "ml-auto")}>
            {num(failed)} yetkazilmadi
          </span>
        )}
      </div>

      {/* ⚠️ `aria-hidden`: bar yuqoridagi foizning takrori —
          ekran o'quvchiga ikkinchi marta aytilmaydi */}
      <div aria-hidden="true" className={cn(BAR.track, "mt-3")}>
        <div
          className={cn(BAR.fill, RATE_FILL[tone] ?? RATE_FILL.neutral)}
          style={{
            width: `${clampPct(reports?.rate)}%`,
            animationDelay: `${delay + 90}ms`,
          }}
        >
          <span aria-hidden="true" className={BAR.sheen} />
        </div>
      </div>

      <p className={cn(T.meta, "mt-2 text-slate-400")}>
        Bot ota-onalarga baho hisobotini o'zi yuboradi
      </p>
    </div>
  );
};

/**
 * OMMAVIY XABARLAR — admin paneldan yuborilganlar.
 *
 * ⚠️ UCHALA QOLDIQ HAM DOIM CHIZILADI, noli ham. Nol qatorni
 * yashirsak, "navbatda 0 ta" bilan "navbat umuman kuzatilmaydi"
 * bir xil ko'rinardi — holbuki birinchisi yaxshi xabar, ikkinchisi
 * esa savol. Nol kulrang turadi va ko'zni tortmaydi.
 *
 * ⚠️ QOLDIQ QATORLARI RELSSIZ va zichroq (`py-1.5`). Rels "bu qator
 * ochiladi" degan va'da beradi; bu uchtasi esa bosilmaydi. Hairline
 * ular uchun yetarli: ular ro'yxat, lekin harakat nuqtasi emas.
 */
const BroadcastBlock = ({ broadcast, delay }) => {
  const total = broadcast?.total ?? 0;
  const sent = broadcast?.sent ?? 0;
  const tone = rateTone(broadcast?.rate, total > 0);

  const leftovers = [
    { key: "failed", label: "Yetkazilmadi", value: broadcast?.failed ?? 0, tone: "text-rose-600" },
    { key: "pending", label: "Navbatda", value: broadcast?.pending ?? 0, tone: "text-amber-600" },
    { key: "cancelled", label: "Bekor qilingan", value: broadcast?.cancelled ?? 0, tone: "text-slate-500" },
  ];

  return (
    <div
      /* ⚠️ `-mx-5 … px-5`: chiziq karta chetigacha cho'ziladi, matn esa
         kartaning umumiy chap qirrasida qoladi. Chiziq ichkarida tugasa,
         u "jadval" bo'lib ko'rinardi. */
      className={cn("-mx-5 mt-4 border-t border-slate-100 px-5 pt-4", MOTION.enterUp)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={T.label}>Ommaviy xabarlar</p>
        <span className={cn(CHIP.base, CHIP.tone[tone])}>{pct(broadcast?.rate)}</span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn(T.value, T.sizeLg)}>{num(sent)}</span>
        <span className={cn(T.meta, "text-slate-400")}>/ {num(total)} yetkazildi</span>
      </div>

      {/* ⚠️ `aria-hidden`: bar yuqoridagi ikki raqamning takrori —
          ekran o'quvchiga uchinchi marta aytilmaydi.
          ⚠️ Sheen YO'Q — u faqat kunlik hisobot barida. */}
      <div aria-hidden="true" className={cn(BAR.track, "mt-2.5")}>
        <div
          className={cn(BAR.fill, RATE_FILL[tone] ?? RATE_FILL.neutral)}
          style={{
            width: `${clampPct(broadcast?.rate)}%`,
            animationDelay: `${delay + 90}ms`,
          }}
        />
      </div>

      <ul className={cn(ROW.list, "mt-3 border-t border-slate-100")}>
        {leftovers.map((row) => (
          <li key={row.key} className={cn(ROW.base, ROW.hover, "py-1.5")}>
            <span className={cn(T.meta, "truncate text-slate-400")}>{row.label}</span>

            <span
              className={cn(
                "ml-auto shrink-0 text-right text-[11.5px] font-semibold tabular-nums",
                row.value > 0 ? row.tone : "text-slate-300",
              )}
            >
              {num(row.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ═══════════════════════ BOTDAGI HARAKATLAR ═══════════════════════ */

/**
 * BOTDA NIMA QILISHADI — harakatlar reytingi.
 *
 * ⚠️ CHIQUVCHI QATORLAR ALOHIDA GURUHDA va bu eng muhim qaror. Server
 * bitta ro'yxatda `bot.out.*` (biz yuborgan hisobot) bilan
 * `bot.grades` (ota-ona ochgan ekran) ni beradi, holbuki birinchisi
 * FOYDALANUVCHI HARAKATI EMAS. Ular aralash tursa, "eng ko'p
 * qilinadigan ish" har doim bizning avtomatik yuborishimiz bo'lib
 * chiqardi — chunki u har kuni har bir bog'langan hisobga ketadi va
 * odamning bitta bosishidan o'n baravar ko'p bo'ladi.
 *
 * ⚠️ ULUSH HAR GURUHNING O'Z JAMISIDAN olinadi, umumiy jamidan emas.
 * Umumiy maxrajda chiquvchilar shu qadar ustun turadiki, kiruvchi
 * barlarning hammasi bir piksel bo'lib qolardi; qolaversa, ikki
 * guruhni taqqoslashning MA'NOSI yo'q — biri odamning tanlovi, biri
 * bizning jadvalimiz.
 *
 * ⚠️ QATORLAR HAIRLINE BILAN AJRALADI (`ROW.list`). Ilgari ular faqat
 * hover'da ajrardi va sichqoncha turmagan holatda ekranda oq fonda
 * matn oqimi qolardi — holbuki ro'yxatning butun ma'nosi qatorma-qator
 * taqqoslash.
 *
 * @param {object} props
 * @param {object} props.data - butun `activity/overview` javobi
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0] - kirish animatsiyasi kechikishi (ms)
 * @param {string} [props.className]
 */
export const ActionsPanel = ({ data, isLoading, isError, delay = 0, className }) => {
  // ⚠️ `data?.actions ?? []` bog'liqlik ro'yxatiga CHIQARILMAYDI: har
  // renderda yangi massiv hosil bo'lib, `useMemo` hech qachon
  // keshlanmasdi. Shart memo ichida qoladi.
  const groups = useMemo(() => {
    const rows = data?.actions ?? [];

    // ⚠️ Server tartibi (soni bo'yicha kamayish) SAQLANADI — bu yerda
    // qayta saralansa, serverdagi tartib qoidasi jimgina bekor bo'lardi.
    const inbound = rows.filter((row) => !row.outbound);
    const outbound = rows.filter((row) => row.outbound);
    const sum = (list) => list.reduce((acc, row) => acc + (row.count ?? 0), 0);

    return {
      inbound,
      outbound,
      inboundTotal: sum(inbound),
      outboundTotal: sum(outbound),
      isEmpty: rows.length === 0,
    };
  }, [data]);

  return (
    <Panel
      title="Botdagi harakatlar"
      hint="Ota-onalar nima uchun kirishadi"
      icon={MousePointerClick}
      tone="bot"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={groups.isEmpty}
      emptyText="Bu davrda botda harakat qayd etilmagan"
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ul className={ROW.list}>
          {groups.inbound.map((row, index) => (
            <ActionRow
              key={row.key}
              row={row}
              total={groups.inboundTotal}
              /* ⚠️ Yorug'lik bandi FAQAT birinchi kiruvchi qatorda:
                 server tartibi soni bo'yicha kamayish, ya'ni birinchi
                 qator — eng ko'p qilinadigan harakat. Kartaning asosiy
                 ko'rsatkichi shu, qolgan barlar jim turadi. */
              hasSheen={index === 0}
              delay={stepDelay(delay, index)}
            />
          ))}
        </ul>

        {groups.outbound.length > 0 && (
          <>
            {/* Guruh sarlavhasi — qatorlar kabi karta chetigacha
                cho'zilgan hairline ostida */}
            <div className="-mx-5 mt-3 border-t border-slate-100 px-5 pb-1 pt-4">
              <p className={T.label}>Chiquvchi</p>
            </div>

            <ul className={ROW.list}>
              {groups.outbound.map((row, index) => (
                <ActionRow
                  key={row.key}
                  row={row}
                  total={groups.outboundTotal}
                  isOutbound
                  /* Kechikish sanog'i guruhlar orasida UZILMAYDI:
                     ikkinchi guruh noldan boshlansa, ro'yxat ikki
                     marta "quyilgandek" ko'rinardi */
                  delay={stepDelay(delay, groups.inbound.length + index)}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </Panel>
  );
};

/**
 * BITTA HARAKAT QATORI — nom, ulush, son va to'lgan bar.
 *
 * ⚠️ Foiz RAQAM bilan ham yoziladi, faqat bar bilan emas: bar guruh
 * ichidagi nisbatni ko'rsatadi, lekin "ikkinchi qator birinchisidan
 * qanchaga kam" degan savolga ko'z bilan aniq javob bermaydi.
 *
 * ⚠️ Kiruvchi — violet (bo'lim rangi, "jalb qilinganlik"), chiquvchi —
 * slate (neytral, kontekst). Rang farqi guruh sarlavhasini TAKRORLAYDI,
 * almashtirmaydi: rangni ajrata olmaydigan ko'z uchun "Chiquvchi"
 * yozuvi joyida qoladi.
 *
 * ⚠️ CHAP RELS hover'da ochiladi va u qatorning rangini TAKRORLAYDI:
 * ko'z bar rangi bilan rels rangini bir qatorga bog'laydi, ya'ni
 * "qaysi guruhdaman" degan savol sichqoncha ostida ham yo'qolmaydi.
 */
const ActionRow = ({ row, total, isOutbound = false, hasSheen = false, delay }) => {
  const share = total > 0 ? Math.round(((row.count ?? 0) / total) * 100) : 0;
  const fill = isOutbound ? "bg-slate-300" : "bg-violet-500";

  return (
    <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      <div className={cn(ROW.base, ROW.hover)}>
        <span aria-hidden="true" className={cn(ROW.rail, fill)} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cn(T.tdName, "truncate", isOutbound && "text-slate-500")}>
              {row.label}
            </span>

            {/* Raqamlar o'ngga tekislanadi — ustun bo'lib tushishi shart */}
            <span className={cn(T.meta, "ml-auto shrink-0 tabular-nums text-slate-400")}>
              {pct(share)}
            </span>
            <span
              className={cn(
                T.tdNum,
                "shrink-0 text-right",
                isOutbound && "text-slate-500",
              )}
            >
              {num(row.count)}
            </span>
          </div>

          {/* ⚠️ `aria-hidden`: bar yonidagi foizning takrori */}
          <div aria-hidden="true" className={cn(BAR.track, "mt-1.5")}>
            <div
              className={cn(BAR.fill, fill)}
              style={{ width: `${clampPct(share)}%`, animationDelay: `${delay}ms` }}
            >
              {hasSheen && <span aria-hidden="true" className={BAR.sheen} />}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default DeliveryPanel;
