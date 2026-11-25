import React, { useState, useEffect } from 'react';
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
  Users, 
  LogOut, 
  Building2, 
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Server
} from 'lucide-react';
import { UserRole, UserSession, Tenant } from '../types.js';

interface Auth2FAModalProps {
  currentSession: UserSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSession: (newSession: UserSession) => void;
  onLogout?: () => void;
  isLockScreen?: boolean;
  currentTenant?: Tenant | null;
  tenantsList?: Tenant[];
  onSwitchTenant?: (tenantId: string) => void;
}

export const ROLES_CONFIG: {
  role: UserRole;
  label: string;
  badgeColor: string;
  description: string;
  permissions: string[];
}[] = [
  {
    role: 'root',
    label: 'Root Plateforme',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    description: 'Super-administrateur souverain : gestion multi-tenant, sauvegardes/restauration, gestion des accès.',
    permissions: ['Gestion des Tenants', 'Disaster Recovery (Backups)', 'Comptes & Reset Passwords', 'Supervision globale'],
  },
  {
    role: 'super_admin',
    label: 'Super Administrateur',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    description: 'Accès souverain total au tenant : sécurité A2F par email, conformité ANPDP, audit des accès et configuration.',
    permissions: ['Tous les droits du Tenant', 'Gestion rôles du tenant', 'Audit souverain', 'Parc & Missions'],
  },
  {
    role: 'fleet_manager',
    label: 'Gestionnaire de Parc (RespParc)',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    description: 'Pilotage complet du parc, affectation des chauffeurs, ordres de mission, demandes d intervention (DI) et bons Naftal.',
    permissions: ['CRUD Véhicules', 'CRUD Chauffeurs', 'Ordres de Mission', 'Émission DI Atelier', 'Bons Carburant Naftal'],
  },
  {
    role: 'maintenance_lead',
    label: 'Responsable Maintenance (RespMaintenance)',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    description: 'Gestion des révisions, établissement des fiches de réception après travaux (FR), contrôle qualité et pièces.',
    permissions: ['Fiches de Réception (FR)', 'Validation Ateliers', 'Suivi Pneumatiques & Vidanges', 'Clôture Interventions'],
  },
  {
    role: 'controller',
    label: 'Contrôleur de Gestion (ControleurGestion)',
    badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
    description: 'Supervision financière TCO : coût d acquisition + coûts des interventions + dépenses carburant en Dinars (DA).',
    permissions: ['Tableau TCO Global (DA)', 'Rapports Coûts Interventions', 'Audit Carburant', 'Exports Financiers'],
  },
  {
    role: 'driver',
    label: 'Conducteur / Chauffeur',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
    description: 'Interface mobile PWA : relevé odomètre, reçus carburant Naftal, déclaration express et mission active.',
    permissions: ['PWA Mode Hors-Ligne', 'Odomètre quotidien', 'Scan Reçus Naftal', 'Déclaration Sinistre'],
  },
];

export const Auth2FAModal: React.FC<Auth2FAModalProps> = ({
  currentSession,
  isOpen,
  onClose,
  onUpdateSession,
  onLogout,
  isLockScreen = false,
  currentTenant,
  tenantsList = [],
  onSwitchTenant,
}) => {
  // Step in the authentication flow: 'credentials' -> '2fa' OR 'setup_password'
  const [step, setStep] = useState<'credentials' | '2fa' | 'setup_password'>('credentials');
  
  // Credentials Form
  const [selectedTenantSlug, setSelectedTenantSlug] = useState<string>(() => {
    return currentTenant?.slug || 'sonatrach';
  });
  const [emailInput, setEmailInput] = useState<string>('SuperAdmin@sonatrach.com');
  const [passwordInput, setPasswordInput] = useState<string>('Algeria2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Setup / Reset Password Form
  const [setupToken, setSetupToken] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [setupSuccessMsg, setSetupSuccessMsg] = useState<string | null>(null);

  // 2FA Step
  const [totpCode, setTotpCode] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingRole, setPendingRole] = useState<string>('super_admin');
  const [pendingTenantName, setPendingTenantName] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  // Keep tenant updated
  useEffect(() => {
    if (currentTenant?.slug) {
      setSelectedTenantSlug(currentTenant.slug);
    }
  }, [currentTenant]);

  if (!isOpen) return null;

  // Handle Tenant selection change
  const handleTenantChange = (slug: string) => {
    setSelectedTenantSlug(slug);
    setErrorMsg(null);
    if (slug === 'root') {
      setEmailInput('root@dzfleet.dz');
    } else {
      setEmailInput(`SuperAdmin@${slug}.com`);
    }
  };

  // Quick Demo Shortcut selector
  const handleQuickDemoSelect = (role: UserRole) => {
    setErrorMsg(null);
    if (role === 'root') {
      setSelectedTenantSlug('root');
      setEmailInput('root@dzfleet.dz');
      setPasswordInput('Algeria2026!');
      return;
    }

    const effectiveSlug = selectedTenantSlug === 'root' ? 'sonatrach' : selectedTenantSlug;
    if (selectedTenantSlug === 'root') setSelectedTenantSlug('sonatrach');

    switch (role) {
      case 'super_admin':
        setEmailInput(`SuperAdmin@${effectiveSlug}.com`);
        break;
      case 'maintenance_lead':
        setEmailInput(`RespMaintenance@${effectiveSlug}.com`);
        break;
      case 'fleet_manager':
        setEmailInput(`RespParc@${effectiveSlug}.com`);
        break;
      case 'controller':
        setEmailInput(`ControleurGestion@${effectiveSlug}.com`);
        break;
      case 'driver':
        setEmailInput(
          effectiveSlug === 'sonatrach' ? 'chauffeur.belkacem@sonatrach.com' :
          effectiveSlug === 'cevital' ? 'chauffeur.belhadj@cevital.com' :
          'chauffeur.sellami@cosider.com'
        );
        break;
    }
    setPasswordInput('Algeria2026!');
  };

  // Step 1: Submit Credentials (Tenant + Email + Password)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSendingEmail(true);

    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: selectedTenantSlug,
          email: emailInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l authentification');
      }

      // Check if user must first set their private password
      if (data.requirePasswordSetup) {
        setPendingEmail(data.email);
        setPendingTenantName(data.tenantName);
        setSetupToken(data.token || '');
        setStep('setup_password');
        setIsSendingEmail(false);
        return;
      }

      // Credentials verified! Proceed to 2FA Step
      setPendingEmail(data.email);
      setPendingRole(data.role);
      setPendingTenantName(data.tenantName);
      setEmailSuccessMsg(data.message || `Code A2F expédié à ${data.email}`);
      setStep('2fa');
      setTotpCode('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Step 2 (Optional): Set Private Password
  const handleSetupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPasswordInput.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMsg('Les deux mots de passe saisis ne correspondent pas.');
      return;
    }

    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail || emailInput,
          tenantId: selectedTenantSlug,
          token: setupToken,
          newPassword: newPasswordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la configuration du mot de passe');

      setSetupSuccessMsg('Votre mot de passe privé a été enregistré avec succès ! Veuillez maintenant vous connecter.');
      setPasswordInput(newPasswordInput);
      setTimeout(() => {
        setStep('credentials');
        setSetupSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Step 3: Verify 2FA Code
  const handleVerify2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setErrorMsg('Veuillez saisir le code de vérification à 6 chiffres.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const isMasterKey = totpCode.trim() === '999999';

      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail || emailInput,
          role: pendingRole,
          code: totpCode.trim(),
          tenantId: selectedTenantSlug === 'root' ? 'platform-root' : selectedTenantSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code A2F invalide ou expiré');

      setVerificationSuccess(true);

      // If switched tenant, also update active tenant in parent
      if (onSwitchTenant && data.session?.tenantId && data.session?.tenantId !== 'platform-root') {
        onSwitchTenant(data.session.tenantId);
      }

      onUpdateSession(data.session);

      setTimeout(() => {
        setVerificationSuccess(false);
        setStep('credentials');
        setTotpCode('');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend 2FA Email
  const handleResend2FA = async () => {
    setIsSendingEmail(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: pendingRole, email: pendingEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSuccessMsg(`Un nouveau code A2F a été expédié à ${pendingEmail}`);
      } else {
        setErrorMsg(data.error || 'Erreur lors du renvoi du code');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 antialiased">
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          {!isLockScreen && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Souveraineté Nationale & ANPDP
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Isolation Multi-Tenant
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white">
            {step === 'credentials' && 'Connexion Sécurisée à Dz-Fleet AI'}
            {step === '2fa' && 'Validation Double Facteur (A2F)'}
            {step === 'setup_password' && 'Définir Votre Mot de Passe Privé'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {step === 'credentials' && 'Accès partitionné par Organisation, Identifiant et Mot de passe'}
            {step === '2fa' && `Code souverain expédié à ${pendingEmail}`}
            {step === 'setup_password' && 'Ce mot de passe restera strictement confidentiel et connu de vous seul'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* ===================== STEP 1: CREDENTIALS (TENANT + EMAIL + PASSWORD) ===================== */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="p-6 space-y-4">
            
            {/* Quick Demo Role Selector Pills */}
            <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ⚡ Raccourcis Rapides Profils Démo :
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('super_admin')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20 hover:bg-rose-100"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('maintenance_lead')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-100"
                >
                  Resp. Maintenance
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('fleet_manager')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-100"
                >
                  Resp. Parc
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('controller')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-500/20 hover:bg-sky-100"
                >
                  Contrôleur Gestion
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('driver')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-100"
                >
                  Chauffeur
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('root')}
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-100 flex items-center gap-1 ml-auto"
                >
                  👑 Root
                </button>
              </div>
            </div>

            {/* Tenant Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                Compte Organisation (Tenant) *
              </label>
              <select
                value={selectedTenantSlug}
                onChange={e => handleTenantChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sonatrach">🏢 Sonatrach - DP Hassi Messaoud (Pétrole & Gaz)</option>
                <option value="cevital">🏢 Cevital Agro-Industrie (Chaîne du Froid)</option>
                <option value="cosider">🏢 Cosider Groupe Travaux Publics (BTPH)</option>
                <option value="root">👑 Plateforme Souveraine (Compte Root)</option>
              </select>
            </div>

            {/* Email / Identifiant */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Identifiant / Email Personnel *
              </label>
              <input
                type="email"
                required
                placeholder="ex: SuperAdmin@sonatrach.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Mot de Passe *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPendingEmail(emailInput);
                    setStep('setup_password');
                  }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Première connexion ? Définir mon mot de passe
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingEmail}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all mt-2"
            >
              {isSendingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Vérification & Envoi du Code A2F...
                </>
              ) : (
                <>
                  Valider les Identifiants & Recevoir le Code A2F
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================== STEP 2: SETUP / RESET PASSWORD ===================== */}
        {step === 'setup_password' && (
          <form onSubmit={handleSetupPasswordSubmit} className="p-6 space-y-4">
            {setupSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs text-center font-semibold space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div>{setupSuccessMsg}</div>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                  Saisissez le <strong>Jeton d'activation</strong> fourni par l'administrateur Root, puis définissez votre mot de passe personnel.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse Email :
                  </label>
                  <input
                    type="email"
                    required
                    value={pendingEmail || emailInput}
                    onChange={e => setPendingEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jeton d'Activation / Réinitialisation (fourni par Root) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ACT-7X9K2A ou RST-..."
                    value={setupToken}
                    onChange={e => setSetupToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nouveau Mot de Passe Privé *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Au moins 6 caractères"
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmez le Mot de Passe *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Retapez le mot de passe"
                    value={confirmPasswordInput}
                    onChange={e => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    ← Retour à la connexion
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Enregistrer mon Mot de Passe Privé
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* ===================== STEP 3: 2FA VERIFICATION ===================== */}
        {step === '2fa' && (
          <form onSubmit={handleVerify2FASubmit} className="p-6 space-y-4">
            
            {emailSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>{emailSuccessMsg}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">
                Saisissez le Code A2F à 6 chiffres :
              </label>

              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="000000"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-56 text-center text-3xl font-mono font-black tracking-[10px] py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                />
              </div>

              <div className="text-center mt-2">
                <span className="text-[11px] text-slate-400">
                  Code de secours universel pour tests : <strong className="font-mono text-emerald-600 dark:text-emerald-400">999999</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ← Changer de compte
              </button>

              <button
                type="button"
                onClick={handleResend2FA}
                disabled={isSendingEmail}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
                Renvoyer le code
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifying || totpCode.length < 6}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                verificationSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/20'
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Vérification du Code...
                </>
              ) : verificationSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Authentifié avec Succès !
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Confirmer et Accéder à la Session
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
