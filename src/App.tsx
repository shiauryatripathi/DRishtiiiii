import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Eye } from 'lucide-react';
import { cn } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Patients } from './components/Patients';
import { Scanner } from './components/Scanner';
import { Advisor } from './components/Advisor';
import { MathWorksPipeline } from './components/MathWorksPipeline';
import { Login } from './components/Login';
import { DrishtiLogo } from './components/DrishtiLogo';
import { SettingsModal } from './components/SettingsModal';
import { useKeyboardNavigation } from './lib/useKeyboardNavigation';
import { Patient, Scan } from './types';

// Session expiration time: 1 hour in milliseconds
const SESSION_TIMEOUT = 60 * 60 * 1000; 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'doctor' | 'registration'>('doctor');
  const [currentView, setCurrentView] = useState('dashboard');
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activeDevices, setActiveDevices] = useState(1);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);
  
  // YouTube Style Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Mini mode for desktop/tablet
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false); // Drawer mode for phone/mobile
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // System Settings & Shortcuts modal

  // Optical Theme and Contrast States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('drishti_dark_mode');
    if (saved !== null) return saved === 'true';
    return localStorage.getItem('drishti_theme') === 'dark';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('drishti_high_contrast') === 'true';
  });

  // Handler for 3-lines menu click across all screens
  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  // Global Keyboard Navigation Hook
  const { hudFeedback } = useKeyboardNavigation({
    currentView,
    onChangeView: (view) => {
      setCurrentView(view);
      setIsMobileDrawerOpen(false);
    },
    onToggleSidebar: handleToggleSidebar,
    isShortcutsModalOpen: isSettingsModalOpen,
    onToggleShortcutsModal: () => setIsSettingsModalOpen(prev => !prev),
    onCloseModals: () => {
      setIsSettingsModalOpen(false);
      setIsMobileDrawerOpen(false);
    },
    onOpenSettings: () => setIsSettingsModalOpen(true),
    enabled: isAuthenticated,
  });
  
  // Backend state for Advisor
  const [backendPatients, setBackendPatients] = useState<Patient[]>([]);
  const [backendScans, setBackendScans] = useState<Scan[]>([]);

  // Session checking on mount
  useEffect(() => {
    const checkSession = () => {
      const auth = localStorage.getItem('drishti_auth');
      const lastActive = localStorage.getItem('drishti_last_active');
      const savedRole = localStorage.getItem('drishti_role') as 'doctor' | 'registration';

      if (auth === 'true' && lastActive) {
        const timeSinceActive = Date.now() - parseInt(lastActive, 10);
        if (timeSinceActive < SESSION_TIMEOUT) {
          // Session is valid
          setIsAuthenticated(true);
          if (savedRole) setUserRole(savedRole);
          // Update activity timestamp immediately
          localStorage.setItem('drishti_last_active', Date.now().toString());
        } else {
          // Session expired
          localStorage.removeItem('drishti_auth');
          localStorage.removeItem('drishti_last_active');
          localStorage.removeItem('drishti_role');
          setSessionExpiredMsg('Session expired due to inactivity. Please log in again.');
        }
      }
    };
    
    checkSession();
  }, []);

  // Theme synchronization
  useEffect(() => {
    localStorage.setItem('drishti_dark_mode', String(darkMode));
    localStorage.setItem('drishti_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('drishti_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('clinic-high-contrast');
    } else {
      document.documentElement.classList.remove('clinic-high-contrast');
    }
  }, [highContrast]);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('drishti_dark_mode', String(next));
      localStorage.setItem('drishti_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleToggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('drishti_high_contrast', String(next));
      if (next) {
        document.documentElement.classList.add('clinic-high-contrast');
      } else {
        document.documentElement.classList.remove('clinic-high-contrast');
      }
      return next;
    });
  };

  // Set up event listeners for user activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const updateActivity = () => {
      // Throttle localStorage writes
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        localStorage.setItem('drishti_last_active', Date.now().toString());
        timeoutId = undefined as any;
      }, 5000); // Only update once every 5 seconds at most
    };

    // Track mouse movement, clicks, and keypresses
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    // Periodically check for expiration while app is open
    const expirationInterval = setInterval(() => {
      const lastActive = localStorage.getItem('drishti_last_active');
      if (lastActive) {
        const timeSinceActive = Date.now() - parseInt(lastActive, 10);
        if (timeSinceActive > SESSION_TIMEOUT) {
          handleLogout('Session expired due to inactivity. Please log in again.');
        }
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(expirationInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Basic fetch to pass to Advisor
    fetch('/api/patients')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setBackendPatients(data);
      })
      .catch(() => {});

    fetch('/api/dashboard/scans')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setBackendScans(data);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLogin = (role: 'doctor' | 'registration') => {
    setIsAuthenticated(true);
    setUserRole(role);
    setSessionExpiredMsg(null);
    setCurrentView(role === 'doctor' ? 'dashboard' : 'new_scan');
    
    // Save session data
    localStorage.setItem('drishti_auth', 'true');
    localStorage.setItem('drishti_last_active', Date.now().toString());
    localStorage.setItem('drishti_role', role);
  };

  const handleLogout = (msg?: string) => {
    setIsAuthenticated(false);
    localStorage.removeItem('drishti_auth');
    localStorage.removeItem('drishti_last_active');
    localStorage.removeItem('drishti_role');
    if (msg) setSessionExpiredMsg(msg);
  };

  if (!isAuthenticated) {
    return (
      <div className="relative">
        {sessionExpiredMsg && (
          <div className="absolute top-4 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {sessionExpiredMsg}
            </div>
          </div>
        )}
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Top Header Bar (YouTube Style - Always visible across PC, Tablet, Phone) */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-30 shadow-2xs select-none">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleToggleSidebar} 
            title="Toggle Menu (3 Lines)"
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-colors cursor-pointer flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div 
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => setCurrentView('dashboard')}
          >
            <DrishtiLogo size="custom" className="h-11 md:h-12 w-auto object-contain drop-shadow-xs" />
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 leading-none">
                DRishtii
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 leading-tight">
                Tele-Ophthalmology AI
              </span>
            </div>
          </div>
        </div>

        {/* Right side header tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Dark Mode / Light Mode Toggle */}
          <button
            id="btn-header-theme-toggle"
            type="button"
            onClick={handleToggleDarkMode}
            title={darkMode ? "Switch to Day Light Mode" : "Switch to Low-Light Dark Room Mode (Dilated Pupil Clinic)"}
            aria-label="Toggle Optical Theme"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none active:scale-95",
              darkMode
                ? "bg-indigo-950 border-indigo-500 text-indigo-200 shadow-xs ring-1 ring-indigo-500/30 hover:bg-indigo-900"
                : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs"
            )}
          >
            {darkMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold">Dark Room</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold">Light Mode</span>
              </>
            )}
          </button>

          {/* Quick Outdoor Camp Contrast Toggle */}
          <button
            id="btn-header-outdoor-toggle"
            type="button"
            onClick={handleToggleHighContrast}
            title={highContrast ? "Disable Outdoor Camp Contrast" : "Enable Outdoor Camp High-Contrast (Sunlight Glare Rejection & 2px Ink Borders)"}
            aria-label="Toggle Outdoor Camp High-Contrast Mode"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none active:scale-95",
              highContrast
                ? "bg-amber-300 border-2 border-amber-800 text-amber-950 font-black shadow-xs ring-1 ring-amber-600/50"
                : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs"
            )}
          >
            <Sun className={cn("w-3.5 h-3.5 shrink-0", highContrast ? "text-amber-900 font-bold" : "text-amber-600")} />
            <span className="font-semibold">
              {highContrast ? "Outdoor: ON" : "Outdoor"}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>P2P Node Active</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl">
            <div className={cn("w-2 h-2 rounded-full", userRole === 'registration' ? "bg-emerald-500" : "bg-sky-500")} />
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {userRole === 'registration' ? 'Staff Priya Verma' : 'Dr. Ananya Sharma'}
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded font-mono">
              {userRole === 'registration' ? 'Desk' : 'Unit #4'}
            </span>
          </div>
        </div>
      </header>

      {/* Outdoor Camp High-Contrast Indicator Banner */}
      {highContrast && (
        <div className="bg-amber-100 border-b-2 border-amber-600 px-4 py-1.5 flex items-center justify-between text-xs text-amber-950 font-bold shrink-0 z-20">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-800 shrink-0" />
            <span>Outdoor Camp High-Contrast Mode Active • 2px Solid Ink Borders & High-Glare Sun Rejection</span>
          </div>
          <button 
            type="button"
            onClick={handleToggleHighContrast}
            className="text-[11px] underline hover:text-black cursor-pointer font-black uppercase ml-3"
          >
            Disable Outdoor Mode
          </button>
        </div>
      )}

      {/* Main Body below Top Header */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile / Tablet Drawer Backdrop Overlay */}
        {isMobileDrawerOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden animate-in fade-in" 
            onClick={() => setIsMobileDrawerOpen(false)} 
          />
        )}

        {/* Mobile / Tablet Slide-over Drawer (<1024px) */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden shadow-xl",
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar 
            currentView={currentView} 
            onChangeView={(view) => {
              setCurrentView(view);
              setIsMobileDrawerOpen(false);
            }} 
            activeDevices={activeDevices}
            onLogout={() => handleLogout()}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
            onOpenSettings={() => {
              setIsMobileDrawerOpen(false);
              setIsSettingsModalOpen(true);
            }}
            isCollapsed={false}
            userRole={userRole}
          />
        </div>

        {/* Desktop Permanent Sidebar (>=1024px) with Collapsible YouTube Style */}
        <div className="hidden lg:block shrink-0 h-full">
          <Sidebar 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            activeDevices={activeDevices}
            onLogout={() => handleLogout()}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            userRole={userRole}
          />
        </div>

        {/* Main View Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full min-h-full">
            {currentView === 'dashboard' && (
              <Dashboard 
                onNavigateToScan={(id) => { setActivePatientId(id || null); setCurrentView('new_scan'); }}
                onNavigateToAdvisor={(id) => { if (id) setActivePatientId(id); setCurrentView('advisor'); }}
                onNavigateToPatient={(id) => { setActivePatientId(id); setCurrentView('patients'); }}
              />
            )}
            {currentView === 'patients' && (
              <Patients 
                onNavigateToScan={(id) => { setActivePatientId(id); setCurrentView('new_scan'); }}
                onNavigateToAdvisor={(id) => { setActivePatientId(id); setCurrentView('advisor'); }}
                initialPatientId={activePatientId || undefined} 
              />
            )}
            {currentView === 'new_scan' && <Scanner initialPatientId={activePatientId || undefined} />}
            {currentView === 'advisor' && (
              <Advisor 
                patients={backendPatients} 
                scans={backendScans}
                initialPatientId={activePatientId || undefined}
                onNavigateToScan={(id) => { setActivePatientId(id || null); setCurrentView('new_scan'); }}
                onSelectPatient={(id) => setActivePatientId(id)}
              />
            )}
            {currentView === 'mathworks' && (
              <MathWorksPipeline 
                onNavigateToScan={(id) => { 
                  if (id) setActivePatientId(id); 
                  setCurrentView('new_scan'); 
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* System Settings & Diagnostics Modal (houses Version, Shortcuts, & Controls) */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        activeDevices={activeDevices}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        highContrast={highContrast}
        onToggleHighContrast={handleToggleHighContrast}
      />

      {/* Floating Shortcut HUD Toast */}
      {hudFeedback && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl text-xs font-medium flex items-center gap-2.5 border border-slate-700/70">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-semibold">{hudFeedback.title}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-sky-300 rounded border border-slate-700 shadow-2xs">
              {hudFeedback.keyHint}
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
}
