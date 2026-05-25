import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

export type UserRole = 'teacher' | 'parent' | 'admin';

export interface User {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
  status?: 'active' | 'archived';
  isOnline?: boolean;
}

export interface Student {
  id: string;
  initials: string;
  name: string;
  grade: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  teacher: string;
  lastActivity: string;
  status: 'active' | 'archived';
  parentName?: string;
  parentEmail?: string;
}

export interface BehaviorLog {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Positive' | 'Attention Needed' | 'Concerning';
  description: string;
  time: string;
  location: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  date: string;
  teacherName?: string; // Added for audit trail traceability
  confidence?: number;
  anomalyScore?: number; // Added for anomaly detection support
}

export interface Alert {
  id: string;
  studentName: string;
  message: string;
  priority: 'Low' | 'Moderate' | 'High';
  isNew: boolean;
  timestamp: string;
  reviewed: boolean;
  studentLevel?: string; // Added for teacher alerts filtering
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  note?: string;
}

export interface ProgressNote {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  category: string;
  note: string;
  createdBy: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  nextSteps?: string;
  acknowledgedAt?: string;
}

export interface LearningPlan {
  id: string;
  studentId: string;
  studentName: string;
  goals: string[];
  accommodations: string[];
  updatedDate: string;
  status: 'active' | 'completed';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
  quotedMessage?: {
    id: string;
    from: string;
    content: string;
  };
  attachment?: {
    name: string;
    url: string;
    type: 'image' | 'file';
  };
}

export interface IEPRequest {
  id: string;
  parentEmail: string;
  parentName: string;
  studentName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

// Helper to load from localStorage
const getLocal = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved);
  } catch { return fallback; }
};

// Safe ID generator fallback for insecure contexts
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const students: Student[] = [];
const behaviorLogs: BehaviorLog[] = [];
const alerts: Alert[] = [];
const initialAttendance: AttendanceRecord[] = [];
const initialProgress: ProgressNote[] = [];
const initialLearningPlans: LearningPlan[] = [];
const initialActivityLogs: ActivityLog[] = [];
const initialMessages: Message[] = [];

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  students: Student[];
  users: User[];
  behaviorLogs: BehaviorLog[];
  alerts: Alert[];
  attendance: AttendanceRecord[];
  progressNotes: ProgressNote[];
  learningPlans: LearningPlan[];
  activityLogs: ActivityLog[];
  messages: Message[];
  iepRequests: IEPRequest[];
  addIEPRequest: (req: Omit<IEPRequest, 'id' | 'status' | 'timestamp'>) => void;
  updateIEPRequest: (id: string, status: IEPRequest['status']) => void;
  addSyncRequest: (req: any) => void;
  addBehaviorLog: (log: Omit<BehaviorLog, 'id'>) => void;
  markAlertReviewed: (id: string) => void;
  archiveStudent: (id: string) => void;
  restoreStudent: (id: string) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  addProgressNote: (note: Omit<ProgressNote, 'id'>) => void;
  updateProgressNote: (id: string, updates: Partial<ProgressNote>) => void;
  deleteProgressNote: (id: string) => void;
  sendMessage: (msg: Omit<Message, 'id'>) => void;
  deleteMessage: (id: string) => void;
  editMessage: (id: string, content: string) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id'>) => void;
  addStudent: (student: Omit<Student, 'id' | 'initials' | 'riskLevel' | 'teacher' | 'lastActivity' | 'status'> & { parentName?: string; parentEmail?: string; grade?: string }) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'status'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  archiveUser: (id: string) => void;
  markMessagesAsRead: (fromName: string, toName: string) => void;
  isLoading: boolean;
  requestNotificationPermission: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getLocal('sned_auth_user', null));
  
  // Persistent States
  const [studentList, setStudentList] = useState<Student[]>(() => getLocal('sned_students', students));
  const [users, setUsers] = useState<User[]>(() => getLocal('sned_users', []));
  const [logs, setLogs] = useState<BehaviorLog[]>(() => getLocal('sned_logs', behaviorLogs));
  const [alertList, setAlertList] = useState<Alert[]>(() => getLocal('sned_alerts', alerts));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getLocal('sned_attendance', initialAttendance));
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>(() => getLocal('sned_notes', initialProgress));
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>(() => getLocal('sned_plans', initialLearningPlans));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getLocal('sned_activity', initialActivityLogs));
  const [messageList, setMessageList] = useState<Message[]>(() => getLocal('sned_messages', initialMessages));
  const [iepRequests, setIepRequests] = useState<IEPRequest[]>(() => getLocal('sned_iep_requests', []));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "denied" && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  const triggerNativeNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });

      // Play a standard notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(e => console.warn("Browser blocked notification sound until user interaction:", e));
    }
  };

  // Save to localStorage on changes
  useEffect(() => { localStorage.setItem('sned_auth_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('sned_students', JSON.stringify(studentList)); }, [studentList]);
  useEffect(() => { localStorage.setItem('sned_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sned_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('sned_alerts', JSON.stringify(alertList)); }, [alertList]);
  useEffect(() => { localStorage.setItem('sned_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('sned_notes', JSON.stringify(progressNotes)); }, [progressNotes]);
  useEffect(() => { localStorage.setItem('sned_activity', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('sned_messages', JSON.stringify(messageList)); }, [messageList]);
  useEffect(() => { localStorage.setItem('sned_plans', JSON.stringify(learningPlans)); }, [learningPlans]);
  useEffect(() => { localStorage.setItem('sned_iep_requests', JSON.stringify(iepRequests)); }, [iepRequests]);

  const addIEPRequest = (req: Omit<IEPRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: IEPRequest = {
      ...req,
      id: generateId(),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setIepRequests(prev => [newReq, ...prev]);
  };

  const updateIEPRequest = (id: string, status: IEPRequest['status']) => {
    setIepRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addSyncRequest = (req: any) => {
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Requested Data Sync',
      target: req.studentName,
      timestamp: new Date().toLocaleString()
    });
  };

  const addBehaviorLog = (log: Omit<BehaviorLog, 'id'>) => {
    const newId = generateId();
    setLogs(prev => [{ ...log, id: newId }, ...prev]);
    
    // Update the student's last activity timestamp
    setStudentList(prev => prev.map(s => 
      s.id === log.studentId 
        ? { ...s, lastActivity: new Date().toLocaleString(), riskLevel: log.riskLevel } 
        : s
    ));

    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Logged Behavior',
      target: log.studentName,
      timestamp: new Date().toLocaleString()
    });

    // Real-time device notification for high risk events
    if (log.riskLevel === 'High') {
      triggerNativeNotification(
        `🚨 Priority Alert: ${log.studentName}`,
        `New ${log.type} log recorded. Priority level is set to HIGH.`
      );
    }

    // Generate an alert for High or Moderate risk levels
    if (log.riskLevel === 'High' || log.riskLevel === 'Moderate' || log.type === 'Concerning' || log.type === 'Attention Needed') {
      const studentGrade = studentList.find(s => s.id === log.studentId)?.grade || 'Unknown';
      const newAlert: Alert = {
        id: generateId(),
        studentName: log.studentName,
        message: log.description,
        priority: log.riskLevel,
        isNew: true,
        timestamp: new Date().toLocaleString(),
        reviewed: false,
        studentLevel: studentGrade,
      };
      setAlertList(prev => [newAlert, ...prev]);
    }
  };

  const addStudent = (student: Omit<Student, 'id' | 'initials' | 'riskLevel' | 'teacher' | 'lastActivity' | 'status'> & { parentName?: string; parentEmail?: string; grade?: string }) => {
    const newId = generateId();
    const initials = student.name.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
    
    setStudentList(prev => [
      {
        id: newId,
        initials,
        name: student.name,
        grade: student.grade || 'Grade 1',
        riskLevel: 'Low',
        teacher: user?.role === 'teacher' ? user.name : '',
        lastActivity: new Date().toLocaleString(),
        status: 'active',
        parentName: student.parentName,
        parentEmail: student.parentEmail,
      },
      ...prev
    ]);
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Added Student',
      target: student.name,
      timestamp: new Date().toLocaleString()
    });
  };

  const addUser = (newUser: Omit<User, 'id' | 'status'>) => {
    const newId = generateId();
    setUsers(prev => [
      ...prev,
      { ...newUser, id: newId, status: 'active' }
    ]);
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Created User Account',
      target: `${newUser.name} (${newUser.role})`,
      timestamp: new Date().toLocaleString()
    });
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const student = studentList.find(s => s.id === id);
    setStudentList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Updated Student Info',
      target: student?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const deleteStudent = (id: string) => {
    const student = studentList.find(s => s.id === id);
    setStudentList(prev => prev.filter(s => s.id !== id));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Permanently Deleted Student',
      target: student?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const targetUser = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Updated User Account',
      target: targetUser?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const deleteUser = (id: string) => {
    const targetUser = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Permanently Deleted User',
      target: targetUser?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const archiveUser = (id: string) => {
    const targetUser = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'archived' as const } : u));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Archived User',
      target: targetUser?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const markAlertReviewed = (id: string) => {
    const alert = alertList.find(a => a.id === id);
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, reviewed: true, isNew: false } : a));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Reviewed Alert',
      target: alert?.studentName || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const archiveStudent = (id: string) => {
    const student = studentList.find(s => s.id === id);
    setStudentList(prev => prev.map(s => s.id === id ? { ...s, status: 'archived' as const } : s));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Archived Student',
      target: student?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const restoreStudent = (id: string) => {
    const student = studentList.find(s => s.id === id);
    setStudentList(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as const } : s));
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Restored Student',
      target: student?.name || id,
      timestamp: new Date().toLocaleString()
    });
  };

  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(r => r.studentId === record.studentId && r.date === record.date);
      
      addActivityLog({
        userId: user?.id || 'system',
        userName: user?.name || 'System',
        action: 'Updated Attendance',
        target: record.studentName,
        timestamp: new Date().toLocaleString()
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...record, id: prev[existingIndex].id };
        return updated;
      }
      return [{ ...record, id: generateId() }, ...prev];
    });
  };

  const addProgressNote = (note: Omit<ProgressNote, 'id'>) => {
    setProgressNotes(prev => [{ ...note, id: generateId() }, ...prev]);
    triggerNativeNotification(
      `New Progress Note`,
      `Teacher ${note.createdBy} added a ${note.sentiment} update for ${note.studentName}.`
    );
  };

  const updateProgressNote = (id: string, updates: Partial<ProgressNote>) => {
    setProgressNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteProgressNote = (id: string) => {
    setProgressNotes(prev => prev.filter(n => n.id !== id));
  };

  const sendMessage = (msg: Omit<Message, 'id'>) => {
    setMessageList(prev => [...prev, { ...msg, id: generateId() }]);
    triggerNativeNotification(
      `New Message from ${msg.from}`,
      msg.content.length > 50 ? `${msg.content.substring(0, 47)}...` : msg.content
    );
  };

  const deleteMessage = (id: string) => {
    setMessageList(prev => prev.filter(m => m.id !== id));
  };

  const editMessage = (id: string, content: string) => {
    setMessageList(prev => prev.map(m => m.id === id ? { ...m, content } : m));
  };

  const markMessagesAsRead = (fromName: string, toName: string) => {
    setMessageList(prev => prev.map(m => (m.from === fromName && m.to === toName) ? { ...m, read: true } : m));
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id'>) => {
    setActivityLogs(prev => [{ ...log, id: generateId() }, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      students: studentList,
      users,
      behaviorLogs: logs,
      alerts: alertList,
      attendance,
      iepRequests, addIEPRequest, updateIEPRequest, addSyncRequest,
      progressNotes,
      learningPlans, updateProgressNote, deleteProgressNote,
      activityLogs,
      messages: messageList,
      isLoading,
      addBehaviorLog, addUser, updateUser, deleteUser, archiveUser, markAlertReviewed, markMessagesAsRead,
      archiveStudent, restoreStudent, deleteStudent,
      addAttendance, addProgressNote, requestNotificationPermission,
      sendMessage, addActivityLog,
      addStudent, updateStudent, deleteStudent, deleteMessage, editMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
