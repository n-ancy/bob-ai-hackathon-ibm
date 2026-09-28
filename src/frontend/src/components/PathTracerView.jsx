import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PathTracerView({ caseId }) {
  const [sourceEntity, setSourceEntity] = useState('ENT-ACC-ACC-VICTIM-01');
  const [targetEntity, setTargetEntity] = useState('ENT-ACC-ACC-FINAL-401');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrace = async () => {
    if (!sourceEntity || !targetEntity) return;
    setLoading(true);
    try {
      const res = await fetch('/api/graph/shortest-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_entity: sourceEntity,
          target_entity: targetEntity
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error tracing path:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <span>Trace Connection & Multi-Hop Path Finder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Discover graph path hops and transaction links between any two arbitrary entities in the network.
          </p>
        </div>
      </div>

      {/* Input Selector Box */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Source Entity ID</label>
            <input
              type="text"
              value={sourceEntity}
              onChange={(e) => setSourceEntity(e.target.value)}
              placeholder="e.g. ENT-ACC-ACC-VICTIM-01"
              className="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-lg text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Target Entity ID</label>
            <input
              type="text"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              placeholder="e.g. ENT-ACC-ACC-FINAL-401"
              className="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-lg text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleTrace}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg shadow-md transition"
        >
          {loading ? 'Discovering Connection Paths...' : 'Trace Connection Path'}
        </button>
      </div>

      {/* Path Result Display */}
      {result && (
        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
          {result.found ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Observable Path Discovered!
                </span>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded border border-emerald-800">
                  {result.path_length} Hops
                </span>
              </div>

              {/* Hops Sequence Visualizer */}
              <div className="flex flex-wrap items-center gap-3 py-4 overflow-x-auto">
                {result.path_sequence.map((nodeId, idx) => (
                  <React.Fragment key={nodeId}>
                    <div className="bg-slate-950 border border-cyan-800/80 p-3 rounded-xl shadow font-mono text-xs text-cyan-300">
                      <div className="text-[10px] text-slate-500 uppercase">Hop {idx}</div>
                      <div className="font-bold">{nodeId}</div>
                    </div>

                    {idx < result.path_sequence.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-amber-400 text-sm font-mono p-4 bg-slate-950 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
