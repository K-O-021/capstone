import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  MessageSquare, 
  GraduationCap, 
  ClipboardList,
  ShieldCheck,
  UserRound,
  LogOut,
  Camera, Menu, // Import Menu icon
  User as UserIcon
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isDesktopApp } from "@/lib/platform";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: ('admin' | 'teacher' | 'parent')[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // CRITICAL FIX: Kung ang kasalukuyang user ay may role na 'parent', 
  // ganap na hihinto ang pag-render ng Sidebar component (magbabalik ng null).
  if (user?.role === 'parent') {
    return null;
  }

  const profilePath = user?.role === 'admin' ? '/admin/profile' : user?.role === 'parent' ? '/parent/profile' : '/teacher/profile';

  // Navigation for the Standalone Application (Admin/Teacher Terminal)
  const desktopGroups: NavGroup[] = [
    { label: 'Dashboards', items: [
      { title: "Admin Console", href: "/admin", icon: ShieldCheck, roles: ['admin'] },
      { title: "Teacher Terminal", href: "/terminal", icon: GraduationCap, roles: ['teacher'] },
    ]},
    { label: 'Management', items: [
      { title: "Manage Students", href: "/students", icon: Users, roles: ['admin'] },
    ]},
    { label: 'Configuration', items: [
      { title: "System Settings", href: "/settings", icon: Settings, roles: ['admin'] },
    ]}
  ];

  // Navigation for the Web Application (Parent/Teacher Portal)
  const webGroups: NavGroup[] = [
    { label: 'Portals', items: [
      { title: "Parent Portal", href: "/parent-portal", icon: UserRound, roles: ['parent'] },
      { title: "Teacher Web Dashboard", href: "/teacher-web", icon: LayoutDashboard, roles: ['teacher'] },
    ]},
    { label: 'Activity', items: [
      { title: "Behavioral Progress", href: "/logs", icon: ClipboardList, roles: ['teacher'] },
      { title: "Messages", href: "/messages", icon: MessageSquare, roles: ['parent', 'teacher'] },
    ]},
  ];

  const activeGroups = (isDesktopApp ? desktopGroups : webGroups).map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || (user && item.roles.includes(user.role)))
  })).filter(group => group.items.length > 0);

  const handleLogout = () => {
    if (isDesktopApp) {
      const confirmExit = window.confirm("Are you sure you want to exit the Admin Terminal?");
      if (!confirmExit) return;
    }

    setUser(null);
    navigate('/');
    toast.success(isDesktopApp ? "Terminal session ended" : "Successfully logged out");
  };

  return (
    <div 
      className={cn(
        "flex h-full flex-col border-r border-[#e8d8da] p-4 text-slate-700 bg-white transition-all duration-300 font-['Times_New_Roman',_serif]",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Profile Avatar Header */}
      <div className="mb-6 px-4 py-6 border-b border-[#e8d8da]/50 flex items-center gap-4 relative overflow-hidden group/header">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="z-10 text-slate-400 hover:text-[#7B1C2A] transition-colors cursor-pointer hover:scale-110 active:scale-95"
        >
          <Menu size={18} className="text-[#7B1C2A]" />
        </button>
        <div className="flex items-center gap-4 z-10">
          <div 
            className={cn("relative group cursor-pointer", isCollapsed && "hidden")}
            onClick={() => navigate(profilePath)}
            title="Edit Profile"
          >
            <div className="w-12 h-12 rounded-full bg-[#F7ECEE] text-[#7B1C2A] font-black text-xl flex items-center justify-center border border-[#e8d8da] group-hover:border-[#7B1C2A] transition-all overflow-hidden">
              {user?.name ? user.name.charAt(0) : <UserIcon className="w-8 h-8" />}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#7B1C2A] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-sm border-2 border-white">
              <Camera className="w-3 h-2" />
            </div>
          </div>
          {/* SnedLink+ logo text */}
          <div className={cn("transition-all duration-300 ease-in-out overflow-hidden mt-1", isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs")}>
              <h1 className="text-lg font-black text-[#7B1C2A] tracking-tighter uppercase italic leading-none">Sned<span className="text-[#C49A3C]">Link+</span></h1>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#7B1C2A]/50 mt-1">{user?.role} Authority</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 custom-scrollbar">
        {activeGroups.map((group) => (
          <div key={group.label} className="mb-8 last:mb-0">
            <p className={cn("text-[9px] font-black text-[#7B1C2A]/40 uppercase tracking-[0.2em] px-4 mb-3 transition-all duration-300 overflow-hidden", isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto")}>
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group/item", 
                    isCollapsed && "justify-center px-2",
                    location.pathname === item.href 
                      ? "bg-[#F7ECEE] text-[#7B1C2A] shadow-inner border border-[#e8d8da]/40" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-transform", location.pathname === item.href ? "text-[#7B1C2A]" : "text-slate-300 group-hover:text-slate-600")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="mt-auto border-t border-[#e8d8da]/50 bg-slate-50/30 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
        >
          <LogOut className="h-4 w-4 text-slate-300 group-hover:text-rose-600" />
          <span className={cn("transition-all duration-300 ease-in-out overflow-hidden", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>{isDesktopApp ? "Exit Terminal" : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;