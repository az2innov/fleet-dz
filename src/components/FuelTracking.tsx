import React, { useState } from 'react';
import { 
  Fuel, 
  Search, 
  Download, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  FileSpreadsheet, 
  TrendingUp, 
  Car, 
  MapPin, 
  Plus,
  Navigation,
  ExternalLink,
  AlertTriangle 
} from 'lucide-react';
import { FuelLog, Vehicle } from '../types.js';

interface FuelTrackingProps {
  fuelLogs: FuelLog[];
  vehicles: Vehicle[];
  onNavigateTab: (tab: any) => void;
}

export const FuelTracking: React.FC<FuelTrackingProps> = ({
  fuelLogs,
  vehicles,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>('all');

  const filteredLogs = fuelLogs.filter((log) => {
    const matchesSearch =
      log.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVehicle = selectedVehiclePlate === 'all' || log.vehiclePlate === selectedVehiclePlate;
    return matchesSearch && matchesVehicle;
  });

  const totalDZD = filteredLogs.reduce((acc, l) => acc + l.amountDZD, 0);
  const totalLiters = filteredLogs.reduce((acc, l) => acc + l.liters, 0);
  const averagePricePerLiter = totalLiters > 0 ? (totalDZD / totalLiters).toFixed(2) : '35.00';

  const handleExportCSV = () => {
    const headers = ['Date', 'Matricule', 'Chauffeur', 'Station', 'Ville', 'Montant_DZD', 'Litres', 'Prix_Unitaire_DZD', 'Source'];
    const rows = filteredLogs.map(l => [
      l.date.split('T')[0],
      l.vehiclePlate,
      `"${l.driverName}"`,
      `"${l.stationName}"`,
      `"${l.city}"`,
      l.amountDZD,
      l.liters,
      l.pricePerLiterDZD,
      l.source,
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Total Dépenses Carburant</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalDZD.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">DA</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Sur la période en cours</p>
        </div>

        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Volume Ravitaillement</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalLiters.toLocaleString('fr-DZ')}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Litres</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% justifié avec horodatage
          </p>
        </div>

        <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-5 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Prix Moyen constaté</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {averagePricePerLiter}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">DA / L</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Tarif officiel Naftal (Gasoil 29.01 DA / Sans-Plomb 45.62 DA)</p>
        </div>
      </div>

      {/* Table & Filtering */}
      <div className="bg-white dark:bg-[#121929] border border-slate-200/90 dark:border-[#222f47] rounded-2xl p-6 shadow-xs dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Fuel className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Journal des Ravitaillements en Carburant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Enregistrés via l'application PWA Souveraine (saisie odomètre, scan de reçu Naftal ou synchronisation hors-ligne)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Vehicle filter */}
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

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Station, chauffeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e2a3f] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-44"
              />
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1c273e] dark:hover:bg-[#253452] dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Exporter au format comptable"
            >
              <Download className="w-3.5 h-3.5" /> Exporter CSV
            </button>

            {/* New Fuel via PWA button */}
            <button
              onClick={() => onNavigateTab('pwa_driver')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Déclarer un plein (PWA Chauffeur)
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#0c121e] text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-[#222f47]">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Chauffeur</th>
                <th className="py-3 px-4">Station Naftal</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Montant Total</th>
                <th className="py-3 px-4">Origine</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e2a3f]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152033] transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {new Date(log.date).toLocaleDateString('fr-DZ', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {log.vehiclePlate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {log.driverName}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                      <span>{log.stationName} ({log.city})</span>
                    </div>
                    {log.gpsCoordinates && (
                      <a
                        href={`https://www.google.com/maps?q=${log.gpsCoordinates.latitude},${log.gpsCoordinates.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-0.5 hover:underline"
                        title="Voir la station sur Google Maps"
                      >
                        <Navigation className="w-2.5 h-2.5" />
                        <span>{log.gpsCoordinates.latitude.toFixed(4)}°, {log.gpsCoordinates.longitude.toFixed(4)}°</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {log.liters} L
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">@ {log.pricePerLiterDZD} DA/L</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-amber-700 dark:text-amber-400 text-sm">
                    {log.amountDZD.toLocaleString('fr-DZ')} DA
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1c273e] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      {log.source === 'pwa_scan' ? '📷 Scan Reçu Naftal' : log.source === 'pwa_manual' ? '📱 PWA Chauffeur' : 'Manuel'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {log.isOverconsumption ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/30" title={`Consommation réelle calculée : ${log.calculatedConsumption} L/100km`}>
                        <AlertTriangle className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                        Surconsommation ({log.calculatedConsumption} L/100km)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
