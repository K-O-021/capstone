import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import RiskBadge from '@/components/RiskBadge';
import BehaviorBadge from '@/components/BehaviorBadge';
import { Archive, Search, Filter, X, Check, ChevronRight, ChevronLeft, Plus, Brain, Sparkles, AlertCircle, Loader2, FileText, ClipboardCheck, GraduationCap, TrendingUp, Quote, FileDown } from 'lucide-react';
import { toast } from "sonner";
import { exportToPDF } from '@/lib/pdfExport';
import { generateStudentAiAnalysis, AiAnalysisResult } from '@/lib/behaviorUtils';

const SNED_CATEGORIES = [
  "Autism Spectrum Disorder (ASD)",
  "ADHD",
  "Intellectual Disability (ID)",
  "Down Syndrome",
  "Cerebral Palsy (CP)",
  "Learning Disability (LD)",
  "Hearing Impairment",
  "Visual Impairment",
  "Speech/Language Disorder",
  "Multiple Disabilities"
];

const SUPPORT_LEVELS = ["Full Assistance", "Moderate Support", "Minimal Supervision"];

interface AdminStudentsProps {
  globalSearchTerm?: string;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

const AdminStudents: React.FC<AdminStudentsProps> = ({ 
  globalSearchTerm = '', 
  isAddModalOpen: externalIsAddModalOpen, 
  setIsAddModalOpen: externalSetIsAddModalOpen 
}) => {
  const { students, archiveStudent, updateStudent, behaviorLogs, addBehaviorLog, addStudent, users, addUser, progressNotes } = useApp();
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingStudent, setViewingStudent] = useState<{ id: string, name: string, initials: string, grade: string, riskLevel: string, lastActivity: string, parentName: string, diagnosis?: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<{ id: string, name: string, grade: string } | null>(null);
  const [archivingIds, setArchivingIds] = useState<string[]>([]);
  const [localIsAddModalOpen, setLocalIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [newStudentForm, setNewStudentForm] = useState({
    lrn: '',
    name: '',
    dob: '',
    gender: 'Male',
    grade: 'Grade 1',
    diagnosis: SNED_CATEGORIES[0],
    supportLevel: SUPPORT_LEVELS[2],
    baseline: '',
    parentName: '',
    parentEmail: '',
  });
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogForm, setQuickLogForm] = useState({
    type: 'Positive' as 'Positive' | 'Attention Needed' | 'Concerning',
    description: '',
    location: 'Classroom'
  });
  const [editForm, setEditForm] = useState({ name: '', grade: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<null | AiAnalysisResult>(null);
  const navigate = useNavigate();
  const [selectedTone, setSelectedTone] = useState<'Gentle' | 'Enthusiastic' | 'Clinical' | 'Professional'>('Gentle');
  const [reportViewMode, setReportViewMode] = useState<'quick' | 'detailed'>('detailed'); // New state for view mode

  // Handle modal state from parent or local state
  const isAddModalOpen = externalIsAddModalOpen !== undefined ? externalIsAddModalOpen : localIsAddModalOpen;
  const setIsAddModalOpen = externalSetIsAddModalOpen !== undefined ? externalSetIsAddModalOpen : setLocalIsAddModalOpen;

  const itemsPerPage = 5;

  // Automatic Parent Name Lookup base sa Email
  useEffect(() => {
    const email = newStudentForm.parentEmail.trim().toLowerCase();
    if (email && addStep === 4) { // Changed to step 4 for guardian info
      const parent = users.find(u => u.email.toLowerCase() === email && u.role === 'parent');
      if (parent && newStudentForm.parentName !== parent.name) {
        setNewStudentForm(prev => ({ ...prev, parentName: parent.name }));
        toast.success(`Parent account detected: ${parent.name}`);
      }
    }
  }, [newStudentForm.parentEmail, users, addStep]);

  const activeStudents = students.filter(s =>
    s.status === 'active' && // Always filter for active students
    s.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) &&
    (filterGrade === 'all' || s.grade.includes(filterGrade)) &&
    (filterRisk === 'all' || s.riskLevel === filterRisk)
  );

  const totalPages = Math.ceil(activeStudents.length / itemsPerPage);
  const paginatedStudents = activeStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    if (activeStudents.length === 0) {
      toast.error("No students to export");
      return;
    }

    const headers = ["Student Name", "Grade", "Risk Level", "Positive Logs", "Attention Needed", "Last Observation", "Guardian"];

    const summaryStats = [
      { label: "Total Students", value: activeStudents.length },
      { label: "High Risk", value: activeStudents.filter(s => s.riskLevel === 'High').length },
      { label: "Mod. Risk", value: activeStudents.filter(s => s.riskLevel === 'Moderate').length },
      { label: "Low Risk", value: activeStudents.filter(s => s.riskLevel === 'Low').length },
      { label: "Avg. Behavior Score", value: "8.2/10" }
    ];

    const data = activeStudents.map(s => {
      const studentLogs = behaviorLogs.filter(l => l.studentId === s.id);
      const positiveCount = studentLogs.filter(l => l.type === 'Positive').length;
      const attentionCount = studentLogs.filter(l => l.type === 'Attention Needed' || l.type === 'Concerning').length;

      return [
        s.name,
        s.grade,
        s.riskLevel,
        positiveCount.toString(),
        attentionCount.toString(),
        s.lastActivity || 'No logs recorded',
        s.parentName || 'N/A'
      ];
    });

    exportToPDF({
      title: "Student Behavioral Roster Report",
      subtitle: `Filters: ${globalSearchTerm ? `Search: "${globalSearchTerm}"` : 'All'} | ${filterGrade !== 'all' ? `Grade: ${filterGrade}` : 'All Grades'}`,
      filename: `SNED_Student_Records_${new Date().toISOString().split('T')[0]}.pdf`,
      headers,
      data,
      summaryStats
    });

    toast.success("Professional PDF report generated!");
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map(s => s.id));
    }
  };

  const validateAddStep = () => {
    if (addStep === 1) {
      if (!newStudentForm.lrn.trim() || !newStudentForm.name.trim() || !newStudentForm.dob) {
        toast.error("Please provide LRN, Full Name, and Date of Birth");
        return false;
      }
    } else if (addStep === 2) {
      if (!newStudentForm.grade || !newStudentForm.diagnosis || !newStudentForm.supportLevel) {
        toast.error("Please select Grade, Diagnosis, and Support Level");
        return false;
      }
    } else if (addStep === 3) {
      if (!newStudentForm.baseline.trim()) {
        toast.error("Please provide a behavioral baseline for AI anomaly detection");
        return false;
      }
    } else if (addStep === 4) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!newStudentForm.parentName.trim() || !emailRegex.test(newStudentForm.parentEmail)) {
        toast.error("Please provide valid parent information");
        return false;
      }

      // Check if parent email exists in users list with 'parent' role
      const parentUser = users.find(u =>
        u.email.toLowerCase() === newStudentForm.parentEmail.toLowerCase() &&
        u.role === 'parent'
      );

      if (!parentUser) {
        toast.error("Parent account not found", {
          description: "Make sure the parent account is already registered in User Management before linking it."
        });
        return false;
      }
    }
    return true;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      lrn: newStudentForm.lrn,
      name: newStudentForm.name,
      grade: newStudentForm.grade,
      diagnosis: newStudentForm.diagnosis,
      supportLevel: newStudentForm.supportLevel,
      baseline: newStudentForm.baseline,
      dob: newStudentForm.dob,
      gender: newStudentForm.gender,
      parentName: newStudentForm.parentName,
      parentEmail: newStudentForm.parentEmail,
    });
    toast.success(`${newStudentForm.name} added to database`);
    setIsAddModalOpen(false);
    setAddStep(1);
    setNewStudentForm({ lrn: '', name: '', dob: '', gender: 'Male', grade: 'Grade 1', diagnosis: SNED_CATEGORIES[0], supportLevel: SUPPORT_LEVELS[2], baseline: '', parentName: '', parentEmail: '' });
  };

  const handleQuickCreateParent = () => {
    if (!newStudentForm.parentName || !newStudentForm.parentEmail) return;
    addUser({ name: newStudentForm.parentName, email: newStudentForm.parentEmail, role: 'parent' });
    toast.success(`Account created for ${newStudentForm.parentName}`);
  };

  const handleEditClick = (student: { id: string, name: string, grade: string }) => {
    setEditingStudent(student);
    setEditForm({ name: student.name, grade: student.grade });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateStudent && editingStudent) {
      updateStudent(editingStudent.id, {
        name: editForm.name,
        grade: editForm.grade
      });
      toast.success("Student details updated");
    }
    setEditingStudent(null);
  };

  const handleConfirmArchive = () => {
    if (archivingIds.length > 0) {
      archivingIds.forEach(id => archiveStudent(id));
      toast.success(`${archivingIds.length} student record(s) archived`);
      setArchivingIds([]);
      setSelectedIds([]);
    }
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBehaviorLog || !viewingStudent) return;

    addBehaviorLog({
      studentId: viewingStudent.id,
      studentName: viewingStudent.name,
      type: quickLogForm.type,
      description: quickLogForm.description,
      location: quickLogForm.location,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      riskLevel: quickLogForm.type === 'Positive' ? 'Low' : quickLogForm.type === 'Attention Needed' ? 'Moderate' : 'High',
    });

    toast.success(`Log added for ${viewingStudent.name}`);
    setShowQuickLog(false);
    setQuickLogForm({ type: 'Positive', description: '', location: 'Classroom' });
  };

  const handleCopyNarrative = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Narrative copied to clipboard");
  };

  const handleAiAnalysis = useCallback(() => {
    if (!viewingStudent) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = generateStudentAiAnalysis(viewingStudent, behaviorLogs, progressNotes);

      if (!result) {
        toast.error("Unable to generate analysis at this time.");
        setIsAnalyzing(false);
        return;
      }

      setAiAnalysis(result);
      setIsAnalyzing(false);
      toast.success("AI Analysis Complete: Co-Teacher insights generated.");
    }, 2000);
  }, [viewingStudent, behaviorLogs, progressNotes]); // Dependencies for automatic re-analysis

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="fixed inset-0 -z-10 bg-[#F1F8F6]" style={{
        backgroundImage: 'radial-gradient(at 0% 0%, #E0F2F1 0, transparent 50%), radial-gradient(at 50% 0%, #FCE4EC 0, transparent 50%), radial-gradient(at 100% 0%, #F3E5F5 0, transparent 50%)'
      }} /> {/* Removed the header and search bar from here */}

      <div className="space-y-4"> {/* This div was already here, now it contains only filters and student list */}
        <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={handleSelectAll}
          className={`flex-1 px-6 py-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
            selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0
              ? 'bg-black border-black text-white shadow-lg shadow-black/20'
              : 'bg-white/50 border-slate-200 text-slate-600 hover:border-black/20 hover:text-black'
          }`}
        >
          {selectedIds.length === paginatedStudents.length ? 'Deselect All' : 'Select Page'}
        </button>
        <select
          value={filterGrade}
          onChange={(e) => {
            setFilterGrade(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-6 py-4 rounded-2xl border-none bg-white/60 backdrop-blur-md shadow-inner text-sm font-bold text-slate-800 focus:ring-4 ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 appearance-none cursor-pointer"
        >
          <option value="all">All Grades</option>
          <option value="Grade 1">Grade 1</option>
          <option value="Grade 2">Grade 2</option>
          <option value="Grade 3">Grade 3</option>
        </select>
        <select
          value={filterRisk}
          onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
          className="flex-1 px-6 py-4 rounded-2xl border-none bg-white/60 backdrop-blur-md shadow-inner text-sm font-bold text-slate-800 focus:ring-4 ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 appearance-none cursor-pointer"
        >
          <option value="all">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Moderate">Moderate Risk</option>
          <option value="High">High Risk</option>
        </select>
        </div>
      </div>

      <div className="space-y-3">
        {paginatedStudents.map(s => (
          <div key={s.id} className={`bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group ${selectedIds.includes(s.id) ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => handleSelectOne(s.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:rotate-6 ${s.riskLevel === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100' : s.riskLevel === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100'} shadow-lg`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base uppercase tracking-tighter italic leading-none mb-1.5">{s.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.riskLevel === 'High' ? 'bg-rose-100/50 text-rose-600' : s.riskLevel === 'Moderate' ? 'bg-amber-100/50 text-amber-600' : 'bg-emerald-100/50 text-emerald-600'}`}>{s.grade}</span>
                    <span className="text-[10px] font-bold text-slate-400">Teacher: {s.teacher}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-4">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Behavior Trend</span>
                  <svg className="w-24 h-6 overflow-visible" viewBox="0 0 100 20">
                    <path
                      d="M 0 15 L 20 5 L 40 18 L 60 10 L 80 2 L 100 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={
                        s.riskLevel === 'High' ? 'text-destructive' :
                        s.riskLevel === 'Moderate' ? 'text-warning' :
                        'text-primary'
                      }
                    />
                    <circle cx="100" cy="12" r="3" className="fill-background stroke-current" strokeWidth="2" />
                  </svg>
                </div>
                <RiskBadge level={s.riskLevel} />
                <button onClick={() => setArchivingIds([s.id])} className="p-1.5 rounded-lg border-2 border-border text-muted-foreground hover:text-warning hover:border-warning/40 transition-colors" title="Archive">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setViewingStudent(s)} className="px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#3EB489] hover:shadow-xl hover:shadow-teal-900/20 active:scale-95 shadow-lg shadow-slate-200">View Profile</button>
              <button
                onClick={() => handleEditClick(s)}
                className="px-3 py-1.5 rounded-lg border-2 border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Student Insights Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="card-elevated w-full max-w-3xl p-6 relative shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setViewingStudent(null)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/20">
                {viewingStudent.initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{viewingStudent.name}</h3>
                <p className="text-muted-foreground">{viewingStudent.grade} • Behavioral Insights</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Current Status</p>
                  <RiskBadge level={viewingStudent.riskLevel} />
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Last Observed Activity</p>
                  <p className="text-sm font-medium">{viewingStudent.lastActivity}</p>
                </div>
              </div>
              <div className="card-elevated p-4 bg-primary/5 border-primary/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase text-primary">AI Co-Teacher</p>
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  {isAnalyzing ? (
                    <div className="space-y-3 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">Analyzing {viewingStudent.name}'s history to synthesize triggers, academic growth, and peer-benchmarked engagement.</p>
                    </div>
                  ) : (
                    aiAnalysis ? (
                      <div className="flex flex-col h-full justify-center text-center p-2">
                        <Check className="w-8 h-8 text-success mx-auto mb-2" />
                        <p className="text-xs font-bold text-foreground">Analysis Complete</p>
                        <p className="text-[10px] text-muted-foreground">Detailed insights available below.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-center text-center p-2">
                        <button onClick={handleAiAnalysis} className="py-2 px-4 bg-primary text-white rounded-lg text-xs font-bold">Run AI Analysis</button>
                        <p className="text-[10px] text-muted-foreground mt-2">Generate insights for this student.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

        {aiAnalysis && behaviorLogs.filter(l => l.studentId === viewingStudent.id).length < 3 && (
          <div className="mt-4 p-3 bg-warning/5 border-2 border-warning/20 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-warning shrink-0" />
            <p className="text-[11px] text-foreground font-medium italic leading-relaxed">
              <span className="text-warning font-bold">Preliminary Analysis:</span> Only {behaviorLogs.filter(l => l.studentId === viewingStudent.id).length} log(s) recorded. AI insights gain accuracy as more behavioral observations are logged.
            </p>
          </div>
        )}

            {aiAnalysis && (
              <div className="mt-6 space-y-4 animate-in fade-in zoom-in-95 duration-300"> {/* Main AI Analysis Container */}
                {/* View Mode Toggle */}
                <div className="flex justify-center gap-2 mb-4 no-print">
                  <button
                    onClick={() => setReportViewMode('quick')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${reportViewMode === 'quick' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                  >
                    Quick View
                  </button>
                  <button
                    onClick={() => setReportViewMode('detailed')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${reportViewMode === 'detailed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                  >
                    Detailed Professional Report
                  </button>
                </div>
                {/* Narrative Tile */}
                <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Professional Development Narrative
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyNarrative(aiAnalysis.monthlyNarrative)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                        title="Copy Narrative"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-foreground font-bold mb-3">Incident Analysis: <span className="text-success font-black">{aiAnalysis.positiveFrequency}</span></p>
                  <p className="text-xs text-foreground leading-relaxed bg-white/50 p-4 rounded-xl border border-primary/5 shadow-sm">
                    {aiAnalysis.monthlyNarrative}
                  </p>
                </div>

                {/* Parent-Facing Narrative Drafter (Supportive Translator) */}
                <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Supportive Narrative Drafter</h4>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                      Select a tone to translate technical triggers into personalized updates.
                    </p>
                    <div className="flex gap-1 p-1 bg-background/50 rounded-lg border border-primary/10 self-start sm:self-auto">
                      {(['Gentle', 'Enthusiastic', 'Clinical', 'Professional'] as const).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setSelectedTone(tone)}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
                            selectedTone === tone
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {aiAnalysis.triggers.map((trigger, idx) => {
                      const childFirstName = viewingStudent.name.split(' ')[0];
                      const t = trigger.toLowerCase();

                      const toneTemplates: any = {
                        Gentle: {
                          transitions: `${childFirstName} is showing wonderful resilience during daily transitions. They are learning to navigate change with growing confidence and calm.`,
                          sensory: `${childFirstName} is developing great self-awareness in busy environments, showing maturity in finding focus and comfort when things get lively.`,
                          social: `${childFirstName} is exploring new ways to connect with friends, showing heart-warming kindness and a positive spirit during group activities.`,
                          default: `${childFirstName} is working bravely on managing ${t} by building strong self-regulation habits.`
                        },
                        Enthusiastic: {
                          transitions: `Great news! ${childFirstName} is absolutely crushing transitions! They're moving between activities with so much energy and confidence!`,
                          sensory: `${childFirstName} is doing an incredible job staying focused! Even when things get busy, they're finding their "zone" and doing amazing work!`,
                          social: `I'm so excited! ${childFirstName} had a fantastic week connecting with peers. Their spirit is truly lighting up our group activities!`,
                          default: `Way to go! ${childFirstName} is showing so much effort in managing ${t}. We are celebrating every victory in their journey!`
                        },
                        Clinical: {
                          transitions: `${childFirstName} is demonstrating improved self-regulation during transitions. Data indicates a decrease in latency and higher levels of task compliance.`,
                          sensory: `${childFirstName} is successfully utilizing sensory processing strategies. There is a measurable improvement in focus during high-stimulus intervals.`,
                          social: `${childFirstName} is consistently applying social skills protocols. Peer interaction frequency is increasing, characterized by collaborative behavior.`,
                          default: `${childFirstName} is progressing in the management of ${t}. Self-regulation techniques are being integrated into daily routines.`
                        },
                        Professional: {
                          transitions: `${childFirstName} continues to make steady progress with transitions. We are observing increased adaptability and a positive approach to routine changes.`,
                          sensory: `${childFirstName} is managing environmental sensory factors effectively. They are showing maturity in maintaining focus during classroom activities.`,
                          social: `${childFirstName} is actively engaged in developing social competencies. They are collaborating effectively with peers and showing consistent leadership.`,
                          default: `${childFirstName} is demonstrating a commitment to growth regarding ${t}. We are focusing on strategies to support their development.`
                        }
                      };

                      const templates = toneTemplates[selectedTone];
                      let supportiveDraft = '';

                      if (t.includes('transition')) supportiveDraft = templates.transitions;
                      else if (t.includes('sensory') || t.includes('noise')) supportiveDraft = templates.sensory;
                      else if (t.includes('peer') || t.includes('social')) supportiveDraft = templates.social;
                      else supportiveDraft = templates.default;

                      return (
                        <div key={idx} className="bg-white/50 p-4 rounded-xl border border-primary/10 hover:border-primary/30 transition-all shadow-sm group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-bold text-warning uppercase bg-warning/5 px-2 py-0.5 rounded border border-warning/10 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" /> Trigger: {trigger}
                            </span>
                          </div>
                          <p className="text-xs text-foreground italic leading-relaxed border-l-2 border-primary/20 pl-3">"{supportiveDraft}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {reportViewMode === 'detailed' ? (
                  <>
                    {/* Grid for Quick Stats */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-accent/5 rounded-2xl border-2 border-accent/10">
                        <h4 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4" /> Academic Achievements
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.academicHighlights.map((h, idx) => (
                            <li key={idx} className="text-[11px] text-muted-foreground flex gap-2">
                              <span className="text-accent">•</span> {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-warning/5 rounded-2xl border-2 border-warning/10">
                        <h4 className="text-[10px] font-black text-warning uppercase tracking-widest flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4" /> Areas for Growth
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.areasForGrowth.map((g, idx) => (
                            <li key={idx} className="text-[11px] text-muted-foreground flex gap-2">
                              <span className="text-warning">•</span> {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Triggers & Interventions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-card border-2 border-border rounded-2xl">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4" /> Environmental Triggers
                        </h4>
                        <ul className="space-y-1.5">
                          {aiAnalysis.triggers.map((t, idx) => (
                            <li key={idx} className="text-[10px] text-muted-foreground flex gap-2 font-medium">
                              <span className="text-warning">•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-card border-2 border-border rounded-2xl">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                          <Brain className="w-4 h-4" /> Strategy Checklist
                        </h4>
                        <ul className="space-y-1.5">
                          {aiAnalysis.interventions.map((i, idx) => (
                            <li key={idx} className="text-[10px] text-muted-foreground flex gap-2 font-medium">
                              <span className="text-primary">•</span> {i}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/20 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-muted-foreground italic">{aiAnalysis.peerComparison}</p>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-muted/20 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-muted-foreground italic">{aiAnalysis.peerComparison}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 border-t border-border pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold uppercase text-muted-foreground">Behavior Log History</h4>
                <button
                  onClick={() => setShowQuickLog(!showQuickLog)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  {showQuickLog ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showQuickLog ? 'Cancel' : 'Add Log'}
                </button>
              </div>

              {showQuickLog && (
                <form onSubmit={handleQuickLogSubmit} className="mb-6 p-4 bg-muted/30 rounded-xl border-2 border-dashed border-primary/30 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select
                      value={quickLogForm.type}
                      onChange={e => setQuickLogForm(f => ({ ...f, type: e.target.value as 'Positive' | 'Attention Needed' | 'Concerning' }))}
                      className="px-3 py-2 rounded-lg border-2 border-border bg-background text-xs outline-none focus:border-primary"
                    >
                      <option value="Positive">Positive</option>
                      <option value="Attention Needed">Attention Needed</option>
                      <option value="Concerning">Concerning</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Location"
                      value={quickLogForm.location}
                      onChange={e => setQuickLogForm(f => ({ ...f, location: e.target.value }))}
                      className="px-3 py-2 rounded-lg border-2 border-border bg-background text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <textarea
                    placeholder="Describe the behavior..."
                    value={quickLogForm.description}
                    onChange={e => setQuickLogForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary mb-3 min-h-[60px]"
                    required
                  />
                  <button type="submit" className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                    Save Behavioral Log
                  </button>
                </form>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {behaviorLogs?.filter(log => log.studentId === viewingStudent.id).length > 0 ? (
                  behaviorLogs
                    .filter(log => log.studentId === viewingStudent.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(log => (
                      <div key={log.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-1">
                          <BehaviorBadge type={log.type} confidence={log.confidence} />
                          <span className="text-[10px] text-muted-foreground font-medium">{log.date} • {log.time}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{log.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Location: {log.location}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-center py-4 text-sm text-muted-foreground italic">No behavior logs recorded for this student.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h3 className="text-xl font-bold mb-4">Edit Student</h3>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Grade Level</label>
                <select
                  value={editForm.grade}
                  onChange={e => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary transition-colors"
                >
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 py-2 rounded-lg border-2 border-border font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-step Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated w-full max-w-lg p-0 overflow-hidden relative shadow-2xl border border-emerald-100">
            <div className="bg-emerald-600 p-6 text-white">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute right-4 top-4 p-1 rounded-full hover:bg-emerald-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold">New Student Enrollment</h3>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${addStep >= i ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {addStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase">Step 1: Personal Details</h4>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Student ID / LRN</label>
                    <input type="text" value={newStudentForm.lrn} onChange={e => setNewStudentForm(f => ({ ...f, lrn: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary" placeholder="Enter LRN" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                    <input type="text" value={newStudentForm.name} onChange={e => setNewStudentForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary" placeholder="Enter full name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Date of Birth</label>
                      <input type="date" value={newStudentForm.dob} onChange={e => setNewStudentForm(f => ({ ...f, dob: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Gender</label>
                      <select value={newStudentForm.gender} onChange={e => setNewStudentForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {addStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase">Step 2: Educational Needs</h4>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Grade Level</label>
                    <select value={newStudentForm.grade} onChange={e => setNewStudentForm(f => ({ ...f, grade: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary">
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Primary Diagnosis (SNED Type)</label>
                    <select value={newStudentForm.diagnosis} onChange={e => setNewStudentForm(f => ({ ...f, diagnosis: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary">
                      {SNED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Level of Support Needed</label>
                    <select value={newStudentForm.supportLevel} onChange={e => setNewStudentForm(f => ({ ...f, supportLevel: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary">
                      {SUPPORT_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {addStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase">Step 3: Behavioral Profile</h4>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Behavioral Baseline</label>
                    <textarea value={newStudentForm.baseline} onChange={e => setNewStudentForm(f => ({ ...f, baseline: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary min-h-[120px]" placeholder="Describe the student's normal behavior patterns for AI anomaly detection..." />
                    <p className="text-[10px] text-muted-foreground italic mt-2">Example: Generally quiet, follows visual cues well, sensitive to sudden loud noises.</p>
                  </div>
                </div>
              )}

              {addStep === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase">Step 4: Guardian Info</h4>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Parent/Guardian Name</label>
                    <input type="text" value={newStudentForm.parentName} onChange={e => setNewStudentForm(f => ({ ...f, parentName: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary" placeholder="Enter parent name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Parent Email</label>
                    <input type="email" value={newStudentForm.parentEmail} onChange={e => setNewStudentForm(f => ({ ...f, parentEmail: e.target.value }))} className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background outline-none focus:border-primary" placeholder="parent@example.com" />
                    {newStudentForm.parentEmail && !users.find(u => u.email.toLowerCase() === newStudentForm.parentEmail.toLowerCase() && u.role === 'parent') && (
                      <div className="mt-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 animate-in fade-in">
                        <p className="text-[10px] text-emerald-700 font-bold mb-2 uppercase">Parent Account Not Found</p>
                        <button
                          type="button"
                          onClick={handleQuickCreateParent}
                          className="w-full py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 transition-colors"
                        >
                          Create Parent Account Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {addStep === 5 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase">Step 5: Review Details</h4>
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <p className="text-sm"><strong>LRN:</strong> {newStudentForm.lrn}</p>
                    <p className="text-sm"><strong>Student:</strong> {newStudentForm.name} ({newStudentForm.gender})</p>
                    <p className="text-sm"><strong>Academic:</strong> {newStudentForm.grade} • {newStudentForm.diagnosis}</p>
                    <p className="text-sm"><strong>Support:</strong> {newStudentForm.supportLevel}</p>
                    <p className="text-sm"><strong>Guardian:</strong> {newStudentForm.parentName}</p>
                    <p className="text-sm"><strong>Contact:</strong> {newStudentForm.parentEmail}</p>
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Baseline</p>
                      <p className="text-xs italic truncate">{newStudentForm.baseline}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Confirming will create the student profile and notify the linked guardian email.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                {addStep > 1 && (
                  <button type="button" onClick={() => setAddStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border font-bold text-sm hover:bg-muted transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <div className="flex-1" />
                {addStep < 5 ? (
                  <button type="button" onClick={() => validateAddStep() && setAddStep(s => s + 1)} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm transition-all hover:bg-emerald-700">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm transition-all hover:bg-emerald-700">
                    Complete Enrollment <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archivingIds.length > 0 && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated w-full max-w-sm p-6 relative shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Archive {archivingIds.length > 1 ? `${archivingIds.length} Students?` : 'Student?'}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will move the selected student(s) to archived records. You can still view them in the Archived section.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setArchivingIds([])}
                className="flex-1 py-2 rounded-lg border-2 border-border font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                className="flex-1 py-2 rounded-lg bg-warning text-warning-foreground font-extrabold text-sm"
              >
                Archive Now
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 rounded-lg border-2 border-border disabled:opacity-50"
          >Prev</button>
          <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 rounded-lg border-2 border-border disabled:opacity-50"
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;