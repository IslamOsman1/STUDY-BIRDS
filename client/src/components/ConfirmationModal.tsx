import { Modal } from "./Modal";

export interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) => (
  <Modal open={open} title={title} onClose={onClose}>
    <p className="text-sm leading-7 text-slate-600">{description}</p>
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
          tone === "danger" ? "bg-rose-600" : "bg-slate-950"
        }`}
      >
        {loading ? "..." : confirmLabel}
      </button>
    </div>
  </Modal>
);
