import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Fuel, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  QrCode, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  X, 
  Save, 
  ArrowRight,
  Compass,
  Download,
  Trash2
} from 'lucide-react';
import { MissionOrder, Vehicle, Driver } from '../types.js';

interface MissionsManagerProps {
  missions: MissionOrder[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onRefreshData: () => void;
  onNavigateTab: (tab: any) => void;
}

export const MissionsManager: React.FC<MissionsManagerProps> = ({
  missions,
  vehicles,
  drivers,
  onRefreshData,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMissionForPrint, setSelectedMissionForPrint] = useState<MissionOrder | null>(null);

  // Modal Create Mission state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [departureCity, setDepartureCity] = useState('Alger');
  const [departureWilaya, setDepartureWilaya] = useState('16 - Alger');
  const [destinationCity, setDestinationCity] = useState('Oran');
  const [destinationWilaya, setDestinationWilaya] = useState('31 - Oran');
  const [intermediateStopsText, setIntermediateStopsText] = useState('Blida, Chlef');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('07:00');
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [returnTime, setReturnTime] = useState('19:00');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState<number>(430);
  const [tollFeesDZD, setTollFeesDZD] = useState<number>(900);
  const [perDiemDZD, setPerDiemDZD] = useState<number>(9000);
  const [notes, setNotes] = useState('Autoroute Est-Ouest, port des EPI sur site.');

  // Filtered available vehicles (active or idle)
  const availableVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'idle');
  // Filtered available drivers (available or in duty)
  const availableDrivers = drivers.filter(d => d.status === 'available' || d.status === 'on_mission');

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const selectedDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];

  // Auto calculate fuel budget
  const pricePerLiter = selectedVehicle?.fuelType === 'diesel' ? 29.01 : selectedVehicle?.fuelType === 'essence' ? 45.62 : 9.00;
  const consumptionL100 = selectedVehicle?.averageConsumption || 7.0;
  const estimatedFuelLiters = Math.round((estimatedDistanceKm / 100) * consumptionL100);
  const estimatedFuelBudgetDZD = Math.round(estimatedFuelLiters * pricePerLiter);
  const totalBudgetDZD = estimatedFuelBudgetDZD + Number(tollFeesDZD) + Number(perDiemDZD);

  const handleOpenCreate = () => {
    setTitle('Mission de Transport & Déplacement Professionnel');
    setPurpose('Supervision technique et acheminement de matériel sur site client.');
    setDepartureCity('Alger');
    setDepartureWilaya('16 - Alger');
    setDestinationCity('Hassi Messaoud');
    setDestinationWilaya('30 - Ouargla');
    setIntermediateStopsText('Djelfa, Ghardaïa, Ouargla');
    setEstimatedDistanceKm(820);
    setTollFeesDZD(1600);
    setPerDiemDZD(18000);
    setNotes('Emprunter la RN1 Transsaharienne puis RN49. Signalisation obligatoire aux postes de contrôle de la Gendarmerie.');
    setIsCreateModalOpen(true);
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    const intermediateStops = intermediateStopsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      purpose: purpose.trim(),
      departureCity: departureCity.trim(),
      departureWilaya: departureWilaya.trim(),
      destinationCity: destinationCity.trim(),
      destinationWilaya: destinationWilaya.trim(),
      intermediateStops,
      departureDate,
      departureTime,
      returnDate,
      returnTime,
      vehicleId: selectedVehicle?.id || 'v-1',
      vehiclePlate: selectedVehicle?.plate || '04512-118-16',
      vehicleModel: `${selectedVehicle?.make} ${selectedVehicle?.model}`,
      driverId: selectedDriver?.id || 'd-1',
      driverName: selectedDriver?.name || 'Conducteur',
      driverPhone: selectedDriver?.phone || '',
      driverLicenseNumber: selectedDriver?.licenseNumber || 'ALG-00000-B',
      driverLicenseCategory: selectedDriver?.licenseCategories.join(', ') || 'B',
      estimatedDistanceKm: Number(estimatedDistanceKm),
      estimatedFuelBudgetDZD,
      tollFeesDZD: Number(tollFeesDZD),
      perDiemDZD: Number(perDiemDZD),
      totalBudgetDZD,
      status: 'approved',
      signedBy: 'Directeur des Moyens Généraux',
      signedAt: new Date().toISOString(),
      officialSeal: true,
      notes: notes.trim(),
    };

    try {
      const res = await fetch('/api/fleet/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to create mission:', err);
    }
  };

  const handleStatusChange = async (missionId: string, newStatus: MissionOrder['status']) => {
    try {
      await fetch(`/api/fleet/missions/${missionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to update mission status:', err);
    }
  };

  const handleDeleteMission = async (missionId: string, orderNumber: string) => {
    if (!window.confirm(`Supprimer l'ordre de mission ${orderNumber} ?`)) return;
    try {
      await fetch(`/api/fleet/missions/${missionId}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete mission:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredMissions = missions.filter(m => {
    const matchesSearch =
      m.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destinationCity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFuelBudget = missions.reduce((acc, m) => acc + m.estimatedFuelBudgetDZD, 0);
  const totalMissionsBudget = missions.reduce((acc, m) => acc + m.totalBudgetDZD, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Réglementation Routière Algérienne
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gestion des Trajets & Ordres de Mission Officiels
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Édition et impression des documents de circulation conformes pour la Gendarmerie et la Sûreté Nationale (DGSN)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Créer un Ordre de Mission
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Missions Totales</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{missions.length}</span>
            <span className="text-xs text-slate-400">enregistrées</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">En Cours / Approuvées</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 tracking-tight">
              {missions.filter(m => m.status === 'in_progress' || m.status === 'approved').length}
            </span>
            <span className="text-xs text-slate-400">sur la route</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Carburant Prévu</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {totalFuelBudget.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">DA</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Missions Global</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {totalMissionsBudget.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">DA</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Inclus carburant + péages + per diem</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="N° OM, destination, chauffeur, véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tous ({missions.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'in_progress' ? 'bg-sky-500/15 text-sky-700 dark:bg-sky-600/30 dark:text-sky-300 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            En Cours
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'approved' ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-600/30 dark:text-emerald-300 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Validés
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'completed' ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Terminés
          </button>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        {filteredMissions.map((mission) => {
          return (
            <div
              key={mission.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-sm font-extrabold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                    {mission.orderNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    mission.status === 'in_progress'
                      ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40 animate-pulse'
                      : mission.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                      : mission.status === 'completed'
                      ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  }`}>
                    {mission.status === 'in_progress' ? 'En Mission' :
                     mission.status === 'approved' ? 'Validé Officiel' :
                     mission.status === 'completed' ? 'Terminé' : 'Brouillon'}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    {mission.title}
                  </span>
                </div>

                {/* Itinerary route badge */}
                <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{mission.departureCity} ({mission.departureWilaya})</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                  {mission.intermediateStops && mission.intermediateStops.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Via {mission.intermediateStops.join(', ')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    <span>{mission.destinationCity} ({mission.destinationWilaya})</span>
                  </div>

                  <span className="ml-auto font-mono text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30 px-2 py-0.5 rounded text-[11px] font-bold">
                    {mission.estimatedDistanceKm} km
                  </span>
                </div>

                {/* Driver & Vehicle & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span>Chauffeur : <strong className="text-slate-900 dark:text-white">{mission.driverName}</strong> (Permis {mission.driverLicenseCategory})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                    <span>Véhicule : <strong className="font-mono text-slate-900 dark:text-white">{mission.vehiclePlate}</strong> ({mission.vehicleModel})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Du {mission.departureDate} ({mission.departureTime}) au {mission.returnDate} ({mission.returnTime})</span>
                  </div>
                </div>
              </div>

              {/* Right side: Budgets & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Budget Total Alloué</span>
                  <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                    {mission.totalBudgetDZD.toLocaleString('fr-DZ')} <span className="text-xs text-amber-600 dark:text-amber-400">DA</span>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                    Carburant: {mission.estimatedFuelBudgetDZD.toLocaleString('fr-DZ')} DA | Frais: {(mission.tollFeesDZD + mission.perDiemDZD).toLocaleString('fr-DZ')} DA
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {mission.status === 'approved' && (
                    <button
                      onClick={() => handleStatusChange(mission.id, 'in_progress')}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Démarrer
                    </button>
                  )}
                  {mission.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(mission.id, 'completed')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Clôturer
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedMissionForPrint(mission)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Imprimer OM</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMission(mission.id, mission.orderNumber)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MISSION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Créer un Ordre de Mission Officiel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paramétrage de l'itinéraire, association véhicule/chauffeur et calcul automatique des frais (DA)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
              {/* Section 1: Objet & Intitulé */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  1. Objet & Motif de la Mission
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Intitulé de la Mission <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Livraison d'équipement critique"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Motif Réglementaire / Objet Détaillé <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maintenance technique base vie pétrolière"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Circuit Logistique & Villes */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> 2. Circuit Logistique & Étapes Autorisées
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ville & Wilaya de Départ
                    </label>
                    <input
                      type="text"
                      required
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ville & Wilaya de Destination
                    </label>
                    <input
                      type="text"
                      required
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Villes et Postes de Transit / Étapes (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Blida, Chlef, Relizane"
                    value={intermediateStopsText}
                    onChange={(e) => setIntermediateStopsText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Mentionné expressément sur l'Ordre de Mission pour les barrages de contrôle.</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date Départ
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Heure Départ
                    </label>
                    <input
                      type="time"
                      required
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date Retour
                    </label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Heure Retour
                    </label>
                    <input
                      type="time"
                      required
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Affectation Dynamique Véhicule + Chauffeur */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" /> 3. Affectation Dynamique (Véhicule & Chauffeur Qualifié)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Véhicule Disponible <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    >
                      {availableVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.plate} — {v.make} {v.model} ({v.fuelType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chauffeur Affecté <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {availableDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} — Permis {d.licenseCategories.join(', ')} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Calcul Automatique des Coûts & Budgets en DA */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Fuel className="w-4 h-4" /> 4. Estimation Kilométrique & Budget Prévisionnel (Dinars Algériens)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Distance Estimée (km)
                    </label>
                    <input
                      type="number"
                      value={estimatedDistanceKm}
                      onChange={(e) => setEstimatedDistanceKm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Frais de Péage Autoroutier (DA)
                    </label>
                    <input
                      type="number"
                      value={tollFeesDZD}
                      onChange={(e) => setTollFeesDZD(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Indemnités de Déplacement / Per Diem (DA)
                    </label>
                    <input
                      type="number"
                      value={perDiemDZD}
                      onChange={(e) => setPerDiemDZD(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Auto Calculated Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      Carburant estimé : <strong className="text-slate-900 dark:text-white">{estimatedFuelLiters} L</strong> de {selectedVehicle?.fuelType === 'diesel' ? 'Gasoil' : 'Essence'} à {pricePerLiter} DA/L = <strong className="text-amber-600 dark:text-amber-400">{estimatedFuelBudgetDZD.toLocaleString('fr-DZ')} DA</strong>
                    </div>
                    <div>
                      Péage & Per Diem chauffeur : <strong className="text-slate-900 dark:text-white">{(Number(tollFeesDZD) + Number(perDiemDZD)).toLocaleString('fr-DZ')} DA</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Total Budget Mission</span>
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {totalBudgetDZD.toLocaleString('fr-DZ')} <span className="text-sm">DA</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  Valider & Générer l'Ordre de Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE ORDRE DE MISSION MODAL (Algérie Road Control Standards) */}
      {selectedMissionForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between no-print">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Document officiel pour contrôles Gendarmerie (1055) & Sûreté Nationale (1548)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimer le Document (A4)
                </button>
                <button
                  onClick={() => setSelectedMissionForPrint(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content (Styled for Official Algerian Administrative Look) */}
            <div className="p-8 overflow-y-auto flex-1 bg-white text-black font-serif print:p-0 print:m-0 print:shadow-none">
              {/* Official Algerian Republic Header */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <p className="font-bold text-sm tracking-widest uppercase">
                  RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
                </p>
                <p className="text-xs font-semibold mt-1">
                  MINISTÈRE DES TRANSPORTS & DES TRAVAUX PUBLICS
                </p>
                <p className="text-xs font-bold uppercase mt-1 tracking-wider text-slate-800">
                  ENTREPRISE / ÉTABLISSEMENT PUBLIC • DIRECTION DES MOYENS GÉNÉRAUX & DU PARC
                </p>
              </div>

              {/* Title & Order Reference */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-dashed border-slate-400">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight font-sans">
                    ORDRE DE MISSION
                  </h1>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">
                    Réf. Réglementaire : Arrêté interministériel relatif aux autorisations de circulation des flottes
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base font-bold bg-slate-100 border border-slate-400 px-3 py-1 rounded">
                    N° : {selectedMissionForPrint.orderNumber}
                  </div>
                  <span className="text-[11px] text-slate-600 font-sans">Date d'édition : {new Date().toLocaleDateString('fr-DZ')}</span>
                </div>
              </div>

              {/* Identity & Vehicle Grids */}
              <div className="grid grid-cols-2 gap-6 mb-6 font-sans text-xs">
                {/* Driver Block */}
                <div className="border border-slate-300 p-4 rounded-lg bg-slate-50">
                  <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    I. CHAUFFEUR DÉSIGNÉ
                  </h3>
                  <div className="space-y-1.5 leading-relaxed">
                    <p><strong>Nom & Prénom :</strong> {selectedMissionForPrint.driverName}</p>
                    <p><strong>N° Permis de Conduire :</strong> <span className="font-mono">{selectedMissionForPrint.driverLicenseNumber}</span></p>
                    <p><strong>Catégories Détenues :</strong> {selectedMissionForPrint.driverLicenseCategory}</p>
                    <p><strong>Téléphone Professionnel :</strong> {selectedMissionForPrint.driverPhone}</p>
                    <p><strong>Rattachement :</strong> Pool Chauffeurs / Moyens Généraux</p>
                  </div>
                </div>

                {/* Vehicle Block */}
                <div className="border border-slate-300 p-4 rounded-lg bg-slate-50">
                  <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    II. VÉHICULE DE SERVICE AFFECTÉ
                  </h3>
                  <div className="space-y-1.5 leading-relaxed">
                    <p><strong>Immatriculation (Matricule) :</strong> <span className="font-mono font-bold text-sm">{selectedMissionForPrint.vehiclePlate}</span></p>
                    <p><strong>Marque & Type :</strong> {selectedMissionForPrint.vehicleModel}</p>
                    <p><strong>Statut Administratif :</strong> En règle (Assurance & Contrôle Technique à jour)</p>
                    <p><strong>Ravitaillement :</strong> Carte Carburant Naftal Entreprise</p>
                  </div>
                </div>
              </div>

              {/* Itinerary & Circuit Block */}
              <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 mb-6 font-sans text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  III. ITINÉRAIRE AUTORISÉ & ÉTAPES RÉGLEMENTAIRES
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p><strong>Point de Départ :</strong> {selectedMissionForPrint.departureCity} ({selectedMissionForPrint.departureWilaya})</p>
                    <p><strong>Date & Heure de Départ :</strong> {selectedMissionForPrint.departureDate} à {selectedMissionForPrint.departureTime}</p>
                  </div>
                  <div>
                    <p><strong>Lieu de Destination :</strong> {selectedMissionForPrint.destinationCity} ({selectedMissionForPrint.destinationWilaya})</p>
                    <p><strong>Date & Heure de Retour Prévue :</strong> {selectedMissionForPrint.returnDate} à {selectedMissionForPrint.returnTime}</p>
                  </div>
                </div>
                {selectedMissionForPrint.intermediateStops && selectedMissionForPrint.intermediateStops.length > 0 && (
                  <p className="mt-1">
                    <strong>Villes et Postes de Transit Autorisés :</strong> {selectedMissionForPrint.intermediateStops.join(' — ')}
                  </p>
                )}
                <p className="mt-1">
                  <strong>Distance Prévisionnelle Aller-Retour :</strong> {selectedMissionForPrint.estimatedDistanceKm} km
                </p>
              </div>

              {/* Mission Purpose */}
              <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 mb-6 font-sans text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
                  IV. OBJET & MOTIF OFFICIEL DE LA MISSION
                </h3>
                <p className="leading-relaxed">
                  {selectedMissionForPrint.purpose}
                </p>
                {selectedMissionForPrint.notes && (
                  <p className="text-slate-600 mt-1 italic">
                    Instructions spécifiques : {selectedMissionForPrint.notes}
                  </p>
                )}
              </div>

              {/* Regulatory Notice & Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-black font-sans text-xs">
                <div>
                  <p className="font-bold text-[11px] uppercase text-slate-700 mb-1">
                    Réquisition & Contrôle Routier :
                  </p>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    Les officiers et sous-officiers de la Gendarmerie Nationale, les fonctionnaires de la Sûreté Nationale et les agents de contrôle des transports sont priés de prêter aide et assistance au porteur du présent ordre de mission en cas de besoin.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-14 h-14 border border-black flex items-center justify-center text-[9px] font-mono text-center">
                      [QR CODE SÉCURISÉ]
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Certifié Dz-Fleet AI<br />
                      Loi 18-07 / ANPDP
                    </span>
                  </div>
                </div>

                <div className="text-center flex flex-col justify-between">
                  <div>
                    <p className="font-bold uppercase text-xs">
                      Pour le Directeur Général,
                    </p>
                    <p className="text-xs text-slate-700">
                      Le Directeur des Moyens Généraux & de la Mobilité
                    </p>
                  </div>

                  <div className="my-3 flex items-center justify-center">
                    <div className="border-2 border-red-700 text-red-700 font-bold text-xs uppercase px-4 py-2 rounded-full transform -rotate-6 tracking-widest opacity-80">
                      ★ CACHET OFFICIEL DIRECTION ★
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    Signature & Visa Réglementaire
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
