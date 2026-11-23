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
  Archive,
  ShieldCheck,
  Truck,
  Layers,
  Cpu,
  Settings2,
  Eye,
  FileText,
  DollarSign,
  X,
  RotateCcw
} from 'lucide-react';
import { Vehicle, Driver, UserSession, VehicleCategory, OperationalMissionStatus } from '../types.js';
import { VehicleFormModal } from './VehicleFormModal.js';

interface VehiclesListProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData?: () => void;
  userSession?: UserSession;
}

export const VehiclesList: React.FC<VehiclesListProps> = ({
  vehicles,
  drivers,
  onSelectVehicle,
  onNavigateTab,
  onRefreshData,
  userSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [operationalStatusFilter, setOperationalStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [makeFilter, setMakeFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [mileageRangeFilter, setMileageRangeFilter] = useState<string>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [previewCarteGrise, setPreviewCarteGrise] = useState<{ title: string; url: string } | null>(null);

  // Valeurs uniques dynamiques pour les sélecteurs de filtres
  const availableMakes = Array.from(new Set(vehicles.map(v => v.make))).filter(Boolean).sort();
  const availableModels = Array.from(new Set(
    vehicles
      .filter(v => makeFilter === 'all' || v.make.toLowerCase() === makeFilter.toLowerCase())
      .map(v => v.model)
  )).filter(Boolean).sort();
  const availableYears = Array.from(new Set(vehicles.map(v => v.registrationYear || v.year))).filter(Boolean).sort((a, b) => b - a);

  const hasActiveFilters = searchTerm !== '' || 
    statusFilter !== 'all' || 
    operationalStatusFilter !== 'all' || 
    categoryFilter !== 'all' || 
    fuelFilter !== 'all' || 
    yearFilter !== 'all' || 
    makeFilter !== 'all' || 
    modelFilter !== 'all' ||
    mileageRangeFilter !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setOperationalStatusFilter('all');
    setCategoryFilter('all');
    setFuelFilter('all');
    setYearFilter('all');
    setMakeFilter('all');
    setModelFilter('all');
    setMileageRangeFilter('all');
  };

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

  // Filtrage multi-critères approfondi du Parc Automobile
  const filteredVehicles = vehicles.filter((v) => {
    // 1. Recherche textuelle multi-champs
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      v.plate.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.driverName && v.driverName.toLowerCase().includes(q)) ||
      (v.chassisNumber && v.chassisNumber.toLowerCase().includes(q));

    // 2. Statut rapide (cycle de vie principal)
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

    // 3. Statut opérationnel d'affectation
    const matchesOpStatus = operationalStatusFilter === 'all' || 
      v.operationalMissionStatus === operationalStatusFilter;

    // 4. Catégorie / Type de véhicule (VP, VU, PL, SM, Bus)
    const matchesCategory = categoryFilter === 'all' || 
      (v.vehicleCategory || 'VP') === categoryFilter;

    // 5. Type de carburant / Motorisation (diesel, essence, gpl)
    const matchesFuel = fuelFilter === 'all' || 
      v.fuelType === fuelFilter;

    // 6. Année d'immatriculation / mise en circulation
    const vehicleRegYear = String(v.registrationYear || v.year);
    const matchesYear = yearFilter === 'all' || 
      vehicleRegYear === yearFilter;

    // 7. Marque du constructeur
    const matchesMake = makeFilter === 'all' || 
      v.make.toLowerCase() === makeFilter.toLowerCase();

    // 8. Modèle de véhicule
    const matchesModel = modelFilter === 'all' ||
      v.model.toLowerCase() === modelFilter.toLowerCase();

    // 9. Tranches de kilométrage
    let matchesMileage = true;
    if (mileageRangeFilter === '0-50000') {
      matchesMileage = v.mileage < 50000;
    } else if (mileageRangeFilter === '50000-100000') {
      matchesMileage = v.mileage >= 50000 && v.mileage <= 100000;
    } else if (mileageRangeFilter === '100000-200000') {
      matchesMileage = v.mileage > 100000 && v.mileage <= 200000;
    } else if (mileageRangeFilter === '200000+') {
      matchesMileage = v.mileage > 200000;
    }

    return matchesSearch && matchesStatus && matchesOpStatus && matchesCategory && matchesFuel && matchesYear && matchesMake && matchesModel && matchesMileage;
  });

  const getOperationalStatusBadge = (status?: OperationalMissionStatus) => {
    switch (status) {
      case 'reserve_depot':
        return {
          label: 'En Réserve (Dépôt)',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
        };
      case 'en_mission':
        return {
          label: 'En Mission Active',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
        };
      case 'retour_mission':
        return {
          label: 'Retour de Mission',
          className: 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30'
        };
      case 'maintenance':
        return {
          label: 'En Révision Atelier',
          className: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
        };
      case 'sinistre':
        return {
          label: 'En Sinistre / Constat',
          className: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
        };
      case 'reforme':
        return {
          label: 'Réforme Administrative',
          className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
        };
      default:
        return {
          label: 'En Réserve (Dépôt)',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
        };
    }
  };

  const getCategoryBadge = (category?: VehicleCategory) => {
    switch (category) {
      case 'VP':
        return { label: 'VP (Particulier)', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40' };
      case 'VU':
        return { label: 'VU (Utilitaire)', badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/40' };
      case 'PL':
        return { label: 'PL (Poids Lourd > 3.5T)', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40' };
      case 'SM':
        return { label: 'SM (Semi-Remorque)', badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40' };
      case 'Bus':
        return { label: 'Bus (Voyageurs)', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40' };
      default:
        return { label: 'VP (Particulier)', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        {userSession?.role === 'maintenance_lead' ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                Atelier & Disponibilité Technique
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Santé Technique du Parc & Pneumatiques</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Supervision des {vehicles.length} véhicules : odomètre, pneumatiques au km, cycle de vidange Naftal et caractéristiques mécaniques
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />
                Parc Automobile & Mobilité
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Parc Automobile de l'Entreprise</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Suivi des {vehicles.length} véhicules • Spécifications mécaniques, PTAC/PTRA, Cartes Grises et usure kilométrique
            </p>
          </div>
        )}

        {userSession?.role === 'super_admin' ? (
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Mode Audit DSI (Lecture Seule)</span>
          </div>
        ) : userSession?.role === 'maintenance_lead' ? (
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Supervision Atelier & Entretien</span>
          </div>
        ) : userSession?.role === 'controller' ? (
          <div className="px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <DollarSign className="w-4 h-4 text-sky-500" />
            <span>Audit Actifs & Amortissements</span>
          </div>
        ) : (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Véhicule
          </button>
        )}
      </div>

      {/* Bannières de Gouvernance & Moindre Privilège */}
      {userSession?.role === 'super_admin' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <strong>Gouvernance & Moindre Privilège (Loi 18-07) : </strong>
            En tant que Super Administrateur (DSI), ce module est en <strong>consultation et audit</strong>. L'enregistrement (CRUD) de nouveaux véhicules appartient au <strong>Gestionnaire de Flotte</strong>.
          </div>
        </div>
      )}

      {userSession?.role === 'maintenance_lead' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <Wrench className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <strong>Rôle Responsable Maintenance (Atelier & Santé Véhicules) : </strong>
            Vous supervisez l'état mécanique, les pneumatiques et les passages en révision atelier. L'ajout de véhicules, la modification des fiches administratives et la mise en réforme sont strictement réservés au <strong>Gestionnaire de Flotte</strong>.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRE DE RECHERCHE & FILTRES MULTI-CRITÈRES AVANCÉS DU PARC              */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs space-y-4">
        {/* Ligne 1 : Recherche textuelle + Filtres Statut Rapides */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Recherche par matricule (ex: 04512-118-16), marque, modèle, chauffeur, châssis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0c121e] p-1 rounded-xl border border-slate-200 dark:border-[#1e2a3f] text-xs flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white dark:bg-[#1c273e] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tous ({vehicles.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-600/30 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              En service ({vehicles.filter(v => v.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('maintenance')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'maintenance' ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-600/30 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              En révision ({vehicles.filter(v => v.status === 'maintenance' || v.operationalMissionStatus === 'maintenance').length})
            </button>
            <button
              onClick={() => setStatusFilter('accident')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'accident' ? 'bg-rose-500/15 text-rose-700 dark:bg-rose-600/30 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sinistre ({vehicles.filter(v => v.status === 'accident' || v.operationalMissionStatus === 'sinistre').length})
            </button>
            <button
              onClick={() => setStatusFilter('retired')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'retired' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Réforme ({vehicles.filter(v => v.status === 'retired').length})
            </button>
          </div>
        </div>

        {/* Ligne 2 : Type de Véhicule (Catégories VP, VU, PL, SM, Bus) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Type :
          </span>
          {[
            { id: 'all', label: `Tous types (${vehicles.length})` },
            { id: 'VP', label: `VP - Particulier (${vehicles.filter(v => (v.vehicleCategory || 'VP') === 'VP').length})` },
            { id: 'VU', label: `VU - Utilitaire (${vehicles.filter(v => v.vehicleCategory === 'VU').length})` },
            { id: 'PL', label: `PL - Poids Lourd (${vehicles.filter(v => v.vehicleCategory === 'PL').length})` },
            { id: 'SM', label: `SM - Semi-Remorque (${vehicles.filter(v => v.vehicleCategory === 'SM').length})` },
            { id: 'Bus', label: `Bus - Voyageurs (${vehicles.filter(v => v.vehicleCategory === 'Bus').length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
                categoryFilter === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                  : 'bg-white dark:bg-[#121929] border-slate-200 dark:border-[#1e2a3f] text-slate-600 dark:text-slate-300 hover:border-emerald-500/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Ligne 3 : Filtres Combinatoires Détaillés (Marque, Modèle, Année d'immatriculation, Kilométrage, Carburant, Affectation) */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#1e2a3f] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* 1. Marque */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              Marque
            </label>
            <select
              value={makeFilter}
              onChange={(e) => {
                setMakeFilter(e.target.value);
                setModelFilter('all');
              }}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Toutes marques ({availableMakes.length})</option>
              {availableMakes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* 2. Modèle */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              Modèle
            </label>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">
                {makeFilter !== 'all' ? `Tous modèles ${makeFilter}` : `Tous modèles (${availableModels.length})`}
              </option>
              {availableModels.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

          {/* 3. Année d'immatriculation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Année Immat.
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Toutes années ({availableYears.length})</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>Immat. {yr}</option>
              ))}
            </select>
          </div>

          {/* 4. Type de Carburant / Motorisation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Fuel className="w-3 h-3 text-sky-500" />
              Type Carburant
            </label>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tous carburants</option>
              <option value="diesel">Gasoil / Diesel (Naftal)</option>
              <option value="essence">Sans Plomb / Essence</option>
              <option value="gpl">GPL / Sirghaz</option>
            </select>
          </div>

          {/* 5. Kilométrage (Tranches d'odomètre) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-500" />
              Kilométrage
            </label>
            <select
              value={mileageRangeFilter}
              onChange={(e) => setMileageRangeFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tous kilométrages</option>
              <option value="0-50000">&lt; 50 000 km</option>
              <option value="50000-100000">50 000 - 100 000 km</option>
              <option value="100000-200000">100 000 - 200 000 km</option>
              <option value="200000+">&gt; 200 000 km</option>
            </select>
          </div>

          {/* 6. Affectation & Statut Opérationnel */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              Affectation
            </label>
            <select
              value={operationalStatusFilter}
              onChange={(e) => setOperationalStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Toutes affectations</option>
              <option value="reserve_depot">En Réserve (Dépôt)</option>
              <option value="en_mission">En Mission Active</option>
              <option value="retour_mission">Retour de Mission</option>
              <option value="maintenance">En Révision Atelier</option>
              <option value="sinistre">En Sinistre</option>
              <option value="reforme">Réforme Administrative</option>
            </select>
          </div>

          {/* 7. Compteur de véhicules & Bouton Réinitialiser */}
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2 py-1.5 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Affichage</span>
              <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                {filteredVehicles.length} / {vehicles.length}
              </strong>
            </div>

            <button
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              title="Réinitialiser tous les filtres"
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                hasActiveFilters
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-pointer shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1c273e] text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((v) => {
          const servicePercentage = Math.min(100, Math.round(((v.mileage - v.lastServiceKm) / (v.nextServiceKm - v.lastServiceKm)) * 100));
          const isOverdue = v.mileage >= v.nextServiceKm;
          
          // 7. Usure des pneumatiques selon le kilométrage
          const kmSinceTireChange = Math.max(0, v.mileage - (v.lastTireChangeKm || 0));
          const tireLifespan = v.tireLifespanKm || 50000;
          const tireKmWear = v.tireWearPercentage !== undefined 
            ? v.tireWearPercentage 
            : Math.min(100, Math.round((kmSinceTireChange / tireLifespan) * 100));

          const opStatus = getOperationalStatusBadge(v.operationalMissionStatus);
          const catBadge = getCategoryBadge(v.vehicleCategory);

          return (
            <div
              key={v.id}
              onClick={() => onSelectVehicle(v)}
              className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset] hover:border-emerald-500/40 dark:hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Vehicle Header with Category & Operational Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#1c273e] px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/40 transition-colors">
                        {v.plate}
                      </span>
                      {/* 8. Catégorie (VP/VU/PL/SM/Bus) */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${catBadge.badge}`}>
                        {v.vehicleCategory || 'VP'}
                      </span>
                      {/* Année d'immatriculation badge */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                        <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Immat. {v.registrationYear || v.year}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      {v.make} {v.model}
                    </h3>
                    
                    {/* Année d'immatriculation et motorisation */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#162135] px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/80">
                        <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Année d'immatriculation : <strong className="font-mono text-slate-900 dark:text-white font-bold">{v.registrationYear || v.year}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
                        <Fuel className="w-3 h-3 text-sky-500" />
                        {v.fuelType === 'diesel' ? 'Gasoil' : v.fuelType === 'essence' ? 'Sans Plomb' : 'GPL'}
                      </span>
                    </div>
                  </div>

                  {/* 1. État du véhicule affecté / sortie des missions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${opStatus.className}`}>
                      {opStatus.label}
                    </span>

                    {userSession?.role === 'fleet_manager' && (
                      <button
                        onClick={(e) => handleOpenEdit(v, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Modifier la fiche technique"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2, 3 & 4. Caractéristiques Moteur, Transmission & Traction (Essieux) */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-amber-500" /> Motorisation & Boîte :
                    </span>
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {v.engineDisplacement || '1.6L'} ({v.engineCylinders || 4} cyl.) • {v.transmissionType || 'Manuelle'} {v.transmissionGears ? `${v.transmissionGears}v` : ''}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                      <Settings2 className="w-3.5 h-3.5 text-sky-500" /> Traction (Essieux) :
                    </span>
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-[10px]">
                      {v.drivetrain || '4x2'}
                    </span>
                  </div>

                  {/* 8. Poids réglementaires (PTAC / PTRA) si renseignés */}
                  {(v.ptacKg || v.ptraKg) && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>PTAC : <strong className="text-slate-800 dark:text-white">{v.ptacKg?.toLocaleString('fr-DZ')} kg</strong></span>
                      {v.ptraKg && (
                        <span>PTRA : <strong className="text-slate-800 dark:text-white">{v.ptraKg.toLocaleString('fr-DZ')} kg</strong></span>
                      )}
                      {v.enginePowerHP && (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{v.enginePowerHP} ch DIN</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 5 & 6. Coût d'Acquisition, Entretien Cumulé & Carte Grise Numérisée */}
                <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0c1420] border border-slate-200/80 dark:border-[#1e2a3f] flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">Acquisition</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {(v.acquisitionCostDZD || 2200000).toLocaleString('fr-DZ')} <span className="text-[10px] text-emerald-600">DA</span>
                      </span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold uppercase tracking-wider flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-amber-500" />
                        Entretien Cumulé
                      </span>
                      <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-xs">
                        {(v.totalMaintenanceCostDZD || 0).toLocaleString('fr-DZ')} <span className="text-[10px]">DA</span>
                      </span>
                    </div>
                  </div>

                  {/* 5. Carte Grise Button */}
                  {v.registrationDocUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewCarteGrise({
                          title: `Carte Grise Officielle — ${v.plate} (${v.make} ${v.model})`,
                          url: v.registrationDocUrl!
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#121929] hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/40 text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      title="Consulter la carte grise officielle numérisée"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Carte Grise</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Non numérisée</span>
                  )}
                </div>

                {/* Driver & Assignment */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Chauffeur Titulaire</span>
                      <span className="font-bold text-slate-900 dark:text-white">{v.driverName}</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px] font-semibold">{v.driverPhone}</span>
                </div>

                {/* 7. Usure des Pneumatiques selon le Kilométrage */}
                <div className="mt-3 p-2.5 rounded-xl bg-sky-50/40 dark:bg-[#0c121e] border border-sky-200/60 dark:border-[#1e2a3f] text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Gauge className="w-3.5 h-3.5 text-sky-500" /> 7. Usure Pneus au Km
                    </span>
                    <span className={`font-mono font-bold text-xs ${tireKmWear > 80 ? 'text-rose-500' : tireKmWear > 60 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {tireKmWear}% usure
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        tireKmWear > 80 ? 'bg-rose-500' : tireKmWear > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, tireKmWear)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>{kmSinceTireChange.toLocaleString('fr-DZ')} km roulés</span>
                    <span>Durée théorique : {tireLifespan.toLocaleString('fr-DZ')} km</span>
                  </div>
                </div>

                {/* Odometer & Next Service */}
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-slate-50 dark:bg-[#0c121e] p-2 rounded-xl border border-slate-200/80 dark:border-[#1e2a3f]">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-medium block">
                      Odomètre Actuel
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                      {v.mileage.toLocaleString('fr-DZ')} <span className="text-[10px] font-normal text-slate-400">km</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0c121e] p-2 rounded-xl border border-slate-200/80 dark:border-[#1e2a3f]">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-medium block">
                      Prochaine Vidange
                    </span>
                    <span className={`text-sm font-bold font-mono mt-0.5 block ${isOverdue ? 'text-rose-500 font-bold' : 'text-slate-900 dark:text-white'}`}>
                      {v.nextServiceKm.toLocaleString('fr-DZ')} <span className="text-[10px] font-normal text-slate-400">km</span>
                    </span>
                  </div>
                </div>

                {/* Insurance & Regulatory Deadlines */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    Assurance : <strong className="text-slate-700 dark:text-slate-200">{v.insuranceCompany || 'CAAT'}</strong> ({v.insuranceExpiry})
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                    CT : {v.technicalControlExpiry}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                  Fiche Détaillée & Entretien →
                </span>

                {(userSession?.role === 'fleet_manager' || userSession?.role === 'maintenance_lead') ? (
                  <div className="flex items-center gap-1.5">
                    {v.status === 'active' && (
                      <button
                        onClick={(e) => handleUpdateStatus(v.id, 'maintenance', e)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-[#201a14] dark:hover:bg-[#2c221a] dark:text-amber-300 dark:border-amber-500/30 text-[10px] font-bold cursor-pointer"
                        title="Mettre en maintenance / révision atelier"
                      >
                        Mettre en Révision
                      </button>
                    )}
                    {v.status === 'maintenance' && (
                      <button
                        onClick={(e) => handleUpdateStatus(v.id, 'active', e)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800/60 text-[10px] font-bold"
                        title="Remettre en service opérationnel"
                      >
                        Remettre en Service
                      </button>
                    )}
                    {userSession?.role === 'fleet_manager' && v.status !== 'retired' && (
                      <button
                        onClick={(e) => handleUpdateStatus(v.id, 'retired', e)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 text-[10px] font-bold"
                        title="Mettre en réforme administrative"
                      >
                        Réforme
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium">
                    Lecture Seule (Audit)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* État vide si aucun véhicule ne correspond aux filtres */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-[#121929] rounded-3xl border border-slate-200 dark:border-[#1e2a3f] p-8 space-y-3 shadow-xs">
          <Car className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun véhicule trouvé</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Aucun véhicule ne correspond aux critères de recherche sélectionnés (Année, Catégorie, Kilométrage, Statut, Carburant, Marque).
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser tous les filtres</span>
          </button>
        </div>
      )}

      {/* Vehicle Add / Edit Modal */}
      <VehicleFormModal
        vehicle={vehicleToEdit}
        drivers={drivers}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveVehicle}
      />

      {/* Modal Prévisualisation Carte Grise Numérisée */}
      {previewCarteGrise && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{previewCarteGrise.title}</h3>
              </div>
              <button
                onClick={() => setPreviewCarteGrise(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-[#070b12]">
              {previewCarteGrise.url.startsWith('data:image/') || previewCarteGrise.url.startsWith('http') ? (
                <img
                  src={previewCarteGrise.url}
                  alt={previewCarteGrise.title}
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-slate-700"
                />
              ) : previewCarteGrise.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewCarteGrise.url}
                  title={previewCarteGrise.title}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Document officiel numérisé</p>
                  <a
                    href={previewCarteGrise.url}
                    download="Carte_Grise_Vehicule.pdf"
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
                onClick={() => setPreviewCarteGrise(null)}
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
