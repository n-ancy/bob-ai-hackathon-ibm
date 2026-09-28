import React, { useEffect, useState } from 'react';
import { Layers, Plus, ShieldAlert, Network, Share2, Cpu, FileText, Upload, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function CaseDashboard({ activeCase, setActiveCase, cases, onSelectTab, onOpenUpload, onExportBrief }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateCase = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          investigator: 'Insp. V. Sharma',
          tags: ['FRAUD_INVESTIGATION']
        })
      });
      const data = await res.json();
      setActiveCase(data);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      console.error('Error creating case:', err);
    }
  };

  if (!activeCase) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-cyan-950/60 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase">
              {activeCase.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">Case ID: {activeCase.case_id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{activeCase.title}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{activeCase.description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition font-medium"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create New Case</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg transition font-medium"
          >
            <Upload className="w-4 h-4" />
            <span>Ingest Data</span>
          </button>
        </div>
      </div>

      {/* Case Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('graph')}
          className="bg-[#0F172A] border border-slate-800 hover:border-cyan-600 p-5 rounded-2xl cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Entities Ingested</span>
            <Network className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">{activeCase.entity_count || 21}</div>
          <div className="text-[10px] text-slate-500 mt-1">Click to view graph →</div>
        </div>

        <div
          onClick={() => onSelectTab('graph')}
          className="bg-[#0F172A] border border-slate-800 hover:border-emerald-600 p-5 rounded-2xl cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Transactions & Edges</span>
            <Layers className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">{activeCase.transaction_count || 19}</div>
          <div className="text-[10px] text-slate-500 mt-1">Money flows & calls →</div>
        </div>

        <div
          onClick={() => onSelectTab('patterns')}
          className="bg-[#0F172A] border border-slate-800 hover:border-amber-600 p-5 rounded-2xl cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Detected Patterns</span>
            <ShieldAlert className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2">7</div>
          <div className="text-[10px] text-slate-500 mt-1">Fan-in, Shared dev & rapid →</div>
        </div>

        <div
          onClick={() => onSelectTab('roles')}
          className="bg-[#0F172A] border border-slate-800 hover:border-purple-600 p-5 rounded-2xl cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Role Indicators</span>
            <Share2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono mt-2">5</div>
          <div className="text-[10px] text-slate-500 mt-1">Coordinators & Mules →</div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onSelectTab('graph')}
          className="bg-[#0F172A] border border-slate-800 hover:border-cyan-500 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-cyan-300">Interactive Investigation Graph</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trace relationships across people, accounts, UPI IDs, SIMs, devices, and IP addresses with right provenance drawer.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('analytics')}
          className="bg-[#0F172A] border border-slate-800 hover:border-purple-500 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-purple-300">Network Centrality & Communities</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Betweenness centrality ranking and Louvain community detection to pinpoint key network hubs and bridges.
          </p>
        </div>

        <div
          onClick={onExportBrief}
          className="bg-[#0F172A] border border-slate-800 hover:border-emerald-500 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-emerald-300">Export Case Brief PDF</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate a complete ReportLab investigation brief containing evidence citations, pattern summary, and role analysis.
          </p>
        </div>
      </div>

      {/* Modal to Create New Case */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Investigation Case</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Case Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Cyber Fraud Network Investigation - Case 002"
                className="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief summary of fraud complaint..."
                className="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 h-20"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 text-xs py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                className="flex-1 bg-cyan-600 text-white text-xs py-2 rounded-lg font-bold"
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
