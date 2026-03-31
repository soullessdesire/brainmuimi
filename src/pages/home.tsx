import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/logo'
import { SEO } from '../components/seo'
import { Button } from '../components/ui/button'
import {
  ArrowRight, BookOpen, Star,
  ChevronRight, Users, Award, Globe, Heart,
  Feather, GraduationCap, Lightbulb,
} from 'lucide-react'

// ── Scroll reveal ─────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Reveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number
}) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: `${delay}ms`,
      }}>
      {children}
    </div>
  )
}

// ── Marquee ───────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Education', 'African Literature', 'History', 'Science',
  'Health', 'Environment', 'Culture', 'Mathematics',
  'Technology', 'Ethics', 'Sports', 'Arts',
]

function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 py-4 bg-white/[0.02]">
      <div className="flex animate-[marquee_35s_linear_infinite] whitespace-nowrap w-max">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
            <span className="w-1 h-1 rounded-full bg-[#4CAF50] inline-block shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Stat ──────────────────────────────────────────────────────────
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p style={{ fontFamily: 'var(--font-display)' }}
        className="text-5xl md:text-6xl font-bold text-white mb-2 leading-none">{number}</p>
      <p className="text-xs text-white/40 uppercase tracking-[0.18em] font-medium">{label}</p>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────
function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-4 p-7 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#4CAF50]/20 transition-all duration-300 group">
      <div className="w-10 h-10 rounded-xl bg-[#4CAF50]/15 flex items-center justify-center text-[#81C784] group-hover:bg-[#4CAF50]/25 transition-colors">
        {icon}
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

// ── Testimonial ───────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "These books touched me deeply. The language is beautifully crafted — easy to read and genuinely engaging.",
    author: "Amani W.", role: "Student, Dar es Salaam",
  },
  {
    quote: "Brian understands how to reach readers of all kinds. Truly impressive work!",
    author: "Fatuma S.", role: "Secondary School Teacher, Mombasa",
  },
  {
    quote: "Quality educational books in our language were rare — but now we have this incredible resource. Thank you!",
    author: "Baraka M.", role: "Academic, Nairobi",
  },
]

function TestimonialCard({ quote, author, role }: typeof TESTIMONIALS[0]) {
  return (
    <div className="flex flex-col gap-5 p-8 rounded-2xl border border-white/8 bg-white/[0.03]">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={12} className="fill-[#4CAF50] text-[#4CAF50]" />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-display)' }}
        className="text-lg text-white/80 leading-relaxed italic">"{quote}"</p>
      <div>
        <p className="text-sm font-semibold text-white">{author}</p>
        <p className="text-xs text-white/40">{role}</p>
      </div>
    </div>
  )
}

// ── Grain overlay ─────────────────────────────────────────────────
function Grain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '180px',
      }}
    />
  )
}

// ── Page ──────────────────────────────────────────────────────────
export function Home() {
  return (
    <>
    <SEO
        title="Free Educational Books"
        description="Brian M Muimi Books and Publications — free educational books spanning history, science, health, ethics and more. Read online, no login required."
        path="/"
      />
    <div className="min-h-screen bg-[#0a0f0a] text-white overflow-x-hidden">
      <Grain />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .h1 { animation: heroFadeUp 0.8s ease 0.1s both; }
        .h2 { animation: heroFadeUp 0.8s ease 0.25s both; }
        .h3 { animation: heroFadeUp 0.8s ease 0.4s both; }
        .h4 { animation: heroFadeUp 0.8s ease 0.55s both; }
        .h5 { animation: heroFadeUp 0.8s ease 0.65s both; }
      `}</style>

      {/* ── Contact strip ── */}
      <div className="fixed top-0 inset-x-0 z-50 bg-[#4CAF50] text-white text-xs py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 flex-wrap">
          <a href="tel:0743074018" className="flex items-center gap-1.5 hover:text-white/80 transition-colors font-medium">
            📞 0743 074 018
          </a>
          <span className="text-white/40">·</span>
          <a href="mailto:brianmuimi2004@gmail.com" className="flex items-center gap-1.5 hover:text-white/80 transition-colors font-medium">
            ✉ brianmuimi2004@gmail.com
          </a>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-7 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 h-14 border-b border-white/[0.06] bg-[#0a0f0a]/85 backdrop-blur-md">
        <Logo invert />
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-white/50 uppercase tracking-[0.12em]">
          <a href="#about"    className="hover:text-white/90 transition-colors">About</a>
          <a href="#library"   className="hover:text-white/90 transition-colors">Library</a>
          <a href="#how-it-works"    className="hover:text-white/90 transition-colors">How It Works</a>
          <a href="#testimonials"    className="hover:text-white/90 transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white text-xs bg-transparent hover:bg-transparent border-white/60 hover:border-white">
              Sign In
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="bg-[#4CAF50] hover:bg-[#388E3C] text-white text-xs gap-1.5 border-0">
              Read Now <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-28 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 65%, rgba(76,175,80,0.10), transparent)' }} className="absolute inset-0" />
          <div style={{ background: 'radial-gradient(ellipse 50% 50% at 80% 30%, rgba(107,45,139,0.08), transparent)' }} className="absolute inset-0" />
          <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#4CAF50]/8 to-transparent hidden lg:block" />
          <div className="absolute left-[90%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#6B2D8B]/8 to-transparent hidden lg:block" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left — text */}
          <div>
            {/* Badge */}
            <div className="h1 inline-flex items-center gap-2 border border-[#4CAF50]/30 bg-[#4CAF50]/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
              <span className="text-[#81C784] text-xs font-semibold uppercase tracking-[0.15em]">
                Educational Author · Brian M Muimi
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)' }}
              className="h2 text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.92] tracking-tight text-white mb-6">
              Knowledge for
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
                our language,
              </span>
              <br />
              <span className="text-[#4CAF50]">our people.</span>
            </h1>

            <p className="h3 text-white/55 text-base leading-relaxed max-w-md mb-10">
              Educational books spanning history, science, health, ethics, and much more.
              Read for free, anytime, anywhere. Written with heart for Africa.
            </p>

            <div className="h4 flex items-center gap-4 flex-wrap">
              <Link to="/dashboard">
                <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2 h-11 px-7 text-sm border-0">
                  Browse Library <ArrowRight size={15} />
                </Button>
              </Link>
              <a href="#about">
                <Button variant="ghost" className="text-white/50 hover:text-white gap-2 h-11 px-5 text-sm">
                  Learn More <ChevronRight size={14} />
                </Button>
              </a>
            </div>

            <div className="h5 flex items-center gap-6 mt-10 pt-8 border-t border-white/[0.07] flex-wrap">
              {[
                { icon: <Globe size={14} />,        label: 'African Language' },
                { icon: <BookOpen size={14} />,     label: 'Free to read' },
                { icon: <GraduationCap size={14} />,label: 'Educational' },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-white/35 font-medium">
                  <span className="text-[#4CAF50]">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — author card */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-6 relative">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(76,175,80,0.06), transparent 70%)' }} />

            {/* Author card */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 w-full max-w-sm text-center">
              {/* SVG logo large */}
              <div className="flex justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" style={{ width: 90, height: 72 }}>
                  <circle cx="100" cy="20" r="18" fill="#4CAF50"/>
                  <path d="M5 85 Q28 58 58 72 Q45 92 5 85Z"       fill="#6B2D8B"/>
                  <path d="M8 100 Q33 70 62 85 Q49 108 8 100Z"     fill="#6B2D8B"/>
                  <path d="M12 115 Q38 83 67 100 Q53 122 12 115Z"  fill="#6B2D8B"/>
                  <path d="M195 85 Q172 58 142 72 Q155 92 195 85Z" fill="#6B2D8B"/>
                  <path d="M192 100 Q167 70 138 85 Q151 108 192 100Z" fill="#6B2D8B"/>
                  <path d="M188 115 Q162 83 133 100 Q147 122 188 115Z" fill="#6B2D8B"/>
                  <path d="M22 88 Q47 63 77 77 Q64 97 22 88Z"      fill="#4CAF50"/>
                  <path d="M26 103 Q52 76 82 92 Q68 112 26 103Z"   fill="#4CAF50"/>
                  <path d="M178 88 Q153 63 123 77 Q136 97 178 88Z" fill="#4CAF50"/>
                  <path d="M174 103 Q148 76 118 92 Q132 112 174 103Z" fill="#4CAF50"/>
                  <path d="M100 130 Q93 104 100 78 Q107 104 100 130Z" fill="#4CAF50"/>
                </svg>
              </div>
              <p style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl font-bold text-white mb-1">Brian M Muimi</p>
              <p className="text-[#4CAF50] text-xs uppercase tracking-widest font-semibold mb-5">
                Author · Writer
              </p>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                An emerging author with one dream — bringing quality education
                across Africa and the world.
              </p>
              <div className="flex justify-center gap-6 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-[#4CAF50]">🆓</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mt-1">Completely Free</p>
                </div>
                <div className="text-center">
                  <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-[#81C784]">KE</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mt-1">Made in Africa</p>
                </div>
                <div className="text-center">
                  <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-[#9C4DCC]">📚</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mt-1">Premium Quality</p>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            {[
              { text: '✍️ Educational',       cls: 'top-4 -left-4 rotate-[-6deg]' },
              { text: '🌍 African Literature', cls: 'bottom-8 -right-4 rotate-[4deg]' },
              { text: '📖 African Books',     cls: 'top-1/2 -right-8 rotate-[-3deg]' },
            ].map(({ text, cls }) => (
              <div key={text}
                className={`absolute ${cls} bg-white/[0.08] border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-white/60 whitespace-nowrap backdrop-blur-sm`}>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0f0a] to-transparent pointer-events-none" />
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── STATS ── */}
      <section className="py-24 px-6 md:px-12">
        <Reveal>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <Stat number="🆓"  label="Completely free books" />
            <Stat number="KE"  label="Made in Kenya 🇰🇪" />
            <Stat number="SW"  label="African Writing" />
            <Stat number="24/7" label="Read anytime" />
          </div>
        </Reveal>
      </section>

      {/* ── KUHUSU ── */}
      <section id="about" className="py-24 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div>
              <p className="text-[#4CAF50] text-xs font-bold uppercase tracking-[0.2em] mb-4">About the Author</p>
              <h2 style={{ fontFamily: 'var(--font-display)' }}
                className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                A passion for bringing<br />education to every reader.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                I am Brian M Muimi, an emerging author from Kenya. I write educational books
                — because I believe every person has the right to access
                quality education in the language they know best.
              </p>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                My books cover a wide range of topics: history, science, health, environment,
                ethics, and more. My goal is to reach readers of all ages — children, youth,
                and elders — and give them knowledge that will transform their lives.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50]/20 flex items-center justify-center">
                  <Feather size={15} className="text-[#4CAF50]" />
                </div>
                <p className="text-sm text-white/60 italic">
                  "Education is the most powerful weapon you can use to change the world." — Adapted for Africa
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Feather size={18}/>,        title: 'Authentic Voice',  body: 'Books written in clear, accessible language that every reader can understand and enjoy.' },
                { icon: <GraduationCap size={18}/>,  title: 'Educational',         body: 'Content that educates, sparks thought, and builds the capacity of every reader.' },
                { icon: <Globe size={18}/>,          title: 'Diverse Topics', body: 'History, health, science, environment, ethics, arts, and so much more.' },
                { icon: <Heart size={18}/>,          title: 'Written with Heart',   body: 'Every book is crafted with love and a genuine desire to transform society.' },
              ].map((f) => (
                <div key={f.title}
                  className="p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-[#4CAF50]/20 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#4CAF50]/15 flex items-center justify-center text-[#81C784] mb-3">
                    {f.icon}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-semibold text-white mb-1">{f.title}</h4>
                  <p className="text-xs text-white/40 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VITABU (catalogue teaser) ── */}
      <section id="library" className="py-24 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-[#4CAF50] text-xs font-bold uppercase tracking-[0.2em] mb-4">The Library</p>
                <h2 style={{ fontFamily: 'var(--font-display)' }}
                  className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  The library keeps<br />growing.
                </h2>
              </div>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                Read all books completely free — no payment, no sign-up required.
                New books are added regularly.
              </p>
            </div>
          </Reveal>

          {/* Mada grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {[
              { emoji: '📜', label: 'History' },
              { emoji: '🔬', label: 'Science' },
              { emoji: '💚', label: 'Health' },
              { emoji: '🌿', label: 'Environment' },
              { emoji: '⭐', label: 'Ethics' },
              { emoji: '🎨', label: 'Arts' },
            ].map(({ emoji, label }, i) => (
              <Reveal key={label} delay={i * 60}>
                <Link to="/dashboard">
                  <div className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-transparent p-6 hover:border-[#4CAF50]/40 hover:from-white/[0.08] transition-all duration-400 text-center cursor-pointer">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(76,175,80,0.07), transparent 70%)' }} />
                    <p className="text-3xl mb-3">{emoji}</p>
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">{label}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="text-center">
              <Link to="/dashboard">
                <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2 h-11 px-8 text-sm border-0">
                  Browse All Books <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── JINSI INAVYOFANYA KAZI ── */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-[#4CAF50] text-xs font-bold uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 style={{ fontFamily: 'var(--font-display)' }}
              className="text-4xl md:text-5xl font-bold text-white mb-16 leading-tight">
              Simple. Free. Instant.
            </h2>
          </Reveal>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-0 mb-20">
            {[
              { n: '01', title: 'Visit the Library', body: 'Open this website and browse all available books — no sign-up or login required.' },
              { n: '02', title: 'Choose a Book',    body: "Click the 'Read Document' button on any book you like and it opens instantly." },
              { n: '03', title: 'Read and Enjoy',   body: 'Read any book for free. Sign in only if you want to leave a rating.' },
            ].map(({ n, title, body }, i) => (
              <Reveal key={n} delay={i * 100}>
                <div className={`relative flex flex-col gap-4 p-8 ${i < 2 ? 'border-r border-white/[0.06]' : ''}`}>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-[3.25rem] right-0 w-8 h-px bg-gradient-to-r from-[#4CAF50]/30 to-transparent translate-x-full z-10" />
                  )}
                  <span style={{ fontFamily: 'var(--font-display)' }}
                    className="text-5xl font-bold text-white/[0.07] leading-none">{n}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}
                    className="text-xl font-semibold text-white">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Why section */}
          <Reveal>
            <h3 style={{ fontFamily: 'var(--font-display)' }}
              className="text-2xl font-semibold text-white mb-8">
              Kwa Nini Brian M Muimi Books?
            </h3>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Lightbulb size={18}/>,      title: 'Genuine Knowledge',       body: 'Every book contains thoroughly researched content that delivers real value to the reader.' },
              { icon: <Globe size={18}/>,           title: 'Clear Language',   body: 'Clean, precise language is used throughout — no unnecessarily complex words or jargon.' },
              { icon: <Heart size={18}/>,           title: 'Completely Free',          body: 'No payment. No mandatory sign-up. Read without any barrier.' },
              { icon: <Users size={18}/>,           title: 'For Everyone',        body: 'Books for all groups — children, youth, elders, students, and teachers.' },
              { icon: <Award size={18}/>,           title: 'High Quality',          body: 'Carefully crafted books that are enjoyable to read and intellectually stimulating.' },
              { icon: <Feather size={18}/>,         title: 'Always Growing',    body: 'New books are added regularly. Come back regularly to discover new titles.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <Feature {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAONI ── */}
      <section id="testimonials" className="py-24 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-[#4CAF50] text-xs font-bold uppercase tracking-[0.2em] mb-4">Reader Reviews</p>
            <h2 style={{ fontFamily: 'var(--font-display)' }}
              className="text-4xl md:text-5xl font-bold text-white mb-14 leading-tight">
              What our<br />readers say.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.author} delay={i * 100}>
                <TestimonialCard {...t} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-6 md:px-12 border-t border-white/[0.06]">
        <Reveal>
          <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden border border-[#4CAF50]/20 bg-gradient-to-br from-[#4CAF50]/8 via-[#0a0f0a] to-[#0a0f0a] p-12 md:p-20">
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top right, rgba(107,45,139,0.12), transparent 70%)' }} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div>
                <p className="text-[#4CAF50] text-xs font-bold uppercase tracking-[0.2em] mb-4">Start Today</p>
                <h2 style={{ fontFamily: 'var(--font-display)' }}
                  className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                  Your next great read<br />is waiting for you.
                </h2>
                <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                  Join readers who love African literature and seek knowledge
                  that transforms lives. Read for free, anytime.
                </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <Link to="/dashboard">
                  <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white gap-2 h-12 px-8 text-sm w-full border-0">
                    Read Books Now <ArrowRight size={15} />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline"
                    className="border-white/15 text-white/60 hover:text-white hover:border-white/30 h-12 px-8 text-sm w-full bg-transparent hover:bg-transparent border-white/60 hover:border-white">
                    Create a Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo invert />
          <p className="text-xs text-white/25 text-center">
            © {new Date().getFullYear()} Brian M Muimi Books and Publications. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30 font-medium">
            <Link to="/login"    className="hover:text-white/70 transition-colors">Sign In</Link>
            <Link to="/signup"   className="hover:text-white/70 transition-colors">Register</Link>
            <Link to="/dashboard" className="hover:text-white/70 transition-colors">Library</Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}