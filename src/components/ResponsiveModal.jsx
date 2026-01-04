// Utils
import { cn } from "@/utils/tailwind.utils";

// React
import { cloneElement, useState } from "react";

// Hooks
import useModal from "@/hooks/useModal.hook";
import useMediaQuery from "@/hooks/useMediaQuery.hook";

// Ui components
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const ResponsiveModal = ({
  children,
  name = "",
  className = "",
  description = "",
  title = "Modal sarlavhasi",
}) => {
  const { closeModal, isOpen, data } = useModal(name);
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const hanldeCloseModal = (data) => !isLoading && closeModal(name, data);

  const body = cloneElement(children, {
    isLoading,
    setIsLoading,
    close: hanldeCloseModal,
    ...(data || {}),
  });

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={hanldeCloseModal}>
        <DialogContent className={cn("max-w-md", className)}>
          {/* Header */}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {/* Body */}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={hanldeCloseModal}>
      <DrawerContent className={cn("px-5 pb-5", className)}>
        {/* Header */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Body */}
        {body}
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveModal;
