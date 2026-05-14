import { useCallback, useEffect, useRef, useState } from 'react';

const base = import.meta.env.BASE_URL;
const MIKA_PHOTOS = [
  `${base}mika-1.jpg`,
  `${base}mika-2.jpg`,
  `${base}mika-3.jpg`,
  `${base}mika-4.jpg`,
  `${base}mika-5.jpg`,
];

const CONFETTI_COLORS = [
  '#f5b894', '#e8b3ae', '#aabe9d', '#f5dcd9', '#fbe4d4',
  '#d18b85', '#7e9b6e', '#e89b6e', '#dde6d6', '#f3e7d0',
];

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const pieces: {
      x: number; y: number; w: number; h: number;
      vx: number; vy: number; rot: number; vr: number;
      color: string; shape: 'rect' | 'circle';
    }[] = [];

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    for (let i = 0; i < 60; i++) {
      pieces.push({
        x: Math.random() * W(),
        y: Math.random() * H() - H(),
        w: 4 + Math.random() * 6,
        h: 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.04,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vx += (Math.random() - 0.5) * 0.02;
        if (p.y > H() + 20) {
          p.y = -10;
          p.x = Math.random() * W();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

type FaceParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  opacity: number;
  img: HTMLImageElement;
};

function FaceConfetti({ photoSrc, originX, originY, onDone }: {
  photoSrc: string;
  originX: number;
  originY: number;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    ctx.scale(2, 2);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoSrc;

    const particles: FaceParticle[] = [];
    const PARTICLE_COUNT = 18;

    const createParticles = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
        const speed = 4 + Math.random() * 8;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: 28 + Math.random() * 28,
          rot: (Math.random() - 0.5) * 0.8,
          vr: (Math.random() - 0.5) * 0.15,
          opacity: 1,
          img,
        });
      }
    };

    if (img.complete) {
      createParticles();
    } else {
      img.onload = createParticles;
    }

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      frame++;

      let alive = false;
      for (const p of particles) {
        if (p.opacity <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;

        // Circular clip for the face
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the photo cropped to circle
        ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);

        ctx.restore();

        // Draw a cute border
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.985;
        p.rot += p.vr;

        // Fade out after a while
        if (frame > 40) {
          p.opacity -= 0.025;
        }
      }

      if (alive) {
        raf = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    };

    // Small delay so image has time to load
    setTimeout(() => {
      if (particles.length === 0) createParticles();
      draw();
    }, 50);

    return () => cancelAnimationFrame(raf);
  }, [photoSrc, originX, originY, onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

function PhotoStrip({ onPhotoClick }: { onPhotoClick: (src: string, x: number, y: number) => void }) {
  const rotations = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-1'];

  const handleClick = (e: React.MouseEvent, src: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    onPhotoClick(src, x, y);
  };

  return (
    <div className="flex justify-center gap-3 sm:gap-4 mt-8 mb-2 px-4 overflow-hidden">
      {MIKA_PHOTOS.map((src, i) => (
        <div
          key={i}
          className={`photo-frame ${rotations[i]} hover:rotate-0 transition-transform duration-300 flex-shrink-0 cursor-pointer`}
          onClick={(e) => handleClick(e, src)}
        >
          <div className="w-[4.5rem] h-[4.5rem] sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-card bg-white p-1.5 sm:p-2">
            <img
              src={src}
              alt={`מיקה ${i + 1}`}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                const frame = (e.target as HTMLElement).closest('.photo-frame') as HTMLElement;
                if (frame) frame.style.display = 'none';
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const [burst, setBurst] = useState<{ src: string; x: number; y: number } | null>(null);

  const handlePhotoClick = useCallback((src: string, x: number, y: number) => {
    setBurst({ src, x, y });
  }, []);

  const handleBurstDone = useCallback(() => {
    setBurst(null);
  }, []);

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-peach-100/40 via-cream-50 to-cream-50">
      <Confetti />

      <div className="max-w-3xl mx-auto px-5 pt-10 pb-6 sm:pt-14 sm:pb-8 text-center relative z-10">
        <div className="text-5xl sm:text-6xl mb-4 balloon-bounce">🎈</div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 leading-tight mb-4 tracking-tight">
          <span className="bg-gradient-to-l from-peach-500 to-rose-500 bg-clip-text text-transparent">
            מיקה בת שנה!
          </span>
        </h1>
        <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          כדי שלא יהיו כפילויות, ריכזנו כאן רעיונות למתנות.
          <br />
          בחרו מה שאתם רוצים להביא וסמנו ✨
          <br />
          <span className="text-stone-400">אלה רק רעיונות — אתם מוזמנים להביא כל מתנה שבא לכם</span>
        </p>
        <PhotoStrip onPhotoClick={handlePhotoClick} />
      </div>

      {burst && (
        <FaceConfetti
          photoSrc={burst.src}
          originX={burst.x}
          originY={burst.y}
          onDone={handleBurstDone}
        />
      )}
    </header>
  );
}
