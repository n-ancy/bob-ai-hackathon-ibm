import React, { useEffect, useState } from 'react';
import { Share2, UserCheck, ShieldAlert, Info, ChevronRight, HelpCircle } from 'lucide-react';

export default function RoleIndicatorsView({ caseId }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}/roles`);
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [caseId]);

  const getRoleBadge = (roleType) => {
    if (roleType.includes('Coordinator')) {
      return <span className="bg-purple-950/80 text-purple-300 border border-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">COORDINATOR</span>;
    } else if (roleType.includes('Mule')) {
      return <span className="bg-amber-950/80 text-amber-300 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">MULE</span>;
    }
    return <span className="bg-blue-950/80 text-blue-300 border border-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">VICTIM</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            <span>Explainable Network Role Indicators</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculated analytical indicators. Strictly evidence-grounded investigation leads (not legal guilty verdicts).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 font-mono text-sm">Evaluating Network Role Trait Rules...</div>
      ) : roles.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
          No role indicators generated for current dataset.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div key={role.indicator_id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-sm text-cyan-200 font-mono">{role.entity_id}</span>
                  </div>
                  {getRoleBadge(role.role_type)}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs bg-slate-950/80 p-2 rounded border border-slate-900">
                  <span className="text-slate-400">Analytical Confidence:</span>
                  <span className="font-bold text-emerald-400 font-mono">{Math.round(role.confidence_score * 100)}%</span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {role.explanation}
                </p>

                {/* Limitations warning */}
                <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-900 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-amber-400">
                    <HelpCircle className="w-3.5 h-3.5" /> Investigation Limitation Note:
                  </div>
                  <p>{role.limitations}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>Indicator ID: {role.indicator_id}</span>
                <span className="text-cyan-400">Evidence Backed Lead</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
