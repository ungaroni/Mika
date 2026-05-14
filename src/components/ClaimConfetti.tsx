import { useEffect, useRef } from 'react';

const COLORS = [
  '#f5b894', '#e8b3ae', '#aabe9d', '#f5dcd9', '#fbe4d4',
  '#d18b85', '#7e9b6e', '#e89b6e', '#dde6d6', '#f3e7d0',
  '#FFD700', '#FF69B4', '#87CEEB',
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  opacity: number;
};

export function ClaimConfetti({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    ctx.scale(2, 2);

    const W = window.innerWidth;
    const H = window.innerHeight;

    const particles: Particle[] = [];
    const COUNT = 100;

    for (let i = 0; i < COUNT; i++) {
      const angle = (Math.PI * 2 * Math.random());
      const speed = 6 + Math.random() * 14;
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.4,
        y: H * 0.3 + (Math.random() - 0.5) * H * 0.2,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed - 8 - Math.random() * 6,
        w: 5 + Math.random() * 8,
        h: 5 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
        opacity: 1,
      });
    }

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      let alive = false;

      for (const p of particles) {
        if (p.opacity <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Star shape
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = j === 0 ? p.w / 2 : p.w / 2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            const a2 = a + (2 * Math.PI) / 10;
            ctx.lineTo(Math.cos(a2) * r * 0.4, Math.sin(a2) * r * 0.4);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.vx *= 0.99;
        p.rot += p.vr;

        if (frame > 60) {
          p.opacity -= 0.02;
        }
      }

      if (alive) {
        raf = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
