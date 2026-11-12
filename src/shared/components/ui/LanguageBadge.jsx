// Data — o'quv tili yorliqlari (server bilan qo'lda sinxron)
import {
  languageLabel,
  languageClassLabel,
  languageColor,
} from "@/shared/data/teachingLanguage.data";

/**
 * O'QUV TILI BELGISI — "O'zbek" / "Rus sinf" kabi.
 *
 * ⚠️ BITTA KOMPONENT, chunki til to'rtta ekranda ko'rinadi (sinflar,
 * fanlar bo'yicha mavzular, fan → sinflar, diagnostika testi). To'rt
 * nusxada rang va shakl asta-sekin uzoqlashardi (`devices.md` §10 dagi
 * `GuardTable` bilan AYNI mulohaza).
 *
 * @param {object} props
 * @param {string} props.language - `uz` | `ru` | `en`
 * @param {boolean} [props.asClass] - "Rus sinf" shaklida yozilsinmi
 */
const LanguageBadge = ({ language, asClass = false, className = "" }) => {
  if (!language) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${languageColor(
        language,
      )} ${className}`}
    >
      {asClass ? languageClassLabel(language) : languageLabel(language)}
    </span>
  );
};

export default LanguageBadge;
