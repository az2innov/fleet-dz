import React, { useState, useEffect, useRef } from 'react';
import { 
  Fuel, 
  Gauge, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  QrCode, 
  Car, 
  User, 
  ArrowRight, 
  Sparkles, 
  X,
  FileText,
  MapPin,
  ChevronRight,
  Info,
  Navigation,
  ExternalLink,
  Compass
} from 'lucide-react';
import { Vehicle, Driver, FuelLog, AccidentClaim, GPSLocation, MissionOrder } from '../types.js';

interface DriverPwaAppProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelLogs: FuelLog[];
  missions?: MissionOrder[];
  onRefreshData?: () => void;
  onClosePwa?: () => void;
}

interface OfflineAction {
  id: string;
  type: 'fuel' | 'odometer' | 'accident';
  timestamp: string;
  data: any;
  status: 'pending' | 'synced';
}

export const DriverPwaApp: React.FC<DriverPwaAppProps> = ({
  vehicles,
  drivers,
  fuelLogs,
  missions,
  onRefreshData,
  onClosePwa,
}) => {
  // Online / Offline status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => {
    try {
      const saved = localStorage.getItem('dz_fleet_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected driver & vehicle with URL parameter and localStorage persistence
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDriverId = params.get('driverId') || params.get('driver');
      if (urlDriverId && drivers.some(d => d.id === urlDriverId)) {
        try { localStorage.setItem('dz_fleet_authenticated_driver_id', urlDriverId); } catch {}
        return urlDriverId;
      }
      try {
        const saved = localStorage.getItem('dz_fleet_authenticated_driver_id');
        if (saved && drivers.some(d => d.id === saved)) return saved;
      } catch {}
    }
    return drivers[0]?.id || 'drv-1';
  });

  const [isDriverSwitchModalOpen, setIsDriverSwitchModalOpen] = useState<boolean>(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    }
    return false;
  });
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  const activeDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const assignedVehicle = vehicles.find(v => v.plate === activeDriver?.assignedVehiclePlate) || vehicles[0];

  // Active form modal
  const [activeModal, setActiveModal] = useState<'fuel' | 'odometer' | 'accident' | 'qr' | 'install' | 'mission_order' | null>(null);

  // Listen for native beforeinstallprompt (Android Chrome / Edge)
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const activeMission = missions?.find(m => m.driverId === activeDriver?.id && (m.status === 'in_progress' || m.status === 'approved')) 
    || missions?.find(m => m.vehiclePlate === assignedVehicle?.plate)
    || missions?.[0];

  // Fuel Form state
  const [fuelAmount, setFuelAmount] = useState<string>('4500');
  const [fuelLiters, setFuelLiters] = useState<string>('155');
  const [fuelStation, setFuelStation] = useState<string>('Station Naftal - Alger');
  const [fuelType, setFuelType] = useState<'gasoil' | 'sans_plomb'>('gasoil');
  const [ticketImage, setTicketImage] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState<string | null>(null);

  // Odometer Form state
  const [odometerValue, setOdometerValue] = useState<string>(assignedVehicle?.mileage ? String(assignedVehicle.mileage) : '124500');

  // Accident Form state
  const [accidentLocation, setAccidentLocation] = useState<string>('Autoroute Est-Ouest, Sortie Zéralda');
  const [accidentSeverity, setAccidentSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [accidentDescription, setAccidentDescription] = useState<string>('Accrochage pare-chocs arrière suite à ralentissement.');
  const [accidentPhoto, setAccidentPhoto] = useState<string | null>(null);
  const [accidentThirdParty, setAccidentThirdParty] = useState<string>('Véhicule tiers: Hyundai Accent 01234-115-16');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // GPS Geolocation state
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(() => {
    try {
      const saved = localStorage.getItem('dz_fleet_pwa_last_gps');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccessFeedback, setGpsSuccessFeedback] = useState<string | null>(null);

  // Geolocation Handler using HTML5 Geolocation API
  const handleGeolocateVehicle = (callback?: (loc: GPSLocation) => void) => {
    if (!('geolocation' in navigator)) {
      setGpsError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);
    setGpsSuccessFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc: GPSLocation = {
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date().toISOString(),
        };

        setGpsLocation(loc);
        try {
          localStorage.setItem('dz_fleet_pwa_last_gps', JSON.stringify(loc));
        } catch {}

        setIsLocating(false);
        const msg = `Position GPS acquise : ${loc.latitude}° N, ${loc.longitude}° E (±${loc.accuracy}m)`;
        setGpsSuccessFeedback(msg);
        setFeedbackSuccess(msg);

        // Send GPS ping to server if online
        if (navigator.onLine) {
          try {
            await fetch('/api/pwa/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                vehiclePlate: assignedVehicle?.plate || '04512-118-16',
                driverName: activeDriver?.name || 'Conducteur PWA',
                gpsCoordinates: loc,
              }),
            });
          } catch (e) {
            console.error('Error pinging server with GPS:', e);
          }
        }

        if (callback) callback(loc);
      },
      (err) => {
        setIsLocating(false);
        let msg = "Impossible d'accéder à la position GPS du terminal.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Autorisation GPS refusée. Veuillez autoriser l'accès à la position dans votre navigateur.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Signal GPS temporairement indisponible (vérifiez les paramètres de localisation).";
        } else if (err.code === err.TIMEOUT) {
          msg = "Délai de détection satellite dépassé. Veuillez réessayer.";
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accidentPhotoRef = useRef<HTMLInputElement>(null);

  // Sync network status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Persist offline queue
  useEffect(() => {
    localStorage.setItem('dz_fleet_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Auto-calculate liters when amount changes (Gasoil: 29.01 DA / Sans-plomb: 45.62 DA)
  useEffect(() => {
    const amountNum = parseFloat(fuelAmount);
    if (!isNaN(amountNum) && amountNum > 0) {
      const pricePerL = fuelType === 'gasoil' ? 29.01 : 45.62;
      setFuelLiters((amountNum / pricePerL).toFixed(1));
    }
  }, [fuelAmount, fuelType]);

  // Handle Syncing queued offline actions
  const triggerSync = async () => {
    const pending = offlineQueue.filter(item => item.status === 'pending');
    if (pending.length === 0 || !navigator.onLine) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/pwa/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: pending }),
      });

      if (res.ok) {
        setOfflineQueue(prev => prev.map(a => ({ ...a, status: 'synced' })));
        setFeedbackSuccess(`${pending.length} opération(s) synchronisée(s) avec succès avec le serveur central !`);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Offline batch sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Image Upload & Gemini OCR for Fuel Ticket
  const handleTicketPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setTicketImage(dataUrl);

      // If online, perform Gemini OCR
      if (navigator.onLine) {
        setIsOcrProcessing(true);
        setOcrSuccessMessage(null);
        try {
          const base64Data = dataUrl.split(',')[1];
          const mimeType = file.type || 'image/jpeg';

          const response = await fetch('/api/pwa/fuel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driverPhone: activeDriver?.phone,
              vehiclePlate: assignedVehicle?.plate,
              imageBase64: base64Data,
              imageMimeType: mimeType,
            }),
          });

          const data = await response.json();
          if (data.success && data.extracted) {
            if (data.extracted.amountDZD) setFuelAmount(String(data.extracted.amountDZD));
            if (data.extracted.liters) setFuelLiters(String(data.extracted.liters));
            if (data.extracted.stationName) setFuelStation(data.extracted.stationName);
            setOcrSuccessMessage(`Ticket Naftal analysé par l'IA : ${data.extracted.amountDZD || 4500} DA (${data.extracted.liters || 155}L)`);
          }
        } catch (ocrErr) {
          console.error('OCR error:', ocrErr);
        } finally {
          setIsOcrProcessing(false);
        }
      } else {
        setOcrSuccessMessage('Mode hors-ligne : la photo est enregistrée localement et sera synchronisée avec l\'IA dès le retour du réseau.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Fuel
  const handleSubmitFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      vehiclePlate: assignedVehicle?.plate || '04512-118-16',
      driverName: activeDriver?.name || 'Conducteur',
      driverPhone: activeDriver?.phone || '+213560383640',
      amountDZD: parseFloat(fuelAmount) || 4500,
      liters: parseFloat(fuelLiters) || 155,
      stationName: fuelStation || 'Station Naftal',
      receiptPhotoUrl: ticketImage || undefined,
      fuelType,
      gpsCoordinates: gpsLocation || undefined,
    };

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/pwa/fuel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setFeedbackSuccess(`Plein de ${payload.amountDZD.toLocaleString()} DA enregistré avec succès !`);
          if (onRefreshData) onRefreshData();
        }
      } catch {
        // Fallback to offline queue
        queueOfflineAction('fuel', payload);
      }
    } else {
      queueOfflineAction('fuel', payload);
    }

    setIsSubmitting(false);
    setActiveModal(null);
    setTicketImage(null);
    setOcrSuccessMessage(null);
  };

  // Submit Odometer
  const handleSubmitOdometer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const km = parseInt(odometerValue, 10);

    const payload = {
      vehiclePlate: assignedVehicle?.plate || '04512-118-16',
      mileage: km,
    };

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/pwa/odometer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setFeedbackSuccess(`Odomètre mis à jour : ${km.toLocaleString()} km`);
          if (onRefreshData) onRefreshData();
        }
      } catch {
        queueOfflineAction('odometer', payload);
      }
    } else {
      queueOfflineAction('odometer', payload);
    }

    setIsSubmitting(false);
    setActiveModal(null);
  };

  // Submit Accident
  const handleSubmitAccident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      vehiclePlate: assignedVehicle?.plate || '04512-118-16',
      driverName: activeDriver?.name || 'Conducteur',
      location: accidentLocation,
      description: accidentDescription,
      severity: accidentSeverity,
      photos: accidentPhoto ? [accidentPhoto] : [],
      thirdPartyInfo: accidentThirdParty,
      gpsCoordinates: gpsLocation || undefined,
    };

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/pwa/accident', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setFeedbackSuccess(`Dossier sinistre créé immédiatement avec le n° ${data.claim?.claimNumber || 'CAAT-DZ-99'}`);
          if (onRefreshData) onRefreshData();
        }
      } catch {
        queueOfflineAction('accident', payload);
      }
    } else {
      queueOfflineAction('accident', payload);
    }

    setIsSubmitting(false);
    setActiveModal(null);
    setAccidentPhoto(null);
  };

  const queueOfflineAction = (type: 'fuel' | 'odometer' | 'accident', data: any) => {
    const newAction: OfflineAction = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
      status: 'pending',
    };
    setOfflineQueue(prev => [newAction, ...prev]);
    setFeedbackSuccess('Enregistré localement en mode hors-ligne. Synchronisation automatique dès détection du réseau 4G/WiFi.');
  };

  const pendingCount = offlineQueue.filter(a => a.status === 'pending').length;

  return (
    <div className="max-w-md mx-auto w-full bg-slate-950 text-slate-100 min-h-screen pb-12 flex flex-col shadow-2xl border-x border-slate-800">
      {/* Top Sovereign Bar (Conformité Loi 18-07) */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/40 px-4 py-2.5 flex items-center justify-between text-[11px] text-emerald-300">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Hébergement Souverain • Loi 18-07</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-900/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" /> En ligne
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
              <WifiOff className="w-3 h-3 animate-pulse" /> Zone Blanche (Hors-ligne)
            </span>
          )}
          {onClosePwa && (
            <button 
              onClick={onClosePwa}
              className="ml-2 text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              title="Retour au portail gestionnaire"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PWA Home Screen Installation Prompt Banner (1-Click on Android / Guide on iPhone) */}
      {!isInstalled && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-emerald-950/90 to-[#121929] border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-[12px]">Installer l'icône sur votre téléphone</div>
              <div className="text-[10px] text-emerald-300/80">Accès direct 1-clic & 100% hors-ligne</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (installPrompt) {
                installPrompt.prompt();
              } else {
                setShowInstallGuide(true);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-[11px] shrink-0 transition-transform shadow cursor-pointer"
          >
            Installer
          </button>
        </div>
      )}

      {/* Driver & Vehicle Header Card */}
      <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
              DZ
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                Dz-Fleet Conducteur
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connecté"></span>
              </h1>
              <p className="text-[10px] text-slate-400">Portail Embarqué & Mobilité Souveraine</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('qr')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Afficher le QR code pour un autre téléphone"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Partager
          </button>
        </div>

        {/* Identified Driver Profile Card */}
        <div className="bg-[#121929] rounded-2xl p-3.5 border border-[#222f47] shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{activeDriver?.name || 'Conducteur'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">Vérifié</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {activeDriver?.phone} • Wilaya {activeDriver?.wilaya || 'Alger'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDriverSwitchModalOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 bg-[#0c121e] hover:bg-[#1a2336] px-2.5 py-1 rounded-lg border border-[#1e2a3f] transition-colors cursor-pointer shrink-0 font-medium"
            >
              Changer
            </button>
          </div>

          {/* Assigned vehicle & current odometer */}
          <div className="pt-2 border-t border-[#1e2a3f] grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#0c121e] p-2.5 rounded-xl border border-[#1e2a3f] min-w-0">
              <span className="text-slate-400 text-[10px] block font-medium">Véhicule Assigné</span>
              <span className="font-bold text-white font-mono text-[12px] truncate block mt-0.5">
                {assignedVehicle?.plate || 'Non assigné'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {assignedVehicle?.make} {assignedVehicle?.model}
              </span>
            </div>
            <div className="bg-[#0c121e] p-2.5 rounded-xl border border-[#1e2a3f] text-right">
              <span className="text-slate-400 text-[10px] block font-medium">Compteur Actuel</span>
              <span className="font-bold text-emerald-400 font-mono text-[13px] block mt-0.5">
                {(assignedVehicle?.mileage || 124500).toLocaleString('fr-DZ')} km
              </span>
              <span className="text-[10px] text-slate-400 block">Dernier relevé certifié</span>
            </div>
          </div>
        </div>

        {/* Offline Queue Alert if any */}
        {pendingCount > 0 && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span><strong>{pendingCount}</strong> opération(s) en attente de réseau</span>
            </div>
            <button 
              onClick={triggerSync}
              disabled={!isOnline || isSyncing}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Synchroniser
            </button>
          </div>
        )}

        {/* Success Feedback Notification */}
        {feedbackSuccess && (
          <div className="mt-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackSuccess}</span>
            </div>
            <button onClick={() => setFeedbackSuccess(null)} className="text-emerald-400 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Fiche de Mission Embarquée (Compagnon de Route & Contrôle Routier) */}
      {activeMission && (
        <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-b border-indigo-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Fiche de Mission Embarquée
            </span>
            <span className="font-mono text-xs font-bold text-indigo-400">
              {activeMission.orderNumber}
            </span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-indigo-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{activeMission.departureCity}</span>
                <span className="text-slate-500">→</span>
                <span className="text-rose-400">{activeMission.destinationCity}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded">
                {activeMission.estimatedDistanceKm} km
              </span>
            </div>

            {activeMission.intermediateStops && activeMission.intermediateStops.length > 0 && (
              <p className="text-[11px] text-slate-400">
                Transit autorisé : <strong className="text-slate-300">{activeMission.intermediateStops.join(', ')}</strong>
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-800/80 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">Indemnités (Per Diem)</span>
                <span className="font-bold font-mono text-amber-400">{activeMission.perDiemDZD.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Période de Validité</span>
                <span className="font-semibold text-slate-200">{activeMission.departureDate} au {activeMission.returnDate}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModal('mission_order')}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Afficher l'Ordre de Mission Officiel
              </button>
            </div>
          </div>

          {/* Numéros d'Urgence Algérie */}
          <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Urgences Route :</span>
            <div className="flex items-center gap-2.5 font-bold font-mono">
              <a href="tel:1055" className="text-emerald-400 hover:underline">Gendarmerie 1055</a>
              <span className="text-slate-600">•</span>
              <a href="tel:1548" className="text-sky-400 hover:underline">Police 1548</a>
              <span className="text-slate-600">•</span>
              <a href="tel:14" className="text-rose-400 hover:underline">Protection 14</a>
            </div>
          </div>
        </div>
      )}

      {/* 3 Large Touch Buttons Designed for Algerian Drivers */}
      <div className="p-4 space-y-3.5 flex-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Actions Rapides Conducteur
        </h2>

        {/* 1. Plein Carburant Naftal */}
        <button
          onClick={() => setActiveModal('fuel')}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.99] text-white p-4 rounded-2xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Fuel className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold tracking-tight">Plein Carburant (Naftal)</div>
              <div className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <Camera className="w-3.5 h-3.5" /> Photo ticket / Saisie Dinars (DA)
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2. Relevé Compteur Odomètre */}
        <button
          onClick={() => setActiveModal('odometer')}
          className="w-full bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Gauge className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold tracking-tight">Relevé Kilométrique</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Mise à jour compteur & alertes vidange
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 3. Déclaration Sinistre / Accident */}
        <button
          onClick={() => setActiveModal('accident')}
          className="w-full bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-white p-4 rounded-2xl border border-red-500/20 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold text-red-200 tracking-tight">Déclarer un Sinistre</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Constat immédiat & photos pour l'assurance (CAAT, SAA...)
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 4. Géolocaliser le véhicule (GPS) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          gpsLocation 
            ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border-sky-500/40 shadow-lg shadow-sky-950/30' 
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                gpsLocation 
                  ? 'bg-sky-500/20 text-sky-400 border-sky-400/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isLocating ? (
                  <Compass className="w-6 h-6 animate-spin text-sky-400" />
                ) : (
                  <Navigation className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-extrabold text-white tracking-tight">
                    Géolocaliser le véhicule
                  </div>
                  {gpsLocation && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {gpsLocation ? (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs font-mono font-semibold text-sky-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{gpsLocation.latitude.toFixed(5)}° N, {gpsLocation.longitude.toFixed(5)}° E</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-sky-500/20 text-sky-300 rounded font-sans">
                        ±{gpsLocation.accuracy || 15}m
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Enregistré à {new Date(gpsLocation.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Transmis avec vos pleins & sinistres
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Utilise le GPS du navigateur pour enregistrer la position exacte lors d'un plein ou incident
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons for Geolocation */}
          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleGeolocateVehicle()}
              disabled={isLocating}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gpsLocation
                  ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/50'
              }`}
            >
              {isLocating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Recherche satellite GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{gpsLocation ? 'Actualiser position GPS' : 'Géolocaliser le véhicule (GPS)'}</span>
                </>
              )}
            </button>

            {gpsLocation && (
              <a
                href={`https://www.google.com/maps?q=${gpsLocation.latitude},${gpsLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                title="Ouvrir sur Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Carte</span>
              </a>
            )}
          </div>

          {gpsError && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{gpsError}</span>
              </div>
              <button onClick={() => setGpsError(null)} className="text-rose-400 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Recent Driver History */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dernières Opérations & Logs GPS
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Véhicule {assignedVehicle?.plate}</span>
          </div>

          <div className="space-y-2 text-xs">
            {fuelLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fuel className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">{log.amountDZD.toLocaleString()} DA ({log.liters} L)</div>
                    <div className="text-[10px] text-slate-400">{log.stationName} • {new Date(log.date).toLocaleDateString('fr-FR')}</div>
                    {log.gpsCoordinates && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-sky-400 font-mono">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span>GPS: {log.gpsCoordinates.latitude.toFixed(4)}°, {log.gpsCoordinates.longitude.toFixed(4)}°</span>
                        <a 
                          href={`https://www.google.com/maps?q=${log.gpsCoordinates.latitude},${log.gpsCoordinates.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sky-300 hover:underline ml-1 inline-flex items-center gap-0.5 font-sans"
                        >
                          Carte <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium whitespace-nowrap">
                  Synchronisé ✓
                </span>
              </div>
            ))}

            {offlineQueue.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">
                      {item.type === 'fuel' ? `Plein ${item.data.amountDZD} DA` : item.type === 'odometer' ? `Compteur ${item.data.mileage} km` : 'Sinistre déclaré'}
                    </div>
                    <div className="text-[10px] text-slate-400">Sauvegarde locale smartphone</div>
                    {item.data?.gpsCoordinates && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span>GPS stocké: {item.data.gpsCoordinates.latitude.toFixed(4)}°, {item.data.gpsCoordinates.longitude.toFixed(4)}°</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium whitespace-nowrap">
                  {item.status === 'pending' ? 'En attente 4G ⏳' : 'Synchronisé ✓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODAL 1 : PLEIN CARBURANT ================= */}
      {activeModal === 'fuel' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Enregistrer un Plein Naftal</h3>
                  <p className="text-[11px] text-slate-400">Reconnaissance de ticket par IA ou saisie rapide</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo / Camera Input */}
            <div className="mb-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                capture="environment" 
                onChange={handleTicketPhoto}
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-950/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-colors"
              >
                {ticketImage ? (
                  <div className="space-y-2">
                    <img src={ticketImage} alt="Ticket Naftal" className="h-28 object-contain rounded-lg mx-auto border border-emerald-500/40" />
                    <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Changer la photo du ticket
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-white">Prendre en photo le ticket Naftal</div>
                    <div className="text-[10px] text-slate-400">L'IA Gemini extrait automatiquement le montant et le litrage</div>
                  </>
                )}
              </button>

              {isOcrProcessing && (
                <div className="mt-2 p-2 rounded-lg bg-slate-800 text-xs text-sky-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyse du ticket par l'IA en cours...
                </div>
              )}

              {ocrSuccessMessage && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{ocrSuccessMessage}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitFuel} className="space-y-3.5">
              {/* Type de Carburant */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Carburant</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFuelType('gasoil')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${fuelType === 'gasoil' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    Gasoil (29.01 DA/L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType('sans_plomb')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${fuelType === 'sans_plomb' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    Sans-Plomb (45.62 DA/L)
                  </button>
                </div>
              </div>

              {/* Montant Dinars */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Montant Total (DA)</label>
                  <input 
                    type="number" 
                    value={fuelAmount} 
                    onChange={(e) => setFuelAmount(e.target.value)} 
                    required 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    placeholder="4500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Litres (calculé)</label>
                  <input 
                    type="text" 
                    value={fuelLiters} 
                    onChange={(e) => setFuelLiters(e.target.value)} 
                    required 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    placeholder="155"
                  />
                </div>
              </div>

              {/* Station Naftal */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Station-Service</label>
                <input 
                  type="text" 
                  value={fuelStation} 
                  onChange={(e) => setFuelStation(e.target.value)} 
                  required 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="Station Naftal - Alger"
                />
              </div>

              {/* Géolocalisation GPS du Plein */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    Position GPS de la Station
                  </span>
                  {gpsLocation ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Certifié GPS
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">Optionnel</span>
                  )}
                </div>

                {gpsLocation ? (
                  <div className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="font-mono text-sky-300 text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{gpsLocation.latitude.toFixed(5)}° N, {gpsLocation.longitude.toFixed(5)}° E</span>
                      <span className="text-[10px] text-slate-400 font-sans">±{gpsLocation.accuracy || 15}m</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGeolocateVehicle()}
                      disabled={isLocating}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      Actualiser
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Ajouter la position GPS au ticket</span>
                    <button
                      type="button"
                      onClick={() => handleGeolocateVehicle()}
                      disabled={isLocating}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-sky-500/30"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      {isLocating ? 'Recherche GPS...' : 'Géolocaliser le plein'}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirmer & Enregistrer le Plein
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2 : RELEVÉ ODOMÈTRE ================= */}
      {activeModal === 'odometer' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Relevé Kilométrique</h3>
                  <p className="text-[11px] text-slate-400">Véhicule : {assignedVehicle?.model} ({assignedVehicle?.plate})</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOdometer} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Kilométrage actuel au compteur (km)</label>
                <input 
                  type="number" 
                  value={odometerValue} 
                  onChange={(e) => setOdometerValue(e.target.value)} 
                  required 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg text-white font-mono font-bold focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Dernier relevé :</span>
                  <span className="font-mono text-white">{(assignedVehicle?.mileage || 124500).toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Prochaine vidange prévue :</span>
                  <span className="font-mono text-emerald-400">{(assignedVehicle?.nextServiceKm || 130000).toLocaleString()} km</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Valider le Relevé
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3 : DÉCLARATION SINISTRE ================= */}
      {activeModal === 'accident' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Déclaration Immédiate de Sinistre</h3>
                  <p className="text-[11px] text-slate-400">Génération du dossier assurance (CAAT / SAA)</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccident} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Lieu du sinistre (Wilaya / Route)</label>
                <input 
                  type="text" 
                  value={accidentLocation} 
                  onChange={(e) => setAccidentLocation(e.target.value)} 
                  required 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  placeholder="Ex: Autoroute Est-Ouest, Sortie Zéralda"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Gravité des dégâts</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccidentSeverity('minor')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${accidentSeverity === 'minor' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    Léger
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccidentSeverity('moderate')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${accidentSeverity === 'moderate' ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    Moyen
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccidentSeverity('severe')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${accidentSeverity === 'severe' ? 'bg-red-600 text-white border-red-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    Immobilisé
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Description sommaire</label>
                <textarea 
                  rows={2}
                  value={accidentDescription} 
                  onChange={(e) => setAccidentDescription(e.target.value)} 
                  required 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Tiers impliqué (Immatriculation / Nom)</label>
                <input 
                  type="text" 
                  value={accidentThirdParty} 
                  onChange={(e) => setAccidentThirdParty(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Photo Sinistre */}
              <div>
                <input 
                  type="file" 
                  ref={accidentPhotoRef} 
                  accept="image/*" 
                  capture="environment" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = (ev) => setAccidentPhoto(ev.target?.result as string);
                      r.readAsDataURL(file);
                    }
                  }} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => accidentPhotoRef.current?.click()}
                  className="w-full border border-dashed border-red-500/40 rounded-xl p-3 text-center text-xs text-red-300 flex items-center justify-center gap-2 hover:bg-red-950/20"
                >
                  <Camera className="w-4 h-4 text-red-400" />
                  {accidentPhoto ? 'Photo des dégâts chargée ✓' : 'Prendre une photo des dégâts carrosserie'}
                </button>
              </div>

              {/* Géolocalisation GPS du Sinistre */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-red-400" />
                    Coordonnées GPS du Sinistre
                  </span>
                  {gpsLocation ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Position Acquise
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-medium">Recommandé</span>
                  )}
                </div>

                {gpsLocation ? (
                  <div className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="font-mono text-red-300 text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{gpsLocation.latitude.toFixed(5)}° N, {gpsLocation.longitude.toFixed(5)}° E</span>
                      <span className="text-[10px] text-slate-400 font-sans">±{gpsLocation.accuracy || 15}m</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGeolocateVehicle()}
                      disabled={isLocating}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      Actualiser
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Pour géolocaliser l'intervention et l'assurance</span>
                    <button
                      type="button"
                      onClick={() => handleGeolocateVehicle()}
                      disabled={isLocating}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-500/30"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      {isLocating ? 'Recherche GPS...' : 'Détecter position GPS'}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Transmettre l'Alerte Sinistre
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4 : QR CODE SCANNER MOBILE ================= */}
      {activeModal === 'qr' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Ouvrir sur le téléphone du chauffeur
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto mb-4">
              {/* Responsive SVG QR Code to current app URL with ?view=pwa */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/?view=pwa')}`}
                alt="QR Code PWA Conducteur" 
                className="w-40 h-40 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-300 font-medium mb-3">
              Le chauffeur scanne ce QR Code avec l'appareil photo de son smartphone (Android / iPhone).
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
              <div><strong>Sur Android :</strong> Cliquez sur <em>« Ajouter à l'écran d'accueil »</em>.</div>
              <div><strong>Sur iPhone :</strong> Cliquez sur <em>Partager &gt; Sur l'écran d'accueil</em>.</div>
              <div className="text-emerald-400 font-semibold pt-1">
                L'application s'installe sans compte Google Play ni App Store !
              </div>
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 5 : ORDRE DE MISSION EMBARQUÉ SUR SMARTPHONE ================= */}
      {activeModal === 'mission_order' && activeMission && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">Ordre de Mission Numérique</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Mobile Document Container */}
            <div className="p-5 overflow-y-auto flex-1 bg-white text-black font-sans space-y-4">
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-2.5">
                <p className="text-[11px] font-black uppercase tracking-wider">
                  RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
                </p>
                <p className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">
                  DIRECTION DES MOYENS GÉNÉRAUX & DE LA FLOTTE
                </p>
                <div className="mt-2 inline-block bg-slate-100 border border-slate-400 px-3 py-1 rounded">
                  <span className="text-xs font-mono font-black">
                    ORDRE DE MISSION N° : {activeMission.orderNumber}
                  </span>
                </div>
              </div>

              {/* Chauffeur & Véhicule */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Chauffeur</span>
                  <span className="font-bold text-slate-900">{activeMission.driverName}</span>
                  <span className="text-[10px] text-slate-600 block font-mono">Permis: {activeMission.driverLicenseNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Véhicule</span>
                  <span className="font-mono font-black text-slate-900">{activeMission.vehiclePlate}</span>
                  <span className="text-[10px] text-slate-600 block">{activeMission.vehicleModel}</span>
                </div>
              </div>

              {/* Trajet & Étapes */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-300 text-[11px] space-y-1">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Circuit Réglementaire Autorisée</span>
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span>{activeMission.departureCity}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-700">{activeMission.destinationCity}</span>
                </div>
                {activeMission.intermediateStops && activeMission.intermediateStops.length > 0 && (
                  <p className="text-[10px] text-slate-600">
                    Étapes : <strong>{activeMission.intermediateStops.join(', ')}</strong>
                  </p>
                )}
                <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Distance : <strong>{activeMission.estimatedDistanceKm} km</strong></span>
                  <span>Per Diem : <strong>{activeMission.perDiemDZD.toLocaleString('fr-DZ')} DA</strong></span>
                </div>
              </div>

              {/* Objet de la mission */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-300 text-[11px]">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Objet & Motif</span>
                <p className="font-medium text-slate-800">{activeMission.purpose}</p>
                <p className="text-[10px] text-slate-500 mt-1">Du {activeMission.departureDate} au {activeMission.returnDate}</p>
              </div>

              {/* Cachet & Visa */}
              <div className="border-t-2 border-black pt-3 flex items-center justify-between text-[10px]">
                <div>
                  <div className="w-12 h-12 border border-black flex items-center justify-center font-mono text-[8px] text-center">
                    [QR CODE CONTRÔLE]
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">ANPDP Loi 18-07</span>
                </div>

                <div className="text-center">
                  <div className="border border-red-700 text-red-700 font-black text-[9px] uppercase px-2 py-1 rounded-full transform -rotate-3">
                    ★ VISA DIRECTION MOYENS GÉNÉRAUX ★
                  </div>
                  <span className="text-[9px] text-slate-600 italic block mt-1">Signé électroniquement</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">À présenter aux barrages de Gendarmerie ou Police</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL : CHANGER DE PROFIL CONDUCTEUR ================= */}
      {isDriverSwitchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#121929] border border-[#222f47] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2a3f]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Changer de Profil Conducteur</h3>
                  <p className="text-[10px] text-slate-400">Sélectionnez votre fiche pour lier votre smartphone</p>
                </div>
              </div>
              <button
                onClick={() => setIsDriverSwitchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c273e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                placeholder="Rechercher par nom ou téléphone..."
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                className="w-full bg-[#0c121e] border border-[#1e2a3f] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {drivers
                .filter(d => 
                  d.name.toLowerCase().includes(driverSearchQuery.toLowerCase()) || 
                  d.phone.includes(driverSearchQuery)
                )
                .map((driver) => {
                  const isCurrent = driver.id === selectedDriverId;
                  const v = vehicles.find(veh => veh.plate === driver.assignedVehiclePlate);
                  return (
                    <button
                      key={driver.id}
                      onClick={() => {
                        setSelectedDriverId(driver.id);
                        try {
                          localStorage.setItem('dz_fleet_authenticated_driver_id', driver.id);
                        } catch {}
                        setIsDriverSwitchModalOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                          : 'bg-[#0c121e] hover:bg-[#162033] border-[#1e2a3f] text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">{driver.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-300">Actuel</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{driver.phone}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          Véhicule : <strong className="text-slate-300">{driver.assignedVehiclePlate || 'Aucun'}</strong> {v ? `(${v.model})` : ''}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </button>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-[#1e2a3f] text-center">
              <p className="text-[10px] text-slate-500">
                Ce choix est mémorisé sur votre téléphone pour vos prochaines missions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL : GUIDE D'INSTALLATION SUR SMARTPHONE ================= */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121929] border border-[#222f47] rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Installer sur votre écran d'accueil</h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-[#0c121e] rounded-xl border border-[#1e2a3f] space-y-1.5">
                <strong className="text-emerald-400 block font-bold">Sur Android (Chrome ou Edge) :</strong>
                <p className="text-[11px] text-slate-300">
                  1. Si vous êtes dans WhatsApp ou une autre appli, touchez les <strong>3 petits points (⋮)</strong> en haut &gt; <em>« Ouvrir dans Chrome »</em>.
                </p>
                <p className="text-[11px] text-slate-300">
                  2. Dans Chrome, touchez <strong>(⋮)</strong> &gt; <strong>« Installer l'application »</strong> (ou <em>« Ajouter à l'écran d'accueil »</em>).
                </p>
              </div>

              <div className="p-3 bg-[#0c121e] rounded-xl border border-[#1e2a3f] space-y-1.5">
                <strong className="text-sky-400 block font-bold">Sur iPhone (Apple Safari obligatoire) :</strong>
                <p className="text-[11px] text-slate-300">
                  1. Ouvrez obligatoirement le lien dans <strong>Safari</strong> <em>(Opera et Chrome sur iOS ne supportent pas l'installation)</em>.
                </p>
                <p className="text-[11px] text-slate-300">
                  2. Touchez le bouton <strong>Partager</strong> (le carré avec flèche vers le haut au centre en bas).
                </p>
                <p className="text-[11px] text-slate-300">
                  3. Faites défiler et touchez <strong>« Sur l'écran d'accueil » (➕)</strong> puis <strong>« Ajouter »</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
