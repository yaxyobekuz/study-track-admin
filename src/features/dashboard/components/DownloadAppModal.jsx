// React
import { useState } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";

// Data
import { downloadPlatforms } from "../data/downloadPlatforms.data";

const DownloadAppModal = () => (
  <ModalWrapper
    name="downloadApp"
    title="Ilovani yuklab olish"
    description="Platformani tanlab, ilovani yuklab olishingiz mumkin."
  >
    <Content />
  </ModalWrapper>
);

const Content = ({ close }) => {
  const [selected, setSelected] = useState(
    downloadPlatforms.find((p) => !p.disabled)?.id ?? null,
  );

  const handleDownload = () => {
    const platform = downloadPlatforms.find((p) => p.id === selected);
    if (platform?.url) {
      window.open(platform.url, "_blank", "noopener,noreferrer");
    }

    close();
  };

  return (
    <div className="space-y-5">
      {/* Platform buttons */}
      <div className="flex flex-col gap-2.5">
        {downloadPlatforms.map((platform) => {
          const isSelected = selected === platform.id;

          return (
            <button
              key={platform.id}
              disabled={platform.disabled}
              onClick={() => !platform.disabled && setSelected(platform.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-xl border-2 p-3 pr-5 text-left transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed outline-primary",
                isSelected && !platform.disabled
                  ? "border-primary bg-background text-primary"
                  : "border-border bg-white text-foreground",
              )}
            >
              {/* Platform Logo */}
              <span className="flex items-center justify-center size-10 rounded-lg shrink-0 bg-background">
                <img
                  width={28}
                  height={28}
                  className="size-7"
                  src={platform.icon}
                  alt={platform.label}
                />
              </span>

              {/* Platform Label and Sublabel */}
              <span className="flex flex-col min-w-0">
                {/* Lable */}
                <span className="font-semibold text-sm leading-tight">
                  {platform.label}
                </span>

                {/* Sublabel */}
                <span className="text-xs text-muted-foreground mt-0.5">
                  {platform.disabled ? "Tez kunda" : platform.sublabel}
                </span>
              </span>

              {/* Radio indicator */}
              <span className="ml-auto shrink-0">
                <span
                  className={cn(
                    "flex items-center justify-center size-4 rounded-full border-2 transition-colors",
                    isSelected && !platform.disabled
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40 bg-transparent",
                  )}
                >
                  {isSelected && !platform.disabled && (
                    <span className="size-2 rounded-full bg-white block" />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-4 w-full xs:flex-row xs:justify-end">
        <Button onClick={close} variant="secondary" className="w-full xs:w-32">
          Yopish
        </Button>

        <Button
          onClick={handleDownload}
          disabled={!selected}
          className="w-full xs:w-32"
        >
          Yuklash
        </Button>
      </div>
    </div>
  );
};

export default DownloadAppModal;
