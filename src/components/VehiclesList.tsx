import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Shield, 
  FileCheck, 
  User, 
  Gauge, 
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Archive
} from 'lucide-react';
import { Vehicle, Driver } from '../types.js';
import { VehicleFormModal } from './VehicleFormModal.js';

interface VehiclesListProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData?: () => void;
}

export const VehiclesList: React.FC<VehiclesListProps> = ({
  vehicles,
  drivers,
  onSelectVehicle,
  onNavigateTab,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const handleOpenAdd = () => {
    setVehicleToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setVehicleToEdit(v);
    setIsFormModalOpen(true);
  };

  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (vehicleToEdit) {
        await fetch(`/api/fleet/vehicles/${vehicleToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });
      } else {
        await fetch('/api/fleet/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });
      }
      setIsFormModalOpen(false);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to save vehicle:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: Vehicle['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/fleet/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              Parc Automobile & Mobilité
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Parc Automobile de l'Entreprise</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi des {vehicles.length} véhicules, fiches techniques, pneumatiques et échéances réglementaires (Algérie)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Véhicule
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Matricule (ex: 04512-118-16), marque, chauffeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'active' ? 'bg-emerald-600/30 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            En service
          </button>
          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'maintenance' ? 'bg-amber-600/30 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            En révision
          </button>
          <button
            onClick={() => setStatusFilter('accident')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'accident' ? 'bg-rose-600/30 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sinistre
          </button>
          <button
            onClick={() => setStatusFilter('retired')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'retired' ? 'bg-slate-600/30 text-slate-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Réforme
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((v) => {
          const servicePercentage = Math.min(100, Math.round(((v.mileage - v.lastServiceKm) / (v.nextServiceKm - v.lastServiceKm)) * 100));
          const isOverdue = v.mileage >= v.nextServiceKm;
          const avgTires = v.tires 
            ? Math.round((v.tires.frontLeft + v.tires.frontRight + v.tires.rearLeft + v.tires.rearRight) / 4)
            : 85;

          return (
            <div
              key={v.id}
              onClick={() => onSelectVehicle(v)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Vehicle Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800 group-hover:border-emerald-500/40 transition-colors">
                        {v.plate}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        v.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : v.status === 'maintenance'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : v.status === 'accident'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : v.status === 'retired'
                          ? 'bg-slate-700 text-slate-300 border-slate-600'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {v.status === 'active' ? 'En Service' : 
                         v.status === 'maintenance' ? 'En Révision' : 
                         v.status === 'accident' ? 'En Sinistre' : 
                         v.status === 'retired' ? 'Réforme Admin.' : 'Disponible'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Année {v.year} • Motorisation : <span className="font-semibold text-slate-300 uppercase">{v.fuelType === 'diesel' ? 'Gasoil' : v.fuelType === 'essence' ? 'Sans Plomb' : 'GPL/Sirghaz'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(v, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Modifier la fiche technique"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Driver & Assignment */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Chauffeur Titulaire</span>
                      <span className="font-semibold text-white">{v.driverName}</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{v.driverPhone}</span>
                </div>

                {/* Odometer & Tire health */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Gauge className="w-3.5 h-3.5 text-sky-400" /> Odomètre
                    </span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {v.mileage.toLocaleString('fr-DZ')} <span className="text-xs font-normal text-slate-400">km</span>
                    </span>
                  </div>

                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" /> Pneumatiques
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-base font-bold font-mono ${avgTires < 50 ? 'text-rose-400' : avgTires < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {avgTires}%
                      </span>
                      <span className="text-[10px] text-slate-400">santé moy.</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      Prochaine Vidange Naftal
                    </span>
                    <span className={`font-mono font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                      {v.nextServiceKm.toLocaleString('fr-DZ')} km
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverdue ? 'bg-rose-500' : servicePercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${servicePercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Insurance & Regulatory Deadlines */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Assurance : <strong className="text-slate-200">{v.insuranceCompany || 'CAAT'}</strong> ({v.insuranceExpiry})
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                    CT : {v.technicalControlExpiry}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                  Fiche Détaillée & Entretien →
                </span>

                <div className="flex items-center gap-1.5">
                  {v.status === 'active' && (
                    <button
                      onClick={(e) => handleUpdateStatus(v.id, 'maintenance', e)}
                      className="px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 text-[10px] font-bold"
                      title="Mettre en maintenance / révision atelier"
                    >
                      Mettre en Révision
                    </button>
                  )}
                  {v.status === 'maintenance' && (
                    <button
                      onClick={(e) => handleUpdateStatus(v.id, 'active', e)}
                      className="px-2 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold"
                      title="Remettre en service opérationnel"
                    >
                      Remettre en Service
                    </button>
                  )}
                  {v.status !== 'retired' && (
                    <button
                      onClick={(e) => handleUpdateStatus(v.id, 'retired', e)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold"
                      title="Mettre en réforme administrative"
                    >
                      Réforme
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Add / Edit Modal */}
      <VehicleFormModal
        vehicle={vehicleToEdit}
        drivers={drivers}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveVehicle}
      />
    </div>
  );
};
