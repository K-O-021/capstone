import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RotateCcw, Archive, FileText } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

interface ArchiveBaseProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeName: string;
  actionType: 'archive' | 'restore';
  nodeType?: string;
}

export const ArchiveBase: React.FC<ArchiveBaseProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nodeName,
  actionType,
  nodeType = "Identity Node"
}) => {
  const isRestore = actionType === 'restore';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl border ${
              isRestore ? 'border-emerald-100' : 'border-rose-100'
            } z-10 overflow-hidden`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 ${
                isRestore ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {isRestore ? <RotateCcw size={20} /> : <ShieldAlert size={20} className="animate-pulse" />}
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                {isRestore ? 'Restore' : 'Archive'} <span className={isRestore ? 'text-emerald-600' : 'text-rose-600'}>{nodeType}</span>
              </h3>
            </div>

            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
              {isRestore ? (
                <>Are you sure you want to re-initialize <span className="font-black text-slate-800 italic">{nodeName}</span>? This will hot-plug their clearance levels back into the live active network directories.</>
              ) : (
                <>Are you sure you want to decouple <span className="font-black text-slate-800 italic">{nodeName}</span>? This immediately cuts live access pipelines and offloads their metrics into isolated cold storage.</>
              )}
            </p>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500 active:scale-95"
              >
                Abort Protocol
              </button>
              <button 
                type="button" 
                onClick={onConfirm} 
                className={`flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                  isRestore ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isRestore ? 'Re-Plug Live Link' : 'Confirm Cold Storage'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'active' | 'archived';
  author: string;
}

const MOCK_REPORTS: Report[] = [
  { id: 'RPT-001', title: 'Q1 Behavioral Synthesis', type: 'Clinical', date: '2026-03-15', status: 'active', author: 'Dr. Aris' },
  { id: 'RPT-002', title: 'Neural Baseline - Grade 1', type: 'Assessment', date: '2026-02-10', status: 'active', author: 'Admin Root' },
  { id: 'ARC-999', title: 'Historical Audit 2025', type: 'Archive', date: '2025-12-20', status: 'archived', author: 'System' },
];

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [lifecycleTarget, setLifecycleTarget] = useState<Report | null>(null);

  const filteredReports = useMemo(() => 
    reports.filter(r => r.status === statusFilter),
    [reports, statusFilter]
  );

  const handleConfirmAction = () => {
    if (!lifecycleTarget) return;
    
    setReports(prev => prev.map(r => 
      r.id === lifecycleTarget.id 
        ? { ...r, status: r.status === 'active' ? 'archived' : 'active' }
        : r
    ));
    
    setLifecycleTarget(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Futuristic Glass Header */}
      <AdminHeader
        icon={FileText}
        title="System"
        highlightedTitle="Archives"
        subtitle="Archived Institutional Records"
      />

      {/* Filter Tabs */}
      <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 w-fit">
        <button 
          onClick={() => setStatusFilter('active')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'active' ? 'bg-[#2D6A4F] text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
        >
          Active Records
        </button>
        <button 
          onClick={() => setStatusFilter('archived')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'archived' ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
        >
          Archived Vault
        </button>
      </div>

      {/* Document List Container */}
      <div className="grid gap-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div 
              key={report.id}
              className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 flex items-center justify-between group hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${statusFilter === 'archived' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">{report.title}</span>
                    <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">{report.id}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {report.type} • Author: {report.author} • {report.date}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setLifecycleTarget(report)}
                className={`p-3 rounded-xl transition-all ${
                  statusFilter === 'active' 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {statusFilter === 'active' ? <Archive size={18} /> : <RotateCcw size={18} />}
              </button>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-emerald-100">
            <Archive size={48} className="mx-auto text-emerald-200 mb-4" />
            <p className="text-sm font-black text-emerald-800/40 uppercase tracking-widest italic">
              No {statusFilter} document clusters identified in the current terminal session.
            </p>
          </div>
        )}
      </div>

      {/* Archive Pipeline Orchestration */}
      <ArchiveBase 
        isOpen={Boolean(lifecycleTarget)}
        onClose={() => setLifecycleTarget(null)}
        onConfirm={handleConfirmAction}
        nodeName={lifecycleTarget?.title || ''}
        actionType={statusFilter === 'active' ? 'archive' : 'restore'}
        nodeType="Document Cluster"
      />
    </div>
  );
};

export default AdminReports;