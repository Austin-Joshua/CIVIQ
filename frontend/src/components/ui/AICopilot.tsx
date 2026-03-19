'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Activity, MapPin, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string | React.ReactNode;
  timestamp: Date;
}

const MOCK_RESPONSES: Record<string, React.ReactNode> = {
  overflow: (
    <div className="space-y-3 mt-2">
      <p className="text-sm text-foreground/90">Based on current generation rates and historical weekend data, <strong className="text-red-500">Zone C (Industrial North)</strong> and <strong className="text-orange-500">Zone A (Downtown)</strong> are projected to reach overflow capacity by tomorrow at 14:00.</p>
      <div className="p-3 liquid-glass border border-white/10 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Confidence Score</span>
          <span className="text-emerald-500 font-black">94%</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer group">
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="text-xs font-semibold group-hover:text-red-500 transition-colors">Zone C (84% full currently)</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer group">
          <MapPin className="w-3 h-3 text-orange-500" />
          <span className="text-xs font-semibold group-hover:text-orange-500 transition-colors">Zone A (78% full currently)</span>
        </div>
      </div>
      <button className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
        <Zap className="w-3 h-3" /> Auto-reroute Fleet
      </button>
    </div>
  ),
  cost: (
    <div className="space-y-3 mt-2">
      <p className="text-sm text-foreground/90">To reduce costs this month, I recommend <strong className="text-emerald-500">consolidating evening routes in Zone D</strong> and delaying non-critical landfill transport until off-peak hours.</p>
      <div className="p-3 bg-card border border-border rounded-xl">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Projected Savings</span>
          <span className="text-foreground font-black">$4,250</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 w-[15%] h-full rounded-full" />
        </div>
        <p className="text-[9px] text-muted-foreground mt-2 uppercase tracking-widest">Represents a 15% reduction in fuel OPEX.</p>
      </div>
    </div>
  ),
  default: (
    <p className="text-sm text-foreground/90">I am analyzing the global city matrix. Could you specify if you are looking for zone forecasts, routing optimizations, or budget analysis?</p>
  )
};

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hello. I am the CIVIQ Autonomous Insight Engine. How can I assist with your urban operations today?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { openReport } = useUIStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const query = typeof userMsg.content === 'string' ? userMsg.content.toLowerCase() : '';
      let responseContent = MOCK_RESPONSES.default;
      
      if (query.includes('overflow') || query.includes('tomorrow')) {
        responseContent = MOCK_RESPONSES.overflow;
      } else if (query.includes('cost') || query.includes('reduce')) {
        responseContent = MOCK_RESPONSES.cost;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseContent,
        timestamp: new Date()
      }]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all z-40 group hover:scale-110 active:scale-95",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Copilot Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card border-l border-border/50 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
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
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center justify-center mt-1">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
              )}
              <div 
                className={cn(
                  "p-3 rounded-2xl text-sm",
                  msg.role === 'user' 
                    ? "bg-emerald-600 text-white rounded-tr-sm" 
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
              placeholder="Ask CIVIQ Intelligence..."
              className="w-full bg-card/50 border border-border/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all font-medium placeholder:text-muted-foreground/50"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            <Activity className="w-3 h-3" />
            <span>AI-Generated Output. Verify Real-World Feasibility.</span>
          </div>
        </div>
      </div>
    </>
  );
}
