'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react'

export default function Home() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const [showTop, setShowTop] = useState(false)
  const [activeId, setActiveId] = useState<string>('home')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    gotcha: '', // Honeypot field
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully!' })
        setFormData({ name: '', email: '', subject: '', message: '', gotcha: '' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' })
      }
    } catch (error) {
      console.error(error)
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const ids = ['home', 'about', 'resume', 'services', 'works', 'contact']
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (sections.length === 0) return
    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
      },
      { root: null, threshold: 0.6, rootMargin: `-${headerH}px 0px -20% 0px` }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    target: string
  ) => {
    e.preventDefault()
    const id = target.startsWith('#') ? target : `#${target}`
    const el = document.querySelector(id) as HTMLElement | null
    if (!el) return
    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0
    const y =
      window.pageYOffset + el.getBoundingClientRect().top - headerH - 8
    window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' })
    setOpen(false)
  }
  return (
    <div className="min-h-screen bg-black text-zinc-100 bg-gradient-to-tl from-zinc-800 to-black">
      <header ref={headerRef} className="sticky top-0 z-50 md:py-1.5 border-zinc-800 bg-black/80 backdrop-blur">
        <div className="relative mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center gap-2 text-lg font-bold tracking-wider text-yellow-400">
              <Image src="/logo.svg" alt="JR Bautista Logo" width={32} height={32} priority />
              <span>jrbautista.dev</span>
            </a>
            <button
              aria-label="Toggle menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                className="text-zinc-300"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <a
                href="#home"
                onClick={(e) => scrollToSection(e, '#home')}
                aria-current={activeId === 'home' ? 'page' : undefined}
                className={activeId === 'home' ? 'text-yellow-400 font-medium' : 'hover:text-yellow-400'}
              >
                Home
              </a>
              <a
                href="#about"
                onClick={(e) => scrollToSection(e, '#about')}
                aria-current={activeId === 'about' ? 'page' : undefined}
                className={activeId === 'about' ? 'text-yellow-400 font-medium' : 'hover:text-yellow-400'}
              >
                About
              </a>
              <a
                href="#resume"
                onClick={(e) => scrollToSection(e, '#resume')}
                aria-current={activeId === 'resume' ? 'page' : undefined}
                className={activeId === 'resume' ? 'text-yellow-400 font-medium' : 'hover:text-yellow-400'}
              >
                Resume
              </a>
              <a
                href="#services"
                onClick={(e) => scrollToSection(e, '#services')}
                aria-current={activeId === 'services' ? 'page' : undefined}
                className={activeId === 'services' ? 'text-yellow-400 font-medium' : 'hover:text-yellow-400'}
              >
                Services
              </a>
              <a
                href="#works"
                onClick={(e) => scrollToSection(e, '#works')}
                aria-current={activeId === 'works' ? 'page' : undefined}
                className={activeId === 'works' ? 'text-yellow-400 font-medium' : 'hover:text-yellow-400'}
              >
                Works
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                aria-current={activeId === 'contact' ? 'page' : undefined}
                className={activeId === 'contact' ? 'text-yellow-400 font-medium' : 'hover:text-yellow-400'}
              >
                Contact
              </a>
            </nav>
          </div>
          {open && (
            <nav className="absolute left-0 right-0 top-full md:hidden">
              <div className="w-full">
                <div className="grid gap-2 rounded-2xl border border-zinc-800 bg-black/90 p-3 shadow-lg backdrop-blur">
                  {[
                    { href: '#home', label: 'Home' },
                    { href: '#about', label: 'About' },
                    { href: '#resume', label: 'Resume' },
                    { href: '#services', label: 'Services' },
                    { href: '#works', label: 'Works' },
                    { href: '#contact', label: 'Contact' },
                  ].map((link) => {
                    const id = link.href.replace('#', '')
                    const active = activeId === id
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => scrollToSection(e, link.href)}
                        aria-current={active ? 'page' : undefined}
                        className={active ? 'text-sm px-3 py-2 text-yellow-400 font-medium' : 'text-sm px-3 py-2 hover:text-yellow-400'}
                      >
                        {link.label}
                      </a>
                    )
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 md:py-16">
        <section id="home" className="rounded-3xl bg-zinc-950 md:px-8 px-3 shadow-lg">
          <div className="flex flex-col-reverse items-center gap-10 md:flex-row md:items-center md:justify-between">
            <div className="md:max-w-xl text-center md:text-left">
              <p className="text-sm uppercase tracking-widest text-zinc-400">
                Hello!
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl font-roboto">
                I’m <span className="text-yellow-400">John Rey Bautista</span>
              </h1>
              <p className="mt-6 text-2xl text-zinc-300">
                <span className="text-yellow-400">Full-stack Web Developer</span> focused on modern apps, clean UI, and solid UX.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[
                  '4+ Years Experience',
                  'Full‑stack',
                  'Part-Time',
                  'Remote Friendly',
                  'Figma to Pixel-Perfect Websites',

                  'AI Models',
                ].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                      <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
              <div className="mt-6 md:mt-10 flex items-center gap-3">
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, '#contact')}
                  className="rounded-full bg-yellow-500 px-5 py-2.5 font-medium text-black shadow-sm transition-colors hover:bg-yellow-400"
                >
                  Hire Me
                </a>
                <a
                  href="#resume"
                  onClick={(e) => scrollToSection(e, '#resume')}
                  className="rounded-full border border-zinc-700 px-5 py-2.5 font-medium transition-colors hover:bg-zinc-900"
                >
                  View Resume
                </a>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Image
                src="/avatar-2.svg"
                alt="Avatar"
                width={300}
                height={300}
                priority
                className="mx-auto h-auto w-40 sm:w-80 md:w-[300px]"
              />
            </div>
          </div>
        </section>

        <section id="about" className="md:mt-20 mt-14 max-w-5xl mx-auto">
          <h2 className="text-2xl text-yellow-400 font-bold font-roboto">About Me</h2>
          <div className="grid mt-6 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold font-roboto">About</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Versatile web developer with <span className="text-yellow-400">4+ years</span> of hands‑on experience building systems
                and modern web applications. Driven to learn, adapt, and excel
                with emerging technologies.
              </p>
              <a
                href="#works"
                onClick={(e) => scrollToSection(e, '#works')}
                className="mt-4 inline-block rounded-full bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400"
              >
                Explore Works
              </a>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold font-roboto">Tech Stack</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span><span className="text-yellow-400">Laravel, Vue, React, Nextjs</span>, Inertiajs, Filament, Shadcn, Tailwind CSS</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>MySQL, Supabase, REST APIs, Git/Version Control, AWS</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>SPA, MVC</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Social Media Marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>AI models</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold font-roboto">Capabilities</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Full-stack web development and <span className="text-yellow-400">dynamic web applications</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Convert <span className="text-yellow-400">Figma</span> designs into pixel-perfect and functional websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>System integration and tooling</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Consultations and tech support</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Graphics and marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor">
                    <path d="M5 12l4 4L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>AI assisted web development</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="resume" className="md:mt-20 mt-14 max-w-5xl mx-auto">
          <h2 className="text-2xl text-yellow-400 font-bold font-roboto">Resume</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-yellow-400">Full-stack Web Developer</p>
                  <span className="text-sm text-zinc-400">2021 — Current</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Develop dynamic web applications under a Finance tech and Marketing company, convert Figma designs into pixel-perfect and functional websites, tech support and consultations.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-yellow-400">Freelance Web Developer</p>
                  <span className="text-sm text-zinc-400">2017 — 2021</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Build apps and designs for local and international clients
                  using Laravel, Vue, Inertia, Tailwind.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-yellow-400">Guest Instructor</p>
                  <span className="text-sm text-zinc-400">2017 — 2021</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Teach programming, hardware, electronics, and design with
                  hands-on activities.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-yellow-400">Jr. Web Developer</p>
                  <span className="text-sm text-zinc-400">2018 — 2019</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Create module apps for a finance and coop company.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, '#contact')}
              className="inline-flex rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-yellow-400"
            >
              Get In Touch
            </a>
          </div>
        </section>

        <section id="services" className="md:mt-20 mt-14 max-w-5xl mx-auto">
          <h2 className="text-2xl text-yellow-400 font-bold font-roboto">Services</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Web App Development",
                description:
                  "Secure, scalable apps using Laravel/Next.js with REST APIs, MySQL, Tailwind, Vue/React, and Supabase.",
              },
              {
                title: "Frontend UI",
                description:
                  "Responsive interfaces with HTML/CSS, Tailwind, Vue and React, accessibility and performance focused.",
              },
              {
                title: "Figma to Website",
                description:
                  "Convert Figma designs into pixel-perfect and functional websites.",
              },
              {
                title: "API Integration",
                description:
                  "Integrate REST/GraphQL services, authentication, and robust error handling.",
              },
              {
                title: "CMS & Admin",
                description:
                  "Admin panels and dashboards with Filament or custom builds, roles and CRUD.",
              },
              {
                title: "Consulting",
                description:
                  "Architecture reviews, performance tuning, and best practices guidance.",
              },
              {
                title: "Social Media Management",
                description:
                  "Manage social media accounts, create content, and analyze performance.",
              },
            ].map((svc) => (
              <div
                key={svc.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-black">
                  ☆
                </div>
                <p className="mt-4 font-medium">{svc.title}</p>
                <p className="mt-2 text-sm text-zinc-300">{svc.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="works" className="md:mt-20 mt-14 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-yellow-400 font-bold font-roboto">Works</h2>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, '#contact')}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-900"
            >
              Work With Me
            </a>
          </div>
          <p className="mt-3 text-sm text-yellow-400">
            Most of these works are private under my employer; details are limited and only basic info are shown.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Backend Config Module for Coop Finance App",
                summary: "Configurable module-app for the main cooperative finance operations app.",
              },
              {
                title: "Local Voting System — PH",
                summary: "Secure, local voting platform with logs and reporting.",
              },
              {
                title: "Landing Pages",
                summary: "High‑converting marketing pages with fast, SEO-optimized and responsive UI.",
              },
              {
                title: "Meta Ads Marketing",
                summary: "Campaign setup, tracking, and performance analysis for FB/Meta pages.",
              },
              {
                title: "Credit Repair App",
                summary: "Assists customers in repairing their credit scores and managing their credit status.",
              },
              {
                title: "Backend & Admin/Dashboard with Reporting",
                summary: "Custom-built role‑based admin panels with charts, exports, and insights.",
              },
              {
                title: "Loan Application Sites with Third‑party API Lenders",
                summary: "Application capture and integrations with lender APIs.",
              },
              {
                title: "Custom Shopify Options Builder (Golf Storefront)",
                summary: "Dynamic product options and UI customization for Shopify.",
              },
              {
                title: "Raffle Website",
                summary: "Ticket sales, draw scheduling, and winner management with reporting.",
              },
            ].map((w) => (
              <div
                key={w.title}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
                <p className="font-medium">{w.title}</p>
                <p className="mt-2 text-sm text-zinc-300">{w.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="md:mt-20 mt-14 max-w-5xl mx-auto overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 to-zinc-900 md:p-10 p-6 text-center">
          <h3 className="text-2xl font-semibold text-yellow-400 font-bold font-roboto">
            I’m available for part-time work, freelancing and gig
          </h3>
          <p className="mt-2 text-zinc-300">
            Let’s build something great together.
          </p>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="mt-6 inline-flex rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-medium text-black hover:bg-yellow-400"
          >
            Contact Me
          </a>
        </section>

        <section id="contact" className="max-w-5xl mx-auto md:mt-20 mt-10">
          <h2 className="text-2xl font-semibold text-yellow-400 font-bold font-roboto">Contact Me</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="font-medium">Address</p>
              <p className="mt-2 text-sm text-zinc-300">
                Balagmanok, Bacong, Negros Oriental, 6216
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="font-medium">Email</p>
              <a
                href="mailto:jrbautista.dev@gmail.com"
                className="mt-2 block text-sm text-yellow-400"
              >
                jrbautista.dev@gmail.com
              </a>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="font-medium">Phone</p>
              <p className="mt-2 text-sm text-zinc-300">09357575408</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Name"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-yellow-500"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-yellow-500"
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Subject"
                  className="sm:col-span-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-yellow-500"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Message"
                  className="sm:col-span-2 h-32 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-yellow-500"
                />
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="gotcha"
                  value={formData.gotcha}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {status.message && (
                  <p aria-live="polite" className={`mt-2 text-xs ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {status.message}
                  </p>
                )}
              </div>
            </form>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="font-medium text-yellow-400">Availability</p>
              <p className="mt-2 text-sm text-zinc-300">
                Open to <span className="text-yellow-400">part‑time</span>, freelance, gig work, and collaborations. Remote‑friendly (GMT+8). Typical response within 24 hours.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["Part‑time", "Remote‑friendly", "GMT+8"].map((t) => (
                  <div
                    key={t}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-center text-xs text-zinc-300"
                  >
                    {t}
                  </div>
                ))}
              </div>
              <p className="mt-7 font-medium">Summary</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                <li>4+ years building full‑stack web applications</li>
                <li>Focus on finance, landing, admin dashboards</li>
                <li>Core stack: Laravel, Vue, Next.js/React, Tailwind, MySQL, AWS</li>
                <li>Services: frontend, backend, API integrations, CMS/admin</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-7xl border-t border-zinc-800 px-6 py-6 text-sm text-zinc-400">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, '#home')}
            className="flex items-center gap-2 text-yellow-400"
          >
            <Image src="/logo.svg" alt="JR Bautista Logo" width={20} height={20} />
            <span className="font-bold">jrbautista.dev</span>
          </a>
          <p className="text-center md:text-left">© {new Date().getFullYear()} John Rey Bautista</p>
          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            <a href="#works" onClick={(e) => scrollToSection(e, '#works')} className="hover:text-yellow-400">
              Works
            </a>
            <a href="#services" onClick={(e) => scrollToSection(e, '#services')} className="hover:text-yellow-400">
              Services
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="hover:text-yellow-400">
              Contact
            </a>
          </div>
        </div>
      </footer>
      {showTop && (
        <button
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500 text-black shadow-lg transition hover:bg-yellow-400 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
            <path d="M6 14l6-6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
