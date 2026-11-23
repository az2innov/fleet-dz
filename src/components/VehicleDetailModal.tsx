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
  Layers
} from 'lucide-react';
import { Vehicle, FuelLog, MaintenanceRecord, OperationalMissionStatus, VehicleCategory } from '../types.js';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  maintenanceRecords: MaintenanceRecord[];
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  fuelLogs,
  maintenanceRecords,
  onClose,
  onNavigateTab,
}) => {
  const [previewCarteGrise, setPreviewCarteGrise] = useState(false);

  const vehicleFuel = fuelLogs.filter(f => f.vehiclePlate === vehicle.plate);
  const vehicleMaint = maintenanceRecords.filter(m => m.vehiclePlate === vehicle.plate);

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
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Motorisation : <strong className="text-slate-700 dark:text-slate-200 uppercase">{vehicle.fuelType}</strong> • Réservoir : {vehicle.tankCapacityLiters} L • Conso mixte : {vehicle.averageConsumption} L/100km
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

        {/* 5 & 6. Données Financières & Carte Grise Numérisée */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-[#0c121e] border border-emerald-200/60 dark:border-[#1e2a3f]">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> 6. Coût d'Acquisition & Amortissement
            </h4>
            <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
              {(vehicle.acquisitionCostDZD || 2500000).toLocaleString('fr-DZ')} DA
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Immobilisation corporelle inscrite au bilan Dz-Fleet
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/30 dark:bg-[#0c121e] border border-sky-200/60 dark:border-[#1e2a3f] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" /> 5. Carte Grise Numérisée
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Certificat officiel d'immatriculation certifié
              </p>
            </div>
            {vehicle.registrationDocUrl ? (
              <button
                type="button"
                onClick={() => setPreviewCarteGrise(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Aperçu Officiel</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Non numérisée</span>
            )}
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
    </div>
  );
};
