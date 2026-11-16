'use client';

import { useEffect, useRef } from 'react';

/**
 * A soil cross-section. Above the surface line: the little a walk-through
 * sees. Below: a moisture field that only appears inside the lens.
 * The field is procedural — an illustration, not data.
 */
export default function SubsurfaceLens() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fontFamily = getComputedStyle(canvas).fontFamily || 'monospace';
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const lens = { x: 0, y: 0, tx: 0, ty: 0, manual: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (!lens.x) {
        lens.x = lens.tx = w * 0.62;
        lens.y = lens.ty = h * 0.6;
      }
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) raf = requestAnimationFrame((n) => draw(n));
    });
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      lens.tx = e.clientX - r.left;
      lens.ty = e.clientY - r.top;
      lens.manual = performance.now();
      if (reduced) {
        lens.x = lens.tx;
        lens.y = lens.ty;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame((n) => draw(n));
      }
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);

    const moisture = (x: number, y: number, t: number) => {
      const v =
        Math.sin(x * 0.011 + t * 0.21) * Math.cos(y * 0.017 - t * 0.13) +
        0.6 * Math.sin((x + y) * 0.006 - t * 0.17) +
        0.35 * Math.sin(x * 0.031 - y * 0.023 + t * 0.4);
      return Math.min(1, Math.max(0, 0.5 + v * 0.32));
    };

    let visible = false;
    function draw(now: number) {
      if (!ctx || !canvas) return;
      const t = now / 1000;
      const surface = Math.round(h * 0.27);
      const R = Math.min(w, h) * (w < 600 ? 0.3 : 0.26);

      if (!reduced && now - lens.manual > 2600) {
        lens.tx = w * (0.5 + 0.34 * Math.sin(t * 0.31));
        lens.ty = surface + (h - surface) * (0.5 + 0.32 * Math.sin(t * 0.47 + 1));
      }
      lens.x += (lens.tx - lens.x) * 0.08;
      lens.y += (lens.ty - lens.y) * 0.08;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // dot field
      const step = w < 600 ? 13 : 15;
      for (let y = surface + step; y < h - 4; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const d = Math.hypot(x - lens.x, y - lens.y);
          if (d < R) {
            const m = moisture(x, y, t);
            const edge = Math.min(1, (R - d) / 28);
            const r = 0.8 + m * 4.6 * edge;
            // dry → wet : terra → aqua
            const cr = Math.round(226 + (127 - 226) * m);
            const cg = Math.round(80 + (227 - 80) * m);
            const cb = Math.round(42 + (212 - 42) * m);
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.35 + 0.65 * edge})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 6.2832);
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(235,230,218,0.13)';
            ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4);
          }
        }
      }

      // surface line + depth ticks
      ctx.strokeStyle = 'rgba(235,230,218,0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, surface + 0.5);
      ctx.lineTo(w, surface + 0.5);
      ctx.stroke();
      ctx.font = `10px ${fontFamily}`;
      ctx.fillStyle = 'rgba(235,230,218,0.55)';
      ctx.fillText('SURFACE · 0 cm', 12, surface - 8);
      const cm = (h - surface) / 60;
      for (const depth of [20, 40]) {
        const y = surface + depth * cm;
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = 'rgba(235,230,218,0.28)';
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(`−${depth} cm`, 12, y - 6);
      }

      // what is visible from above: a few isolated samples
      ctx.strokeStyle = 'rgba(235,230,218,0.6)';
      [0.2, 0.52, 0.86].forEach((fx, i) => {
        const x = Math.round(w * fx) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, surface - 26);
        ctx.lineTo(x, surface + 10);
        ctx.stroke();
        ctx.fillRect(x - 2.5, surface - 30, 5, 5);
        if (w > 520 || i === 1) ctx.fillText('SPOT SAMPLE', x + 9, surface - 22);
      });

      // lens
      const ly = Math.max(lens.y, surface + 2);
      ctx.strokeStyle = '#ebe6da';
      ctx.beginPath();
      ctx.arc(lens.x, lens.y, R, 0, 6.2832);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lens.x - 9, lens.y);
      ctx.lineTo(lens.x + 9, lens.y);
      ctx.moveTo(lens.x, lens.y - 9);
      ctx.lineTo(lens.x, lens.y + 9);
      ctx.stroke();
      const depth = Math.max(0, (ly - surface) / cm);
      const m = moisture(lens.x, ly, t);
      const label = `−${depth.toFixed(0).padStart(2, '0')} cm · θ ${(0.12 + m * 0.3).toFixed(2)} · illustrative`;
      const tw = ctx.measureText(label).width + 16;
      const lx = Math.min(w - tw - 6, Math.max(6, lens.x - tw / 2));
      const lyy = lens.y - R - 30 < 4 ? lens.y + R + 10 : lens.y - R - 30;
      ctx.fillStyle = '#ebe6da';
      ctx.fillRect(lx, lyy, tw, 20);
      ctx.fillStyle = '#0c0b09';
      ctx.fillText(label, lx + 8, lyy + 14);

      if (visible && !reduced) raf = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
    };
  }, []);

  return <canvas ref={ref} className="y-lens" aria-hidden="true" />;
}
