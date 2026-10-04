import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Building2,
  Navigation,
  ExternalLink 
} from 'lucide-react';
import { AccidentClaim, Vehicle } from '../types.js';

interface AccidentsManagerProps {
  accidentClaims: AccidentClaim[];
  vehicles: Vehicle[];
  onNavigateTab: (tab: any) => void;
}

export const AccidentsManager: React.FC<AccidentsManagerProps> = ({
  accidentClaims,
  vehicles,
  onNavigateTab,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string>(accidentClaims[0]?.id || '');

  const selectedClaim = accidentClaims.find(c => c.id === selectedClaimId) || accidentClaims[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Assistance Sinistre Instantanée
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Gestion des Sinistres & Déclarations d'Accident</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Le conducteur déclare le sinistre depuis l'application PWA Souveraine (même hors-ligne) avec photos des dégâts, géolocalisation certifiée et transmission directe aux assureurs conventionnés.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('pwa_driver')}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          Déclaration Sinistre via PWA
        </button>
      </div>

      {accidentClaims.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Aucun sinistre en cours</h3>
          <p className="text-xs text-slate-400 mt-1">Tous les véhicules de la flotte sont indemnes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Claims List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Dossiers déclarés ({accidentClaims.length})
            </h3>
            {accidentClaims.map((claim) => {
              const isSelected = claim.id === selectedClaim?.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-orange-50/80 dark:bg-slate-800/90 border-orange-400 dark:border-orange-500/50 shadow-md ring-1 ring-orange-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                      {claim.claimNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      claim.severity === 'severe'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                        : claim.severity === 'moderate'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      Gravité : {claim.severity === 'severe' ? 'Élevée' : claim.severity === 'moderate' ? 'Moyenne' : 'Légère'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{claim.driverName}</p>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">{claim.vehiclePlate}</p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" /> {claim.location}
                    </span>
                    <span>{claim.date} à {claim.time}</span>
                  </div>

                  {claim.gpsCoordinates && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-sky-600 dark:text-sky-400 font-mono bg-slate-50 dark:bg-slate-950/60 px-2 py-1 rounded border border-slate-200/60 dark:border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 shrink-0" />
                        {claim.gpsCoordinates.latitude.toFixed(4)}°, {claim.gpsCoordinates.longitude.toFixed(4)}°
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${claim.gpsCoordinates.latitude},${claim.gpsCoordinates.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-0.5 text-sky-600 dark:text-sky-300 font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Carte <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Claim Detailed Inspector */}
          {selectedClaim && (
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                      Dossier {selectedClaim.claimNumber}
                    </span>
                    {selectedClaim.gpsCoordinates && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 text-[10px] font-semibold flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5" /> Géolocalisé GPS
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Accident : {selectedClaim.location}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Déclaré le {selectedClaim.date} à {selectedClaim.time}
                  </p>
                  {selectedClaim.gpsCoordinates && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-sky-300">
                      <span>Coordonnées exactes : {selectedClaim.gpsCoordinates.latitude.toFixed(5)}° N, {selectedClaim.gpsCoordinates.longitude.toFixed(5)}° E (±{selectedClaim.gpsCoordinates.accuracy || 15}m)</span>
                      <a
                        href={`https://www.google.com/maps?q=${selectedClaim.gpsCoordinates.latitude},${selectedClaim.gpsCoordinates.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] text-sky-700 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900 flex items-center gap-1 font-sans"
                      >
                        Voir sur carte <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Coût estimatif réparations</span>
                  <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                    {selectedClaim.estimatedCostDZD ? `${selectedClaim.estimatedCostDZD.toLocaleString('fr-DZ')} DA` : 'En cours d\'expertise'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Récit du chauffeur (transmis via PWA Souveraine) :
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{selectedClaim.description}"
                </div>
              </div>

              {/* AI Damage Assessment */}
              {selectedClaim.aiDamageAssessment && (
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Analyse Vision & Diagnostic des Dommages par IA :
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedClaim.aiDamageAssessment}
                  </p>
                </div>
              )}

              {/* Photos transmitted via PWA */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  Photos des dégâts reçues ({selectedClaim.photos.length}) :
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedClaim.photos.map((photo, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 max-h-48">
                      <img src={photo} alt="Dégâts constatés" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {selectedClaim.photos.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center col-span-2">
                      Aucune photo jointe au constat numérique initial.
                    </div>
                  )}
                </div>
              </div>

              {/* Third Party & Insurance Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Conducteur de la flotte :
                  </span>
                  <p className="text-slate-900 dark:text-white font-medium">{selectedClaim.driverName}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{selectedClaim.driverPhone}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-1 font-mono">Véhicule : {selectedClaim.vehiclePlate}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Tiers & Compagnie d'Assurance :
                  </span>
                  {selectedClaim.thirdPartyInfo ? (
                    <>
                      <p className="text-slate-900 dark:text-white font-medium">{selectedClaim.thirdPartyInfo.name || 'Tiers identifié'}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedClaim.thirdPartyInfo.insuranceCompany || 'Assurance en attente'}</p>
                      <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] mt-1">Immat: {selectedClaim.thirdPartyInfo.plateNumber || 'N/A'}</p>
                    </>
                  ) : (
                    <p className="text-slate-400">Aucun tiers impliqué (accident isolé).</p>
                  )}
                </div>
              </div>

              {/* Transmission Compagnie d'Assurance Conventionnée (Algérie) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Transmission Assureur Conventionné (CAAT / SAA / CASH / CIAR)
                    </span>
                  </div>
                  {selectedClaim.insuranceTransmitted && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Transmis à {selectedClaim.insuranceTransmittedTo || 'SAA'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    defaultValue="SAA"
                    id="insurance-company-select"
                    className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="SAA">SAA Assurances (Société Nationale d'Assurance)</option>
                    <option value="CAAT">CAAT (Caisse Algérienne d'Assurance et de Réassurance)</option>
                    <option value="CASH">CASH Assurances (Hydrocarbures & Flottes)</option>
                    <option value="CIAR">CIAR Assurances</option>
                    <option value="2A">2A Assurances</option>
                    <option value="GAM">GAM Assurances</option>
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      const select = document.getElementById('insurance-company-select') as HTMLSelectElement;
                      const company = select?.value || 'SAA';
                      try {
                        await fetch(`/api/fleet/accidents/${selectedClaim.id}/transmit`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ company }),
                        });
                        selectedClaim.insuranceTransmitted = true;
                        selectedClaim.insuranceTransmittedTo = company as any;
                        alert(`Dossier sinistre ${selectedClaim.claimNumber} transmis avec succès à ${company} (constat, photos, GPS et rapport d'expertise IA inclus).`);
                      } catch (err) {
                        console.error('Failed to transmit claim:', err);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-950/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Transmettre le Dossier à l'Assurance
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Imprimer Rapport d'Expertise IA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
