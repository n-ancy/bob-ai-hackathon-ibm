import React, { useEffect, useState } from 'react';
import { Cpu, Share2, Layers, Award, ShieldAlert } from 'lucide-react';

export default function NetworkAnalyticsView({ caseId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}/analytics`);
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [caseId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-mono text-sm">Computing Graph Centralities & Louvain Community Clusters...</div>;
  }

  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Network Intelligence & Community Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Graph centrality calculations via NetworkX. Identifies high-connectivity hubs and cluster bridges.
          </p>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Nodes</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{analytics.total_nodes}</div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Edges</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{analytics.total_edges}</div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Graph Density</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{analytics.density}</div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Community Clusters</span>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1">{analytics.communities_count}</div>
        </div>
      </div>

      {/* Centrality Leaderboard Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Top Centrality Ranking Leaderboard
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Betweenness Centrality</th>
                <th className="py-3 px-4">Degree Centrality</th>
                <th className="py-3 px-4">Closeness</th>
                <th className="py-3 px-4">PageRank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {analytics.top_centrality_entities.map((ent, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 text-cyan-300 font-semibold">{ent.entity_id}</td>
                  <td className="py-3 px-4"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{ent.entity_type}</span></td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{ent.betweenness}</td>
                  <td className="py-3 px-4 text-slate-300">{ent.degree}</td>
                  <td className="py-3 px-4 text-slate-400">{ent.closeness}</td>
                  <td className="py-3 px-4 text-purple-400">{ent.pagerank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Community Clusters View */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Community Clusters & Bridge Entities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.communities.map((cluster) => (
            <div key={cluster.community_id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 text-xs font-mono">{cluster.community_id}</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                  {cluster.size} Entities
                </span>
              </div>
              
              <div className="text-xs text-slate-400">
                Dominant Types: {cluster.dominant_types.join(', ')}
              </div>

              {cluster.bridge_entities.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-900/60 p-2.5 rounded text-xs space-y-1">
                  <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Bridge Entities Connecting Clusters:
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono text-[10px] text-amber-200">
                    {cluster.bridge_entities.map((b, i) => (
                      <span key={i} className="bg-amber-900/80 px-1.5 py-0.5 rounded">{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
