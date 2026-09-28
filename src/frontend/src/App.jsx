import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CaseDashboard from './components/CaseDashboard';
import GraphViewer from './components/GraphViewer';
import PatternDashboard from './components/PatternDashboard';
import NetworkAnalyticsView from './components/NetworkAnalyticsView';
import RoleIndicatorsView from './components/RoleIndicatorsView';
import TimelineViewer from './components/TimelineViewer';
import PathTracerView from './components/PathTracerView';
import AIAssistantView from './components/AIAssistantView';
import IngestionModal from './components/IngestionModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases');
        const data = await res.json();
        setCases(data);
        if (data.length > 0) {
          setActiveCase(data[0]);
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
      }
    };
    fetchCases();
  }, []);

  const handleExportBrief = () => {
    if (!activeCase) return;
    window.open(`/api/cases/${activeCase.case_id}/report`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCase={activeCase}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportBrief={handleExportBrief}
      />

      <main className="flex-1">
        {activeCase ? (
          <>
            {activeTab === 'dashboard' && (
              <CaseDashboard
                activeCase={activeCase}
                setActiveCase={setActiveCase}
                cases={cases}
                onSelectTab={setActiveTab}
                onOpenUpload={() => setIsUploadOpen(true)}
                onExportBrief={handleExportBrief}
              />
            )}
            {activeTab === 'graph' && <GraphViewer caseId={activeCase.case_id} />}
            {activeTab === 'patterns' && <PatternDashboard caseId={activeCase.case_id} />}
            {activeTab === 'analytics' && <NetworkAnalyticsView caseId={activeCase.case_id} />}
            {activeTab === 'roles' && <RoleIndicatorsView caseId={activeCase.case_id} />}
            {activeTab === 'timeline' && <TimelineViewer caseId={activeCase.case_id} />}
            {activeTab === 'paths' && <PathTracerView caseId={activeCase.case_id} />}
            {activeTab === 'ai' && <AIAssistantView caseId={activeCase.case_id} />}
          </>
        ) : (
          <div className="p-12 text-center text-slate-400 font-mono text-sm">
            Initializing CFNA Investigation Workspace...
          </div>
        )}
      </main>

      <IngestionModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        caseId={activeCase ? activeCase.case_id : 'CFNA-DEMO-001'}
        onIngestSuccess={() => {
          // refresh active case
          if (activeCase) {
            fetch(`/api/cases/${activeCase.case_id}`)
              .then(r => r.json())
              .then(data => setActiveCase(data));
          }
        }}
      />
    </div>
  );
}
