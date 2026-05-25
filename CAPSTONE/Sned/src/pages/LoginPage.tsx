import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Lock, 
  Mail, 
  UserCircle, 
  Loader2, 
  ChevronDown, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Check,
  Sparkles,
  BookOpen,
  UserCheck,
  Activity,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

interface DropdownOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Custom Webkit Scrollbar Styling injected dynamically */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(123, 28, 42, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(123, 28, 42, 0.3);
          border-radius: 10px;
          transition: background-color 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(123, 28, 42, 0.5);
        }
      `}</style>

      <span className="block text-[9px] font-black text-[#7B1C2A]/80 uppercase tracking-widest mb-2 ml-1">
        {label}
      </span>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-[#F7ECEE]/20 rounded-2xl border transition-all duration-300 outline-none text-left shadow-sm group ${
          isOpen 
            ? 'border-[#7B1C2A] ring-4 ring-[#7B1C2A]/10 shadow-rose-900/5' 
            : 'border-[#e8d8da] hover:border-[#7B1C2A]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F7ECEE] text-[#7B1C2A] rounded-xl group-hover:scale-105 transition-transform duration-300">
            {selectedOption.icon}
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 tracking-tight">{selectedOption.label}</div>
            <div className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{selectedOption.description}</div>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 group-hover:text-[#7B1C2A] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#7B1C2A]' : ''}`} 
        />
      </button>

      {/* Floating Options Menu with Scroll Control */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full left-0 right-0 bg-white/95 backdrop-blur-xl rounded-[2rem] border border-[#e8d8da] shadow-xl shadow-rose-950/10 p-2"
          >
            {/* Scrollable Container with explicit max-height and custom-scrollbar class */}
            <div className="max-h-[160px] overflow-y-auto custom-scrollbar pr-1 space-y-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all duration-150 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#F7ECEE] to-[#F7ECEE]/30 text-[#3D0C18] font-bold' 
                        : 'hover:bg-slate-50 text-slate-600 hover:text-[#7B1C2A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isSelected ? 'bg-[#7B1C2A] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold tracking-tight">{option.label}</div>
                        <div className="text-[9px] text-[#7B1C2A]/60 font-semibold line-clamp-1">{option.description}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#7B1C2A] flex items-center justify-center text-white mr-1 shadow-sm">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Subtle Gradient Hint at bottom of list to prompt scroll navigation */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-3 bg-gradient-to-t from-white/80 to-transparent pointer-events-none rounded-b-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ALLOWED_LRNS = [
  "109793100027",
  "109793100028",
  "109793100029",
  "109793100030",
  "109793100031",
  "109793100032",
  "109793100033",
  "109793100034",
  "109793100035",
  "109793100036",
  "109793100037",
  "109793100038",
  "109793100039",
  "109793100040",
];

const LoginPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPostSignupNotice, setShowPostSignupNotice] = useState(false);
  const [lrn, setLrn] = useState('');
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('Grade 1');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(location.state?.signup || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, addUser, addStudent, users, addIEPRequest } = useApp();

  // Custom credentials for single admin and teacher
  const CUSTOM_ADMIN_EMAIL = "admin@sned.edu";
  const CUSTOM_ADMIN_PASSWORD = "adminpassword";
  const CUSTOM_TEACHER_EMAIL = "teacher@sned.edu";
  const CUSTOM_TEACHER_PASSWORD = "teacherpassword";

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1; // Level 1: Minimum length
    if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1; // Level 2: Good length + Mixed case
    if (/\d/.test(password)) score += 1; // Level 3: Numbers included
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Level 4: Special characters
    return score;
  }, [password]);

  const currentMode = import.meta.env.MODE;

  // Determine if we are in the Institutional Web Terminal or the Mobile Application
  const isWebTerminal = currentMode === 'web' || currentMode === 'development';

  // Institutional Governance: Web Terminal is strictly for LOGIN of authorized personnel.
  useEffect(() => {
    if (isWebTerminal && isSignup) {
      setIsSignup(false);
    }
  }, [isWebTerminal]);

  // Institutional Role Governance: Default based on distribution mode
  const [role, setRole] = useState(isWebTerminal ? 'teacher' : 'parent');

  const colors = {
    primary: '#7B1C2A',    // Maroon
    secondary: '#C49A3C',  // Gold
    accent: '#F7ECEE',     // Soft Creamy Pink/Maroon
    background: '#FBF7F2', // Signature Cream
  };

  const roleOptions: DropdownOption[] = useMemo(() => {
    const options = [
      { value: 'teacher', label: 'Teacher / Instructor', description: 'Manage specialized classes and student learning curves.', icon: <GraduationCap size={15} /> },
      { value: 'parent', label: 'Parent / Guardian', description: 'Review your child\'s behavior records and link IEP nodes.', icon: <Users size={15} /> },
      { value: 'admin', label: 'Administrator', description: 'Oversee educational infrastructure and full system logs.', icon: <ShieldCheck size={15} /> }
    ];

    if (isWebTerminal) {
      // Web distribution is for Institutional oversight (Admin/Teacher)
      return options.filter(opt => opt.value !== 'parent');
    } else {
      // Mobile distribution is for Parents and Admins
      return options.filter(opt => opt.value !== 'teacher');
    }
  }, [isWebTerminal]);

  const gradeOptions: DropdownOption[] = [
    { value: 'Grade 1', label: 'Grade 1', description: 'Early Childhood Development', icon: <BookOpen size={15} /> },
    { value: 'Grade 2', label: 'Grade 2', description: 'Primary Education Node', icon: <BookOpen size={15} /> },
    { value: 'Grade 3', label: 'Grade 3', description: 'Elementary Academic Stage', icon: <BookOpen size={15} /> }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      try {
        if (isSignup) {
          // Password Strength Validation Node
          if (passwordStrength < 2) {
            setError('Masyadong mahina ang password. Mangyaring gumamit ng hindi bababa sa 8 characters na may halo ng uppercase at lowercase letters.');
            setIsLoading(false);
            return;
          }

          if (!lrn) {
            setError('Mangyaring ilagay ang LRN ng mag-aaral para sa institutional linking.');
            setIsLoading(false);
            return;
          }

          if (!ALLOWED_LRNS.includes(lrn.trim())) {
            setError('Ang LRN na inilagay ay hindi otorisadong mag-register. Mangyaring makipag-ugnayan sa administrator.');
            setIsLoading(false);
            return;
          }

          // 1. Validation: Bawal ang magkaparehong email (Duplicate registration check)
          const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
          if (userExists) {
            setError('Ang account na ito ay rehistrado na. Mangyaring mag-log in na lamang.');
            setIsLoading(false);
            return;
          }

          // Register is ONLY for parents
          const signupRole = 'parent';
          addUser({ name, email, role: signupRole });
            addStudent({ 
              name: childName, 
              grade: childGrade, 
              lrn: lrn,
              parentEmail: email, 
              parentName: name, 
              initials: childName.split(' ').map(n => n[0]).join('').toUpperCase(), 
              riskLevel: 'Low', 
              status: 'active', 
              lastActivity: 'Joined system' 
            });
            // Suggestion: Add a pending IEP access request here
            // addIEPRequest({ parentEmail: email, studentName: childName, status: 'pending' });
          
          setUser({ name: name || email.split('@')[0], email, role: signupRole });
          setShowPostSignupNotice(true);
          toast.success("Guardian Node Authorized");
        } else {
          // Custom login for single admin and teacher
          if (email === CUSTOM_ADMIN_EMAIL) {
            if (password === CUSTOM_ADMIN_PASSWORD) {
              setUser({ name: "Admin", email: CUSTOM_ADMIN_EMAIL, role: "admin" });
              toast.success("Admin Node Link Established");
              navigate('/');
              return;
            } else {
              setError('Invalid credentials. Please check your password.');
              setIsLoading(false);
              return;
            }
          }

          if (email === CUSTOM_TEACHER_EMAIL) {
            if (password === CUSTOM_TEACHER_PASSWORD) {
              setUser({ name: "Teacher", email: CUSTOM_TEACHER_EMAIL, role: "teacher" });
              toast.success("Teacher Node Link Established");
              navigate('/');
              return;
            } else {
              setError('Invalid credentials. Please check your password.');
              setIsLoading(false);
              return;
            }
          }
          const registeredUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!registeredUser) {
            setError('Invalid credentials. Hindi mahanap ang iyong account sa system.');
            setIsLoading(false);
            return;
          }

          // 3. Validation: Bawal mag-log in sa ibang role (Role enforcement check)
          if (registeredUser.role !== role) {
            setError(`Bawal ang access. Ang account na ito ay naka-register bilang ${registeredUser.role}.`);
            setIsLoading(false);
            return;
          }
          // Placeholder for actual password check for dynamically registered users.
          // In a real application, you would compare 'password' with a hashed password stored for 'registeredUser'.
          if (password !== "defaultpassword") { // Assuming a default password for simplicity, replace with actual logic
            setError('Invalid credentials. Please check your password.');
            setIsLoading(false);
            return;
          }

          setUser(registeredUser);
          toast.success("Node Link Established");
          navigate('/');
        }
      } catch (err) {
        setError('Authorization failed. Please verify credentials.');
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Times_New_Roman',_serif]" style={{ backgroundColor: colors.background }}>
      {/* Background radial gradient mesh styling */}
      <div className="fixed inset-0 -z-10" style={{
        background: '#f8fafc',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
          radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%)
        `
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link Styled like Sidebar Action */}
        <button 
          onClick={() => navigate('/')} 
          className="mb-6 flex items-center gap-3 text-slate-500 hover:text-[#7B1C2A] transition-all group px-4 py-2 rounded-full hover:bg-[#F7ECEE]/50 w-fit"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-[#7B1C2A]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to landing</span>
        </button>

        {/* Glassmorphic Portal Card - Styled Exactly like Classroom Cards & Sidebar */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-12 shadow-xl shadow-rose-950/5 border border-[#e8d8da] relative overflow-hidden">
          
          {/* Active indicator strip inspired by Sidebar Active NavItem */}
          <div className="absolute left-0 top-12 bottom-12 w-1.5 bg-[#7B1C2A] rounded-r-full" />

          <div className="space-y-8">
            {/* Round Premium Logo with Soft Outer Pulse Glow */}
            <AnimatePresence mode="wait">
              {showPostSignupNotice ? (
                <motion.div 
                  key="notice"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-4"
                >
                  <div className="w-20 h-20 bg-[#F7ECEE] rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                    <Download size={32} className="text-[#7B1C2A] animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Download the <span className="text-[#7B1C2A]">Mobile Node</span></h2>
                    <p className="text-[10px] font-black text-[#7B1C2A]/40 uppercase tracking-[0.3em] mt-2">Registration Successful</p>
                  </div>
                  <div className="p-6 bg-[#F7ECEE]/50 rounded-[2.5rem] border border-[#e8d8da] text-left">
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      Welcome, <span className="text-[#7B1C2A] font-black">{name}</span>. Your guardian account is now linked to <span className="text-[#7B1C2A] font-black">{childName}</span>.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-4 leading-relaxed italic">
                      Institutional Protocol: To access live behavioral tensors and real-time alerts, you must use the SNED-LINK+ Mobile Application.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <a 
                      href="/sned-link-plus.apk"
                      download="sned-link-plus.apk"
                      className="w-full flex items-center justify-center gap-3 py-5 bg-[#3D0C18] text-[#C49A3C] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl no-underline"
                    >
                      <Download size={16} /> Download Android APK
                    </a>
                    <button onClick={() => navigate('/parent')} className="w-full py-4 bg-white border border-[#e8d8da] text-[#7B1C2A] rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-[#F7ECEE]/50 transition-all">
                      Continue to Web Preview
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-tr from-[#3D0C18] to-[#7B1C2A] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-900/30 border-2 border-[#C49A3C] relative">
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C49A3C] border-2 border-[#3D0C18] rounded-full animate-pulse" />
                    <Sparkles size={20} className="text-[#C49A3C]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
                    {isSignup ? 'Guardian' : 'Sign'} <span className="text-[#7B1C2A]">{isSignup ? 'Enrollment' : 'In'}</span>
                  </h2>
                  <p className="text-[9px] font-black text-[#7B1C2A]/80 uppercase tracking-[0.3em] mt-3">
                    SNED-LINK+ {isSignup ? 'Parent Access Network' : 'Web Terminal'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!showPostSignupNotice && (
              <div className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Full Legal Name for Sign Up */}
                {isSignup && (
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B1C2A]/50 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Full Legal Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full pl-12 pr-5 py-4 bg-slate-50/50 rounded-2xl border-[#e8d8da]/80 focus:border-[#7B1C2A] focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-xs font-bold text-slate-700 placeholder:text-slate-400 shadow-inner"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B1C2A]/50 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="Registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full pl-12 pr-5 py-4 bg-slate-50/50 rounded-2xl border border-[#e8d8da]/80 focus:border-[#7B1C2A] focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-xs font-bold text-slate-700 placeholder:text-slate-400 shadow-inner"
                  />
                </div>

                {/* Password field */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B1C2A]/50 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-slate-50/50 rounded-2xl border border-[#e8d8da]/80 focus:border-[#7B1C2A] focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-xs font-bold text-slate-700 placeholder:text-slate-400 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7B1C2A] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter - Animated Feedback */}
                {isSignup && password.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 px-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Security Strength</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${passwordStrength >= 3 ? 'text-[#7B1C2A]' : passwordStrength >= 2 ? 'text-amber-600' : 'text-rose-500'}`}>
                        {['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step} 
                          className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= step ? (passwordStrength >= 3 ? 'bg-[#7B1C2A]' : passwordStrength >= 2 ? 'bg-amber-600' : 'bg-rose-500') : 'bg-slate-100'}`} 
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {!isSignup && (
                  <div className="flex justify-end pr-1">
                    <button type="button" className="text-[9px] font-black uppercase tracking-widest text-[#7B1C2A] hover:text-rose-400 transition-colors">Forgot Password?</button>
                  </div>
                )}

                {/* LRN Field (Replacing Role Base) for Parent/Mobile users */}
                {isSignup && (
                   <div className="relative group">
                     <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B1C2A]/50 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
                     <input
                       type="text"
                       placeholder="Learner Reference Number (LRN)"
                       value={lrn}
                       onChange={(e) => setLrn(e.target.value)}
                       disabled={isLoading}
                       className="w-full pl-12 pr-5 py-4 bg-slate-50/50 rounded-2xl border-[#e8d8da]/80 focus:border-[#7B1C2A] focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-xs font-bold text-slate-700 placeholder:text-slate-400 shadow-inner"
                     />
                   </div>
                )}

                {/* Sub-form fields for Student Specific Details */}
                <AnimatePresence>
                  {isSignup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-5 border-t border-[#e8d8da]/60 mt-4"
                    >
                      <p className="text-[9px] font-black text-[#7B1C2A]/80 uppercase tracking-widest ml-1">Learner Details (Child)</p>
                      
                      <div className="relative group">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B1C2A]/50 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="Child's Full Legal Name"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          disabled={isLoading}
                          required
                          className="w-full pl-12 pr-5 py-4 bg-slate-50/50 rounded-2xl border-[#e8d8da]/80 focus:border-[#7B1C2A] focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-xs font-bold text-slate-700 placeholder:text-slate-400 shadow-inner"
                        />
                      </div>

                      {/* Custom Grade Selector Dropdown with Scroll */}
                      <CustomDropdown
                        options={gradeOptions}
                        value={childGrade}
                        onChange={(val) => setChildGrade(val)}
                        label="Child Academic Grade Level"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Primary Action Button */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: colors.primary }}
                  className="w-full text-white py-4 rounded-2xl font-black hover:opacity-95 transition-all text-[10px] uppercase tracking-[0.2em] mt-6 shadow-lg shadow-rose-900/15 flex items-center justify-center gap-3 disabled:opacity-75 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    isSignup ? 'Get Started' : 'Log In'
                  )}
                </button>
              </form>
              </div>
            )}

              {!isWebTerminal && (
                <p className="text-[10px] text-center mt-8 text-slate-400 font-bold uppercase tracking-wider">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => { setIsSignup(!isSignup); setError(''); }}
                    className="font-black hover:underline transition-all text-[#7B1C2A] ml-1"
                  >
                    {isSignup ? 'Sign In' : 'Create an account'}
                  </button>
                </p>
              )}
            </div>
          </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;