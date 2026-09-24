import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Camera, 
  Stethoscope,
  Bot,
  LogOut,
  X,
  Settings,
  Cpu,
  UserCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DrishtiLogo } from './DrishtiLogo';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout?: () => void;
  activeDevices?: number;
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
  onOpenSettings?: () => void;
  userRole?: 'doctor' | 'registration';
}

export function Sidebar({ 
  currentView, 
  onChangeView, 
  onLogout, 
  activeDevices = 1,
  isCollapsed = false,
  onCloseMobile,
  onOpenSettings,
  userRole = 'doctor'
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Diagnostic Desk', shortLabel: 'Desk', shortcut: '1', letterKey: 'D', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Database', shortLabel: 'Patients', shortcut: '2', letterKey: 'P', icon: Users },
    { id: 'new_scan', label: 'Diagnose', shortLabel: 'Diagnose', shortcut: '3', letterKey: 'S', icon: Camera },
    { id: 'advisor', label: 'AI Care & Advisor', shortLabel: 'AI Advisor', shortcut: '4', letterKey: 'A', icon: Bot, highlight: true },
    { id: 'mathworks', label: 'MathWorks SIH 26038', shortLabel: 'SIH 26038', shortcut: '5', letterKey: 'M', icon: Cpu, badge: 'MATLAB' },
    { id: 'settings', label: 'Settings', shortLabel: 'Settings', shortcut: '6', letterKey: ',', icon: Settings, isAction: true },
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.id === 'settings') {
      if (onOpenSettings) {
        onOpenSettings();
      }
      onCloseMobile?.();
    } else {
      onChangeView(item.id);
      onCloseMobile?.();
    }
  };

  if (isCollapsed) {
    // YouTube Mini Sidebar (Collapsed Mode)
    return (
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none shadow-2xs transition-all duration-300">
        <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                title={`${item.label} (Press ${item.shortcut} or ${item.letterKey})`}
                className={cn(
                  "w-full flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all cursor-pointer relative group",
                  isActive 
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-normal"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 mb-1.5 transition-transform group-hover:scale-110",
                  isActive ? "text-sky-600" : "text-slate-500"
                )} />
                <span className="text-[10px] text-center leading-tight tracking-tight max-w-[68px] truncate">
                  {item.shortLabel || item.label}
                </span>
                {item.highlight && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" title="Edge AI" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mini Bottom Controls: Clean, showing only version on down */}
        <div className="p-2 border-t border-slate-200 shrink-0 flex flex-col items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-2xs"
            title="Dr. Ananya Sharma • Rural Unit #4"
          >
            <Stethoscope className="w-4.5 h-4.5" />
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <span className="text-[9px] font-mono text-slate-400 font-medium">v1.1.2.8</span>
        </div>
      </aside>
    );
  }

  // YouTube Full Sidebar (Expanded Mode)
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-2xs transition-all duration-300 select-none">
      {onCloseMobile && (
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0 lg:hidden">
          <div className="flex items-center gap-2.5">
            <DrishtiLogo size="custom" className="h-10 md:h-11 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 leading-none">DRishtii</span>
              <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wide">Diagnostic Desk</span>
            </div>
          </div>
          <button 
            onClick={onCloseMobile} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            title={`Open ${item.label} (Press ${item.shortcut} or ${item.letterKey})`}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm font-medium relative group",
              currentView === item.id 
                ? "bg-sky-50 text-sky-700 border border-sky-100/80 font-semibold shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            )}
          >
            <div className="flex items-center space-x-3 truncate">
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                currentView === item.id ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              <span className="truncate">{item.label}</span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {item.badge && (
                <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="text-[9px] font-bold uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                  Edge AI
                </span>
              )}
              <kbd className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors",
                currentView === item.id 
                  ? "bg-sky-100 text-sky-800 border-sky-200 font-bold" 
                  : "bg-slate-100/90 text-slate-400 border-slate-200 group-hover:text-slate-600"
              )}>
                {item.shortcut}
              </kbd>
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-200 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1.5 rounded-md">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            P2P Realtime
          </span>
          <span>{activeDevices} screen{activeDevices > 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            {userRole === 'registration' ? (
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
            )}
            <div className="text-left truncate">
               <p className="text-xs font-bold text-slate-700 truncate">
                 {userRole === 'registration' ? 'Staff Priya Verma' : 'Dr. Ananya Sharma'}
               </p>
               <p className="text-[10px] text-emerald-600 font-medium">
                 {userRole === 'registration' ? 'Active • Registration Desk' : 'Active • Rural Unit #4'}
               </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* On down only show the version */}
        <div className="text-center pt-0.5 flex items-center justify-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-mono">v1.1.2.8</span>
          <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1 rounded border border-emerald-200/60">
            SECURE
          </span>
        </div>
      </div>
    </aside>
  );
}

