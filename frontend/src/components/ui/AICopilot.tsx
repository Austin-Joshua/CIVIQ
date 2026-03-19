'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';


interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string | React.ReactNode;
  timestamp: Date;
}

interface Intent {
  name: string;
  keywords: string[];
  response: string | React.ReactNode;
}

const INTENTS: Intent[] = [
  {
    name: 'overflow',
    keywords: ['overflow', 'full', 'capacity', 'tomorrow', 'bins', 'fill'],
    response: (
      <div className="space-y-3 mt-2">
        <p className="text-sm text-foreground/90 leading-relaxed">System analysis indicates <strong className="text-red-500">Zone C (Industrial)</strong> and <strong className="text-orange-500">Zone A (Central)</strong> are currently trending towards capacity breach.</p>
        <div className="p-3 liquid-glass border border-white/10 rounded-xl space-y-2 bg-red-500/5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground uppercase font-black tracking-widest text-[9px]">Critical Forecast</span>
            <span className="text-red-500 font-black animate-pulse">ALARM</span>
          </div>
          <div className="text-[10px] space-y-1.5">
            <p className="flex justify-between"><span className="text-muted-foreground">Zone C:</span> <span className="font-bold">88% (Est. 14:00 Overflow)</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Zone A:</span> <span className="font-bold">82% (Est. 16:30 Overflow)</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-emerald-500">Dispatch Fleet</button>
          <button className="flex-1 py-1.5 bg-white/5 border border-white/10 text-foreground rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-white/10">Ignore</button>
        </div>
      </div>
    )
  },
  {
    name: 'cost',
    keywords: ['cost', 'reduce', 'budget', 'money', 'save', 'efficient', 'opex'],
    response: (
      <div className="space-y-3 mt-2">
        <p className="text-sm text-foreground/90">Urban OPEX can be reduced by <strong className="text-emerald-500">12.4%</strong> this cycle through dynamic route clustering.</p>
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <p className="text-xs font-bold text-foreground">Optimization Strategy:</p>
          <ul className="mt-2 space-y-1">
            <li className="text-[10px] text-muted-foreground flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500" /> Consolidate Zone D evening collections
            </li>
            <li className="text-[10px] text-muted-foreground flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500" /> Shift landfill transport to 23:00-04:00
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    name: 'risk',
    keywords: ['risk', 'safety', 'danger', 'problem', 'incident', 'issue', 'fleet'],
    response: (
      <div className="space-y-3 mt-2">
        <p className="text-sm text-foreground/90">Fleet Risk Multiplier is currently <strong className="text-emerald-500">Low (0.24)</strong>. No critical safety incidents reported in the last 12 hours.</p>
        <div className="p-3 liquid-glass border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Operational Safety</span>
              <Activity className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%]" />
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 italic">Next maintenance cycle for Vehicle #402 starts in 48h.</p>
        </div>
      </div>
    )
  }
];

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hello. I am the CIVIQ Autonomous Insight Engine. I am monitoring waste logistics, fleet risk, and city-wide cleanliness metrics in real-time. How can I assist your operations?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Contextual Processing Logic
    setTimeout(() => {
      const query = (userMsg.content || '').toString().toLowerCase();
      
      // Intent Scoring
      let bestIntentFound: Intent | null = null;
      let highestScore = 0;
      INTENTS.forEach(intent => {
        const score = intent.keywords.reduce((acc, kw) => acc + (query.includes(kw) ? 1 : 0), 0);
        if (score > highestScore) {
          highestScore = score;
          bestIntentFound = intent;
        }
      });

      const responseContent = bestIntentFound 
        ? (bestIntentFound as Intent).response 
        : (
          <p className="text-sm text-foreground/90 leading-relaxed italic opacity-90">
            &quot;I&apos;m keeping a close eye on **Forecasting**, **Fleet Safety**, and **Operational Costs**. Which area would you like to analyze together?&quot;
          </p>
        );

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseContent,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all z-40 group hover:scale-110 active:scale-95",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
      </button>

      {/* Copilot Floating Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 lg:bottom-10 lg:right-10 h-[500px] lg:h-[600px] w-[calc(100vw-48px)] sm:w-[380px] lg:w-[420px] liquid-glass backdrop-blur-2xl bg-card/80 border border-white/10 shadow-2xl rounded-[2.5rem] z-50 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="liquid-glass border-b border-white/5 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
              <Bot className="w-5 h-5 text-emerald-500 relative z-10" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground tracking-tight">CIVIQ Copilot</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Autonomous Agent Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-background/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center justify-center mt-1 text-emerald-500">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div 
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-emerald-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20" 
                    : "liquid-glass-panel border-white/5 rounded-tl-sm text-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="px-4 pb-2 shrink-0 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-x">
          {["Which zones face overflow tomorrow?", "How can we reduce costs?", "Analyze current fleet risk."].map(q => (
            <button 
              key={q}
              onClick={() => { setInput(q); }}
              className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-3 py-1.5 rounded-full border border-border/50 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 shrink-0 bg-background/80 backdrop-blur-xl border-t border-border/50">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message CIVIQ..."
              className="w-full bg-card/50 border border-border/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all font-medium placeholder:text-muted-foreground/30"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
