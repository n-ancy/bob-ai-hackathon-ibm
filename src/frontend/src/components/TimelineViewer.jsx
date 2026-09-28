import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight, FileText, Phone, ArrowUpRight, Shield } from 'lucide-react';

export default function TimelineViewer({ caseId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}/timeline`);
        const data = await res.json();
        setTimeline(data);
      } catch (err) {
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [caseId]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Chronological Evidence Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated time-correlated calls, transactions, logins, and device activities.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 font-mono text-sm">Sorting Evidence Chronology...</div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {timeline.map((evt, idx) => (
            <div key={evt.event_id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-4 border-[#0B0F19] group-hover:scale-125 transition"></div>

              <div className="bg-[#0F172A] border border-slate-800 hover:border-cyan-700/60 p-4 rounded-xl shadow-lg transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">{evt.timestamp}</span>
                  <span className="bg-slate-900 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800">
                    {evt.event_type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                  <span className="font-mono text-cyan-300">{evt.source_entity}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="font-mono text-cyan-300">{evt.target_entity}</span>
                </div>

                <p className="text-xs text-slate-400">{evt.details}</p>

                <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Record: {evt.source_record_id}</span>
                  <span className="text-emerald-400">Evidence ID: {evt.evidence_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
