// Router
import { Link } from "react-router-dom";

// Icons
import { History, PanelLeft, Plus } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import HintTooltip from "./HintTooltip";
import IconButton from "./IconButton";

// Data
import { COPY } from "../data/aiAssistant.data";
import { BUTTON, T } from "../data/assistant.tokens";

/**
 * SUHBAT SARLAVHASI — nom, filial, amallar tarixi.
 *
 * ⚠️ FILIAL NOMI KO'RINADI (joy yetganda). Suhbat va uning takliflari joriy
 * filialga tegishli (server schema'si bo'yicha); ega boshqa filialga o'tsa,
 * bu suhbatlar ro'yxatdan yo'qoladi. Filial yozilmasa "suhbatim qayoqqa
 * ketdi" degan savol tug'ilardi.
 *
 * ⚠️ KENGLIK — SUHBAT OYNASINIKI (container query), ekranniki emas. 768px
 * ekranda chap menyu ochiq bo'lsa oyna ~470px: sarlavha, filial, "+" va
 * "Amallar tarixi" bir qatorga sig'masdan nom "Sentabr oyi mol..." bo'lib
 * qolardi. Tor oynada filial yashiriladi, havola esa ikonkaga aylanadi.
 *
 * Suhbatlar paneli yashirin bo'lganda (`workspace` < 880px) uni ochish va
 * yangi suhbat tugmalari shu yerda.
 */
const ChatHeader = ({ title, branchName, onOpenList, onNewConversation }) => (
  <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 px-2.5 sm:px-4">
    <div className="-ml-1 flex items-center [@container_workspace_(min-width:880px)]:hidden">
      <IconButton icon={PanelLeft} label={COPY.conversations} onClick={onOpenList} tooltipSide="bottom" />
    </div>

    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <h1 className={cn(T.threadTitle, "truncate")}>{title || COPY.newConversation}</h1>
      {branchName && (
        <span className="hidden max-w-[160px] shrink-0 truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-slate-600 [@container_chat_(min-width:560px)]:inline">
          {branchName}
        </span>
      )}
    </div>

    <div className="flex shrink-0 items-center gap-1">
      <div className="[@container_workspace_(min-width:880px)]:hidden">
        <IconButton icon={Plus} label={COPY.newConversation} onClick={onNewConversation} tooltipSide="bottom" />
      </div>
      <Link
        to="/ai-assistant/actions"
        className={cn(
          BUTTON.base,
          BUTTON.size.default,
          BUTTON.tone.secondary,
          "hidden [@container_chat_(min-width:480px)]:inline-flex",
        )}
      >
        {COPY.actionsHistory}
      </Link>
      <HintTooltip content={COPY.actionsHistory} side="bottom">
        <Link
          to="/ai-assistant/actions"
          aria-label={COPY.actionsHistory}
          className={cn(BUTTON.base, BUTTON.icon.default, BUTTON.tone.ghost, "[@container_chat_(min-width:480px)]:hidden")}
        >
          <History strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </HintTooltip>
    </div>
  </header>
);

export default ChatHeader;
