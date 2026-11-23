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
  CheckCircle2,
  Upload,
  Eye,
  Trash2,
  FileText,
  Truck,
  Layers,
  Cpu,
  Settings2,
  DollarSign
} from 'lucide-react';
import { 
  Vehicle, 
  Driver, 
  InsuranceCompany, 
  VehicleCategory, 
  OperationalMissionStatus, 
  DrivetrainConfig, 
  TransmissionType 
} from '../types.js';

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

  // Base Identity
  const [plate, setPlate] = useState(vehicle?.plate || '');
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState<number>(vehicle?.registrationYear || vehicle?.year || 2022);
  const [fuelType, setFuelType] = useState<'diesel' | 'essence' | 'gpl'>(vehicle?.fuelType || 'diesel');
  const [status, setStatus] = useState<Vehicle['status']>(vehicle?.status || 'active');
  const [chassisNumber, setChassisNumber] = useState(vehicle?.chassisNumber || '');

  // 1. État du véhicule affecté / sortie des missions
  const [operationalMissionStatus, setOperationalMissionStatus] = useState<OperationalMissionStatus>(
    vehicle?.operationalMissionStatus || 'reserve_depot'
  );

  // 8. Type de véhicule & charges (VP, VU, PL, SM, Bus)
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>(vehicle?.vehicleCategory || 'VP');
  const [enginePowerHP, setEnginePowerHP] = useState<number>(vehicle?.enginePowerHP || 100);
  const [ptacKg, setPtacKg] = useState<number>(vehicle?.ptacKg || 1600);
  const [ptraKg, setPtraKg] = useState<number>(vehicle?.ptraKg || 2500);
  const [payloadKg, setPayloadKg] = useState<number>(vehicle?.payloadKg || 500);

  // 2. Caractéristiques de moteur (Cylindrée, nombre de cylindres)
  const [engineDisplacement, setEngineDisplacement] = useState(vehicle?.engineDisplacement || '1.6L');
  const [engineCylinders, setEngineCylinders] = useState<number>(vehicle?.engineCylinders || 4);

  // 3. Boîte de vitesses (Type auto/manuel, nbr de rapports)
  const [transmissionType, setTransmissionType] = useState<TransmissionType>(vehicle?.transmissionType || 'Manuelle');
  const [transmissionGears, setTransmissionGears] = useState<number>(vehicle?.transmissionGears || 5);

  // 4. Traction / Essieux (4x2, 4x4, 6x2, 6x4, 8x4, 8x8)
  const [drivetrain, setDrivetrain] = useState<DrivetrainConfig>(vehicle?.drivetrain || '4x2');

  // 5. Carte grise à uploader
  const [registrationDocUrl, setRegistrationDocUrl] = useState<string | undefined>(vehicle?.registrationDocUrl || undefined);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  // 6. Coût d'acquisition du véhicule (DZD)
  const [acquisitionCostDZD, setAcquisitionCostDZD] = useState<number>(vehicle?.acquisitionCostDZD || 2500000);

  // Coût d'entretien cumulé du véhicule (DZD) - Interventions Atelier
  const [totalMaintenanceCostDZD, setTotalMaintenanceCostDZD] = useState<number>(vehicle?.totalMaintenanceCostDZD || 0);

  // 7. Usure des pneus selon le kilométrage
  const [mileage, setMileage] = useState<number>(vehicle?.mileage || 50000);
  const [lastTireChangeKm, setLastTireChangeKm] = useState<number>(vehicle?.lastTireChangeKm || 0);
  const [tireLifespanKm, setTireLifespanKm] = useState<number>(vehicle?.tireLifespanKm || 50000);
  const [tireWearPercentage, setTireWearPercentage] = useState<number>(
    vehicle?.tireWearPercentage ?? Math.min(100, Math.max(0, Math.round(((vehicle?.mileage || 50000) - (vehicle?.lastTireChangeKm || 0)) / (vehicle?.tireLifespanKm || 50000) * 100)))
  );

  // Fleet & Consumptions
  const [tankCapacityLiters, setTankCapacityLiters] = useState<number>(vehicle?.tankCapacityLiters || 50);
  const [averageConsumption, setAverageConsumption] = useState<number>(vehicle?.averageConsumption || 6.5);
  const [lastServiceKm, setLastServiceKm] = useState<number>(vehicle?.lastServiceKm || 40000);
  const [nextServiceKm, setNextServiceKm] = useState<number>(vehicle?.nextServiceKm || 50000);
  const [driverId, setDriverId] = useState(vehicle?.driverId || (drivers[0]?.id || ''));

  // Insurance & Regulatory
  const [insuranceCompany, setInsuranceCompany] = useState<InsuranceCompany>(vehicle?.insuranceCompany || 'CAAT');
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle?.insuranceExpiry || '2026-12-31');
  const [technicalControlExpiry, setTechnicalControlExpiry] = useState(vehicle?.technicalControlExpiry || '2026-11-30');
  const [vignetteYear, setVignetteYear] = useState<number>(vehicle?.vignetteYear || 2026);

  // Tire individual visual gauges (%)
  const [tireFrontLeft, setTireFrontLeft] = useState<number>(vehicle?.tires?.frontLeft || 85);
  const [tireFrontRight, setTireFrontRight] = useState<number>(vehicle?.tires?.frontRight || 85);
  const [tireRearLeft, setTireRearLeft] = useState<number>(vehicle?.tires?.rearLeft || 90);
  const [tireRearRight, setTireRearRight] = useState<number>(vehicle?.tires?.rearRight || 90);

  // Update dynamic tire wear when mileage or last change changes
  useEffect(() => {
    if (tireLifespanKm > 0) {
      const calculatedWear = Math.min(100, Math.max(0, Math.round(((mileage - lastTireChangeKm) / tireLifespanKm) * 100)));
      setTireWearPercentage(calculatedWear);
    }
  }, [mileage, lastTireChangeKm, tireLifespanKm]);

  useEffect(() => {
    if (vehicle) {
      setPlate(vehicle.plate);
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(vehicle.registrationYear || vehicle.year);
      setFuelType(vehicle.fuelType);
      setStatus(vehicle.status);
      setChassisNumber(vehicle.chassisNumber || '');
      setOperationalMissionStatus(vehicle.operationalMissionStatus || 'reserve_depot');
      setVehicleCategory(vehicle.vehicleCategory || 'VP');
      setEnginePowerHP(vehicle.enginePowerHP || 100);
      setPtacKg(vehicle.ptacKg || (vehicle.vehicleCategory === 'PL' ? 19000 : vehicle.vehicleCategory === 'SM' ? 26000 : 1600));
      setPtraKg(vehicle.ptraKg || (vehicle.vehicleCategory === 'PL' ? 40000 : vehicle.vehicleCategory === 'SM' ? 44000 : 2500));
      setPayloadKg(vehicle.payloadKg || 500);
      setEngineDisplacement(vehicle.engineDisplacement || '1.6L');
      setEngineCylinders(vehicle.engineCylinders || 4);
      setTransmissionType(vehicle.transmissionType || 'Manuelle');
      setTransmissionGears(vehicle.transmissionGears || 5);
      setDrivetrain(vehicle.drivetrain || '4x2');
      setRegistrationDocUrl(vehicle.registrationDocUrl || undefined);
      setAcquisitionCostDZD(vehicle.acquisitionCostDZD || 2500000);
      setTotalMaintenanceCostDZD(vehicle.totalMaintenanceCostDZD || 0);
      setMileage(vehicle.mileage);
      setLastTireChangeKm(vehicle.lastTireChangeKm || 0);
      setTireLifespanKm(vehicle.tireLifespanKm || 50000);
      setTireWearPercentage(vehicle.tireWearPercentage ?? 25);
      setTankCapacityLiters(vehicle.tankCapacityLiters);
      setAverageConsumption(vehicle.averageConsumption);
      setLastServiceKm(vehicle.lastServiceKm);
      setNextServiceKm(vehicle.nextServiceKm);
      setDriverId(vehicle.driverId);
      setInsuranceCompany(vehicle.insuranceCompany || 'CAAT');
      setInsuranceExpiry(vehicle.insuranceExpiry);
      setTechnicalControlExpiry(vehicle.technicalControlExpiry);
      setVignetteYear(vehicle.vignetteYear);
      setTireFrontLeft(vehicle.tires?.frontLeft || 85);
      setTireFrontRight(vehicle.tires?.frontRight || 85);
      setTireRearLeft(vehicle.tires?.rearLeft || 90);
      setTireRearRight(vehicle.tires?.rearRight || 90);
    }
  }, [vehicle]);

  if (!isOpen) return null;

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegistrationDocUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDriver = drivers.find(d => d.id === driverId);

    const vehicleData: Partial<Vehicle> = {
      plate: plate.trim(),
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      registrationYear: Number(year),
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

      // 8 nouveaux champs
      operationalMissionStatus,
      vehicleCategory,
      enginePowerHP: Number(enginePowerHP),
      ptacKg: Number(ptacKg),
      ptraKg: Number(ptraKg),
      payloadKg: Number(payloadKg),
      engineDisplacement: engineDisplacement.trim(),
      engineCylinders: Number(engineCylinders),
      transmissionType,
      transmissionGears: Number(transmissionGears),
      drivetrain,
      registrationDocUrl,
      acquisitionCostDZD: Number(acquisitionCostDZD),
      totalMaintenanceCostDZD: Number(totalMaintenanceCostDZD),
      lastTireChangeKm: Number(lastTireChangeKm),
      tireLifespanKm: Number(tireLifespanKm),
      tireWearPercentage: Number(tireWearPercentage),

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-[#1e2a3f] bg-slate-50/80 dark:bg-[#0c121e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  {isEditing ? `Modifier le Véhicule (${vehicle?.plate})` : 'Ajouter un Véhicule au Parc'}
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    {vehicleCategory}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Norme algérienne Décret N° 04-381 • Spécifications mécaniques, PTAC/PTRA, Carte Grise & Pneumatiques
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c273e] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">

            {/* SECTION 8: Type de Véhicule & Charges Réglementaires (Décret 04-381) */}
            <div className="space-y-4 p-4 rounded-2xl bg-indigo-50/40 dark:bg-[#151c2e] border border-indigo-200/60 dark:border-[#25324d]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> 8. Type de Véhicule & Charges Réglementaires (Décret 04-381)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Classification transport routier algérien</span>
              </div>

              {/* Vehicle Category Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'VP', label: 'VP - Particulier', desc: 'Tourisme / Berline' },
                  { id: 'VU', label: 'VU - Utilitaire', desc: '< 3.5 T Fourgon / Pick-up' },
                  { id: 'PL', label: 'PL - Poids Lourd', desc: '> 3.5 T Porteur / Benne' },
                  { id: 'SM', label: 'SM - Semi-Remorque', desc: 'Tracteur + Remorque' },
                  { id: 'Bus', label: 'Bus - Voyageurs', desc: 'Transport Personnes' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setVehicleCategory(cat.id as VehicleCategory);
                      if (cat.id === 'PL' && ptacKg < 3500) {
                        setPtacKg(19000);
                        setPtraKg(40000);
                        setPayloadKg(12000);
                        setEnginePowerHP(380);
                        setTireLifespanKm(80000);
                      } else if (cat.id === 'SM' && ptraKg < 10000) {
                        setPtacKg(26000);
                        setPtraKg(44000);
                        setPayloadKg(28000);
                        setEnginePowerHP(440);
                        setTireLifespanKm(90000);
                      } else if (cat.id === 'VP') {
                        setPtacKg(1600);
                        setPtraKg(2500);
                        setPayloadKg(500);
                        setEnginePowerHP(100);
                        setTireLifespanKm(50000);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      vehicleCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold'
                        : 'bg-white dark:bg-[#0c121e] border-slate-200 dark:border-[#1e2a3f] text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{cat.label}</div>
                    <div className={`text-[10px] mt-0.5 ${vehicleCategory === cat.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {cat.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic Weights & Power Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Puissance Moteur (ch DIN)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="1000"
                    value={enginePowerHP}
                    onChange={(e) => setEnginePowerHP(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Puissance réelle en chevaux</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PTAC (Poids Autorisé en Charge)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="500"
                      max="60000"
                      value={ptacKg}
                      onChange={(e) => setPtacKg(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-3 pr-8 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Poids maxi du véhicule chargé</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PTRA (Poids Roulant Autorisé)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1000"
                      max="60000"
                      value={ptraKg}
                      onChange={(e) => setPtraKg(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-3 pr-8 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Ensemble articulé + remorque</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Charge Utile (CU / Payload)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      max="40000"
                      value={payloadKg}
                      onChange={(e) => setPayloadKg(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-3 pr-8 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Capacité marchande transportée</span>
                </div>
              </div>
            </div>

            {/* SECTION 1: Identification & Statuts d'Affectation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4" /> 1. Identification & Statut d'Affectation Opérationnelle
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Matricule Algérien <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 04512-118-16"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Format: Numéro-Année-Wilaya</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marque <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Renault, Toyota..."
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Constructeur automobile</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Modèle & Finition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Symbol 1.6, Hilux 4x4..."
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Modèle commercial précis</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Année d'Immatriculation <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1990"
                    max="2035"
                    placeholder="Ex: 2022"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">1ère mise en circulation (Carte Grise)</span>
                </div>
              </div>

              {/* 1. État du véhicule affecté / sortie des missions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    État Opérationnel (Sortie de Mission) <span className="text-emerald-500">*</span>
                  </label>
                  <select
                    value={operationalMissionStatus}
                    onChange={(e: any) => setOperationalMissionStatus(e.target.value)}
                    className="w-full bg-emerald-50/50 dark:bg-[#0c121e] border border-emerald-300 dark:border-emerald-600/40 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="reserve_depot">En Réserve au Dépôt (Disponible)</option>
                    <option value="en_mission">En Mission Active (Sur la Route)</option>
                    <option value="retour_mission">Retour de Mission (Débriefing)</option>
                    <option value="maintenance">En Révision (Atelier Mécanique)</option>
                    <option value="sinistre">En Sinistre (Immobilisé)</option>
                    <option value="reforme">Réforme Administrative (Déclassé)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Statut Global Parc (Cycle de Vie)
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="active">En Service (Opérationnel)</option>
                    <option value="maintenance">En Révision / Atelier</option>
                    <option value="accident">En Sinistre / Réparation</option>
                    <option value="idle">Disponible / Non Affecté</option>
                    <option value="retired">Réforme Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de Châssis (VIN)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: VF1LB0E0556781290"
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2, 3 & 4: Moteur, Boîte à Vitesses & Traction (Essieux) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> 2, 3 & 4. Caractéristiques Moteur, Boîte de Vitesses & Traction (Essieux)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 2. Moteur */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cylindrée Moteur (Displacement)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1.6L 16V, 2.8L D-4D, 12.0L"
                    value={engineDisplacement}
                    onChange={(e) => setEngineDisplacement(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de Cylindres
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={engineCylinders}
                    onChange={(e) => setEngineCylinders(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type de Carburant Naftal
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e: any) => setFuelType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="diesel">Gasoil (29.01 DA/L)</option>
                    <option value="essence">Sans Plomb (45.62 DA/L)</option>
                    <option value="gpl">Sirghaz / GPL (9.00 DA/L)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 3. Boîte de vitesses */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Boîte de Vitesses (Transmission)
                  </label>
                  <select
                    value={transmissionType}
                    onChange={(e: any) => setTransmissionType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Manuelle">Manuelle</option>
                    <option value="Automatique">Automatique</option>
                    <option value="Robotisée">Robotisée (Semi-Auto)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de Rapports / Vitesses
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="18"
                    value={transmissionGears}
                    onChange={(e) => setTransmissionGears(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Ex: 5 ou 6 (VP/VU), 12 à 16 (PL/SM)</span>
                </div>

                {/* 4. Traction / Essieux */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Traction / Configuration Essieux
                  </label>
                  <select
                    value={drivetrain}
                    onChange={(e: any) => setDrivetrain(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="4x2">4x2 (Standard propulsion / traction)</option>
                    <option value="4x4">4x4 (Transmission intégrale)</option>
                    <option value="6x2">6x2 (3 essieux, 1 moteur)</option>
                    <option value="6x4">6x4 (3 essieux, double pont moteur PL/SM)</option>
                    <option value="8x4">8x4 (4 essieux benne lourde chantier)</option>
                    <option value="8x8">8x8 (Tout-terrain saharien extrême)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 5 & 6: Données Financières, Coût d'Entretien & Carte Grise Numérisée */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> 5 & 6. Volet Financier, Coûts d'Exploitation & Carte Grise
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 6. Coût d'acquisition */}
                <div className="bg-slate-50 dark:bg-[#0c121e] p-4 rounded-2xl border border-slate-200 dark:border-[#1e2a3f]">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6. Coût d'Acquisition (DZD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10000"
                      value={acquisitionCostDZD}
                      onChange={(e) => setAcquisitionCostDZD(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-3 pr-10 py-2 text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">DA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Valeur bilantielle : <strong className="text-slate-700 dark:text-white">{acquisitionCostDZD.toLocaleString('fr-DZ')} DA</strong>
                  </p>
                </div>

                {/* Coût d'Entretien Cumulé */}
                <div className="bg-amber-50/50 dark:bg-[#19150d] p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Coût d'Entretien Cumulé (DZD)
                    </label>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                      Auto / FR
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      value={totalMaintenanceCostDZD}
                      onChange={(e) => setTotalMaintenanceCostDZD(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#121929] border border-amber-300 dark:border-amber-800 rounded-xl pl-3 pr-10 py-2 text-sm text-amber-900 dark:text-amber-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600">DA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Cumul : <strong className="text-amber-700 dark:text-amber-400">{totalMaintenanceCostDZD.toLocaleString('fr-DZ')} DA</strong> (Mis à jour via FR)
                  </p>
                </div>

                {/* 5. Carte Grise Upload */}
                <div className="bg-slate-50 dark:bg-[#0c121e] p-4 rounded-2xl border border-slate-200 dark:border-[#1e2a3f]">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    5. Carte Grise Numérisée
                  </label>

                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      id="vehicle-carte-grise-input"
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleDocUpload} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="vehicle-carte-grise-input"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{registrationDocUrl ? 'Remplacer Carte Grise' : 'Téléverser Carte Grise'}</span>
                    </label>

                    {registrationDocUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ title: `Carte Grise Officielle — ${plate || 'Véhicule'}`, url: registrationDocUrl })}
                          className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aperçu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegistrationDocUrl(undefined)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                          title="Supprimer la carte grise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                    Formats acceptés : PDF, PNG, JPG, SVG. Stockage souverain Loi 18-07.
                  </span>
                </div>
              </div>

              {/* Récapitulatif TCO Consolidé du Véhicule */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-[#0c1815] dark:via-[#0c161a] dark:to-[#0c121e] border border-emerald-300/80 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-mono font-black text-xs">
                    TCO
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Coût Global d'Exploitation du Véhicule (TCO Consolidé)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Acquisition : <strong>{Number(acquisitionCostDZD || 0).toLocaleString('fr-DZ')} DA</strong> + Entretien Cumulé : <strong className="text-amber-700 dark:text-amber-400">{Number(totalMaintenanceCostDZD || 0).toLocaleString('fr-DZ')} DA</strong>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-800 dark:text-emerald-300">
                    {(Number(acquisitionCostDZD || 0) + Number(totalMaintenanceCostDZD || 0)).toLocaleString('fr-DZ')} DA
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 7: Usure des Pneumatiques selon le Kilométrage */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" /> 7. Usure des Pneumatiques selon le Kilométrage
                </h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Calcul automatique basé sur la distance parcourue depuis le dernier renouvellement
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kilométrage Actuel de la Flotte (km)
                  </label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Km Dernier Changement Train Pneus
                  </label>
                  <input
                    type="number"
                    value={lastTireChangeKm}
                    onChange={(e) => setLastTireChangeKm(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Odomètre lors du montage</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Durée de Vie Théorique des Pneus (km)
                  </label>
                  <input
                    type="number"
                    value={tireLifespanKm}
                    onChange={(e) => setTireLifespanKm(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">50 000 km (VP/VU) • 80-100k km (PL/SM)</span>
                </div>
              </div>

              {/* Calculated Tire Wear Progress Indicator */}
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-[#0c121e] border border-sky-200 dark:border-[#1e2a3f]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Taux d'Usure Kilométrique Estimé : <strong className={`font-mono text-sm ${tireWearPercentage > 80 ? 'text-rose-500 font-bold' : tireWearPercentage > 60 ? 'text-amber-500' : 'text-emerald-600'}`}>{tireWearPercentage}%</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    Distance roulée : {(mileage - lastTireChangeKm).toLocaleString('fr-DZ')} km / {tireLifespanKm.toLocaleString('fr-DZ')} km
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      tireWearPercentage > 80 ? 'bg-rose-500' : tireWearPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(100, tireWearPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Individual Tire Health Jauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-[#0c121e] p-4 rounded-2xl border border-slate-200 dark:border-[#1e2a3f]">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    AVG (Avant Gauche) : {tireFrontLeft}%
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    AVD (Avant Droit) : {tireFrontRight}%
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ARG (Arrière Gauche) : {tireRearLeft}%
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ARD (Arrière Droit) : {tireRearRight}%
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

            {/* SECTION: Échéances Réglementaires & Assurance */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Échéances Réglementaires, Contrôle Technique & Assurance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Compagnie d'Assurance
                  </label>
                  <select
                    value={insuranceCompany}
                    onChange={(e: any) => setInsuranceCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Échéance Assurance
                  </label>
                  <input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contrôle Technique
                  </label>
                  <input
                    type="date"
                    value={technicalControlExpiry}
                    onChange={(e) => setTechnicalControlExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vignette Automobile
                  </label>
                  <input
                    type="number"
                    value={vignetteYear}
                    onChange={(e) => setVignetteYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: Conducteur Titulaire Assigné */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" /> Conducteur Titulaire Assigné
              </h3>
              <div>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Aucun chauffeur assigné (Véhicule en réserve / disponible)</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.phone} ({d.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 bg-slate-50/80 dark:bg-[#0c121e] rounded-2xl flex items-center justify-between border border-slate-200 dark:border-[#1e2a3f]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1c273e] hover:bg-slate-200 dark:hover:bg-[#253452] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Enregistrer les Modifications du Véhicule' : 'Créer et Enregistrer le Véhicule'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Prévisualisation Carte Grise Numérisée */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-[#070b12]">
              {previewDoc.url.startsWith('data:image/') || previewDoc.url.startsWith('http') ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-slate-700"
                />
              ) : previewDoc.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Format de document non prévisualisable directement</p>
                  <a
                    href={previewDoc.url}
                    download={`Carte_Grise_${plate || 'vehicule'}.pdf`}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Télécharger le document
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0c121e] border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between text-xs text-slate-500">
              <span>Certificat Officiel Numérisé (Conforme Décret 04-381 / Loi 18-07)</span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-[#1c273e] hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
