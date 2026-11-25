import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.js';
import { FleetDashboard } from './components/FleetDashboard.js';
import { VehiclesList } from './components/VehiclesList.js';
import { DriversManager } from './components/DriversManager.js';
import { MissionsManager } from './components/MissionsManager.js';
import { FuelTracking } from './components/FuelTracking.js';
import { AccidentsManager } from './components/AccidentsManager.js';
import { InterventionsManager } from './components/InterventionsManager.js';
import { VehicleDetailModal } from './components/VehicleDetailModal.js';
import { DriverPwaApp } from './components/DriverPwaApp.js';
import { Auth2FAModal } from './components/Auth2FAModal.js';
import { SovereignComplianceModal } from './components/SovereignComplianceModal.js';
import { RootBackOffice } from './components/RootBackOffice.js';
import { 
  Vehicle, 
  Driver, 
  FuelLog, 
  MaintenanceRecord, 
  AccidentClaim, 
  FleetAlert, 
  SovereignActivityLog,
  MissionOrder,
  VehicleIntervention,
  UserSession,
  Tenant 
} from './types.js';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dzfleet_theme') as 'light' | 'dark' | null;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light'; // Clean, crisp, modern default
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('dzfleet_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('view=pwa') || search.includes('mode=pwa')) {
        return 'pwa_driver';
      }
    }
    return 'dashboard';
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [missions, setMissions] = useState<MissionOrder[]>([]);
  const [interventions, setInterventions] = useState<VehicleIntervention[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [accidentClaims, setAccidentClaims] = useState<AccidentClaim[]>([]);
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);
  const [activityLogs, setActivityLogs] = useState<SovereignActivityLog[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-Tenant Isolation State
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('dz_fleet_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.tenantId && parsed.tenantId !== 'platform-root') {
            return parsed.tenantId;
          }
        }
      } catch {}
      const saved = localStorage.getItem('dz_fleet_current_tenant');
      if (saved) return saved;
    }
    return 'tenant-sonatrach';
  });
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Intercepteur souverain global de fetch pour injecter x-tenant-id systématiquement
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).__dz_fetch_intercepted) {
      (window as any).__dz_fetch_intercepted = true;
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const activeT = localStorage.getItem('dz_fleet_current_tenant') || 'tenant-sonatrach';
        const headers = new Headers(init?.headers || {});
        if (!headers.has('x-tenant-id')) {
          headers.set('x-tenant-id', activeT);
        }
        return originalFetch(input, { ...init, headers });
      };
    }
  }, []);

  // Enterprise Security & RBAC Session State
  const [userSession, setUserSession] = useState<UserSession>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dz_fleet_session');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      id: 'usr-1',
      name: 'Amine Benzerga (Super Admin)',
      email: 'admin@sonatrach-dz.com',
      role: 'super_admin',
      tenantId: 'tenant-sonatrach',
      tenantName: 'Sonatrach - DP Hassi Messaoud',
      twoFactorEnabled: true,
      twoFactorVerified: true,
      department: "Direction des Systèmes d'Information (DSI Sonatrach)",
    };
  });
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isANPDPModalOpen, setIsANPDPModalOpen] = useState(false);

  // Charger la liste des Tenants selon les privilèges (Zero Discovery : uniquement le propre tenant si non-Root)
  useEffect(() => {
    const isRoot = userSession?.isRoot || userSession?.role === 'root';
    const reqHeaders: Record<string, string> = {};
    if (isRoot) {
      reqHeaders['x-user-role'] = 'root';
    }

    fetch('/api/fleet/tenants', { headers: reqHeaders })
      .then(r => r.json())
      .then((data: Tenant[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTenantsList(data);
          const activeT = localStorage.getItem('dz_fleet_current_tenant') || userSession?.tenantId || 'tenant-sonatrach';
          const match = data.find(t => t.id === activeT) || data[0];
          setCurrentTenant(match);
          setCurrentTenantId(match.id);
        }
      })
      .catch(console.error);
  }, [userSession]);

  const fetchFleetData = async (tenantIdOverride?: string) => {
    const tId = tenantIdOverride || currentTenantId || localStorage.getItem('dz_fleet_current_tenant') || 'tenant-sonatrach';
    const reqHeaders = { 'x-tenant-id': tId };

    try {
      const [vRes, dRes, mRes, misRes, itvRes, fRes, aRes, altRes, actRes] = await Promise.all([
        fetch('/api/fleet/vehicles', { headers: reqHeaders }),
        fetch('/api/fleet/drivers', { headers: reqHeaders }),
        fetch('/api/fleet/maintenance', { headers: reqHeaders }),
        fetch('/api/fleet/missions', { headers: reqHeaders }),
        fetch('/api/fleet/interventions', { headers: reqHeaders }),
        fetch('/api/fleet/fuel', { headers: reqHeaders }),
        fetch('/api/fleet/accidents', { headers: reqHeaders }),
        fetch('/api/fleet/alerts', { headers: reqHeaders }),
        fetch('/api/fleet/activity-logs', { headers: reqHeaders }),
      ]);

      if (vRes.ok) setVehicles(await vRes.json());
      if (dRes.ok) setDrivers(await dRes.json());
      if (mRes.ok) setMaintenanceRecords(await mRes.json());
      if (misRes.ok) setMissions(await misRes.json());
      if (itvRes.ok) setInterventions(await itvRes.json());
      if (fRes.ok) setFuelLogs(await fRes.json());
      if (aRes.ok) setAccidentClaims(await aRes.json());
      if (altRes.ok) setAlerts(await altRes.json());
      if (actRes.ok) setActivityLogs(await actRes.json());
    } catch (err) {
      console.error('Failed to fetch fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Basculer de Compte Entreprise (Réservé au superviseur Root ou lors d'une authentification)
  const handleSwitchTenant = async (newTenantId: string, isAuthSwitch = false) => {
    const isRoot = userSession?.isRoot || userSession?.role === 'root';
    if (!isRoot && !isAuthSwitch) {
      console.warn("Accès refusé : Seul le compte Root superviseur est habilité à inspecter ou basculer d'organisation.");
      return;
    }
    if (newTenantId === currentTenantId) return;
    setCurrentTenantId(newTenantId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dz_fleet_current_tenant', newTenantId);
    }

    const foundTenant = tenantsList.find(t => t.id === newTenantId);
    if (foundTenant) {
      setCurrentTenant(foundTenant);
    }

    // Basculer l'utilisateur sur le profil équivalent du nouveau tenant
    if (isRoot) {
      try {
        const rolesRes = await fetch('/api/auth/roles', {
          headers: { 'x-tenant-id': newTenantId }
        });
        if (rolesRes.ok) {
          const roles = await rolesRes.json();
          const targetRoleObj = roles.find((r: any) => r.role === userSession.role) || roles[0];
          if (targetRoleObj) {
            const newSession: UserSession = {
              id: `usr-${Date.now()}`,
              name: targetRoleObj.name,
              email: targetRoleObj.email,
              role: targetRoleObj.role,
              tenantId: newTenantId,
              tenantName: foundTenant?.name,
              twoFactorEnabled: true,
              twoFactorVerified: true,
              department: targetRoleObj.department,
            };
            setUserSession(newSession);
            if (typeof window !== 'undefined') {
              localStorage.setItem('dz_fleet_session', JSON.stringify(newSession));
            }
          }
        }
      } catch (e) {
        console.error('Erreur lors du basculement des rôles:', e);
      }
    }

    // Recharger toutes les données cloisonnées du nouveau tenant
    setLoading(true);
    fetchFleetData(newTenantId);
  };

  useEffect(() => {
    fetchFleetData(currentTenantId);
    const interval = setInterval(() => {
      fetchFleetData();
    }, 15000);
    return () => clearInterval(interval);
  }, [currentTenantId]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/fleet/alerts/${alertId}/resolve`, { method: 'POST' });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleUpdateSession = (newSession: UserSession) => {
    setUserSession(newSession);
    try {
      localStorage.setItem('dz_fleet_session', JSON.stringify(newSession));
    } catch {}

    // Lier immédiatement le tenant actif au tenant authentifié de l'utilisateur
    const targetTenantId = (newSession.tenantId && newSession.tenantId !== 'platform-root')
      ? newSession.tenantId
      : (localStorage.getItem('dz_fleet_current_tenant') || 'tenant-sonatrach');

    if (typeof window !== 'undefined') {
      localStorage.setItem('dz_fleet_current_tenant', targetTenantId);
    }
    setCurrentTenantId(targetTenantId);

    // Mettre à jour currentTenant et tenantsList pour le tenant connecté
    const isRoot = newSession.isRoot || newSession.role === 'root';
    const reqHeaders: Record<string, string> = {
      'x-tenant-id': targetTenantId,
    };
    if (isRoot) {
      reqHeaders['x-user-role'] = 'root';
    }

    fetch('/api/fleet/tenants', { headers: reqHeaders })
      .then(r => r.json())
      .then((data: Tenant[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTenantsList(data);
          const match = data.find(t => t.id === targetTenantId) || data[0];
          setCurrentTenant(match);
        }
      })
      .catch(console.error);

    // Recharger immédiatement la flotte et les données isolées du nouveau tenant
    setLoading(true);
    fetchFleetData(targetTenantId);

    setIs2FAModalOpen(false);
    if (newSession.role === 'root') {
      setActiveTab('root_backoffice');
    } else if (newSession.role === 'driver') {
      setActiveTab('pwa_driver');
    } else if (activeTab === 'root_backoffice') {
      setActiveTab('dashboard');
    }
  };

  // Clôture explicite de session (Déconnexion réelle)
  const handleLogout = () => {
    const unverifiedSession: UserSession = {
      id: 'usr-guest',
      name: 'Session Clôturée',
      email: 'admin@fleet-dz.com',
      role: 'super_admin',
      twoFactorEnabled: true,
      twoFactorVerified: false,
      department: 'Plateforme Verrouillée (Loi 18-07)',
    };
    setUserSession(unverifiedSession);
    try {
      localStorage.setItem('dz_fleet_session', JSON.stringify(unverifiedSession));
      localStorage.removeItem('dz_fleet_current_tenant');
      sessionStorage.clear();
    } catch {}
    setIs2FAModalOpen(true);
    console.log('[Dz-Fleet Auth] Session clôturée avec succès. Plateforme verrouillée.');
  };

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const openClaimsCount = accidentClaims.filter(c => c.status !== 'settled').length;

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center text-slate-800 dark:text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-sm">
          <div className="w-6 h-6 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Initialisation de Dz-Fleet AI...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Plateforme souveraine & gestion de parc automobile (Algérie)</p>
      </div>
    );
  }

  const isDedicatedPwa = typeof window !== 'undefined' && (
    window.location.search.includes('view=pwa') ||
    window.location.search.includes('mode=pwa') ||
    window.matchMedia('(display-mode: standalone)').matches
  );

  // If in dedicated PWA mode or standalone, render directly full-screen
  if (isDedicatedPwa || activeTab === 'pwa_driver') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <DriverPwaApp
          vehicles={vehicles}
          drivers={drivers}
          fuelLogs={fuelLogs}
          missions={missions}
          onRefreshData={fetchFleetData}
          onClosePwa={isDedicatedPwa ? undefined : () => setActiveTab('dashboard')}
        />
      </div>
    );
  }

  // Si l'utilisateur est déconnecté (twoFactorVerified === false), afficher l'écran d'accès et verrouiller la plateforme
  if (!userSession?.twoFactorVerified) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-4">
        <Auth2FAModal
          currentSession={userSession}
          isOpen={true}
          onClose={() => {}}
          onUpdateSession={handleUpdateSession}
          onLogout={handleLogout}
          isLockScreen={true}
          currentTenant={currentTenant}
          tenantsList={tenantsList}
          onSwitchTenant={handleSwitchTenant}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={activeAlertsCount}
        openClaimsCount={openClaimsCount}
        userSession={userSession}
        currentTenant={currentTenant}
        tenantsList={tenantsList}
        onSwitchTenant={handleSwitchTenant}
        onOpen2FA={() => setIs2FAModalOpen(true)}
        onOpenANPDP={() => setIsANPDPModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">

        {/* Mode Root Audit / Inspection Banner */}
        {userSession.role === 'root' && activeTab !== 'root_backoffice' && (
          <div className="mb-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-purple-500/40 shadow-lg flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg border border-purple-500/30">
                👑
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-purple-300">
                  Mode Inspection Superviseur Root
                </div>
                <div className="text-sm font-bold text-white">
                  Organisation inspectée : <span className="underline decoration-purple-400 font-extrabold">{currentTenant?.name}</span> ({currentTenant?.id})
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('root_backoffice')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              ← Retour au Back Office Root
            </button>
          </div>
        )}

        {activeTab === 'root_backoffice' && (
          <RootBackOffice
            currentTenantId={currentTenantId}
            onSwitchTenant={handleSwitchTenant}
            onNavigateTab={setActiveTab}
            onRefreshData={fetchFleetData}
          />
        )}

        {activeTab === 'dashboard' && (
          <FleetDashboard
            vehicles={vehicles}
            interventions={interventions}
            alerts={alerts}
            fuelLogs={fuelLogs}
            accidentClaims={accidentClaims}
            activityLogs={activityLogs}
            missions={missions}
            onResolveAlert={handleResolveAlert}
            onNavigateTab={setActiveTab}
            onSelectVehicle={setSelectedVehicle}
            onOpen2FA={() => setIs2FAModalOpen(true)}
            onOpenANPDP={() => setIsANPDPModalOpen(true)}
            userSession={userSession}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsManager
            missions={missions}
            vehicles={vehicles}
            drivers={drivers}
            onRefreshData={fetchFleetData}
            onNavigateTab={setActiveTab}
            userSession={userSession}
          />
        )}

        {activeTab === 'drivers' && (
          <DriversManager
            drivers={drivers}
            vehicles={vehicles}
            onRefreshData={fetchFleetData}
            onNavigateTab={setActiveTab}
            userSession={userSession}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesList
            vehicles={vehicles}
            drivers={drivers}
            onSelectVehicle={setSelectedVehicle}
            onNavigateTab={setActiveTab}
            onRefreshData={fetchFleetData}
            userSession={userSession}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelTracking
            fuelLogs={fuelLogs}
            vehicles={vehicles}
            drivers={drivers}
            onNavigateTab={setActiveTab}
            userSession={userSession}
            onRefreshData={fetchFleetData}
          />
        )}

        {activeTab === 'interventions' && (
          <InterventionsManager
            interventions={interventions}
            vehicles={vehicles}
            drivers={drivers}
            onRefreshData={fetchFleetData}
            onNavigateTab={setActiveTab}
            userSession={userSession}
          />
        )}

        {activeTab === 'accidents' && (
          <AccidentsManager
            accidentClaims={accidentClaims}
            vehicles={vehicles}
            onNavigateTab={setActiveTab}
            userSession={userSession}
            onRefreshData={fetchFleetData}
          />
        )}
      </main>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          fuelLogs={fuelLogs}
          maintenanceRecords={maintenanceRecords}
          interventions={interventions}
          onClose={() => setSelectedVehicle(null)}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* Security & 2FA / RBAC Modal */}
      <Auth2FAModal
        currentSession={userSession}
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onUpdateSession={handleUpdateSession}
        onLogout={handleLogout}
        currentTenant={currentTenant}
        tenantsList={tenantsList}
        onSwitchTenant={handleSwitchTenant}
      />

      {/* Sovereign ANPDP / Loi 18-07 Modal */}
      <SovereignComplianceModal
        isOpen={isANPDPModalOpen}
        onClose={() => setIsANPDPModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Dz-Fleet AI • Système Intégré de Gestion de Flotte Automobile & Mobilité (Algérie)</p>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          Architecture Souveraine conforme Loi 18-07 / ANPDP • Dinars Algériens (DA) • Suivi Carburant Naftal & PWA Offline-First
        </p>
      </footer>
    </div>
  );
}
