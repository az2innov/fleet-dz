import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  KeyRound, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  ShieldCheck, 
  Database, 
  Server, 
  Lock, 
  Copy, 
  Check, 
  FileText, 
  Search, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { Tenant, TenantUser, TenantBackupSummary, UserRole } from '../types.js';

interface RootBackOfficeProps {
  currentTenantId: string;
  onSwitchTenant: (tenantId: string) => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData?: () => void;
}

interface EnrichedTenant extends Tenant {
  vehiclesCount?: number;
  driversCount?: number;
  usersCount?: number;
  interventionsCount?: number;
  backupsCount?: number;
}

export const RootBackOffice: React.FC<RootBackOfficeProps> = ({
  currentTenantId,
  onSwitchTenant,
  onNavigateTab,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'users' | 'backups' | 'stats'>('tenants');
  const [tenants, setTenants] = useState<EnrichedTenant[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [backups, setBackups] = useState<TenantBackupSummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Modals
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isDeleteTenantModalOpen, setIsDeleteTenantModalOpen] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // User Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState<{ user: TenantUser; resetToken: string } | null>(null);
  const [hasCopiedToken, setHasCopiedToken] = useState(false);

  // Restore Modal
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreTenantId, setRestoreTenantId] = useState<string>('');
  const [restoreJsonFile, setRestoreJsonFile] = useState<File | null>(null);
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Form states for New Tenant (Manuel, sans création automatique des comptes)
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    tenantCode: '',
    companyType: 'Énergie & Industrie',
    wilaya: '16 - Alger',
    nif: '000016001298453',
    nis: '000016001298453001',
    rc: '16/00-0128945B01',
    address: 'Zone Industrielle, Alger',
    phone: '+213 21 00 00 00',
    email: '',
    brandColor: '#059669',
    plan: 'enterprise' as const,
  });

  // Form state for New User
  const [newUserForm, setNewUserForm] = useState({
    tenantId: 'tenant-sonatrach',
    email: '',
    name: '',
    role: 'super_admin' as UserRole,
    department: '',
    phone: '',
  });

  // Fetch all Root data
  const fetchAllRootData = async () => {
    setLoading(true);
    try {
      const [statsRes, tenantsRes, backupsRes] = await Promise.all([
        fetch('/api/root/stats').then(r => r.json()),
        fetch('/api/root/tenants').then(r => r.json()),
        fetch('/api/root/backups').then(r => r.json()),
      ]);

      setStats(statsRes);
      if (Array.isArray(tenantsRes)) setTenants(tenantsRes);
      if (Array.isArray(backupsRes)) setBackups(backupsRes);

      // Fetch users
      const usersRes = await fetch('/api/root/tenants/all/users').then(r => r.json());
      if (Array.isArray(usersRes)) setUsers(usersRes);
    } catch (err) {
      console.error('Failed to load Root Back Office data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRootData();
  }, []);

  // Update slug and suggested tenant code automatically when typing name
  const handleTenantNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const cleanPrefix = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    const suggestedCode = `${cleanPrefix || 'TENANT'}-001`;
    
    setNewTenantForm(prev => ({
      ...prev,
      name,
      slug,
      tenantCode: prev.tenantCode && !prev.tenantCode.endsWith('-001') ? prev.tenantCode : suggestedCode,
      email: prev.email || `contact@${slug || 'entreprise'}-dz.com`,
    }));
  };

  // Submit New Tenant (Manuel, sans création automatique des comptes)
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.name || !newTenantForm.slug) {
      alert('Veuillez renseigner le nom et le code court du tenant.');
      return;
    }

    try {
      const payload = {
        name: newTenantForm.name,
        slug: newTenantForm.slug,
        tenantCode: newTenantForm.tenantCode || `${newTenantForm.slug.toUpperCase()}-001`,
        companyType: newTenantForm.companyType,
        wilaya: newTenantForm.wilaya,
        nif: newTenantForm.nif,
        nis: newTenantForm.nis,
        rc: newTenantForm.rc,
        address: newTenantForm.address,
        phone: newTenantForm.phone,
        email: newTenantForm.email,
        brandColor: newTenantForm.brandColor,
        plan: newTenantForm.plan,
      };

      const res = await fetch('/api/root/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du tenant');

      setIsAddTenantModalOpen(false);
      await fetchAllRootData();
      if (onRefreshData) onRefreshData();
      alert(`Tenant "${data.tenant.name}" créé avec succès !\n\n🔑 Code Organisation attribué : ${data.tenant.tenantCode}\n\nVous pouvez maintenant créer manuellement les comptes d'accès avec les emails de votre choix.`);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  // Submit Edit Tenant
  const handleSaveEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    try {
      const res = await fetch(`/api/root/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTenant),
      });
      if (!res.ok) throw new Error('Échec de la modification');
      setIsEditTenantModalOpen(false);
      fetchAllRootData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Confirm Delete Tenant
  const handleConfirmDeleteTenant = async () => {
    if (!deletingTenant) return;
    try {
      const res = await fetch(`/api/root/tenants/${deletingTenant.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de la suppression');
      setIsDeleteTenantModalOpen(false);
      setDeletingTenant(null);
      fetchAllRootData();
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Backup Tenant (Download JSON)
  const handleDownloadBackup = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/root/tenants/${tenantId}/backup`);
      if (!res.ok) throw new Error('Erreur de génération de la sauvegarde');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${tenantId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      fetchAllRootData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Trigger Restore
  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreTenantId || !restoreJsonFile) {
      alert('Veuillez sélectionner un tenant et fournir un fichier JSON valide.');
      return;
    }

    setIsRestoring(true);
    setRestoreStatusMsg('Lecture et vérification du fichier de sauvegarde...');

    try {
      const text = await restoreJsonFile.text();
      const payload = JSON.parse(text);

      setRestoreStatusMsg('Restauration souveraine des collections et contrôle d intégrité...');
      const res = await fetch(`/api/root/tenants/${restoreTenantId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la restauration');

      setRestoreStatusMsg('✅ Restauration achevée avec succès !');
      setTimeout(() => {
        setIsRestoreModalOpen(false);
        setRestoreJsonFile(null);
        setRestoreStatusMsg(null);
        setIsRestoring(false);
        fetchAllRootData();
        if (onRefreshData) onRefreshData();
      }, 1500);
    } catch (err: any) {
      setIsRestoring(false);
      setRestoreStatusMsg(`❌ Erreur : ${err.message}`);
    }
  };

  // Reset User Password
  const handleResetUserPassword = async (user: TenantUser) => {
    if (!confirm(`Confirmez-vous la réinitialisation du mot de passe pour ${user.email} (${user.name}) ? L'utilisateur recevra un jeton d'activation pour choisir un nouveau mot de passe privé.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/root/users/${user.id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de la réinitialisation');

      setResetResult({
        user: data.user,
        resetToken: data.resetToken,
      });
      setIsResetPasswordModalOpen(true);
      fetchAllRootData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/root/tenants/${newUserForm.tenantId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création utilisateur');

      setIsAddUserModalOpen(false);
      fetchAllRootData();
      setResetResult({
        user: data,
        resetToken: data.passwordResetToken || 'ACT-INITIAL',
      });
      setIsResetPasswordModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered lists
  const filteredTenants = tenants.filter(t => {
    const q = tenantSearchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q) || t.wilaya.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter(u => {
    if (selectedTenantFilter !== 'all' && u.tenantId !== selectedTenantFilter) return false;
    const q = userSearchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'root':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">👑 Root Platform</span>;
      case 'super_admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">Super Admin</span>;
      case 'maintenance_lead':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">Resp. Maintenance</span>;
      case 'fleet_manager':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Resp. Parc</span>;
      case 'controller':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">Contrôleur Gestion</span>;
      case 'driver':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">Chauffeur</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sovereign Platform Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Console d'Administration Plateforme (Root)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Server className="w-3 h-3" />
                Datacenter National Souverain (Alger)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Loi 18-07 / ANPDP
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Supervision Multi-Tenant & Disaster Recovery
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Gestion centralisée des comptes entreprises (Tenants), isolation absolue des données, contrôle des accès sécurisés par Email/Password/A2F et sauvegardes chiffrées.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsRestoreModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-sm font-semibold border border-slate-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              Restaurer un Tenant
            </button>
            <button
              onClick={() => setIsAddTenantModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouveau Tenant
            </button>
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs">Organisations</div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalTenants ?? tenants.length}</div>
            <div className="text-emerald-400 text-[10px] mt-0.5">● 100% actives</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs">Flottes Véhicules</div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalVehicles ?? 16}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Isolées par tenant</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs">Chauffeurs Déployés</div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalDrivers ?? 15}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">PWA Mobile liée</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs">Comptes Utilisateurs</div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalUsers ?? users.length}</div>
            <div className="text-amber-400 text-[10px] mt-0.5">5 profils / tenant</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs">Snapshots Sauvegardes</div>
            <div className="text-xl font-bold text-white mt-1">{backups.length}</div>
            <div className="text-indigo-400 text-[10px] mt-0.5">SHA-256 certifiés</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs">Disponibilité Souveraine</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats?.serverUptime ?? '99.98%'}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Haute tolérance</div>
          </div>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'tenants'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          🏢 Gestion des Tenants ({tenants.length})
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'users'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          👥 Comptes Utilisateurs & Mots de Passe ({users.length})
        </button>

        <button
          onClick={() => setActiveSubTab('backups')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'backups'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          💾 Sauvegardes & Restauration ({backups.length})
        </button>
      </div>

      {/* ======================= TAB 1: TENANTS MANAGEMENT ======================= */}
      {activeSubTab === 'tenants' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, wilaya ou slug..."
                value={tenantSearchQuery}
                onChange={e => setTenantSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllRootData}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Actualiser la liste"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {filteredTenants.map(t => {
              const isCurrent = t.id === currentTenantId;
              return (
                <div
                  key={t.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden ${
                    isCurrent 
                      ? 'border-emerald-500 dark:border-emerald-500 shadow-emerald-500/10 ring-1 ring-emerald-500' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: t.brandColor || '#059669' }}
                  />

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {t.name}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                              Actif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t.companyType} • {t.wilaya}
                        </p>
                      </div>

                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {t.plan}
                      </span>
                    </div>

                    {/* Tenant Code Badge (Zero Discovery Identifier) */}
                    <div className="flex items-center justify-between bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl px-2.5 py-1.5 mb-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Code Organisation :</span>
                        <span className="font-mono text-xs font-black tracking-wider text-indigo-700 dark:text-indigo-300">
                          {t.tenantCode || `${t.slug.toUpperCase()}-001`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(t.tenantCode || `${t.slug.toUpperCase()}-001`);
                          alert(`Code Organisation "${t.tenantCode || `${t.slug.toUpperCase()}-001`}" copié !`);
                        }}
                        className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shrink-0"
                        title="Copier le code de l'organisation"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Fiscal & Contact Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs space-y-1 mb-4">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>NIF Fiscal :</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{t.nif}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>RC Commerce :</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{t.rc}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Contact officiel :</span>
                        <span className="truncate max-w-[180px] text-slate-700 dark:text-slate-300">{t.email}</span>
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-5">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{t.vehiclesCount ?? 0}</div>
                        <div className="text-[10px] text-slate-500">Véhicules</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{t.driversCount ?? 0}</div>
                        <div className="text-[10px] text-slate-500">Chauffeurs</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{t.usersCount ?? 0}</div>
                        <div className="text-[10px] text-slate-500">Comptes</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onSwitchTenant(t.id);
                          onNavigateTab('dashboard');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-500/20"
                        title="Inspecter la flotte de ce tenant"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspecter
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTenantFilter(t.id);
                          setActiveSubTab('users');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                        title="Gérer les 5 profils de ce tenant"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Comptes
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadBackup(t.id)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Sauvegarder ce tenant (Backup JSON)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingTenant(t);
                          setIsEditTenantModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Modifier les coordonnées du tenant"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDeletingTenant(t);
                          setIsDeleteTenantModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Supprimer ce tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: USERS & PASSWORD MANAGEMENT ======================= */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {/* Tenant selector */}
              <div className="w-64">
                <select
                  value={selectedTenantFilter}
                  onChange={e => setSelectedTenantFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">🏢 Tous les Tenants ({tenants.length})</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par email, nom ou rôle..."
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setNewUserForm(prev => ({
                  ...prev,
                  tenantId: selectedTenantFilter !== 'all' ? selectedTenantFilter : tenants[0]?.id || 'tenant-sonatrach',
                }));
                setIsAddUserModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ajouter un Compte
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Utilisateur / Identifiant</th>
                    <th className="py-3 px-4">Tenant / Entreprise</th>
                    <th className="py-3 px-4">Rôle Attribué</th>
                    <th className="py-3 px-4">Statut Mot de Passe</th>
                    <th className="py-3 px-4">Département</th>
                    <th className="py-3 px-4 text-right">Actions de Sécurité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(u => {
                    const tenantMatch = tenants.find(t => t.id === u.tenantId);
                    const isPending = u.status === 'pending_password' || !u.hasCustomPassword;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {tenantMatch?.name || u.tenantId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(u.role)}
                        </td>
                        <td className="py-3 px-4">
                          {isPending ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <KeyRound className="w-3 h-3 text-amber-500" />
                                En attente de mot de passe
                              </span>
                              {u.passwordResetToken && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Jeton : <strong className="text-amber-600 dark:text-amber-300">{u.passwordResetToken}</strong>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Mot de passe défini (Actif)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {u.department || 'Standard'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleResetUserPassword(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/30 flex items-center gap-1 transition-colors"
                              title="Générer un jeton pour que l'utilisateur définisse son mot de passe"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Réinitialiser Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: BACKUPS & DISASTER RECOVERY ======================= */}
      {activeSubTab === 'backups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Créer une Sauvegarde Immédiate</h3>
                  <p className="text-xs text-slate-500">Export intégral certifié au format JSON avec empreinte SHA-256</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sélectionnez le Tenant à sauvegarder :
                </label>
                <div className="space-y-2">
                  {tenants.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.vehiclesCount} véhicules • {t.driversCount} chauffeurs • {t.usersCount} comptes</div>
                      </div>
                      <button
                        onClick={() => handleDownloadBackup(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Télécharger Backup
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Restore Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Restauration depuis un Fichier</h3>
                  <p className="text-xs text-slate-500">Injecter une archive JSON pour restaurer un tenant dans son état exact</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Attention de sécurité :</strong> La restauration remplace l'intégralité des véhicules, conducteurs, cartes Naftal et interventions du tenant sélectionné. Les données des autres tenants demeurent parfaitement étanches et intactes.
                </div>
              </div>

              <button
                onClick={() => setIsRestoreModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
              >
                <Upload className="w-4 h-4" />
                Ouvrir l'Assistant de Restauration
              </button>
            </div>
          </div>

          {/* Backups History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              Journal des Snapshots & Sauvegardes Disponibles ({backups.length})
            </h3>

            {backups.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Aucun instantané enregistré pour le moment. Cliquez sur "Télécharger Backup" pour générer un premier snapshot.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date Snapshot</th>
                      <th className="py-2.5 px-3">Tenant</th>
                      <th className="py-2.5 px-3">Taille</th>
                      <th className="py-2.5 px-3">Contenu</th>
                      <th className="py-2.5 px-3">Empreinte SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {backups.map(b => (
                      <tr key={b.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {new Date(b.createdAt).toLocaleString('fr-DZ')}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                          {b.tenantName}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{b.sizeKb} Ko</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {b.recordsCount.vehicles} véh., {b.recordsCount.drivers} chauf., {b.recordsCount.interventions} interv., {b.recordsCount.users} cpt.
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-xs">
                          {b.checksum}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADD TENANT ======================= */}
      {isAddTenantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  Créer un Nouveau Tenant Entreprise
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configuration de l'organisation et initialisation des comptes avec isolation totale</p>
              </div>
              <button 
                onClick={() => setIsAddTenantModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom de l'Entreprise / Filiale *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Naftal Distribution"
                    value={newTenantForm.name}
                    onChange={e => handleTenantNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code Court (Slug Normalisé) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: naftal"
                    value={newTenantForm.slug}
                    onChange={e => setNewTenantForm({ ...newTenantForm, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Secteur d'Activité
                  </label>
                  <input
                    type="text"
                    value={newTenantForm.companyType}
                    onChange={e => setNewTenantForm({ ...newTenantForm, companyType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Wilaya de Rattachement
                  </label>
                  <input
                    type="text"
                    value={newTenantForm.wilaya}
                    onChange={e => setNewTenantForm({ ...newTenantForm, wilaya: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIF Fiscal
                  </label>
                  <input
                    type="text"
                    value={newTenantForm.nif}
                    onChange={e => setNewTenantForm({ ...newTenantForm, nif: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    RC Commerce
                  </label>
                  <input
                    type="text"
                    value={newTenantForm.rc}
                    onChange={e => setNewTenantForm({ ...newTenantForm, rc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Code Organisation & Provisionnement Manuel */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Code Identifiant Unique de l'Organisation (Tenant Code)
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code Organisation Communiqué aux Utilisateurs *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SONATRACH-001, NAFTAL-001"
                    value={newTenantForm.tenantCode}
                    onChange={e => setNewTenantForm({ ...newTenantForm, tenantCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ce code confidentiel sera transmis par le Root aux collaborateurs de ce tenant pour leur permettre de s'authentifier sans divulgation des autres entreprises hébergées (Zero Discovery).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Création Manuelle des Comptes d'Accès
                  </div>
                  <p>
                    Conformément à la politique d'isolation et à la liberté de choix des emails, aucun compte n'est généré automatiquement. Une fois le tenant créé, vous ajouterez manuellement chaque utilisateur avec son adresse email personnelle ou professionnelle choisie (Super Admin, Resp. Maintenance, Resp. Parc, Contrôleur, Chauffeurs).
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-900/30"
                >
                  Créer et Déployer le Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADD USER (MANUAL PROVISIONING) ======================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Ajouter un Compte Utilisateur</h3>
                  <p className="text-xs text-slate-500">Création manuelle avec email au choix du collaborateur</p>
                </div>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organisation de Rattachement (Tenant) *
                </label>
                <select
                  required
                  value={newUserForm.tenantId}
                  onChange={e => setNewUserForm({ ...newUserForm, tenantId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white text-xs"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Code: {t.tenantCode || `${t.slug.toUpperCase()}-001`})
                    </option>
                  ))}
                </select>
                {(() => {
                  const selTenant = tenants.find(t => t.id === newUserForm.tenantId);
                  return (
                    <div className="mt-1.5 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between font-mono">
                      <span>Code Organisation associé : <strong>{selTenant?.tenantCode || 'TENANT-001'}</strong></span>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rôle & Profil Opérationnel *
                </label>
                <select
                  required
                  value={newUserForm.role}
                  onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white text-xs"
                >
                  <option value="super_admin">Super Administrateur (Administration Totale du Tenant)</option>
                  <option value="maintenance_lead">Responsable Maintenance (Fiches Réception, Ateliers, Pièces)</option>
                  <option value="fleet_manager">Gestionnaire de Parc (Ordres de Mission, DI, Carburant)</option>
                  <option value="controller">Contrôleur de Gestion (Coûts Interventions, TCO Global en DA)</option>
                  <option value="driver">Conducteur / Chauffeur (PWA Mobile Odomètre & Pleins)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Complet du Collaborateur *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mourad Dahmani"
                  value={newUserForm.name}
                  onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email de Connexion (Professionnel ou Personnel) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: m.dahmani@sonatrach.dz ou dahmani.mourad@gmail.com"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Libre choix : l'utilisateur s'authentifiera avec cette adresse email et le Code Organisation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Département / Direction :
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Moyens Généraux"
                    value={newUserForm.department}
                    onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone :
                  </label>
                  <input
                    type="tel"
                    placeholder="+213 661 00 00 00"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-900/20"
                >
                  Créer et Générer le Jeton
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: RESET PASSWORD RESULT ======================= */}
      {isResetPasswordModalOpen && resetResult && (() => {
        const userTenant = tenants.find(t => t.id === resetResult.user.tenantId);
        const tenantCode = userTenant?.tenantCode || `${userTenant?.slug.toUpperCase() || 'ORGANISATION'}-001`;
        const invitationText = `Bonjour ${resetResult.user.name},

Votre compte d'accès à la plateforme Dz-Fleet AI a été configuré par l'administrateur Root.

Voici vos paramètres de connexion souveraine :
- Code Organisation : ${tenantCode}
- Identifiant / Email : ${resetResult.user.email}
- Jeton d'activation : ${resetResult.resetToken}

Procédure de première connexion :
1. Rendez-vous sur https://fleet.dz
2. Saisissez votre Code Organisation (${tenantCode}) et votre Email
3. Cliquez sur "Définir mon mot de passe"
4. Saisissez le jeton d'activation (${resetResult.resetToken}) et définissez votre mot de passe privé fort (8+ caractères, majuscule, minuscule, chiffre et symbole).`;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Paramètres d'Accès & Jeton d'Activation</h3>
                  <p className="text-xs text-slate-500">Transmettez ces informations confidentielles au collaborateur</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Organisation :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{userTenant?.name || resetResult.user.tenantId}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">Code Organisation (Tenant Code) :</span>
                  <span className="font-mono font-black text-indigo-800 dark:text-indigo-200 tracking-wider text-sm">
                    {tenantCode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Utilisateur / Email :</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{resetResult.user.email}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Jeton d'Activation / Réinitialisation :</div>
                    <div className="font-mono text-base font-black text-emerald-800 dark:text-emerald-200 tracking-wider">
                      {resetResult.resetToken}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetResult.resetToken);
                      setHasCopiedToken(true);
                      setTimeout(() => setHasCopiedToken(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm text-emerald-700 dark:text-emerald-300"
                  >
                    {hasCopiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {hasCopiedToken ? 'Copié !' : 'Copier Jeton'}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-800 dark:text-amber-300">
                🔒 Le mot de passe sera défini par l'utilisateur lui-même lors de sa première connexion (avec vérification de politique de mots de passe forts).
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(invitationText);
                    alert("Message d'invitation complet avec le Code Organisation copié dans le presse-papier !");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Copier l'Invitation Complète
                </button>

                <button
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Terminé
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================= MODAL: RESTORE ASSISTANT ======================= */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Restauration Souveraine Tenant</h3>
                  <p className="text-xs text-slate-500">Injecter une sauvegarde chiffrée</p>
                </div>
              </div>
              <button onClick={() => setIsRestoreModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRestoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tenant de Destination (Cible) :
                </label>
                <select
                  required
                  value={restoreTenantId}
                  onChange={e => setRestoreTenantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">-- Choisissez le Tenant cible --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fichier de Sauvegarde JSON :
                </label>
                <input
                  type="file"
                  required
                  accept=".json,application/json"
                  onChange={e => setRestoreJsonFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white"
                />
              </div>

              {restoreStatusMsg && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                  {restoreStatusMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isRestoring}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Lancer la Restauration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE TENANT CONFIRM ======================= */}
      {isDeleteTenantModalOpen && deletingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirmer la Suppression</h3>
                <p className="text-xs text-slate-500">Action irréversible sur le tenant</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Êtes-vous absolument sûr de vouloir supprimer définitivement le tenant <strong>{deletingTenant.name}</strong> ({deletingTenant.id}) ?
              Toutes ses données associées (véhicules, conducteurs, cartes Naftal, interventions, comptes utilisateurs) seront immédiatement supprimées de la base.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteTenantModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDeleteTenant}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Supprimer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
