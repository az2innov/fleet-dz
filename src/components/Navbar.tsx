import React, { useState } from 'react';
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
  Sparkles,
  LogOut,
  TrendingUp,
  Key,
  Building2,
  ChevronDown,
  Check
} from 'lucide-react';
import { UserSession, Tenant } from '../types.js';

export type ActiveTab = 
  | 'root_backoffice'
  | 'dashboard' 
  | 'missions' 
  | 'drivers' 
  | 'vehicles' 
  | 'interventions'
  | 'fuel' 
  | 'accidents' 
  | 'pwa_driver';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeAlertsCount: number;
  openClaimsCount: number;
  userSession?: UserSession;
  currentTenant?: Tenant | null;
  tenantsList?: Tenant[];
  onSwitchTenant?: (tenantId: string) => void;
  onOpen2FA?: () => void;
  onOpenANPDP?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
  openClaimsCount,
  userSession,
  currentTenant,
  tenantsList = [],
  onSwitchTenant,
  onOpen2FA,
  onOpenANPDP,
  theme = 'dark',
  onToggleTheme,
  onLogout,
}) => {
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const isRoot = userSession?.isRoot === true || userSession?.role === 'root';

  const getRoleLabel = () => {
    switch (userSession?.role) {
      case 'root': return '👑 Root Plateforme';
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
      case 'root':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20';
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

  const getNavItems = (): { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] => {
    switch (userSession?.role) {
      case 'root':
        return [
          { id: 'root_backoffice', label: '👑 Back Office Root', icon: <Building2 className="w-4 h-4" /> },
          { id: 'dashboard', label: 'Supervision Flotte', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'vehicles', label: 'Parc Véhicules', icon: <Car className="w-4 h-4" /> },
          { id: 'drivers', label: 'Conducteurs', icon: <Users className="w-4 h-4" /> },
          { id: 'interventions', label: 'Interventions', icon: <Wrench className="w-4 h-4" /> },
          { id: 'fuel', label: 'Carburant', icon: <Fuel className="w-4 h-4" /> },
        ];
      case 'super_admin':
        return [
          { id: 'dashboard', label: 'Sécurité & Audit DSI', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'vehicles', label: 'Audit Parc', icon: <Car className="w-4 h-4" /> },
          { id: 'drivers', label: 'Audit Chauffeurs', icon: <Users className="w-4 h-4" /> },
          { id: 'missions', label: 'Audit Missions', icon: <FileText className="w-4 h-4" /> },
          { id: 'interventions', label: 'Audit Interventions', icon: <Wrench className="w-4 h-4" /> },
          { id: 'fuel', label: 'Audit Carburant', icon: <Fuel className="w-4 h-4" /> },
        ];
      case 'fleet_manager':
        return [
          { id: 'dashboard', label: 'Flotte & Opérations', icon: <Car className="w-4 h-4" /> },
          { id: 'missions', label: 'Ordres de Mission', icon: <FileText className="w-4 h-4" /> },
          { id: 'drivers', label: 'Chauffeurs & QR', icon: <Users className="w-4 h-4" /> },
          { id: 'vehicles', label: 'Parc Véhicules', icon: <Car className="w-4 h-4" /> },
          { id: 'interventions', label: 'Interventions (DI/FR)', icon: <Wrench className="w-4 h-4" /> },
          { id: 'accidents', label: 'Sinistres', icon: <AlertTriangle className="w-4 h-4" />, badge: openClaimsCount > 0 ? openClaimsCount : undefined },
          { id: 'fuel', label: 'Carburant Naftal', icon: <Fuel className="w-4 h-4" /> },
        ];
      case 'maintenance_lead':
        return [
          { id: 'dashboard', label: 'Maintenance & Vidanges', icon: <Wrench className="w-4 h-4" />, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
          { id: 'vehicles', label: 'Santé Parc & Pneus', icon: <Car className="w-4 h-4" /> },
          { id: 'interventions', label: 'Interventions & Réceptions', icon: <Wrench className="w-4 h-4" /> },
          { id: 'accidents', label: 'Dégâts & Réparations', icon: <AlertTriangle className="w-4 h-4" />, badge: openClaimsCount > 0 ? openClaimsCount : undefined },
          { id: 'fuel', label: 'Relevés Odomètre', icon: <Fuel className="w-4 h-4" /> },
        ];
      case 'controller':
        return [
          { id: 'dashboard', label: 'Contrôle Financier (DA)', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'fuel', label: 'Audit Carburant Naftal', icon: <Fuel className="w-4 h-4" /> },
          { id: 'missions', label: 'Budgets & Per Diem', icon: <FileText className="w-4 h-4" /> },
          { id: 'interventions', label: 'Coûts Interventions (DA)', icon: <Wrench className="w-4 h-4" /> },
          { id: 'vehicles', label: 'Parc Automobile', icon: <Car className="w-4 h-4" /> },
          { id: 'accidents', label: 'Dépenses Sinistres', icon: <AlertTriangle className="w-4 h-4" /> },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Flotte', icon: <Car className="w-4 h-4" />, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
          { id: 'missions', label: 'Missions', icon: <FileText className="w-4 h-4" /> },
          { id: 'drivers', label: 'Chauffeurs', icon: <Users className="w-4 h-4" /> },
          { id: 'vehicles', label: 'Véhicules', icon: <Car className="w-4 h-4" /> },
          { id: 'interventions', label: 'Interventions', icon: <Wrench className="w-4 h-4" /> },
          { id: 'fuel', label: 'Carburant', icon: <Fuel className="w-4 h-4" /> },
          { id: 'accidents', label: 'Sinistres', icon: <AlertTriangle className="w-4 h-4" />, badge: openClaimsCount > 0 ? openClaimsCount : undefined },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-[#222f47] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
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

            {/* Compte Organisation Souverain : Badge Statique Dédié pour Collaborateurs (Isolation Totale ANPDP) */}
            {!isRoot ? (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] text-xs font-bold text-slate-800 dark:text-slate-100 select-none shadow-2xs"
                title={`Organisation active : ${currentTenant?.name || userSession?.tenantName || 'Entreprise'}`}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold max-w-[130px] sm:max-w-[190px] xl:max-w-[240px] truncate leading-tight text-slate-900 dark:text-white">
                    {(currentTenant?.id === userSession?.tenantId ? currentTenant?.name : userSession?.tenantName) || currentTenant?.name || 'Entreprise'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight flex items-center gap-1">
                    <span className="font-mono font-bold tracking-wider">
                      {(currentTenant?.id === userSession?.tenantId ? currentTenant?.tenantCode : null) || 
                       (userSession?.tenantId === 'tenant-cevital' ? 'CEVITAL-001' : 
                        userSession?.tenantId === 'tenant-cosider' ? 'COSIDER-001' : 
                        currentTenant?.tenantCode || 'ORGANISATION')}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      {(currentTenant?.id === userSession?.tenantId ? currentTenant?.wilaya?.split(' ')[0] : null) || 
                       (userSession?.tenantId === 'tenant-cevital' ? '06' : 
                        userSession?.tenantId === 'tenant-cosider' ? '16' : 
                        currentTenant?.wilaya?.split(' ')[0] || '')}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              /* Sélecteur de Compte Entreprise Multi-Tenant RÉSERVÉ AU ROOT */
              tenantsList && tenantsList.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 border border-purple-500/30 text-xs font-bold text-purple-900 dark:text-purple-200 transition-all cursor-pointer shadow-2xs group"
                    title="Changer de Compte Entreprise (Supervision Root)"
                    data-testid="tenant-switcher-btn"
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold max-w-[130px] sm:max-w-[190px] xl:max-w-[240px] truncate leading-tight">
                        {currentTenant?.name || 'Entreprise'}
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold leading-tight flex items-center gap-1">
                        <span>Root Plateforme</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="font-mono">{currentTenant?.tenantCode}</span>
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-purple-400 ml-1 transition-transform duration-200 ${isTenantMenuOpen ? 'rotate-180 text-purple-500' : 'group-hover:text-purple-600'}`} />
                  </button>

                  {isTenantMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTenantMenuOpen(false)} />
                      <div className="absolute left-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1.5 bg-slate-50/50 dark:bg-[#172033]/50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-purple-500" />
                              Supervision Root (Tenants)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                              Accès Root
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Basculez entre les espaces partitionnés des différentes organisations hébergées.
                          </p>
                        </div>

                        <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                          {tenantsList.map((t) => {
                            const isSelected = t.id === currentTenant?.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  onSwitchTenant?.(t.id);
                                  setIsTenantMenuOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-500/40 text-purple-950 dark:text-purple-100 shadow-2xs'
                                    : 'hover:bg-slate-100/80 dark:hover:bg-[#192337] border border-transparent text-slate-700 dark:text-slate-300'
                                }`}
                                data-testid={`tenant-option-${t.slug}`}
                              >
                                <div className={`w-8 h-8 rounded-lg mt-0.5 flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-600 text-white font-bold' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="font-extrabold truncate text-slate-900 dark:text-white">
                                      {t.name}
                                    </div>
                                    <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 px-1 rounded bg-purple-100 dark:bg-purple-950">
                                      {t.tenantCode}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                                    {t.companyType}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            )}
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
            
            {/* PWA Mobile quick access - Réservé exclusivement au Super Admin et Gestionnaire de Flotte */}
            {(userSession?.role === 'super_admin' || userSession?.role === 'fleet_manager') && (
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
            )}

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

            {/* Bouton direct pour Fermer la session (Déconnexion) */}
            {onLogout && userSession?.twoFactorVerified && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Fermer la session (Déconnexion)"
                aria-label="Fermer la session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
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
        {(userSession?.role === 'super_admin' || userSession?.role === 'fleet_manager') && (
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
        )}
        {onLogout && userSession?.twoFactorVerified && (
          <button
            type="button"
            onClick={onLogout}
            className="px-2 py-1 text-xs rounded-lg whitespace-nowrap font-bold flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 shrink-0"
            title="Fermer la session (Déconnexion)"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        )}
      </div>
    </header>
  );
};
