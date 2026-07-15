"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-5"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-11 h-11 rounded-full bg-piment/10 flex items-center justify-center">
          <AlertTriangle size={20} className="text-piment" />
        </div>
        <p className="mt-4 text-lg font-bold">{title}</p>
        <p className="mt-1.5 text-sm text-ink/60">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-full border border-ink/15 text-sm font-semibold hover:bg-paper transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-full bg-piment text-white text-sm font-semibold hover:bg-piment-dark transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}