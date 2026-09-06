// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  BellOff,
  Link2,
  Link2Off,
  PhoneOff,
  TriangleAlert,
  UserCheck,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useMediaQuery from "@/shared/hooks/useMediaQuery";

// Ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/shadcn/drawer";

// Queries
import { activityQueries } from "../queries/activity.queries";

// Tokens
import {
  BAR,
  CHIP,
  DELAY,
  MOTION,
  ROW,
  SURFACE,
  T,
  contentDelay,
  pct,
} from "../data/pulse.tokens";

/**
 * BITTA SINFNING KESIMI — "3-A da kim foydalanadi, kim yo'q".
 *
 * ⚠️ MAVJUD MODAL PRIMITIVLARI ISHLATILDI, `ResponsiveModal` EMAS —
 * `SubjectSheet` bilan bir xil sabab: `ResponsiveModal` ochiqlik
 * holatini `useModal(name)` reyestridan O'ZI oladi va NOMGA
 * bog'lanadi. Bu blok esa BOSHQARILADIGAN bo'lishi shart: qaysi sinf
 * tanlangani sahifadagi `classId` holatida turadi va modal shu
 * qiymatdan ochiladi. Reyestrga o'tkazilsa, "qaysi sinf ochiq" degan
 * ma'lumot ikki joyda saqlanardi va ular bir-biridan uzoqlashardi.
 *
 * ⚠️ SO'ROV FAQAT OCHILGANDA KETADI (`enabled`): sinflar ro'yxatida
 * o'n beshta qator bor, har biriga oldindan so'rov yuborilsa —
 * o'n beshta keraksiz chaqiruv.
 *
 * ⚠️ MODAL TO'LDIRISHI 20px (`p-5` / `px-5`), standart `p-6` EMAS.
 * Qator tizimi (`ROW.list` = `-mx-5`, `ROW.base` = `px-5`) qatorlarni
 * sirt CHETIGACHA cho'zadi; to'ldirish 24px bo'lsa, ajratuvchi
 * chiziqlar chetdan 4px berida tugab, "jadval ichidagi jadval" bo'lib
 * ko'rinardi.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {(next: boolean) => void} props.onOpenChange
 * @param {string|null} props.classId
 * @param {number} props.days - sahifadagi davr bilan bir xil
 */
const ClassSheet = ({ open, onOpenChange, classId, days }) => {
  const isDesktop = useMediaQuery("(min-width: 480px)");

  const query = useQuery({
    ...activityQueries.classDetail({ classId, days }),
    enabled: open && Boolean(classId),
  });

  const title = query.data?.class?.name || "Sinf kesimi";

  // ⚠️ Davr MATNI serverdan tayyor keladi (`rangeLabel`) — sana
  // formati bo'lim bo'ylab yagona bo'lishi uchun u frontendda
  // yig'ilmaydi
  const subtitle =
    query.data?.period?.rangeLabel || "Kim botdan foydalanadi, kim yo'q";

  const body = (
    <Body data={query.data} isLoading={query.isLoading} isError={query.isError} />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-5">
          <DialogTitle className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className={T.hint}>{subtitle}</DialogDescription>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* ⚠️ Balandlik va surilish SIRTGA berilgan, ichkaridagi
          ro'yxatlarga emas: uchta ro'yxatning har biri alohida
          surilsa, telefonda barmoq qaysi ro'yxatni surayotganini
          topa olmasdi — bitta surilish maydoni bo'ladi */}
      <DrawerContent className="max-h-[86vh] overflow-y-auto hidden-scrollbar px-5 pb-6">
        <DrawerTitle className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          {title}
        </DrawerTitle>
        <DrawerDescription className={T.hint}>{subtitle}</DrawerDescription>
        {body}
      </DrawerContent>
    </Drawer>
  );
};

/* ═══════════════════════ TANA ═══════════════════════ */

/**
 * ⚠️ KIRISH ANIMATSIYASI QADAMI CHEKLANGAN. Sinfda o'ttizta o'quvchi
 * bo'lishi mumkin; har qatorga to'liq qadam berilsa, oxirgisi bir
 * necha soniya kutib turardi va ro'yxat "yuklanmayapti" bo'lib
 * ko'rinardi. O'ninchi qatordan keyin hammasi bir vaqtda kiradi.
 */
const STAGGER_CAP = 10;

/** Bar kengligi uchun foizni 0..100 oralig'iga qisadi. */
const clampPct = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const Body = ({ data, isLoading, isError }) => {
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-10 text-center">
        <TriangleAlert className="size-5 text-slate-300" strokeWidth={1.8} />
        <p className="text-[12px] font-medium text-slate-500">
          Ma'lumotni yuklab bo'lmadi
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-2.5 py-6">
        {[92, 74, 58].map((width, index) => (
          <div
            key={width}
            className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
            style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
          />
        ))}
      </div>
    );
  }

  const info = data.class ?? {};
  const parents = data.parents ?? [];
  const unlinked = data.unlinked ?? [];
  const trend = data.trend ?? [];

  // ⚠️ Ikkita ro'yxat BITTA manbadan bo'linadi (`parents`), ikkita
  // alohida so'rov bilan emas: "faol" ta'rifi serverda bitta joyda
  // turadi va u ikki tomonda ham AYNAN bir xil bo'lishi kerak
  const silentRows = parents.filter((row) => !row.active);
  const activeRows = parents.filter((row) => row.active);

  return (
    <div className="mt-3 space-y-4">
      {/* ── Uchta ko'rsatkich ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Foydalanadi"
          icon={UserCheck}
          value={info.active ?? 0}
          suffix={`/ ${info.linked ?? 0}`}
          note={pct(info.rate)}
          barPct={clampPct(info.rate)}
          barClass="bg-violet-500"
          /* ⚠️ Yorug'lik bandi FAQAT shu plitkada: `rate` — butun
             ekranning asosiy ko'rsatkichi. Uchala plitkada bo'lsa,
             ular bir-biri bilan raqobatlashib, "bu yerga qara" degan
             ma'no yo'qolardi */
          sheen
        />
        <Stat
          label="Bog'langan"
          icon={Link2}
          value={info.linkedStudents ?? 0}
          suffix={`/ ${info.students ?? 0}`}
          note={pct(info.linkRate)}
          barPct={clampPct(info.linkRate)}
          barClass="bg-violet-300"
        />
        <Stat
          label="Jim"
          icon={PhoneOff}
          value={info.silent ?? 0}
          note="ochmagan"
          /* ⚠️ Maxraj yuqoridagi bilan BIR XIL (`linked`) — bu `rate`
             ning to'ldiruvchisi, yangi o'lchov emas. Boshqa maxraj
             olinsa, uchta bar uchta boshqa narsani ko'rsatib turardi */
          barPct={clampPct(
            info.linked ? ((info.silent ?? 0) / info.linked) * 100 : 0,
          )}
          barClass="bg-amber-500"
        />
      </div>

      {/* ── Kunlik mikro-trend ─────────────────────────────────────── */}
      <Trend rows={trend} period={data.period} />

      {/* ── Uchta ro'yxat ──────────────────────────────────────────────
          ⚠️ TARTIB ATAYLAB SHUNDAY: avval MUAMMO (foydalanmayotganlar),
          keyin norma (foydalanadi), oxirida jarayonning boshlanishi
          (bog'lanmagan). Modal "hammasi joyidami" degan savolga emas,
          "kim bilan ishlash kerak" degan savolga javob beradi */}
      <Section label="Foydalanmayotganlar" count={silentRows.length} tone="warn">
        {silentRows.map((row, index) => (
          <Row
            key={`${row.telegramId}-${row.studentId}`}
            index={index}
            rail="bg-amber-500"
          >
            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{row.studentName || "—"}</p>
              <p className={cn(T.meta, "mt-0.5 truncate")}>
                {row.contactName || "—"}
              </p>
            </div>

            {/* ⚠️ Bildirishnoma o'chirilgani — jim turishning EHTIMOLIY
                SABABI, shuning uchun u qatorda ko'rinadi: bunday
                ota-onaga eslatma yuborish foydasiz, unga qo'ng'iroq
                qilish kerak */}
            {row.notificationsEnabled === false && (
              <span
                className="shrink-0 text-slate-400"
                title="Bildirishnomalar o'chirilgan"
                aria-label="Bildirishnomalar o'chirilgan"
              >
                <BellOff className="size-3.5" strokeWidth={2} />
              </span>
            )}

            <div className="ml-auto shrink-0 text-right">
              {row.daysSince == null ? (
                /* Hech qachon ochmagan — "0 kun" deb yozib bo'lmaydi:
                   bu "bugun kirgan" degan TESKARI ma'no berardi */
                <span className={cn(CHIP.base, CHIP.tone.warn)}>Hech qachon</span>
              ) : (
                <>
                  <span className="flex items-baseline justify-end gap-1">
                    <span className={T.tdNum}>{row.daysSince}</span>
                    <span className={T.meta}>kun</span>
                  </span>
                  <p className={cn(T.meta, "mt-0.5")}>{row.lastSeenLabel || "—"}</p>
                </>
              )}
            </div>
          </Row>
        ))}
      </Section>

      <Section label="Foydalanadi" count={activeRows.length} tone="good">
        {activeRows.map((row, index) => (
          <Row
            key={`${row.telegramId}-${row.studentId}`}
            index={index}
            rail="bg-emerald-500"
          >
            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{row.studentName || "—"}</p>
              <p className={cn(T.meta, "mt-0.5 truncate")}>
                {row.contactName || "—"}
              </p>
            </div>

            <div className="ml-auto shrink-0 text-right">
              <span className="flex items-baseline justify-end gap-1">
                <span className={T.tdNum}>{row.days ?? 0}</span>
                <span className={T.meta}>kun</span>
              </span>
              <p className={cn(T.meta, "mt-0.5")}>{row.events ?? 0} harakat</p>
            </div>
          </Row>
        ))}
      </Section>

      {/* ⚠️ OHANG NEYTRAL, sariq emas: bog'lanmaganlik — jarayonning
          tabiiy boshlanishi (havola hali berilmagan), muammo emas.
          Sariq bilan chizilsa, u yuqoridagi haqiqiy signal bilan bir
          xil og'irlikda ko'rinardi */}
      <Section label="Botga bog'lanmagan" count={unlinked.length} tone="neutral">
        {unlinked.map((row, index) => (
          <Row key={row.id} index={index} rail="bg-slate-300">
            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{row.name || "—"}</p>
            </div>

            <Link2Off
              className="ml-auto size-3.5 shrink-0 text-slate-300"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Row>
        ))}
      </Section>

      {/* Uchala ro'yxat ham bo'sh — modal bo'm-bo'sh qolmasligi kerak */}
      {parents.length === 0 && unlinked.length === 0 && (
        <p className="py-6 text-center text-[11.5px] leading-relaxed text-slate-400">
          Bu sinfda o'quvchi yo'q
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════ BO'LAKLAR ═══════════════════════ */

/**
 * KO'RSATKICH PLITKASI — yorliq, raqam va ulush relsi.
 *
 * ⚠️ Bar `aria-hidden`: u yonidagi foizning TAKRORI, ekran o'quvchiga
 * bir narsa ikki marta aytilmaydi.
 */
const Stat = ({ label, icon: Icon, value, suffix, note, barPct, barClass, sheen }) => (
  <div className={cn(SURFACE.tile, "px-2.5 py-2.5")}>
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
      <span className={cn(T.label, "truncate")}>{label}</span>
    </div>

    <p className="mt-1.5 flex items-baseline gap-1">
      <span className={cn(T.value, T.sizeLg)}>{value}</span>
      {suffix && <span className={T.meta}>{suffix}</span>}
    </p>

    {barPct != null && (
      <div aria-hidden="true" className={cn(BAR.track, "mt-2 w-full")}>
        <span className={cn(BAR.fill, barClass)} style={{ width: `${barPct}%` }}>
          {sheen && <span aria-hidden="true" className={BAR.sheen} />}
        </span>
      </div>
    )}

    {note && <p className={cn(T.meta, "mt-1 tabular-nums")}>{note}</p>}
  </div>
);

/**
 * KUNLIK MIKRO-TREND — har kun bitta ustun.
 *
 * ⚠️ Nol kun ALOHIDA rangda (kulrang), eng past binafsha pog'onada
 * emas: bo'sh kun "kam" degani emas, "umuman yo'q" degani. Issiqlik
 * xaritasidagi `HEAT[0]` bilan bir xil qaror.
 *
 * ⚠️ Bo'sh davrda blok UMUMAN chizilmaydi: yorliq ostidagi bo'sh
 * to'rtburchak shovqindan boshqa narsa emas.
 */
const Trend = ({ rows, period }) => {
  if (!rows || rows.length === 0) return null;

  // Maxraj hech qachon nolga tushmaydi — hamma kun bo'sh bo'lsa,
  // ustunlar eng past balandlikda qoladi
  const max = rows.reduce((best, row) => Math.max(best, row.active ?? 0), 0) || 1;

  return (
    <section>
      <p className={T.label}>Kunlar bo'yicha</p>

      <div className="mt-2 flex h-10 items-end gap-[3px]">
        {rows.map((row, index) => {
          const value = row.active ?? 0;

          return (
            <span
              key={row.day}
              title={`${row.label} — ${value} kishi`}
              className={cn(
                "min-w-0 flex-1 rounded-[2px]",
                value > 0 ? "bg-violet-500" : "bg-slate-100",
                MOTION.tick,
              )}
              style={{
                height: value > 0 ? `${Math.max(8, (value / max) * 100)}%` : "8%",
                animationDelay: `${index * 8}ms`,
              }}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <span className={T.meta}>{period?.fromLabel ?? "—"}</span>
        <span className={T.meta}>{period?.toLabel ?? "—"}</span>
      </div>
    </section>
  );
};

/**
 * BO'LIM — sarlavha, son chipi va qatorlar ro'yxati.
 *
 * ⚠️ BO'SH BO'LIM CHIZILMAYDI. "Foydalanmayotganlar — 0" degan
 * sarlavha yaxshi xabar bo'lsa ham, u ekranda joy egallaydi va
 * qolgan ikkita ro'yxatni pastga suradi.
 */
const Section = ({ label, count, tone, children }) => {
  if (count === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2">
        <p className={T.label}>{label}</p>
        <span className={cn(CHIP.base, CHIP.tone[tone], "tabular-nums")}>
          {count}
        </span>
      </div>

      {/* ⚠️ Qatorlar orasidagi ajratuvchi `ROW.list` dan keladi va u
          modal CHETIGACHA cho'ziladi (`-mx-5`): ilgari qatorlar faqat
          hover'da ajralar, sichqoncha turmagan holatda esa oq fonda
          matn oqimi bo'lib qolar edi */}
      <ul className={cn(ROW.list, "mt-1.5")}>{children}</ul>
    </section>
  );
};

/**
 * QATOR — bosilmaydi.
 *
 * ⚠️ `div`, `button` EMAS: bu modal allaqachon eng chuqur qatlam,
 * uning ichidan ochiladigan ekran yo'q. Bosiladigan qilib qo'yilsa,
 * foydalanuvchi bosib, hech narsa bo'lmasligini ko'rardi.
 */
const Row = ({ index, rail, children }) => (
  <li
    className={MOTION.enterUp}
    style={{
      animationDelay: `${contentDelay(DELAY.content, Math.min(index, STAGGER_CAP))}ms`,
    }}
  >
    <div className={cn(ROW.base, ROW.hover)}>
      {/* Chap aksent — faqat hover'da ochiladi */}
      <span aria-hidden="true" className={cn(ROW.rail, rail)} />
      {children}
    </div>
  </li>
);

export default ClassSheet;
