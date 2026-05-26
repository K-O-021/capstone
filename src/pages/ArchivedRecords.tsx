import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Archive, RotateCcw, Search, Snowflake, Database, ShieldAlert, Cpu, Activity, Clock, Wifi, WifiOff, Zap } from 'lucide-react';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import AdminHeader from '@/components/AdminHeader';

const ArchivedRecords = () => {
  const { students, updateStudent, isConnected, latency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const archivedStudents = students.filter(s => 
    s.status === 'archived' && 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (id: string, name: string) => {
    if (updateStudent) {
      updateStudent(id, { status: 'active' });
      toast.success("Packet Transmitted", {
        description: `Signal sent to re-initialize ${name}. Awaiting stream confirmation...`
      });
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-500"
      style={{ fontFamily: "'Georgia','Times New Roman',serif", background: '#FBF7F2', minHeight: '100vh' }}
    >
      
      {/* 🧊 COLD STORAGE HEADER - Neural Design Matching Admin Logs */}
      <AdminHeader
        icon={Archive}
        title="Cold"
        highlightedTitle="Storage"
        subtitle={
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mt-1">
            <Database size={12} className="text-slate-400" />
            <span>Isolated Learner Vaults Registry</span> {/* Original subtitle text */}
            <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1 rounded ml-1">
              Nodes: {archivedStudents.length}
            </span>
            <div className={`flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded font-mono text-[8px] border ${isConnected ? 'bg-[#F7ECEE] border-[#e8d8da] text-[#7B1C2A]' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {isConnected ? <Wifi size={8} className="animate-pulse" /> : <WifiOff size={8} />}
              {isConnected ? `STREAM ACTIVE [${latency || 0}ms]` : 'DISCONNECTED'}
            </div>
          </div>
        }
        showSystemLink
      >
        <div className="px-6 py-3 bg-[#7B1C2A]/10 backdrop-blur-md border border-[#7B1C2A]/20 rounded-2xl hidden lg:block">
          <p className="text-[9px] font-black text-[#7B1C2A] uppercase tracking-widest leading-none">Vault Status</p>
          <p className="text-xl font-black text-[#7B1C2A] italic tracking-tighter mt-1 uppercase">Encrypted</p>
        </div>
      </AdminHeader>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-xl p-3 rounded-[2rem] border border-white/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search isolated clusters..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] border-none bg-white/60 shadow-inner text-sm font-bold text-slate-800 focus:ring-4 ring-[#7B1C2A]/10 outline-none transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* 📑 ARCHIVE BOARD - Neural Stream Feed Style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B1C2A] animate-pulse" />
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase italic">Archived Nodes Inventory</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
              <Activity size={10} className="text-blue-500" />
              <span>Live Feed: {isConnected ? 'Synchronized' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
              <Zap size={10} className="text-amber-500" />
              <span>Relay: WS://PROD_VAULT_01</span>
            </div>
            <div className="px-2 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] tracking-tight uppercase rounded border border-slate-200">
              Secured
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
        {archivedStudents.length > 0 ? (
          archivedStudents.map(s => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={s.id} 
              className="p-6 hover:bg-slate-50/60 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 font-black italic text-xs">
                  {s.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-slate-400 line-through uppercase italic tracking-tight">{s.name}</p>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-slate-200">De-linked</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {s.grade} • Assigned Teacher: {s.teacher}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:block text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Signal</p>
                  <p className="text-[10px] font-bold text-slate-500 italic mt-1">{s.lastActivity || 'Session Ended'}</p>
                </div>
                <button 
                  onClick={() => handleRestore(s.id, s.name)} 
                  className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500" /> 
                  Re-Initialize
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
              <Database size={16} />
            </div>
            <h4 className="text-sm font-black text-slate-700 uppercase italic">Vault Empty</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto font-bold uppercase tracking-tight">
              No isolated learner nodes matching query parameters.
            </p>
          </div>
        )}
        </div>

        {/* Minimal Footer Stamp */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 uppercase font-black tracking-widest text-[9px]">
              <ShieldAlert size={12} className="text-emerald-500" /> 
              AES-256 Cold Storage Protocol
            </span>
          </div>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">STORAGE: SECURED</span>
        </div>
      </div>
    </div>
  );
};

export default ArchivedRecords;