import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  Activity, 
  Archive, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badgeCount?: number;
  collapsed?: boolean;
}> = ({
  icon, label, active, onClick, badgeCount, collapsed
}) => (
  <div
    onClick={onClick}
    className={`
      flex items-center gap-4 px-5 py-3.5 rounded-r-full cursor-pointer transition-all uppercase tracking-wider text-[10px] font-black relative
      ${active ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600' : 'hover:bg-emerald-50/50 text-slate-600'}
      ${collapsed ? 'justify-center px-0 border-l-0' : ''}
    `}
    title={collapsed ? label : ''}
  >
    <span className={`${active ? 'text-emerald-600' : 'text-emerald-400'} ${collapsed ? 'scale-110' : ''}`}>{icon}</span>
    {!collapsed && <span className="flex-1">{label}</span>}
    {badgeCount !== undefined && badgeCount > 0 && (
      collapsed ? (
        <div className="absolute top-3 right-6 w-2 h-2 bg-rose-500 rounded-full border border-white shadow-sm" />
      ) : (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-rose-500 text-white text-[8px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white shadow-sm mr-4"
      >
        {badgeCount > 9 ? '9+' : badgeCount}
      </motion.span>
      )
    )}
  </div>
);

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { setUser, user, behaviorLogs = [] } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    toast.info("Institutional Session Terminated");
  };

  const navGroups = [
    {
      label: 'Home',
      items: [{ icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin/dashboard' }]
    },
    {
      label: 'Learners',
      items: [{ icon: <Users size={18} />, label: 'People', path: '/admin/people' }]
    },
    {
      label: 'Intelligence',
      items: [{ icon: <Brain size={18} />, label: 'Analytics', path: '/admin/analytics' }]
    },
    {
      label: 'Reporting',
      items: [
        { icon: <Activity size={18} />, label: 'Logs', path: '/admin/logs' },
        { icon: <Archive size={18} />, label: 'Archived', path: '/admin/archived' },
      ]
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F1F8F6] font-['Times_New_Roman',_serif] text-slate-800 overflow-hidden relative">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white/60 backdrop-blur-xl transition-all duration-300 border-r border-emerald-100 flex flex-col py-4 overflow-hidden whitespace-nowrap z-20 shadow-xl`}>
        <div className={`mb-10 flex items-center transition-all duration-300 ${isSidebarOpen ? 'px-6 gap-4' : 'justify-center'}`}>
          <Menu className="cursor-pointer text-emerald-950 hover:bg-emerald-50 rounded-2xl p-1.5 transition-all" size={32} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Sned<span className="text-[#2D6A4F]">-Admin</span></span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[7px] font-black uppercase tracking-[0.25em] text-emerald-600">Mainframe Node: [ACTIVE]</span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 animate-in fade-in duration-500">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.path}
                  badgeCount={item.label === 'Logs' ? behaviorLogs.length : undefined}
                  collapsed={!isSidebarOpen}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="px-6 mt-auto space-y-2 pb-6 border-t border-emerald-50/50 pt-6">
          <NavItem 
            icon={<Settings size={18} />} 
            label="System Config" 
            active={location.pathname === '/admin/profile'} 
            collapsed={!isSidebarOpen}
            onClick={() => navigate('/admin/profile')} 
          />
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 py-3.5 rounded-2xl hover:bg-rose-50 text-rose-600 transition-all font-black text-[10px] uppercase tracking-widest ${isSidebarOpen ? 'px-6' : 'justify-center px-0'}`}
            title={!isSidebarOpen ? "Sign Out" : ""}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Main content wrapper with smooth transition for padding expansion */}
        <div className={`max-w-[1600px] mx-auto w-full transition-all duration-500 ease-in-out ${isSidebarOpen ? 'p-6 md:p-10' : 'p-10 md:p-16'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;