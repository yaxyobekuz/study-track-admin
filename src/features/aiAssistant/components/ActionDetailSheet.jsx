// Router
import { Link } from "react-router-dom";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/components/shadcn/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/shared/components/shadcn/drawer";
import ActionCard from "./ActionCard";

// Hooks
import useMediaQuery from "@/shared/hooks/useMediaQuery";

// Data
import { ACTIONS_PAGE_COPY } from "../data/aiAssistant.data";
import { T } from "../data/assistant.tokens";

/**
 * AMAL TAFSILOTLARI — o'ngdan panel (keng ekran) yoki pastdan drawer (<480px).
 *
 * ⚠️ KARTA SUHBATDAGI BILAN AYNI KOMPONENT (`ActionCard`). Tasdiq kutayotgan
 * amal shu yerdan ham tasdiqlanadi va bekor qilinadi — ikkinchi, soddaroq
 * tasdiq oynasi yozilsa, "Tushundim" belgisi yoki `preview_changed` kabi
 * himoyalar birida tushib qolardi.
 *
 * @param {{ action: object|null, open: boolean, onOpenChange: (open: boolean) => void, onUpdated: (action: object) => void }} props
 */
const ActionDetailSheet = ({ action, open, onOpenChange, onUpdated }) => {
  const isWide = useMediaQuery("(min-width: 480px)");

  const renderBody = (Title, Description) => (
    <>
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <Title className={cn(T.label, "text-slate-500")}>{ACTIONS_PAGE_COPY.sheetTitle}</Title>
        <Description className="sr-only">Taklif, qaror va natija</Description>
        {action && (
          <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12.5px] leading-5">
            <dt className="text-slate-500">{ACTIONS_PAGE_COPY.createdAt}</dt>
            <dd className="text-slate-800">{action.createdAtLabel}</dd>
            {action.executedAtLabel && (
              <>
                <dt className="text-slate-500">{ACTIONS_PAGE_COPY.executedAt}</dt>
                <dd className="text-slate-800">{action.executedAtLabel}</dd>
              </>
            )}
            <dt className="text-slate-500">{ACTIONS_PAGE_COPY.conversation}</dt>
            <dd className="min-w-0">
              <Link
                to={`/ai-assistant/${action.conversationId}`}
                className="block truncate font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
              >
                {action.conversationTitle || ACTIONS_PAGE_COPY.openConversation}
              </Link>
            </dd>
          </dl>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {action && <ActionCard action={action} onUpdated={onUpdated} />}
      </div>
    </>
  );

  if (isWide) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 bg-white p-0 sm:max-w-[520px]">
          {renderBody(SheetTitle, SheetDescription)}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="flex max-h-[92svh] flex-col">{renderBody(DrawerTitle, DrawerDescription)}</DrawerContent>
    </Drawer>
  );
};

export default ActionDetailSheet;
