'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  ArrowRight, 
  Shield, 
  Globe, 
  Zap, 
  BarChart3, 
  Users, 
  Database, 
  Layout, 
  ArrowUpRight,
  Maximize2,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Bot,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-from to-page-to text-foreground selection:bg-emerald-500/30 overflow-x-hidden font-outfit transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-emerald-500/20 dark:bg-emerald-500/15 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 -right-1/4 w-[1000px] h-[1000px] bg-teal-500/20 dark:bg-teal-500/10 blur-[200px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nav-bg backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 p-1 bg-slate-900 flex items-center justify-center">
               <img src="/logo.png" className="w-full h-full object-cover" alt="Logo" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-foreground uppercase">CIVIQ</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            {['Platform', 'Solutions', 'Vision', 'Network'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors tracking-[0.2em] uppercase">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 backdrop-blur flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => router.push('/auth/login')}
              className="text-sm font-black text-foreground hover:text-emerald-500 transition-colors px-4 uppercase tracking-[0.2em]"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/auth/signup')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition-all shadow-xl shadow-emerald-900/40 text-sm active:scale-95 border border-emerald-400/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40">
        {/* Hero Section */}
        <section className="px-6 max-w-7xl mx-auto text-center mb-60">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Bot className="w-3.5 h-3.5 fill-current" /> Urban Intelligence OS
          </div>
          <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter mb-10 leading-[0.85] animate-in slide-in-from-bottom-5 duration-700">
            Predict. <br />
            Optimize. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Sustain.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed animate-in slide-in-from-bottom-6 duration-1000">
            CIVIQ is the first mission-critical operating system for modern city infrastructure, designed for resilient and clean urban growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-7 duration-1000">
            <button 
              onClick={() => router.push('/auth/signup')}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-xl group shadow-2xl shadow-slate-900/10 dark:shadow-white/10"
            >
              Initialize Node <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-12 py-6 bg-white/70 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-900 dark:text-white font-bold rounded-2xl transition-all hover:bg-white dark:hover:bg-slate-900 text-xl flex items-center justify-center gap-2">
              View Roadmap
            </button>
          </div>
        </section>

        {/* Value Prop Icons */}
        <section id="platform" className="px-6 max-w-7xl mx-auto mb-60">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Cpu, title: "Autonomous Monitoring", desc: "Sensors detect and predict infrastructure failures before they happen." },
                { icon: Fingerprint, title: "Secure Governance", desc: "Blockchain-backed data integrity for municipal records and audits." },
                { icon: Globe, title: "Zero-Waste Vision", desc: "Fully automated routing and sorting strategies for clean districts." }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-[2.5rem] hover:border-emerald-500/30 transition-all hover:-translate-y-2 group">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <item.icon className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Dashboard Preview */}
        <section className="px-6 max-w-7xl mx-auto mb-60 overflow-hidden">
           <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                Total Control. <br />
                <span className="text-emerald-500">One Interface.</span>
              </h2>
           </div>
           <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full opacity-30 transition-opacity group-hover:opacity-50" />
              <div className="relative bg-panel-bg border border-slate-200 dark:border-white/10 rounded-[3rem] p-4 shadow-3xl overflow-hidden backdrop-blur-xl transition-all duration-1000 group-hover:scale-[1.02]">
                  <img 
                    src="/window.svg" 
                   className="w-full rounded-[2.5rem] shadow-2xl brightness-90 grayscale-[0.2] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" 
                   alt="CIVIQ Intelligence Portal" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-20 group-hover:opacity-0 transition-opacity duration-700" />
              </div>
           </div>
        </section>

        {/* Features Section */}
        <section id="solutions" className="px-6 py-40 border-y border-slate-200 dark:border-white/5 relative">
          <div className="max-w-7xl mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                <div>
                   <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-10 leading-[0.9]">
                     The Platform for <br />
                     <span className="text-emerald-500">Public Impact.</span>
                   </h2>
                   <div className="space-y-10">
                      {[
                        { title: "Real-time Transparency", desc: "Build citizen trust with live dashboards and verified cleanliness metrics." },
                        { title: "Predictive Logistics", desc: "Optimize vehicle routing by 40% with AI-driven demand forecasting." },
                        { title: "Multi-Zone Intelligence", desc: "Manage entire districts from a single unified command node." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-8 group">
                           <div className="w-1.5 h-16 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500 transition-colors" />
                           <div>
                              <h4 className="text-xl font-black mb-2 text-slate-900 dark:text-white">{item.title}</h4>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-[3rem] p-12 space-y-10 relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
                   <div className="space-y-6 relative">
                      {[
                        "98% Sensor Network Uptime",
                        "22 Districts Managed Worldwide",
                        "34% Average Cost Reduction",
                        "ISO 27001 Data Compliance"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 text-emerald-400 font-black tracking-tight text-xl">
                           <CheckCircle2 className="w-6 h-6" />
                           {item}
                        </div>
                      ))}
                   </div>
                   <div className="pt-10 border-t border-slate-200 dark:border-white/5">
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Trusted by Municipal Experts</p>
                      <div className="flex gap-4 opacity-30">
                         {/* Placeholder for partner logos */}
                         {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 rounded-xl bg-slate-300/40 dark:bg-white/10" />)}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-6 py-40 text-center">
           <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 leading-[1]">
             Ready to <span className="text-emerald-500">Deploy?</span>
           </h2>
           <p className="text-xl text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto font-medium">
             Join the global network of cities transforming waste into intelligence.
           </p>
           <button 
             onClick={() => router.push('/auth/signup')}
             className="px-16 py-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2rem] transition-all hover:scale-105 active:scale-95 text-2xl shadow-3xl shadow-emerald-500/20"
           >
             Get Started Now
           </button>
        </section>

        {/* Footer */}
        <footer className="py-32 border-t border-slate-200 dark:border-white/5 bg-white/60 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20 text-center md:text-left">
                <div className="md:col-span-2">
                   <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                     <img src="/logo.png" className="w-10 h-10 object-cover rounded-xl" alt="CIVIQ" />
                     <span className="text-3xl font-black tracking-tighter">CIVIQ</span>
                   </div>
                   <p className="text-slate-600 dark:text-slate-500 max-w-sm font-medium leading-relaxed mx-auto md:mx-0">
                     The world's leading urban OS for smart, sustainable waste infrastructure. 
                     Predicting the future of city life, today.
                   </p>
                </div>
                <div>
                   <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs mb-8">Platform</h4>
                   <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <li>Overview</li>
                      <li>Solutions</li>
                      <li>Roadmap</li>
                      <li>Integrations</li>
                   </ul>
                </div>
                <div>
                   <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs mb-8">Company</h4>
                   <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <li>About</li>
                      <li>Sustainability</li>
                      <li>Contact</li>
                      <li>Portal Login</li>
                   </ul>
                </div>
             </div>
             <div className="flex flex-col md:flex-row items-center justify-between gap-10 opacity-50 dark:opacity-30 border-t border-slate-200 dark:border-white/5 pt-20">
                <p className="text-xs font-bold uppercase tracking-widest">© 2026 CIVIQ GLOBAL. BUILT FOR CLEAN CITIES.</p>
                <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
                   <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
                   <a href="#" className="hover:text-emerald-500 transition-colors">Safety</a>
                   <a href="#" className="hover:text-emerald-500 transition-colors">Legal</a>
                </div>
             </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

