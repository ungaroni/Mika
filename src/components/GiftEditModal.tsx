import { useEffect, useState } from 'react';
import type { Gift, GiftInput } from '../types';

type Props = {
  gift?: Gift | null;
  onClose: () => void;
  onSave: (input: GiftInput) => Promise<void>;
};

export function GiftEditModal({ gift, onClose, onSave }: Props) {
  const [name, setName] = useState(gift?.name ?? '');
  const [price, setPrice] = useState(gift?.price?.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(gift?.image_url ?? '');
  const [buyLink, setBuyLink] = useState(gift?.buy_link ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('נא להזין שם מתנה');
      return;
    }
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('נא להזין מחיר תקין');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        price: priceNum,
        image_url: imageUrl.trim(),
        buy_link: buyLink.trim(),
        claimed_by: gift?.claimed_by ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-stone-900 mb-5">
          {gift ? 'עריכת מתנה' : 'הוספת מתנה'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="שם המתנה">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: מגדל למידה מעץ"
              className="input"
              disabled={submitting}
            />
          </Field>

          <Field label="מחיר משוער (₪)">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="350"
              className="input"
              disabled={submitting}
              min={0}
            />
          </Field>

          <Field label="קישור לתמונה">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... או /01_product.png"
              className="input"
              disabled={submitting}
              dir="ltr"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                className="mt-2 w-24 h-24 object-cover rounded-lg border border-stone-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </Field>

          <Field label="קישור לקנייה">
            <input
              type="url"
              value={buyLink}
              onChange={(e) => setBuyLink(e.target.value)}
              placeholder="https://www.shilav.co.il/..."
              className="input"
              disabled={submitting}
              dir="ltr"
            />
          </Field>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-peach-500 hover:bg-peach-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
            >
              {submitting ? 'שומר...' : 'שמירה'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-stone-600 hover:bg-stone-50 transition"
            >
              ביטול
            </button>
          </div>
        </form>

        <style>{`
          .input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            border: 1px solid #e7e5e4;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .input:focus {
            border-color: #e89b6e;
            box-shadow: 0 0 0 3px rgba(232, 155, 110, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
