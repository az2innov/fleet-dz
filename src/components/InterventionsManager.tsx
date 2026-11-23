import React, { useState } from 'react';
import { 
  Wrench, 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  X, 
  Save, 
  Eye, 
  CheckSquare, 
  ArrowRight,
  Gauge,
  ClipboardCheck,
  Shield,
  Layers,
  Sparkles,
  Download,
  Filter,
  RotateCcw,
  BarChart3,
  FileSpreadsheet,
  Fuel
} from 'lucide-react';
import { 
  VehicleIntervention, 
  Vehicle, 
  Driver, 
  UserSession, 
  InterventionType, 
  InterventionUrgency,
  InterventionNature,
  VehicleCategory 
} from '../types.js';

interface InterventionsManagerProps {
  interventions: VehicleIntervention[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onRefreshData: () => void;
  onNavigateTab: (tab: any) => void;
  userSession?: UserSession;
}

export const InterventionsManager: React.FC<InterventionsManagerProps> = ({
  interventions,
  vehicles,
  drivers,
  onRefreshData,
  onNavigateTab,
  userSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Advanced Filter states (Exigences de Recherche Multi-critères)
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedFuelFilter, setSelectedFuelFilter] = useState<string>('all');
  const [selectedNatureFilter, setSelectedNatureFilter] = useState<string>('all');
  const [dateStartFilter, setDateStartFilter] = useState<string>('');
  const [dateEndFilter, setDateEndFilter] = useState<string>('');

  // Document Print Modals
  const [selectedDIForPrint, setSelectedDIForPrint] = useState<VehicleIntervention | null>(null);
  const [selectedFRForPrint, setSelectedFRForPrint] = useState<VehicleIntervention | null>(null);

  // Modal 1: Create DI (Demande d'Intervention)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [natureIntervention, setNatureIntervention] = useState<InterventionNature>('preventive');
  const [interventionType, setInterventionType] = useState<InterventionType>('vidange_moteur');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<InterventionUrgency>('normal');
  const [garageType, setGarageType] = useState<'atelier_interne' | 'concessionnaire' | 'partenaire_conventionne'>('atelier_interne');
  const [garageName, setGarageName] = useState('Atelier Central Flotte & Mécanique (Alger)');
  const [dateSortieIntervention, setDateSortieIntervention] = useState(new Date().toISOString().slice(0, 16));
  const [estimatedDurationDays, setEstimatedDurationDays] = useState<number>(1);

  // Modal 2: Create FR (Fiche de Réception après travaux)
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [interventionToReceive, setInterventionToReceive] = useState<VehicleIntervention | null>(null);
  const [receptionDateReturn, setReceptionDateReturn] = useState(new Date().toISOString().slice(0, 16));
  const [receptionOdometerInKm, setReceptionOdometerInKm] = useState<number>(0);
  const [receptionCostDZD, setReceptionCostDZD] = useState<number>(15000);
  const [receptionWorkDetails, setReceptionWorkDetails] = useState('');
  const [receptionPartsText, setReceptionPartsText] = useState('Huile Naftal Chems 5W40, Filtre à huile, Filtre à air');
  const [receptionDecision, setReceptionDecision] = useState<'conforme_bon_service' | 'avec_reserves'>('conforme_bon_service');
  const [receptionNotes, setReceptionNotes] = useState('Véhicule testé sur route et déclaré parfaitement conforme pour le service.');
  
  // Quality check toggles
  const [chkBreaking, setChkBreaking] = useState(true);
  const [chkFluids, setChkFluids] = useState(true);
  const [chkTires, setChkTires] = useState(true);
  const [chkDashboard, setChkDashboard] = useState(true);
  const [chkRoadTest, setChkRoadTest] = useState(true);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const handleOpenCreateDI = () => {
    setTitle('Entretien & Contrôle Mécanique Préventif');
    setDescription('Travaux de révision générale, vidange moteur, vérification du système de freinage et contrôle des trains roulants.');
    setNatureIntervention('preventive');
    setInterventionType('vidange_moteur');
    setUrgency('normal');
    setGarageType('atelier_interne');
    setGarageName('Atelier Central Flotte & Mécanique (Alger)');
    setDateSortieIntervention(new Date().toISOString().slice(0, 16));
    setEstimatedDurationDays(1);
    setIsCreateModalOpen(true);
  };

  const handleCreateDI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const payload = {
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plate,
      vehicleMakeModel: `${selectedVehicle.make} ${selectedVehicle.model}`,
      vehicleCategory: selectedVehicle.vehicleCategory || 'VP',
      fuelType: selectedVehicle.fuelType || 'diesel',
      natureIntervention,
      odometerOutKm: selectedVehicle.mileage,
      driverId: selectedVehicle.driverId,
      driverName: selectedVehicle.driverName,
      driverPhone: selectedVehicle.driverPhone,
      type: interventionType,
      title: title.trim(),
      description: description.trim(),
      urgency,
      garageType,
      garageName: garageName.trim(),
      dateSortieIntervention,
      estimatedDurationDays: Number(estimatedDurationDays),
      requestedBy: userSession?.name || 'Karim Ziani (Gestionnaire de Flotte)',
      requestedByRole: (userSession?.role as any) || 'fleet_manager',
      requestDate: new Date().toISOString().split('T')[0],
      officialSealDI: true,
    };

    try {
      await fetch('/api/fleet/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsCreateModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error('Failed to create DI:', err);
    }
  };

  const handleTakeInCharge = async (itvId: string) => {
    try {
      await fetch(`/api/fleet/interventions/${itvId}/take-in-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceLeadName: userSession?.name || 'Mourad Hadj (Responsable Maintenance)',
        }),
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to take in charge:', err);
    }
  };

  const handleOpenReception = (itv: VehicleIntervention) => {
    setInterventionToReceive(itv);
    setReceptionDateReturn(new Date().toISOString().slice(0, 16));
    setReceptionOdometerInKm(itv.odometerOutKm + 15);
    setReceptionCostDZD(itv.type === 'vidange_moteur' ? 18500 : itv.type === 'freinage' ? 32000 : 25000);
    setReceptionWorkDetails(`Travaux de maintenance effectués avec succès sur ${itv.vehicleMakeModel}. Contrôles périodiques et remplacement des éléments usés.`);
    setReceptionPartsText('Filtres neufs, Huile Naftal homologuée, Pièces d\'origine constructeur');
    setReceptionDecision('conforme_bon_service');
    setReceptionNotes('Essai dynamique sur route concluant. Absence totale de vibration ou fuite.');
    setChkBreaking(true);
    setChkFluids(true);
    setChkTires(true);
    setChkDashboard(true);
    setChkRoadTest(true);
    setIsReceptionModalOpen(true);
  };

  const handleSubmitReception = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionToReceive) return;

    const parts = receptionPartsText
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const payload = {
      dateRetourIntervention: receptionDateReturn,
      odometerInKm: Number(receptionOdometerInKm),
      coutInterventionDZD: Number(receptionCostDZD),
      workDoneDetails: receptionWorkDetails.trim(),
      partsReplaced: parts,
      qualityChecks: {
        brakingTested: chkBreaking,
        fluidLevelsChecked: chkFluids,
        tiresInspected: chkTires,
        dashboardWarningsOff: chkDashboard,
        roadTested: chkRoadTest,
      },
      receptionDecision,
      receptionNotes: receptionNotes.trim(),
      receivedBy: userSession?.name || 'Mourad Hadj (Responsable Maintenance)',
      receivedByRole: (userSession?.role as any) || 'maintenance_lead',
    };

    try {
      await fetch(`/api/fleet/interventions/${interventionToReceive.id}/reception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsReceptionModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error('Failed to submit reception:', err);
    }
  };

  // Filtre multi-critères approfondi (Véhicule, Type VP/VU/PL..., Motorisation, Nature Préventif/Curatif, Période)
  const filteredInterventions = interventions.filter(itv => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      itv.interventionOrderNumber.toLowerCase().includes(q) ||
      (itv.receptionSheetNumber && itv.receptionSheetNumber.toLowerCase().includes(q)) ||
      itv.vehiclePlate.toLowerCase().includes(q) ||
      itv.vehicleMakeModel.toLowerCase().includes(q) ||
      itv.title.toLowerCase().includes(q) ||
      itv.garageName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || itv.status === statusFilter;

    // Filtre véhicule spécifique
    const matchesVehicle = selectedVehicleFilter === 'all' || 
      itv.vehicleId === selectedVehicleFilter || 
      itv.vehiclePlate === selectedVehicleFilter;

    // Filtre catégorie véhicule (VP, VU, PL, SM, Bus)
    const itvVehicle = vehicles.find(v => v.id === itv.vehicleId || v.plate === itv.vehiclePlate);
    const itvCategory = itv.vehicleCategory || itvVehicle?.vehicleCategory || 'VP';
    const matchesCategory = selectedCategoryFilter === 'all' || itvCategory === selectedCategoryFilter;

    // Filtre motorisation (diesel, essence, gpl)
    const itvFuel = itv.fuelType || itvVehicle?.fuelType || 'diesel';
    const matchesFuel = selectedFuelFilter === 'all' || itvFuel === selectedFuelFilter;

    // Filtre nature intervention (Préventive vs Curative)
    const itvNature = itv.natureIntervention || 
      (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(itv.type) ? 'preventive' : 'curative');
    const matchesNature = selectedNatureFilter === 'all' || itvNature === selectedNatureFilter;

    // Filtre période historique (dates début et fin)
    const itvDate = (itv.dateSortieIntervention || itv.requestDate || '').slice(0, 10);
    let matchesPeriod = true;
    if (dateStartFilter && itvDate && itvDate < dateStartFilter) matchesPeriod = false;
    if (dateEndFilter && itvDate && itvDate > dateEndFilter) matchesPeriod = false;

    return matchesSearch && matchesStatus && matchesVehicle && matchesCategory && matchesFuel && matchesNature && matchesPeriod;
  });

  // Indicateurs financiers dynamiques calculés sur les interventions filtrées (pour Contrôleur de Gestion & Flotte)
  const totalFilteredCostDZD = filteredInterventions.reduce((sum, i) => sum + (Number(i.coutInterventionDZD) || 0), 0);
  const totalPreventiveCostDZD = filteredInterventions
    .filter(i => (i.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(i.type) ? 'preventive' : 'curative')) === 'preventive')
    .reduce((sum, i) => sum + (Number(i.coutInterventionDZD) || 0), 0);
  const totalCurativeCostDZD = filteredInterventions
    .filter(i => (i.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(i.type) ? 'preventive' : 'curative')) === 'curative')
    .reduce((sum, i) => sum + (Number(i.coutInterventionDZD) || 0), 0);
  const billedCount = filteredInterventions.filter(i => (Number(i.coutInterventionDZD) || 0) > 0).length;
  const avgFilteredCostDZD = billedCount > 0 ? Math.round(totalFilteredCostDZD / billedCount) : 0;
  const prevPercentage = totalFilteredCostDZD > 0 ? Math.round((totalPreventiveCostDZD / totalFilteredCostDZD) * 100) : 0;
  const curPercentage = totalFilteredCostDZD > 0 ? Math.round((totalCurativeCostDZD / totalFilteredCostDZD) * 100) : 0;

  // Réinitialisation de l'ensemble des filtres
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedVehicleFilter('all');
    setSelectedCategoryFilter('all');
    setSelectedFuelFilter('all');
    setSelectedNatureFilter('all');
    setDateStartFilter('');
    setDateEndFilter('');
  };

  // Exportation des coûts d'intervention en CSV pour le Contrôleur de Gestion
  const handleExportInterventionsFinancialCSV = () => {
    const headers = [
      'N° Demande (DI)',
      'N° Reception (FR)',
      'Statut',
      'Nature Intervention',
      'Type Intervention',
      'Intitule',
      'Matricule Vehicule',
      'Marque & Modele',
      'Categorie Vehicule',
      'Motorisation',
      'Chauffeur',
      'Atelier / Prestataire',
      'Date Sortie Atelier',
      'Date Retour Parc',
      'Odometre Sortie (km)',
      'Odometre Retour (km)',
      'Cout Intervention (DZD)',
      'Emetteur DI',
      'Signataire FR'
    ];

    const rows = filteredInterventions.map(i => {
      const itvVehicle = vehicles.find(v => v.id === i.vehicleId || v.plate === i.vehiclePlate);
      const cat = i.vehicleCategory || itvVehicle?.vehicleCategory || 'VP';
      const fuel = i.fuelType || itvVehicle?.fuelType || 'diesel';
      const nature = (i.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(i.type) ? 'preventive' : 'curative')) === 'preventive' ? 'Préventive' : 'Curative';
      return [
        `"${i.interventionOrderNumber}"`,
        `"${i.receptionSheetNumber || 'En attente'}"`,
        `"${i.status}"`,
        `"${nature}"`,
        `"${i.type}"`,
        `"${(i.title || '').replace(/"/g, '""')}"`,
        `"${i.vehiclePlate}"`,
        `"${i.vehicleMakeModel}"`,
        `"${cat}"`,
        `"${fuel.toUpperCase()}"`,
        `"${i.driverName || 'N/A'}"`,
        `"${(i.garageName || '').replace(/"/g, '""')}"`,
        `"${i.dateSortieIntervention}"`,
        `"${i.dateRetourIntervention || 'En cours'}"`,
        `${i.odometerOutKm || 0}`,
        `${i.odometerInKm || i.odometerOutKm || 0}`,
        `${i.coutInterventionDZD || 0}`,
        `"${i.requestedBy || ''}"`,
        `"${i.receivedBy || 'En attente'}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `etat_financier_interventions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: VehicleIntervention['status']) => {
    switch (status) {
      case 'demande_emise':
        return {
          label: 'Demande Émise (DI)',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
        };
      case 'en_cours_atelier':
        return {
          label: 'En Cours Atelier',
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
        };
      case 'cloturee_receptionnee':
        return {
          label: 'Réceptionnée (FR Validée)',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
        };
      default:
        return {
          label: 'Annulée',
          className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
        };
    }
  };

  const getUrgencyBadge = (urgency: InterventionUrgency) => {
    switch (urgency) {
      case 'critique':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 font-bold';
      case 'urgent':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 font-bold';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Documents Numériques & Atelier
            </span>
            <span className="text-xs text-slate-400">Circuit officiel Flotte ↔ Maintenance</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gestion des Interventions & Documents Numériques
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
            Émission des Demandes d'Intervention (DI), suivi atelier et PV des Fiches de Réception (FR) après travaux
          </p>
        </div>

        {/* Action Button depending on Role */}
        {(userSession?.role === 'fleet_manager' || userSession?.role === 'super_admin') && (
          <button
            onClick={handleOpenCreateDI}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            + Émettre une Demande d'Intervention (DI)
          </button>
        )}

        {userSession?.role === 'maintenance_lead' && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Atelier & Émission des Fiches de Réception (FR)</span>
          </div>
        )}
      </div>

      {/* Role Responsibility Banner */}
      <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-[#0c121e] border border-sky-200/80 dark:border-[#1e2a3f] text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>Processus Réglementaire & Séparation des Responsabilités : </strong>
          Le <strong>Gestionnaire de Flotte</strong> émet la <em>Demande d'Intervention (DI)</em> numérique. Le <strong>Responsable de Maintenance</strong> prend en charge le véhicule en atelier puis établit la <em>Fiche de Réception (FR)</em> avec constat des pièces et validation de conformité pour réintégration au parc.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BARRE DE RECHERCHE & FILTRES MULTI-CRITÈRES AVANCÉS                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs space-y-4">
        {/* Ligne 1 : Recherche textuelle + Filtres de Statut */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par N° DI, N° FR, matricule, atelier, intitulé..."
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
              Toutes ({interventions.length})
            </button>
            <button
              onClick={() => setStatusFilter('demande_emise')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'demande_emise' ? 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Demandes Émises ({interventions.filter(i => i.status === 'demande_emise').length})
            </button>
            <button
              onClick={() => setStatusFilter('en_cours_atelier')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'en_cours_atelier' ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-600/30 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              En Atelier ({interventions.filter(i => i.status === 'en_cours_atelier').length})
            </button>
            <button
              onClick={() => setStatusFilter('cloturee_receptionnee')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'cloturee_receptionnee' ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-600/30 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Réceptionnées ({interventions.filter(i => i.status === 'cloturee_receptionnee').length})
            </button>
          </div>
        </div>

        {/* Ligne 2 : Filtres Combinatoires Spécifiques (Véhicule, Type VP/VU/PL..., Motorisation, Nature, Période) */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#1e2a3f] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Véhicule */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Véhicule du Parc
            </label>
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="all">Tous les véhicules ({vehicles.length})</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.plate}>
                  {v.plate} ({v.make} {v.model})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Type / Catégorie de véhicule (VP, VU, PL, SM, Bus) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Catégorie Véhicule
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value="all">Toutes Catégories</option>
              <option value="VP">VP (Véhicule Particulier)</option>
              <option value="VU">VU (Utilitaire / Fourgon)</option>
              <option value="PL">PL (Poids Lourd)</option>
              <option value="SM">SM (Semi-Remorque)</option>
              <option value="Bus">Bus / Transport</option>
            </select>
          </div>

          {/* 3. Motorisation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Motorisation
            </label>
            <select
              value={selectedFuelFilter}
              onChange={(e) => setSelectedFuelFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value="all">Toutes Motorisations</option>
              <option value="diesel">Gasoil / Diesel</option>
              <option value="essence">Essence / Sans Plomb</option>
              <option value="gpl">GPL / Gaz Propre</option>
            </select>
          </div>

          {/* 4. Nature Intervention (Préventive vs Curative) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Nature Intervention
            </label>
            <select
              value={selectedNatureFilter}
              onChange={(e) => setSelectedNatureFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value="all">Toutes Natures</option>
              <option value="preventive">🛡️ Préventive (Entretien)</option>
              <option value="curative">⚠️ Curative (Pannes)</option>
            </select>
          </div>

          {/* 5. Période Début & Fin */}
          <div className="lg:col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Période Du
              </label>
              <input
                type="date"
                value={dateStartFilter}
                onChange={(e) => setDateStartFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Au
              </label>
              <input
                type="date"
                value={dateEndFilter}
                onChange={(e) => setDateEndFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
            <button
              onClick={handleResetFilters}
              title="Réinitialiser tous les filtres"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1c273e] dark:hover:bg-[#253452] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BANDEAU DE SYNTHÈSE FINANCIÈRE DES COÛTS (CONTRÔLEUR DE GESTION & DIRECTION) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-slate-900/5 to-indigo-900/10 dark:from-[#0d1e19] dark:via-[#121929] dark:to-[#141b2d] border border-emerald-500/30 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Contrôle de Gestion & Analyse des Coûts
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Calcul dynamique selon les filtres actifs ({filteredInterventions.length} dossier{filteredInterventions.length > 1 ? 's' : ''})
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Bilan Financier des Interventions & Entretien du Parc
            </h3>
          </div>

          {/* Bouton d'exportation pour le Contrôleur de Gestion */}
          <button
            onClick={handleExportInterventionsFinancialCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Exporter l'État Financier (CSV)</span>
          </button>
        </div>

        {/* Grille des 4 indicateurs financiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/80 dark:bg-[#0c121e]/80 border border-emerald-500/20 rounded-xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Coût Total Filtré
            </span>
            <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
              {totalFilteredCostDZD.toLocaleString('fr-DZ')} <span className="text-xs">DA</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {billedCount} intervention{billedCount > 1 ? 's' : ''} clôturée{billedCount > 1 ? 's' : ''} avec facturation
            </span>
          </div>

          <div className="bg-white/80 dark:bg-[#0c121e]/80 border border-emerald-500/20 rounded-xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Part Préventive (Entretien)
            </span>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {totalPreventiveCostDZD.toLocaleString('fr-DZ')} <span className="text-xs">DA</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
              {prevPercentage}% du coût total d'intervention
            </span>
          </div>

          <div className="bg-white/80 dark:bg-[#0c121e]/80 border border-amber-500/20 rounded-xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Part Curative (Pannes & Avaries)
            </span>
            <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1">
              {totalCurativeCostDZD.toLocaleString('fr-DZ')} <span className="text-xs">DA</span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 block">
              {curPercentage}% du coût total d'intervention
            </span>
          </div>

          <div className="bg-white/80 dark:bg-[#0c121e]/80 border border-slate-200 dark:border-[#1e2a3f] rounded-xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Coût Moyen / Dossier
            </span>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {avgFilteredCostDZD.toLocaleString('fr-DZ')} <span className="text-xs">DA</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Moyenne pondérée par fiche réceptionnée
            </span>
          </div>
        </div>
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {filteredInterventions.map((itv) => {
          const stBadge = getStatusBadge(itv.status);
          const urgBadge = getUrgencyBadge(itv.urgency);

          return (
            <div
              key={itv.id}
              className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row: Numbers, Vehicle, Urgency, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1e2a3f]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* N° Demande d'Intervention */}
                    <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-[#1c273e] px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                      N° {itv.interventionOrderNumber}
                    </span>

                    {/* N° Fiche de Réception (si disponible) */}
                    {itv.receptionSheetNumber && (
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-[#0c1c18] px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/30">
                        N° {itv.receptionSheetNumber}
                      </span>
                    )}

                    {/* Nature Badge */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                      (itv.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(itv.type) ? 'preventive' : 'curative')) === 'preventive'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                    }`}>
                      {(itv.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(itv.type) ? 'preventive' : 'curative')) === 'preventive'
                        ? '🛡️ Préventive'
                        : '⚠️ Curative'}
                    </span>

                    {/* Vehicle Plate & Category */}
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#0c121e] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {itv.vehiclePlate}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
                      {itv.vehicleCategory || 'VP'}
                    </span>

                    {/* Motorisation Badge */}
                    {itv.fuelType && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-amber-500" />
                        {itv.fuelType === 'diesel' ? 'Gasoil' : itv.fuelType === 'essence' ? 'Essence' : 'GPL'}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${urgBadge}`}>
                      {itv.urgency === 'critique' ? 'Critique (Immobilisé)' : itv.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${stBadge.className}`}>
                    {stBadge.label}
                  </span>
                </div>

                {/* Main Content */}
                <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                  {/* Left Column: Details & Description */}
                  <div className="lg:col-span-2 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {itv.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {itv.description}
                    </p>

                    {/* Garage & Chauffeur */}
                    <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 pt-2 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                        Atelier : <strong className="text-slate-800 dark:text-white">{itv.garageName}</strong>
                      </span>
                      {itv.driverName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-emerald-500" />
                          Chauffeur : <strong className="text-slate-800 dark:text-white">{itv.driverName}</strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-sky-500" />
                        Odomètre sortie : <strong className="text-slate-800 dark:text-white font-mono">{itv.odometerOutKm.toLocaleString('fr-DZ')} km</strong>
                      </span>
                    </div>

                    {/* Si réceptionné : Affichage travaux réalisés et pièces */}
                    {itv.workDoneDetails && (
                      <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-[#0c1815] border border-emerald-200/60 dark:border-emerald-950/60 mt-3 text-xs">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                          Travaux Réalisés & Bilan Réception :
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">{itv.workDoneDetails}</p>
                        {itv.partsReplaced && itv.partsReplaced.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {itv.partsReplaced.map((part, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-[#12211c] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium">
                                ✓ {part}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Dates & Coûts */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-[#1e2a3f] flex flex-col justify-between space-y-3">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-medium">Date de Sortie Atelier :</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {itv.dateSortieIntervention.replace('T', ' à ')}
                        </span>
                      </div>

                      {itv.dateRetourIntervention && (
                        <div>
                          <span className="text-slate-400 text-[10px] block font-medium">Date de Retour au Parc :</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {itv.dateRetourIntervention.replace('T', ' à ')}
                          </span>
                        </div>
                      )}

                      {itv.coutInterventionDZD !== undefined && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] block font-medium">Coût Réel d'Intervention :</span>
                          <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300">
                            {itv.coutInterventionDZD.toLocaleString('fr-DZ')} <span className="text-xs">DA</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Émetteurs / Signataires */}
                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div>Émis par : <strong className="text-slate-700 dark:text-slate-300">{itv.requestedBy}</strong></div>
                      {itv.receivedBy && (
                        <div>Réceptionné par : <strong className="text-slate-700 dark:text-slate-300">{itv.receivedBy}</strong></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bouton pour afficher / imprimer la Demande d'Intervention (DI) */}
                  <button
                    onClick={() => setSelectedDIForPrint(itv)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Demande d'Intervention (DI)</span>
                  </button>

                  {/* Bouton pour afficher / imprimer la Fiche de Réception (FR) si disponible */}
                  {itv.receptionSheetNumber ? (
                    <button
                      onClick={() => setSelectedFRForPrint(itv)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>Fiche de Réception (FR)</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">FR en attente de travaux atelier</span>
                  )}
                </div>

                {/* Workflow Transitions depending on Role */}
                <div className="flex items-center gap-2">
                  {/* Prise en charge atelier pour Responsable Maintenance */}
                  {itv.status === 'demande_emise' && (userSession?.role === 'maintenance_lead' || userSession?.role === 'super_admin') && (
                    <button
                      onClick={() => handleTakeInCharge(itv.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Prendre en Charge Atelier</span>
                    </button>
                  )}

                  {/* Établir la Fiche de Réception pour Responsable Maintenance */}
                  {itv.status === 'en_cours_atelier' && (userSession?.role === 'maintenance_lead' || userSession?.role === 'super_admin') && (
                    <button
                      onClick={() => handleOpenReception(itv)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Établir la Fiche de Réception (FR)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredInterventions.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#121929] rounded-2xl border border-slate-200 dark:border-[#1e2a3f] p-8">
            <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucune intervention trouvée</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Aucune demande d'intervention ou fiche de réception ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1 : CRÉATION DEMANDE D'INTERVENTION (DI)                            */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-[#1e2a3f] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Émettre une Demande d'Intervention Mécanique (DI)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Générée par le Gestionnaire de Parc et transmise au Responsable de Maintenance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDI} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs">
              {/* Choix du véhicule */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Véhicule concerné <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate} — {v.make} {v.model} ({v.vehicleCategory || 'VP'} • {v.mileage.toLocaleString('fr-DZ')} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Typologie Préventive vs Curative */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Typologie & Nature de l'Intervention <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNatureIntervention('preventive')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      natureIntervention === 'preventive'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-[#1e2a3f] bg-slate-50 dark:bg-[#0c121e] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                      🛡️ Intervention Préventive
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Entretien programmé, vidanges périodiques Naftal, révisions d'échéance, remplacement pneumatiques.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNatureIntervention('curative')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      natureIntervention === 'curative'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-[#1e2a3f] bg-slate-50 dark:bg-[#0c121e] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                      ⚠️ Intervention Curative
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Panne mécanique inopinée, avarie sur la route, casse de pièce, réparation carrosserie suite sinistre.
                    </span>
                  </button>
                </div>
              </div>

              {/* Type d'intervention & Urgence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Type Technique de Travaux
                  </label>
                  <select
                    value={interventionType}
                    onChange={(e: any) => setInterventionType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="vidange_moteur">Vidange Moteur & Filtres Naftal</option>
                    <option value="freinage">Système de Freinage (Disques / Plaquettes)</option>
                    <option value="pneumatiques">Pneumatiques (Remplacement / Géométrie)</option>
                    <option value="distribution">Kit Distribution & Pompe à eau</option>
                    <option value="suspension_direction">Suspension, Direction & Amortisseurs</option>
                    <option value="electricite_batterie">Électricité, Batterie & Démarreur</option>
                    <option value="climatisation">Climatisation & Compresseur</option>
                    <option value="carrosserie_tolerie">Carrosserie, Tôlerie & Peinture</option>
                    <option value="revision_generale">Révision Générale Périodique</option>
                    <option value="controle_technique_repa">Réparations suite Contrôle Technique</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Degré d'Urgence
                  </label>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="normal">Normal (Entretien planifié sans immobilisation critique)</option>
                    <option value="urgent">Urgent (À traiter sous 24h - 48h)</option>
                    <option value="critique">Critique (Immobilisant / Sécurité en jeu)</option>
                  </select>
                </div>
              </div>

              {/* Titre & Description détaillée */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Intitulé de la Demande d'Intervention <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Description détaillée des anomalies constatées ou des travaux requis <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl p-3 text-sm text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Garage & Planning */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Type de Garage
                  </label>
                  <select
                    value={garageType}
                    onChange={(e: any) => setGarageType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="atelier_interne">Atelier Interne Entreprise</option>
                    <option value="concessionnaire">Concessionnaire Agréé</option>
                    <option value="partenaire_conventionne">Garage Partenaire Conventionné</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Nom du Garage / Atelier
                  </label>
                  <input
                    type="text"
                    required
                    value={garageName}
                    onChange={(e) => setGarageName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Date & Heure Sortie
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateSortieIntervention}
                    onChange={(e) => setDateSortieIntervention(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1c273e] hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  Valider & Générer la Demande d'Intervention (DI)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : ÉTABLIR LA FICHE DE RÉCEPTION (FR) APRÈS TRAVAUX                 */}
      {/* ========================================================================= */}
      {isReceptionModalOpen && interventionToReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-[#1e2a3f] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Établir la Fiche de Réception après Intervention (FR)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Générée par le Responsable Maintenance • Réf. {interventionToReceive.interventionOrderNumber} ({interventionToReceive.vehiclePlate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceptionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReception} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Date & Heure de Retour au Parc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={receptionDateReturn}
                    onChange={(e) => setReceptionDateReturn(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Odomètre Constaté à la Réception (km) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={receptionOdometerInKm}
                    onChange={(e) => setReceptionOdometerInKm(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Coût Réel Total de l'Intervention (DA) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={receptionCostDZD}
                      onChange={(e) => setReceptionCostDZD(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-3 pr-10 py-2 text-sm text-slate-900 dark:text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">DA</span>
                  </div>
                </div>
              </div>

              {/* Détails des travaux effectués */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Description détaillée des opérations & réparations exécutées <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={receptionWorkDetails}
                  onChange={(e) => setReceptionWorkDetails(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl p-3 text-sm text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Pièces neuves remplacées */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Pièces de rechange neuves installées (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={receptionPartsText}
                  onChange={(e) => setReceptionPartsText(e.target.value)}
                  placeholder="Ex: Jeu plaquettes AV, Huile Naftal 5W40, Filtre à air..."
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Points de Contrôle Qualité & Sécurité */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Contrôles de Sécurité & Validation Technique
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={chkBreaking} onChange={(e) => setChkBreaking(e.target.checked)} className="rounded text-emerald-600" />
                    <span>Système de freinage testé & certifié conforme</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={chkFluids} onChange={(e) => setChkFluids(e.target.checked)} className="rounded text-emerald-600" />
                    <span>Niveaux liquides moteur et refroidissement conformes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={chkTires} onChange={(e) => setChkTires(e.target.checked)} className="rounded text-emerald-600" />
                    <span>Pression et serrage des roues contrôlés</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={chkDashboard} onChange={(e) => setChkDashboard(e.target.checked)} className="rounded text-emerald-600" />
                    <span>Aucun voyant d'alerte allumé au tableau de bord</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
                    <input type="checkbox" checked={chkRoadTest} onChange={(e) => setChkRoadTest(e.target.checked)} className="rounded text-emerald-600" />
                    <span>Essai dynamique sur route effectué sans anomalie</span>
                  </label>
                </div>
              </div>

              {/* Décision & Réserves */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Décision de Réception
                  </label>
                  <select
                    value={receptionDecision}
                    onChange={(e: any) => setReceptionDecision(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    <option value="conforme_bon_service">Véhicule Conforme & Bon pour le Service</option>
                    <option value="avec_reserves">Avec Réserves (Nécessite suivi d'atelier)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Observations / Remarques Techniques
                  </label>
                  <input
                    type="text"
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsReceptionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1c273e] hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Save className="w-4 h-4" />
                  Valider & Générer la Fiche de Réception (FR)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Print Modals */}
      {selectedDIForPrint && (
        <OfficialDIModal
          intervention={selectedDIForPrint}
          onClose={() => setSelectedDIForPrint(null)}
        />
      )}

      {selectedFRForPrint && (
        <OfficialFRModal
          intervention={selectedFRForPrint}
          onClose={() => setSelectedFRForPrint(null)}
        />
      )}
    </div>
  );
};

// =========================================================================
// MODAL EXPORTABLE : DOCUMENT OFFICIEL IMPRIMABLE — DEMANDE D'INTERVENTION (DI)
// =========================================================================
export const OfficialDIModal: React.FC<{
  intervention: VehicleIntervention;
  onClose: () => void;
}> = ({ intervention, onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Document officiel : Demande d'Intervention Mécanique (DI)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimer le Document (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content A4 */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-black font-serif print:p-0 print:m-0 print:shadow-none">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <p className="font-bold text-sm tracking-widest uppercase">
              RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
            </p>
            <p className="text-xs font-semibold mt-1">
              MINISTÈRE DES TRANSPORTS • DIRECTION DU PARC AUTOMOBILE & DE LA MOBILITÉ
            </p>
            <p className="text-xs font-bold uppercase mt-1 tracking-wider text-slate-800">
              GESTION DU PARC AUTOMOBILE • SERVICE D'EXPLOITATION & DE GESTION DE FLOTTE
            </p>
          </div>

          <div className="flex items-center justify-between mb-6 pb-2 border-b border-dashed border-slate-400">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight font-sans text-indigo-950">
                DEMANDE D'INTERVENTION (DI)
              </h1>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Ordre de travaux mécanique, carrosserie et révision technique de flotte
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold bg-slate-100 border border-slate-400 px-3 py-1 rounded">
                N° : {intervention.interventionOrderNumber}
              </div>
              <span className="text-[11px] text-slate-600 font-sans block mt-1">Date d'émission : {intervention.requestDate}</span>
            </div>
          </div>

          {/* Grid: Vehicule & Atelier */}
          <div className="grid grid-cols-2 gap-6 mb-6 font-sans text-xs">
            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                I. VÉHICULE & AFFECTATION
              </h3>
              <div className="space-y-1.5 leading-relaxed">
                <p><strong>Matricule Algérien :</strong> <span className="font-mono font-bold text-sm">{intervention.vehiclePlate}</span></p>
                <p><strong>Marque & Modèle :</strong> {intervention.vehicleMakeModel}</p>
                <p><strong>Catégorie Véhicule :</strong> {intervention.vehicleCategory || 'VP'} (Décret 04-381)</p>
                <p><strong>Odomètre à la sortie :</strong> <span className="font-mono">{intervention.odometerOutKm.toLocaleString('fr-DZ')} km</span></p>
                {intervention.driverName && (
                  <p><strong>Conducteur Titulaire :</strong> {intervention.driverName} ({intervention.driverPhone})</p>
                )}
              </div>
            </div>

            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                II. ATELIER ASSIGNÉ & DÉLAIS
              </h3>
              <div className="space-y-1.5 leading-relaxed">
                <p><strong>Atelier Prestataire :</strong> {intervention.garageName}</p>
                <p><strong>Nature de la Structure :</strong> {intervention.garageType === 'atelier_interne' ? 'Atelier Interne Entreprise' : intervention.garageType === 'concessionnaire' ? 'Concessionnaire Constructeur Agréé' : 'Garage Partenaire Conventionné'}</p>
                <p><strong>Date & Heure de Sortie :</strong> {intervention.dateSortieIntervention.replace('T', ' à ')}</p>
                <p><strong>Degré d'Urgence :</strong> <span className="uppercase font-bold">{intervention.urgency}</span></p>
              </div>
            </div>
          </div>

          {/* Travaux prescrits */}
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 mb-6 font-sans text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              III. PRESCRIPTION DES TRAVAUX & MOTIF DE L'INTERVENTION
            </h3>
            <p className="font-bold text-sm mb-1">{intervention.title}</p>
            <p className="leading-relaxed text-slate-700 whitespace-pre-line">{intervention.description}</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-black font-sans text-xs">
            <div className="text-center">
              <p className="font-bold uppercase mb-1">LE GESTIONNAIRE DE PARC (ÉMETTEUR)</p>
              <p className="text-[11px] text-slate-500 mb-8">{intervention.requestedBy}</p>
              <div className="inline-block border-2 border-indigo-700 rounded-lg p-2 text-indigo-800 font-mono text-[10px] font-bold">
                SIGNÉ & SCELLÉ NUMÉRIQUEMENT<br/>
                LOI 18-07 / GESTION DE FLOTTE DZ
              </div>
            </div>

            <div className="text-center">
              <p className="font-bold uppercase mb-1">VISA RESPONSABLE MAINTENANCE (RÉCEPTIONNAIRE)</p>
              <p className="text-[11px] text-slate-500 mb-8">Service des Ateliers & Réparations</p>
              <div className="inline-block border border-dashed border-slate-400 rounded-lg p-4 text-slate-400 text-[10px]">
                Cadre réservé à l'émargement de prise en charge atelier
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL EXPORTABLE : DOCUMENT OFFICIEL IMPRIMABLE — FICHE DE RÉCEPTION (FR)
// =========================================================================
export const OfficialFRModal: React.FC<{
  intervention: VehicleIntervention;
  onClose: () => void;
}> = ({ intervention, onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Document officiel : Fiche de Réception après Intervention (FR)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimer le Document (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content A4 */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-black font-serif print:p-0 print:m-0 print:shadow-none">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <p className="font-bold text-sm tracking-widest uppercase">
              RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
            </p>
            <p className="text-xs font-semibold mt-1">
              DIRECTION TECHNIQUE & DE LA MAINTENANCE AUTOMOBILE
            </p>
            <p className="text-xs font-bold uppercase mt-1 tracking-wider text-slate-800">
              DÉPARTEMENT CONTRÔLE CONFORMITÉ & SORTIE D'ATELIER
            </p>
          </div>

          <div className="flex items-center justify-between mb-6 pb-2 border-b border-dashed border-slate-400">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight font-sans text-emerald-950">
                FICHE DE RÉCEPTION APRÈS INTERVENTION (FR)
              </h1>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Procès-verbal de fin de travaux, contrôle qualité et réintégration au parc
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold bg-slate-100 border border-slate-400 px-3 py-1 rounded text-emerald-800">
                N° : {intervention.receptionSheetNumber}
              </div>
              <span className="text-[11px] text-slate-600 font-sans block mt-1">
                Réf. Demande : <strong>{intervention.interventionOrderNumber}</strong>
              </span>
            </div>
          </div>

          {/* Grid: Vehicule & Bilan Financier */}
          <div className="grid grid-cols-2 gap-6 mb-6 font-sans text-xs">
            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                I. VÉHICULE RÉCEPTIONNÉ
              </h3>
              <div className="space-y-1.5 leading-relaxed">
                <p><strong>Matricule :</strong> <span className="font-mono font-bold text-sm">{intervention.vehiclePlate}</span></p>
                <p><strong>Marque & Type :</strong> {intervention.vehicleMakeModel}</p>
                <p><strong>Odomètre Sortie Atelier :</strong> <span className="font-mono">{intervention.odometerOutKm.toLocaleString('fr-DZ')} km</span></p>
                <p><strong>Odomètre Retour Parc :</strong> <span className="font-mono font-bold text-emerald-700">{intervention.odometerInKm?.toLocaleString('fr-DZ')} km</span></p>
                <p><strong>Date & Heure de Retour :</strong> {intervention.dateRetourIntervention?.replace('T', ' à ')}</p>
              </div>
            </div>

            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                II. COÛTS & CONDITIONS D'INTERVENTION
              </h3>
              <div className="space-y-1.5 leading-relaxed">
                <p><strong>Atelier Réalisateur :</strong> {intervention.garageName}</p>
                <p><strong>Coût Total TTC (DA) :</strong> <span className="text-base font-black font-mono text-emerald-700">{intervention.coutInterventionDZD?.toLocaleString('fr-DZ')} DA</span></p>
                <p><strong>Validation Pièces :</strong> Facture & Bons de livraison certifiés</p>
                <p><strong>Garantie Travaux :</strong> Conforme aux engagements atelier</p>
              </div>
            </div>
          </div>

          {/* Bilan des travaux exécutés */}
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 mb-6 font-sans text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              III. BILAN TECHNIQUE DES TRAVAUX & PIÈCES DE RECHANGE
            </h3>
            <p className="leading-relaxed text-slate-700 whitespace-pre-line mb-3">
              {intervention.workDoneDetails || 'Travaux exécutés conformément à la demande d\'intervention.'}
            </p>

            {intervention.partsReplaced && intervention.partsReplaced.length > 0 && (
              <div>
                <strong className="block text-[11px] mb-1">Pièces neuves installées :</strong>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                  {intervention.partsReplaced.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Procès verbal de conformité */}
          <div className="border border-emerald-300 p-4 rounded-lg bg-emerald-50/50 mb-6 font-sans text-xs">
            <h3 className="font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-300 pb-1 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              IV. PROCÈS-VERBAL DES CONTRÔLES DE SÉCURITÉ & ESSAI ROUTE
            </h3>
            <div className="grid grid-cols-2 gap-2 text-slate-800 mb-3">
              <p>• Système de freinage : <strong>CONFORME (Test banc / route concluant)</strong></p>
              <p>• Niveaux liquides et lubrifiants : <strong>CONFORME (Huile & liquides OK)</strong></p>
              <p>• Pneumatiques & géométrie : <strong>CONFORME (Pression & serrage vérifiés)</strong></p>
              <p>• Diagnostics électroniques / voyants : <strong>CONFORME (Aucun voyant d'alerte)</strong></p>
            </div>
            <div className="p-2.5 rounded bg-emerald-600 text-white font-bold text-center uppercase tracking-wide">
              DÉCISION : VÉHICULE DÉCLARÉ CONFORME & BON POUR LE SERVICE
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-black font-sans text-xs">
            <div className="text-center">
              <p className="font-bold uppercase mb-1">LE RESPONSABLE MAINTENANCE (RÉCEPTIONNAIRE)</p>
              <p className="text-[11px] text-slate-500 mb-8">{intervention.receivedBy}</p>
              <div className="inline-block border-2 border-emerald-700 rounded-lg p-2 text-emerald-800 font-mono text-[10px] font-bold">
                CERTIFIÉ CONFORME & SIGNÉ<br/>
                DIRECTION MAINTENANCE FLEET-DZ
              </div>
            </div>

            <div className="text-center">
              <p className="font-bold uppercase mb-1">LE GESTIONNAIRE DE FLOTTE (AFFECTATION)</p>
              <p className="text-[11px] text-slate-500 mb-8">{intervention.requestedBy}</p>
              <div className="inline-block border border-dashed border-slate-400 rounded-lg p-4 text-slate-400 text-[10px]">
                Réintégration du véhicule au parc validée
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
