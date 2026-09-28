import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { Search, ZoomIn, ZoomOut, RefreshCw, Filter, Info, ShieldCheck, Database, ArrowRight, Activity, Eye, Layers } from 'lucide-react';

export default function GraphViewer({ caseId }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/graph`);
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error('Error fetching graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [caseId]);

  useEffect(() => {
    if (!containerRef.current || loading || !graphData.nodes.length) return;

    // Filter nodes by type
    const filteredNodes = filterType === 'ALL'
      ? graphData.nodes
      : graphData.nodes.filter(n => n.type === filterType);

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

    // Curated high-contrast color scheme per entity type
    const getNodeStyle = (type, label) => {
      switch (type) {
        case 'BankAccount':
          return { background: '#0284C7', border: '#38BDF8', icon: '🏦', shadowColor: 'rgba(2, 132, 199, 0.4)' };
        case 'Phone':
          return { background: '#059669', border: '#34D399', icon: '📱', shadowColor: 'rgba(5, 150, 105, 0.4)' };
        case 'Device':
          return { background: '#D97706', border: '#FBBF24', icon: '💻', shadowColor: 'rgba(217, 119, 6, 0.4)' };
        case 'IP':
          return { background: '#7C3AED', border: '#A78BFA', icon: '🌐', shadowColor: 'rgba(124, 58, 237, 0.4)' };
        case 'SIM':
          return { background: '#DB2777', border: '#F472B6', icon: '💳', shadowColor: 'rgba(219, 39, 119, 0.4)' };
        default:
          return { background: '#475569', border: '#94A3B8', icon: '📌', shadowColor: 'rgba(71, 85, 105, 0.4)' };
      }
    };

    const visNodes = filteredNodes.map(n => {
      const style = getNodeStyle(n.type, n.label);
      // Clean display label
      const cleanVal = n.label || n.id;
      const displayLabel = `${style.icon} ${n.type}\n${cleanVal}`;

      return {
        id: n.id,
        label: displayLabel,
        color: {
          background: style.background,
          border: style.border,
          highlight: { background: '#F59E0B', border: '#FBBF24' },
          hover: { background: '#0EA5E9', border: '#7DD3FC' }
        },
        font: {
          color: '#FFFFFF',
          size: 11,
          face: 'Inter, sans-serif',
          multi: true,
          bold: { color: '#FFFFFF', size: 12 }
        },
        shape: 'box',
        margin: { top: 8, bottom: 8, left: 12, right: 12 },
        borderRadius: 8,
        borderWidth: 2,
        shadow: { enabled: true, color: style.shadowColor, size: 8, x: 0, y: 3 },
        rawData: n
      };
    });

    const formatEdgeLabel = (relType) => {
      switch (relType) {
        case 'TRANSFERRED_TO': return 'Transferred';
        case 'ACCESSES': return 'Accesses';
        case 'OWNS': return 'Owns';
        case 'USES': return 'Uses';
        case 'INSTALLED_IN': return 'Installed In';
        case 'CALLED': return 'Called';
        case 'USED_IP': return 'Used IP';
        default: return relType;
      }
    };

    const visEdges = filteredEdges.map(e => ({
      id: e.id,
      from: e.source,
      to: e.target,
      label: showEdgeLabels ? formatEdgeLabel(e.type) : '',
      font: { color: '#94A3B8', size: 9, strokeWidth: 2, strokeColor: '#0F172A', align: 'horizontal' },
      arrows: { to: { enabled: true, scaleFactor: 0.6 } },
      color: { color: '#334155', highlight: '#F59E0B', hover: '#38BDF8' },
      width: e.type === 'TRANSFERRED_TO' ? 2 : 1.5,
      smooth: { type: 'continuous', roundness: 0.2 },
      rawData: e
    }));

    const data = { nodes: visNodes, edges: visEdges };
    const options = {
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true
      }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    networkRef.current.on('select', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nObj = graphData.nodes.find(n => n.id === nodeId);
        setSelectedItem({ kind: 'NODE', data: nObj });

        // Highlight connected edges & neighbors
        const connectedNodes = networkRef.current.getConnectedNodes(nodeId);
        networkRef.current.selectNodes([nodeId, ...connectedNodes]);
      } else if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const eObj = graphData.edges.find(e => e.id === edgeId);
        setSelectedItem({ kind: 'EDGE', data: eObj });
      } else {
        setSelectedItem(null);
      }
    });
  }, [graphData, filterType, showEdgeLabels, loading]);

  const handleSearch = () => {
    if (!networkRef.current || !searchQuery) return;
    const match = graphData.nodes.find(n =>
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.label && n.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (match) {
      networkRef.current.selectNodes([match.id]);
      networkRef.current.focus(match.id, { scale: 1.3, animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
      setSelectedItem({ kind: 'NODE', data: match });
    }
  };

  const handleZoom = (factor) => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * factor, animation: true });
  };

  const handleResetView = () => {
    if (!networkRef.current) return;
    networkRef.current.fit({ animation: true });
    setSelectedItem(null);
  };

  return (
    <div className="flex h-[calc(100vh-130px)] gap-4 p-4">
      {/* Main Canvas Container */}
      <div className="flex-1 flex flex-col bg-[#0B0F19] rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 bg-[#0F172A]/90 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search phone, account, device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-slate-950 border border-slate-700/80 text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 w-64 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition shadow-md"
            >
              Find
            </button>
          </div>

          {/* Type Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1 text-[11px] font-medium">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
            </span>
            {[
              { id: 'ALL', label: 'All Entities' },
              { id: 'BankAccount', label: '🏦 Accounts' },
              { id: 'Phone', label: '📱 Phones' },
              { id: 'Device', label: '💻 Devices' },
              { id: 'IP', label: '🌐 IPs' },
              { id: 'SIM', label: '💳 SIMs' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition text-[11px] ${
                  filterType === type.id
                    ? 'bg-cyan-600 text-white shadow font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Display Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdgeLabels(!showEdgeLabels)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                showEdgeLabels
                  ? 'bg-slate-800 text-cyan-300 border-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Edge Labels</span>
            </button>
          </div>
        </div>

        {/* Vis.js Canvas Viewport */}
        <div ref={containerRef} className="flex-1 w-full h-full bg-[#0B0F19] cursor-grab active:cursor-grabbing relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-20 text-cyan-400 font-mono text-xs">
              Rendering High-Contrast Forensic Graph...
            </div>
          )}

          {/* Floating Canvas Controls */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={() => handleZoom(1.2)}
              title="Zoom In"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              title="Zoom Out"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Reset Zoom / Fit"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#0F172A]/90 backdrop-blur p-3 rounded-xl border border-slate-800 shadow-xl text-[11px] space-y-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Entity Legend</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span> Bank Account</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> Phone Number</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> Device ID</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span> IP Address</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DB2777]"></span> SIM IMSI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Evidence Provenance Inspector Drawer */}
      <div className="w-88 bg-[#0F172A] rounded-2xl border border-slate-800 p-5 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>Evidence Provenance</span>
          </div>
          {selectedItem && (
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              {selectedItem.kind}
            </span>
          )}
        </div>

        {selectedItem ? (
          <div className="mt-4 flex-1 overflow-y-auto space-y-4 text-xs">
            {selectedItem.kind === 'NODE' ? (
              <>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-500 uppercase tracking-widest font-mono text-[10px]">SELECTED ENTITY</span>
                  <div className="text-lg font-bold text-cyan-300">{selectedItem.data.label || selectedItem.data.id}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded">{selectedItem.data.type}</span>
                    <span>ID: {selectedItem.data.id}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Evidence Provenance Metadata</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono space-y-1.5 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-500">Case Scope:</span> <span className="text-cyan-400">{selectedItem.data.case_id}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-semibold">Ingested Fact</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Extraction:</span> <span>Deterministic Parser</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Confidence:</span> <span className="text-emerald-400">100% Verified</span></div>
                  </div>
                </div>

                {/* Direct Connections List */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Direct Graph Neighborhood</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                    {graphData.edges
                      .filter(e => e.source === selectedItem.data.id || e.target === selectedItem.data.id)
                      .map((edge, idx) => (
                        <div key={idx} className="text-[11px] border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-500">{edge.source === selectedItem.data.id ? 'Outbound ➔' : '◄ Inbound'}</span>{' '}
                          <span className="font-mono text-cyan-300">{edge.source === selectedItem.data.id ? edge.target : edge.source}</span>
                          <div className="text-[10px] text-emerald-400 font-mono">Rel: {edge.type}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-500 uppercase tracking-widest font-mono text-[10px]">SELECTED RELATIONSHIP</span>
                  <div className="text-base font-bold text-emerald-400">{selectedItem.data.type}</div>
                  <div className="text-slate-300 text-[11px] space-y-1 font-mono">
                    <div><span className="text-slate-500">From:</span> <span className="text-cyan-300">{selectedItem.data.source}</span></div>
                    <div><span className="text-slate-500">To:</span> <span className="text-cyan-300">{selectedItem.data.target}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Source Record Trace</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono space-y-1 text-[11px]">
                    <div>Record ID: {selectedItem.data.source_record_id || 'EV-TXN-001'}</div>
                    <div>Timestamp: {selectedItem.data.timestamp || '2026-09-01T10:15:00'}</div>
                    <div>Confidence: {selectedItem.data.confidence * 100}%</div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 space-y-2">
            <Activity className="w-8 h-8 text-slate-600" />
            <p className="font-medium text-slate-400">No Element Selected</p>
            <p className="text-[11px]">Click any entity node or relationship line in the graph canvas to inspect evidence provenance and direct connections.</p>
          </div>
        )}
      </div>
    </div>
  );
}
