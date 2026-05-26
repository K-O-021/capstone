import React, { useState, useMemo } from 'react';
import AdminUsers from './AdminUsers';

import {
  Users,
  Search,
  FileDown,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Archive,
  KeyRound,
  Layers3,
  X,
  Save,
  RefreshCcw,
  Plus,
} from 'lucide-react';

import { toast } from 'sonner';
import AdminHeader from '@/components/AdminHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';

const AdminPeopleManagement = () => {
  const { 
    users = [], 
    students = [], 
    addUser, 
    updateUser, 
    archiveUser, 
    addStudent, 
    updateStudent, 
    archiveStudent,
    isConnected,
    latency 
  } = useApp();

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isReportDropdownOpen, setIsReportDropdownOpen] =
    useState(false);

  // =========================
  // SLIDER
  // =========================
  const [activeSlide, setActiveSlide] = useState(0);

  // =========================
  // MODAL
  // =========================
  const [activeModal, setActiveModal] = useState<
    | 'view'
    | 'edit'
    | 'archive'
    | 'reset'
    | 'addTeacher'
    | 'addParent'
    | null
  >(null);

  const [selectedPerson, setSelectedPerson] =
    useState<any>(null);

  // =========================
  // TEACHERS
  // =========================
  const teacherWhitelist = useMemo(() => {
    const term = globalSearchTerm.toLowerCase().trim();
    return users.filter(u => 
      (u.role === 'teacher' || u.role === 'adviser') && 
      u.status !== 'archived' &&
      (u.name.toLowerCase().includes(term) || 
       (u.teacherId && u.teacherId.toLowerCase().includes(term)) ||
       (u.subject && u.subject.toLowerCase().includes(term)))
    );
  }, [users, globalSearchTerm]);

  // =========================
  // PARENTS
  // =========================
  const parentWhitelist = useMemo(() => {
    const term = globalSearchTerm.toLowerCase().trim();
    return students.filter(s => 
      s.status !== 'archived' &&
      (s.name.toLowerCase().includes(term) || 
       (s.lrn && s.lrn.toString().toLowerCase().includes(term)) ||
       (s.parentEmail && s.parentEmail.toLowerCase().includes(term)))
    );
  }, [students, globalSearchTerm]);

  // =========================
  // FORM STATES
  // =========================
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    role: '',
    subject: '',
    teacherId: '',
  });

  const [parentForm, setParentForm] = useState({
    name: '',
    lrn: '',
    parentEmail: '',
    assignedTeacher: '',
  });

  const [isResetting, setIsResetting] = useState(false);

  // =========================
  // OPEN MODAL
  // =========================
  const openModal = (
    type:
      | 'view'
      | 'edit'
      | 'archive'
      | 'reset'
      | 'addTeacher'
      | 'addParent',
    person?: any
  ) => {
    setActiveModal(type);
    setSelectedPerson(person || null);

    // PREFILL EDIT FORM
    if (type === 'edit' && person) {
      if (person.teacherId) {
        setTeacherForm({
          name: person.name,
          role: person.role,
          subject: person.subject,
          teacherId: person.teacherId,
        });
      } else {
        setParentForm({
          name: person.name,
          lrn: person.lrn,
          assignedTeacher: person.teacher || '',
        });
      }
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    setActiveModal(null);
    setSelectedPerson(null);

    setTeacherForm({
      name: '',
      role: '',
      subject: '',
      teacherId: '',
    });

    setParentForm({
      name: '',
      lrn: '',
      assignedTeacher: '',
    });
  };

  // =========================
  // EXPORT
  // =========================
  const handleExportCSV = () => {
    toast.success('CSV file exported');
    setIsReportDropdownOpen(false);
  };

  const handleExportPDF = () => {
    toast.success('PDF file exported');
    setIsReportDropdownOpen(false);
  };

  // =========================
  // ADD TEACHER
  // =========================
  const handleAddTeacher = () => {
    if (
      !teacherForm.name ||
      !teacherForm.role ||
      !teacherForm.subject ||
      !teacherForm.teacherId
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    addUser?.({
      name: teacherForm.name,
      email: `${teacherForm.name.toLowerCase().replace(' ', '.')}@sned.edu`, // Real-time placeholder email
      teacherId: teacherForm.teacherId,
      subject: teacherForm.subject,
      role: teacherForm.role.toLowerCase() as any,
      status: 'active'
    });

    toast.success(`Node Initialized: ${teacherForm.name} added to Faculty Registry`);

    closeModal();
  };

  // =========================
  // ADD PARENT
  // =========================
  const handleAddParent = () => {
    if (!parentForm.name || !parentForm.lrn) {
      toast.error('Please fill in all fields');
      return;
    }

    addStudent?.({
      name: parentForm.name,
      lrn: parentForm.lrn,
      parentEmail: parentForm.parentEmail,
      teacher: parentForm.assignedTeacher,
      grade: 'Grade 1', // Default initialization
      riskLevel: 'Low',
      status: 'active',
      lastActivity: 'Account Linked'
    });

    toast.success('Learner Protocol Established: Parent LRN Linked');

    closeModal();
  };

  // =========================
  // UPDATE ACCOUNT
  // =========================
  const handleUpdate = () => {
    if (!selectedPerson) return;

    // TEACHER UPDATE
    if (selectedPerson.role) {
      updateUser?.(selectedPerson.email, { 
        name: teacherForm.name, 
        role: teacherForm.role.toLowerCase() as any,
        teacherId: teacherForm.teacherId,
        subject: teacherForm.subject
      });
      toast.success('Node Synchronized: Teacher parameters updated');
    }
    // PARENT UPDATE
    else {
      updateStudent?.(selectedPerson.id, { 
        name: parentForm.name, 
        lrn: parentForm.lrn,
        teacher: parentForm.assignedTeacher 
      });
      toast.success('Identity Matrix Updated: Student record synchronized');
    }

    closeModal();
  };

  // =========================
  // ARCHIVE ACCOUNT
  // =========================
  const handleArchive = () => {
    if (!selectedPerson) return;

    // TEACHER
    if (selectedPerson.role) {
      archiveUser?.(selectedPerson.email);
      toast.success('Node Decommissioned: Teacher moved to cold storage');
    }
    // PARENT
    else {
      archiveStudent?.(selectedPerson.id);
      toast.success('File Isolated: Student record moved to vault');
    }

    closeModal();
  };

  // =========================
  // SLIDER
  // =========================
  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + 3) % 3);
  };

  return (
    <div
      className="space-y-5 min-h-screen p-3 md:p-5"
      style={{
        background: '#FBF7F2',
        fontFamily: "'Times New Roman', serif",
      }}
    >
      {/* HEADER */}
      <AdminHeader
        icon={Users}
        title="People"
        highlightedTitle="Management"
        subtitle="Institutional User Directory"
        showSystemLink
        isConnected={isConnected}
        latency={latency}
      >
        <div className="px-4 py-2 rounded-2xl bg-[#7B1C2A] text-white text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
          Live Stream Active
        </div>
      </AdminHeader>

      {/* SEARCH + EXPORT */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between bg-white p-4 rounded-[2rem] border border-[#d8cfc2] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-4 h-4" />

          <input
            type="text"
            placeholder="Search..."
            value={globalSearchTerm}
            onChange={(e) =>
              setGlobalSearchTerm(e.target.value)
            }
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f8f4ec] text-sm font-bold text-black border border-[#d8cfc2] outline-none"
          />
        </div>

        <div className="relative">
          <button
            onClick={() =>
              setIsReportDropdownOpen(
                !isReportDropdownOpen
              )
            }
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-bold"
          >
            <FileDown size={18} />
            Export
          </button>

          <AnimatePresence>
            {isReportDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-2xl p-2 z-50 border border-[#d8cfc2]"
              >
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#f8f4ec] font-bold"
                >
                  <FileText size={15} />
                  Export PDF
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#f8f4ec] font-bold"
                >
                  <FileSpreadsheet size={15} />
                  Export CSV
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-end gap-3">
        <button
          onClick={prevSlide}
          className="p-3 rounded-2xl bg-white border border-[#d8cfc2]"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={nextSlide}
          className="p-3 rounded-2xl bg-[#7B1C2A] text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* PAGES */}
      <AnimatePresence mode="wait">

        {/* PAGE 1 */}
        {activeSlide === 0 && (
          <motion.div
            key="page1"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="bg-white rounded-[2rem] border border-[#d8cfc2] shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-5 border-b border-[#d8cfc2]">
              <div className="p-3 rounded-2xl bg-[#7B1C2A] text-white">
                <Layers3 size={22} />
              </div>

              <div>
                <h1 className="text-xl font-black uppercase text-black">
                  User Matrix
                </h1>

                <p className="text-xs font-bold text-black">
                  Active Users
                </p>
              </div>
            </div>

            <div className="p-4">
              <AdminUsers
                globalSearchTerm={globalSearchTerm}
              />
            </div>
          </motion.div>
        )}

        {/* PAGE 2 */}
        {activeSlide === 1 && (
          <motion.div
            key="page2"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="bg-white rounded-[2rem] border border-[#d8cfc2] shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-[#d8cfc2]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#7B1C2A] text-white">
                  <UserCheck size={22} />
                </div>

                <div>
                  <h1 className="text-xl font-black uppercase text-black">
                    Teacher / Adviser Access
                  </h1>

                  <p className="text-xs font-bold text-black">
                    Allowed Teacher Accounts
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  openModal('addTeacher')
                }
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-bold"
              >
                <Plus size={16} />
                Add Teacher
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#7B1C2A] text-white">
                  <tr>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Name
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Role
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Subject
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      ID
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Status
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {teacherWhitelist.map(
                    (teacher, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#d8cfc2] hover:bg-[#f8f4ec]"
                      >
                        <td className="p-4 font-bold text-black">
                          {teacher.name}
                        </td>

                        <td className="p-4 text-black">
                          {teacher.role}
                        </td>

                        <td className="p-4 text-black">
                          {teacher.subject}
                        </td>

                        <td className="p-4 text-black">
                          {teacher.teacherId}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black w-fit border border-emerald-100">
                            <motion.div 
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500" 
                            />
                            {teacher.status?.toUpperCase() || 'ACTIVE'}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                openModal(
                                  'view',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-blue-100 text-blue-700"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'edit',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-yellow-100 text-yellow-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'archive',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-gray-200 text-black"
                            >
                              <Archive size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'reset',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-green-100 text-green-700"
                            >
                              <KeyRound size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PAGE 3 */}
        {activeSlide === 2 && (
          <motion.div
            key="page3"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="bg-white rounded-[2rem] border border-[#d8cfc2] shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-[#d8cfc2]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-green-100 text-green-700">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h1 className="text-xl font-black uppercase text-black">
                    Parent Portal List
                  </h1>

                  <p className="text-xs font-bold text-black">
                    Allowed Parent Accounts
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  openModal('addParent')
                }
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-bold"
              >
                <Plus size={16} />
                Add Parent
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#7B1C2A] text-white">
                  <tr>
                    <th className="p-4 text-left text-[10px] uppercase">
                      #
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      Student Name
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      LRN
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {parentWhitelist.map(
                    (student, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#d8cfc2] hover:bg-[#f8f4ec]"
                      >
                        <td className="p-4 font-bold text-black">
                          {index + 1}
                        </td>

                        <td className="p-4 font-bold text-black">
                          {student.name}
                        </td>

                        <td className="p-4 text-black">
                          {student.lrn}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                openModal(
                                  'view',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-blue-100 text-blue-700"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'edit',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-yellow-100 text-yellow-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'archive',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-gray-200 text-black"
                            >
                              <Archive size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'reset',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-green-100 text-green-700"
                            >
                              <KeyRound size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white w-full max-w-lg rounded-[2rem] border border-[#d8cfc2] shadow-2xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-5 border-b border-[#d8cfc2]">
                <h1 className="text-xl font-black uppercase text-black">

                  {activeModal === 'addTeacher' &&
                    'Add Teacher'}

                  {activeModal === 'addParent' &&
                    'Add Parent'}

                  {activeModal === 'view' &&
                    'View Account'}

                  {activeModal === 'edit' &&
                    'Edit Account'}

                  {activeModal === 'archive' &&
                    'Archive Confirmation'}

                  {activeModal === 'reset' &&
                    'Reset Password'}

                </h1>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl bg-[#f8f4ec]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-4">

                {/* EDIT */}
                {activeModal === 'edit' && (
                  <>
                    {selectedPerson?.teacherId ? (
                      <>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={teacherForm.name}
                          onChange={(e) =>
                            setTeacherForm({
                              ...teacherForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                        <select
                          value={teacherForm.role}
                          onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        >
                          <option value="teacher">Teacher</option>
                          <option value="adviser">Adviser</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Subject"
                          value={teacherForm.subject}
                          onChange={(e) =>
                            setTeacherForm({
                              ...teacherForm,
                              subject: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                      <input
                        type="text"
                        placeholder="Teacher ID"
                        value={teacherForm.teacherId}
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            teacherId: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                      />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Student Name"
                          value={parentForm.name}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                        <input
                          type="text"
                          placeholder="LRN"
                          value={parentForm.lrn}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              lrn: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                      <select
                        value={parentForm.assignedTeacher}
                        onChange={(e) => setParentForm({ ...parentForm, assignedTeacher: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                      >
                        <option value="">Assign Teacher/Adviser</option>
                        {users.filter(u => u.role === 'teacher' || u.role === 'adviser').map(t => (
                          <option key={t.email} value={t.name}>{t.name} ({t.subject})</option>
                        ))}
                      </select>
                      </>
                    )}
                  </>
                )}

                {/* VIEW */}
                {activeModal === 'view' &&
                  selectedPerson && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                        <p className="font-bold">
                          Name
                        </p>
                        <p>{selectedPerson.name}</p>
                      </div>

                      {selectedPerson.role && (
                        <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                          <p className="font-bold">
                            Role
                          </p>
                          <p>
                            {selectedPerson.role}
                          </p>
                        </div>
                      )}

                      {selectedPerson.subject && (
                        <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                          <p className="font-bold">
                            Subject
                          </p>
                          <p>
                            {selectedPerson.subject}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* ARCHIVE */}
                {activeModal === 'archive' &&
                  selectedPerson && (
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                      <h2 className="text-lg font-black text-red-700">
                        Confirm Archive
                      </h2>

                      <p className="mt-2 text-red-600 font-semibold">
                        Are you sure you want to archive
                        <span className="font-black">
                          {' '}
                          {selectedPerson.name}
                        </span>
                        ?
                      </p>
                    </div>
                  )}

                {/* RESET */}
                {activeModal === 'reset' &&
                  selectedPerson && (
                    <div className="p-5 rounded-2xl bg-green-50 border border-green-200">
                      <p className="font-bold text-green-700">
                        Password reset link will be sent
                        to:
                      </p>

                      <p className="mt-2 font-black">
                        {selectedPerson.name}
                      </p>
                    </div>
                  )}

                {/* ADD TEACHER */}
                {activeModal === 'addTeacher' && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={teacherForm.name}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <select
                      value={teacherForm.role}
                      onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    >
                      <option value="">Select Role</option>
                      <option value="teacher">Teacher</option>
                      <option value="adviser">Adviser</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Subject"
                      value={teacherForm.subject}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="text"
                      placeholder="Teacher ID"
                      value={teacherForm.teacherId}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          teacherId: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />
                  </>
                )}

                {/* ADD PARENT */}
                {activeModal === 'addParent' && (
                  <>
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={parentForm.name}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="text"
                      placeholder="LRN"
                      value={parentForm.lrn}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          lrn: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="email"
                      placeholder="Parent's Email (Optional)"
                      value={parentForm.parentEmail}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          parentEmail: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />
                  </>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 p-5 border-t border-[#d8cfc2]">

                <button
                  onClick={closeModal}
                  className="px-5 py-3 rounded-2xl bg-[#f1ece3] text-black font-black"
                >
                  Close
                </button>

                {activeModal === 'edit' && (
                  <button
                    onClick={handleUpdate}
                    className="px-5 py-3 rounded-2xl bg-yellow-500 text-white font-black flex items-center gap-2"
                  >
                    <Save size={16} />
                    Update
                  </button>
                )}

                {activeModal === 'archive' && (
                  <button
                    onClick={handleArchive}
                    className="px-5 py-3 rounded-2xl bg-red-600 text-white font-black flex items-center gap-2"
                  >
                    <Archive size={16} />
                    Confirm Archive
                  </button>
                )}

                {activeModal === 'addTeacher' && (
                  <button
                    onClick={handleAddTeacher}
                    className="px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-black flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                )}

                {activeModal === 'addParent' && (
                  <button
                    onClick={handleAddParent}
                    className="px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-black flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                )}

                {activeModal === 'reset' && (
                  <button
                    disabled={isResetting}
                    onClick={async () => {
                      setIsResetting(true);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      toast.success('Sequence Synchronized', {
                        description: `Reset link dispatched to ${selectedPerson.email || selectedPerson.name}`
                      });
                      setIsResetting(false);
                      closeModal();
                    }}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black flex items-center gap-2 disabled:opacity-50"
                  >
                    {isResetting ? <RefreshCcw size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                    {isResetting ? 'Processing...' : 'Confirm Reset'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPeopleManagement;