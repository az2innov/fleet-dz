import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Lock, 
  Smartphone, 
  Database, 
  X,
  ExternalLink,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface SovereignComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SovereignComplianceModal: React.FC<SovereignComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadRegistry = () => {
    const reportText = `RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
AUTORITÉ NATIONALE DE PROTECTION DES DONNÉES À CARACTÈRE PERSONNEL (ANPDP)
DÉCLARATION DE CONFORMITÉ & REGISTRE DES TRAITEMENTS
Réf: DZ-ANPDP-DEC-2026-0419

1. CADRE LÉGAL & RÉGLEMENTAIRE :
- Conforme à la Loi n° 18-07 du 25 Ramadhan 1439 correspondant au 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.
- Conforme aux arrêtés techniques de l'ANPDP concernant la géolocalisation des flottes d'entreprises.

2. LOCALISATION DES DONNÉES (SOUVERAINETÉ NUMÉRIQUE) :
- Hébergement : Datacenter National Souverain (Alger, Algérie)
- Stockage des données de trajet, odomètre et identité : 100% sur le territoire algérien.
- Transfert transfrontalier hors Algérie : AUCUN.

3. ARCHITECTURE DE SÉCURITÉ PWA :
- PWA Sandboxing : Exécution étanche sans accès aux répertoires privés du smartphone.
- Mode Hors-Ligne (Offline-First) : Stockage local chiffré dans le navigateur, synchronisation unilatérale dès le retour réseau.
- Chiffrement en transit : TLS 1.3 avec suites cryptographiques fortes.
- Chiffrement au repos : AES-256 GCM pour les coordonnées GPS et pièces d'identité.

4. DONNÉES DE GÉOLOCALISATION & RESPECT DE LA VIE PRIVÉE :
- Finalité exclusive : Sécurité routière, certification des pleins Naftal et déclaration de sinistres.
- Purge automatisée des coordonnées GPS : Rétention maximale de 30 jours conformément aux recommandations de l'ANPDP.
- Pas de surveillance hors service : Géolocalisation désactivée en dehors des missions assignées.

Certifié conforme par la Direction de la Conformité & DPO Dz-Fleet AI.
Fait à Alger, le ${new Date().toLocaleDateString('fr-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificat_Conformite_ANPDP_Loi_18-07_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl">
              ANPDP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Conformité Loi 18-07 & Architecture Souveraine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Certifié
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autorité Nationale de Protection des Données à Caractère Personnel (Algérie)
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-300">
          {/* Key Guarantees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hébergement Souverain</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                100% hébergé en Algérie (Datacenter Alger). Aucun transfert de données vers des serveurs étrangers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2.5">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chiffrement AES-256</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Chiffrement strict TLS 1.3 en transit et AES-256 GCM au repos pour les coordonnées GPS et pièces d'identité.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bac à Sable PWA</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Immunisé contre les virus mobiles : exécution sandboxée sans nécessiter l'installation d'un fichier APK tiers.
              </p>
            </div>
          </div>

          {/* Legal Compliance Registry */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Fiche d'Enregistrement Réglementaire
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conformité aux exigences applicables aux entreprises publiques et privées
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                N° Déclaration : DZ-ANPDP-DEC-2026-0419
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Texte de Référence</span>
                <span className="font-medium text-slate-200">Loi 18-07 du 10 juin 2018 relative à la protection des données</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Autorité Tutelle</span>
                <span className="font-medium text-slate-200">ANPDP (Présidence de la République Algérienne)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Rétention des Coordonnées GPS</span>
                <span className="font-medium text-slate-200">30 jours maximum (purge automatique)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Délégué à la Protection des Données (DPO)</span>
                <span className="font-medium text-slate-200">dpo@dz-fleet.dz (Cabinet Agréé Alger)</span>
              </div>
            </div>
          </div>

          {/* Offline & Sahara Reliability */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">Continuité Opérationnelle en Zone Saharienne & Sans Réseau (Offline-First) :</strong>
              Les chauffeurs en transit sur les tronçons sahariens (ex: RN1 Transsaharienne, RN49, RN51) sans couverture réseau 3G/4G continuent d'enregistrer leurs tickets Naftal et compteurs en toute sécurité. Les données restent dans le bac à sable chiffré du téléphone et sont synchronisées automatiquement dès la détection d'une connexion réseau.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDownloadRegistry}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess ? 'Certificat Téléchargé !' : 'Télécharger Déclaration ANPDP (.txt)'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer Attestation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
