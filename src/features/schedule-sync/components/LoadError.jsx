// Icons
import { CircleAlert, RefreshCw } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

/**
 * Yuklash xatosi — "nima bo'ldi" va "qayta urinish" bir joyda.
 * Qayta urinishni faqat odam bosadi (avtomatik takror yo'q).
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {() => void} [props.onRetry]
 */
const LoadError = ({
  title = "Ma'lumotni yuklab bo'lmadi",
  description = "",
  onRetry,
}) => (
  <Card role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
    <CircleAlert className="size-8 text-red-400" strokeWidth={1.5} />

    <div className="space-y-1">
      <p className="font-medium text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>

    {onRetry && (
      <Button variant="outline" onClick={() => onRetry()}>
        <RefreshCw className="size-4" strokeWidth={1.5} />
        Qayta urinish
      </Button>
    )}
  </Card>
);

export default LoadError;
