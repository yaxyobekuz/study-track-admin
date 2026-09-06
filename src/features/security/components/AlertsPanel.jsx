// Icons
import { Check, CheckCircle2, Eye, Loader2, ShieldAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import {
  CHIP,
  MOTION,
  ROW,
  SEVERITY_ORDER,
  T,
  contentDelay,
  severityOf,
  statusOf,
} from "../data/sentinel.tokens";

// Components
import Panel from "./Panel";

/**
 * OGOHLANTIRISHLAR — bo'limning MARKAZIY bloki.
 *
 * ⚠️ QATOR BUTUNLAY RANGLANMAYDI, FAQAT CHAP QIRRADAGI RELS. Jiddiylikni
 * butun qator foniga yoysak, ro'yxat "svetofor" ga aylanardi: o'nta
 * qizil-sariq-kulrang to'rtburchak yonma-yon turganda ko'z ranglarni
 * o'qiy boshlaydi va MATNNI o'qimay qo'yadi — ogohlantirishning butun
 * qiymati esa aynan matnida (`title` + `detail`). Shu sababli rang
 * 3px lik relsga siqiladi, matn esa neytral qoladi; jiddiylik yorlig'i
 * ("Jiddiy"/"Yuqori") chipda SO'Z bilan ham takrorlanadi — rangni
 * ajrata olmaydigan ko'z uchun.
 *
 * ⚠️ QATORLAR HAIRLINE BILAN AJRALADI (`ROW.list`), HOVER BILAN EMAS.
 * Ilgari qatorlar orasida faqat 4px bo'shliq bor edi va sichqoncha
 * turmagan holatda ekranda oq fonda matn oqimi qolardi: ko'z qayerda
 * bir ogohlantirish tugab, ikkinchisi boshlanganini topa olmasdi.
 * Ro'yxatning butun ma'nosi — QATORMA-QATOR taqqoslash, shuning uchun
 * ajratuvchi doimiy bo'lishi shart. Qatorlar `-mx-5` bilan karta
 * chetigacha cho'ziladi: ajratuvchi ichkarida qolsa u "jadval" bo'lib
 * ko'rinardi, chetgacha yetganda esa fonning tabiiy bo'linishiga
 * aylanadi.
 *
 * ⚠️ QATORLAR CHAQNAMAYDI. `sentinel.tokens.js` sarlavhasidagi qoida:
 * jiddiylik rang va vazn bilan beriladi, harakat bilan emas. Bu yerdagi
 * yagona harakat — kirish (`alert-in`) va tugmadagi `Loader2`, ya'ni
 * FOYDALANUVCHI amaliga javob; ma'lumotning o'zi tebranmaydi.
 *
 * @param {object} props
 * @param {object} props.data - `GET /security/overview` ning butun `data` si
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0] - kirish animatsiyasi kechikishi (ms)
 * @param {string} [props.className]
 * @param {boolean} [props.canManage] - `security.alerts` ruxsati
 * @param {(alert: object) => void} [props.onAcknowledge] - "Ko'rib chiqildi"
 * @param {(alert: object) => void} [props.onResolve] - "Yopish"
 * @param {string|null} [props.busyId] - hozir yuborilayotgan ogohlantirish id si
 * @param {(userId: string) => void} [props.onSelectUser] - ism bosilganda
 */
const AlertsPanel = ({
  data,
  isLoading = false,
  isError = false,
  delay = 0,
  className,
  canManage = false,
  onAcknowledge,
  onResolve,
  busyId = null,
  onSelectUser,
}) => {
  const rows = data?.alerts?.items ?? [];
  const severity = data?.alerts?.severity ?? {};

  // Sarlavha o'ngidagi sanoq — faqat NOLGA TENG BO'LMAGANLARI.
  // ⚠️ Nolli pog'ona ham chizilsa, chiplar qatori doim to'rtta bo'lib,
  // "bugun jiddiy holat bormi" degan savolga bir qarashda javob
  // bermasdi: ko'z avval raqamni o'qishi kerak bo'lardi.
  const counts = SEVERITY_ORDER.map((key) => ({
    key,
    count: severity[key] ?? 0,
    meta: severityOf(key),
  })).filter((item) => item.count > 0);

  return (
    <Panel
      title="Ogohlantirishlar"
      hint="Ochiq va ko'rib chiqilayotgan holatlar"
      icon={ShieldAlert}
      tone="alert"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Ochiq ogohlantirish yo'q — hammasi joyida"
      className={className}
      action={
        counts.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-1">
            {counts.map(({ key, count, meta }) => (
              <span key={key} className={cn(CHIP.base, meta.chip)}>
                <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden="true" />
                {meta.label}
                <span className="tabular-nums">{count}</span>
              </span>
            ))}
          </div>
        )
      }
    >
      {/* ⚠️ Ro'yxat O'ZI aylanadi (`max-h`), sahifa emas: ogohlantirishlar
          soni oldindan noma'lum va yuzta qator kelganda qo'shni bloklar
          ekranning pastiga surilib ketmasligi kerak. Balandlik shu blokda
          520px — u bo'limning markaziy ro'yxati va qo'shnilaridan uzunroq
          bo'lishi kerak, shuning uchun `ROW.scroll` ning 420px i ataylab
          qayta yoziladi. */}
      <ul className={cn(ROW.list, ROW.scroll, "min-h-0 flex-1 max-h-[520px]")}>
        {rows.map((alert, index) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            canManage={canManage}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
            onSelectUser={onSelectUser}
            isBusy={busyId === alert.id}
            // ⚠️ Kirish kechikishi O'NINCHI QATORDA TO'XTAYDI: yuzta
            // ogohlantirish kelganda oxirgisi bir necha soniya kutib
            // turmasligi kerak — ro'yxat darhol to'liq bo'lishi shart.
            delay={contentDelay(delay, Math.min(index, 10))}
          />
        ))}
      </ul>
    </Panel>
  );
};

/**
 * AMAL TUGMASI — mayda, chegarasiz, hover'da fon.
 *
 * ⚠️ Sinf satri KOMPONENT ICHIDA, tokens faylda emas: bu 11px lik
 * INTERAKTIV o'lcham Sentinel tipografiya shkalasining (besh daraja)
 * bir qismi emas va u faqat shu blokda ishlatiladi. Tokensga qo'shilsa,
 * shkala "matn darajalari" bo'lishdan to'xtab, aralash to'plamga
 * aylanardi. Yagona satr sifatida bu yerda turadi — komponent ichida
 * uch joyda qo'lda takrorlanmaydi.
 */
const ACTION_BTN =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold " +
  "transition-colors duration-200 ease-out-quint " +
  "disabled:cursor-not-allowed disabled:opacity-55";

const ACTION_TONE = {
  acknowledge: "text-amber-700 hover:bg-amber-50",
  resolve: "text-emerald-700 hover:bg-emerald-50",
};

const AlertRow = ({
  alert,
  canManage,
  onAcknowledge,
  onResolve,
  onSelectUser,
  isBusy,
  delay,
}) => {
  const meta = severityOf(alert.severity);
  const state = statusOf(alert.status);

  const isOpen = alert.status === "open";
  const isResolved = alert.status === "resolved";
  const canSelectUser = Boolean(alert.userId && alert.name && onSelectUser);

  return (
    <li className={MOTION.alertIn} style={{ animationDelay: `${delay}ms` }}>
      {/* ⚠️ Qator KO'P QATORLI, shuning uchun `ROW.base` ning
          `items-center` i `items-start` ga almashtiriladi: tafsilot ikki
          qatorga cho'zilganda sarlavha ham, amal tugmalari ham qatorning
          O'RTASIGA emas, YUQORISIGA tekislanishi kerak — aks holda uzun
          qatorda tugmalar matndan pastga tushib ketardi. */}
      <div className={cn(ROW.base, ROW.hover, "items-start")}>
        {/*
          ⚠️ JIDDIYLIK RELSI DOIMIY — `ROW.rail` EMAS.
          `ROW.rail` faqat hover/fokusda ochiladi, chunki u BEZAK: "shu
          qator tanlandi" degan javob. Bu rels esa MA'NO tashiydi —
          qatorning jiddiyligi sichqoncha ustida turgan-turmaganiga
          bog'liq bo'lishi mumkin emas. Shu sababli shakl qo'lda
          yoziladi va `scale-y-0` siz turadi.
        */}
        <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", meta.rail)} />

        <div className="min-w-0 flex-1">
          {/* Sarlavha + yorliqlar */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className={cn(T.tdName, "min-w-0 break-words")}>{alert.title}</span>
            <span className={cn(CHIP.base, meta.chip)}>{meta.label}</span>
            <span className={cn(CHIP.base, state.chip)}>{state.label}</span>

            {/* ⚠️ Takroriylik — alohida signal: "bir marta bo'ldi" bilan
                "qirq marta takrorlandi" bir xil ko'rinmasligi kerak. */}
            {alert.hitCount > 1 && (
              <span className={cn(CHIP.base, CHIP.tone.neutral, "tabular-nums")}>
                ×{alert.hitCount}
              </span>
            )}
          </div>

          {/* ⚠️ Ikki qatorga kesiladi (`line-clamp-2`): tafsilot uzun
              bo'lishi mumkin va u qatorlarning balandligini teng saqlashi
              kerak. To'liq matn `title` atributida — hover'da ko'rinadi. */}
          {alert.detail && (
            <p className={cn(T.td, "mt-1 line-clamp-2")} title={alert.detail}>
              {alert.detail}
            </p>
          )}

          {/* Kontekst satri — server bergan tayyor yorliqlar */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className={T.meta}>{alert.typeLabel ?? "—"}</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            {/* ⚠️ Sana QO'LDA YIG'ILMAYDI: server `lastSeenLabel` ni
                tayyor formatda beradi. Bo'sh bo'lsa em-dash. */}
            <span className={cn(T.meta, "tabular-nums")}>{alert.lastSeenLabel || "—"}</span>

            {alert.name && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                {canSelectUser ? (
                  <button
                    type="button"
                    onClick={() => onSelectUser(alert.userId)}
                    className={cn(
                      T.meta,
                      "rounded underline-offset-2 transition-colors duration-200 ease-out-quint",
                      "hover:text-slate-900 hover:underline",
                    )}
                  >
                    {alert.name}
                  </button>
                ) : (
                  <span className={T.meta}>{alert.name}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* ⚠️ RUXSAT YO'Q BO'LSA TUGMA UMUMAN CHIZILMAYDI — o'chirilgan
            holda ham emas. Bosib bo'lmaydigan tugma "menda bu huquq
            bormi" degan savolni tug'diradi va foydalanuvchini xato
            xabariga olib borardi; mavjud bo'lmagan amalni ko'rsatib
            turishning ma'nosi yo'q. */}
        {canManage && (
          <div className="flex shrink-0 items-center gap-0.5">
            {isResolved ? (
              <CheckCircle2 className="size-4 text-emerald-500" strokeWidth={2.2} />
            ) : (
              <>
                {isOpen && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onAcknowledge?.(alert)}
                    className={cn(ACTION_BTN, ACTION_TONE.acknowledge)}
                    title="Ko'rib chiqilmoqda deb belgilash"
                  >
                    {isBusy ? (
                      <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
                    ) : (
                      <Eye className="size-3" strokeWidth={2.4} />
                    )}
                    Ko'rib chiqildi
                  </button>
                )}

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onResolve?.(alert)}
                  className={cn(ACTION_BTN, ACTION_TONE.resolve)}
                  title="Ogohlantirishni yopish"
                >
                  {isBusy ? (
                    <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
                  ) : (
                    <Check className="size-3" strokeWidth={2.4} />
                  )}
                  Yopish
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export default AlertsPanel;
