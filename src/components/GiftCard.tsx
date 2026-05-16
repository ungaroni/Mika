import type { Gift } from '../types';
import { GiftImage } from './GiftImage';

type Props = {
  gift: Gift;
  index: number;
  onClaim: (gift: Gift) => void;
};

export function GiftCard({ gift, index, onClaim }: Props) {
  const claimed = Boolean(gift.claimed_by);

  return (
    <article
      className={`group rounded-3xl shadow-soft overflow-hidden flex flex-col transition-all duration-300 animate-fade-in ${
        claimed
          ? 'bg-stone-100 opacity-60'
          : 'bg-white hover:shadow-card hover:-translate-y-1'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-105">
          <GiftImage src={gift.image_url} alt={gift.name} />
        </div>
        {claimed && (
          <div className="absolute inset-0 bg-stone-900/10" />
        )}
        <span
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
            claimed
              ? 'bg-stone-200/95 text-stone-500 border border-stone-300/50'
              : 'bg-white/90 text-sage-500 border border-sage-100/50'
          }`}
        >
          {claimed ? 'מישהו כבר לוקח ✓' : 'פנוי ✨'}
        </span>
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-lg leading-snug text-stone-800 line-clamp-2 min-h-[3.25rem]">
          {gift.name}
        </h3>
        {gift.note && (
          <p className="text-xs text-stone-400 leading-relaxed -mt-1">
            {gift.note}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-2xl font-extrabold text-stone-900 tracking-tight">
            ₪{gift.price.toLocaleString('he-IL')}
          </span>
          {gift.buy_link && (
            <a
              href={gift.buy_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-peach-600 transition-colors group/link"
              aria-label="קישור לקנייה"
            >
              <span className="group-hover/link:underline underline-offset-2">לקנייה</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-stone-50">
          {claimed ? (
            <div className="flex items-center justify-center">
              <span className="text-sm text-stone-400">נתפס ✓</span>
            </div>
          ) : (
            <button
              onClick={() => onClaim(gift)}
              className="w-full bg-gradient-to-l from-peach-500 to-peach-600 hover:from-peach-600 hover:to-peach-600 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.97] shadow-sm hover:shadow-md"
            >
              🎁 אני קונה את זה
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
