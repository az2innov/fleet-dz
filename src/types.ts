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
}

export type DriverStatus = 'available' | 'on_mission' | 'on_leave' | 'in_training';
export type LicenseCategory = 'B' | 'C' | 'D' | 'E' | 'transport_commun';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  wilaya: string;
  licenseNumber: string;
  licenseCategories: LicenseCategory[];
  licenseExpiry: string; // YYYY-MM-DD
  medicalCheckupExpiry: string; // YYYY-MM-DD (visites médicales professionnelles)
  medicalCheckupStatus: 'valid' | 'expiring_soon' | 'expired';
  assignedVehiclePlate: string;
  status: DriverStatus;
  department: string; // e.g. "Direction Logistique & Approvisionnement"
  hiringDate: string; // YYYY-MM-DD
  avatar?: string;
  bloodGroup?: string;
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
