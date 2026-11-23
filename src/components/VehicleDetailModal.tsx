import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Fuel, 
  Wrench, 
  Shield, 
  Calendar, 
  Gauge, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  Truck,
  Cpu,
  Settings2,
  DollarSign,
  FileCheck,
  FileText,
  Eye,
  Layers,
  ClipboardCheck,
  ExternalLink
} from 'lucide-react';
import { Vehicle, FuelLog, MaintenanceRecord, OperationalMissionStatus, VehicleCategory, VehicleIntervention } from '../types.js';
import { OfficialDIModal, OfficialFRModal } from './InterventionsManager.js';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  maintenanceRecords: MaintenanceRecord[];
  interventions?: VehicleIntervention[];
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  fuelLogs,
  maintenanceRecords,
  interventions = [],
  onClose,
  onNavigateTab,
}) => {
  const [previewCarteGrise, setPreviewCarteGrise] = useState(false);
  const [selectedDIForPrint, setSelectedDIForPrint] = useState<VehicleIntervention | null>(null);
  const [selectedFRForPrint, setSelectedFRForPrint] = useState<VehicleIntervention | null>(null);

  const vehicleFuel = fuelLogs.filter(f => f.vehiclePlate === vehicle.plate);
  const vehicleMaint = maintenanceRecords.filter(m => m.vehiclePlate === vehicle.plate);
  const vehicleInterventions = interventions.filter(i => i.vehiclePlate === vehicle.plate);

  const totalFuelDZD = vehicleFuel.reduce((acc, f) => acc + f.amountDZD, 0);
  const totalLiters = vehicleFuel.reduce((acc, f) => acc + f.liters, 0);

  // 7. Usure des pneumatiques selon le kilométrage
  const kmSinceTireChange = Math.max(0, vehicle.mileage - (vehicle.lastTireChangeKm || 0));
  const tireLifespan = vehicle.tireLifespanKm || 50000;
  const tireKmWear = vehicle.tireWearPercentage !== undefined 
    ? vehicle.tireWearPercentage 
    : Math.min(100, Math.round((kmSinceTireChange / tireLifespan) * 100));

  const getOperationalStatusBadge = (status?: OperationalMissionStatus) => {
    switch (status) {
      case 'reserve_depot':
        return { label: 'En Réserve au Dépôt (Disponible)', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300' };
      case 'en_mission':
        return { label: 'En Mission Active (Sur la Route)', color: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300' };
      case 'retour_mission':
        return { label: 'Retour de Mission (Débriefing)', color: 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300' };
      case 'maintenance':
        return { label: 'En Révision Atelier Mécanique', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300' };
      case 'sinistre':
        return { label: 'En Sinistre (Immobilisé / Constat)', color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300' };
      case 'reforme':
        return { label: 'Réforme Administrative (Déclassé)', color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300' };
      default:
        return { label: 'En Réserve au Dépôt (Disponible)', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300' };
    }
  };

  const opStatus = getOperationalStatusBadge(vehicle.operationalMissionStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative dark:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-[#1c273e] dark:hover:bg-[#253452] dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Classification & Operational Status */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1e2a3f] pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-slate-100 dark:bg-[#0c121e] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1e2a3f] inline-block">
                {vehicle.plate}
              </span>
              {/* Année d'immatriculation */}
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Immat. : {vehicle.registrationYear || vehicle.year}
              </span>
              {/* 8. Catégorie du véhicule */}
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Catégorie : {vehicle.vehicleCategory || 'VP'}
              </span>
              {/* 1. État du véhicule affecté / sortie des missions */}
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${opStatus.color}`}>
                {opStatus.label}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Année d'immatriculation : <strong className="text-slate-900 dark:text-white font-mono">{vehicle.registrationYear || vehicle.year}</strong></span>
              <span>•</span>
              <span>Motorisation : <strong className="text-slate-700 dark:text-slate-200 uppercase">{vehicle.fuelType}</strong></span>
              <span>•</span>
              <span>Réservoir : {vehicle.tankCapacityLiters} L</span>
              <span>•</span>
              <span>Conso mixte : {vehicle.averageConsumption} L/100km</span>
            </p>
          </div>

          <div className="mr-8">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
              vehicle.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                : vehicle.status === 'maintenance'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
            }`}>
              {vehicle.status === 'active' ? 'En Service' : vehicle.status === 'maintenance' ? 'En Révision' : 'En Sinistre'}
            </span>
          </div>
        </div>

        {/* 2, 3 & 4. Caractéristiques Mécaniques & Transmission */}
        <div className="my-5 p-4 rounded-2xl bg-amber-50/30 dark:bg-[#0c121e] border border-amber-200/60 dark:border-[#1e2a3f]">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Caractéristiques Moteur, Boîte de Vitesses & Traction (Essieux)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">2. Cylindrée</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">{vehicle.engineDisplacement || '1.6L 16V'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">2. Nombre de Cylindres</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">{vehicle.engineCylinders || 4} cylindres</strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">3. Boîte de Vitesses</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                {vehicle.transmissionType || 'Manuelle'} {vehicle.transmissionGears ? `(${vehicle.transmissionGears} vit.)` : ''}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">4. Traction (Essieux)</span>
              <strong className="text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.drivetrain || '4x2'}</strong>
            </div>
          </div>
        </div>

        {/* 8. Poids et Capacités de Charge Réglementaires (Décret 04-381) */}
        <div className="mb-5 p-4 rounded-2xl bg-indigo-50/30 dark:bg-[#0c121e] border border-indigo-200/60 dark:border-[#1e2a3f]">
          <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> 8. Poids et Capacités de Charge Réglementaires (Algérie)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Puissance Moteur</span>
              <strong className="text-indigo-700 dark:text-indigo-400 font-mono text-sm">{vehicle.enginePowerHP || 100} ch DIN</strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">PTAC (Poids Total en Charge)</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">{(vehicle.ptacKg || 1600).toLocaleString('fr-DZ')} kg</strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">PTRA (Poids Roulant Autorisé)</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">{(vehicle.ptraKg || 2500).toLocaleString('fr-DZ')} kg</strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Charge Utile (Payload)</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{(vehicle.payloadKg || 500).toLocaleString('fr-DZ')} kg</strong>
            </div>
          </div>
        </div>

        {/* 5 & 6. Données Financières, Coût d'Entretien & Carte Grise Numérisée */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-[#0c121e] border border-emerald-200/60 dark:border-[#1e2a3f]">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Coût d'Acquisition
            </h4>
            <div className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
              {(vehicle.acquisitionCostDZD || 2500000).toLocaleString('fr-DZ')} DA
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Immobilisation inscrite au bilan
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-[#0c121e] border border-amber-200/60 dark:border-[#1e2a3f]">
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" /> Coût Cumulé d'Entretien
            </h4>
            <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {(vehicle.totalMaintenanceCostDZD || 0).toLocaleString('fr-DZ')} DA
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Cumul des interventions atelier
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/30 dark:bg-[#0c121e] border border-sky-200/60 dark:border-[#1e2a3f] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" /> Carte Grise
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Certificat d'immatriculation
              </p>
            </div>
            {vehicle.registrationDocUrl ? (
              <button
                type="button"
                onClick={() => setPreviewCarteGrise(true)}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer self-start"
              >
                <Eye className="w-4 h-4" />
                <span>Aperçu Officiel</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Non numérisée</span>
            )}
          </div>
        </div>

        {/* TCO Consolidé du Véhicule */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-[#0c1815] dark:via-[#0c161a] dark:to-[#0c121e] border border-emerald-300/80 dark:border-emerald-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-mono font-black text-xs">
              TCO
            </span>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Coût Global d'Exploitation du Véhicule (TCO Consolidé)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Acquisition : <strong>{(vehicle.acquisitionCostDZD || 2500000).toLocaleString('fr-DZ')} DA</strong> + Entretien Cumulé : <strong className="text-amber-700 dark:text-amber-400">{(vehicle.totalMaintenanceCostDZD || 0).toLocaleString('fr-DZ')} DA</strong>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black font-mono text-emerald-800 dark:text-emerald-300">
              {((vehicle.acquisitionCostDZD || 2500000) + (vehicle.totalMaintenanceCostDZD || 0)).toLocaleString('fr-DZ')} DA
            </span>
          </div>
        </div>

        {/* 7. Usure des Pneumatiques selon le Kilométrage */}
        <div className="mb-5 p-4 rounded-2xl bg-sky-50/30 dark:bg-[#0c121e] border border-sky-200/60 dark:border-[#1e2a3f]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4" /> 7. Usure des Pneumatiques selon le Kilométrage
            </h4>
            <span className="font-mono font-bold text-sm text-sky-700 dark:text-sky-300">
              {tireKmWear}% d'usure estimée
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-300 ${
                tireKmWear > 80 ? 'bg-rose-500' : tireKmWear > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, tireKmWear)}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <div>Distance depuis dernier changement : <strong className="text-slate-900 dark:text-white font-mono">{kmSinceTireChange.toLocaleString('fr-DZ')} km</strong></div>
            <div>Dernier remplacement à l'odomètre : <strong className="text-slate-900 dark:text-white font-mono">{(vehicle.lastTireChangeKm || 0).toLocaleString('fr-DZ')} km</strong></div>
            <div>Durée de vie théorique : <strong className="text-slate-900 dark:text-white font-mono">{tireLifespan.toLocaleString('fr-DZ')} km</strong></div>
          </div>

          {/* Jauges d'usure par pneu */}
          {vehicle.tires && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-[#121929] p-3 rounded-xl border border-slate-200 dark:border-[#222f47] mt-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">AVG (Avant Gauche)</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.frontLeft}% santé</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">AVD (Avant Droit)</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.frontRight}% santé</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ARG (Arrière Gauche)</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.rearLeft}% santé</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ARD (Arrière Droit)</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.rearRight}% santé</span>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-slate-50 dark:bg-[#0c121e] p-4 rounded-xl border border-slate-200 dark:border-[#1e2a3f]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Odomètre Actuel</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              {vehicle.mileage.toLocaleString('fr-DZ')} km
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Certifié via PWA Souveraine</p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c121e] p-4 rounded-xl border border-slate-200 dark:border-[#1e2a3f]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Carburant (DA)</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
              {totalFuelDZD.toLocaleString('fr-DZ')} DA
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{totalLiters} Litres déclarés</p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c121e] p-4 rounded-xl border border-slate-200 dark:border-[#1e2a3f]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Prochaine Vidange</span>
            <div className={`text-xl font-bold font-mono mt-1 ${vehicle.mileage >= vehicle.nextServiceKm ? 'text-rose-500 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {vehicle.nextServiceKm.toLocaleString('fr-DZ')} km
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Intervalle standard Naftal</p>
          </div>
        </div>

        {/* Driver Assigned */}
        <div className="bg-slate-50 dark:bg-[#0c121e] p-4 rounded-xl border border-slate-200 dark:border-[#1e2a3f] text-xs mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1c273e] flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-[#222f47]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-semibold">{vehicle.driverName}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">{vehicle.driverPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${vehicle.driverPhone}`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#1c273e] dark:hover:bg-[#253452] dark:text-slate-200 dark:border-[#222f47] rounded-lg text-xs font-medium transition-colors"
            >
              Appeler (+213)
            </a>
            <button
              onClick={() => {
                onClose();
                onNavigateTab('drivers');
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Fiche Chauffeur
            </button>
          </div>
        </div>

        {/* Administrative Status & Insurance */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Conformité Administrative & Assurance (Algérie)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Assureur ({vehicle.insuranceCompany || 'CAAT'})</span>
              <span className="font-semibold text-slate-900 dark:text-white">{vehicle.insuranceExpiry}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Contrôle Technique</span>
              <span className="font-semibold text-slate-900 dark:text-white">{vehicle.technicalControlExpiry}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Vignette Fiscale</span>
              <span className="font-semibold text-slate-900 dark:text-white">Année {vehicle.vignetteYear}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Châssis (VIN)</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block">{vehicle.chassisNumber || 'Non renseigné'}</span>
            </div>
          </div>
        </div>

        {/* Historique d'Intervention pour chaque véhicule (DI & FR) */}
        <div className="mb-5 p-4 rounded-2xl bg-indigo-50/20 dark:bg-[#0c121e] border border-indigo-200/50 dark:border-[#1e2a3f]">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                Historique des Interventions sur ce Véhicule (DI & FR)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateTab('interventions');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Gérer les interventions</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {vehicleInterventions.map(itv => (
              <div 
                key={itv.id} 
                className="p-3.5 rounded-xl bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] text-xs shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
              >
                {/* Ligne 1 : Numéros Officiels DI et FR */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-[#1e2a3f]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      N° DI : {itv.interventionOrderNumber}
                    </span>
                    {itv.receptionSheetNumber ? (
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        N° FR : {itv.receptionSheetNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                        En attente de réception (Atelier)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Bouton Voir DI */}
                    <button
                      type="button"
                      onClick={() => setSelectedDIForPrint(itv)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Demande (DI)</span>
                    </button>

                    {/* Bouton Voir FR si émise */}
                    {itv.receptionSheetNumber && (
                      <button
                        type="button"
                        onClick={() => setSelectedFRForPrint(itv)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ClipboardCheck className="w-3 h-3" />
                        <span>Fiche Réception (FR)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Ligne 2 : Grille des 4 champs clés (Date sortie, Date retour, Coût DA, Atelier) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 bg-slate-50 dark:bg-[#0c121e] p-2.5 rounded-lg border border-slate-100 dark:border-[#1e2a3f]">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Date sortie intervention</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {itv.dateSortieIntervention.replace('T', ' ')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Date retour intervention</span>
                    <strong className={`font-mono text-[11px] ${itv.dateRetourIntervention ? 'text-slate-800 dark:text-slate-200' : 'text-amber-600 dark:text-amber-400'}`}>
                      {itv.dateRetourIntervention ? itv.dateRetourIntervention.replace('T', ' ') : 'En cours atelier'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Coût d'intervention (DA)</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                      {itv.coutInterventionDZD 
                        ? `${itv.coutInterventionDZD.toLocaleString('fr-DZ')} DA`
                        : itv.estimatedCostDZD 
                        ? `Est. ${itv.estimatedCostDZD.toLocaleString('fr-DZ')} DA`
                        : 'En attente devis'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Atelier réalisateur</span>
                    <strong className="text-slate-700 dark:text-slate-300 text-[11px] truncate block" title={itv.garageName}>
                      {itv.garageName}
                    </strong>
                  </div>
                </div>

                {/* Ligne 3 : Description d'intervention */}
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Description : </span>
                  {itv.description}
                  {itv.workDoneDetails && (
                    <div className="mt-1 text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                      <strong>Travaux exécutés :</strong> {itv.workDoneDetails}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {vehicleInterventions.length === 0 && (
              <div className="text-center py-5 text-slate-400 dark:text-slate-500 italic text-xs bg-slate-50 dark:bg-[#0c121e] rounded-xl border border-dashed border-slate-200 dark:border-[#1e2a3f]">
                Aucune intervention mécanique ou révision enregistrée pour ce véhicule.
              </div>
            )}
          </div>
        </div>

        {/* Fuel logs for this vehicle */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Historique Ravitaillements Carburant
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vehicleFuel.map(f => (
              <div key={f.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] text-xs flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">{f.stationName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">({f.liters} L @ {f.pricePerLiterDZD} DA/L)</span>
                </div>
                <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {f.amountDZD.toLocaleString('fr-DZ')} DA
                </div>
              </div>
            ))}
            {vehicleFuel.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Aucun ravitaillement enregistré.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Prévisualisation Carte Grise Numérisée */}
      {previewCarteGrise && vehicle.registrationDocUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Carte Grise Officielle — {vehicle.plate} ({vehicle.make} {vehicle.model})
                </h3>
              </div>
              <button
                onClick={() => setPreviewCarteGrise(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-[#070b12]">
              {vehicle.registrationDocUrl.startsWith('data:image/') || vehicle.registrationDocUrl.startsWith('http') ? (
                <img
                  src={vehicle.registrationDocUrl}
                  alt={`Carte Grise ${vehicle.plate}`}
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-slate-700"
                />
              ) : vehicle.registrationDocUrl.startsWith('data:application/pdf') ? (
                <iframe
                  src={vehicle.registrationDocUrl}
                  title={`Carte Grise ${vehicle.plate}`}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Document officiel numérisé</p>
                  <a
                    href={vehicle.registrationDocUrl}
                    download={`Carte_Grise_${vehicle.plate}.pdf`}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Télécharger la carte grise
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0c121e] border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between text-xs text-slate-500">
              <span>Certificat d'Immatriculation Automobile (Décret 04-381 / Loi 18-07)</span>
              <button
                onClick={() => setPreviewCarteGrise(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-[#1c273e] hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Demande d'Intervention (DI) Officielle */}
      {selectedDIForPrint && (
        <OfficialDIModal
          intervention={selectedDIForPrint}
          onClose={() => setSelectedDIForPrint(null)}
        />
      )}

      {/* Modal Fiche de Réception (FR) Officielle */}
      {selectedFRForPrint && (
        <OfficialFRModal
          intervention={selectedFRForPrint}
          onClose={() => setSelectedFRForPrint(null)}
        />
      )}
    </div>
  );
};
