import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  X,
  RefreshCw,
  Mail,
  Send,
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
  email: string;
  label: string;
  badgeColor: string;
  description: string;
  permissions: string[];
}[] = [
  {
    role: 'super_admin',
    email: 'admin@fleet-dz.com',
    label: 'Super Administrateur',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    description: 'Accès souverain total : sécurité A2F par email, conformité ANPDP, audit des accès et configuration globale.',
    permissions: ['Tous les droits', 'Gestion des rôles & A2F', 'Export ANPDP', 'Clés de chiffrement', 'Parc & Missions'],
  },
  {
    role: 'fleet_manager',
    email: 'gestion@fleet-dz.com',
    label: 'Gestionnaire de Flotte',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    description: 'Pilotage complet du parc, affectation des chauffeurs, création des Ordres de Mission et suivi carburant.',
    permissions: ['CRUD Véhicules', 'CRUD Chauffeurs', 'Édition Ordres de Mission', 'Suivi Naftal', 'Gestion Sinistres'],
  },
  {
    role: 'maintenance_lead',
    email: 'maintenance@fleet-dz.com',
    label: 'Responsable Maintenance',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    description: 'Surveillance technique, état des pneumatiques, programmation des vidanges et contrôles techniques.',
    permissions: ['Statut Véhicules', 'Suivi Pneumatiques', 'Vidanges & Révisions', 'Alertes Critiques', 'Consultation Flotte'],
  },
  {
    role: 'controller',
    email: 'audit@fleet-dz.com',
    label: 'Contrôleur de Gestion',
    badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
    description: 'Supervision financière des dépenses en Dinars (DA), surconsommations carburant, péages et per diem.',
    permissions: ['KPI Financiers (DA)', 'Audit Carburant Naftal', 'Budgets Missions', 'Rapports CO₂', 'Export CSV'],
  },
  {
    role: 'driver',
    email: 'drivers@fleet-dz.com',
    label: 'Conducteur / Chauffeur',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
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
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRoleConfig = ROLES_CONFIG.find(r => r.role === selectedRole) || ROLES_CONFIG[0];

  // Envoi réel du code A2F par email via le serveur Express + SMTP Mailtrap
  const handleSendEmailCode = async () => {
    setIsSendingEmail(true);
    setErrorMsg(null);
    setEmailSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSentTo(data.email);
        setEmailSuccessMsg(`Un code de validation A2F a été envoyé à ${data.email} via le relais SMTP. Veuillez consulter votre boîte de réception (Mailtrap) pour relever les 6 chiffres.`);
      } else {
        setErrorMsg(data.error || 'Erreur lors de l\'envoi du code A2F par email.');
      }
    } catch (err: any) {
      setErrorMsg(`Erreur réseau lors de l'envoi de l'email : ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Validation du code A2F saisi
  const handleVerifyAndSwitchRole = async () => {
    if (!totpCode || totpCode.trim().length < 6) {
      setErrorMsg('Veuillez saisir le code de validation à 6 chiffres reçu dans votre boîte email.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, code: totpCode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setVerificationSuccess(true);
        onUpdateSession(data.session);

        setTimeout(() => {
          setVerificationSuccess(false);
          setEmailSentTo(null);
          setEmailSuccessMsg(null);
          setTotpCode('');
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Code A2F invalide ou expiré.');
      }
    } catch (err: any) {
      setErrorMsg(`Erreur réseau lors de la validation : ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0e1526]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Sécurité & Authentification A2F par Email
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
                  SMTP / Loi 18-07
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Codes de validation réels expédiés par email pour chaque profil d'administration
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Role Selection Matrix */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
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
                      setEmailSuccessMsg(null);
                      setTotpCode('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/90 dark:bg-[#1a233a] border-emerald-500 dark:border-emerald-400 shadow-sm ring-1 ring-emerald-500/40'
                        : 'bg-slate-50 dark:bg-[#0f1628] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${r.badgeColor}`}>
                        {r.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span>{r.email}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Email Sending & Code Input Section */}
          <div className="bg-slate-50 dark:bg-[#0f1628] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Code A2F expédié par Email
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Email de réception : <strong className="font-mono text-emerald-600 dark:text-emerald-400">{currentRoleConfig.email}</strong>
                  </p>
                </div>
              </div>

              {/* Bouton d'envoi du code par email */}
              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={isSendingEmail}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{emailSentTo ? 'Renvoyer le code par email' : 'Envoyer le code par email'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Email Success Feedback */}
            {emailSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Email envoyé avec succès !</strong>
                  <p className="mt-0.5">{emailSuccessMsg}</p>
                </div>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Saisir le code à 6 chiffres reçu dans votre boîte mail :
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-white dark:bg-[#151d32] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-center text-2xl font-mono font-bold tracking-[8px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Validité 10 minutes • Code à usage unique sécurisé
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verification Success */}
            {verificationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Code A2F validé ! Session souveraine initialisée pour le profil {currentRoleConfig.label}.</span>
              </div>
            )}
          </div>

          {/* Permissions Accordées */}
          <div className="bg-slate-50 dark:bg-[#0f1628] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Périmètre des permissions accordées pour <strong className="text-emerald-600 dark:text-emerald-400">{currentRoleConfig.label}</strong> :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentRoleConfig.permissions.map((p, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1a233a] border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0e1526] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Chiffrement TLS 1.3 • Conforme directives ANPDP Algérie</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleVerifyAndSwitchRole}
              disabled={isVerifying || !totpCode}
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
