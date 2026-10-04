import React from 'react';
import { 
  Car, 
  Fuel, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert, 
  FileText, 
  Smartphone, 
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Vehicle, FleetAlert, FuelLog, AccidentClaim, SovereignActivityLog, MissionOrder } from '../types.js';

interface FleetDashboardProps {
  vehicles: Vehicle[];
  alerts: FleetAlert[];
  fuelLogs: FuelLog[];
  accidentClaims: AccidentClaim[];
  activityLogs?: SovereignActivityLog[];
  missions?: MissionOrder[];
  onResolveAlert: (alertId: string) => void;
  onNavigateTab: (tab: any) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpen2FA?: () => void;
  onOpenANPDP?: () => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  vehicles,
  alerts,
  fuelLogs,
  accidentClaims,
  missions = [],
  onResolveAlert,
  onNavigateTab,
  onSelectVehicle,
}) => {
  const totalFuelDZD = fuelLogs.reduce((acc, log) => acc + log.amountDZD, 0);
  const totalLiters = fuelLogs.reduce((acc, log) => acc + log.liters, 0);
  const activeAlerts = alerts.filter(a => !a.resolved);
  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const openClaims = accidentClaims.filter(c => c.status !== 'settled');
  
  // Executive Financial & Operational KPIs
  const totalFleetKm = vehicles.reduce((acc, v) => acc + v.mileage, 0);
  const availabilityRate = vehicles.length > 0 ? Math.round((activeVehicles.length / vehicles.length) * 100) : 100;
  const estimatedCO2Kg = Math.round(totalLiters * 2.65);
  const activeMissionsCount = missions.filter(m => m.status === 'in_progress' || m.status === 'approved').length;
  const overconsumptionLogs = fuelLogs.filter(f => f.isOverconsumption);

  // Recent fuel entries & activity logs
  const recentFuelEntries = fuelLogs.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header : Épuré, Moderne & Aéré */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Datacenter National • Loi 18-07 ANPDP
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dinar Algérien (DA)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Supervision du parc automobile, ravitaillements Naftal et ordres de mission réglementaires.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigateTab('missions')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>+ Ordre de Mission</span>
          </button>
          <button
            onClick={() => onNavigateTab('pwa_driver')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA Chauffeur</span>
          </button>
        </div>
      </div>

      {/* 4 Cartes KPI Exécutives : Design moderne & contrasté */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Disponibilité */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset] hover:dark:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Disponibilité Parc
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {availabilityRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-300">
                ({activeVehicles.length}/{vehicles.length} en service)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${availabilityRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2 : Carburant Naftal */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset] hover:dark:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Dépenses Naftal
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {totalFuelDZD.toLocaleString('fr-DZ')}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">DA</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
              Volume : <strong className="text-slate-800 dark:text-white font-semibold">{totalLiters.toLocaleString('fr-DZ')} L</strong> (Gasoil / Essence)
            </p>
          </div>
        </div>

        {/* KPI 3 : Kilométrage & CO2 */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset] hover:dark:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Kilométrage Flotte
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {totalFleetKm.toLocaleString('fr-DZ')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-300">km total</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
              CO₂ estimé : <strong className="text-sky-600 dark:text-sky-300 font-bold">{(estimatedCO2Kg / 1000).toFixed(2)} tonnes</strong>
            </p>
          </div>
        </div>

        {/* KPI 4 : Missions Actives */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset] hover:dark:border-slate-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Missions Réglementaires
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeMissionsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-300">ordres en cours</span>
            </div>
            <button 
              onClick={() => onNavigateTab('missions')} 
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold mt-2 block"
            >
              Voir les ordres de mission →
            </button>
          </div>
        </div>
      </div>

      {/* Mini-Bandeau de Statut Opérationnel (Aéré et discret) */}
      <div className="bg-slate-100/90 dark:bg-[#121929] rounded-xl p-3.5 border border-slate-200/80 dark:border-[#222f47] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Échéances à traiter : <strong className="text-slate-900 dark:text-white font-bold">{activeAlerts.length}</strong></span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
            <span>Sinistres en cours : <strong className="text-slate-900 dark:text-white font-bold">{openClaims.length}</strong></span>
          </span>
          {overconsumptionLogs.length > 0 && (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Surconsommation détectée : {overconsumptionLogs.length} véhicule(s)</span>
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Chiffrement souverain TLS 1.3 / AES-256
        </div>
      </div>

      {/* Grille Deux Colonnes : Alertes Flotte & Ravitaillements PWA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Colonne Gauche : Alertes & Entretiens */}
        <div className="lg:col-span-6 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Alertes & Échéances Prioritaires</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Assurance, contrôle technique, vidange</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1c273e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {activeAlerts.length} active(s)
            </span>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                Toutes les alertes sont traitées. Flotte à jour !
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.severity === 'high'
                      ? 'bg-rose-50/70 dark:bg-[#1e1420] border-rose-200/90 dark:border-rose-500/40 hover:dark:border-rose-400/60'
                      : 'bg-amber-50/70 dark:bg-[#201b14] border-amber-200/90 dark:border-amber-500/40 hover:dark:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-[#2a1d2e] border border-slate-200 dark:border-rose-500/30 text-slate-900 dark:text-rose-200 font-mono">
                          {alert.vehiclePlate}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-0.5">
                        <span>Échéance : <strong className="text-slate-700 dark:text-slate-200">{alert.dueDate || 'Immédiat'}</strong></span>
                        <span>•</span>
                        <span>Action : <strong className="text-slate-700 dark:text-slate-200">{alert.actionRequired}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-3 py-1.5 bg-white dark:bg-[#242f48] hover:bg-slate-100 dark:hover:bg-[#2e3b5a] text-slate-700 dark:text-white rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 whitespace-nowrap cursor-pointer transition-colors shrink-0 shadow-xs"
                    >
                      Résolu ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Colonne Droite : Ravitaillements Carburant Validés PWA */}
        <div className="lg:col-span-6 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Derniers Pleins Validés (PWA)</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Reçus Naftal scannés & saisies chauffeurs</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('fuel')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Voir tout ({fuelLogs.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentFuelEntries.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{log.driverName}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a253e] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {log.vehiclePlate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{log.stationName} • {log.liters} L</span>
                      {log.gpsCoordinates && (
                        <span className="text-[10px] font-mono text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1 rounded inline-flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          GPS {log.gpsCoordinates.latitude.toFixed(2)}°, {log.gpsCoordinates.longitude.toFixed(2)}°
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs md:text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    +{log.amountDZD.toLocaleString('fr-DZ')} DA
                  </div>
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded bg-slate-200/80 dark:bg-[#1a253e] text-slate-700 dark:text-slate-300 mt-0.5">
                    {log.source === 'pwa_scan' ? 'Scan OCR PWA' : log.source === 'pwa_manual' ? 'PWA Direct' : 'Manuel'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* État Actuel du Parc Flotte (Tableau Moderne & Aéré) */}
      <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">État Global du Parc Automobile</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Kilométrage en direct, statut d'affectation et révisions</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('vehicles')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Fiches complètes ({vehicles.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0c121e] text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-[#222f47]">
              <tr>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Matricule (Wilaya)</th>
                <th className="py-3 px-4">Chauffeur Assigné</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Odomètre</th>
                <th className="py-3 px-4">Prochaine Révision</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
              {vehicles.map((v) => {
                const isOverdue = v.mileage >= v.nextServiceKm;
                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {v.make} {v.model}
                      <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">Année {v.year} • {v.fuelType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {v.plate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-900 dark:text-slate-200 font-semibold">{v.driverName}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">{v.driverPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        v.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : v.status === 'maintenance'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {v.status === 'active' ? 'En Service' : v.status === 'maintenance' ? 'En Révision' : 'En Sinistre'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {v.mileage.toLocaleString('fr-DZ')} km
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                        {v.nextServiceKm.toLocaleString('fr-DZ')} km
                      </span>
                      {isOverdue && (
                        <span className="block text-[9px] text-rose-600 dark:text-rose-400 font-sans font-bold">Vidange Dépassée !</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectVehicle(v)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white bg-slate-100 dark:bg-[#1c273e] hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
