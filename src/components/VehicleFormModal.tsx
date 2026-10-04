import React, { useState, useEffect } from 'react';
import { 
  Car, 
  X, 
  Save, 
  Calendar, 
  Fuel, 
  Gauge, 
  Shield, 
  FileCheck, 
  AlertTriangle,
  User,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { Vehicle, Driver, InsuranceCompany } from '../types.js';

interface VehicleFormModalProps {
  vehicle?: Vehicle | null;
  drivers: Driver[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => void;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  vehicle,
  drivers,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!vehicle;

  const [plate, setPlate] = useState(vehicle?.plate || '');
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState<number>(vehicle?.year || 2022);
  const [fuelType, setFuelType] = useState<'diesel' | 'essence' | 'gpl'>(vehicle?.fuelType || 'diesel');
  const [status, setStatus] = useState<Vehicle['status']>(vehicle?.status || 'active');
  const [mileage, setMileage] = useState<number>(vehicle?.mileage || 50000);
  const [tankCapacityLiters, setTankCapacityLiters] = useState<number>(vehicle?.tankCapacityLiters || 50);
  const [averageConsumption, setAverageConsumption] = useState<number>(vehicle?.averageConsumption || 6.5);
  const [lastServiceKm, setLastServiceKm] = useState<number>(vehicle?.lastServiceKm || 40000);
  const [nextServiceKm, setNextServiceKm] = useState<number>(vehicle?.nextServiceKm || 50000);
  const [driverId, setDriverId] = useState(vehicle?.driverId || (drivers[0]?.id || ''));
  const [insuranceCompany, setInsuranceCompany] = useState<InsuranceCompany>(vehicle?.insuranceCompany || 'CAAT');
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle?.insuranceExpiry || '2026-12-31');
  const [technicalControlExpiry, setTechnicalControlExpiry] = useState(vehicle?.technicalControlExpiry || '2026-11-30');
  const [vignetteYear, setVignetteYear] = useState<number>(vehicle?.vignetteYear || 2026);
  const [chassisNumber, setChassisNumber] = useState(vehicle?.chassisNumber || '');
  
  // Tire conditions (%)
  const [tireFrontLeft, setTireFrontLeft] = useState<number>(vehicle?.tires?.frontLeft || 85);
  const [tireFrontRight, setTireFrontRight] = useState<number>(vehicle?.tires?.frontRight || 85);
  const [tireRearLeft, setTireRearLeft] = useState<number>(vehicle?.tires?.rearLeft || 90);
  const [tireRearRight, setTireRearRight] = useState<number>(vehicle?.tires?.rearRight || 90);

  useEffect(() => {
    if (vehicle) {
      setPlate(vehicle.plate);
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setFuelType(vehicle.fuelType);
      setStatus(vehicle.status);
      setMileage(vehicle.mileage);
      setTankCapacityLiters(vehicle.tankCapacityLiters);
      setAverageConsumption(vehicle.averageConsumption);
      setLastServiceKm(vehicle.lastServiceKm);
      setNextServiceKm(vehicle.nextServiceKm);
      setDriverId(vehicle.driverId);
      setInsuranceCompany(vehicle.insuranceCompany || 'CAAT');
      setInsuranceExpiry(vehicle.insuranceExpiry);
      setTechnicalControlExpiry(vehicle.technicalControlExpiry);
      setVignetteYear(vehicle.vignetteYear);
      setChassisNumber(vehicle.chassisNumber || '');
      setTireFrontLeft(vehicle.tires?.frontLeft || 85);
      setTireFrontRight(vehicle.tires?.frontRight || 85);
      setTireRearLeft(vehicle.tires?.rearLeft || 90);
      setTireRearRight(vehicle.tires?.rearRight || 90);
    }
  }, [vehicle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDriver = drivers.find(d => d.id === driverId);

    const vehicleData: Partial<Vehicle> = {
      plate: plate.trim(),
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      fuelType,
      status,
      mileage: Number(mileage),
      tankCapacityLiters: Number(tankCapacityLiters),
      averageConsumption: Number(averageConsumption),
      lastServiceKm: Number(lastServiceKm),
      nextServiceKm: Number(nextServiceKm),
      driverId: assignedDriver?.id || '',
      driverName: assignedDriver?.name || 'Non assigné',
      driverPhone: assignedDriver?.phone || '',
      insuranceCompany,
      insuranceExpiry,
      technicalControlExpiry,
      vignetteYear: Number(vignetteYear),
      chassisNumber: chassisNumber.trim(),
      tires: {
        frontLeft: Number(tireFrontLeft),
        frontRight: Number(tireFrontRight),
        rearLeft: Number(tireRearLeft),
        rearRight: Number(tireRearRight),
        lastInspectionDate: new Date().toISOString().split('T')[0],
      }
    };

    onSave(vehicleData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? `Modifier le Véhicule (${vehicle?.plate})` : 'Ajouter un Véhicule au Parc'}
              </h2>
              <p className="text-xs text-slate-400">
                Immatriculation normalisée algérienne, motorisation et suivi réglementaire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {/* Section 1: Identification & Immatriculation Algérienne */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4" /> 1. Identification & Matricule Algérien
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Matricule Algérien <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 04512-118-16"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Format: Numéro-Année-Wilaya (ex: 16 Alger, 31 Oran)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Marque <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Renault, Peugeot, Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modèle & Finition <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Symbol 1.6, Hilux 4x4"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Année de Mise en Circulation
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2027"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motorisation / Carburant
                </label>
                <select
                  value={fuelType}
                  onChange={(e: any) => setFuelType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="diesel">Gasoil (29.01 DA/L)</option>
                  <option value="essence">Sans Plomb (45.62 DA/L)</option>
                  <option value="gpl">Sirghaz / GPL (9.00 DA/L)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Statut du Véhicule (Cycle de Vie)
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="active">En Service (Opérationnel)</option>
                  <option value="maintenance">En Révision / Atelier</option>
                  <option value="accident">En Sinistre / Réparation</option>
                  <option value="idle">Disponible / Non Affecté</option>
                  <option value="retired">Réforme Administrative</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numéro de Châssis (VIN)
              </label>
              <input
                type="text"
                placeholder="Ex: VF1LB0E0556781290"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Données Techniques & Kilométrage */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4" /> 2. Odomètre, Consommation & Entretien
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kilométrage Actuel (km)
                </label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Réservoir (Litres)
                </label>
                <input
                  type="number"
                  value={tankCapacityLiters}
                  onChange={(e) => setTankCapacityLiters(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Conso Mixte (L/100km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={averageConsumption}
                  onChange={(e) => setAverageConsumption(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prochaine Vidange (km)
                </label>
                <input
                  type="number"
                  value={nextServiceKm}
                  onChange={(e) => setNextServiceKm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: État des Pneumatiques */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> 3. État des Pneumatiques (% Santé)
              </h3>
              <span className="text-[11px] text-slate-400">Contrôle visuel de l'usure de la bande de roulement</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Avant Gauche (AVG) : {tireFrontLeft}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tireFrontLeft}
                  onChange={(e) => setTireFrontLeft(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Avant Droit (AVD) : {tireFrontRight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tireFrontRight}
                  onChange={(e) => setTireFrontRight(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Arrière Gauche (ARG) : {tireRearLeft}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tireRearLeft}
                  onChange={(e) => setTireRearLeft(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Arrière Droit (ARD) : {tireRearRight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tireRearRight}
                  onChange={(e) => setTireRearRight(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Échéances Réglementaires & Assurance */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> 4. Échéances Réglementaires & Assurance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Compagnie d'Assurance
                </label>
                <select
                  value={insuranceCompany}
                  onChange={(e: any) => setInsuranceCompany(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="CAAT">CAAT Assurances</option>
                  <option value="SAA">SAA Assurances</option>
                  <option value="CASH">CASH Assurances</option>
                  <option value="CIAR">CIAR Assurances</option>
                  <option value="2A">2A Assurances</option>
                  <option value="GAM">GAM Assurances</option>
                  <option value="Autre">Autre Compagnie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Échéance Assurance
                </label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contrôle Technique
                </label>
                <input
                  type="date"
                  value={technicalControlExpiry}
                  onChange={(e) => setTechnicalControlExpiry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vignette Automobile
                </label>
                <input
                  type="number"
                  value={vignetteYear}
                  onChange={(e) => setVignetteYear(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Affectation Conducteur Titulaire */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> 5. Conducteur Titulaire Assigné
            </h3>
            <div>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Aucun chauffeur assigné (Véhicule de pool / disponible)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.phone} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 bg-slate-950/80 rounded-2xl flex items-center justify-between border border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Enregistrer les Modifications' : 'Créer et Enregistrer le Véhicule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
