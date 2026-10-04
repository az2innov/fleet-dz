import React from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  FileText, 
  MessageSquareQuote,
  Sparkles,
  Zap,
  Smartphone,
  ShieldCheck,
  MapPin
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
  activityLogs = [],
  missions = [],
  onResolveAlert,
  onNavigateTab,
  onSelectVehicle,
  onOpen2FA,
  onOpenANPDP,
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & System State Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Système Opérationnel • Algérie
              </span>
              <span className="text-xs text-slate-400">
                Monnaie : Dinar Algérien (DA)
              </span>
              <button
                onClick={onOpenANPDP}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer"
              >
                Certificat Loi 18-07
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Tableau de Bord Exécutif & Flotte Souveraine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Supervision unifiée : géolocalisation ANPDP, gestion du parc, affectation des missions réglementaires et suivi des coûts en Dinars Algériens.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('pwa_driver')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer border border-emerald-400/40"
            >
              <Smartphone className="w-4 h-4" />
              PWA Conducteur
            </button>
            <button
              onClick={() => onNavigateTab('missions')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Ordres de Mission
            </button>
            {onOpen2FA && (
              <button
                onClick={onOpen2FA}
                className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs md:text-sm font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Changer de rôle RBAC ou tester A2F"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Sécurité A2F
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics (6 Cards Executive Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Total Fleet & Availability */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Disponibilité du Parc</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white tracking-tight">{availabilityRate}%</span>
              <span className="text-xs text-slate-400">({activeVehicles.length} / {vehicles.length} actifs)</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Véhicules opérationnels prêts à rouler
            </p>
          </div>
        </div>

        {/* Metric 2: Fuel Expenses in DZD */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dépenses Carburant Naftal</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight font-mono">
                {totalFuelDZD.toLocaleString('fr-DZ')}
              </span>
              <span className="text-xs font-bold text-amber-400">DA</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Volume total : <strong className="text-slate-200">{totalLiters.toLocaleString('fr-DZ')} L</strong> (Gasoil / Sans Plomb)
            </p>
          </div>
        </div>

        {/* Metric 3: Total Kilometres & CO2 Emissions */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kilométrage & Impact CO₂</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight font-mono">
                {totalFleetKm.toLocaleString('fr-DZ')}
              </span>
              <span className="text-xs text-slate-400">km total</span>
            </div>
            <p className="text-xs text-sky-300 mt-1">
              Émissions estimées : <strong className="font-mono">{(estimatedCO2Kg / 1000).toFixed(2)} t CO₂</strong> ({estimatedCO2Kg.toLocaleString('fr-DZ')} kg)
            </p>
          </div>
        </div>

        {/* Metric 4: Active Mission Orders */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ordres de Mission Actifs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white tracking-tight">{activeMissionsCount}</span>
              <span className="text-xs text-slate-400">en cours de trajet</span>
            </div>
            <p className="text-xs text-indigo-300 mt-1 cursor-pointer hover:underline" onClick={() => onNavigateTab('missions')}>
              Gendarmerie & DGSN conformes →
            </p>
          </div>
        </div>

        {/* Metric 5: Active Maintenance Alerts */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Alertes Échéances</span>
            <div className={`p-2 rounded-xl ${activeAlerts.length > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white tracking-tight">{activeAlerts.length}</span>
              <span className="text-xs text-slate-400">à traiter</span>
            </div>
            <p className="text-xs text-rose-400 mt-1">
              {activeAlerts.length > 0 ? 'Vidange, visite médicale ou CT' : 'Aucune alerte critique'}
            </p>
          </div>
        </div>

        {/* Metric 6: Open Claims & Surconsommation */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sinistres & Anomalies</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white tracking-tight">{openClaims.length}</span>
              <span className="text-xs text-slate-400">sinistres</span>
              {overconsumptionLogs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {overconsumptionLogs.length} surconsommation(s)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Transmis aux assurances conventionnées (CAAT/SAA)
            </p>
          </div>
        </div>
      </div>

      {/* Sovereign PWA Banner for Public Entities & Algerian Enterprises */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Alternative Souveraine : PWA Conducteur (Sans Dépendance Meta)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Loi 18-07 ANPDP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Conçue spécialement pour les établissements publics et entreprises algériennes : fonctionne 100% hors-ligne dans les zones blanches routières, stocke les tickets Naftal localement, ne nécessite aucun compte Meta/Facebook, et garantit que les données de la flotte restent sur le territoire national.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('pwa_driver')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-2 shadow-sm transition-all"
        >
          <Smartphone className="w-4 h-4" />
          Ouvrir la PWA Conducteur
        </button>
      </div>

      {/* Grid: Active Alerts & Sovereign PWA Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alerts requiring manager attention */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Alertes Flotte & Entretiens</h2>
            </div>
            <span className="text-xs text-slate-400">Gestion par exception</span>
          </div>

          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                Toutes les alertes sont résolues. Flotte à jour !
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    alert.severity === 'high'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-white font-mono">
                          {alert.vehiclePlate}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200">{alert.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                        <span>Échéance : <strong className="text-slate-200">{alert.dueDate || 'Immédiat'}</strong></span>
                        <span>Action : <strong className="text-slate-300">{alert.actionRequired}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Résolu ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Real-time Fuel Declarations via Sovereign PWA */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Derniers Pleins Validés (PWA Souveraine)</h2>
            </div>
            <button
              onClick={() => onNavigateTab('fuel')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              Voir tout ({fuelLogs.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentFuelEntries.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{log.driverName}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1 rounded border border-slate-800">
                        {log.vehiclePlate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{log.stationName} • {log.liters} L @ {log.pricePerLiterDZD} DA/L</span>
                      {log.gpsCoordinates && (
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-1.5 py-0.2 rounded border border-sky-800/50 inline-flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          GPS {log.gpsCoordinates.latitude.toFixed(3)}°, {log.gpsCoordinates.longitude.toFixed(3)}°
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    +{log.amountDZD.toLocaleString('fr-DZ')} DA
                  </div>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mt-0.5">
                    {log.source === 'pwa_scan' ? 'Scan OCR PWA' : log.source === 'pwa_manual' ? 'PWA Direct' : 'Manuel'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Vehicles Status Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">État Actuel de la Flotte Entreprise</h2>
          </div>
          <button
            onClick={() => onNavigateTab('vehicles')}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            Fiches complètes ({vehicles.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Matricule (Wilaya)</th>
                <th className="py-3 px-4">Chauffeur assigné</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Odomètre</th>
                <th className="py-3 px-4">Prochaine Révision</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vehicles.map((v) => {
                const isOverdue = v.mileage >= v.nextServiceKm;
                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {v.make} {v.model}
                      <span className="block text-[10px] font-normal text-slate-400">Année {v.year} • {v.fuelType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                      {v.plate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 font-medium">{v.driverName}</span>
                      <span className="block text-[10px] text-slate-500">{v.driverPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        v.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : v.status === 'maintenance'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {v.status === 'active' ? 'En Service' : v.status === 'maintenance' ? 'En Révision' : 'En Sinistre'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {v.mileage.toLocaleString('fr-DZ')} km
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {v.nextServiceKm.toLocaleString('fr-DZ')} km
                      </span>
                      {isOverdue && (
                        <span className="block text-[9px] text-rose-400 font-sans font-bold">Vidange Dépassée !</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectVehicle(v)}
                        className="px-2.5 py-1 text-xs font-medium text-sky-400 hover:text-white bg-slate-800 hover:bg-sky-600 rounded-lg transition-colors cursor-pointer"
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
