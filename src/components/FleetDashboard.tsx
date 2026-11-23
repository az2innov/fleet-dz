import React, { useState } from 'react';
import { 
  Car, 
  Fuel, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck,
  FileText, 
  Smartphone, 
  MapPin,
  Clock,
  Sparkles,
  Activity,
  Download,
  Key,
  Users,
  Wrench,
  QrCode,
  Gauge,
  Receipt,
  BarChart3,
  AlertCircle,
  Disc,
  DollarSign
} from 'lucide-react';
import { 
  Vehicle, 
  FleetAlert, 
  FuelLog, 
  AccidentClaim, 
  SovereignActivityLog, 
  MissionOrder,
  VehicleIntervention,
  UserSession 
} from '../types.js';
import { ROLES_CONFIG } from './Auth2FAModal.js';

interface FleetDashboardProps {
  vehicles: Vehicle[];
  interventions?: VehicleIntervention[];
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
  userSession?: UserSession;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  vehicles = [],
  interventions = [],
  alerts = [],
  fuelLogs = [],
  accidentClaims = [],
  activityLogs = [],
  missions = [],
  onResolveAlert,
  onNavigateTab,
  onSelectVehicle,
  onOpen2FA,
  onOpenANPDP,
  userSession,
}) => {
  const [logFilter, setLogFilter] = useState<'all' | 'security' | 'fuel' | 'odometer' | 'mission'>('all');

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeInterventions = Array.isArray(interventions) ? interventions : [];
  const safeFuelLogs = Array.isArray(fuelLogs) ? fuelLogs : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeClaims = Array.isArray(accidentClaims) ? accidentClaims : [];
  const safeActivityLogs = Array.isArray(activityLogs) ? activityLogs : [];
  const safeMissions = Array.isArray(missions) ? missions : [];

  // Coûts consolidés du Parc Automobile (Acquisition + Entretien/Interventions)
  const totalAcquisitionCostDZD = safeVehicles.reduce((acc, v) => acc + (Number(v?.acquisitionCostDZD) || 0), 0);
  const totalInterventionsFromLogs = safeInterventions.reduce((acc, i) => acc + (Number(i?.coutInterventionDZD) || 0), 0);
  const totalMaintenanceFromVehicles = safeVehicles.reduce((acc, v) => acc + (Number(v?.totalMaintenanceCostDZD) || 0), 0);
  const totalMaintenanceCostDZD = Math.max(totalInterventionsFromLogs, totalMaintenanceFromVehicles);
  const totalGlobalParkCostDZD = totalAcquisitionCostDZD + totalMaintenanceCostDZD;

  const totalFuelDZD = safeFuelLogs.reduce((acc, log) => acc + (Number(log?.amountDZD) || 0), 0);
  const totalLiters = safeFuelLogs.reduce((acc, log) => acc + (Number(log?.liters) || 0), 0);
  const activeAlerts = safeAlerts.filter(a => a && !a.resolved);
  const totalVehiclesCount = safeVehicles.length;
  const activeVehicles = safeVehicles.filter(v => v && v.status === 'active');
  const operationalCount = activeVehicles.length;
  const openClaims = safeClaims.filter(c => c && c.status !== 'settled');
  
  // Executive Financial & Operational KPIs
  const totalFleetKm = safeVehicles.reduce((acc, v) => acc + (Number(v?.mileage) || 0), 0);
  
  // 1. Taux de Disponibilité Technique du Parc (Aptitude mécanique, hors atelier ou accident)
  const availabilityRate = totalVehiclesCount > 0 ? Math.round((operationalCount / totalVehiclesCount) * 100) : 100;
  
  // 2. Taux d'Exploitation des Véhicules (Mobilisation réelle sur le terrain)
  const activeMissions = safeMissions.filter(m => m && (m.status === 'in_progress' || m.status === 'approved'));
  const deployedVehiclePlates = new Set(activeMissions.map(m => m.vehiclePlate).filter(Boolean));
  const deployedVehiclesCount = deployedVehiclePlates.size;
  const idleOperationalCount = Math.max(0, operationalCount - deployedVehiclesCount);
  
  // Taux d'exploitation opérationnel (par rapport aux véhicules opérationnels disponibles)
  const exploitationRate = operationalCount > 0 
    ? Math.round((deployedVehiclesCount / operationalCount) * 100) 
    : 0;

  // Taux d'exploitation global par rapport au parc total
  const globalExploitationRate = totalVehiclesCount > 0
    ? Math.round((deployedVehiclesCount / totalVehiclesCount) * 100)
    : 0;

  const estimatedCO2Kg = Math.round(totalLiters * 2.65);
  const activeMissionsCount = activeMissions.length;
  const overconsumptionLogs = safeFuelLogs.filter(f => f && f.isOverconsumption);
  const upcomingServicesCount = safeVehicles.filter(v => v && (v.nextServiceKm - v.mileage <= 5000)).length;

  // Export comptable CSV pour le Contrôleur de Gestion
  const handleExportAccountingCSV = () => {
    const headers = ['Date', 'Matricule', 'Chauffeur', 'Station Naftal', 'Type Carburant', 'Litres', 'Prix Unitaire (DA/L)', 'Montant Total (DA)', 'Source Saisie'];
    const rows = safeFuelLogs.map(log => [
      log.date || '',
      log.vehiclePlate || '',
      `"${log.driverName || ''}"`,
      `"${log.stationName || ''}"`,
      log.fuelType || 'Gasoil',
      log.liters || 0,
      log.pricePerLiterDZD || (log.fuelType === 'essence' ? 45.62 : log.fuelType === 'gpl' ? 9.00 : 29.01),
      log.amountDZD || 0,
      log.source === 'pwa_scan' ? 'Scan OCR PWA' : 'Saisie PWA'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dz_fleet_rapprochement_comptable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON des journaux d'audit pour le Super Admin
  const handleExportAuditLogsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(safeActivityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dz_fleet_audit_logs_loi_18_07_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Filtered activity logs for audit feed
  const filteredLogs = safeActivityLogs.filter(log => {
    if (!log) return false;
    if (logFilter === 'all') return true;
    const title = (log.title || '').toLowerCase();
    if (logFilter === 'security') return title.includes('a2f') || title.includes('connexion') || log.channel === 'internal_system';
    if (logFilter === 'fuel') return log.type === 'fuel';
    if (logFilter === 'odometer') return log.type === 'odometer';
    if (logFilter === 'mission') return log.type === 'mission';
    return true;
  });

  const recentFuelEntries = safeFuelLogs.slice(0, 5);

  const currentRole = userSession?.role || 'super_admin';

  // Rendu de l'entête spécifique à chaque profil
  const renderHeader = () => {
    switch (currentRole) {
      case 'super_admin':
        return {
          badge: '👑 Direction des Systèmes d\'Information (DSI) • Gouvernance Souveraine',
          badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
          title: 'Console de Sécurité, Gouvernance & Audit Loi 18-07',
          description: 'Surveillance des accès A2F, intégrité des logs d\'audit, chiffrement AES-256 et relais SMTP.',
          actions: (
            <>
              {onOpenANPDP && (
                <button
                  type="button"
                  onClick={onOpenANPDP}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Attestation Officielle ANPDP</span>
                </button>
              )}
              {onOpen2FA && (
                <button
                  type="button"
                  onClick={onOpen2FA}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gestion Rôles & Clés A2F</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportAuditLogsJSON}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Exporter Logs JSON</span>
              </button>
            </>
          ),
        };

      case 'fleet_manager':
        return {
          badge: '🚛 Direction Logistique & Exploitation • Opérations Flotte',
          badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
          title: 'Pilotage Opérationnel de la Flotte & Ordres de Mission',
          description: 'Affectation des chauffeurs, émission des Ordres de Mission officiels et suivi de la disponibilité du parc.',
          actions: (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('missions')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ Nouvel Ordre de Mission</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('drivers')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                <span>Générer QR Chauffeur</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('vehicles')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Car className="w-3.5 h-3.5 text-sky-500" />
                <span>Gérer Parc</span>
              </button>
            </>
          ),
        };

      case 'maintenance_lead':
        return {
          badge: '🔧 Direction Technique & Ateliers • Sécurité Mécanique',
          badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
          title: 'Supervision Technique & Maintenance Prédictive',
          description: 'Surveillance des odomètres réels, anticipation des vidanges (10 000 km), usure pneumatique et contrôles techniques.',
          actions: (
            <>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('maintenance-alerts-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{activeAlerts.length} Alertes d'Atelier</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('vehicles')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Carnet d'Entretien</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('accidents')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>Dégâts & Réparations</span>
              </button>
            </>
          ),
        };

      case 'controller':
        return {
          badge: '📊 Direction Financière & Contrôle de Gestion • Dinars Algériens (DA)',
          badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
          title: 'Contrôle Financier, Audit Carburant Naftal & Rentabilité',
          description: 'Audit analytique des dépenses carburant aux barèmes officiels Naftal, détection des surconsommations et rapprochement comptable.',
          actions: (
            <>
              <button
                type="button"
                onClick={handleExportAccountingCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Rapprochement (CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('fuel')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>Barèmes Naftal</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('missions')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-sky-500" />
                <span>Frais Missions (Per Diem)</span>
              </button>
            </>
          ),
        };

      default:
        return {
          badge: '🇩🇿 Datacenter National • Loi 18-07 ANPDP',
          badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
          title: 'Tableau de Bord Exécutif',
          description: 'Supervision du parc automobile, ravitaillements Naftal et ordres de mission réglementaires.',
          actions: (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('missions')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>+ Ordre de Mission</span>
              </button>
              {(currentRole === 'super_admin' || currentRole === 'fleet_manager') && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('pwa_driver')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>PWA Chauffeur</span>
                </button>
              )}
            </>
          ),
        };
    }
  };

  const headerInfo = renderHeader();

  // Rendu des 4 Cartes KPI spécifiques à chaque profil
  const renderKpiCards = () => {
    if (currentRole === 'super_admin') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-[#121929] border border-emerald-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Coût Global Parc (TCO)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {totalGlobalParkCostDZD.toLocaleString('fr-DZ')} <span className="text-xs text-emerald-600">DA</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Acquis: {(totalAcquisitionCostDZD / 1000000).toFixed(1)}M DA • Entretien: {totalMaintenanceCostDZD.toLocaleString('fr-DZ')} DA
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Conformité Loi 18-07</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Conforme</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hébergement Datacenter National (Algérie)</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Comptes & Rôles RBAC</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white">5 Profils Actifs</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Principe du moindre privilège appliqué</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Passerelle SMTP & Clé</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">A2F / 999999</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Codes à 6 chiffres par email réels</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Audit Souverain</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{safeActivityLogs.length} Événements</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Traçabilité immuable TLS 1.3 / AES-256</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentRole === 'maintenance_lead') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Alertes Mécaniques</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{activeAlerts.length} Prioritaires</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vidanges dépassées & contrôles techniques</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Véhicules Immobilisés</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {safeVehicles.filter(v => v.status === 'maintenance' || v.status === 'accident').length} en Atelier
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hyundai H100 & Renault Symbol</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Révisions Approchantes</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{upcomingServicesCount} Véhicules</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Échéance &lt; 5 000 km (Palier 10 000)</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Santé Pneumatiques</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Disc className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">88% Bon État</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">4 roues surveillées par véhicule</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentRole === 'controller') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* CARTE 1 : Coût Global du Parc Automobile (TCO) */}
          <div className="bg-white dark:bg-[#121929] border border-emerald-300/80 dark:border-emerald-500/30 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Coût Global Parc (TCO)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {totalGlobalParkCostDZD.toLocaleString('fr-DZ')} <span className="text-xs text-emerald-600">DA</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Acquis: {(totalAcquisitionCostDZD / 1000000).toFixed(1)}M DA • Entretien: {totalMaintenanceCostDZD.toLocaleString('fr-DZ')} DA
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Dépenses Carburant</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Fuel className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {totalFuelDZD.toLocaleString('fr-DZ')} <span className="text-xs text-emerald-600 dark:text-emerald-400">DA</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Volume consolidé : {totalLiters} L Naftal</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Surconsommation Détectée</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">+4 200 DA</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Hilux +36% au-dessus norme constructeur</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Coût Moyen / km</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {(totalFuelDZD / Math.max(totalFleetKm, 1) * 100).toFixed(2)} <span className="text-xs text-sky-600 dark:text-sky-400">DA/100km</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Indice de performance de la flotte</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Frais de Route (Per Diem)</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">18 500 DA</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Péages autoroutiers & per diem déclarés</p>
            </div>
          </div>
        </div>
      );
    }

    // Vue par défaut : Gestionnaire de Flotte (Operations)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* CARTE 1 : Disponibilité Technique du Parc */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider block">
                  Disponibilité Parc
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Car className="w-3 h-3" /> Aptitude technique
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{availabilityRate}%</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">({operationalCount}/{totalVehiclesCount} en service)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${availabilityRate}%` }}></div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 truncate">
            {totalVehiclesCount - operationalCount > 0 
              ? `${totalVehiclesCount - operationalCount} véhicule immobilisé atelier`
              : '100% du parc apte à rouler'}
          </p>
        </div>

        {/* CARTE 2 : Taux d'Exploitation des Véhicules */}
        <div className="bg-white dark:bg-[#121929] border border-indigo-200/80 dark:border-indigo-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider block">
                  Taux d'Exploitation
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Activity className="w-3 h-3" /> Mobilisation réelle
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">{exploitationRate}%</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">({deployedVehiclesCount}/{operationalCount} en mission)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${exploitationRate}%` }}></div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 truncate">
            {idleOperationalCount} dispo en réserve ({globalExploitationRate}% du parc total)
          </p>
        </div>

        {/* CARTE 3 : Coût Global du Parc Automobile */}
        <div className="bg-white dark:bg-[#121929] border border-emerald-200/80 dark:border-[#222f47] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Coût Global Parc</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {(totalGlobalParkCostDZD / 1000000).toFixed(2)} <span className="text-xs text-emerald-600">M DA</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Acquis: {(totalAcquisitionCostDZD / 1000000).toFixed(1)}M • Entretien: {(totalMaintenanceCostDZD / 1000).toFixed(0)}k DA
              </p>
            </div>
          </div>
          <button onClick={() => onNavigateTab('interventions')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-left block cursor-pointer">
            Voir interventions (DI/FR) →
          </button>
        </div>

        {/* CARTE 3 : Missions en Cours */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Missions en Cours</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{activeMissionsCount} Ordres</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Trajets inter-wilayas validés</p>
            </div>
          </div>
          <button onClick={() => onNavigateTab('missions')} className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-left block cursor-pointer">
            Voir les ordres de mission →
          </button>
        </div>

        {/* CARTE 4 : Conducteurs Mobilisés */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Conducteurs Mobilisés</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">5 Chauffeurs</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pool actif avec PWA déployée</p>
            </div>
          </div>
          <button onClick={() => onNavigateTab('drivers')} className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-left block cursor-pointer">
            Gérer les conducteurs →
          </button>
        </div>

        {/* CARTE 5 : Dossiers Sinistres */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Dossiers Sinistres</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">{openClaims.length} à Instruire</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Constats & déclarations reçues</p>
            </div>
          </div>
          <button onClick={() => onNavigateTab('accidents')} className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-left block cursor-pointer">
            Ouvrir les dossiers d'assurance →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Profil Actif & Bannière RBAC Interactive */}
      <div className="bg-slate-100/90 dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Session active : </span>
            <strong className="text-slate-900 dark:text-white font-bold">{userSession?.name || 'Utilisateur'}</strong>
            <span className="text-slate-500 dark:text-slate-400 font-mono ml-1.5">({userSession?.email})</span>
          </div>
        </div>
        {onOpen2FA && (
          <button
            type="button"
            onClick={onOpen2FA}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Changer de rôle (Matrice RBAC)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Header : Personnalisé selon le rôle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${headerInfo.badgeColor}`}>
              {headerInfo.badge}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dinar Algérien (DA)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {headerInfo.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {headerInfo.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {headerInfo.actions}
        </div>
      </div>

      {/* 4 Cartes KPI Spécifiques au Rôle */}
      {renderKpiCards()}

      {/* ========================================================================= */}
      {/* VUE 1 : SUPER ADMINISTRATEUR (DSI / Sécurité Souveraine / Loi 18-07)       */}
      {/* ========================================================================= */}
      {currentRole === 'super_admin' && (
        <div className="space-y-6">
          {/* 1. Grand Journal d'Audit Souverain en Pleine Largeur */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Journal d'Audit Immuable des Accès & Événements
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      Loi 18-07 ANPDP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Traçabilité cryptographique des sessions A2F, modifications de flotte et autorisations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0c121e] p-1 rounded-xl border border-slate-200 dark:border-[#222f47]">
                  {(['all', 'security', 'fuel', 'odometer', 'mission'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setLogFilter(filterKey)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        logFilter === filterKey
                          ? 'bg-white dark:bg-[#1c273e] text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filterKey === 'all' && `Tous (${safeActivityLogs.length})`}
                      {filterKey === 'security' && 'Sécurité A2F'}
                      {filterKey === 'fuel' && 'Carburant'}
                      {filterKey === 'odometer' && 'Odomètre'}
                      {filterKey === 'mission' && 'Missions'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExportAuditLogsJSON}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1a233a] dark:hover:bg-[#253252] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredLogs.slice(0, 15).map((log) => {
                const isSecurity = log.title.toLowerCase().includes('a2f') || log.title.toLowerCase().includes('connexion') || log.channel === 'internal_system';
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSecurity ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                      }`}>
                        {isSecurity ? <ShieldCheck className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{log.title}</span>
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-200/80 dark:bg-[#1a253e] text-slate-700 dark:text-slate-300">
                            {log.channel === 'internal_system' ? 'Système DSI' : log.channel === 'pwa_offline' ? 'Sahara Offline' : 'PWA 4G'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{log.timestamp}</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        ANPDP CERTIFIÉ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Matrice RBAC & Gouvernance des Données */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Matrice des Privilèges RBAC</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">5 profils configurés avec authentification forte A2F</p>
                  </div>
                </div>
                {onOpen2FA && (
                  <button onClick={onOpen2FA} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                    Configurer A2F →
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {ROLES_CONFIG.map((rc) => (
                  <div key={rc.role} className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rc.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${rc.badgeColor}`}>
                          {rc.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{rc.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {rc.permissions.slice(0, 3).map((p, idx) => (
                          <span key={idx} className="text-[10px] bg-white dark:bg-[#1a233a] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    {onOpen2FA && (
                      <button
                        onClick={onOpen2FA}
                        className="px-3 py-1.5 bg-white dark:bg-[#1a233a] hover:bg-slate-100 dark:hover:bg-[#253252] text-slate-800 dark:text-white rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0"
                      >
                        Tester
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registre Souverain Loi 18-07</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Protection des données à caractère personnel</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Stockage 100% sur le territoire algérien</strong>
                    <span>Datacenter national sécurisé. Aucune donnée ne transite par un cloud étranger.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Purge automatique GPS sous 30 jours</strong>
                    <span>Les relevés de géolocalisation des chauffeurs sont anonymisés et purgés pour le respect de la vie privée.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Chiffrement AES-256 & TLS 1.3</strong>
                    <span>Toutes les fiches conducteurs et permis de conduire sont chiffrés au repos.</span>
                  </div>
                </div>
              </div>

              {onOpenANPDP && (
                <button
                  onClick={onOpenANPDP}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 text-center transition-all cursor-pointer block"
                >
                  Ouvrir l'Attestation & Registre Officiel ANPDP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : RESPONSABLE DE MAINTENANCE (Atelier, Vidanges, Pneus, Révisions)   */}
      {/* ========================================================================= */}
      {currentRole === 'maintenance_lead' && (
        <div className="space-y-6">
          {/* 1. Alertes d'Atelier Critiques */}
          <div id="maintenance-alerts-section" className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">File d'Alertes d'Atelier à Traiter</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Vidanges dépassées, contrôles techniques obligatoires et visites médicales</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {activeAlerts.length} alerte(s) en attente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl border bg-rose-50/60 dark:bg-[#1d141e] border-rose-200/90 dark:border-rose-500/40 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-[#2a1d2e] border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300">
                        {alert.vehiclePlate}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded">
                        Échéance : {alert.dueDate || 'Immédiat'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      Action requise : <strong className="text-slate-800 dark:text-slate-200">{alert.actionRequired}</strong>
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/60 dark:border-rose-500/20">
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      Marquer Résolu ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Surveillance Odométrique & Échéances Vidanges (Palier 10 000 km) */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Surveillance Odométrique & Anticipation des Vidanges (Palier 10 000 km)</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Relevés réels des compteurs vs échéances constructeur</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0c121e] text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-[#222f47]">
                  <tr>
                    <th className="py-3 px-4">Véhicule</th>
                    <th className="py-3 px-4">Matricule</th>
                    <th className="py-3 px-4">Odomètre Réel</th>
                    <th className="py-3 px-4">Prochaine Vidange</th>
                    <th className="py-3 px-4">Écart Restant</th>
                    <th className="py-3 px-4">Statut Mécanique</th>
                    <th className="py-3 px-4 text-right">Action Atelier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
                  {safeVehicles.map((v) => {
                    const diff = v.nextServiceKm - v.mileage;
                    const isOverdue = diff <= 0;
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {v.make} {v.model}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {v.plate}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          {v.mileage.toLocaleString('fr-DZ')} km
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold">
                          {v.nextServiceKm.toLocaleString('fr-DZ')} km
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {isOverdue ? (
                            <span className="text-rose-600 dark:text-rose-400">+{Math.abs(diff).toLocaleString('fr-DZ')} km DÉPASSÉ</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">{diff.toLocaleString('fr-DZ')} km restants</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            isOverdue 
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' 
                              : diff < 3000
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isOverdue ? 'Vidange Dépassée !' : diff < 3000 ? 'Révision Proche' : 'Conforme'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onSelectVehicle(v)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 dark:bg-[#1c273e] hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            Planifier Vidange
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Jauges Visuelles d'Usure des Pneumatiques */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Contrôle de l'Usure des 4 Pneumatiques</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Planification des permutations et détection des usures asymétriques</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeVehicles.map((v) => {
                const tires = v.tires || { frontLeft: 85, frontRight: 82, rearLeft: 90, rearRight: 88 };
                return (
                  <div key={v.id} className="p-4 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{v.make} {v.model}</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#1a253e] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {v.plate}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white dark:bg-[#151f33] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">AV-Gauche</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{tires.frontLeft}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-[#151f33] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">AV-Droit</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{tires.frontRight}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-[#151f33] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">AR-Gauche</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{tires.rearLeft}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-[#151f33] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">AR-Droit</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{tires.rearRight}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 3 : CONTRÔLEUR DE GESTION (Carburant Naftal, Barèmes, Surconsommations)*/}
      {/* ========================================================================= */}
      {currentRole === 'controller' && (
        <div className="space-y-6">
          {/* 1. Barèmes Officiels Naftal & Synthèse des Coûts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Gasoil Réglementé</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Naftal Officiel</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">29,01 DA</span>
                <span className="text-xs text-slate-500 ml-1">/ Litre</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Carburant principal de la flotte poids lourd et utilitaires</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Sans Plomb Réglementé</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">Naftal Officiel</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">45,62 DA</span>
                <span className="text-xs text-slate-500 ml-1">/ Litre</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Véhicules légers et liaisons urbaines</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">GPL / Sirghaz</span>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">Économique</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">9,00 DA</span>
                <span className="text-xs text-slate-500 ml-1">/ Litre</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Carburant propre et subventionné</p>
              </div>
            </div>
          </div>

          {/* 2. Audit des Surconsommations (+15% Anormal) */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Détection des Anomalies de Consommation (+15% Seuil d'Alerte)</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Comparatif de la consommation déclarée en direct par rapport aux données constructeur</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                1 Cas Critique Détecté
              </span>
            </div>

            <div className="p-4 rounded-xl border bg-rose-50/60 dark:bg-[#1d141e] border-rose-200/90 dark:border-rose-500/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs bg-white dark:bg-[#2a1d2e] px-2 py-0.5 rounded border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300">
                      00341-319-31
                    </span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">Toyota Hilux Double Cabine 4x4</strong>
                    <span className="text-xs text-slate-500">(Chauffeur : Ahmed Benali)</span>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold mt-1">
                    ⚠️ Consommation anormale calculée à <strong>17,8 L/100km</strong> contre <strong>9,4 L/100km</strong> attendu (+89% d'écart).
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Préjudice financier estimé : <strong className="text-rose-600 dark:text-rose-400">+4 200 DA de surcoût par plein</strong>. Action : Contrôler filtre à gasoil, pression des pneus et vérifier l'absence de fuite.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('fuel')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  Auditer l'Historique Pleins
                </button>
              </div>
            </div>
          </div>

          {/* 3. Réconciliation Comptable & Export CSV */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Rapprochement des Reçus Scannés & Cartes Naftal</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Export comptable pour intégration logicielle (PC Compta / Sage / Odoo)</p>
                </div>
              </div>
              <button
                onClick={handleExportAccountingCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Fichier CSV Comptable</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {safeFuelLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                      DA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{log.driverName}</span>
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a253e] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {log.vehiclePlate}
                        </span>
                        <span className="text-xs text-slate-500">{log.stationName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{log.liters} L • Date : {log.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {log.amountDZD.toLocaleString('fr-DZ')} DA
                    </span>
                    <span className="block text-[10px] text-slate-500">Certifié PWA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 4 : GESTIONNAIRE DE FLOTTE (Opérations, Ordres de Mission, Parc)       */}
      {/* ========================================================================= */}
      {currentRole === 'fleet_manager' && (
        <div className="space-y-6">
          {/* Synthèse Métier : Disponibilité Technique vs Exploitation Réelle */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-sky-500/10 border border-slate-200/90 dark:border-[#1e2a3f] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Distinction Clé : Disponibilité Technique vs Taux d'Exploitation
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  <strong className="text-emerald-700 dark:text-emerald-400">Disponibilité ({availabilityRate}%)</strong> = Véhicules opérationnels aptes à rouler ({operationalCount}/{totalVehiclesCount}) • <strong className="text-indigo-700 dark:text-indigo-400">Taux d'Exploitation ({exploitationRate}%)</strong> = Véhicules réellement mobilisés en mission ({deployedVehiclesCount}/{operationalCount} en service, soit {globalExploitationRate}% du parc total).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {operationalCount} Opérationnels
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-indigo-100/90 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                {deployedVehiclesCount} Roulants (Mission)
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1a233a] text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                {idleOperationalCount} en Réserve
              </span>
            </div>
          </div>

          {/* 1. Grille : Ordres de Mission & Ravitaillements PWA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ordres de Mission Inter-Wilayas</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Circuits autorisés, per diem et péages</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('missions')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Gérer ({safeMissions.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {safeMissions.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{m.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {m.status === 'in_progress' ? 'En Route' : 'Approuvé'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.departureWilaya} → {m.destinationWilaya}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Chauffeur : <strong className="text-slate-700 dark:text-slate-200">{m.driverName}</strong> • {m.vehiclePlate}
                    </p>
                    <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="font-mono text-slate-500">Per diem : {m.perDiemDZD} DA</span>
                      <button onClick={() => onNavigateTab('missions')} className="text-xs text-indigo-600 font-bold hover:underline">
                        Imprimer OM →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
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
                  Voir tout ({safeFuelLogs.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {recentFuelEntries.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{log.driverName}</span>
                          <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a253e] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {log.vehiclePlate}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {log.stationName} • {log.liters} L
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs md:text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        +{log.amountDZD.toLocaleString('fr-DZ')} DA
                      </div>
                      <span className="text-[10px] text-slate-400">{log.source === 'pwa_scan' ? 'Scan OCR' : 'Manuel'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. État Global du Parc Automobile */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
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
                Fiches complètes ({safeVehicles.length}) <ArrowUpRight className="w-3.5 h-3.5" />
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
                    <th className="py-3 px-4">Coût Entretien (DA)</th>
                    <th className="py-3 px-4">Prochaine Révision</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
                  {safeVehicles.map((v) => {
                    const isOverdue = v.mileage >= v.nextServiceKm;
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{v.make} {v.model}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                              {v.vehicleCategory || 'VP'}
                            </span>
                          </div>
                          <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
                            {v.engineDisplacement || '1.6L'} • {v.drivetrain || '4x2'} • Année {v.year}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {v.plate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-900 dark:text-slate-200 font-semibold">{v.driverName}</span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">{v.driverPhone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {deployedVehiclePlates.has(v.plate) || v.operationalMissionStatus === 'en_mission' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              En Mission (Roulant)
                            </span>
                          ) : v.operationalMissionStatus === 'retour_mission' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                              Retour de Mission
                            </span>
                          ) : v.status === 'maintenance' || v.operationalMissionStatus === 'maintenance' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              En Révision (Atelier)
                            </span>
                          ) : v.status === 'accident' || v.operationalMissionStatus === 'sinistre' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              En Sinistre (Immobilisé)
                            </span>
                          ) : v.status === 'retired' || v.operationalMissionStatus === 'reforme' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              Réforme Administrative
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              En Réserve (Dépôt)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {v.mileage.toLocaleString('fr-DZ')} km
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                          {(v.totalMaintenanceCostDZD || 0).toLocaleString('fr-DZ')} DA
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
      )}
    </div>
  );
};
