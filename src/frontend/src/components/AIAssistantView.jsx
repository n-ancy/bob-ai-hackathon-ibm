import React, { useState } from 'react';
import { Bot, Send, ShieldCheck, Sparkles, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AIAssistantView({ caseId }) {
  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text: `Hello Officer. I am the CFNA Evidence-Grounded Assistant for case ${caseId}, powered by IBM watsonx / Granite AI architecture.\n\nAsk me any question regarding ingested entities, transaction flows, shared devices, or detected patterns. All answers are strictly anchored to verified case evidence without hallucination.`,
      evidence: [`Case Scope: ${caseId}`]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "How is Account ACC-MULE-101 connected to Device DEV-HUB-X and what suspicious patterns were detected?",
    "What observable relationships connect account ACC-MULE-101 to the network?",
    "Which accounts received fan-in transfers from reported victims?"
  ];

  const handleSend = async (customQuery) => {
    const userMsg = customQuery || input.trim();
    if (!userMsg || loading) return;

    if (!customQuery) setInput('');
    setMessages(prev => [...prev, { sender: 'USER', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, case_id: caseId })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text: data.answer,
          evidence: data.supporting_evidence,
          leads: data.investigation_leads
        }
      ]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'AI', text: 'An error occurred while fetching evidence context.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col h-[calc(100vh-130px)]">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span>Evidence-Grounded AI Assistant</span>
            </h2>
            <span className="bg-gradient-to-r from-blue-950 to-purple-950 text-cyan-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-cyan-800 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-cyan-400" /> IBM watsonx / Granite Powered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-hallucination constraint. Answers strictly derived from ingested evidence graph & deterministic analytics.
          </p>
        </div>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="py-3 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Suggested Questions:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] px-3 py-1 rounded-lg border border-slate-800 transition whitespace-nowrap flex items-center gap-1 shrink-0"
          >
            <span>{q.substring(0, 45)}...</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.sender === 'USER' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-3 shadow-xl ${
                msg.sender === 'USER'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                  : 'bg-[#0F172A] border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="font-semibold flex items-center justify-between text-[11px] opacity-90 border-b border-slate-800/80 pb-1.5">
                {msg.sender === 'USER' ? (
                  <span>Investigator Query</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> IBM Granite / CFNA AI Engine
                  </span>
                )}
              </div>

              <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed text-[12px]">{msg.text}</div>

              {/* Supporting Evidence Citations */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Evidence Citations:
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono text-emerald-300">
                    {msg.evidence.map((ev, i) => (
                      <span key={i} className="bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">{ev}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-3 bg-slate-900/80 rounded-xl w-fit border border-slate-800">
            <Bot className="w-4 h-4 animate-bounce text-cyan-400" />
            <span>IBM Granite Engine consulting graph & transaction store...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about connected accounts, shared devices, or victim transactions..."
          className="flex-1 bg-slate-900 border border-slate-700/80 text-xs px-4 py-3 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 rounded-xl transition flex items-center justify-center shadow-lg font-semibold text-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
