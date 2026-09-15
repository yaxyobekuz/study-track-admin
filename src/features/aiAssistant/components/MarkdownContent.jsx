// React
import { memo } from "react";

// Router
import { Link } from "react-router-dom";

// Markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * YORDAMCHI JAVOBI — Markdown (GFM jadvallari bilan).
 *
 * ⚠️ HTML HECH QACHON CHIZILMAYDI. `react-markdown` xom HTML ni sukut
 * bo'yicha matn qiladi va `rehype-raw` ATAYLAB ulanmagan: model matni
 * vosita natijalaridan (o'quvchi ismi, lid izohi) iqtibos keltirishi mumkin
 * va u yerdagi `<img onerror>` egasining sessiyasida ishga tushardi.
 *
 * ⚠️ RASM CHIZILMAYDI — faqat `alt` matni. Tashqi rasm havolasi ochilganda
 * brauzer so'rov yuboradi va egasining IP/vaqtini begona serverga beradi.
 *
 * ⚠️ GLOBAL `table` USLUBI BEKOR QILINADI (`index.css`: har jadval 934px,
 * ko'k sarlavha, markazlangan oq matn). `MiniTable` dagi retsept: utility
 * sinflari base qatlamidan kuchli.
 *
 * ⚠️ ICHKI HAVOLA SHU OYNADA (`Link`), TASHQISI YANGI OYNADA. Ichki havola
 * yangi oynada ochilsa, ega suhbatdan chiqib ketgandek bo'lardi.
 */

const TABLE_RESET =
  "w-full min-w-max border-collapse text-left " +
  "[&_thead]:bg-slate-50 [&_tbody]:divide-y-0 [&_tbody_tr]:bg-transparent [&_tbody_tr:last-child]:bg-transparent";

const REMARK_PLUGINS = [remarkGfm];

const isInternalHref = (href) => typeof href === "string" && href.startsWith("/") && !href.startsWith("//");

const components = {
  h1: ({ node, ...props }) => <h3 className="mb-2 mt-6 text-[15px] font-semibold text-slate-900 first:mt-0" {...props} />,
  h2: ({ node, ...props }) => <h3 className="mb-2 mt-6 text-[15px] font-semibold text-slate-900 first:mt-0" {...props} />,
  h3: ({ node, ...props }) => <h3 className="mb-2 mt-5 text-[15px] font-semibold text-slate-900 first:mt-0" {...props} />,
  h4: ({ node, ...props }) => <h4 className="mb-1.5 mt-4 text-[14.5px] font-semibold text-slate-900 first:mt-0" {...props} />,
  h5: ({ node, ...props }) => <h4 className="mb-1.5 mt-4 text-[14.5px] font-semibold text-slate-900 first:mt-0" {...props} />,
  h6: ({ node, ...props }) => <h4 className="mb-1.5 mt-4 text-[14.5px] font-semibold text-slate-900 first:mt-0" {...props} />,
  p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="mb-3 list-disc space-y-1 pl-5 marker:text-slate-400 last:mb-0" {...props} />,
  ol: ({ node, ...props }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 marker:text-slate-500 marker:tabular-nums last:mb-0" {...props} />
  ),
  li: ({ node, ...props }) => <li className="pl-0.5 [&>p]:mb-1" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  hr: () => <hr className="my-5 border-slate-100" />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="mb-3 border-l-2 border-slate-200 pl-3 text-slate-600 last:mb-0" {...props} />
  ),
  a: ({ node, href, children, ...props }) => {
    const className =
      "font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary";
    if (isInternalHref(href)) {
      return (
        <Link to={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  },
  img: ({ alt }) => (alt ? <span className="text-slate-500">[{alt}]</span> : null),
  // ⚠️ Blok kodi `pre` ichida — inline uslub `pre` da bekor qilinadi.
  // `react-markdown` 10 `inline` belgisini bermaydi; tilsiz bir qatorli
  // blokni className/yangi qator bo'yicha taxmin qilish xato berardi.
  code: ({ node, className, ...props }) => (
    <code
      className={cn("rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px] text-slate-800 [box-decoration-break:clone]", className)}
      {...props}
    />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className={
        "mb-3 overflow-x-auto rounded-[10px] bg-slate-50 p-3 ring-1 ring-inset ring-slate-200 [overflow-wrap:normal] last:mb-0 " +
        "[&>code]:block [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[12.5px] [&>code]:leading-6"
      }
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="mb-3 max-w-full overflow-x-auto rounded-[10px] ring-1 ring-inset ring-slate-200 last:mb-0">
      <table className={TABLE_RESET} {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-slate-50" {...props} />,
  th: ({ node, style, ...props }) => (
    <th
      className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500"
      style={style?.textAlign === "right" ? { textAlign: "right" } : undefined}
      {...props}
    />
  ),
  td: ({ node, style, ...props }) => (
    <td
      className="border-t border-slate-100 px-3 py-2 align-top text-[13.5px] leading-6 text-slate-700"
      style={style?.textAlign === "right" ? { textAlign: "right" } : undefined}
      {...props}
    />
  ),
};

/**
 * Yozish kursori — oxirgi paragraf/ro'yxat bandi/sarlavha oxirida.
 *
 * ⚠️ Alohida element emas, psevdo-element: kursor blok elementdan keyin
 * qo'yilsa yangi qatorga tushib, matndan ajralib turardi.
 */
const CARET =
  "[&>:is(p,h3,h4):last-child]:after:ml-0.5 [&>:is(p,h3,h4):last-child]:after:inline-block " +
  "[&>:is(p,h3,h4):last-child]:after:h-[1.05em] [&>:is(p,h3,h4):last-child]:after:w-[2px] " +
  "[&>:is(p,h3,h4):last-child]:after:translate-y-[0.18em] [&>:is(p,h3,h4):last-child]:after:bg-slate-400 " +
  "[&>:is(p,h3,h4):last-child]:after:content-[''] motion-safe:[&>:is(p,h3,h4):last-child]:after:animate-breathe " +
  "[&>:is(ul,ol):last-child>li:last-child]:after:ml-0.5 [&>:is(ul,ol):last-child>li:last-child]:after:inline-block " +
  "[&>:is(ul,ol):last-child>li:last-child]:after:h-[1.05em] [&>:is(ul,ol):last-child>li:last-child]:after:w-[2px] " +
  "[&>:is(ul,ol):last-child>li:last-child]:after:translate-y-[0.18em] [&>:is(ul,ol):last-child>li:last-child]:after:bg-slate-400 " +
  "[&>:is(ul,ol):last-child>li:last-child]:after:content-[''] motion-safe:[&>:is(ul,ol):last-child>li:last-child]:after:animate-breathe";

/**
 * @param {{ content: string, streaming?: boolean, className?: string }} props
 */
const MarkdownContent = ({ content, streaming = false, className }) => (
  <div className={cn("min-w-0 text-[14.5px] leading-7 text-slate-800 [overflow-wrap:anywhere]", streaming && CARET, className)}>
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={components} skipHtml>
      {content}
    </ReactMarkdown>
  </div>
);

export default memo(MarkdownContent);
