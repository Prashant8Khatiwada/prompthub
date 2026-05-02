'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Rocket, Sparkles, Lock, Globe, ArrowRight, Cpu, Palette, Activity, Heart, Car, Layers, Zap, ShoppingBag, TrendingUp, Newspaper, FileText } from 'lucide-react'

export default function CreatopediaLanding() {
  const [creatorForm, setCreatorForm] = useState({
    name: '',
    email: '',
    niche: 'Midjourney',
    platform: ''
  })
  const [creatorSubmitted, setCreatorSubmitted] = useState(false)

  const [advForm, setAdvForm] = useState({
    company: '',
    email: '',
    website: '',
    targetNiche: 'Midjourney',
    goal: 'Brand Awareness',
    notes: ''
  })
  const [advSubmitted, setAdvSubmitted] = useState(false)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeCreator, setActiveCreator] = useState(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!creatorForm.name || !creatorForm.email) return
    setCreatorSubmitted(true)
  }

  const handleAdvSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!advForm.company || !advForm.email) return
    setAdvSubmitted(true)
  }

  const niches = [
    'Midjourney', 'ChatGPT', 'Claude', 'Runway', 'Stable Diffusion', 'Copywriting', 'SEO', 'Design', 'Marketing'
  ]

  const risingCreators = [
    { name: 'Aasma Shrestha', niche: 'Midjourney Artist', handle: '@aasma_visuals', metrics: '120k+ impressions', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
    { name: 'Milan Ray', niche: 'Claude Workflows', handle: '@milan_designs', metrics: '45k+ direct reach', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
    { name: 'David Cern', niche: 'ChatGPT Prompts', handle: '@david_cosmos', metrics: '80k+ direct reads', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Sarah Kim', niche: 'Stable Diffusion', handle: '@sarah_arts', metrics: '150k+ clicks', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
  ]

  return (
    <div className="min-h-screen bg-[#080c16] text-[#faf6ef] selection:bg-[#ff1f4b]/30 font-sans tracking-normal select-none overflow-x-hidden">
      {/* ── STICKY NAVBAR ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="font-serif italic font-medium text-white">Creato</span>
            <span
              style={{
                background: 'linear-gradient(90deg, #6c63ff 0%, #b56bff 35%, #ff4e7a 70%, #ff1f4b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              pedia
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-xs font-mono tracking-widest text-white/60 uppercase">
            <a href="#about" className="hover:text-white transition-colors">The Vision</a>
            <a href="#rising-creators" className="hover:text-white transition-colors">Top Engineers</a>
            <a href="#creators" className="hover:text-white transition-colors">Platform</a>
            <a href="#join-waitlist" className="hover:text-white transition-colors">Reach Us</a>
          </div>
          <a
            href="#join-waitlist"
            className="bg-white px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-[#080c16] hover:bg-[#ff1f4b] hover:text-white transition-all rounded-full shadow-lg"
          >
            Let&apos;s Create Together
          </a>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section
        onMouseMove={handleMouseMove}
        className="relative min-h-screen flex flex-col overflow-hidden group"
      >
        {/* === EXACT 1080TV DUAL GRADIENT: rich blue top-center + deep crimson bottom-right === */}
        <div className="absolute inset-0 bg-[#080c16] z-0" />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse 100% 70% at 50% -5%, rgba(28,55,170,0.78) 0%, transparent 62%)',
              'radial-gradient(ellipse 60% 50% at 102% 105%, rgba(155,15,50,0.72) 0%, transparent 60%)',
              'radial-gradient(ellipse 40% 28% at 99% 80%, rgba(100,8,38,0.42) 0%, transparent 55%)',
            ].join(', ')
          }}
        />
        {/* Interactive mouse glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
          style={{
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,31,75,0.05), transparent 50%)`
          }}
        />

        {/* ── Main centered content ── */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pt-36 pb-12 space-y-8">
          {/* Pill tag */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#111520]/80 border border-white/10 text-white/65 text-[11px] font-mono uppercase tracking-[0.22em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff1f4b] animate-pulse" />
            Creatopedia — Where Creators Lead
          </div>

          {/* Big headline */}
          <h1 className="text-5xl sm:text-7xl md:text-[88px] font-black leading-[1.02] tracking-tight max-w-4xl">
            <span className="text-white block">Where creators</span>
            <span
              className="block mt-1"
              style={{
                background: 'linear-gradient(90deg, #6c63ff 0%, #b56bff 35%, #ff4e7a 70%, #ff1f4b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              find their audience.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-white/55 max-w-xl mx-auto leading-relaxed font-light">
            The unified platform for high-performing AI prompts and digital assets. We bridge the gap between elite creators and a ready-to-buy community.
          </p>

          {/* Pill action tabs */}
          <div className="inline-flex items-center bg-[#111520]/80 border border-white/10 rounded-full p-1.5 gap-1 backdrop-blur-sm">
            {[
              { label: 'Discover', icon: '⊕', href: '#about' },
              { label: 'Curate', icon: '≡', href: '#rising-creators' },
              { label: 'Advertise', icon: '✦', href: '#creators' },
            ].map((tab) => (
              <a
                key={tab.label}
                href={tab.href}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 transition-all tracking-wider"
              >
                <span className="text-white/35 text-[10px]">{tab.icon}</span>
                {tab.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom Bar: FOLLOW US | SCROLL | Explore Library ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10 flex items-end justify-between">
          <div className="space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">Follow Us</p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30 flex items-center justify-center transition-all">
                <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30 flex items-center justify-center transition-all">
                <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30 flex items-center justify-center transition-all">
                <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">Scroll</p>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent" />
          </div>

          <Link
            href="/browse"
            className="flex items-center gap-3 bg-[#121626]/70 border border-white/15 hover:border-white/30 backdrop-blur-sm rounded-full px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white/80 hover:text-white transition-all hover:bg-white/10"
          >
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Explore Library
          </Link>
        </div>
      </section>

      {/* ── EVOLUTION OF CREATORS ───────────── */}
      <section id="about" className="py-36 px-6 border-b border-white/5 bg-[#070914] relative overflow-hidden group">
        {/* Exact same beautiful multi-gradient as Hero */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 100% 70% at 50% -5%, rgba(28,55,170,0.45) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 102% 105%, rgba(155,15,50,0.40) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-4 mb-24 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
            Evolution of the Creator Economy
          </h2>
          <p className="text-md font-light text-white/55 font-sans max-w-md mx-auto leading-relaxed">
            From fragmented, scattered prompt engineering workflows to direct, unified, high-impact digital storefronts.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative space-y-24 z-10">
          {/* Glowing vertical timeline line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-white/10 w-[1px] -z-10" />

          {[
            {
              chapter: 'Chapter I',
              title: 'Scattered World',
              desc: 'Creators share their work in many places and struggle to grow or earn.',
              align: 'right',
              number: '1'
            },
            {
              chapter: 'Chapter II',
              title: 'Easy Discovery',
              desc: 'Creatopedia brings all types of content into one place so people can find them easily.',
              align: 'left',
              number: '2'
            },
            {
              chapter: 'Chapter III',
              title: 'Creator Control',
              desc: 'Creators own their work, manage their store, keep their audience, and earn easily.',
              align: 'right',
              number: '3'
            }
          ].map((item, idx) => (
            <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full relative ${item.align === 'left' ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 hidden md:block" />
              {/* Perfectly aligned center dot on absolute line position */}
              <div className="w-10 h-10 rounded-full border border-[#ff1f4b]/40 bg-black flex items-center justify-center flex-shrink-0 z-20 md:absolute md:left-1/2 md:-translate-x-1/2">
                <span className="w-2 h-2 rounded-full bg-[#ff1f4b] animate-pulse"></span>
              </div>
              <div className={`flex-1 bg-[#111520]/70 backdrop-blur-sm p-8 border border-white/10 rounded-2xl space-y-3 hover:scale-[1.02] transition-all duration-500 text-left w-full hover:border-[#ff1f4b]/30 relative overflow-hidden select-none ${item.align === 'right' ? 'md:ml-12' : 'md:mr-12'}`}>
                <span className="font-mono text-[10px] text-[#ff1f4b] uppercase tracking-wider font-bold mb-3 block">{item.chapter}</span>
                <h3 className="text-xl font-black text-white leading-tight pr-12">{item.title}</h3>
                <p className="text-md font-sans text-white/55 leading-relaxed font-light">{item.desc}</p>
                {/* Large numbering exactly matching the screenshot reference */}
                <span className="absolute top-2 right-4 text-[100px] leading-none font-black text-white/5 font-sans pointer-events-none select-none select-text:none">
                  {item.number}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NICHE SHOWCASE ───────────────────── */}
      <section id="niches" className="py-36 px-6 border-b border-white/5 bg-[#070914] select-none relative overflow-hidden group">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-55 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 75% 60% at 10% 20%, rgba(28,55,170,0.30) 0%, transparent 60%)',
              'radial-gradient(ellipse 65% 50% at 90% 80%, rgba(155,15,50,0.25) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111520]/80 border border-white/10 text-[#ff1f4b] text-[10px] font-mono uppercase tracking-[0.2em]">
                <span>✦</span> Discovery
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
                Explore Diverse <span className="italic font-light">Niche Showcase</span>
              </h2>
            </div>
            <p className="text-xs text-white/45 font-light max-w-sm font-sans leading-relaxed">
              Find exactly what you are looking for. Creators on Creatopedia lead across multiple industries with exceptional digital goods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { id: 'tech', name: 'Tech & Dev', icon: Cpu, desc: 'Advanced coding scripts, AI workflows, and prompts for modern tech stacks.', num: '01', grad: 'from-blue-500/20' },
              { id: 'creative', name: 'Creative', icon: Palette, desc: 'Midjourney, Stable Diffusion, and prompt design for stunning digital art.', num: '02', grad: 'from-pink-500/20' },
              { id: 'fitness', name: 'Fitness', icon: Activity, desc: 'Custom routines, habit trackers, and high-quality coaching templates.', num: '03', grad: 'from-emerald-500/20' },
              { id: 'lifestyle', name: 'Lifestyle', icon: Heart, desc: 'Life operating systems, productivity prompts, and habit planners.', num: '04', grad: 'from-amber-500/20' },
              { id: 'automobiles', name: 'Automobiles', icon: Car, desc: 'Vehicle configuration setups, mod guides, and auto-enthusiast assets.', num: '05', grad: 'from-red-500/20' }
            ].map((niche, idx) => {
              const NicheIcon = niche.icon
              return (
                <div
                  key={idx}
                  className={`group/niche flex flex-col justify-between h-[280px] bg-[#111520]/70 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:scale-[1.03] transition-all duration-500 relative overflow-hidden select-none bg-gradient-to-b ${niche.grad} to-transparent`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover/niche:bg-white/10 flex items-center justify-center transition-all duration-500">
                        <NicheIcon className="w-5 h-5 text-white/70 transition-colors" />
                      </div>
                      <span className="font-mono text-2xl text-white/10 group-hover/niche:text-white/20 font-black tracking-tight transition-colors">
                        {niche.num}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight tracking-wide transition-colors">
                        {niche.name}
                      </h3>
                      <p className="text-xs font-sans text-white/45 mt-3 leading-relaxed font-light line-clamp-4">
                        {niche.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU CAN LIST ───────────────────── */}
      <section id="what-you-can-list" className="py-36 px-6 border-b border-white/5 bg-[#080c16] select-none relative overflow-hidden group">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-55 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 75% 60% at 85% 15%, rgba(155,15,50,0.30) 0%, transparent 60%)',
              'radial-gradient(ellipse 65% 50% at 15% 85%, rgba(28,55,170,0.25) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111520]/80 border border-white/10 text-[#ff1f4b] text-[10px] font-mono uppercase tracking-[0.2em]">
                <span>✦</span> Sell Anything
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
                What You <span className="italic font-light">Can List</span>
              </h2>
            </div>
            <p className="text-xs text-white/45 font-light max-w-sm font-sans leading-relaxed">
              Every creation has a buyer. Diversify your portfolio and showcase what makes your expertise unique on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: 'Premium Prompt Packs',
                desc: 'Highly engineered prompt libraries across models (ChatGPT, Claude, Midjourney).',
                icon: Sparkles,
                tag: 'AI Tools'
              },
              {
                title: 'Digital Goods & Templates',
                desc: 'Richly crafted systems, complete Notion workspace blueprints, and life-organizing frameworks.',
                icon: Layers,
                tag: 'Organization'
              },
              {
                title: 'Workflows & Snippets',
                desc: 'Specialized code bases, automation flows, scripts, and developer productivity tools.',
                icon: Zap,
                tag: 'Code'
              },
              {
                title: 'AI Arts & Media',
                desc: 'Exclusive collections of AI-generated assets, premium digital wallpapers, and high-res media.',
                icon: ShoppingBag,
                tag: 'Art Assets'
              }
            ].map((item, idx) => {
              const ItemIcon = item.icon
              return (
                <div key={idx} className="group/item bg-[#111520]/60 backdrop-blur-sm p-8 border border-white/10 rounded-3xl hover:scale-[1.02] transition-all duration-500 flex flex-col justify-between h-[320px] select-none">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center transition-all duration-500">
                        <ItemIcon className="w-5 h-5 text-white/60 transition-colors" />
                      </div>
                      <span className="font-mono text-[9px] text-[#ff1f4b]/60 border border-[#ff1f4b]/20 bg-[#ff1f4b]/5 rounded-full px-2.5 py-1 tracking-wider uppercase transition-all duration-500 font-bold">
                        {item.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs font-sans text-white/45 mt-3 leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30 transition-colors">
                    <span>Instantly available</span>
                    <span>✦</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (CREATORS) ───────────────────── */}
      <section id="how-it-works" className="py-36 px-6 border-b border-white/5 bg-[#070914] select-none relative overflow-hidden group">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-55 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 75% 60% at 15% 15%, rgba(28,55,170,0.30) 0%, transparent 60%)',
              'radial-gradient(ellipse 65% 50% at 85% 85%, rgba(155,15,50,0.25) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111520]/80 border border-white/10 text-[#ff1f4b] text-[10px] font-mono uppercase tracking-[0.2em]">
                <span>✦</span> Process
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
                How It Works <span className="italic font-light">(Creators)</span>
              </h2>
            </div>
            <p className="text-xs text-white/45 font-light max-w-sm font-sans leading-relaxed">
              Monetizing your audience doesn&apos;t need to be complex. Claim your spot, upload your items, and grow with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -translate-y-1/2 hidden md:block z-0" />
            {[
              {
                step: '01',
                title: 'Claim Your Storefront',
                desc: 'Set up your direct, custom-built digital storefront within 2 minutes. Own your profile link and highlight your professional presence.',
                icon: Rocket
              },
              {
                step: '02',
                title: 'List Your Digital Assets',
                desc: 'Publish your prompts, Notion kits, or art collections effortlessly. Control the pricing and structure what you offer completely.',
                icon: Layers
              },
              {
                step: '03',
                title: 'Direct Sales & Growth',
                desc: 'Sell directly to a ready-to-buy community. Leverage optimized conversion pipelines to continuously grow your earnings.',
                icon: TrendingUp
              }
            ].map((item, idx) => {
              const StepIcon = item.icon
              return (
                <div key={idx} className="group/step bg-[#111520]/60 backdrop-blur-sm p-10 border border-white/10 rounded-[32px] hover:scale-[1.03] transition-all duration-500 relative flex flex-col justify-between h-[360px] select-none z-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-[#ff1f4b]/10 border border-[#ff1f4b]/20 flex items-center justify-center text-[#ff1f4b] transition-all duration-500">
                        <StepIcon className="w-6 h-6 transition-transform group-hover/step:scale-110" />
                      </div>
                      <span className="font-mono text-3xl text-white/10 group-hover/step:text-white/20 font-black tracking-tight transition-colors">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight tracking-wide pr-8">
                        {item.title}
                      </h3>
                      <p className="text-sm font-sans text-white/45 mt-4 leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5 text-[11px] font-mono font-bold uppercase tracking-widest text-[#ff1f4b]/60 flex items-center gap-2 transition-colors">
                    <span>Join early</span> <ArrowRight className="w-3.5 h-3.5 group-hover/step:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TOP RISING CREATORS ───────────────────── */}
      <section id="rising-creators" className="py-36 px-6 border-b border-white/5 bg-[#080c16] select-none relative overflow-hidden group">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-55 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 75% 60% at 90% 10%, rgba(28,55,170,0.40) 0%, transparent 60%)',
              'radial-gradient(ellipse 65% 50% at 10% 90%, rgba(155,15,50,0.35) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111520]/80 border border-white/10 text-[#ff1f4b] text-[10px] font-mono uppercase tracking-[0.2em]">
                <span>✦</span> CREATORS
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">The minds defining <br />the Rising creators</h2>
            </div>
            <p className="text-xs text-white/45 font-light max-w-sm font-sans leading-relaxed">Our top rising creators are building distinct direct storefronts and shaping the future of prompt design on Creatopedia.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full h-[500px]">
            {risingCreators.map((creator, idx) => {
              const isActive = activeCreator === idx
              return (
                <div
                  key={idx}
                  onClick={() => setActiveCreator(idx)}
                  className="group relative rounded-[32px] overflow-hidden bg-[#111520]/60 backdrop-blur-sm border border-white/10 hover:border-[#ff1f4b]/30 cursor-pointer flex flex-col justify-between transition-all duration-700 h-[500px] md:h-[500px] select-none"
                  style={{
                    flexGrow: isActive ? 3 : 1,
                    flexShrink: 1,
                    flexBasis: '0%',
                  }}
                >
                  {/* Stunning Unsplash image as a background */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full object-cover object-center opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  {/* Mask / gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-[#080c16]/50 to-transparent z-10 opacity-90 group-hover:opacity-75 transition-opacity duration-300" />

                  {isActive ? (
                    <>
                      {/* Top right: Social icons + Number */}
                      <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
                        <div className="flex items-center gap-2.5">
                          {/* Instagram */}
                          <span className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/60 transition-all hover:bg-white/15 hover:border-white/30 cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                          </span>
                          {/* Facebook */}
                          <span className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/60 transition-all hover:bg-white/15 hover:border-white/30 cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </span>
                          {/* TikTok */}
                          <span className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/60 transition-all hover:bg-white/15 hover:border-white/30 cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.54-4.06-1.47-.9-.71-1.56-1.71-1.94-2.78-.01 2.61-.02 5.21-.02 7.82 0 1.2-.21 2.44-.79 3.47-.64 1.11-1.68 1.96-2.87 2.37-1.39.49-2.98.53-4.39.06-1.58-.51-2.94-1.66-3.66-3.13-.78-1.57-.85-3.47-.21-5.08.62-1.59 1.95-2.88 3.56-3.43 1.18-.4 2.47-.45 3.68-.15v4.2c-.8-.25-1.7-.19-2.45.24-.71.4-1.25 1.13-1.42 1.93-.24 1.05.15 2.21.99 2.85.74.57 1.74.74 2.65.44.83-.26 1.48-.96 1.69-1.81.11-.42.12-.87.12-1.31-.01-4.05-.01-8.11-.02-12.16z" />
                            </svg>
                          </span>
                        </div>
                        <span className="text-2xl font-mono text-white/30 font-light tracking-tight">0{idx + 1}</span>
                      </div>

                      {/* Bottom left: Expanded Details */}
                      <div className="relative z-20 p-10 flex flex-col justify-end h-full space-y-2.5 max-w-lg text-left">
                        <h3 className="text-4xl font-black text-white uppercase tracking-wider leading-none select-text:none">{creator.name}</h3>
                        <p className="text-sm font-mono text-white/50 uppercase tracking-widest font-light select-text:none">{creator.niche}</p>
                      </div>
                    </>
                  ) : (
                    /* Collapsed card: vertical typography */
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 select-none h-full w-full">
                      <span className="[writing-mode:vertical-rl] transform rotate-180 uppercase font-medium text-sm tracking-[0.2em] text-white/30 group-hover:text-white transition-all duration-300 mx-auto select-text:none whitespace-nowrap">
                        {creator.name}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── REVENUE MODEL ───────────────────── */}
      <section id="revenue-model" className="py-36 px-6 border-b border-white/5 select-none bg-[#070914] relative overflow-hidden group">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 75% 60% at 10% 20%, rgba(28,55,170,0.30) 0%, transparent 60%)',
              'radial-gradient(ellipse 65% 50% at 90% 80%, rgba(155,15,50,0.25) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111520]/80 border border-white/10 text-[#ff1f4b] text-[10px] font-mono uppercase tracking-[0.2em]">
              <span>✦</span> Revenue Model
            </div>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
              Three ways to earn — <br />
              <span className="italic font-light text-white/80">your content, your rules</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 border-t border-b md:border-none border-white/5 py-12 md:py-0">
            {[
              {
                icon: Newspaper,
                title: 'Ads on Your Page',
                desc: 'Brands pay to place ads on your creator profile and content pages. You earn passively just by having an audience.',
                tag: 'Passive Income'
              },
              {
                icon: FileText,
                title: 'Sell What You Create',
                desc: 'Upload PDFs, guides, templates, courses, and e-books. Set your price. Buyers pay directly — no middleman cut beyond platform fee.',
                tag: 'Direct Sales'
              },
              {
                icon: Lock,
                title: 'Premium Content Access',
                desc: 'Lock your best tutorials, videos, or resources behind a paywall. Only paying subscribers or one-time buyers get in.',
                tag: 'Recurring Revenue'
              }
            ].map((stream, idx) => {
              const StreamIcon = stream.icon
              return (
                <div
                  key={idx}
                  className="group/stream px-8 py-12 md:py-8 flex flex-col justify-between items-start gap-8 hover:bg-white/[0.01] hover:scale-[1.02] transition-all duration-500 relative first:pl-0 last:pr-0"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1f4b]/0 to-transparent transition-all duration-700" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between w-full">
                      <div className="w-14 h-14 bg-[#111520]/80 border border-white/10 rounded-2xl flex items-center justify-center text-white/60 group-hover/stream:text-white/80 transition-all duration-500">
                        <StreamIcon className="w-6 h-6 transition-transform group-hover/stream:scale-110 duration-500" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff1f4b]/60 border border-[#ff1f4b]/20 bg-[#ff1f4b]/5 px-3 py-1.5 rounded-full transition-all duration-500">
                        {stream.tag}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-black text-white transition-colors leading-tight tracking-tight">
                        {stream.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-sans text-white/50 leading-relaxed font-light transition-colors">
                        {stream.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-white/20 transition-colors mt-auto">
                    <span>Explore details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/stream:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-4 text-center max-w-3xl mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#ff1f4b] flex-shrink-0 animate-pulse" />
            <p className="font-sans text-xs md:text-sm text-white/45 font-light leading-relaxed">
              Creatopedia takes a small platform fee only when you earn. Zero cost to list. Zero monthly subscription.
            </p>
          </div>
        </div>
      </section>

      {/* ── CREATOR SIGN-UP FORM ───────────────────────────── */}
      <section id="join-waitlist" className="py-36 px-6 border-b border-white/5 bg-[#080c16] relative overflow-hidden group">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700"
          style={{
            background: [
              'radial-gradient(ellipse 90% 70% at 20% -5%, rgba(28,55,170,0.35) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 80% 105%, rgba(155,15,50,0.40) 0%, transparent 60%)',
            ].join(', ')
          }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start relative z-10">
          <div className="space-y-12 max-w-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111520]/80 border border-white/10 text-[#ff1f4b] text-[10px] font-mono uppercase tracking-[0.2em]">
                <span>✦</span> Waitlist
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
                Tapping into an engaged, <br />
                <span className="italic font-light">ready-to-buy</span> community.
              </h2>
              <p className="text-base text-white/60 leading-relaxed font-light font-sans">
                We don&apos;t just curate prompts; we create culture. Our audiences are direct, targeted, and highly engaged early adopters.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10">
              {[
                { metric: '8%+', label: 'Higher Engagement' },
                { metric: '70%', label: 'International Reach' },
                { metric: '50+', label: 'Enterprise Clients' },
                { metric: '100k+', label: 'Monthly Impressions' }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-4xl font-black text-white leading-none tracking-tight">{m.metric}</div>
                  <div className="text-[10px] font-mono text-white/40 tracking-wider uppercase">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full bg-[#111520]/60 backdrop-blur-sm p-10 border border-white/10 hover:border-[#ff1f4b]/30 transition-all duration-500 rounded-3xl">
            {creatorSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-5xl text-[#ff1f4b] mb-4 animate-bounce">✦</div>
                <h3 className="text-2xl font-black text-white leading-tight">Welcome to the Inner Circle</h3>
                <p className="text-sm text-white/60 leading-relaxed font-light">Your request has been registered. We will reach out when your spot is ready.</p>
              </div>
            ) : (
              <form onSubmit={handleCreatorSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/45">Full Name</label>
                  <input
                    required
                    type="text"
                    value={creatorForm.name}
                    onChange={(e) => setCreatorForm({ ...creatorForm, name: e.target.value })}
                    placeholder="E.g. Milan Ray"
                    className="w-full bg-[#111520]/40 border border-white/10 hover:border-white/30 focus:border-[#ff1f4b] focus:outline-none p-4 text-sm tracking-wide text-white transition-colors rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/45">Email Address</label>
                  <input
                    required
                    type="email"
                    value={creatorForm.email}
                    onChange={(e) => setCreatorForm({ ...creatorForm, email: e.target.value })}
                    placeholder="milan@creator.com"
                    className="w-full bg-[#111520]/40 border border-white/10 hover:border-white/30 focus:border-[#ff1f4b] focus:outline-none p-4 text-sm tracking-wide text-white transition-colors rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/45">Primary Focus</label>
                  <select
                    value={creatorForm.niche}
                    onChange={(e) => setCreatorForm({ ...creatorForm, niche: e.target.value })}
                    className="w-full bg-[#111520]/40 border border-white/10 hover:border-white/30 focus:border-[#ff1f4b] focus:outline-none p-4 text-sm tracking-wide text-white transition-colors font-mono rounded-2xl"
                  >
                    {niches.map((n, i) => (
                      <option key={i} value={n} className="bg-[#080c16] text-white">{n}</option>
                    ))}
                    <option value="Other" className="bg-[#080c16] text-white">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/45">Portfolio / Social Link</label>
                  <input
                    required
                    type="text"
                    value={creatorForm.platform}
                    onChange={(e) => setCreatorForm({ ...creatorForm, platform: e.target.value })}
                    placeholder="E.g. twitter.com/milan"
                    className="w-full bg-[#111520]/40 border border-white/10 hover:border-white/30 focus:border-[#ff1f4b] focus:outline-none p-4 text-sm tracking-wide text-white transition-colors rounded-2xl"
                  />
                </div>

                <button type="submit" className="w-full bg-white hover:bg-[#ff1f4b] hover:text-white py-5 text-sm font-mono font-bold uppercase tracking-widest text-[#080c16] transition-all border border-transparent rounded-full shadow-lg hover:scale-[1.01]">
                  Request Early Access
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-24 px-6 border-t border-white/5 bg-[#080c16] select-none">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                <span className="font-serif italic font-medium text-white">Creato</span>
                <span className="text-[#ff1f4b]">pedia</span>
              </Link>
              <p className="text-xs text-white/40 leading-relaxed font-light font-sans max-w-sm">The unified discovery layer for the AI creator economy.</p>
            </div>
            <div className="space-y-6">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">Platform</h4>
              <ul className="space-y-4 text-xs font-sans font-light text-white/40">
                <li><a href="#about" className="hover:text-white transition-colors">The Vision</a></li>
                <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">Creators</h4>
              <ul className="space-y-4 text-xs font-sans font-light text-white/40">
                <li><a href="#join-waitlist" className="hover:text-white transition-colors">Join the Waitlist</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Creator Portal</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">Company</h4>
              <ul className="space-y-4 text-xs font-sans font-light text-white/40">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <span className="font-mono text-[10px] text-white/30 tracking-widest">© 2024 CREATOPEDIA PLATFORM. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-8 font-mono text-[10px] text-white/30 tracking-wider">
              <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">PRIVACY</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
