import { useEffect, useState } from 'react';
import {
  createGift,
  deleteGift,
  isSupabaseConfigured,
  listGifts,
  releaseGift,
  subscribeToGifts,
  updateGift,
} from '../lib/db';
import type { Gift, GiftInput } from '../types';
import { GiftEditModal } from '../components/GiftEditModal';

const ADMIN_PASSWORD = 'mika2026';
const SESSION_KEY = 'mika_admin_unlocked';

export function Admin() {
  const [unlocked, setUnlocked] = useState<boolean>(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <form
          className="bg-white rounded-3xl shadow-card p-8 w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (password === ADMIN_PASSWORD) {
              sessionStorage.setItem(SESSION_KEY, 'true');
              setUnlocked(true);
            } else {
              setPwError('סיסמה שגויה');
            }
          }}
        >
          <h1 className="text-2xl font-bold text-stone-900 mb-1">אזור ניהול</h1>
          <p className="text-stone-500 text-sm mb-5">סיסמה נדרשת לגישה</p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPwError(null);
            }}
            placeholder="••••••"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition mb-3"
            autoFocus
          />
          {pwError && <p className="text-sm text-rose-500 mb-3">{pwError}</p>}
          <button
            type="submit"
            className="w-full bg-peach-500 hover:bg-peach-600 text-white font-medium py-3 rounded-xl transition"
          >
            כניסה
          </button>
        </form>
      </main>
    );
  }

  return <AdminPanel onLogout={() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
  }} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Gift | null | undefined>(undefined);

  async function refresh() {
    const data = await listGifts();
    setGifts(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToGifts(refresh);
    return unsubscribe;
  }, []);

  async function handleSave(input: GiftInput) {
    if (editing) {
      await updateGift(editing.id, input);
    } else {
      await createGift(input);
    }
    setEditing(undefined);
    await refresh();
  }

  async function handleDelete(gift: Gift) {
    if (!confirm(`למחוק את "${gift.name}"?`)) return;
    await deleteGift(gift.id);
    await refresh();
  }

  async function handleRelease(gift: Gift) {
    if (!confirm(`לשחרר את "${gift.name}"?`)) return;
    await releaseGift(gift.id);
    await refresh();
  }

  return (
    <main className="min-h-screen bg-cream-50">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">ניהול רשימת המתנות</h1>
            <p className="text-stone-500 text-sm mt-1">
              {gifts.length} מתנות · {gifts.filter((g) => g.claimed_by).length} נתפסו
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-white transition text-sm"
            >
              ↩ לאתר
            </a>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-white transition text-sm"
            >
              יציאה
            </button>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl px-4 py-3">
            מצב הדגמה מקומי · השינויים נשמרים בדפדפן זה בלבד.
          </div>
        )}

        <button
          onClick={() => setEditing(null)}
          className="w-full sm:w-auto bg-peach-500 hover:bg-peach-600 text-white font-medium px-5 py-3 rounded-xl transition mb-5"
        >
          + הוספת מתנה חדשה
        </button>

        {loading ? (
          <div className="text-stone-400 text-center py-12">טוען...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {gifts.map((gift) => (
                <li key={gift.id} className="p-4 flex items-center gap-4 hover:bg-cream-50 transition">
                  <img
                    src={gift.image_url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23f5e7d0"/><text x="50%25" y="55%25" text-anchor="middle" font-size="24">🎁</text></svg>';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-stone-800 truncate">{gift.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-stone-500">₪{gift.price.toLocaleString('he-IL')}</span>
                      {gift.claimed_by ? (
                        <span className="text-rose-500">נתפס ע"י {gift.claimed_by}</span>
                      ) : (
                        <span className="text-sage-500">פנוי</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 flex-shrink-0">
                    {gift.claimed_by && (
                      <button
                        onClick={() => handleRelease(gift)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                      >
                        שחרור
                      </button>
                    )}
                    <button
                      onClick={() => setEditing(gift)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDelete(gift)}
                      className="text-xs px-3 py-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-500 transition"
                    >
                      מחיקה
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {gifts.length === 0 && (
              <div className="text-center py-12 text-stone-400">אין עדיין מתנות</div>
            )}
          </div>
        )}
      </div>

      {editing !== undefined && (
        <GiftEditModal
          gift={editing}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
