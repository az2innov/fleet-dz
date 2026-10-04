import React from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  MessageSquare, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  FileText,
  Users,
  Lock,
  KeyRound
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
  openClaimsCount,
  userSession,
  onOpen2FA,
  onOpenANPDP,
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
      case 'super_admin': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'fleet_manager': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'maintenance_lead': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'controller': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'driver': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl tracking-wider cursor-pointer"
            >
              DZ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  onClick={() => setActiveTab('dashboard')}
                  className="text-lg font-bold tracking-tight text-white cursor-pointer"
                >
                  Dz-Fleet
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> IA Souveraine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestion de Flotte Automobile & Mobilité • Algérie
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Car className="w-4 h-4 text-emerald-400" />
              Vue Flotte
              {activeAlertsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'missions'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Missions (OM)
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'drivers'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              Chauffeurs
            </button>

            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'vehicles'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wrench className="w-4 h-4 text-indigo-400" />
              Véhicules
            </button>

            <button
              onClick={() => setActiveTab('fuel')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'fuel'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Fuel className="w-4 h-4 text-amber-400" />
              Carburant (DA)
            </button>

            <button
              onClick={() => setActiveTab('accidents')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'accidents'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Sinistres
              {openClaimsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {openClaimsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pwa_driver')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                activeTab === 'pwa_driver'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>PWA Conducteur</span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Loi 18-07
              </span>
            </button>

          </nav>

          {/* Right side: ANPDP + RBAC / 2FA status */}
          <div className="flex items-center space-x-2">
            {onOpenANPDP && (
              <button
                type="button"
                onClick={onOpenANPDP}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-950 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 transition-colors cursor-pointer"
                title="Consulter l'attestation de conformité ANPDP Loi 18-07"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Loi 18-07</span>
              </button>
            )}

            {onOpen2FA && (
              <button
                type="button"
                onClick={onOpen2FA}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${getRoleBadgeStyle()}`}
                title="Changer de rôle RBAC ou tester l'A2F (TOTP)"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{getRoleLabel()}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800 py-2 bg-slate-950/90 px-2 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Flotte
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === 'missions' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Missions
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === 'drivers' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400'}`}
        >
          Chauffeurs
        </button>
        <button
          onClick={() => setActiveTab('pwa_driver')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap flex items-center gap-1 ${activeTab === 'pwa_driver' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'}`}
        >
          <Smartphone className="w-3 h-3" /> PWA
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === 'vehicles' ? 'bg-slate-800 text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Véhicules
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === 'fuel' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'}`}
        >
          Carburant
        </button>
        <button
          onClick={() => setActiveTab('accidents')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === 'accidents' ? 'bg-slate-800 text-orange-400 font-semibold' : 'text-slate-400'}`}
        >
          Sinistres
        </button>
      </div>
    </header>
  );
};
