import React, { useState, useMemo, useCallback } from 'react';
import AdminUsers from './AdminUsers';
import AdminStudents from './AdminStudents';
import { Users, GraduationCap, Search, Plus, Archive, FileDown, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/components/AdminHeader';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPeopleManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'students'>('users');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);

  const handleExportCSV = () => {
    toast.info("Preparing CSV Datastream...");
    setTimeout(() => toast.success("System directory exported"), 1000);
    setIsReportDropdownOpen(false);
  };

  const handleExportPDF = () => {
    toast.info("Generating System PDF Report...");
    setTimeout(() => toast.success("System PDF Downloaded"), 1200);
    setIsReportDropdownOpen(false);
  };

  return (
    <div className="space-y-6 w-full">
      <AdminHeader
        icon={Users}
        title="People"
        highlightedTitle="Management"
        subtitle="Unified User & Learner Directory"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all ${
              activeSubTab === 'users' ? 'bg-[#7B1C2A] text-white shadow-lg shadow-rose-900/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Users size={14} className="inline-block mr-2" /> User Hub
          </button>
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all ${
              activeSubTab === 'students' ? 'bg-[#7B1C2A] text-white shadow-lg shadow-rose-900/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <GraduationCap size={14} className="inline-block mr-2" /> Learners
          </button>
        </div>
      </AdminHeader>
      
      {/* Global Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-xl p-3 rounded-[2rem] border border-white/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeSubTab === 'users' ? 'users' : 'students'} by name or email...`}
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] border-none bg-white/60 shadow-inner text-sm font-bold text-slate-800 focus:ring-4 ring-[#7B1C2A]/10 outline-none transition-all placeholder:text-slate-300"
          />
        </div>
        {/* Add button - specific to students for now, can be made dynamic */}
        {activeSubTab === 'students' && (
          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="px-8 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#7B1C2A] shadow-lg active:scale-95"
          >
            + Add Student
          </button>
        )}
        {/* Export button - specific to students for now, can be made dynamic */}
        {activeSubTab === 'students' && (
          <div className="relative">
            <button 
              onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
              className="btn-interactive p-3 rounded-2xl bg-white shadow-sm text-slate-400 hover:text-[#7B1C2A] transition-all border border-white flex items-center gap-1 group"
            >
              <FileDown size={20} />
              <ChevronDown size={14} className={`transition-transform duration-300 ${isReportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isReportDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 w-64 mt-3 bg-white/95 backdrop-blur-xl rounded-[2rem] border border-emerald-100 shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="space-y-1">
                    <button 
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-emerald-50 text-emerald-900 transition-colors text-[10px] font-black uppercase tracking-widest group"
                    >
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
                        <FileText size={14} />
                      </div>
                      Export System PDF
                    </button>
                    
                    <button 
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-emerald-50 text-emerald-900 transition-colors text-[10px] font-black uppercase tracking-widest group"
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <FileSpreadsheet size={14} />
                      </div>
                      Export System CSV
                    </button>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-emerald-50 px-3 pb-1">
                    <p className="text-[8px] font-black text-emerald-600/40 uppercase tracking-[0.2em] text-center">Infrastructure Audit</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {activeSubTab === 'users' && <AdminUsers globalSearchTerm={globalSearchTerm} />}
      {activeSubTab === 'students' && (
        <AdminStudents 
          globalSearchTerm={globalSearchTerm} 
          isAddModalOpen={isAddStudentModalOpen} 
          setIsAddModalOpen={setIsAddStudentModalOpen} 
        />
      )}
    </div>
  );
};

export default AdminPeopleManagement;