'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ArrowRight, Shield, Globe, Zap, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050f0a] text-white selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">CIVIQ</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-emerald-400 transition-colors">Platform</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Solutions</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Sustainability</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Intelligence</a>
        </div>
        <button 
          onClick={() => router.push('/auth/login')}
          className="px-5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-sm font-bold transition-all"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3 h-3 fill-current" /> Next-Gen Urban intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            The Brain Behind <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">Clean, Resilient Cities.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
            CIVIQ is a comprehensive decision intelligence platform that acts as a digital twin for urban waste infrastructure. Predict. Optimize. Sustain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push('/auth/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 group text-lg"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all text-lg">
              Book a Demo
            </button>
          </div>
        </div>

        {/* Floating cards preview */}
        <div className="mt-24 max-w-6xl mx-auto relative px-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-4 shadow-2xl backdrop-blur-sm self-center">
             <div className="rounded-[2rem] overflow-hidden border border-white/5 aspect-video bg-[#070f0a] flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center gap-4 opacity-40">
                  <Globe className="w-16 h-16 text-emerald-500 animate-spin-slow" />
                  <p className="text-sm font-bold uppercase tracking-[0.3em]">Command Center Feed</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: BarChart3, 
              title: "AI Forecasting", 
              desc: "Deep-learning models predict generation peaks with up to 94% accuracy, preventing overflows before they occur." 
            },
            { 
              icon: Zap, 
              title: "Route Optimization", 
              desc: "Dynamic VRP solvers reduce fleet fuel consumption by up to 22% while maximizing bin collection efficiency." 
            },
            { 
              icon: Shield, 
              title: "Risk Monitoring", 
              desc: "24/7 autonomous monitoring of urban sanitation nodes detected infrastructure anomalies and health risks." 
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-3xl hover:border-emerald-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.06] mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/30 font-medium">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500/50" />
            <span>© 2026 CIVIQ Urban Intelligence. Operating globally.</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
