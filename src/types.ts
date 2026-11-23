export type UserRole = 
  | 'super_admin' 
  | 'fleet_manager' 
  | 'maintenance_lead' 
  | 'controller' 
  | 'driver';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
  department: string;
}

export interface TireCondition {
  frontLeft: number; // 0 to 100% wear / health
  frontRight: number;
  rearLeft: number;
  rearRight: number;
  lastInspectionDate?: string;
  notes?: string;
}

export type InsuranceCompany = 'CAAT' | 'SAA' | 'CASH' | 'CIAR' | '2A' | 'GAM' | 'Autre';

// Types spécifiques Véhicules & Réglementation Transport (Décret 04-381 / Code de la route algérien)
export type VehicleCategory = 'VP' | 'VU' | 'PL' | 'SM' | 'Bus';
// VP: Véhicule Particulier (Tourisme)
// VU: Véhicule Utilitaire (< 3.5 T)
// PL: Poids Lourd (> 3.5 T)
// SM: Semi-Remorque (Tracteur + Remorque articulée)
// Bus: Transport en commun / Voyageurs

export type OperationalMissionStatus = 
  | 'reserve_depot'    // 1. En Réserve au Dépôt (Disponible pour affectation)
  | 'en_mission'        // 2. En Mission Active (Sorti / Roulant sur trajet réglementé)
  | 'retour_mission'    // 3. Retour de Mission (Rentré au parc / Débriefing)
  | 'maintenance'       // 4. En Révision Atelier (Immobilisé entretien préventif)
  | 'sinistre'          // 5. En Sinistre (Immobilisé suite à accident / constat)
  | 'reforme';          // 6. Réforme Administrative (Déclassé / Hors service)

export type DrivetrainConfig = '4x2' | '4x4' | '6x2' | '6x4' | '8x4' | '8x8';

export type TransmissionType = 'Manuelle' | 'Automatique' | 'Robotisée';

export interface Vehicle {
  id: string;
  plate: string; // e.g. "04512-118-16" (Wilaya 16 - Alger)
  make: string;
  model: string;
  year: number;
  driverId: string;
  driverName: string;
  driverPhone: string;
  fuelType: 'diesel' | 'essence' | 'gpl';
  status: 'active' | 'maintenance' | 'accident' | 'idle' | 'retired';
  mileage: number; // in km
  tankCapacityLiters: number;
  averageConsumption: number; // L/100km
  lastServiceKm: number;
  nextServiceKm: number;
  insuranceCompany?: InsuranceCompany;
  insuranceExpiry: string; // YYYY-MM-DD
  technicalControlExpiry: string; // YYYY-MM-DD
  vignetteYear: number;
  tires?: TireCondition;
  chassisNumber?: string;
  wilayaCode?: string;

  // 1. État du véhicule affecté / sortie des missions
  operationalMissionStatus?: OperationalMissionStatus;

  // 2. Caractéristiques du moteur (Cylindrée, nombre de cylindres)
  engineDisplacement?: string; // ex: "1.6L 16V", "2.8L D-4D", "12.0L Turbo Diesel"
  engineCylinders?: number;     // ex: 4, 6, 8

  // 3. Boîte de vitesses (Type auto/manuel, nombre de vitesses)
  transmissionType?: TransmissionType;
  transmissionGears?: number; // ex: 5, 6, 8, 12, 16 rapports

  // 4. Traction / Essieux (4x2, 4x4, 6x2, 6x4, 8x4, 8x8)
  drivetrain?: DrivetrainConfig;

  // 5. Carte grise numérisée (Upload / Prévisualisation document officiel)
  registrationDocUrl?: string;

  // 6. Coût d'acquisition du véhicule (en Dinars Algériens DZD)
  acquisitionCostDZD?: number;

  // 7. Usure des pneumatiques selon le kilométrage
  lastTireChangeKm?: number;   // Kilométrage lors du dernier remplacement
  tireLifespanKm?: number;     // Durée de vie préconisée (ex: 50 000 km VP/VU, 80 000 km PL)
  tireWearPercentage?: number; // % d'usure kilométrique calculé

  // 8. Type de véhicule (VP, VU, PL, SM, Bus) et caractéristiques de charge
  vehicleCategory?: VehicleCategory;
  enginePowerHP?: number; // Puissance moteur (chevaux DIN / ch)
  ptacKg?: number;        // Poids Total Autorisé en Charge (kg)
  ptraKg?: number;        // Poids Total Roulant Autorisé (kg)
  payloadKg?: number;     // Charge Utile (kg)
}

export type DriverStatus = 'available' | 'on_mission' | 'on_leave' | 'in_training';
export type LicenseCategory = 'B' | 'C' | 'D' | 'E' | 'transport_commun';
export type EducationLevel = 'Primaire' | 'Moyen' | 'Secondaire' | 'Universitaire';

export interface DriverComment {
  id: string;
  text: string;
  date: string; // ISO 8601 string (date et heure précises d'insertion)
  author?: string; // Nom de l'auteur du commentaire
  authorRole?: string; // Rôle (ex: fleet_manager)
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  wilaya: string;
  address?: string; // 4. Adresse de résidence
  birthDate?: string; // 1. Date de naissance (YYYY-MM-DD)
  educationLevel?: EducationLevel; // 2. Niveau d'instruction (Primaire, Moyen, Secondaire, Universitaire)
  photo?: string; // 3. Photo du conducteur (base64 Data URL)
  licenseNumber: string;
  licenseCategories: LicenseCategory[];
  licenseExpiry: string; // YYYY-MM-DD
  licenseDocument?: string; // 5. Numérisation/Photo du permis de conduire (base64)
  medicalCheckupExpiry: string; // YYYY-MM-DD (visites médicales professionnelles)
  medicalCheckupStatus: 'valid' | 'expiring_soon' | 'expired';
  assignedVehiclePlate: string;
  status: DriverStatus;
  department: string; // e.g. "Direction Logistique & Approvisionnement"
  hiringDate: string; // YYYY-MM-DD
  avatar?: string;
  bloodGroup?: string;
  managerNotes?: string; // 6. Dernier commentaire ou résumé
  comments?: DriverComment[]; // 6. Historique immuable des commentaires archivés (datés et horodatés)
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  addressLabel?: string;
  wilaya?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  amountDZD: number;
  liters: number;
  pricePerLiterDZD: number;
  date: string;
  odometerKm?: number;
  stationName: string;
  city: string;
  receiptPhotoUrl?: string;
  status: 'verified' | 'pending' | 'flagged';
  source: 'pwa_scan' | 'pwa_manual' | 'manual';
  notes?: string;
  gpsCoordinates?: GPSLocation;
  isOverconsumption?: boolean;
  calculatedConsumption?: number; // L/100km
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: 'vidange' | 'plaquettes_freins' | 'pneus' | 'courroie_distribution' | 'revision_generale' | 'reparation_mecanique';
  costDZD: number;
  odometerKm: number;
  date: string;
  garageName: string;
  notes: string;
  invoiceUrl?: string;
  status: 'completed' | 'scheduled';
}

export interface AccidentClaim {
  id: string;
  claimNumber: string; // e.g. "SIN-2026-0042"
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  date: string;
  time: string;
  location: string; // e.g. "Rond-point Kouba, Alger"
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  photos: string[];
  thirdPartyInfo?: {
    involved: boolean;
    name?: string;
    phone?: string;
    insuranceCompany?: string;
    plateNumber?: string;
  };
  policeReportFiled: boolean;
  status: 'open' | 'expert_review' | 'insurance_processing' | 'settled';
  insuranceTransmitted?: boolean;
  insuranceTransmittedTo?: InsuranceCompany;
  estimatedCostDZD?: number;
  aiDamageAssessment?: string;
  gpsCoordinates?: GPSLocation;
}

export interface FleetAlert {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: 'vidange_overdue' | 'assurance_expiring' | 'controle_technique' | 'accident_pending' | 'surconsommation' | 'visite_medicale';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  dueDate?: string;
  date: string;
  actionRequired: string;
  resolved: boolean;
}

export interface MissionOrder {
  id: string;
  orderNumber: string; // e.g. "OM-2026-0412"
  title: string;
  purpose: string; // Objet de la mission
  departureCity: string;
  departureWilaya: string;
  destinationCity: string;
  destinationWilaya: string;
  intermediateStops: string[];
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverLicenseNumber: string;
  driverLicenseCategory: string;
  estimatedDistanceKm: number;
  estimatedFuelBudgetDZD: number;
  tollFeesDZD: number;
  perDiemDZD: number; // Indemnités de mission journalières (DA)
  totalBudgetDZD: number;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  signedBy: string; // e.g. "Directeur des Moyens Généraux"
  signedAt?: string;
  officialSeal: boolean;
  notes?: string;
  createdAt: string;
}

export interface SovereignActivityLog {
  id: string;
  driverPhone?: string;
  driverName: string;
  vehiclePlate?: string;
  channel: 'pwa_offline' | 'pwa_online' | 'internal_system';
  type: 'fuel' | 'accident' | 'odometer' | 'mission' | 'location';
  title: string;
  details: string;
  timestamp: string;
  gpsCoordinates?: GPSLocation;
  status: 'synced' | 'validated' | 'alert';
}

export interface SovereignGatewayStatus {
  mode: 'sovereign_on_premise' | 'datacenter_alger';
  dataLocalization: string;
  anpdpCompliance: boolean;
  tlsVersion: string;
  encryption: string;
  activeTerminalsCount: number;
  offlineSyncQueueSize: number;
}

export interface ANPDPComplianceReport {
  framework: string;
  lawNumber: string;
  authority: string;
  dataLocalization: string;
  encryptionStandard: string;
  anpdpRegistrationNumber: string;
  dpoContact: string;
  lastAuditDate: string;
  pwaSandboxed: boolean;
  gpsRetentionDays: number;
}
