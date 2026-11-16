'use client';

import { useEffect } from 'react';

/**
 * Page-level scroll behaviour: reveal-on-enter, the depth gauge (the page is
 * read as a soil core, 0 to -40 cm) and the active section in the nav.
 */
export default function ScrollFx() {
  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    reveals.forEach((el) => io.observe(el));

    const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
    const nav = document.querySelector<HTMLElement>('.y-nav');
    const sio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
          nav?.classList.toggle('on-paper', (e.target as HTMLElement).dataset.tone === 'paper');
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => sio.observe(s));

    const marker = document.querySelector<HTMLElement>('.y-depth__marker');
    const value = document.querySelector<HTMLElement>('.y-depth__value');
    const bar = document.querySelector<HTMLElement>('.y-progress');
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (marker) marker.style.top = `${p * 100}%`;
      if (value) value.textContent = `−${(p * 40).toFixed(1).padStart(4, '0')} cm`;
      if (bar) bar.style.transform = `scaleX(${p})`;
      nav?.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      sio.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
