import React from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  Users, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { UserSession } from '../types.js';

export type ActiveTab = 
  | 'dashboard' 
  | 'missions' 
  | 'drivers' 
  | 'vehicles' 
  | 'fuel' 
  | 'accidents' 
  | 'pwa_driver';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeAlertsCount: number;
  openClaimsCount: number;
  userSession?: UserSession;
  onOpen2FA?: () => void;
  onOpenANPDP?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
  openClaimsCount,
  userSession,
  onOpen2FA,
  onOpenANPDP,
  theme = 'dark',
  onToggleTheme,
}) => {
  const getRoleLabel = () => {
    switch (userSession?.role) {
      case 'super_admin': return 'Super Admin';
      case 'fleet_manager': return 'Gestionnaire Flotte';
      case 'maintenance_lead': return 'Resp. Maintenance';
      case 'controller': return 'Contrôleur Gestion';
      case 'driver': return 'Chauffeur';
      default: return 'Gestionnaire';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (userSession?.role) {
      case 'super_admin': 
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20';
      case 'fleet_manager': 
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20';
      case 'maintenance_lead': 
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20';
      case 'controller': 
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/20';
      case 'driver': 
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20';
      default: 
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { 
      id: 'dashboard', 
      label: 'Flotte', 
      icon: <Car className="w-4 h-4" />, 
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined 
    },
    { 
      id: 'missions', 
      label: 'Missions', 
      icon: <FileText className="w-4 h-4" /> 
    },
    { 
      id: 'drivers', 
      label: 'Chauffeurs', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'vehicles', 
      label: 'Véhicules', 
      icon: <Wrench className="w-4 h-4" /> 
    },
    { 
      id: 'fuel', 
      label: 'Carburant', 
      icon: <Fuel className="w-4 h-4" /> 
    },
    { 
      id: 'accidents', 
      label: 'Sinistres', 
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: openClaimsCount > 0 ? openClaimsCount : undefined
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-[#222f47] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-sm shadow-emerald-500/25 text-white font-black text-base tracking-wider">
              DZ
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Dz-Fleet
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 dark:bg-[#121929] p-1 rounded-xl border border-slate-200/80 dark:border-[#222f47]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'bg-white dark:bg-[#1c273e] text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-[#1c273e]/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white leading-tight">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* PWA Mobile quick access */}
            <button
              onClick={() => setActiveTab('pwa_driver')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pwa_driver'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Ouvrir l'application conducteur PWA"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PWA Chauffeur</span>
            </button>

            {/* ANPDP Loi 18-07 Badge */}
            {onOpenANPDP && (
              <button
                type="button"
                onClick={onOpenANPDP}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#121929] hover:bg-slate-200 dark:hover:bg-[#1c273e] border border-slate-200 dark:border-[#222f47] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Consulter l'attestation de conformité ANPDP Loi 18-07"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Loi 18-07</span>
              </button>
            )}

            {/* Day / Night Theme Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#121929] hover:bg-slate-200 dark:hover:bg-[#1c273e] border border-slate-200 dark:border-[#222f47] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Passer en Mode Jour' : 'Passer en Mode Nuit'}
                aria-label="Basculer le thème"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Role & 2FA modal trigger */}
            {onOpen2FA && (
              <button
                type="button"
                onClick={onOpen2FA}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${getRoleBadgeStyle()}`}
                title="Changer de rôle RBAC ou tester l'A2F"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="hidden sm:inline">{getRoleLabel()}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200/90 dark:border-[#222f47] py-2 bg-white/95 dark:bg-[#0c121e]/95 px-2 overflow-x-auto gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setActiveTab('pwa_driver')}
          className={`px-2 py-1 text-xs rounded-lg whitespace-nowrap font-bold flex items-center gap-1 ${
            activeTab === 'pwa_driver' 
              ? 'bg-emerald-600 text-white' 
              : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> PWA
        </button>
      </div>
    </header>
  );
};
