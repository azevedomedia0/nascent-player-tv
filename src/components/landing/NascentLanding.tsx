import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

interface NascentLandingProps {
  onEnterPlayer: () => void;
}

const NAV = [
  { id: 'mission', label: 'Home' },
  { id: 'plugins', label: 'Plugins' },
  { id: 'features', label: 'Features' },
  { id: 'apply', label: 'Download' },
] as const;

const METRICS = [
  { value: '4K', label: 'Cinema playback', detail: 'HDR · Atmos · 24p match' },
  { value: '0.2s', label: 'Seek latency', detail: 'I-frame prefetch pipeline' },
  { value: '50+', label: 'Catalog sources', detail: 'Cinemeta · Stremio addons' },
  { value: 'P2P', label: 'Peer libraries', detail: 'LAN mesh · shared vaults' },
];

const CAPABILITIES = [
  {
    title: 'LOCAL',
    body: 'USB, NAS, and folder libraries indexed with portrait shelves and resume rails.',
  },
  {
    title: 'STREAM',
    body: 'Stremio-compatible catalogs, Torrentio sources, and debrid-ready playlists.',
  },
  {
    title: 'SHARE',
    body: 'Invite peers, sync watch parties, and stream from trusted household nodes.',
  },
  {
    title: 'CONTROL',
    body: 'Bluetooth remotes, D-pad focus, telemetry HUD, and TV-first settings.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Install',
    body: 'Launch Nascent on Android TV, Google TV, desktop, or the browser shell.',
  },
  {
    n: '02',
    title: 'Connect',
    body: 'Attach local drives, install catalog addons, and pair Bluetooth remotes.',
  },
  {
    n: '03',
    title: 'Play',
    body: 'Search Cinemeta, open Watch Now sources, and resume from Continue Watching.',
  },
  {
    n: '04',
    title: 'Share',
    body: 'Spin up a watch party or publish a peer library across the household mesh.',
  },
];

const FEATURE_TILES = [
  { letter: 'L', name: 'Libraries', tag: 'Local Media', stat: 'USB · NAS', tone: 'ink' as const },
  { letter: 'S', name: 'Stremio', tag: 'Catalogs', stat: '50+ addons', tone: 'accent' as const },
  { letter: 'P', name: 'Peers', tag: 'P2P Mesh', stat: 'LAN share', tone: 'ink' as const },
  { letter: 'W', name: 'Watch Party', tag: 'Sync Play', stat: 'Live rooms', tone: 'ink' as const },
];

const FEATURE_BLURBS = [
  {
    title: 'Libraries',
    body: 'Portrait grids for movies and shows, auto-scan USB, and daily-updated Top 50 rails.',
  },
  {
    title: 'Stremio layer',
    body: 'Cinemeta search, community scrapers, and VIP unlock for advanced addon installs.',
  },
  {
    title: 'Peer mesh',
    body: 'Trusted peers, incoming requests, and shared vaults without leaving the lean-back UI.',
  },
  {
    title: 'Watch Party',
    body: 'Synchronized playback, chat, and crowd-pleaser suggestions for living-room nights.',
  },
];

export const NascentLanding: React.FC<NascentLandingProps> = ({ onEnterPlayer }) => {
  const [active, setActive] = useState<string>('mission');
  const { scrollYProgress } = useScroll();
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  useEffect(() => {
    document.documentElement.classList.add('nascent-site-active');
    document.body.classList.add('nascent-site-active');
    return () => {
      document.documentElement.classList.remove('nascent-site-active');
      document.body.classList.remove('nascent-site-active');
    };
  }, []);

  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.15, 0.4, 0.7] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="nascent-site min-h-screen text-zinc-100">
      {/* Floating pill nav */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 rounded-full bg-zinc-950/80 border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl px-2 py-1.5 pl-4">
          <button
            type="button"
            onClick={() => scrollTo('mission')}
            className="flex items-center gap-2 pr-2 sm:pr-3 cursor-pointer"
            aria-label="Nascent Player"
          >
            <img
              src="/nascent-logo.png"
              alt=""
              className="h-7 w-auto object-contain"
              draggable={false}
            />
          </button>
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                  active === item.id
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onEnterPlayer}
            className="ml-1 sm:ml-2 px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-lg shadow-sky-500/25"
          >
            Open TV <span aria-hidden>→</span>
          </button>
        </nav>
      </header>

      {/* MISSION / HERO */}
      <section
        id="mission"
        className="relative min-h-[100svh] px-5 sm:px-8 lg:px-12 pt-24 pb-16 overflow-hidden"
      >
        <motion.div
          style={{ y: watermarkY }}
          className="pointer-events-none absolute inset-x-0 bottom-[-4%] text-center font-ns-display font-black text-[22vw] leading-none text-white/[0.04] select-none"
          aria-hidden
        >
          nascent
        </motion.div>

        <div className="relative max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-end min-h-[78svh]">
          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 order-2 lg:order-1"
          >
            <div className="rounded-3xl p-7 sm:p-8 min-h-[340px] sm:min-h-[420px] flex flex-col justify-between border border-sky-400/30 bg-gradient-to-br from-sky-500/25 via-indigo-950/50 to-zinc-950/90 shadow-[0_20px_60px_rgba(56,189,248,0.12)] backdrop-blur-md">
              <div>
                <div className="font-ns-display font-extrabold text-lg mb-8 text-white">
                  Nascent Player
                </div>
                <p className="text-[15px] leading-relaxed font-medium max-w-[28ch] text-zinc-100">
                  We build lean-back cinema software — capital-grade playback, Stremio-native catalogs,
                  and household P2P sharing in one TV shell.
                </p>
                <p className="mt-5 text-[13px] leading-relaxed text-zinc-400 max-w-[30ch]">
                  From USB folders to Top Seeding rails in under a minute after install.
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollTo('features')}
                className="self-start text-[13px] font-semibold text-sky-300 underline underline-offset-4 decoration-sky-500/40 hover:decoration-sky-300 cursor-pointer"
              >
                Details →
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
              <span>Est. {year}</span>
              <span className="opacity-40">//</span>
              <span className="font-ns-display font-bold text-zinc-300">Nascent Player</span>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 order-1 lg:order-2 flex flex-col justify-end lg:items-end lg:text-right pt-10 lg:pt-0 gap-7"
          >
            <div className="relative w-full max-w-[920px] lg:ml-auto rounded-[1.35rem]">
              <div className="absolute -inset-3 rounded-[1.75rem] bg-sky-500/15 blur-2xl opacity-70 pointer-events-none" />
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/20 bg-zinc-950/80 shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-sky-400/25">
                <img
                  src="/assets/hero-app.png"
                  alt="Nascent Player TV — Movies tab with Dune: Part Two featured"
                  className="w-full h-auto block aspect-[16/10] object-cover object-top"
                  loading="eager"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>

            <h1 className="font-ns-display font-black text-[11vw] sm:text-[7vw] lg:text-[4.6vw] xl:text-[4.25rem] leading-[0.94] tracking-[-0.04em] max-w-[14ch] lg:ml-auto text-white">
              Streaming cinema that stays yours.
            </h1>
            <div className="flex items-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={onEnterPlayer}
                className="w-12 h-12 rounded-full bg-sky-500 text-black flex items-center justify-center hover:bg-sky-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-sky-500/30"
                aria-label="Open Nascent Player TV"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onEnterPlayer}
                className="text-sm font-semibold text-zinc-200 underline underline-offset-4 decoration-white/25 hover:decoration-sky-400 hover:text-sky-300 cursor-pointer"
              >
                Launch the TV experience
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium tracking-wide">
              Media Player · Libraries · Peer Mesh
            </p>
          </motion.div>
        </div>
      </section>

      {/* NUMBERS */}
      <section id="numbers" className="relative px-5 sm:px-8 lg:px-12 py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-10">
            <span className="text-[11px] text-zinc-500 font-medium">01 — By the numbers</span>
            <span className="text-[11px] text-zinc-500 font-medium">Snapshot — Living room ready</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.55 }}
            className="font-ns-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] max-w-[14ch] mb-14 text-white"
          >
            What Nascent ships today.
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-t border-white/15 pt-6">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <div className="font-ns-display font-black text-5xl sm:text-6xl tracking-[-0.04em] mb-2 text-sky-300">
                  {m.value}
                </div>
                <div className="text-sm font-semibold text-zinc-100">{m.label}</div>
                <div className="text-[12px] text-zinc-500 mt-1">{m.detail}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10 pt-8">
            {CAPABILITIES.map((c) => (
              <div key={c.title}>
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2 text-sky-400/90">{c.title}</div>
                <p className="text-[13px] leading-relaxed text-zinc-400">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px] font-medium text-zinc-400">
            <div><span className="font-bold text-zinc-100">01 Install</span> — TV shell or desktop.</div>
            <div><span className="font-bold text-zinc-100">02 Wire sources</span> — drives, addons, peers.</div>
            <div><span className="font-bold text-zinc-100">03 Press play</span> — Watch Now + Top Seeding.</div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="plugins" className="relative px-5 sm:px-8 lg:px-12 py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-10">
            <span className="text-[11px] text-zinc-500 font-medium">02 — Plugins</span>
            <span className="text-[11px] text-zinc-500 font-medium">Cycle: vault → screen in minutes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 font-ns-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.95] text-white"
            >
              How we
              <br />
              play.
            </motion.h2>

            <div className="lg:col-span-7">
              <ul className="border-t border-white/15">
                {STEPS.map((step, i) => (
                  <motion.li
                    key={step.n}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group border-b border-white/10 py-5 flex items-start gap-4 sm:gap-6 cursor-default"
                  >
                    <span className="font-ns-display font-bold text-sm w-8 shrink-0 pt-0.5 text-sky-400">{step.n}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-1 text-zinc-100">{step.title}</div>
                      <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[46ch]">{step.body}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-sky-400 transition-colors shrink-0 mt-1" />
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 rounded-3xl border border-sky-400/30 bg-sky-500/15 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-6 backdrop-blur-md">
                <div>
                  <div className="font-ns-display font-black text-4xl sm:text-5xl tracking-[-0.03em] text-white">
                    0 → Play
                  </div>
                  <div className="text-sm font-medium text-sky-200/80 mt-1">under 60 seconds</div>
                </div>
                <div className="flex flex-col gap-1.5 text-[12px] font-semibold text-zinc-200">
                  <span>01 Mount libraries</span>
                  <span>02 Search catalogs</span>
                  <span>03 Watch Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative px-5 sm:px-8 lg:px-12 py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-10">
            <span className="text-[11px] text-zinc-500 font-medium">03 — Features</span>
            <button
              type="button"
              onClick={onEnterPlayer}
              className="text-[11px] text-zinc-400 font-medium hover:text-sky-300 underline underline-offset-4 cursor-pointer"
            >
              Open player →
            </button>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-ns-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] mb-12 text-white"
          >
            Built into Nascent.
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {FEATURE_TILES.map((tile, i) => (
              <motion.div
                key={tile.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className={`relative aspect-[3/4] p-4 sm:p-5 flex flex-col justify-between rounded-3xl border ${
                  tile.tone === 'accent'
                    ? 'bg-sky-500 text-black border-sky-300/40 shadow-[0_16px_40px_rgba(56,189,248,0.25)]'
                    : 'bg-zinc-950/80 text-white border-white/10'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-ns-display font-black text-[18vw] sm:text-7xl lg:text-8xl leading-none opacity-95">
                    {tile.letter}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold ${
                      tile.tone === 'accent' ? 'text-black/60' : 'text-zinc-500'
                    }`}
                  >
                    {tile.stat}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base">{tile.name}</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      tile.tone === 'accent' ? 'text-black/55' : 'text-zinc-500'
                    }`}
                  >
                    {tile.tag}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-2">
            {FEATURE_BLURBS.map((b) => (
              <div key={b.title}>
                <div className="text-sm font-bold mb-2 text-zinc-100">{b.title}</div>
                <p className="text-[13px] leading-relaxed text-zinc-500">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="apply" className="relative px-5 sm:px-8 lg:px-12 py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="text-[11px] text-zinc-500 font-medium">04 — Download</span>
            <h2 className="mt-4 font-ns-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] max-w-[16ch] text-white">
              Ready for the living room.
            </h2>
            <p className="mt-5 text-[15px] text-zinc-400 max-w-[42ch] leading-relaxed">
              Jump straight into the Nascent Player TV experience — Movies, Shows, Libraries, search,
              and peer shares — in this browser shell.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <button
              type="button"
              onClick={onEnterPlayer}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black text-sm font-bold transition-colors cursor-pointer shadow-lg shadow-sky-500/25"
            >
              Open Nascent Player TV
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('mission')}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-white/15 text-sm font-semibold text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Back to mission
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-[11px] text-zinc-600 font-medium">
          <span>© {year} Nascent Player</span>
          <span className="font-ns-display font-bold text-zinc-400">nascent® · cinema software</span>
        </div>
      </section>
    </div>
  );
};

export default NascentLanding;
