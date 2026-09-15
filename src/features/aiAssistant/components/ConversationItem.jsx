// React
import { memo, useEffect, useRef, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { Ellipsis } from "lucide-react";

// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/shadcn/popover";
import AssistantButton from "./AssistantButton";
import IconButton from "./IconButton";
import Spinner from "./Spinner";

// Queries
import { useDeleteConversation, useRenameConversation } from "../queries/aiAssistant.mutations";

// Lib
import { getErrorMessage } from "../lib/errors";

// Data
import { COPY } from "../data/aiAssistant.data";

const MAX_TITLE = 120;

/**
 * SUHBATLAR RO'YXATIDAGI BITTA QATOR.
 *
 * ⚠️ HAVOLA VA "⋯" TUGMASI QO'SHNI, ICHMA-ICH EMAS. Tugma havola ichida
 * bo'lsa (`<a><button>`), HTML yaroqsiz bo'ladi va bosish suhbatni ham
 * ochib yuborardi.
 *
 * ⚠️ O'CHIRISH TASDIG'I SHU MENYUNING ICHIDA (ikkinchi ko'rinish). Menyu
 * yopilib, alohida popover ochilganda langar (menyu bandi) yo'qolib, oyna
 * ekran burchagida osilib qolardi — `ConfirmPopover` izohidagi muammo.
 *
 * ⚠️ NOM INLINE TAHRIRLANADI: Enter — saqlash, Esc — bekor, fokus
 * chiqsa — saqlash. O'zgarmagan yoki bo'sh nom serverga yuborilmaydi.
 *
 * @param {object} props
 * @param {object} props.conversation
 * @param {boolean} props.active
 * @param {boolean} props.streaming - shu suhbatda javob yozilmoqda
 * @param {() => void} [props.onNavigate] - mobil oynani yopish uchun
 * @param {(id: string) => void} props.onDeleted
 */
const ConversationItem = ({ conversation, active, streaming, onNavigate, onDeleted }) => {
  const rename = useRenameConversation();
  const remove = useDeleteConversation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState("menu");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const skipBlurRef = useRef(false);

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    input?.focus();
    input?.select();
  }, [editing]);

  const openMenu = (open) => {
    setMenuOpen(open);
    if (open) setMenuView("menu");
  };

  const startEditing = () => {
    setMenuOpen(false);
    setDraft(conversation.title);
    skipBlurRef.current = false;
    setEditing(true);
  };

  const commit = () => {
    const title = draft.replace(/\s+/g, " ").trim();
    setEditing(false);
    if (!title || title === conversation.title) return;
    rename.mutate(
      { id: conversation.id, title },
      { onError: (error) => toast.error(getErrorMessage(error, "Nomni o'zgartirib bo'lmadi")) },
    );
  };

  const handleEditKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      skipBlurRef.current = true;
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      skipBlurRef.current = true;
      setEditing(false);
    }
  };

  const handleBlur = () => {
    if (skipBlurRef.current) return;
    commit();
  };

  const handleDelete = () => {
    remove.mutate(conversation.id, {
      onSuccess: () => {
        setMenuOpen(false);
        onDeleted(conversation.id);
        toast.success("Suhbat o'chirildi");
      },
      onError: (error) => toast.error(getErrorMessage(error, "Suhbatni o'chirib bo'lmadi")),
    });
  };

  if (editing) {
    return (
      <li className="px-1 py-0.5">
        <label htmlFor={`rename-${conversation.id}`} className="sr-only">
          Suhbat nomi
        </label>
        <input
          id={`rename-${conversation.id}`}
          ref={inputRef}
          value={draft}
          maxLength={MAX_TITLE}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleBlur}
          className="h-9 w-full rounded-[10px] bg-white px-2.5 text-[13px] text-slate-900 outline-none ring-2 ring-primary/40"
        />
      </li>
    );
  }

  return (
    <li className="group/item relative">
      <Link
        to={`/ai-assistant/${conversation.id}`}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-[10px] py-2 pl-2.5 pr-10 outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
          active ? "bg-slate-100" : "hover:bg-slate-50",
        )}
      >
        <span
          className={cn(
            "block truncate text-[13px] leading-5",
            active ? "font-semibold text-slate-900" : "font-medium text-slate-700",
          )}
        >
          {conversation.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-4 text-slate-500">
          {streaming ? (
            <>
              <Spinner className="size-2.5 border" />
              {COPY.streamingMeta}
            </>
          ) : (
            conversation.lastMessageAtLabel
          )}
        </span>
      </Link>

      <Popover open={menuOpen} onOpenChange={openMenu}>
        <PopoverTrigger asChild>
          <IconButton
            icon={Ellipsis}
            size="compact"
            label="Suhbat amallari"
            tooltipSide="right"
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "opacity-0 focus-visible:opacity-100 group-hover/item:opacity-100 data-[state=open]:opacity-100",
              "[@media(hover:none)]:opacity-100",
              active && "opacity-100",
            )}
          />
        </PopoverTrigger>

        <PopoverContent align="end" sideOffset={4} className="w-60 rounded-[14px] p-1.5">
          {menuView === "menu" ? (
            <div role="menu" className="flex flex-col">
              <MenuButton onClick={startEditing}>Nomini o'zgartirish</MenuButton>
              <MenuButton danger onClick={() => setMenuView("confirm")}>
                O'chirish
              </MenuButton>
            </div>
          ) : (
            <div className="p-2">
              <p className="text-[13px] font-semibold text-slate-900">Suhbat o'chirilsinmi?</p>
              <p className="mt-1 text-[12px] leading-5 text-slate-500">
                Suhbat ro'yxatdan olib tashlanadi. Tasdiq kutayotgan takliflar bekor qilinadi, bajarilgan amallar
                tarixda qoladi.
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <AssistantButton size="compact" tone="ghost" onClick={() => setMenuView("menu")} disabled={remove.isPending}>
                  Bekor qilish
                </AssistantButton>
                <AssistantButton size="compact" tone="danger" onClick={handleDelete} loading={remove.isPending}>
                  O'chirish
                </AssistantButton>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </li>
  );
};

const MenuButton = ({ danger = false, onClick, children }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={cn(
      "flex h-9 w-full items-center rounded-[8px] px-2.5 text-left text-[13px] font-medium outline-none transition-colors",
      "focus-visible:bg-slate-100",
      danger ? "text-rose-700 hover:bg-rose-50 focus-visible:bg-rose-50" : "text-slate-700 hover:bg-slate-100",
    )}
  >
    {children}
  </button>
);

export default memo(ConversationItem);
