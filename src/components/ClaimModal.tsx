import { useEffect, useRef, useState } from 'react';
import type { Gift } from '../types';

type Props = {
  gift: Gift;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
};

export function ClaimModal({ gift, onClose, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('נא להזין שם');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה. נסי שוב.');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-7 sm:p-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-2xl font-bold text-stone-900">לאשר רכישה</h2>
          <p className="text-stone-400 mt-2 text-sm leading-relaxed">
            בחרת לקנות את <span className="font-semibold text-stone-700">{gift.name}</span>
            <br />
            נשמח להוסיף את שמך כדי למנוע כפילויות
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-stone-600 mb-2 block">השם שלך</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: שירה כהן"
              className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:border-peach-500 focus:outline-none focus:ring-3 focus:ring-peach-500/15 transition-all text-stone-800 placeholder:text-stone-300"
              disabled={submitting}
            />
          </label>

          {error && <p className="text-sm text-rose-500 text-center">{error}</p>}

          <div className="flex gap-3 mt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-l from-peach-500 to-peach-600 hover:from-peach-600 hover:to-peach-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {submitting ? '⏳ רגע...' : '✨ אישור'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-2xl text-stone-500 hover:bg-stone-50 transition font-medium"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
