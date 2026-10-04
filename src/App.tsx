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
    email: 'amine.benzerga@dzfleet.dz',
    role: 'super_admin',
    twoFactorEnabled: true,
    twoFactorVerified: true,
    department: 'Direction des Systèmes d\'Information (DSI)',
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-base font-bold">Initialisation de Dz-Fleet AI...</h2>
        <p className="text-xs text-slate-400 mt-1">Plateforme souveraine & gestion de parc automobile (Algérie)</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={activeAlertsCount}
        openClaimsCount={openClaimsCount}
        userSession={userSession}
        onOpen2FA={() => setIs2FAModalOpen(true)}
        onOpenANPDP={() => setIsANPDPModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'pwa_driver' && (
          <div className="py-2">
            <div className="max-w-md mx-auto mb-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span><strong>Vue Chauffeur Souveraine :</strong> Compatible hors-ligne (Sahara / Autoroutes).</span>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="px-2.5 py-1 rounded-lg bg-emerald-800/40 hover:bg-emerald-800/60 text-white font-medium text-[11px]"
              >
                Retour Flotte
              </button>
            </div>
            <DriverPwaApp
              vehicles={vehicles}
              drivers={drivers}
              fuelLogs={fuelLogs}
              missions={missions}
              onRefreshData={fetchFleetData}
              onClosePwa={() => setActiveTab('dashboard')}
            />
          </div>
        )}

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
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <p>Dz-Fleet AI • Système Intégré de Gestion de Flotte Automobile & Mobilité (Algérie)</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Architecture Souveraine conforme Loi 18-07 / ANPDP • Dinars Algériens (DA) • Suivi Carburant Naftal & PWA Offline-First
        </p>
      </footer>
    </div>
  );
}
