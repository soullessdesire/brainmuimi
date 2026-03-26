import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '../components/ui/button'
import {
  ArrowRight, Star
} from 'lucide-react'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function Grain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px',
      }}
    />
  )
}

const TESTIMONIALS = [
  {
    quote: "Finally, authentic Kiswahili literature available online.",
    author: "James K.", role: "Reader, Nairobi",
  },
  {
    quote: "These stories remind me of home and culture.",
    author: "Amina S.", role: "Teacher, Mombasa",
  },
  {
    quote: "Supporting local authors has never been easier.",
    author: "Peter M.", role: "Student, Dar es Salaam",
  },
]

function TestimonialCard({ quote, author, role }: typeof TESTIMONIALS[0]) {
  return (
    <div className="flex flex-col gap-5 p-8 rounded-2xl border border-white/8 bg-white/[0.03]">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={12} className="fill-[#b8860b] text-[#b8860b]" />
        ))}
      </div>
      <p className="text-lg text-white/80 leading-relaxed italic">
        "{quote}"
      </p>
      <div>
        <p className="text-sm font-semibold text-white">{author}</p>
        <p className="text-xs text-white/40">{role}</p>
      </div>
    </div>
  )
}

export function Home() {
  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="Discover and download self-authored Kiswahili books. A digital library dedicated to African storytelling and literature."
        />
        <meta
          name="keywords"
          content="Kiswahili books, Swahili literature, African author, self published books, buy books online Kenya, digital books Kiswahili"
        />
        <meta name="author" content="Independent Kiswahili Author" />
        <meta property="og:title" content="Kiswahili Books Online" />
        <meta property="og:description" content="Explore original self-authored Kiswahili books available for digital download." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0906] text-white overflow-x-hidden">
        <Grain />

        {/* NAV */}
        <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/[0.06] bg-[#0a0906]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="text-[#b8860b] text-xl leading-none">⬡</span>
            <span className="text-white text-lg font-bold tracking-tight">
              Brian M Muimi
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white text-xs">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-[#b8860b] hover:bg-[#c9980f] text-white text-xs gap-1.5 border-0">
                Get started <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="relative min-h-screen flex flex-col justify-center pt-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center py-24">

            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 border border-[#b8860b]/30 bg-[#b8860b]/10 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b8860b]" />
                <span className="text-[#d4a520] text-xs font-semibold uppercase tracking-[0.15em]">
                  Independent Kiswahili Publishing
                </span>
              </div>

              <h1 className="text-[clamp(3rem,7vw,5rem)] font-bold leading-[0.92] tracking-tight text-white mb-6">
                Authentic
                <br />
                <span className="text-[#b8860b]">Kiswahili</span>
                <br />
                Literature 
                <br />
                Books
                <br />
                Online
              </h1>

              <p className="text-white/50 text-base leading-relaxed max-w-md mb-10">
                Discover self-authored Kiswahili books available for secure digital download.
                Support independent African writing and explore stories rooted in culture and language.
              </p>

              <Link to="/signup">
                <Button className="bg-[#b8860b] hover:bg-[#c9980f] text-white gap-2 h-11 px-7 text-sm border-0">
                  Browse Books <ArrowRight size={15} />
                </Button>
              </Link>
            </div>

            {/* RIGHT — Author Highlight */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="rounded-3xl border border-[#b8860b]/20 bg-gradient-to-br from-[#b8860b]/10 via-[#0a0906] to-[#0a0906] p-10 max-w-md">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Independent Kiswahili Author
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  A personal digital collection of original Kiswahili books written to preserve language and culture.
                </p>
                <ul className="text-xs text-white/40 space-y-3">
                  <li>• Self-authored books</li>
                  <li>• Written primarily in Kiswahili</li>
                  <li>• Digital PDF downloads</li>
                  <li>• Secure local payments (M-Pesa)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 px-6 md:px-12 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-14">
              Trusted by Readers Across East Africa
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 100}>
                  <TestimonialCard {...t} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SEO CONTENT */}
        <section className="py-20 px-6 md:px-12 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto text-white/50 text-sm leading-relaxed">
            <h2 className="text-2xl text-white font-semibold mb-6">
              About Our Kiswahili Books
            </h2>
            <p>
              This platform is dedicated to publishing and distributing self-authored
              Kiswahili books. Our mission is to promote African literature,
              preserve language heritage, and make original storytelling accessible
              through secure digital downloads.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/[0.06] py-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center text-xs text-white/30">
            © {new Date().getFullYear()} Kiswahili Books.
            Self-authored Kiswahili books. Digital downloads available worldwide.
          </div>
        </footer>
      </div>
    </>
  )
}