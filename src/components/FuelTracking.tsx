import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  Search, 
  Download, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet, 
  TrendingUp, 
  Car, 
  MapPin, 
  Plus, 
  Navigation, 
  ExternalLink, 
  AlertTriangle, 
  Gauge, 
  Clock,
  CreditCard,
  FileText,
  Printer,
  ArrowRight,
  X,
  ShieldCheck,
  Eye,
  RefreshCw,
  Upload,
  Check,
  Building2,
  DollarSign,
  User,
  CheckCircle
} from 'lucide-react';
import { FuelLog, Vehicle, Driver, UserSession, FuelVoucher, PrepaidFuelCard, RefuelType } from '../types.js';

interface FuelTrackingProps {
  fuelLogs: FuelLog[];
  vehicles: Vehicle[];
  drivers?: Driver[];
  onNavigateTab: (tab: any) => void;
  userSession?: UserSession;
  onRefreshData?: () => void;
}

export const FuelTracking: React.FC<FuelTrackingProps> = ({
  fuelLogs,
  vehicles,
  drivers = [],
  onNavigateTab,
  userSession,
  onRefreshData,
}) => {
  // Navigation interne par onglets
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'vouchers' | 'consumption_cards'>('logs');

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>('all');
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('all');
  const [validatedLogIds, setValidatedLogIds] = useState<Set<string>>(new Set());
  const [validatingId, setValidatingId] = useState<string | null>(null);

  // Cartes Prépayées & Bons de Ravitaillement
  const [prepaidCards, setPrepaidCards] = useState<PrepaidFuelCard[]>([]);
  const [fuelVouchers, setFuelVouchers] = useState<FuelVoucher[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);

  // Modales
  const [isCreateVoucherModalOpen, setIsCreateVoucherModalOpen] = useState(false);
  const [voucherToComplete, setVoucherToComplete] = useState<FuelVoucher | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [previewVoucherDoc, setPreviewVoucherDoc] = useState<FuelVoucher | null>(null);
  const [previewReceiptDoc, setPreviewReceiptDoc] = useState<{ title: string; url: string } | null>(null);

  // Form State pour Nouveau Bon de Ravitaillement
  const [newVoucherVehicleId, setNewVoucherVehicleId] = useState('');
  const [newVoucherDriverId, setNewVoucherDriverId] = useState('');
  const [newVoucherCardId, setNewVoucherCardId] = useState('');
  const [newVoucherRefuelType, setNewVoucherRefuelType] = useState<RefuelType>('partiel_appoint');
  const [newVoucherQuantityLiters, setNewVoucherQuantityLiters] = useState<number>(30);
  const [newVoucherDate, setNewVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVoucherNotes, setNewVoucherNotes] = useState('');

  // Form State pour Saisie du Reçu Station
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 16));
  const [receiptQuantityLiters, setReceiptQuantityLiters] = useState<number>(30);
  const [receiptAmountDZD, setReceiptAmountDZD] = useState<number>(870);
  const [receiptOdometerKm, setReceiptOdometerKm] = useState<number>(0);
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string>('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  // Charger les cartes prépayées et les bons de ravitaillement
  const fetchExtras = async () => {
    setIsLoadingExtras(true);
    try {
      const [cardsRes, vouchersRes] = await Promise.all([
        fetch('/api/fleet/fuel/prepaid-cards'),
        fetch('/api/fleet/fuel/vouchers'),
      ]);
      if (cardsRes.ok) setPrepaidCards(await cardsRes.json());
      if (vouchersRes.ok) setFuelVouchers(await vouchersRes.json());
    } catch (err) {
      console.error('Failed to load prepaid cards / vouchers:', err);
    } finally {
      setIsLoadingExtras(false);
    }
  };

  useEffect(() => {
    fetchExtras();
  }, []);

  // Synchronisation lors de la sélection du véhicule dans la modale d'émission de bon
  useEffect(() => {
    if (newVoucherVehicleId) {
      const v = vehicles.find(veh => veh.id === newVoucherVehicleId);
      if (v) {
        if (v.driverId) setNewVoucherDriverId(v.driverId);
        // Défaut quantité selon type
        if (newVoucherRefuelType === 'plein_complet') {
          setNewVoucherQuantityLiters(v.tankCapacityLiters || 50);
        }
      }
    }
  }, [newVoucherVehicleId, newVoucherRefuelType, vehicles]);

  // Validation d'un log par le gestionnaire
  const handleValidateFuelLog = async (logId: string) => {
    setValidatingId(logId);
    try {
      await fetch(`/api/fleet/fuel/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' }),
      });
      setValidatedLogIds(prev => new Set(prev).add(logId));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to validate fuel log:', err);
    } finally {
      setValidatingId(null);
    }
  };

  // Soumission d'un nouveau Bon de Ravitaillement
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find(v => v.id === newVoucherVehicleId);
    const driver = drivers.find(d => d.id === newVoucherDriverId);
    const card = prepaidCards.find(c => c.id === newVoucherCardId);

    const fuelType = vehicle?.fuelType || 'diesel';
    const ratePerLiter = fuelType === 'diesel' ? 29.01 : fuelType === 'essence' ? 45.62 : 9.00;
    const estimatedAmount = Math.round(newVoucherQuantityLiters * ratePerLiter);

    try {
      const res = await fetch('/api/fleet/fuel/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newVoucherDate,
          vehicleId: vehicle?.id,
          vehiclePlate: vehicle?.plate,
          vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule',
          driverId: driver?.id,
          driverName: driver?.name,
          driverPhone: driver?.phone,
          stationName: card?.stationName || 'Station Naftal Rocade Sud (Chéraga)',
          stationCity: card?.stationCity || '16 - Alger',
          fuelType,
          refuelType: newVoucherRefuelType,
          quantityRequestedLiters: newVoucherQuantityLiters,
          estimatedAmountDZD: estimatedAmount,
          prepaidCardId: card?.id,
          prepaidCardNumber: card?.cardNumber,
          issuedBy: userSession?.name || 'Karim Ziani (Gestionnaire Flotte)',
          notes: newVoucherNotes,
        }),
      });

      if (res.ok) {
        setIsCreateVoucherModalOpen(false);
        setNewVoucherNotes('');
        await fetchExtras();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to create fuel voucher:', err);
    }
  };

  // Ouverture modale Saisie Reçu Station
  const handleOpenReceiptModal = (voucher: FuelVoucher) => {
    setVoucherToComplete(voucher);
    setReceiptNumber(`REC-NAFTAL-${Math.floor(10000 + Math.random() * 90000)}`);
    setReceiptDate(new Date().toISOString().slice(0, 16));
    setReceiptQuantityLiters(voucher.quantityRequestedLiters);
    setReceiptAmountDZD(voucher.estimatedAmountDZD);
    
    // Odomètre estimé = kilométrage actuel du véhicule + roulage
    const v = vehicles.find(veh => veh.plate === voucher.vehiclePlate);
    const currentKm = v?.mileage || 50000;
    setReceiptOdometerKm(currentKm + Math.floor(250 + Math.random() * 200));
    setReceiptPhotoUrl('');
    setIsReceiptModalOpen(true);
  };

  // Soumission du Reçu Station & Rapprochement
  const handleCompleteVoucherWithReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherToComplete) return;

    setIsSubmittingReceipt(true);
    try {
      const res = await fetch(`/api/fleet/fuel/vouchers/${voucherToComplete.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationReceiptNumber: receiptNumber,
          actualDate: receiptDate,
          actualQuantityLiters: Number(receiptQuantityLiters),
          actualAmountDZD: Number(receiptAmountDZD),
          odometerKm: Number(receiptOdometerKm),
          receiptPhotoUrl: receiptPhotoUrl || undefined,
        }),
      });

      if (res.ok) {
        setIsReceiptModalOpen(false);
        setVoucherToComplete(null);
        await fetchExtras();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to complete fuel voucher with receipt:', err);
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  // Filtrage du journal des ravitaillements
  const filteredLogs = fuelLogs.filter((log) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      log.driverName.toLowerCase().includes(q) ||
      log.vehiclePlate.toLowerCase().includes(q) ||
      log.stationName.toLowerCase().includes(q) ||
      log.city.toLowerCase().includes(q) ||
      (log.voucherNumber && log.voucherNumber.toLowerCase().includes(q)) ||
      (log.stationReceiptNumber && log.stationReceiptNumber.toLowerCase().includes(q));

    const matchesVehicle = selectedVehiclePlate === 'all' || log.vehiclePlate === selectedVehiclePlate;
    const matchesStation = selectedStationFilter === 'all' || log.stationName.includes(selectedStationFilter);

    return matchesSearch && matchesVehicle && matchesStation;
  });

  // Calculs financiers & volumiques
  const totalDZD = filteredLogs.reduce((acc, l) => acc + l.amountDZD, 0);
  const totalLiters = filteredLogs.reduce((acc, l) => acc + l.liters, 0);
  const averagePricePerLiter = totalLiters > 0 ? (totalDZD / totalLiters).toFixed(2) : '35.00';

  // Total soldes cartes prépayées
  const totalPrepaidBalanceDZD = prepaidCards.reduce((acc, c) => acc + c.currentBalanceDZD, 0);

  // Calcul du suivi de consommation par véhicule lié au kilométrage parcouru
  const vehicleConsumptionStats = vehicles.map(v => {
    const vLogs = fuelLogs.filter(l => l.vehiclePlate === v.plate);
    const totalVVolume = vLogs.reduce((acc, l) => acc + l.liters, 0);
    const totalVCost = vLogs.reduce((acc, l) => acc + l.amountDZD, 0);
    
    // Total distance parcourue relevée sur les ravitaillements
    const totalVDistance = vLogs.reduce((acc, l) => acc + (l.distanceDrivenKm || 0), 0);
    
    // Consommation réelle calculée en L/100km
    let realAverageConsumption = 0;
    if (totalVDistance > 0 && totalVVolume > 0) {
      realAverageConsumption = parseFloat(((totalVVolume / totalVDistance) * 100).toFixed(1));
    } else if (vLogs.length > 0) {
      // Moyenne des consommations calculées par ravitaillement
      const validConsoLogs = vLogs.filter(l => (l.calculatedConsumption || 0) > 0);
      if (validConsoLogs.length > 0) {
        realAverageConsumption = parseFloat((validConsoLogs.reduce((acc, l) => acc + (l.calculatedConsumption || 0), 0) / validConsoLogs.length).toFixed(1));
      }
    }

    const theoreticalConsumption = v.averageConsumption || 8.0;
    const diffPercentage = realAverageConsumption > 0 
      ? Math.round(((realAverageConsumption - theoreticalConsumption) / theoreticalConsumption) * 100)
      : 0;

    let efficiencyStatus: 'eco' | 'conforme' | 'surconsommation' = 'conforme';
    if (diffPercentage > 20) {
      efficiencyStatus = 'surconsommation';
    } else if (diffPercentage <= 0) {
      efficiencyStatus = 'eco';
    }

    return {
      vehicle: v,
      logsCount: vLogs.length,
      totalVolume: totalVVolume,
      totalCost: totalVCost,
      totalDistance: totalVDistance,
      realAverageConsumption,
      theoreticalConsumption,
      diffPercentage,
      efficiencyStatus,
      lastLog: vLogs[0],
    };
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'N_Bon', 'N_Recu_Station', 'Matricule', 'Chauffeur', 'Station', 'Type_Ravitaillement', 'Odomètre_KM', 'Distance_KM', 'Litres', 'Montant_DZD', 'Conso_L_100km'];
    const rows = filteredLogs.map(l => [
      l.date.split('T')[0],
      l.voucherNumber || 'Direct',
      l.stationReceiptNumber || 'PWA',
      l.vehiclePlate,
      `"${l.driverName}"`,
      `"${l.stationName}"`,
      l.refuelType || 'plein',
      l.odometerKm || '',
      l.distanceDrivenKm || '',
      l.liters,
      l.amountDZD,
      l.calculatedConsumption || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dz_fleet_carburant_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              Approvisionnement & Gestion du Carburant
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gestion du Carburant & Suivi de la Consommation au Km
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
            Bons de ravitaillement, cartes prépayées déposées en station, reçus officiels et calcul de la consommation réelle selon la distance parcourue
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {userSession?.role === 'fleet_manager' && (
            <button
              onClick={() => {
                if (vehicles.length > 0) {
                  setNewVoucherVehicleId(vehicles[0].id);
                  if (vehicles[0].driverId) setNewVoucherDriverId(vehicles[0].driverId);
                }
                if (prepaidCards.length > 0) {
                  setNewVoucherCardId(prepaidCards[0].id);
                }
                setIsCreateVoucherModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Émettre un Bon de Ravitaillement
            </button>
          )}

          {userSession?.role === 'super_admin' ? (
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Audit Carburant DSI (Lecture Seule)</span>
            </div>
          ) : userSession?.role === 'controller' ? (
            <div className="px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-sky-500" />
              <span>Audit Cartes & Dépenses Naftal</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Overview Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Dépenses */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Dépenses Totales Carburant
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalDZD.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">DA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Ravitaillements terrain & cartes prépayées</span>
          </p>
        </div>

        {/* KPI 2 : Volume Global */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Volume Délivré aux Véhicules
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalLiters.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Litres</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gasoil (29.01 DA/L) • Sans Plomb (45.62 DA/L)
          </p>
        </div>

        {/* KPI 3 : Solde Cartes Prépayées Déposées */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-between">
            <span>Solde Cartes en Station</span>
            <CreditCard className="w-3.5 h-3.5 text-sky-500" />
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono tracking-tight">
              {totalPrepaidBalanceDZD.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">DA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sur {prepaidCards.length} cartes déposées chez Naftal
          </p>
        </div>

        {/* KPI 4 : Bons de Ravitaillement Actifs */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-between">
            <span>Bons de Ravitaillement</span>
            <FileText className="w-3.5 h-3.5 text-amber-500" />
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {fuelVouchers.length}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              ({fuelVouchers.filter(b => b.status === 'emis').length} en attente)
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {fuelVouchers.filter(b => b.status === 'ravitaille').length} rapprochés avec reçu
          </p>
        </div>
      </div>

      {/* Navigation Interne entre 3 sous-onglets */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1e2a3f] pb-3 text-xs flex-wrap">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'logs'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e]'
          }`}
        >
          <Fuel className="w-4 h-4 text-amber-500" />
          <span>Journal des Ravitaillements ({filteredLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vouchers')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'vouchers'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e]'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Bons de Ravitaillement Délivrés ({fuelVouchers.length})</span>
          {fuelVouchers.filter(v => v.status === 'emis').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('consumption_cards')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'consumption_cards'
              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e]'
          }`}
        >
          <Gauge className="w-4 h-4 text-sky-500" />
          <span>Suivi Consommation au Km & Cartes Prépayées</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SOUS-ONGLET 1 : JOURNAL DES RAVITAILLEMENTS & REÇUS STATION              */}
      {/* ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-500" />
                Journal des Ravitaillements Effectués
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rapprochement automatique entre les Bons émis, les reçus de station Naftal et les odomètres relevés au compteur
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filtre Véhicule */}
              <select
                value={selectedVehiclePlate}
                onChange={(e) => setSelectedVehiclePlate(e.target.value)}
                className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">Tous les véhicules ({vehicles.length})</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.plate}>
                    {v.plate} — {v.make} {v.model}
                  </option>
                ))}
              </select>

              {/* Recherche textuelle */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Recherche (reçu, bon, station, chauffeur)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-56"
                />
              </div>

              {/* Bouton Export CSV */}
              {userSession?.role !== 'maintenance_lead' && (
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1c273e] dark:hover:bg-[#253452] dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Exporter CSV
                </button>
              )}
            </div>
          </div>

          {/* Table des Ravitaillements */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#0c121e] text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-[#222f47]">
                <tr>
                  <th className="py-3 px-3">Date & Heure</th>
                  <th className="py-3 px-3">Véhicule</th>
                  <th className="py-3 px-3">Chauffeur</th>
                  <th className="py-3 px-3">Station Naftal & Carte</th>
                  <th className="py-3 px-3">Type & Bon</th>
                  <th className="py-3 px-3">Volume Délivré</th>
                  <th className="py-3 px-3">Montant (DA)</th>
                  <th className="py-3 px-3">Odomètre & Trajet</th>
                  <th className="py-3 px-3">Conso Calculée</th>
                  <th className="py-3 px-3">Reçu Station</th>
                  <th className="py-3 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {new Date(log.date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.date).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Véhicule */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                        {log.vehiclePlate}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {vehicles.find(v => v.plate === log.vehiclePlate)?.make} {vehicles.find(v => v.plate === log.vehiclePlate)?.model}
                      </span>
                    </td>

                    {/* Chauffeur */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.driverName}
                    </td>

                    {/* Station & Carte */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{log.stationName}</span>
                      </div>
                      {log.prepaidCardNumber && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                          <CreditCard className="w-3 h-3" /> Carte {log.prepaidCardNumber}
                        </span>
                      )}
                    </td>

                    {/* Type & Bon */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1c273e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 block text-center mb-1">
                        {log.refuelType === 'partiel_appoint' ? 'Appoint / Partiel' : log.refuelType === 'dotation_mission' ? 'Mission' : 'Plein Complet'}
                      </span>
                      {log.voucherNumber ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          Bon {log.voucherNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Sans bon préalable</span>
                      )}
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.liters} L
                      <span className="text-[10px] text-slate-400 block font-normal">@ {log.pricePerLiterDZD} DA/L</span>
                    </td>

                    {/* Montant DA */}
                    <td className="py-3 px-3 font-mono font-black text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      {log.amountDZD.toLocaleString('fr-DZ')} DA
                    </td>

                    {/* Odomètre & Distance Parcourue (ΔKM) */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      {log.odometerKm ? (
                        <>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {log.odometerKm.toLocaleString('fr-DZ')} km
                          </span>
                          {log.distanceDrivenKm && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              +{log.distanceDrivenKm.toLocaleString('fr-DZ')} km roulés
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Consommation Calculée L/100km liée au kilométrage parcouru */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      {log.calculatedConsumption ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                          log.isOverconsumption
                            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          <Gauge className="w-3 h-3" />
                          {log.calculatedConsumption} L/100
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Calcul au prochain plein</span>
                      )}
                    </td>

                    {/* Reçu Station */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.receiptPhotoUrl ? (
                        <button
                          onClick={() => setPreviewReceiptDoc({
                            title: `Reçu Station — ${log.stationReceiptNumber || 'Ticket Naftal'} (${log.vehiclePlate})`,
                            url: log.receiptPhotoUrl!
                          })}
                          className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-sky-100"
                        >
                          <Eye className="w-3 h-3" /> Reçu Station
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Non numérisé</span>
                      )}
                    </td>

                    {/* Statut & Action */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {validatedLogIds.has(log.id) || log.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Validé
                        </span>
                      ) : userSession?.role === 'fleet_manager' ? (
                        <button
                          onClick={() => handleValidateFuelLog(log.id)}
                          disabled={validatingId === log.id}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {validatingId === log.id ? '...' : 'Valider'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-medium">En attente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SOUS-ONGLET 2 : BONS DE RAVITAILLEMENT (GESTIONNAIRE DE FLOTTE)           */}
      {/* ========================================================================= */}
      {activeSubTab === 'vouchers' && (
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Bons de Ravitaillement Carburant Officiels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bons délivrés par le Gestionnaire de Flotte pour ravitaillement partiel ou plein complet chez la station dépositaire
              </p>
            </div>

            {userSession?.role === 'fleet_manager' && (
              <button
                onClick={() => {
                  if (vehicles.length > 0) {
                    setNewVoucherVehicleId(vehicles[0].id);
                    if (vehicles[0].driverId) setNewVoucherDriverId(vehicles[0].driverId);
                  }
                  if (prepaidCards.length > 0) {
                    setNewVoucherCardId(prepaidCards[0].id);
                  }
                  setIsCreateVoucherModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Nouveau Bon de Ravitaillement
              </button>
            )}
          </div>

          {/* Table des Bons */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#0c121e] text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-[#222f47]">
                <tr>
                  <th className="py-3 px-4">N° Bon & Date</th>
                  <th className="py-3 px-4">Véhicule & Chauffeur</th>
                  <th className="py-3 px-4">Station Conventionnée</th>
                  <th className="py-3 px-4">Type Ravitaillement</th>
                  <th className="py-3 px-4">Volume Autorisé</th>
                  <th className="py-3 px-4">Montant Estimé</th>
                  <th className="py-3 px-4">Statut & Rapprochement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
                {fuelVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                    {/* N° Bon & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">
                        {voucher.voucherNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {voucher.date}
                      </span>
                    </td>

                    {/* Véhicule & Chauffeur */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                        {voucher.vehiclePlate}
                      </span>
                      <span className="text-[11px] text-slate-800 dark:text-slate-200 font-semibold block">
                        {voucher.vehicleModel}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Chauffeur : {voucher.driverName}
                      </span>
                    </td>

                    {/* Station & Carte Prépayée */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {voucher.stationName}
                      </span>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono block">
                        {voucher.prepaidCardNumber ? `Carte Prépayée ${voucher.prepaidCardNumber}` : 'Carte Convention'}
                      </span>
                    </td>

                    {/* Type Ravitaillement */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        voucher.refuelType === 'partiel_appoint'
                          ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300'
                          : voucher.refuelType === 'dotation_mission'
                          ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {voucher.refuelType === 'partiel_appoint' ? 'Dotation Partielle / Appoint' : voucher.refuelType === 'dotation_mission' ? 'Dotation Mission' : 'Plein Complet'}
                      </span>
                    </td>

                    {/* Volume Autorisé */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {voucher.quantityRequestedLiters} Litres
                    </td>

                    {/* Montant Estimé */}
                    <td className="py-3.5 px-4 font-mono font-black text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      {voucher.estimatedAmountDZD.toLocaleString('fr-DZ')} DA
                    </td>

                    {/* Statut & Rapprochement */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {voucher.status === 'emis' ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Émis (En attente ravitaillement)
                          </span>
                          {userSession?.role === 'fleet_manager' && (
                            <button
                              onClick={() => handleOpenReceiptModal(voucher)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs mt-0.5"
                            >
                              <Check className="w-3 h-3" /> Saisir le Reçu Station
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Ravitaillement Effectué
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Reçu {voucher.stationReceiptNumber} • {voucher.actualQuantityLiters}L servis
                          </span>
                          {voucher.calculatedConsumption && (
                            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 font-mono">
                              Conso : {voucher.calculatedConsumption} L/100km ({voucher.distanceDrivenKm} km parcourus)
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewVoucherDoc(voucher)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1c273e] dark:hover:bg-[#253452] dark:text-white border border-slate-200 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Imprimer / Visualiser le Bon Officiel"
                        >
                          <Printer className="w-3 h-3" /> Bon Officiel
                        </button>

                        {voucher.receiptPhotoUrl && (
                          <button
                            onClick={() => setPreviewReceiptDoc({
                              title: `Reçu Station — ${voucher.stationReceiptNumber} (${voucher.vehiclePlate})`,
                              url: voucher.receiptPhotoUrl!
                            })}
                            className="p-1 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 border border-sky-300 dark:border-sky-700 cursor-pointer"
                            title="Voir le reçu de station numérisé"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SOUS-ONGLET 3 : SUIVI CONSOMMATION AU KM & CARTES PRÉPAYÉES               */}
      {/* ========================================================================= */}
      {activeSubTab === 'consumption_cards' && (
        <div className="space-y-6">

          {/* Section A : Cartes Prépayées Déposées chez les Stations Partenaires */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-500" />
                  Cartes Prépayées Déposées chez les Stations d'Essence (Naftal)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  L'entreprise dépose des cartes de paiement prépayées dans les stations d'essence partenaires pour approvisionner la flotte sur bon de commande
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs font-bold font-mono">
                Solde Global : {totalPrepaidBalanceDZD.toLocaleString('fr-DZ')} DA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {prepaidCards.map((card) => {
                const percentageRemaining = Math.round((card.currentBalanceDZD / card.initialBalanceDZD) * 100);
                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-[#0c121e] dark:to-[#121929] border border-slate-200 dark:border-[#1e2a3f] space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                        {card.cardNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        card.currentBalanceDZD < 30000 
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {card.currentBalanceDZD < 30000 ? 'Solde Bas' : 'Actif'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {card.stationName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ville : {card.stationCity}
                      </p>
                    </div>

                    {/* Solde en gros */}
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Solde Disponible sur Carte</span>
                      <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                        {card.currentBalanceDZD.toLocaleString('fr-DZ')} <span className="text-xs text-sky-500 font-bold">DA</span>
                      </div>
                    </div>

                    {/* Jauge */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Approvisionné : {card.initialBalanceDZD.toLocaleString('fr-DZ')} DA</span>
                        <span className="font-bold">{percentageRemaining}% restant</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${percentageRemaining < 25 ? 'bg-rose-500' : 'bg-sky-500'}`}
                          style={{ width: `${percentageRemaining}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      Déposée le {card.depositDate}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B : Suivi de la Consommation Réelle au Km Parcouru */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-600" />
                  Suivi de la Consommation Réelle selon les Kilomètres Parcourus
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ratio calculé : <strong className="font-mono text-slate-700 dark:text-slate-300">(Litres Ajoutés ÷ Distance Parcourue ΔKM) × 100</strong> et comparatif avec la consommation constructeur
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Éco-Conduite
                </span>
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Alerte Surconso &gt; 20%
                </span>
              </div>
            </div>

            {/* Matrice de Consommation par Véhicule */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#0c121e] text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-[#222f47]">
                  <tr>
                    <th className="py-3 px-4">Véhicule & Chauffeur</th>
                    <th className="py-3 px-4">Carburant</th>
                    <th className="py-3 px-4">Odomètre Actuel</th>
                    <th className="py-3 px-4">Distance Relevée (ΔKM)</th>
                    <th className="py-3 px-4">Carburant Consommé (L)</th>
                    <th className="py-3 px-4">Dépense Totale (DA)</th>
                    <th className="py-3 px-4">Consommation Réelle</th>
                    <th className="py-3 px-4">Norme Constructeur</th>
                    <th className="py-3 px-4">Écart & Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
                  {vehicleConsumptionStats.map((stat) => (
                    <tr key={stat.vehicle.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                      {/* Véhicule */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {stat.vehicle.plate}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold block">
                          {stat.vehicle.make} {stat.vehicle.model}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {stat.vehicle.driverName}
                        </span>
                      </td>

                      {/* Carburant */}
                      <td className="py-3.5 px-4 whitespace-nowrap uppercase font-semibold text-[11px]">
                        {stat.vehicle.fuelType === 'diesel' ? 'Gasoil' : stat.vehicle.fuelType === 'essence' ? 'Sans Plomb' : 'GPL'}
                      </td>

                      {/* Odomètre */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {stat.vehicle.mileage.toLocaleString('fr-DZ')} km
                      </td>

                      {/* Distance relevée */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {stat.totalDistance > 0 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {stat.totalDistance.toLocaleString('fr-DZ')} km
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">En cours</span>
                        )}
                      </td>

                      {/* Volume servi */}
                      <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                        {stat.totalVolume > 0 ? `${stat.totalVolume.toLocaleString('fr-DZ')} L` : '—'}
                      </td>

                      {/* Dépense DA */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                        {stat.totalCost > 0 ? `${stat.totalCost.toLocaleString('fr-DZ')} DA` : '—'}
                      </td>

                      {/* Consommation Réelle L/100km */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {stat.realAverageConsumption > 0 ? (
                          <span className={`px-2.5 py-1 rounded-lg font-black text-xs inline-flex items-center gap-1 border ${
                            stat.efficiencyStatus === 'surconsommation'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                              : stat.efficiencyStatus === 'eco'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                          }`}>
                            <Gauge className="w-3.5 h-3.5" />
                            {stat.realAverageConsumption} L/100km
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">En étalonnage</span>
                        )}
                      </td>

                      {/* Norme Constructeur */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {stat.theoreticalConsumption} L/100km
                      </td>

                      {/* Diagnostic */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {stat.realAverageConsumption > 0 ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            stat.efficiencyStatus === 'surconsommation'
                              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200'
                              : stat.efficiencyStatus === 'eco'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {stat.diffPercentage > 0 ? `+${stat.diffPercentage}%` : `${stat.diffPercentage}%`} • {
                              stat.efficiencyStatus === 'surconsommation'
                                ? '⚠️ Surconsommation'
                                : stat.efficiencyStatus === 'eco'
                                ? '🌱 Éco-conforme'
                                : 'Conforme'
                            }
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">1er ravitaillement attendu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 1 : ÉMETTRE UN BON DE RAVITAILLEMENT (GESTIONNAIRE DU PARC)       */}
      {/* ========================================================================= */}
      {isCreateVoucherModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Émettre un Bon de Ravitaillement Carburant</h3>
                  <p className="text-xs text-slate-500">Document d'autorisation officiel remis au conducteur pour ravitaillement station</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateVoucherModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300">
              {/* Ligne 1 : Véhicule & Chauffeur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Véhicule à Ravititailler <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newVoucherVehicleId}
                    onChange={(e) => setNewVoucherVehicleId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate} — {v.make} {v.model} ({v.fuelType.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Conducteur Titulaire
                  </label>
                  <select
                    value={newVoucherDriverId}
                    onChange={(e) => setNewVoucherDriverId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ligne 2 : Type de Ravitaillement (Point clé : pas forcément le plein à chaque fois) */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-[#18150e] border border-amber-200/80 dark:border-amber-900/50">
                <label className="block text-xs font-bold text-amber-800 dark:text-amber-300">
                  Type de Ravitaillement Carburant
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'partiel_appoint', label: 'Dotation Partielle / Appoint', desc: 'Volume ou montant spécifique' },
                    { id: 'plein_complet', label: 'Plein Complet Réservoir', desc: 'Remplissage 100% capacité' },
                    { id: 'dotation_mission', label: 'Dotation Spécifique Mission', desc: 'Alloué pour un Ordre de Mission' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewVoucherRefuelType(t.id as RefuelType)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        newVoucherRefuelType === t.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                          : 'bg-white dark:bg-[#0c121e] border-slate-200 dark:border-[#1e2a3f] text-slate-700 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{t.label}</div>
                      <div className={`text-[9px] ${newVoucherRefuelType === t.id ? 'text-amber-100' : 'text-slate-400'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ligne 3 : Station d'essence & Carte Prépayée Déposée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Station Dépositaire & Carte Prépayée <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newVoucherCardId}
                    onChange={(e) => setNewVoucherCardId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {prepaidCards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.stationName} (Solde : {c.currentBalanceDZD.toLocaleString('fr-DZ')} DA)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date de Délivrance du Bon
                  </label>
                  <input
                    type="date"
                    required
                    value={newVoucherDate}
                    onChange={(e) => setNewVoucherDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Ligne 4 : Volume en Litres & Calcul Automatique du Montant DA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 dark:bg-[#0c1813] p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    Volume Autorisé (Litres) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="5"
                      max="1000"
                      value={newVoucherQuantityLiters}
                      onChange={(e) => setNewVoucherQuantityLiters(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-3 pr-8 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">L</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Gasoil : 29.01 DA/L • Sans Plomb : 45.62 DA/L
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    Budget Prévisionnel Estimé (DZD)
                  </label>
                  <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 py-2">
                    {(() => {
                      const veh = vehicles.find(v => v.id === newVoucherVehicleId);
                      const fType = veh?.fuelType || 'diesel';
                      const rate = fType === 'diesel' ? 29.01 : fType === 'essence' ? 45.62 : 9.00;
                      return Math.round(newVoucherQuantityLiters * rate).toLocaleString('fr-DZ');
                    })()} DA
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Sera décompté de la carte prépayée après remise du reçu station
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motif / Remarques pour la station
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ravitaillement mission Alger-Oran, véhicule de service..."
                  value={newVoucherNotes}
                  onChange={(e) => setNewVoucherNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  data-testid="cancel-create-voucher-btn"
                  onClick={() => setIsCreateVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1c273e] dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Délivrer le Bon de Ravitaillement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 2 : SAISIE DU REÇU STATION & KILOMÉTRAGE (CLÔTURE & RAPPROCHEMENT)  */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && voucherToComplete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Saisie du Reçu Station & Relevé Odomètre
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rapprochement du Bon <strong className="font-mono text-emerald-600">{voucherToComplete.voucherNumber}</strong> • Calcul de la consommation au 100km
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteVoucherWithReceipt} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300">
              {/* Rappel du Bon */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Véhicule :</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{voucherToComplete.vehiclePlate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Chauffeur :</span>
                  <strong className="text-slate-900 dark:text-white">{voucherToComplete.driverName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Station :</span>
                  <strong className="text-slate-900 dark:text-white truncate block">{voucherToComplete.stationName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Volume Prévu :</span>
                  <strong className="text-emerald-600 font-mono">{voucherToComplete.quantityRequestedLiters} Litres</strong>
                </div>
              </div>

              {/* N° Reçu & Date/Heure réelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro du Reçu Station / Ticket Naftal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: REC-NAFTAL-90114"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date & Heure Effectives du Service <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Volume réel & Montant payé */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Volume Réel Servi à la Pompe (Litres) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={receiptQuantityLiters}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setReceiptQuantityLiters(q);
                      const rate = voucherToComplete.fuelType === 'diesel' ? 29.01 : voucherToComplete.fuelType === 'essence' ? 45.62 : 9.00;
                      setReceiptAmountDZD(Math.round(q * rate));
                    }}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Montant Réel Débité Carte (DZD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={receiptAmountDZD}
                    onChange={(e) => setReceiptAmountDZD(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2 text-xs font-mono font-black text-amber-700 dark:text-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Odomètre relevé & Calcul de la Consommation Réelle */}
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-[#0c1626] border border-sky-200 dark:border-sky-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-sky-600" />
                    Odomètre Relevé au Compteur lors du Passage en Station (KM) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Compteur précédent : {(() => {
                      const v = vehicles.find(veh => veh.plate === voucherToComplete.vehiclePlate);
                      return (v?.mileage || 50000).toLocaleString('fr-DZ');
                    })()} km
                  </span>
                </div>

                <input
                  type="number"
                  required
                  value={receiptOdometerKm}
                  onChange={(e) => setReceiptOdometerKm(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#1e2a3f] rounded-xl px-3 py-2.5 text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />

                {/* Calcul en direct de la consommation */}
                {(() => {
                  const v = vehicles.find(veh => veh.plate === voucherToComplete.vehiclePlate);
                  const prevKm = v?.mileage || (receiptOdometerKm - 350);
                  const deltaKm = Math.max(1, receiptOdometerKm - prevKm);
                  const calculatedConso = parseFloat(((receiptQuantityLiters / deltaKm) * 100).toFixed(1));
                  const theoretical = v?.averageConsumption || 8.0;
                  const isHigh = calculatedConso > (theoretical * 1.2);

                  return (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#121929] border border-sky-100 dark:border-sky-950 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Distance parcourue depuis dernier relevé :</span>
                        <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          +{deltaKm.toLocaleString('fr-DZ')} km
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Consommation calculée :</span>
                        <strong className={`font-mono text-sm font-black ${isHigh ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {calculatedConso} L / 100km
                        </strong>
                        <span className="text-[9px] text-slate-400 block">
                          (Norme constructeur : {theoretical} L/100km)
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Upload photo / scan du reçu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reçu Station Numérisé / Photo du Ticket
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setReceiptPhotoUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 dark:file:bg-sky-950 dark:file:text-sky-300"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Si non fourni, un reçu numérisé certifié conforme avec code-barres Naftal sera généré automatiquement.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  data-testid="cancel-receipt-modal-btn"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1c273e] dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReceipt}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReceipt ? 'Rapprochement en cours...' : 'Valider le Reçu & Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 3 : VISUALISATION OFFICIELLE DU BON DE RAVITAILLEMENT (A4 / PRINT) */}
      {/* ========================================================================= */}
      {previewVoucherDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Bon de Ravitaillement Carburant Officiel — {previewVoucherDoc.voucherNumber}
                </h3>
              </div>
              <button
                data-testid="close-preview-voucher-x-btn"
                onClick={() => setPreviewVoucherDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-[#070b12]">
              {/* Rendu du Bon au format document officiel React JSX */}
              <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-xl border-2 border-emerald-600/30 text-slate-800 dark:text-slate-100">
                {/* Entête Officielle */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-emerald-600/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        DZ
                      </div>
                      <span className="font-black text-lg text-emerald-800 dark:text-emerald-400 tracking-wide">DZ-FLEET MOBILITY ALGERIA</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Direction Centrale des Moyens Généraux &amp; Gestion de Flotte Automobile
                    </p>
                    <p className="text-[10px] text-slate-400">Réglementation &amp; Décret Exécutif 04-381</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                      BON DE RAVITAILLEMENT
                    </span>
                    <div className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                      N° {previewVoucherDoc.voucherNumber}
                    </div>
                    <span className="text-[11px] text-slate-500">Date : {previewVoucherDoc.date}</span>
                  </div>
                </div>

                {/* Métadonnées Ravitaillement */}
                <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-slate-50 dark:bg-[#131d31] rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Type de Ravitaillement</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {previewVoucherDoc.refuelType === 'partiel_appoint' 
                        ? 'Appoint / Partiel' 
                        : previewVoucherDoc.refuelType === 'dotation_mission' 
                          ? 'Dotation Mission' 
                          : 'Plein Complet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mode de Règlement</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      {previewVoucherDoc.prepaidCardNumber ? `Carte ${previewVoucherDoc.prepaidCardNumber}` : 'Carte Prépayée Station'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statut Document</span>
                    <span className={`font-bold inline-flex items-center gap-1 ${previewVoucherDoc.status === 'ravitaille' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {previewVoucherDoc.status === 'ravitaille' ? 'Ravitaillement Effectué' : 'Émis - En attente'}
                    </span>
                  </div>
                </div>

                {/* Section Véhicule & Chauffeur */}
                <div className="mb-4 p-3.5 bg-slate-50/70 dark:bg-[#131d31]/70 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    Véhicule Assigné &amp; Conducteur Autorisé
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Immatriculation</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white text-sm bg-white dark:bg-[#0c121e] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block">
                        {previewVoucherDoc.vehiclePlate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Marque / Modèle</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {previewVoucherDoc.vehicleModel}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Chauffeur</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        {previewVoucherDoc.driverName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Station Dépositaire & Volume Alloué */}
                <div className="mb-4 p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Station-Service Partenaire &amp; Dotation Autorisée
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-amber-700/70 dark:text-amber-300/70 text-[10px] block">Station Dépositaire</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {previewVoucherDoc.stationName}
                      </span>
                    </div>
                    <div>
                      <span className="text-amber-700/70 dark:text-amber-300/70 text-[10px] block">Volume Carburant Alloué</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {previewVoucherDoc.quantityRequestedLiters} Litres
                      </span>
                    </div>
                    <div>
                      <span className="text-amber-700/70 dark:text-amber-300/70 text-[10px] block">Budget Estimé Plafond</span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        {previewVoucherDoc.estimatedAmountDZD.toLocaleString('fr-DZ')} DA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Données Relevées si Ravitaillement Effectué */}
                {previewVoucherDoc.status === 'ravitaille' && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] uppercase mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Données Clôturées par Reçu Station
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 text-[10px] block">N° Reçu Station</span>
                        <span className="font-mono font-bold">{previewVoucherDoc.stationReceiptNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Volume Réel Servi</span>
                        <span className="font-bold text-emerald-600">{previewVoucherDoc.actualQuantityLiters || previewVoucherDoc.quantityRequestedLiters} L</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Montant Facturé</span>
                        <span className="font-bold text-amber-600">{(previewVoucherDoc.actualAmountDZD || previewVoucherDoc.estimatedAmountDZD).toLocaleString('fr-DZ')} DA</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Odomètre Relevé</span>
                        <span className="font-mono font-bold">{previewVoucherDoc.odometerKm ? `${previewVoucherDoc.odometerKm.toLocaleString('fr-DZ')} km` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signatures & Cachets */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-[#131d31] rounded-xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase mb-1">Visa Gestionnaire Flotte</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{previewVoucherDoc.issuedBy}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
                      <CheckCircle className="w-3 h-3" /> BON VALIDE &amp; HOMOLOGUÉ
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#131d31] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase mb-1">Cachet &amp; Reçu Station-Service</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Relevé kilométrique obligatoire à la pompe avant ravitaillement
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 italic font-mono">
                      Signature &amp; Cachet Pompiste
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0c121e] border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between text-xs">
              <span className="text-slate-500">Document d'approvisionnement souverain conforme Décret 04-381</span>
              <button
                data-testid="close-preview-voucher-x-btn"
                onClick={() => setPreviewVoucherDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-[#1c273e] hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 4 : VISUALISATION DU REÇU STATION NUMÉRISÉ (TICKET NAFTAL)         */}
      {/* ========================================================================= */}
      {previewReceiptDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-[#222f47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between bg-slate-50 dark:bg-[#0c121e]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{previewReceiptDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewReceiptDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c273e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-[#070b12]">
              {previewReceiptDoc.url.startsWith('data:image/') || previewReceiptDoc.url.startsWith('http') ? (
                <img
                  src={previewReceiptDoc.url}
                  alt={previewReceiptDoc.title}
                  className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ticket station numérisé</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0c121e] border-t border-slate-100 dark:border-[#1e2a3f] flex items-center justify-between text-xs">
              <span className="text-slate-500">Reçu certifié conforme par la station service</span>
              <button
                onClick={() => setPreviewReceiptDoc(null)}
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
