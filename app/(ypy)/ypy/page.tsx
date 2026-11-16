import ScrollFx from '@/components/ypy/ScrollFx';
import HeroScene from '@/components/ypy/HeroScene';
import SubsurfaceLens from '@/components/ypy/SubsurfaceLens';
import TechSequence from '@/components/ypy/TechSequence';
import StakeViewer from '@/components/ypy/StakeViewer';
import IntelligenceDemo from '@/components/ypy/IntelligenceDemo';
import ContactForm from '@/components/ypy/ContactForm';
import RoverPass from '@/components/ypy/RoverPass';
import StakeRise from '@/components/ypy/StakeRise';
import BaseFilm from '@/components/ypy/BaseFilm';

const NAV = [
  ['problem', 'Problem'],
  ['ecosystem', 'Ecosystem'],
  ['technology', 'Technology'],
  ['stake', 'Stake'],
  ['intelligence', 'Intelligence'],
  ['future', 'Future'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'YPY',
  description:
    'Brazilian agricultural technology startup developing an ecosystem of territorial intelligence and autonomous crop monitoring.',
  knowsAbout: ['Autonomous robotics', 'Soil sensing', 'Agricultural intelligence'],
};

function Head({ n, label, depth }: { n: string; label: string; depth: string }) {
  return (
    <p className="y-kicker" data-reveal>
      <span>{n}</span>
      <span>{label}</span>
      <span className="y-kicker__depth">{depth}</span>
    </p>
  );
}

function Mark() {
  return (
    <svg className="y-mark" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M2 9h24M14 3v20" />
      <circle cx="14" cy="16" r="1.8" />
      <circle cx="14" cy="23" r="1.8" />
    </svg>
  );
}

export default function YpyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a className="y-skip" href="#problem">
        Skip to content
      </a>
      <ScrollFx />
      <div className="y-progress" aria-hidden="true" />

      <header className="y-nav">
        <a className="y-logo" href="#top" aria-label="YPY — back to top">
          <Mark />
          <span>YPY</span>
        </a>
        <nav aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} data-nav>
              {label}
            </a>
          ))}
        </nav>
        <a className="y-nav__cta" href="#contact" data-nav>
          Contact
        </a>
      </header>

      <aside className="y-depth" aria-hidden="true">
        <span className="y-depth__label">Depth</span>
        <div className="y-depth__rule">
          <i className="y-depth__marker">
            <b className="y-depth__value">−00.0 cm</b>
          </i>
        </div>
        <span className="y-depth__label">−40 cm</span>
      </aside>

      <main id="top">
        {/* 01 — HERO */}
        <section className="y-hero" id="hero" aria-label="Introduction">
          <HeroScene />
          <div className="y-hero__content">
            <p className="y-hero__eyebrow">
              <span>YPY</span>
              <span>Territorial intelligence · Autonomous crop monitoring</span>
            </p>
            <h1 className="y-hero__title">
              <span className="ln">
                <span>The intelligence</span>
              </span>
              <span className="ln ln--serif">
                <span>beneath</span>
              </span>
              <span className="ln">
                <span>the surface.</span>
              </span>
            </h1>
            <div className="y-hero__foot">
              <p>
                Autonomous robotics. Intelligent sensing.
                <br />
                Agricultural intelligence.
              </p>
              <a href="#problem" className="y-scrollcue">
                <i aria-hidden="true" />
                Descend
              </a>
            </div>
          </div>
        </section>

        <RoverPass />

        {/* 02 — THE PROBLEM */}
        <section className="y-sec y-problem" id="problem">
          <Head n="02" label="The problem" depth="0 → −40 cm" />
          <h2 className="y-h2" data-reveal>
            Most of what decides a harvest happens <em>where no one is looking.</em>
          </h2>
          <figure className="y-problem__figure" data-reveal>
            <SubsurfaceLens />
            <figcaption>
              <span>Move across the section to reveal the soil below the surface line.</span>
              <span>Procedural illustration — not field data</span>
            </figcaption>
          </figure>
          <div className="y-problem__grid">
            <p className="y-lead" data-reveal>
              Water moves, accumulates and disappears below the surface, out of the producer&apos;s field of view.
              Conventional monitoring was not built to follow it.
            </p>
            <ul className="y-limits">
              {[
                ['Frequency', 'Manual sampling captures a moment. The soil keeps changing between one visit and the next.'],
                ['Coverage', 'A few points are asked to speak for an entire property — and regions behave differently.'],
                ['Integration', 'Terrain, moisture and temperature live in separate places, so patterns stay invisible.'],
              ].map(([t, d], i) => (
                <li key={t} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
                  <span>Limit 0{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 03 — THE ECOSYSTEM */}
        <section className="y-sec y-eco" id="ecosystem">
          <Head n="03" label="The ecosystem" depth="Three pillars · one system" />
          <h2 className="y-h2" data-reveal>
            Not a robot. Not a sensor. <em>An infrastructure</em> for understanding land.
          </h2>
          <div className="y-eco__rows">
            {[
              {
                n: 'I',
                verb: 'Explore.',
                name: 'YPY Rover',
                kind: 'Autonomous robotics',
                d: 'An autonomous ground robot conceived as a mobile reconnaissance unit: it navigates the property, maps the terrain in three dimensions, georeferences what it finds and selects where monitoring should happen.',
                tags: ['Autonomous navigation', '3D terrain mapping', 'Georeferencing', 'Critical-region detection'],
              },
              {
                n: 'II',
                verb: 'Monitor.',
                name: 'YPY Stake',
                kind: 'Intelligent sensing',
                d: 'A monitoring station placed at strategic points. The Stake M1 concept reads soil moisture at two depths and temperature at one, continuously, from below the surface.',
                tags: ['Moisture · 20 cm', 'Moisture · 40 cm', 'Temperature · 20 cm', 'Battery powered'],
              },
              {
                n: 'III',
                verb: 'Understand.',
                name: 'YPY Intelligence',
                kind: 'AI & data analysis',
                d: 'The software platform that integrates what the rover and the stakes collect — designed to show how each region behaves, detect anomalies and support planning.',
                tags: ['Georeferenced view', 'Water behaviour', 'Anomaly detection', 'Risk maps'],
              },
            ].map((p) => (
              <article key={p.name} className="y-pillar" data-reveal>
                <span className="y-pillar__n">{p.n}</span>
                <div className="y-pillar__title">
                  <small>
                    {p.name} — {p.kind}
                  </small>
                  <h3>{p.verb}</h3>
                </div>
                <div className="y-pillar__body">
                  <p>{p.d}</p>
                  <ul>
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="y-loop" data-reveal>
            <svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
              <path className="y-loop__base" d="M0 60 H1000" />
              <path className="y-loop__flow" d="M0 60 H1000" />
            </svg>
            <ol>
              {[
                ['The rover', 'explores.'],
                ['The stake', 'monitors.'],
                ['The intelligence', 'learns.'],
                ['The producer', 'decides.'],
              ].map(([a, b], i) => (
                <li key={a}>
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  <span>{a}</span>
                  <b>{b}</b>
                </li>
              ))}
            </ol>
          </div>
          <p className="y-aside" data-reveal>
            <b>YPY Vision</b> — an optional, complementary computer-vision module for visual plant analysis, disease
            identification and crop-evolution tracking. It extends the ecosystem; it is not its core.
          </p>
        </section>

        <BaseFilm />

        {/* 04 — THE TECHNOLOGY */}
        <section className="y-sec y-techsec" id="technology">
          <Head n="04" label="The technology" depth="Six layers, read top-down" />
          <h2 className="y-h2" data-reveal>
            From an unknown terrain to a property that <em>explains itself.</em>
          </h2>
          <TechSequence />
        </section>

        <StakeRise />

        {/* 05 — YPY STAKE */}
        <section className="y-sec y-stakesec" id="stake" data-tone="paper">
          <Head n="05" label="YPY Stake" depth="Station M1 · concept" />
          <div className="y-stakesec__head">
            <h2 className="y-h2" data-reveal>
              Stake M1.
              <br />
              <em>A listening post</em> for the soil.
            </h2>
            <div className="y-notice" data-reveal>
              <b>Development status</b>
              <p>
                The Stake M1 is in conceptual development and validation. What you see here is the current concept
                architecture — planned specifications, not a validated commercial product.
              </p>
            </div>
          </div>
          <StakeViewer />
          <dl className="y-specs" data-reveal>
            {[
              ['Measurement depths', '20 cm · 40 cm'],
              ['Soil moisture', '2 × capacitive sensors'],
              ['Soil temperature', 'DS18B20 at 20 cm'],
              ['Controller', 'ESP32-C3 · ADS1115'],
              ['Communication', 'LoRa SX1276 (planned)'],
              ['Structure', '25 mm PVC · sealed box'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 06 — YPY INTELLIGENCE */}
        <section className="y-sec y-intel" id="intelligence">
          <Head n="06" label="YPY Intelligence" depth="Platform · concept demo" />
          <div className="y-intel__head">
            <h2 className="y-h2" data-reveal>
              Every point, every layer, <em>one reading of the land.</em>
            </h2>
            <p className="y-lead" data-reveal>
              A conceptual demonstration of the platform. Explore the field, switch layers and depths, and select a
              monitoring point. All values are fictional.
            </p>
          </div>
          <div data-reveal>
            <IntelligenceDemo />
          </div>
          <ul className="y-caps" data-reveal>
            {[
              'Georeferenced property view',
              'Moisture & temperature history',
              'Water-behaviour analysis',
              'Anomaly detection',
              'Risk maps',
              'Water forecasts',
              'Intelligent inspection planning',
              'Views by region and by point',
            ].map((c) => (
              <li key={c}>{c}</li>
            ))}
            <li className="y-caps__note">Planned capabilities</li>
          </ul>
        </section>

        {/* 07 — THE FUTURE */}
        <section className="y-sec y-future" id="future">
          <Head n="07" label="The future" depth="Vision" />
          <h2 className="y-future__title" data-reveal>
            Technology that doesn&apos;t just collect data.
            <br />
            <em>It learns the property.</em>
          </h2>
          <div className="y-future__grid">
            <p className="y-lead" data-reveal>
              YPY is building toward an intelligent infrastructure that connects agricultural properties, sensors,
              robotics and artificial intelligence — a system that grows more useful with every pass of the rover and
              every reading from the ground.
            </p>
            <div className="y-status" data-reveal>
              <small>Where we are — stated plainly</small>
              <ul>
                <li>
                  <b>YPY Rover</b>
                  <span>In development</span>
                </li>
                <li>
                  <b>YPY Stake M1</b>
                  <span>Conceptual development &amp; validation</span>
                </li>
                <li>
                  <b>YPY Intelligence</b>
                  <span>Platform in design · capabilities planned</span>
                </li>
                <li>
                  <b>YPY Vision</b>
                  <span>Optional module · exploratory</span>
                </li>
              </ul>
            </div>
          </div>
          <svg className="y-net" viewBox="0 0 1200 260" aria-hidden="true">
            {[
              [80, 190, 300, 90],
              [300, 90, 520, 170],
              [520, 170, 760, 70],
              [760, 70, 980, 160],
              [980, 160, 1140, 60],
              [300, 90, 760, 70],
              [520, 170, 980, 160],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ animationDelay: `${i * -0.7}s` }} />
            ))}
            {[
              [80, 190],
              [300, 90],
              [520, 170],
              [760, 70],
              [980, 160],
              [1140, 60],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="16" className="halo" style={{ animationDelay: `${i * -0.5}s` }} />
                <rect x="-4" y="-4" width="8" height="8" />
              </g>
            ))}
          </svg>
        </section>

        {/* 08 — CONTACT */}
        <section className="y-sec y-contact" id="contact">
          <Head n="08" label="Contact" depth="−40 cm · end of core" />
          <div className="y-contact__grid">
            <div>
              <h2 className="y-contact__title" data-reveal>
                Let&apos;s build the future of <em>agriculture.</em>
              </h2>
              <p className="y-lead" data-reveal>
                Investors, technology partners, research groups and agribusiness teams — tell us what you are working
                on.
              </p>
            </div>
            <div data-reveal>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="y-footer">
        <div className="y-footer__word" aria-hidden="true">
          YPY
        </div>
        <div className="y-footer__row">
          <span>© {new Date().getFullYear()} YPY · Brazil</span>
          <span>The intelligence beneath the surface.</span>
          <span>Demonstrations on this site use simulated data.</span>
        </div>
      </footer>
    </>
  );
}
