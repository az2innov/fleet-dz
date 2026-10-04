import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  HeartPulse, 
  Car, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Building2,
  X,
  Save,
  Check
} from 'lucide-react';
import { Driver, Vehicle, DriverStatus, LicenseCategory } from '../types.js';

interface DriversManagerProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onRefreshData: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DriversManager: React.FC<DriversManagerProps> = ({
  drivers,
  vehicles,
  onRefreshData,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+213');
  const [email, setEmail] = useState('');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [department, setDepartment] = useState('Direction des Moyens Généraux');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategories, setLicenseCategories] = useState<LicenseCategory[]>(['B']);
  const [licenseExpiry, setLicenseExpiry] = useState('2029-06-30');
  const [medicalCheckupExpiry, setMedicalCheckupExpiry] = useState('2027-04-15');
  const [medicalCheckupStatus, setMedicalCheckupStatus] = useState<'valid' | 'expiring_soon' | 'expired'>('valid');
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState('');
  const [status, setStatus] = useState<DriverStatus>('available');
  const [hiringDate, setHiringDate] = useState('2022-01-15');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+213');
  const [emergencyRelation, setEmergencyRelation] = useState('Conjoint(e)');

  const handleOpenCreate = () => {
    setEditingDriver(null);
    setName('');
    setPhone('+213550123456');
    setEmail('');
    setWilaya('16 - Alger');
    setDepartment('Direction des Moyens Généraux');
    setLicenseNumber(`ALG-${Math.floor(100000 + Math.random() * 900000)}-B`);
    setLicenseCategories(['B']);
    setLicenseExpiry('2029-12-31');
    setMedicalCheckupExpiry('2027-06-30');
    setMedicalCheckupStatus('valid');
    setAssignedVehiclePlate(vehicles[0]?.plate || '');
    setStatus('available');
    setHiringDate(new Date().toISOString().split('T')[0]);
    setBloodGroup('O+');
    setEmergencyName('');
    setEmergencyPhone('+213');
    setEmergencyRelation('Épouse');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setPhone(driver.phone);
    setEmail(driver.email || '');
    setWilaya(driver.wilaya);
    setDepartment(driver.department);
    setLicenseNumber(driver.licenseNumber);
    setLicenseCategories(driver.licenseCategories);
    setLicenseExpiry(driver.licenseExpiry);
    setMedicalCheckupExpiry(driver.medicalCheckupExpiry);
    setMedicalCheckupStatus(driver.medicalCheckupStatus);
    setAssignedVehiclePlate(driver.assignedVehiclePlate);
    setStatus(driver.status);
    setHiringDate(driver.hiringDate);
    setBloodGroup(driver.bloodGroup || 'O+');
    setEmergencyName(driver.emergencyContact?.name || '');
    setEmergencyPhone(driver.emergencyContact?.phone || '+213');
    setEmergencyRelation(driver.emergencyContact?.relation || 'Famille');
    setIsModalOpen(true);
  };

  const toggleLicenseCategory = (cat: LicenseCategory) => {
    if (licenseCategories.includes(cat)) {
      if (licenseCategories.length > 1) {
        setLicenseCategories(licenseCategories.filter(c => c !== cat));
      }
    } else {
      setLicenseCategories([...licenseCategories, cat]);
    }
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      wilaya: wilaya.trim(),
      department: department.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseCategories,
      licenseExpiry,
      medicalCheckupExpiry,
      medicalCheckupStatus,
      assignedVehiclePlate,
      status,
      hiringDate,
      bloodGroup,
      emergencyContact: emergencyName ? {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relation: emergencyRelation.trim(),
      } : undefined,
    };

    try {
      if (editingDriver) {
        await fetch(`/api/fleet/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/fleet/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error('Failed to save driver:', err);
    }
  };

  const handleDeleteDriver = async (id: string, driverName: string) => {
    if (!window.confirm(`Confirmer la suppression ou l'archivage du chauffeur ${driverName} ?`)) {
      return;
    }
    try {
      await fetch(`/api/fleet/drivers/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete driver:', err);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.wilaya.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || d.licenseCategories.includes(categoryFilter as LicenseCategory);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Ressources Humaines & Mobilité
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Gestion des Chauffeurs & Conducteurs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi des {drivers.length} conducteurs : permis de conduire (B, C, D, E), visites médicales professionnelles et affectations
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Chauffeur
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nom, téléphone, n° permis, wilaya..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({drivers.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'available' ? 'bg-emerald-600/30 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Disponible
            </button>
            <button
              onClick={() => setStatusFilter('on_mission')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'on_mission' ? 'bg-sky-600/30 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Mission
            </button>
            <button
              onClick={() => setStatusFilter('on_leave')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'on_leave' ? 'bg-amber-600/30 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Repos/Congé
            </button>
          </div>

          {/* License category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Toutes Catégories Permis</option>
            <option value="B">Permis B (Véhicules Légers)</option>
            <option value="C">Permis C (Poids Lourds)</option>
            <option value="D">Permis D (Autocars / Bus)</option>
            <option value="E">Permis E (Remorques & Semi)</option>
            <option value="transport_commun">Transport en Commun</option>
          </select>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const isMedicalExpired = driver.medicalCheckupStatus === 'expired';
          const isMedicalWarning = driver.medicalCheckupStatus === 'expiring_soon';

          return (
            <div
              key={driver.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                      {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {driver.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {driver.department}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    driver.status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : driver.status === 'on_mission'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse'
                      : driver.status === 'in_training'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {driver.status === 'available' ? 'Disponible' :
                     driver.status === 'on_mission' ? 'En Mission' :
                     driver.status === 'in_training' ? 'En Formation' : 'En Repos / Congé'}
                  </span>
                </div>

                {/* Contact & Wilaya */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono truncate">{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{driver.wilaya}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Embauche : {driver.hiringDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Groupe : <strong>{driver.bloodGroup || 'O+'}</strong></span>
                  </div>
                </div>

                {/* Permis de conduire & Catégories */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Permis n° <span className="font-mono text-white">{driver.licenseNumber}</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">Exp: {driver.licenseExpiry}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {driver.licenseCategories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300">
                        Catégorie {cat.toUpperCase().replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visite médicale obligatoire */}
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  isMedicalExpired
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : isMedicalWarning
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <HeartPulse className={`w-4 h-4 ${isMedicalExpired ? 'text-rose-400 animate-pulse' : isMedicalWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <div>
                      <span className="font-semibold block">Visite Médicale Périodique</span>
                      <span className="text-[11px] opacity-80">Échéance : {driver.medicalCheckupExpiry}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isMedicalExpired
                      ? 'bg-rose-500/20 text-rose-300'
                      : isMedicalWarning
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isMedicalExpired ? 'Expirée !' : isMedicalWarning ? 'Renouveler' : 'Conforme'}
                  </span>
                </div>

                {/* Véhicule Titulaire */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-sky-400" />
                    Véhicule Assigné :
                  </span>
                  <span className="font-mono font-bold text-sky-300 bg-sky-950/40 px-2.5 py-0.5 rounded border border-sky-800/60">
                    {driver.assignedVehiclePlate || 'Aucun'}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(driver)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                    title="Modifier la fiche chauffeur"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(driver.id, driver.name)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
                    title="Supprimer ou archiver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onNavigateTab('pwa_driver')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  Compagnon PWA
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {editingDriver ? `Modifier Profil : ${editingDriver.name}` : 'Nouveau Chauffeur / Conducteur'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fiche état civil, catégories de permis et contrôle médical réglementaire
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
              {/* Section 1: Civil info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  1. État Civil & Rattachement Entreprise
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nom & Prénom <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Karim Belkacem"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Numéro Téléphone (+213) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+213550123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Wilaya de Résidence
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 16 - Alger, 31 - Oran"
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Direction / Service
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Direction Logistique"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Date d'Embauche
                    </label>
                    <input
                      type="date"
                      value={hiringDate}
                      onChange={(e) => setHiringDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Groupe Sanguin
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Permis & Catégories */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  2. Permis de Conduire & Catégories
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Numéro de Permis <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: ALG-992014-B"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Date d'Expiration du Permis
                    </label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Catégories Détenues :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['B', 'C', 'D', 'E', 'transport_commun'] as LicenseCategory[]).map(cat => {
                      const isChecked = licenseCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleLicenseCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isChecked
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                          Catégorie {cat.toUpperCase().replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Contrôle Médical Professionnel */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  3. Visite Médicale Périodique (Médecine du Travail)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Date d'Échéance de la Visite Médicale
                    </label>
                    <input
                      type="date"
                      value={medicalCheckupExpiry}
                      onChange={(e) => setMedicalCheckupExpiry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Statut de Validité Médicale
                    </label>
                    <select
                      value={medicalCheckupStatus}
                      onChange={(e: any) => setMedicalCheckupStatus(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="valid">Valide & Conforme</option>
                      <option value="expiring_soon">Arrive à échéance (sous 30j)</option>
                      <option value="expired">Expirée (Interdiction de conduite)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Affectation & Statut */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  4. Affectation Véhicule & Statut Dynamique
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Véhicule Titulaire Assigné
                    </label>
                    <select
                      value={assignedVehiclePlate}
                      onChange={(e) => setAssignedVehiclePlate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    >
                      <option value="">Aucun (Chauffeur volant / Pool)</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.plate}>
                          {v.plate} — {v.make} {v.model} ({v.fuelType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Statut Opérationnel
                    </label>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="available">Disponible (Prêt pour mission)</option>
                      <option value="on_mission">En Mission (En route)</option>
                      <option value="on_leave">En Repos / Congé Payé</option>
                      <option value="in_training">En Formation Professionnelle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Contact Urgence */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  5. Contact d'Urgence Famille (Accident / Sinistre)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nom du Proche
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Fatima Belkacem"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Téléphone Proche
                    </label>
                    <input
                      type="text"
                      placeholder="+213550998811"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Lien de Parenté
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Épouse, Père, Frère"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="p-4 bg-slate-950/80 rounded-2xl flex items-center justify-between border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingDriver ? 'Mettre à Jour le Profil' : 'Créer la Fiche Chauffeur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
