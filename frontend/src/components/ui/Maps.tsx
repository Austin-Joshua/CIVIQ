'use client';

import { AlertTriangle, Key, ExternalLink } from 'lucide-react';

export function MissingKeyOverlay({ feature }: { feature: string }) {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-emerald-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 mx-auto">
          <Key className="w-8 h-8 text-emerald-500" />
        </div>

        <h3 className="text-xl font-bold mb-2">Maps Key Required</h3>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          The <span className="text-emerald-400 font-bold">{feature}</span> engine requires a valid Google Maps Platform API key to initialize spatial intelligence.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('map-demo-mode'))}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 font-bold rounded-xl transition-all text-[10px] uppercase tracking-wider"
          >
            Enter Demo Mode
          </button>
          <a 
            href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 text-slate-500 hover:text-emerald-400 font-bold transition-all text-[9px] uppercase tracking-wider mt-2 group"
          >
            Get Google API Key <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <AlertTriangle className="w-3 h-3 text-emerald-500/50" />
           Local Environment: .env.local
        </div>
      </div>
    </div>
  );
}
