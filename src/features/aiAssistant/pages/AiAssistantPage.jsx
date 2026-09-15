// React
import { useCallback, useMemo, useRef, useState } from "react";

// Router
import { useNavigate, useParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Lock, X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/components/shadcn/sheet";
import ChatHeader from "../components/ChatHeader";
import Composer from "../components/Composer";
import ConversationSidebar from "../components/ConversationSidebar";
import IconButton from "../components/IconButton";
import MessageList from "../components/MessageList";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import useAssistantChat from "../hooks/useAssistantChat";
import { AudioPlaybackContext, useAudioPlayerInstance } from "../hooks/useAudioPlayback";

// Queries
import { aiAssistantQueries } from "../queries/aiAssistant.queries";

// Lib
import { buildThread } from "../lib/thread";

// Data
import { COPY, DEFAULT_LIMITS } from "../data/aiAssistant.data";
import { SURFACE } from "../data/assistant.tokens";

/**
 * AI YORDAMCHI — suhbat ekrani (`/ai-assistant` va `/ai-assistant/:conversationId`).
 *
 * ⚠️ IKKALA YO'L BITTA MARSHRUT (`:conversationId?`). Yangi suhbatda
 * birinchi javob kelayotganda manzil `/ai-assistant/<id>` ga almashadi;
 * alohida marshrutlar bo'lsa, sahifa qayta o'rnatilib, oqim holati (yozilayotgan
 * javob) yo'qolardi.
 *
 * ⚠️ FAQAT TIZIM EGASI. Server `role === "owner"` ni qat'iy tekshiradi;
 * bu yerda esa so'rovlar umuman yuborilmasligi uchun ish maydoni faqat
 * egaga chiziladi (`PermissionGuard` + `ROUTE_PERMISSIONS` ham yopadi).
 *
 * ⚠️ BALANDLIK EKRANGA TENG, SAHIFA SURILMAYDI: suriladigan qism faqat
 * xabarlar. `100svh` dan maket chegaralari ayiriladi — mobil sarlavha
 * (3rem) va konteyner paddingi (`p-4` → 2rem, `md:py-2` → 1rem).
 */
const AiAssistantPage = () => {
  const { isOwner } = usePermissions();

  if (!isOwner) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState icon={Lock} title={COPY.ownerOnlyTitle} description={COPY.ownerOnlyHint} />
      </Card>
    );
  }

  return <AssistantWorkspace />;
};

const NOT_FOUND_STATUSES = new Set([400, 404]);

const AssistantWorkspace = () => {
  const { conversationId: routeId } = useParams();
  const conversationId = routeId ?? null;
  const navigate = useNavigate();

  const player = useAudioPlayerInstance();
  const composerRef = useRef(null);
  const listRef = useRef(null);
  const [listOpen, setListOpen] = useState(false);

  const status = useQuery(aiAssistantQueries.status());
  const detail = useQuery(aiAssistantQueries.conversation(conversationId));

  const handleConversationCreated = useCallback(
    (id) => navigate(`/ai-assistant/${id}`, { replace: true }),
    [navigate],
  );

  const chat = useAssistantChat({
    routeConversationId: conversationId,
    onConversationCreated: handleConversationCreated,
    player,
  });

  // Jonli tur faqat O'Z suhbatida ko'rsatiladi (yangi suhbatda — `null`).
  const liveHere = chat.live && (chat.live.conversationId ?? null) === conversationId ? chat.live : null;
  const streamingHere = chat.isStreaming && Boolean(liveHere);
  const lockedElsewhere = chat.isStreaming && !liveHere;

  const serverMessages = conversationId ? detail.data?.messages : undefined;
  const messages = useMemo(() => buildThread(serverMessages, liveHere), [serverMessages, liveHere]);

  let threadState = "ready";
  if (conversationId && !liveHere) {
    if (detail.isPending) threadState = "loading";
    else if (detail.isError && !detail.data) {
      threadState = NOT_FOUND_STATUSES.has(detail.error?.response?.status) ? "not_found" : "error";
    }
  }

  const configured = status.data?.configured ?? true;
  const limits = status.data?.limits ?? DEFAULT_LIMITS;
  const composerDisabled = !configured || threadState !== "ready";
  const title = conversationId ? detail.data?.conversation?.title : null;

  const { send, sendVoice, stop } = chat;

  const handleSend = useCallback(
    (text) => {
      listRef.current?.stickToBottom();
      return send(text, conversationId);
    },
    [send, conversationId],
  );

  // Taklif kartasi va "Qayta yuborish": server rad etsa matn yozish
  // maydoniga qaytadi (Composer o'z yuborishida buni o'zi qiladi).
  const handleSendFromThread = useCallback(
    async (text) => {
      const result = await handleSend(text);
      if (result && !result.ok && result.restoreText) composerRef.current?.setText(result.restoreText);
      return result;
    },
    [handleSend],
  );

  const handleSendVoice = useCallback(
    (blob, durationMs) => {
      listRef.current?.stickToBottom();
      return sendVoice(blob, durationMs, conversationId);
    },
    [sendVoice, conversationId],
  );

  const handleNewConversation = useCallback(() => {
    setListOpen(false);
    navigate("/ai-assistant");
    requestAnimationFrame(() => composerRef.current?.focus());
  }, [navigate]);

  const handleDeleted = useCallback(
    (id) => {
      if (id === conversationId) navigate("/ai-assistant", { replace: true });
    },
    [conversationId, navigate],
  );

  const closeList = useCallback(() => setListOpen(false), []);

  const sidebarProps = {
    activeId: conversationId,
    streamingId: chat.streamingConversationId,
    onNewConversation: handleNewConversation,
    onDeleted: handleDeleted,
  };

  return (
    <AudioPlaybackContext.Provider value={player}>
      {/* ⚠️ Suhbatlar paneli EKRAN kengligiga emas, ISH MAYDONI kengligiga
          qarab ko'rinadi (container query). 1024–1280px da chap menyu ochiq
          bo'lsa suhbat oynasiga ~420px qolib, takliflar va jadvallar siqilib
          ketardi; menyu yopilganda esa xuddi shu ekranda panel sig'adi. */}
      <div className="flex h-[calc(100svh-5rem)] min-h-[440px] gap-3 [container-name:workspace] [container-type:inline-size] md:h-[calc(100svh-1rem)]">
        <aside
          className={cn(
            SURFACE.card,
            "hidden w-[288px] shrink-0 overflow-hidden [@container_workspace_(min-width:880px)]:flex [@container_workspace_(min-width:880px)]:flex-col",
          )}
        >
          <ConversationSidebar {...sidebarProps} className="h-full" />
        </aside>

        <section
          aria-label={COPY.pageTitle}
          className={cn(
            SURFACE.card,
            "flex min-w-0 flex-1 flex-col overflow-hidden [container-name:chat] [container-type:inline-size]",
          )}
        >
          <ChatHeader
            title={title}
            branchName={status.data?.branch?.name}
            onOpenList={() => setListOpen(true)}
            onNewConversation={handleNewConversation}
          />

          {!configured && (
            <p
              role="alert"
              className="shrink-0 border-b border-amber-200/70 bg-amber-50 px-4 py-2.5 text-[12.5px] font-medium leading-5 text-amber-900"
            >
              {COPY.notConfigured}
            </p>
          )}

          <MessageList
            ref={listRef}
            conversationId={conversationId}
            messages={messages}
            state={threadState}
            onSend={handleSendFromThread}
            sendDisabled={composerDisabled || chat.isStreaming}
            voiceOutput={status.data?.voiceOutput ?? true}
            onNewConversation={handleNewConversation}
            onReload={() => detail.refetch()}
          />

          <Composer
            ref={composerRef}
            conversationKey={conversationId ?? "new"}
            onSend={handleSend}
            onSendVoice={handleSendVoice}
            onStop={stop}
            streamingHere={streamingHere}
            lockedElsewhere={lockedElsewhere}
            disabled={composerDisabled}
            voiceEnabled={status.data?.voiceInput ?? true}
            limits={limits}
          />
        </section>
      </div>

      {/* Tor ekran: suhbatlar ro'yxati chap tomondan */}
      <Sheet open={listOpen} onOpenChange={setListOpen}>
        <SheetContent
          side="left"
          className="flex w-[300px] max-w-[88vw] flex-col bg-white p-0 sm:max-w-[320px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{COPY.conversations}</SheetTitle>
          <SheetDescription className="sr-only">{COPY.conversationsSheetHint}</SheetDescription>
          <ConversationSidebar
            {...sidebarProps}
            className="h-full"
            onNavigate={closeList}
            headerAction={
              <SheetClose asChild>
                <IconButton icon={X} label={COPY.close} />
              </SheetClose>
            }
          />
        </SheetContent>
      </Sheet>
    </AudioPlaybackContext.Provider>
  );
};

export default AiAssistantPage;
