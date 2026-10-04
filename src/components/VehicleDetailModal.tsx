import React from 'react';
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
  AlertTriangle 
} from 'lucide-react';
import { Vehicle, FuelLog, MaintenanceRecord } from '../types.js';

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
  const vehicleFuel = fuelLogs.filter(f => f.vehiclePlate === vehicle.plate);
  const vehicleMaint = maintenanceRecords.filter(m => m.vehiclePlate === vehicle.plate);

  const totalFuelDZD = vehicleFuel.reduce((acc, f) => acc + f.amountDZD, 0);
  const totalLiters = vehicleFuel.reduce((acc, f) => acc + f.liters, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 inline-block mb-2">
              {vehicle.plate}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Carburant : <strong className="text-slate-700 dark:text-slate-200 capitalize">{vehicle.fuelType}</strong> • Réservoir : {vehicle.tankCapacityLiters} L • Conso moyenne : {vehicle.averageConsumption} L/100km
            </p>
          </div>

          <span className={`px-3 py-1 text-xs font-semibold rounded-full border mr-8 ${
            vehicle.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : vehicle.status === 'maintenance'
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
          }`}>
            {vehicle.status === 'active' ? 'En Service' : vehicle.status === 'maintenance' ? 'En Révision' : 'En Sinistre'}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Odomètre Actuel</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              {vehicle.mileage.toLocaleString('fr-DZ')} km
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Certifié via PWA Souveraine</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Carburant (DA)</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
              {totalFuelDZD.toLocaleString('fr-DZ')} DA
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{totalLiters} Litres déclarés</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Prochaine Vidange</span>
            <div className={`text-xl font-bold font-mono mt-1 ${vehicle.mileage >= vehicle.nextServiceKm ? 'text-rose-500 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {vehicle.nextServiceKm.toLocaleString('fr-DZ')} km
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Intervalle 10 000 km</p>
          </div>
        </div>

        {/* Driver Assigned */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
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
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors"
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
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Conformité Administrative & Assurance (Algérie)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Assureur ({vehicle.insuranceCompany || 'CAAT'})</span>
              <span className="font-semibold text-slate-900 dark:text-white">{vehicle.insuranceExpiry}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Contrôle Technique</span>
              <span className="font-semibold text-slate-900 dark:text-white">{vehicle.technicalControlExpiry}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Vignette Fiscale</span>
              <span className="font-semibold text-slate-900 dark:text-white">Année {vehicle.vignetteYear}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Châssis (VIN)</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block">{vehicle.chassisNumber || 'Non renseigné'}</span>
            </div>
          </div>
        </div>

        {/* Pneumatiques */}
        {vehicle.tires && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              État d'Usure des Pneumatiques
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Avant Gauche</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.frontLeft}%</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Avant Droit</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.frontRight}%</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Arrière Gauche</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.rearLeft}%</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Arrière Droit</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">{vehicle.tires.rearRight}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Fuel logs for this vehicle */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Historique Ravitaillements Carburant
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vehicleFuel.map(f => (
              <div key={f.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
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
    </div>
  );
};
