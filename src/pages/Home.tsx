import { useCallback, useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { GiftCard } from '../components/GiftCard';
import { ClaimModal } from '../components/ClaimModal';
import { ClaimConfetti } from '../components/ClaimConfetti';
import {
  claimGift,
  listGifts,
  subscribeToGifts,
} from '../lib/db';
import type { Gift } from '../types';

export function Home() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingGift, setClaimingGift] = useState<Gift | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await listGifts();
      setGifts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToGifts(refresh);
    return unsubscribe;
  }, []);

  async function handleConfirm(name: string) {
    if (!claimingGift) return;
    await claimGift(claimingGift.id, name);
    setClaimingGift(null);
    setShowConfetti(true);
    await refresh();
  }

  const handleConfettiDone = useCallback(() => setShowConfetti(false), []);

  const claimedCount = gifts.filter((g) => g.claimed_by).length;

  return (
    <main className="min-h-screen bg-cream-50">
      <Hero />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {!loading && gifts.length > 0 && (
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">
              🎁 רעיונות למתנות
            </h2>
            <p className="text-stone-400 text-sm">
              {claimedCount === 0
                ? `${gifts.length} רעיונות · בחרו מה שבא לכם`
                : `${claimedCount} מתוך ${gifts.length} כבר נתפסו · מהרו!`}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center text-rose-500 my-8">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow-soft overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gradient-to-br from-stone-50 to-stone-100" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-stone-100 rounded-lg w-3/4" />
                  <div className="h-8 bg-stone-100 rounded-lg w-1/2" />
                  <div className="h-14 bg-stone-50 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">🎀</div>
            <p className="text-stone-500 text-xl font-medium">עוד לא הוספנו רעיונות למתנה</p>
            <p className="text-stone-400 text-sm mt-2">חזרו בקרוב, אנחנו עובדים על זה!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7">
            {gifts.map((gift, i) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                index={i}
                onClaim={(g) => setClaimingGift(g)}
              />
            ))}
          </div>
        )}

        <footer className="text-center mt-12 pb-4">
          <p className="text-stone-400 text-sm">תודה רבה ❤️ מחכים לחגוג איתכם!</p>
        </footer>
      </section>

      {claimingGift && (
        <ClaimModal
          gift={claimingGift}
          onClose={() => setClaimingGift(null)}
          onConfirm={handleConfirm}
        />
      )}

      {showConfetti && <ClaimConfetti onDone={handleConfettiDone} />}
    </main>
  );
}
