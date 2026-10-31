import { useEffect, useRef } from "react";
import Icon from "../common/Icon";

// Fenêtre de confirmation (suppression par défaut ; icône et libellés personnalisables). Échap ou clic hors de la carte = annuler.
export default function ConfirmDialog({ title, message, confirmLabel = "Confirmer", busyLabel = "Suppression...", icon = "lucide:trash-2", busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const cancelHandler = useRef(onCancel);
  cancelHandler.current = onCancel;

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event) => event.key === "Escape" && cancelHandler.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}
    >
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" className="slide-in w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-law-red">
          <Icon name={icon} width={22} />
        </span>
        <h2 id="confirm-title" className="mt-4 text-lg font-bold text-gray-900">{title}</h2>
        <p id="confirm-message" className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className="flex-1 rounded-lg bg-law-red py-2.5 text-sm font-bold text-white transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2 disabled:opacity-70">
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
