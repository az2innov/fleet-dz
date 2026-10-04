import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.js';
import { FleetDashboard } from './components/FleetDashboard.js';
import { VehiclesList } from './components/VehiclesList.js';
import { DriversManager } from './components/DriversManager.js';
import { MissionsManager } from './components/MissionsManager.js';
import { FuelTracking } from './components/FuelTracking.js';
import { AccidentsManager } from './components/AccidentsManager.js';
import { VehicleDetailModal } from './components/VehicleDetailModal.js';
import { DriverPwaApp } from './components/DriverPwaApp.js';
import { Auth2FAModal } from './components/Auth2FAModal.js';
import { SovereignComplianceModal } from './components/SovereignComplianceModal.js';
import { 
  Vehicle, 
  Driver, 
  FuelLog, 
  MaintenanceRecord, 
  AccidentClaim, 
  FleetAlert, 
  SovereignActivityLog,
  MissionOrder,
  UserSession 
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
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [accidentClaims, setAccidentClaims] = useState<AccidentClaim[]>([]);
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);
  const [activityLogs, setActivityLogs] = useState<SovereignActivityLog[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Enterprise Security & RBAC Session State
  const [userSession, setUserSession] = useState<UserSession>({
    id: 'usr-1',
    name: 'Amine Benzerga (Super Admin)',
    email: 'admin@fleet-dz.com',
    role: 'super_admin',
    twoFactorEnabled: true,
    twoFactorVerified: true,
    department: "Direction des Systèmes d'Information (DSI)",
  });
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isANPDPModalOpen, setIsANPDPModalOpen] = useState(false);

  const fetchFleetData = async () => {
    try {
      const [vRes, dRes, mRes, misRes, fRes, aRes, altRes, actRes] = await Promise.all([
        fetch('/api/fleet/vehicles'),
        fetch('/api/fleet/drivers'),
        fetch('/api/fleet/maintenance'),
        fetch('/api/fleet/missions'),
        fetch('/api/fleet/fuel'),
        fetch('/api/fleet/accidents'),
        fetch('/api/fleet/alerts'),
        fetch('/api/fleet/activity-logs'),
      ]);

      if (vRes.ok) setVehicles(await vRes.json());
      if (dRes.ok) setDrivers(await dRes.json());
      if (mRes.ok) setMaintenanceRecords(await mRes.json());
      if (misRes.ok) setMissions(await misRes.json());
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

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(() => {
      fetchFleetData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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
    // If switched to driver, guide to driver PWA
    if (newSession.role === 'driver') {
      setActiveTab('pwa_driver');
    }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={activeAlertsCount}
        openClaimsCount={openClaimsCount}
        userSession={userSession}
        onOpen2FA={() => setIs2FAModalOpen(true)}
        onOpenANPDP={() => setIsANPDPModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">

        {activeTab === 'dashboard' && (
          <FleetDashboard
            vehicles={vehicles}
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
          />
        )}

        {activeTab === 'missions' && (
          <MissionsManager
            missions={missions}
            vehicles={vehicles}
            drivers={drivers}
            onRefreshData={fetchFleetData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'drivers' && (
          <DriversManager
            drivers={drivers}
            vehicles={vehicles}
            onRefreshData={fetchFleetData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesList
            vehicles={vehicles}
            drivers={drivers}
            onSelectVehicle={setSelectedVehicle}
            onNavigateTab={setActiveTab}
            onRefreshData={fetchFleetData}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelTracking
            fuelLogs={fuelLogs}
            vehicles={vehicles}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'accidents' && (
          <AccidentsManager
            accidentClaims={accidentClaims}
            vehicles={vehicles}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          fuelLogs={fuelLogs}
          maintenanceRecords={maintenanceRecords}
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
