import React from 'react';
import { ShieldAlert, Network, Share2, Layers, Cpu, Clock, Search, Bot, FileText, Upload } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeCase, onOpenUpload, onExportBrief }) {
  const navTabs = [
    { id: 'dashboard', label: 'Case Workspace', icon: Layers },
    { id: 'graph', label: 'Investigation Graph', icon: Network },
    { id: 'patterns', label: 'Detected Patterns', icon: ShieldAlert },
    { id: 'analytics', label: 'Network Intelligence', icon: Cpu },
    { id: 'roles', label: 'Role Indicators', icon: Share2 },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'paths', label: 'Trace Connection', icon: Search },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  CFNA
                </span>
                <span className="bg-cyan-950/80 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-800 font-mono">
                  v1.0 PLATFORM
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Cyber Fraud Network Analyzer
              </p>
            </div>
          </div>

          {/* Active Case Badge */}
          {activeCase && (
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Active Case:</span>
              <span className="font-semibold text-cyan-300 font-mono">{activeCase.case_id}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{activeCase.title}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Ingest Intelligence</span>
            </button>
            <button
              onClick={onExportBrief}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs px-3 py-2 rounded-lg shadow-md transition font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Export Brief PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
