import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Cpu, Link, CheckCircle, FileText } from 'lucide-react';

export default function PatternDashboard({ caseId }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}/patterns`);
        const data = await res.json();
        setPatterns(data);
      } catch (err) {
        console.error('Error fetching patterns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, [caseId]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="bg-red-950/80 text-red-400 border border-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="bg-amber-950/80 text-amber-400 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">HIGH</span>;
      default:
        return <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800 text-xs px-2.5 py-0.5 rounded-full font-bold">MEDIUM</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Deterministic Fraud Pattern Detection Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated graph & transaction analysis leads. Deterministic rules applied over evidence graph.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs flex items-center gap-4">
          <div><span className="text-slate-400">Total Detected:</span> <span className="font-bold text-cyan-400 text-sm ml-1">{patterns.length}</span></div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-mono text-sm">Evaluating Graph & Transaction Patterns...</div>
      ) : patterns.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
          No automated fraud patterns detected for this case scope yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pat) => (
            <div key={pat.pattern_id} className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{pat.pattern_id}</span>
                    <h3 className="text-base font-bold text-cyan-300 mt-0.5">{pat.pattern_type.replace('_', ' ')}</h3>
                  </div>
                  {getSeverityBadge(pat.severity)}
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  {pat.explanation}
                </p>

                {/* Involved Entities */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Link className="w-3 h-3 text-cyan-400" /> Involved Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pat.entities_involved.map((ent, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-300 text-[10px] font-mono px-2 py-1 rounded border border-slate-800">
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Supporting Evidence */}
                {pat.supporting_evidence.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-emerald-400" /> Evidence Records:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pat.supporting_evidence.map((ev, idx) => (
                        <span key={idx} className="bg-emerald-950/60 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>Rule: {pat.detection_rule}</span>
                <span className="text-cyan-400">Deterministic</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
