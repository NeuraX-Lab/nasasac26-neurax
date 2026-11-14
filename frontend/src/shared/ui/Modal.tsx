import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export function Modal({
  title,
  children,
  open,
  onClose,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-scrim" />
        <Dialog.Content className="drawer">
          <div className="drawer-top">
            <span className="eyebrow">AgroTwin / {t("evidence")}</span>
            <Dialog.Close className="icon-button" aria-label={t("close")}>
              <X size={21} />
            </Dialog.Close>
          </div>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t("sourceInfo")}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
