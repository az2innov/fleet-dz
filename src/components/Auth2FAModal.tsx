import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  UserCheck, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  X,
  RefreshCw,
  Copy,
  ExternalLink,
  Users
} from 'lucide-react';
import { UserRole, UserSession } from '../types.js';

interface Auth2FAModalProps {
  currentSession: UserSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSession: (newSession: UserSession) => void;
}

export const ROLES_CONFIG: {
  role: UserRole;
  label: string;
  badgeColor: string;
  description: string;
  permissions: string[];
}[] = [
  {
    role: 'super_admin',
    label: 'Super Administrateur',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Accès souverain total : sécurité A2F, conformité ANPDP, audit des accès et configuration globale.',
    permissions: ['Tous les droits', 'Gestion des rôles & A2F', 'Export ANPDP', 'Clés de chiffrement', 'Parc & Missions'],
  },
  {
    role: 'fleet_manager',
    label: 'Gestionnaire de Flotte',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Pilotage complet du parc, affectation des chauffeurs, création des Ordres de Mission et suivi carburant.',
    permissions: ['CRUD Véhicules', 'CRUD Chauffeurs', 'Édition Ordres de Mission', 'Suivi Naftal', 'Gestion Sinistres'],
  },
  {
    role: 'maintenance_lead',
    label: 'Responsable Maintenance',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Surveillance technique, état des pneumatiques, programmation des vidanges et contrôles techniques.',
    permissions: ['Statut Véhicules', 'Suivi Pneumatiques', 'Vidanges & Révisions', 'Alertes Critiques', 'Consultation Flotte'],
  },
  {
    role: 'controller',
    label: 'Contrôleur de Gestion',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'Supervision financière des dépenses en Dinars (DA), surconsommations carburant, péages et per diem.',
    permissions: ['KPI Financiers (DA)', 'Audit Carburant Naftal', 'Budgets Missions', 'Rapports d\'Émissions CO₂', 'Export CSV'],
  },
  {
    role: 'driver',
    label: 'Chauffeur / Conducteur',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Interface mobile PWA : relevé compteur, tickets Naftal, déclaration express et mission embarquée.',
    permissions: ['PWA Mode Hors-Ligne', 'Odomètre quotidien', 'Scan Tickets Naftal', 'Fiche Mission', 'Déclaration Sinistre'],
  },
];

export const Auth2FAModal: React.FC<Auth2FAModalProps> = ({
  currentSession,
  isOpen,
  onClose,
  onUpdateSession,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentSession.role);
  const [totpCode, setTotpCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mockTotpSecret, setMockTotpSecret] = useState<string>('JBSWY3DPEHPK3PXP');

  if (!isOpen) return null;

  const currentRoleConfig = ROLES_CONFIG.find(r => r.role === selectedRole) || ROLES_CONFIG[0];

  const handleSimulateTotpFill = () => {
    // Generate a valid 6-digit TOTP code
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setTotpCode(generated);
    setErrorMsg(null);
  };

  const handleVerifyAndSwitchRole = () => {
    if (!totpCode || totpCode.trim().length < 6) {
      setErrorMsg('Veuillez saisir le code TOTP à 6 chiffres généré par votre application Authenticator.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);

      const updatedSession: UserSession = {
        ...currentSession,
        role: selectedRole,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        name: selectedRole === 'super_admin' ? 'Amine Benzerga (Super Admin)' :
              selectedRole === 'fleet_manager' ? 'Djamel Rahmani (Chef de Flotte)' :
              selectedRole === 'maintenance_lead' ? 'Kamel Meziane (Resp. Maintenance)' :
              selectedRole === 'controller' ? 'Soraya Hadj (Contrôle Gestion)' :
              'Karim Belkacem (Chauffeur)',
        department: selectedRole === 'super_admin' ? 'Direction des Systèmes d\'Information (DSI)' :
                    selectedRole === 'fleet_manager' ? 'Direction des Moyens Généraux' :
                    selectedRole === 'maintenance_lead' ? 'Département Maintenance & Parc' :
                    selectedRole === 'controller' ? 'Direction Financière & Audit' :
                    'Pool Chauffeurs',
      };

      onUpdateSession(updatedSession);

      setTimeout(() => {
        setVerificationSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Sécurité Entreprise & Authentification A2F
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
                  TOTP / ANPDP
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Double Facteur & Contrôle d'accès basé sur les rôles (RBAC) pour entreprises et établissements publics
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Role Selection Matrix */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 1. Sélectionner le profil utilisateur (RBAC)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLES_CONFIG.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.role);
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${r.badgeColor}`}>
                        {r.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Permissions Summary */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Périmètre des permissions accordées pour <strong className="text-emerald-600 dark:text-emerald-400">{currentRoleConfig.label}</strong> :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentRoleConfig.permissions.map((p, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {p}
                </span>
              ))}
            </div>
          </div>

          {/* 2FA TOTP Form */}
          <div className="bg-emerald-50/50 dark:bg-gradient-to-br dark:from-slate-950 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Validation par Double Facteur (TOTP)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Google Authenticator, FreeOTP ou clé de sécurité FIDO2
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSimulateTotpFill}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Génère un code OTP valide pour tester"
              >
                <RefreshCw className="w-3 h-3" /> Simuler Code OTP
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Code à 6 chiffres :
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  Secret A2F: {mockTotpSecret}
                </span>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="Ex: 584920"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {verificationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Double facteur validé ! Session souveraine initialisée avec le rôle {currentRoleConfig.label}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Chiffrement TLS 1.3 • Conforme directives ANPDP Algérie</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleVerifyAndSwitchRole}
              disabled={isVerifying}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validation du code...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Valider l'Accès Sécurisé
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
