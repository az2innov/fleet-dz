import { 
  Vehicle, 
  Driver, 
  FuelLog, 
  MaintenanceRecord, 
  AccidentClaim, 
  FleetAlert, 
  SovereignActivityLog,
  MissionOrder,
  VehicleIntervention 
} from '../src/types.js';

// Générateur de Carte Grise Numérisée conforme aux normes du Ministère de l'Intérieur algérien
export const generateSampleCarteGrise = (
  plate: string, 
  make: string, 
  model: string, 
  chassis: string, 
  category: string, 
  ptacKg: number,
  ptraKg?: number,
  powerHP?: number
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="100%" height="100%">
    <rect width="100%" height="100%" fill="#fbfcf8" stroke="#1b4d3e" stroke-width="6" rx="16"/>
    <rect x="20" y="20" width="760" height="480" fill="none" stroke="#2e7d32" stroke-width="1.5" stroke-dasharray="6,4" rx="12"/>
    <text x="400" y="55" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#006233" text-anchor="middle">الجمهورية الجزائرية الديمقراطية الشعبية</text>
    <text x="400" y="78" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#333" text-anchor="middle">RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE</text>
    <text x="400" y="98" font-family="system-ui, sans-serif" font-size="11" fill="#666" text-anchor="middle">Ministère de l'Intérieur et des Collectivités Locales — Direction des Titres Sécurisés</text>
    <line x1="60" y1="112" x2="740" y2="112" stroke="#006233" stroke-width="2"/>
    
    <rect x="60" y="125" width="680" height="45" fill="#e8f5e9" rx="8" stroke="#81c784"/>
    <text x="80" y="153" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1b5e20">CARTE GRISE / CERTIFICAT D'IMMATRICULATION AUTOMOBILE</text>
    <text x="720" y="153" font-family="monospace" font-size="14" font-weight="bold" fill="#006233" text-anchor="end">DZ-${plate}</text>

    <!-- Details Grid -->
    <text x="80" y="198" font-family="system-ui, sans-serif" font-size="11" fill="#777">Numéro d'Immatriculation (Matricule) :</text>
    <text x="80" y="218" font-family="monospace" font-size="16" font-weight="bold" fill="#111">${plate}</text>

    <text x="420" y="198" font-family="system-ui, sans-serif" font-size="11" fill="#777">Catégorie / Genre du Véhicule :</text>
    <text x="420" y="218" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111">${category} (Norme Décret N° 04-381)</text>

    <text x="80" y="255" font-family="system-ui, sans-serif" font-size="11" fill="#777">Marque &amp; Modèle Commercial :</text>
    <text x="80" y="275" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111">${make} ${model}</text>

    <text x="420" y="255" font-family="system-ui, sans-serif" font-size="11" fill="#777">Numéro de Châssis (VIN) :</text>
    <text x="420" y="275" font-family="monospace" font-size="13" font-weight="bold" fill="#111">${chassis}</text>

    <text x="80" y="312" font-family="system-ui, sans-serif" font-size="11" fill="#777">Poids Total Autorisé en Charge (PTAC) :</text>
    <text x="80" y="332" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111">${ptacKg} kg</text>

    <text x="420" y="312" font-family="system-ui, sans-serif" font-size="11" fill="#777">${ptraKg ? 'Poids Total Roulant Autorisé (PTRA) :' : 'Puissance Moteur :'}</text>
    <text x="420" y="332" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111">${ptraKg ? `${ptraKg} kg` : powerHP ? `${powerHP} ch DIN` : 'Standard'}</text>

    <text x="80" y="368" font-family="system-ui, sans-serif" font-size="11" fill="#777">Wilaya de Délivrance :</text>
    <text x="80" y="388" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#111">Wilaya ${plate.split('-').pop() || '16'}</text>

    <rect x="60" y="415" width="680" height="75" fill="#f4fbf7" rx="8" stroke="#c8e6c9"/>
    <text x="80" y="438" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#2e7d32">Sceau &amp; Authentification Souveraine de l'Administration :</text>
    <text x="80" y="455" font-family="system-ui, sans-serif" font-size="10" fill="#555">Document officiel numérisé certifié conforme pour la gestion de flotte automobile Dz-Fleet.</text>
    <text x="80" y="472" font-family="monospace" font-size="9" fill="#888">SHA-256: 7a9e8f1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789ab</text>
    <circle cx="680" cy="452" r="24" fill="#e8f5e9" stroke="#006233" stroke-width="2"/>
    <text x="680" y="452" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#006233" text-anchor="middle">OFFICIEL</text>
    <text x="680" y="462" font-family="system-ui, sans-serif" font-size="7" fill="#006233" text-anchor="middle">WILAYA</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
};

export class FleetDatabase {
  private vehicles: Vehicle[] = [
    {
      id: 'v-1',
      plate: '04512-118-16',
      make: 'Renault',
      model: 'Symbol 1.6 Expression',
      year: 2021,
      driverId: 'd-1',
      driverName: 'Karim Belkacem',
      driverPhone: '+213550123456',
      fuelType: 'essence',
      status: 'active',
      mileage: 87450,
      tankCapacityLiters: 50,
      averageConsumption: 7.2,
      lastServiceKm: 80000,
      nextServiceKm: 90000,
      insuranceCompany: 'CAAT',
      insuranceExpiry: '2026-11-15',
      technicalControlExpiry: '2026-10-02',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'VF1LB0E0556781290',
      // 8 nouveaux champs réglementaires & techniques
      vehicleCategory: 'VP', // Véhicule Particulier
      operationalMissionStatus: 'reserve_depot', // 1. En Réserve au Dépôt
      engineDisplacement: '1.6L 16V', // 2. Cylindrée
      engineCylinders: 4, // 2. Nombre de cylindres
      transmissionType: 'Manuelle', // 3. Boîte de vitesses
      transmissionGears: 5, // 3. Nombre de rapports
      drivetrain: '4x2', // 4. Traction / Essieux
      acquisitionCostDZD: 2200000, // 6. Coût d'acquisition : 2.2 M DA
      totalMaintenanceCostDZD: 18500, // Coût cumulé d'entretien & réparations (DA)
      lastTireChangeKm: 60000, // 7. Dernier changement pneus à 60 000 km
      tireLifespanKm: 50000, // 7. Durée de vie théorique 50 000 km
      tireWearPercentage: 55, // 7. Usure estimée : 55%
      enginePowerHP: 102, // 8. Puissance (ch)
      ptacKg: 1550, // 8. PTAC (kg)
      ptraKg: 2450, // 8. PTRA (kg)
      payloadKg: 520, // 8. Charge utile (kg)
      registrationDocUrl: generateSampleCarteGrise('04512-118-16', 'Renault', 'Symbol 1.6 Expression', 'VF1LB0E0556781290', 'VP (Véhicule Particulier)', 1550, 2450, 102),
      tires: {
        frontLeft: 82,
        frontRight: 80,
        rearLeft: 85,
        rearRight: 84,
        lastInspectionDate: '2026-08-10',
        notes: 'Pneus Michelin Energy Saver en très bon état.',
      },
    },
    {
      id: 'v-2',
      plate: '12890-120-16',
      make: 'Peugeot',
      model: '208 1.6 HDi Active',
      year: 2022,
      driverId: 'd-2',
      driverName: 'Youcef Amrani',
      driverPhone: '+213661789012',
      fuelType: 'diesel',
      status: 'active',
      mileage: 64200,
      tankCapacityLiters: 50,
      averageConsumption: 5.1,
      lastServiceKm: 60000,
      nextServiceKm: 70000,
      insuranceCompany: 'SAA',
      insuranceExpiry: '2026-12-20',
      technicalControlExpiry: '2026-09-28', // Alert coming soon!
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'VF3CC9HP0EW098124',
      vehicleCategory: 'VP',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '1.6L HDi',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 5,
      drivetrain: '4x2',
      acquisitionCostDZD: 2650000,
      totalMaintenanceCostDZD: 32000,
      lastTireChangeKm: 45000,
      tireLifespanKm: 50000,
      tireWearPercentage: 38,
      enginePowerHP: 92,
      ptacKg: 1620,
      ptraKg: 2500,
      payloadKg: 490,
      registrationDocUrl: generateSampleCarteGrise('12890-120-16', 'Peugeot', '208 1.6 HDi Active', 'VF3CC9HP0EW098124', 'VP (Véhicule Particulier)', 1620, 2500, 92),
      tires: {
        frontLeft: 70,
        frontRight: 68,
        rearLeft: 75,
        rearRight: 74,
        lastInspectionDate: '2026-07-22',
        notes: 'Usure normale, géométrie contrôlée.',
      },
    },
    {
      id: 'v-3',
      plate: '00341-319-31',
      make: 'Toyota',
      model: 'Hilux Double Cabine 4x4',
      year: 2020,
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      driverPhone: '+213770456789',
      fuelType: 'diesel',
      status: 'active',
      mileage: 142300,
      tankCapacityLiters: 80,
      averageConsumption: 9.4,
      lastServiceKm: 130000,
      nextServiceKm: 140000, // OVERDUE!
      insuranceCompany: 'CASH',
      insuranceExpiry: '2027-01-10',
      technicalControlExpiry: '2026-12-05',
      vignetteYear: 2026,
      wilayaCode: '31',
      chassisNumber: 'MR0FR22G900145672',
      vehicleCategory: 'VU', // Véhicule Utilitaire
      operationalMissionStatus: 'en_mission', // En mission Alger -> Hassi Messaoud
      engineDisplacement: '2.8L D-4D Turbo',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x4',
      acquisitionCostDZD: 6800000,
      totalMaintenanceCostDZD: 45000,
      lastTireChangeKm: 100000,
      tireLifespanKm: 60000,
      tireWearPercentage: 70,
      enginePowerHP: 150,
      ptacKg: 3000,
      ptraKg: 5850,
      payloadKg: 1050,
      registrationDocUrl: generateSampleCarteGrise('00341-319-31', 'Toyota', 'Hilux Double Cabine 4x4', 'MR0FR22G900145672', 'VU (Véhicule Utilitaire)', 3000, 5850, 150),
      tires: {
        frontLeft: 55,
        frontRight: 52,
        rearLeft: 60,
        rearRight: 58,
        lastInspectionDate: '2026-05-18',
        notes: 'Pneus tout-terrain Bridgestone Dueler A/T, contrôle prévu à la prochaine vidange.',
      },
    },
    {
      id: 'v-4',
      plate: '08761-121-09',
      make: 'Hyundai',
      model: 'H100 Fourgon Tôlé',
      year: 2021,
      driverId: 'd-4',
      driverName: 'Sofiane Mansouri',
      driverPhone: '+213555987654',
      fuelType: 'diesel',
      status: 'accident',
      mileage: 112500,
      tankCapacityLiters: 65,
      averageConsumption: 8.8,
      lastServiceKm: 110000,
      nextServiceKm: 120000,
      insuranceCompany: 'SAA',
      insuranceExpiry: '2026-10-30',
      technicalControlExpiry: '2026-11-12',
      vignetteYear: 2026,
      wilayaCode: '09',
      chassisNumber: 'KMHFA17BPCA123490',
      vehicleCategory: 'VU',
      operationalMissionStatus: 'sinistre', // En sinistre / Constat
      engineDisplacement: '2.5L CRDi',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x2',
      acquisitionCostDZD: 3850000,
      totalMaintenanceCostDZD: 28000,
      lastTireChangeKm: 80000,
      tireLifespanKm: 55000,
      tireWearPercentage: 59,
      enginePowerHP: 130,
      ptacKg: 3200,
      ptraKg: 4700,
      payloadKg: 1450,
      registrationDocUrl: generateSampleCarteGrise('08761-121-09', 'Hyundai', 'H100 Fourgon Tôlé', 'KMHFA17BPCA123490', 'VU (Véhicule Utilitaire)', 3200, 4700, 130),
      tires: {
        frontLeft: 45,
        frontRight: 40,
        rearLeft: 65,
        rearRight: 62,
        lastInspectionDate: '2026-06-15',
        notes: 'Choc avant droit lors du sinistre, jante AVD à contrôler.',
      },
    },
    {
      id: 'v-5',
      plate: '01923-122-16',
      make: 'Dacia',
      model: 'Duster 1.5 dCi 4x2',
      year: 2023,
      driverId: 'd-5',
      driverName: 'Reda Khelil',
      driverPhone: '+213662334455',
      fuelType: 'diesel',
      status: 'active',
      mileage: 38900,
      tankCapacityLiters: 50,
      averageConsumption: 5.8,
      lastServiceKm: 30000,
      nextServiceKm: 45000,
      insuranceCompany: 'CIAR',
      insuranceExpiry: '2027-03-15',
      technicalControlExpiry: '2027-04-10',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'UU1HSD73678239012',
      vehicleCategory: 'VP',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '1.5L dCi',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x2',
      acquisitionCostDZD: 3400000,
      totalMaintenanceCostDZD: 14500,
      lastTireChangeKm: 0,
      tireLifespanKm: 50000,
      tireWearPercentage: 78,
      enginePowerHP: 110,
      ptacKg: 1800,
      ptraKg: 2950,
      payloadKg: 550,
      registrationDocUrl: generateSampleCarteGrise('01923-122-16', 'Dacia', 'Duster 1.5 dCi 4x2', 'UU1HSD73678239012', 'VP (Véhicule Particulier)', 1800, 2950, 110),
      tires: {
        frontLeft: 90,
        frontRight: 90,
        rearLeft: 92,
        rearRight: 91,
        lastInspectionDate: '2026-08-01',
        notes: 'Pneumatiques d\'origine quasi neufs.',
      },
    },
    {
      id: 'v-6',
      plate: '02345-123-30',
      make: 'Toyota',
      model: 'Land Cruiser Prado TX-L',
      year: 2023,
      driverId: 'd-6',
      driverName: 'Mounir Dahmani',
      driverPhone: '+213670998877',
      fuelType: 'diesel',
      status: 'active',
      mileage: 48600,
      tankCapacityLiters: 87,
      averageConsumption: 10.2,
      lastServiceKm: 40000,
      nextServiceKm: 50000,
      insuranceCompany: 'CASH',
      insuranceExpiry: '2027-02-28',
      technicalControlExpiry: '2027-02-20',
      vignetteYear: 2026,
      wilayaCode: '30',
      chassisNumber: 'JTEBX9FJ80K129034',
      vehicleCategory: 'VU',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '2.8L D-4D 16V',
      engineCylinders: 4,
      transmissionType: 'Automatique',
      transmissionGears: 6,
      drivetrain: '4x4',
      acquisitionCostDZD: 11500000,
      totalMaintenanceCostDZD: 52000,
      lastTireChangeKm: 20000,
      tireLifespanKm: 60000,
      tireWearPercentage: 48,
      enginePowerHP: 204,
      ptacKg: 2990,
      ptraKg: 5990,
      payloadKg: 750,
      registrationDocUrl: generateSampleCarteGrise('02345-123-30', 'Toyota', 'Land Cruiser Prado TX-L', 'JTEBX9FJ80K129034', 'VU (Véhicule Tout-Terrain)', 2990, 5990, 204),
      tires: {
        frontLeft: 88,
        frontRight: 87,
        rearLeft: 90,
        rearRight: 89,
        lastInspectionDate: '2026-07-10',
        notes: 'Pneumatiques renforcés pour pistes sahariennes.',
      }
    },
    {
      id: 'v-7',
      plate: '01450-418-16',
      make: 'Renault Trucks',
      model: 'K440 P 6x4 Benne Lourde',
      year: 2021,
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      driverPhone: '+213770456789',
      fuelType: 'diesel',
      status: 'active',
      mileage: 215400,
      tankCapacityLiters: 380,
      averageConsumption: 34.5,
      lastServiceKm: 200000,
      nextServiceKm: 220000,
      insuranceCompany: 'CAAT',
      insuranceExpiry: '2026-11-30',
      technicalControlExpiry: '2026-10-15',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'VF634APA000019284',
      vehicleCategory: 'PL', // Poids Lourd > 3.5 T
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '13.0L DXi13 Turbo',
      engineCylinders: 6,
      enginePowerHP: 440,
      transmissionType: 'Robotisée',
      transmissionGears: 12,
      drivetrain: '6x4',
      acquisitionCostDZD: 16500000,
      totalMaintenanceCostDZD: 68000,
      lastTireChangeKm: 160000,
      tireLifespanKm: 80000,
      tireWearPercentage: 69,
      ptacKg: 26000,
      ptraKg: 40000,
      payloadKg: 14500,
      registrationDocUrl: generateSampleCarteGrise('01450-418-16', 'Renault Trucks', 'K440 P 6x4 Benne', 'VF634APA000019284', 'PL (Poids Lourd > 3.5 T)', 26000, 40000, 440),
      tires: {
        frontLeft: 75,
        frontRight: 74,
        rearLeft: 70,
        rearRight: 72,
        lastInspectionDate: '2026-08-05',
        notes: 'Pneus de chantier 315/80 R22.5 renforcés.',
      }
    },
    {
      id: 'v-8',
      plate: '05230-519-30',
      make: 'Mercedes-Benz',
      model: 'Actros 3344 Semi-Remorque Citerne',
      year: 2020,
      driverId: 'd-6',
      driverName: 'Mounir Dahmani',
      driverPhone: '+213670998877',
      fuelType: 'diesel',
      status: 'active',
      mileage: 284100,
      tankCapacityLiters: 500,
      averageConsumption: 38.0,
      lastServiceKm: 270000,
      nextServiceKm: 290000,
      insuranceCompany: 'CASH',
      insuranceExpiry: '2027-01-31',
      technicalControlExpiry: '2026-12-20',
      vignetteYear: 2026,
      wilayaCode: '30',
      chassisNumber: 'WDB9340321K829104',
      vehicleCategory: 'SM', // Semi-Remorque (Tracteur + Citerne)
      operationalMissionStatus: 'en_mission', // En mission ravitaillement saharien
      engineDisplacement: '12.0L V6 Turbo Intercooler',
      engineCylinders: 6,
      enginePowerHP: 435,
      transmissionType: 'Automatique',
      transmissionGears: 16,
      drivetrain: '6x4',
      acquisitionCostDZD: 24500000,
      totalMaintenanceCostDZD: 95000,
      lastTireChangeKm: 220000,
      tireLifespanKm: 90000,
      tireWearPercentage: 71,
      ptacKg: 26000,
      ptraKg: 44000,
      payloadKg: 28000,
      registrationDocUrl: generateSampleCarteGrise('05230-519-30', 'Mercedes-Benz', 'Actros 3344 Semi-Remorque', 'WDB9340321K829104', 'SM (Semi-Remorque Articulé)', 26000, 44000, 435),
      tires: {
        frontLeft: 68,
        frontRight: 66,
        rearLeft: 65,
        rearRight: 65,
        lastInspectionDate: '2026-07-28',
        notes: 'Pneumatiques grands trajets 385/65 R22.5 certifiés ADR / Matières dangereuses.',
      }
    }
  ];

  private drivers: Driver[] = [
    {
      id: 'd-test',
      name: 'Chauffeur Test (Ooredoo)',
      phone: '+213560383640',
      email: 'chauffeur.test@dzfleet.dz',
      wilaya: '16 - Alger',
      address: 'Cité 500 Logements, Bâtiment 4, Bab Ezzouar, Alger',
      birthDate: '1985-04-12',
      educationLevel: 'Secondaire',
      licenseNumber: 'ALG-560383-B',
      licenseCategories: ['B', 'C'],
      licenseExpiry: '2029-05-14',
      medicalCheckupExpiry: '2027-04-10',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '04512-118-16',
      status: 'available',
      department: 'Direction des Moyens Généraux',
      hiringDate: '2022-03-01',
      bloodGroup: 'O+',
      managerNotes: 'Chauffeur de test dédié pour la validation PWA Souveraine et les alertes Naftal. Ponctuel et rigoureux.',
      comments: [
        {
          id: 'cmt-test-1',
          text: 'Chauffeur de test dédié pour la validation PWA Souveraine et les alertes Naftal. Ponctuel et rigoureux.',
          date: '2026-11-20T14:30:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Fatima Belkacem',
        phone: '+213550998811',
        relation: 'Épouse',
      },
    },
    {
      id: 'd-1',
      name: 'Karim Belkacem',
      phone: '+213550123456',
      email: 'karim.belkacem@dzfleet.dz',
      wilaya: '16 - Alger (El Mouradia)',
      address: '14 Rue Mohamed Belouizdad, El Mouradia, Alger',
      birthDate: '1988-09-23',
      educationLevel: 'Universitaire',
      licenseNumber: 'ALG-992014-B',
      licenseCategories: ['B'],
      licenseExpiry: '2028-11-20',
      medicalCheckupExpiry: '2027-02-15',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '04512-118-16',
      status: 'available',
      department: 'Direction Générale (Pool Véhicules Légers)',
      hiringDate: '2020-01-15',
      bloodGroup: 'A+',
      managerNotes: 'Conducteur titulaire Pool Direction Générale. Conduite défensive validée et habilitation protocolaire.',
      comments: [
        {
          id: 'cmt-1-1',
          text: 'Conducteur titulaire Pool Direction Générale. Conduite défensive validée et habilitation protocolaire.',
          date: '2026-11-15T09:15:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Nadia Belkacem',
        phone: '+213550443322',
        relation: 'Épouse',
      },
    },
    {
      id: 'd-2',
      name: 'Youcef Amrani',
      phone: '+213661789012',
      email: 'youcef.amrani@dzfleet.dz',
      wilaya: '16 - Alger (Chéraga)',
      address: 'Résidence Les Orangers, Villa 18, Chéraga, Alger',
      birthDate: '1992-11-05',
      educationLevel: 'Secondaire',
      licenseNumber: 'ALG-881920-B',
      licenseCategories: ['B'],
      licenseExpiry: '2027-08-30',
      medicalCheckupExpiry: '2026-10-15', // Expiring soon!
      medicalCheckupStatus: 'expiring_soon',
      assignedVehiclePlate: '12890-120-16',
      status: 'on_mission',
      department: 'Direction Commerciale & Réseau',
      hiringDate: '2021-06-01',
      bloodGroup: 'B+',
      managerNotes: 'Visite médicale périodique arrive à échéance sous 30 jours. Prendre rendez-vous au centre de médecine du travail.',
      comments: [
        {
          id: 'cmt-2-1',
          text: 'Visite médicale périodique arrive à échéance sous 30 jours. Prendre rendez-vous au centre de médecine du travail.',
          date: '2026-11-18T11:45:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Samir Amrani',
        phone: '+213661223344',
        relation: 'Frère',
      },
    },
    {
      id: 'd-3',
      name: 'Ahmed Benali',
      phone: '+213770456789',
      email: 'ahmed.benali@dzfleet.dz',
      wilaya: '31 - Oran (Es Senia)',
      address: 'Haï El Badr, Rue 12 N° 45, Es Senia, Oran',
      birthDate: '1980-07-19',
      educationLevel: 'Moyen',
      licenseNumber: 'ORN-451290-C',
      licenseCategories: ['B', 'C', 'D'],
      licenseExpiry: '2030-01-10',
      medicalCheckupExpiry: '2027-01-20',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '00341-319-31',
      status: 'on_mission',
      department: 'Direction Logistique Régionale Ouest',
      hiringDate: '2019-09-10',
      bloodGroup: 'O+',
      managerNotes: 'Spécialiste liaisons régionales Ouest et convois poids lourds. Très bonne maîtrise de la consommation de carburant.',
      comments: [
        {
          id: 'cmt-3-1',
          text: 'Spécialiste liaisons régionales Ouest et convois poids lourds. Très bonne maîtrise de la consommation de carburant.',
          date: '2026-11-10T16:20:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Khadidja Benali',
        phone: '+213770112233',
        relation: 'Mère',
      },
    },
    {
      id: 'd-4',
      name: 'Sofiane Mansouri',
      phone: '+213555987654',
      email: 'sofiane.mansouri@dzfleet.dz',
      wilaya: '09 - Blida (Boufarik)',
      address: 'Route Nationale 1, Cité Verte, Boufarik, Blida',
      birthDate: '1995-02-14',
      educationLevel: 'Secondaire',
      licenseNumber: 'BLD-119283-B',
      licenseCategories: ['B', 'C'],
      licenseExpiry: '2027-03-22',
      medicalCheckupExpiry: '2026-09-10', // Expired!
      medicalCheckupStatus: 'expired',
      assignedVehiclePlate: '08761-121-09',
      status: 'on_leave',
      department: 'Service Approvisionnement & Stock',
      hiringDate: '2021-11-15',
      bloodGroup: 'AB+',
      managerNotes: 'Visite médicale expirée ! Suspension provisoire d’émission d’ordres de mission jusqu’à renouvellement du certificat d’aptitude.',
      comments: [
        {
          id: 'cmt-4-1',
          text: 'Visite médicale expirée ! Suspension provisoire d’émission d’ordres de mission jusqu’à renouvellement du certificat d’aptitude.',
          date: '2026-11-12T08:30:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Mustapha Mansouri',
        phone: '+213555332211',
        relation: 'Père',
      },
    },
    {
      id: 'd-5',
      name: 'Reda Khelil',
      phone: '+213662334455',
      email: 'reda.khelil@dzfleet.dz',
      wilaya: '16 - Alger (Rouiba)',
      address: 'Cité Sonelgaz, Bloc B2, Rouiba, Alger',
      birthDate: '1990-06-30',
      educationLevel: 'Universitaire',
      licenseNumber: 'ALG-349012-B',
      licenseCategories: ['B', 'transport_commun'],
      licenseExpiry: '2029-10-05',
      medicalCheckupExpiry: '2027-06-18',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '01923-122-16',
      status: 'available',
      department: 'Direction des Moyens Généraux',
      hiringDate: '2023-02-01',
      bloodGroup: 'A-',
      managerNotes: 'Titulaire permis D et Transport en Commun. Assure régulièrement le transport d’employés et délégations.',
      comments: [
        {
          id: 'cmt-5-1',
          text: 'Titulaire permis D et Transport en Commun. Assure régulièrement le transport d’employés et délégations.',
          date: '2026-11-14T10:00:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Yasmine Khelil',
        phone: '+213662887766',
        relation: 'Épouse',
      },
    },
    {
      id: 'd-6',
      name: 'Mounir Dahmani',
      phone: '+213670998877',
      email: 'mounir.dahmani@dzfleet.dz',
      wilaya: '30 - Ouargla (Hassi Messaoud)',
      address: 'Base de vie 24 Février, Hassi Messaoud, Ouargla',
      birthDate: '1982-12-08',
      educationLevel: 'Primaire',
      licenseNumber: 'WRG-887711-E',
      licenseCategories: ['B', 'C', 'D', 'E'],
      licenseExpiry: '2031-04-12',
      medicalCheckupExpiry: '2027-03-30',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '02345-123-30',
      status: 'available',
      department: 'Direction Régionale Sud (Sahara)',
      hiringDate: '2018-04-10',
      bloodGroup: 'O-',
      managerNotes: 'Expert conduite tout-terrain désertique et pistes sahariennes. Habilité sur les sites pétroliers fermés.',
      comments: [
        {
          id: 'cmt-6-1',
          text: 'Expert conduite tout-terrain désertique et pistes sahariennes. Habilité sur les sites pétroliers fermés.',
          date: '2026-11-05T15:10:00.000Z',
          author: 'Karim Ziani (Exploitation)',
          authorRole: 'fleet_manager',
        }
      ],
      emergencyContact: {
        name: 'Ali Dahmani',
        phone: '+213670112244',
        relation: 'Frère',
      },
    }
  ];

  private missions: MissionOrder[] = [
    {
      id: 'om-1',
      orderNumber: 'OM-2026-0891',
      title: 'Approvisionnement & Supervision Base Sud',
      purpose: 'Acheminement outillage critique et supervision technique des installations de forage.',
      departureCity: 'Alger',
      departureWilaya: '16 - Alger',
      destinationCity: 'Hassi Messaoud',
      destinationWilaya: '30 - Ouargla',
      intermediateStops: ['Djelfa', 'Ghardaïa', 'Ouargla'],
      departureDate: '2026-10-05',
      departureTime: '06:00',
      returnDate: '2026-10-09',
      returnTime: '18:00',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      vehicleModel: 'Toyota Hilux 4x4',
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      driverPhone: '+213770456789',
      driverLicenseNumber: 'ORN-451290-C',
      driverLicenseCategory: 'B, C, D',
      estimatedDistanceKm: 820,
      estimatedFuelBudgetDZD: 22400,
      tollFeesDZD: 1600,
      perDiemDZD: 18000,
      totalBudgetDZD: 42000,
      status: 'in_progress',
      signedBy: 'Directeur des Moyens Généraux',
      signedAt: '2026-10-04T08:30:00Z',
      officialSeal: true,
      notes: 'Passage obligatoire par les postes de contrôle Gendarmerie N1 et N49. Port des EPI requis à l\'arrivée sur site.',
      createdAt: '2026-10-04T08:00:00Z',
    },
    {
      id: 'om-2',
      orderNumber: 'OM-2026-0892',
      title: 'Audit & Inspection Agences Régionales Ouest',
      purpose: 'Contrôle périodique de conformité et audit des dépôts régionaux.',
      departureCity: 'Alger',
      departureWilaya: '16 - Alger',
      destinationCity: 'Oran',
      destinationWilaya: '31 - Oran',
      intermediateStops: ['Blida', 'Chlef', 'Relizane'],
      departureDate: '2026-10-06',
      departureTime: '07:30',
      returnDate: '2026-10-07',
      returnTime: '20:00',
      vehicleId: 'v-2',
      vehiclePlate: '12890-120-16',
      vehicleModel: 'Peugeot 208 HDi',
      driverId: 'd-2',
      driverName: 'Youcef Amrani',
      driverPhone: '+213661789012',
      driverLicenseNumber: 'ALG-881920-B',
      driverLicenseCategory: 'B',
      estimatedDistanceKm: 430,
      estimatedFuelBudgetDZD: 6400,
      tollFeesDZD: 900,
      perDiemDZD: 9000,
      totalBudgetDZD: 16300,
      status: 'approved',
      signedBy: 'Directeur Général Adjoint',
      signedAt: '2026-10-03T14:15:00Z',
      officialSeal: true,
      notes: 'Emprunter l\'Autoroute Est-Ouest A1. Ordre de mission validé avec télépéage.',
      createdAt: '2026-10-03T11:00:00Z',
    },
    {
      id: 'om-3',
      orderNumber: 'OM-2026-0893',
      title: 'Livraison Urgente Pièces de Rechange Est',
      purpose: 'Acheminement de pièces de rechange mécaniques pour l\'unité de production.',
      departureCity: 'Alger',
      departureWilaya: '16 - Alger',
      destinationCity: 'Constantine',
      destinationWilaya: '25 - Constantine',
      intermediateStops: ['Bouira', 'Bordj Bou Arreridj', 'Sétif'],
      departureDate: '2026-10-08',
      departureTime: '06:30',
      returnDate: '2026-10-08',
      returnTime: '21:00',
      vehicleId: 'v-5',
      vehiclePlate: '01923-122-16',
      vehicleModel: 'Dacia Duster 1.5 dCi',
      driverId: 'd-5',
      driverName: 'Reda Khelil',
      driverPhone: '+213662334455',
      driverLicenseNumber: 'ALG-349012-B',
      driverLicenseCategory: 'B, Transport en commun',
      estimatedDistanceKm: 390,
      estimatedFuelBudgetDZD: 6600,
      tollFeesDZD: 800,
      perDiemDZD: 6000,
      totalBudgetDZD: 13400,
      status: 'draft',
      signedBy: 'Responsable Logistique',
      officialSeal: false,
      notes: 'En attente de visa final de la Direction Financière.',
      createdAt: '2026-10-04T10:00:00Z',
    }
  ];

  private interventions: VehicleIntervention[] = [
    {
      id: 'itv-1',
      interventionOrderNumber: 'DI-2026-0045',
      receptionSheetNumber: 'FR-2026-0045',
      natureIntervention: 'preventive',
      fuelType: 'essence',
      vehicleId: 'v-1',
      vehiclePlate: '04512-118-16',
      vehicleMakeModel: 'Renault Symbol 1.6 Expression',
      vehicleCategory: 'VP',
      odometerOutKm: 80000,
      odometerInKm: 80025,
      driverId: 'd-1',
      driverName: 'Karim Belkacem',
      driverPhone: '+213550123456',
      type: 'vidange_moteur',
      title: 'Vidange moteur des 80 000 km, filtres Naftal & plaquettes de freins AV',
      description: 'Entretien périodique programmé des 80 000 km selon le carnet constructeur. Remplacement de l\'huile moteur par Naftal Chems 5W40, filtre à huile, filtre à air et contrôle de l\'usure des plaquettes de freins.',
      urgency: 'normal',
      garageType: 'atelier_interne',
      garageName: 'Atelier Central Flotte & Mécanique (El Mouradia, Alger)',
      dateSortieIntervention: '2026-10-10T08:30',
      estimatedDurationDays: 1,
      requestedBy: 'Karim Ziani (Gestionnaire de Flotte)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-10-09',
      officialSealDI: true,
      dateRetourIntervention: '2026-10-11T16:00',
      coutInterventionDZD: 18500,
      workDoneDetails: 'Vidange moteur avec huile de synthèse Naftal Chems 5W40 (4.5 L). Remplacement filtre à huile Purflux et filtre à air. Changement des plaquettes de freins avant Ferodo, purge et appoint liquide de frein DOT4. Contrôle géométrie.',
      partsReplaced: [
        'Huile Naftal Chems Synthèse 5W40 (5L)',
        'Filtre à huile Purflux LS932',
        'Filtre à air moteur',
        'Jeu de plaquettes de freins avant Ferodo'
      ],
      qualityChecks: {
        brakingTested: true,
        fluidLevelsChecked: true,
        tiresInspected: true,
        dashboardWarningsOff: true,
        roadTested: true,
      },
      receptionDecision: 'conforme_bon_service',
      receptionNotes: 'Véhicule parfaitement conforme aux exigences de sécurité. Essai sur voie rapide concluant.',
      receivedBy: 'Mourad Hadj (Responsable Maintenance)',
      receivedByRole: 'maintenance_lead',
      receptionDate: '2026-10-11',
      officialSealFR: true,
      status: 'cloturee_receptionnee',
      createdAt: '2026-10-09T10:00:00Z',
    },
    {
      id: 'itv-2',
      interventionOrderNumber: 'DI-2026-0062',
      receptionSheetNumber: 'FR-2026-0062',
      natureIntervention: 'curative',
      fuelType: 'diesel',
      vehicleId: 'v-2',
      vehiclePlate: '12890-120-16',
      vehicleMakeModel: 'Peugeot 208 1.6 HDi Active',
      vehicleCategory: 'VP',
      odometerOutKm: 60000,
      odometerInKm: 60018,
      driverId: 'd-2',
      driverName: 'Youcef Amrani',
      driverPhone: '+213661789012',
      type: 'freinage',
      title: 'Remplacement disques & plaquettes de freins AV, réglage géométrie',
      description: 'Vibrations anormales ressenties dans le volant au freinage à plus de 80 km/h signalées par le chauffeur. Remplacement des disques de frein ventilés et contrôle complet du train avant.',
      urgency: 'urgent',
      garageType: 'partenaire_conventionne',
      garageName: 'Garage Partenaire SAA Auto-Service (Bab Ezzouar)',
      dateSortieIntervention: '2026-10-25T09:00',
      estimatedDurationDays: 2,
      requestedBy: 'Karim Ziani (Gestionnaire de Flotte)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-10-24',
      officialSealDI: true,
      dateRetourIntervention: '2026-10-27T14:30',
      coutInterventionDZD: 32000,
      workDoneDetails: 'Remplacement paire de disques de freins avant ventilés 266mm Valeo, jeu de plaquettes Brembo. Réglage parallélisme et géométrie train avant sur banc laser.',
      partsReplaced: [
        'Paire disques avant ventilés Valeo',
        'Jeu de plaquettes Brembo HP',
        'Liquide de frein Bendix DOT4'
      ],
      qualityChecks: {
        brakingTested: true,
        fluidLevelsChecked: true,
        tiresInspected: true,
        dashboardWarningsOff: true,
        roadTested: true,
      },
      receptionDecision: 'conforme_bon_service',
      receptionNotes: 'Freinage progressif et puissant rétabli. Aucune vibration constatée.',
      receivedBy: 'Mourad Hadj (Responsable Maintenance)',
      receivedByRole: 'maintenance_lead',
      receptionDate: '2026-10-27',
      officialSealFR: true,
      status: 'cloturee_receptionnee',
      createdAt: '2026-10-24T14:00:00Z',
    },
    {
      id: 'itv-3',
      interventionOrderNumber: 'DI-2026-0078',
      natureIntervention: 'curative',
      fuelType: 'diesel',
      vehicleId: 'v-4',
      vehiclePlate: '08761-121-09',
      vehicleMakeModel: 'Hyundai H100 Fourgon Tôlé',
      vehicleCategory: 'VU',
      odometerOutKm: 112500,
      driverId: 'd-4',
      driverName: 'Sofiane Mansouri',
      driverPhone: '+213555987654',
      type: 'carrosserie_tolerie',
      title: 'Réparation carrosserie aile avant droite & bloc optique suite à sinistre',
      description: 'Dégâts matériels suite à un accrochage au rond-point Kouba. Redressage de l\'aile avant droite, remplacement bloc optique projecteur droit, antibrouillard et mise en peinture aux teintes constructeur.',
      urgency: 'critique',
      garageType: 'concessionnaire',
      garageName: 'Atelier Agréé Concessionnaire Hyundai (Oued Smar)',
      dateSortieIntervention: '2026-11-20T10:00',
      estimatedDurationDays: 5,
      requestedBy: 'Karim Ziani (Gestionnaire de Flotte)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-11-20',
      officialSealDI: true,
      status: 'en_cours_atelier',
      createdAt: '2026-11-20T10:30:00Z',
    },
    {
      id: 'itv-4',
      interventionOrderNumber: 'DI-2026-0085',
      natureIntervention: 'preventive',
      fuelType: 'diesel',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      vehicleMakeModel: 'Toyota Hilux Double Cabine 4x4',
      vehicleCategory: 'VU',
      odometerOutKm: 142300,
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      driverPhone: '+213770456789',
      type: 'vidange_moteur',
      title: 'Vidange urgente dépassée (+2 300 km) & révision injecteurs D-4D',
      description: 'Alerte rouge critique de dépassement kilométrique sur odomètre (142 300 km vs 140 000 km prévus). Remplacement immédiat huile moteur, filtre gasoil avec séparateur d\'eau, contrôle circuit injection haute pression.',
      urgency: 'urgent',
      garageType: 'atelier_interne',
      garageName: 'Atelier Central Flotte & Mécanique (Alger)',
      dateSortieIntervention: '2026-11-24T08:00',
      estimatedDurationDays: 1,
      requestedBy: 'Karim Ziani (Gestionnaire de Flotte)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-11-23',
      officialSealDI: true,
      status: 'demande_emise',
      createdAt: '2026-11-23T16:00:00Z',
    }
  ];

  private fuelLogs: FuelLog[] = [
    {
      id: 'fl-1',
      vehicleId: 'v-1',
      vehiclePlate: '04512-118-16',
      driverId: 'd-1',
      driverName: 'Karim Belkacem',
      amountDZD: 7200,
      liters: 48,
      pricePerLiterDZD: 45.62,
      date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      odometerKm: 87450,
      stationName: 'Naftal El Mouradia',
      city: 'Alger',
      status: 'pending',
      source: 'pwa_manual',
      notes: 'Plein saisi via terminal PWA Chauffeur (En attente de validation gestionnaire)',
      gpsCoordinates: { latitude: 36.7412, longitude: 3.0515, accuracy: 12, wilaya: '16 - Alger' },
      isOverconsumption: false,
      calculatedConsumption: 7.4,
    },
    {
      id: 'fl-2',
      vehicleId: 'v-2',
      vehiclePlate: '12890-120-16',
      driverId: 'd-2',
      driverName: 'Youcef Amrani',
      amountDZD: 2900,
      liters: 45,
      pricePerLiterDZD: 29.01,
      date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      odometerKm: 64180,
      stationName: 'Naftal Rocade Sud Chéraga',
      city: 'Alger',
      status: 'verified',
      source: 'pwa_scan',
      notes: 'Ticket de carburant Naftal numérisé via OCR souverain local PWA',
      gpsCoordinates: { latitude: 36.7645, longitude: 2.9528, accuracy: 15, wilaya: '16 - Alger' },
      isOverconsumption: false,
      calculatedConsumption: 5.3,
    },
    {
      id: 'fl-3',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      amountDZD: 4500,
      liters: 70,
      pricePerLiterDZD: 29.01,
      date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      odometerKm: 141950,
      stationName: 'Naftal Es Senia',
      city: 'Oran',
      status: 'pending',
      source: 'pwa_manual',
      notes: 'Gasoil plein trajet Oran-Mostaganem saisi via PWA (Surconsommation à valider)',
      gpsCoordinates: { latitude: 35.6512, longitude: -0.6214, accuracy: 10, wilaya: '31 - Oran' },
      isOverconsumption: true,
      calculatedConsumption: 12.8, // Constructeur 9.4 -> surconsommation anormale détectée!
    },
    {
      id: 'fl-4',
      vehicleId: 'v-5',
      vehiclePlate: '01923-122-16',
      driverId: 'd-5',
      driverName: 'Reda Khelil',
      amountDZD: 3200,
      liters: 49,
      pricePerLiterDZD: 29.01,
      date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      odometerKm: 38720,
      stationName: 'Naftal Bab Ezzouar',
      city: 'Alger',
      status: 'verified',
      source: 'pwa_scan',
      notes: 'Ticket analysé par reconnaissance souveraine embarquée',
      isOverconsumption: false,
      calculatedConsumption: 5.9,
    }
  ];

  private maintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'mr-1',
      vehicleId: 'v-1',
      vehiclePlate: '04512-118-16',
      type: 'vidange',
      costDZD: 9500,
      odometerKm: 80000,
      date: '2026-07-15',
      garageName: 'Auto Service Bab Ezzouar',
      notes: 'Vidange huile Total 10W40 + remplacement filtre à huile, air et habitacle.',
      status: 'completed',
    },
    {
      id: 'mr-2',
      vehicleId: 'v-2',
      vehiclePlate: '12890-120-16',
      type: 'plaquettes_freins',
      costDZD: 14000,
      odometerKm: 60000,
      date: '2026-06-10',
      garageName: 'Peugeot Express El Biar',
      notes: 'Changement plaquettes de freins avant et vérification liquide DOT4.',
      status: 'completed',
    },
    {
      id: 'mr-3',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      type: 'vidange',
      costDZD: 16500,
      odometerKm: 130000,
      date: '2026-05-20',
      garageName: 'Garage Atlas Oran',
      notes: 'Vidange 15W40 Naftal + filtres diesel renforcés.',
      status: 'completed',
    }
  ];

  private accidentClaims: AccidentClaim[] = [
    {
      id: 'acc-1',
      claimNumber: 'SIN-2026-0042',
      vehicleId: 'v-4',
      vehiclePlate: '08761-121-09',
      driverId: 'd-4',
      driverName: 'Sofiane Mansouri',
      driverPhone: '+213555987654',
      date: '2026-09-18',
      time: '14:35',
      location: 'Rond-point Kouba, Alger',
      description: 'Accrochage avec un camion léger au cédez-le-passage. Aile avant droite froissée et phare droit fêlé. Aucun blessé.',
      severity: 'moderate',
      photos: [
        'https://images.unsplash.com/photo-1543465077-db45d34b88a5?auto=format&fit=crop&w=600&q=80',
      ],
      thirdPartyInfo: {
        involved: true,
        name: 'Mourad Ziani',
        phone: '+213551223344',
        insuranceCompany: 'SAA Assurances Alger',
        plateNumber: '15430-117-16',
      },
      policeReportFiled: true,
      status: 'expert_review',
      insuranceTransmitted: true,
      insuranceTransmittedTo: 'SAA',
      estimatedCostDZD: 85000,
      aiDamageAssessment: 'Évaluation IA : Dégâts carrosserie superficiels à moyens (aile AVD, bloc optique). Châssis intact, véhicule roulant.',
      gpsCoordinates: { latitude: 36.7289, longitude: 3.0845, accuracy: 14, wilaya: '16 - Alger' },
    }
  ];

  private alerts: FleetAlert[] = [
    {
      id: 'alt-1',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      type: 'vidange_overdue',
      severity: 'high',
      title: 'Vidange urgente dépassée (+2 300 km)',
      message: 'Le Toyota Hilux (00341-319-31) a atteint 142 300 km. La vidange programmée à 140 000 km est en retard.',
      dueDate: 'Immédiat',
      date: '2026-09-19',
      actionRequired: 'Prendre rendez-vous atelier vidange et notifier le chauffeur.',
      resolved: false,
    },
    {
      id: 'alt-2',
      vehicleId: 'v-2',
      vehiclePlate: '12890-120-16',
      type: 'controle_technique',
      severity: 'medium',
      title: 'Contrôle Technique arrive à échéance',
      message: 'Le contrôle technique de la Peugeot 208 expire le 28 septembre 2026 (dans 9 jours).',
      dueDate: '2026-09-28',
      date: '2026-09-19',
      actionRequired: 'Fixer créneau chez un centre de contrôle agréé à Alger.',
      resolved: false,
    },
    {
      id: 'alt-3',
      vehicleId: 'v-4',
      vehiclePlate: '08761-121-09',
      type: 'accident_pending',
      severity: 'high',
      title: 'Dossier Sinistre en attente d\'expertise',
      message: 'Sinistre #SIN-2026-0042 ouvert par Sofiane Mansouri. Constat amiable et photos transmises à la CAAT/SAA.',
      dueDate: '2026-09-22',
      date: '2026-09-18',
      actionRequired: 'Relancer l\'expert d\'assurance pour chiffrage réparations.',
      resolved: false,
    },
    {
      id: 'alt-4',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      type: 'surconsommation',
      severity: 'high',
      title: 'Surconsommation anormale de carburant (+36%)',
      message: 'Consommation calculée à 12.8 L/100km pour le Toyota Hilux contre 9.4 L/100km attendus constructeur.',
      dueDate: 'À vérifier',
      date: '2026-10-02',
      actionRequired: 'Contrôler filtre à gasoil, pression des pneus et vérifier l\'absence de fuite.',
      resolved: false,
    },
    {
      id: 'alt-5',
      vehicleId: 'd-4',
      vehiclePlate: '08761-121-09',
      type: 'visite_medicale',
      severity: 'high',
      title: 'Visite médicale professionnelle expirée',
      message: 'La visite médicale obligatoire du chauffeur Sofiane Mansouri a expiré le 10 septembre 2026.',
      dueDate: 'Immédiat',
      date: '2026-09-11',
      actionRequired: 'Programmer une visite médicale auprès du médecin du travail agréé avant reprise de mission.',
      resolved: false,
    }
  ];

  private activityLogs: SovereignActivityLog[] = [
    {
      id: 'act-1',
      driverPhone: '+213550123456',
      driverName: 'Karim Belkacem',
      vehiclePlate: '04512-118-16',
      channel: 'pwa_online',
      type: 'fuel',
      title: 'Plein Carburant Naftal Validé',
      details: 'Plein de 7 200 DA (48 L Sans Plomb) enregistré à Naftal El Mouradia (Wilaya 16).',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gpsCoordinates: { latitude: 36.7412, longitude: 3.0515, accuracy: 12, wilaya: '16 - Alger' },
      status: 'validated'
    },
    {
      id: 'act-2',
      driverPhone: '+213550123456',
      driverName: 'Karim Belkacem',
      vehiclePlate: '04512-118-16',
      channel: 'pwa_online',
      type: 'odometer',
      title: 'Relevé Odomètre Quotidien',
      details: 'Compteur certifié à 87 450 km. Prochaine révision programmée à 90 000 km.',
      timestamp: new Date(Date.now() - 1000 * 60 * 176).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gpsCoordinates: { latitude: 36.7412, longitude: 3.0515, accuracy: 12, wilaya: '16 - Alger' },
      status: 'synced'
    },
    {
      id: 'act-3',
      driverPhone: '+213661789012',
      driverName: 'Youcef Amrani',
      vehiclePlate: '12890-120-16',
      channel: 'pwa_offline',
      type: 'fuel',
      title: 'Scan Reçu Naftal (Synchro Hors-Ligne)',
      details: 'Numérisation ticket Rocade Sud Chéraga : 2 900 DA (45 L Gasoil) synchronisé post-reconnexion.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gpsCoordinates: { latitude: 36.7645, longitude: 2.9528, accuracy: 15, wilaya: '16 - Alger' },
      status: 'validated'
    },
    {
      id: 'act-4',
      driverPhone: '+213770456789',
      driverName: 'Ahmed Benali',
      vehiclePlate: '00341-319-31',
      channel: 'pwa_online',
      type: 'mission',
      title: 'Prise en Charge Ordre de Mission',
      details: 'Ordre de mission OM-2026-0891 (Alger -> Hassi Messaoud) activé sur le terminal PWA.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'synced'
    }
  ];

  // ===================== VEHICLES CRUD =====================

  getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  getVehicleByPlate(plate: string): Vehicle | undefined {
    return this.vehicles.find(v => v.plate === plate);
  }

  getVehicleByPhone(phone: string): Vehicle | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    const last9 = clean.slice(-9);
    const driver = this.drivers.find(d => {
      const dClean = d.phone.replace(/[^0-9]/g, '');
      return dClean.slice(-9) === last9;
    });
    if (driver) {
      const v = this.vehicles.find(v => v.plate === driver.assignedVehiclePlate);
      if (v) return v;
    }
    return this.vehicles[0];
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
    const ptac = vehicle.ptacKg || (vehicle.vehicleCategory === 'PL' ? 19000 : vehicle.vehicleCategory === 'SM' ? 26000 : 2000);
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v-${Date.now()}`,
      vehicleCategory: vehicle.vehicleCategory || 'VP',
      operationalMissionStatus: vehicle.operationalMissionStatus || 'reserve_depot',
      engineDisplacement: vehicle.engineDisplacement || '1.6L',
      engineCylinders: vehicle.engineCylinders || 4,
      transmissionType: vehicle.transmissionType || 'Manuelle',
      transmissionGears: vehicle.transmissionGears || 5,
      drivetrain: vehicle.drivetrain || '4x2',
      acquisitionCostDZD: vehicle.acquisitionCostDZD || 2500000,
      totalMaintenanceCostDZD: vehicle.totalMaintenanceCostDZD || 0,
      lastTireChangeKm: vehicle.lastTireChangeKm || 0,
      tireLifespanKm: vehicle.tireLifespanKm || 50000,
      tireWearPercentage: vehicle.tireWearPercentage !== undefined ? vehicle.tireWearPercentage : 20,
      registrationDocUrl: vehicle.registrationDocUrl || generateSampleCarteGrise(
        vehicle.plate,
        vehicle.make,
        vehicle.model,
        vehicle.chassisNumber || 'VF1DZFLEET2026',
        vehicle.vehicleCategory || 'VP',
        ptac,
        vehicle.ptraKg,
        vehicle.enginePowerHP
      ),
      tires: vehicle.tires || {
        frontLeft: 95,
        frontRight: 95,
        rearLeft: 95,
        rearRight: 95,
        lastInspectionDate: new Date().toISOString().split('T')[0],
        notes: 'Pneumatiques neufs vérifiés.',
      }
    };
    this.vehicles.unshift(newVehicle);
    return newVehicle;
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | undefined {
    const v = this.vehicles.find(veh => veh.id === id);
    if (!v) return undefined;
    Object.assign(v, updates);
    return v;
  }

  deleteVehicle(id: string): boolean {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.vehicles.splice(index, 1);
    return true;
  }

  updateVehicleMileage(plate: string, mileage: number): boolean {
    const v = this.vehicles.find(veh => veh.plate === plate);
    if (!v) return false;
    v.mileage = mileage;

    // Check if vidange is overdue
    if (v.mileage >= v.nextServiceKm) {
      const existingAlert = this.alerts.find(a => a.vehiclePlate === v.plate && a.type === 'vidange_overdue' && !a.resolved);
      if (!existingAlert) {
        this.alerts.unshift({
          id: `alt-${Date.now()}`,
          vehicleId: v.id,
          vehiclePlate: v.plate,
          type: 'vidange_overdue',
          severity: 'high',
          title: `Vidange nécessaire (${v.plate})`,
          message: `Le compteur du véhicule (${v.mileage.toLocaleString()} km) a atteint ou dépassé le seuil de vidange prévu (${v.nextServiceKm.toLocaleString()} km).`,
          dueDate: 'Immédiat',
          date: new Date().toISOString().split('T')[0],
          actionRequired: 'Planifier la vidange Naftal et remplacement des filtres.',
          resolved: false,
        });
      }
    }
    return true;
  }

  // ===================== DRIVERS CRUD =====================

  getDrivers(): Driver[] {
    return this.drivers;
  }

  getDriverById(id: string): Driver | undefined {
    return this.drivers.find(d => d.id === id);
  }

  getDriverByPhone(phone: string): Driver | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    const last9 = clean.slice(-9);
    return this.drivers.find(d => {
      const dClean = d.phone.replace(/[^0-9]/g, '');
      return dClean.slice(-9) === last9;
    });
  }

  addDriver(driver: Omit<Driver, 'id'>): Driver {
    const comments = driver.comments || (driver.managerNotes ? [{
      id: `cmt-${Date.now()}`,
      text: driver.managerNotes,
      date: new Date().toISOString(),
      author: 'Karim Ziani (Exploitation)',
      authorRole: 'fleet_manager',
    }] : []);

    const newDriver: Driver = {
      ...driver,
      id: `d-${Date.now()}`,
      comments,
    };
    this.drivers.unshift(newDriver);
    return newDriver;
  }

  updateDriver(id: string, updates: Partial<Driver> & { newCommentText?: string; commentAuthor?: string; commentAuthorRole?: string }): Driver | undefined {
    const d = this.drivers.find(drv => drv.id === id);
    if (!d) return undefined;

    if (!d.comments) d.comments = [];

    // Si un nouveau commentaire est transmis, on l'archive avec date et heure précises
    if (updates.newCommentText && updates.newCommentText.trim()) {
      const newComment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: updates.newCommentText.trim(),
        date: new Date().toISOString(),
        author: updates.commentAuthor || 'Karim Ziani (Exploitation)',
        authorRole: updates.commentAuthorRole || 'fleet_manager',
      };
      d.comments.unshift(newComment);
      d.managerNotes = newComment.text;
      delete updates.newCommentText;
      delete updates.commentAuthor;
      delete updates.commentAuthorRole;
    } else if (updates.managerNotes && updates.managerNotes.trim() && updates.managerNotes !== d.managerNotes) {
      // Si le champ managerNotes est directement mis à jour avec un texte nouveau, on l'archive aussi automatiquement
      const exists = d.comments.some(c => c.text === updates.managerNotes?.trim());
      if (!exists) {
        d.comments.unshift({
          id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: updates.managerNotes.trim(),
          date: new Date().toISOString(),
          author: updates.commentAuthor || 'Karim Ziani (Exploitation)',
          authorRole: updates.commentAuthorRole || 'fleet_manager',
        });
      }
    }

    Object.assign(d, updates);
    return d;
  }

  addDriverComment(driverId: string, comment: { text: string; author?: string; authorRole?: string; date?: string }) {
    const driver = this.drivers.find(d => d.id === driverId);
    if (!driver) return undefined;
    if (!driver.comments) driver.comments = [];
    const newComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: comment.text.trim(),
      date: comment.date || new Date().toISOString(),
      author: comment.author || 'Karim Ziani (Exploitation)',
      authorRole: comment.authorRole || 'fleet_manager',
    };
    driver.comments.unshift(newComment);
    driver.managerNotes = newComment.text;
    return newComment;
  }

  deleteDriver(id: string): boolean {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.drivers.splice(index, 1);
    return true;
  }

  // ===================== MISSIONS CRUD =====================

  getMissions(): MissionOrder[] {
    return this.missions;
  }

  getMissionById(id: string): MissionOrder | undefined {
    return this.missions.find(m => m.id === id);
  }

  addMission(mission: Omit<MissionOrder, 'id' | 'orderNumber' | 'createdAt'>): MissionOrder {
    const count = this.missions.length + 1;
    const year = new Date().getFullYear();
    const orderNumber = `OM-${year}-${String(count).padStart(4, '0')}`;
    const newMission: MissionOrder = {
      ...mission,
      id: `om-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    this.missions.unshift(newMission);

    // Update driver status if in_progress or approved
    if (newMission.status === 'in_progress') {
      const driver = this.drivers.find(d => d.id === newMission.driverId);
      if (driver) driver.status = 'on_mission';
    }

    return newMission;
  }

  updateMission(id: string, updates: Partial<MissionOrder>): MissionOrder | undefined {
    const m = this.missions.find(mis => mis.id === id);
    if (!m) return undefined;
    Object.assign(m, updates);

    // Sync driver status if mission status changes
    if (updates.status === 'completed' || updates.status === 'cancelled') {
      const driver = this.drivers.find(d => d.id === m.driverId);
      if (driver && driver.status === 'on_mission') {
        driver.status = 'available';
      }
    } else if (updates.status === 'in_progress') {
      const driver = this.drivers.find(d => d.id === m.driverId);
      if (driver) driver.status = 'on_mission';
    }

    return m;
  }

  deleteMission(id: string): boolean {
    const index = this.missions.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.missions.splice(index, 1);
    return true;
  }

  // ===================== INTERVENTIONS & DOCUMENTS (DI & FR) =====================

  getInterventions(): VehicleIntervention[] {
    return this.interventions;
  }

  getInterventionsByVehicle(vehiclePlate: string): VehicleIntervention[] {
    return this.interventions.filter(i => i.vehiclePlate === vehiclePlate);
  }

  getInterventionById(id: string): VehicleIntervention | undefined {
    return this.interventions.find(i => i.id === id);
  }

  addIntervention(data: Omit<VehicleIntervention, 'id' | 'interventionOrderNumber' | 'createdAt'>): VehicleIntervention {
    const count = this.interventions.length + 80;
    const year = new Date().getFullYear();
    const orderNumber = `DI-${year}-${String(count + 1).padStart(4, '0')}`;

    const veh = this.vehicles.find(v => v.id === data.vehicleId || v.plate === data.vehiclePlate);
    const natureIntervention = data.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(data.type) ? 'preventive' : 'curative');
    const fuelType = data.fuelType || (veh ? veh.fuelType : 'diesel');

    const newItv: VehicleIntervention = {
      ...data,
      id: `itv-${Date.now()}`,
      interventionOrderNumber: orderNumber,
      natureIntervention,
      fuelType,
      status: 'demande_emise',
      officialSealDI: true,
      createdAt: new Date().toISOString(),
    };

    // Si urgence critique / immobilisante, basculer le véhicule en atelier
    if (veh && newItv.urgency === 'critique') {
      veh.operationalMissionStatus = 'maintenance';
      veh.status = 'maintenance';
    }

    // Journal d'audit souverain
    this.addActivityLog({
      channel: 'internal_system',
      type: 'mission',
      title: `Demande d'Intervention émise (${orderNumber})`,
      details: `Véhicule ${newItv.vehiclePlate} — ${newItv.title} assigné à ${newItv.garageName}.`,
      timestamp: new Date().toISOString(),
      status: 'validated',
      driverName: newItv.requestedBy,
      vehiclePlate: newItv.vehiclePlate
    });

    this.interventions.unshift(newItv);
    return newItv;
  }

  updateIntervention(id: string, updates: Partial<VehicleIntervention>): VehicleIntervention | undefined {
    const itv = this.interventions.find(i => i.id === id);
    if (!itv) return undefined;
    Object.assign(itv, updates);
    return itv;
  }

  takeInChargeIntervention(id: string, maintenanceLeadName: string): VehicleIntervention | undefined {
    const itv = this.interventions.find(i => i.id === id);
    if (!itv) return undefined;
    itv.status = 'en_cours_atelier';

    const veh = this.vehicles.find(v => v.id === itv.vehicleId || v.plate === itv.vehiclePlate);
    if (veh) {
      veh.operationalMissionStatus = 'maintenance';
      veh.status = 'maintenance';
    }

    this.addActivityLog({
      channel: 'internal_system',
      type: 'mission',
      title: `Prise en Charge Atelier (${itv.interventionOrderNumber})`,
      details: `Véhicule ${itv.vehiclePlate} pris en charge par ${maintenanceLeadName} pour travaux.`,
      timestamp: new Date().toISOString(),
      status: 'validated',
      driverName: maintenanceLeadName,
      vehiclePlate: itv.vehiclePlate
    });

    return itv;
  }

  receptionIntervention(id: string, receptionData: {
    dateRetourIntervention: string;
    odometerInKm: number;
    coutInterventionDZD: number;
    workDoneDetails: string;
    partsReplaced?: string[];
    qualityChecks?: any;
    receptionDecision: 'conforme_bon_service' | 'avec_reserves';
    receptionNotes?: string;
    receivedBy: string;
    receivedByRole?: 'maintenance_lead' | 'super_admin';
  }): VehicleIntervention | undefined {
    const itv = this.interventions.find(i => i.id === id);
    if (!itv) return undefined;

    const year = new Date().getFullYear();
    const frCount = this.interventions.filter(i => i.receptionSheetNumber).length + 80;
    const frNum = `FR-${year}-${String(frCount + 1).padStart(4, '0')}`;

    itv.receptionSheetNumber = frNum;
    itv.dateRetourIntervention = receptionData.dateRetourIntervention || new Date().toISOString();
    itv.odometerInKm = Number(receptionData.odometerInKm) || itv.odometerOutKm;
    itv.coutInterventionDZD = Number(receptionData.coutInterventionDZD) || 0;
    itv.workDoneDetails = receptionData.workDoneDetails;
    itv.partsReplaced = receptionData.partsReplaced || [];
    itv.qualityChecks = receptionData.qualityChecks || {
      brakingTested: true,
      fluidLevelsChecked: true,
      tiresInspected: true,
      dashboardWarningsOff: true,
      roadTested: true,
    };
    itv.receptionDecision = receptionData.receptionDecision;
    itv.receptionNotes = receptionData.receptionNotes;
    itv.receivedBy = receptionData.receivedBy;
    itv.receivedByRole = receptionData.receivedByRole || 'maintenance_lead';
    itv.receptionDate = new Date().toISOString().split('T')[0];
    itv.officialSealFR = true;
    itv.status = 'cloturee_receptionnee';

    // Réintégration du véhicule au parc si conforme
    const veh = this.vehicles.find(v => v.id === itv.vehicleId || v.plate === itv.vehiclePlate);
    if (veh) {
      // 2. Coût d'entretien cumulé mis à jour après chaque intervention
      veh.totalMaintenanceCostDZD = (veh.totalMaintenanceCostDZD || 0) + itv.coutInterventionDZD;

      if (itv.receptionDecision === 'conforme_bon_service') {
        veh.operationalMissionStatus = 'reserve_depot';
        veh.status = 'active';
        if (itv.odometerInKm && itv.odometerInKm > veh.mileage) {
          veh.mileage = itv.odometerInKm;
        }
        // Si vidange, actualiser échéances
        if (itv.type === 'vidange_moteur') {
          veh.lastServiceKm = veh.mileage;
          veh.nextServiceKm = veh.mileage + 10000;
        }
        // Si pneumatiques, remettre les pneus à neuf
        if (itv.type === 'pneumatiques') {
          veh.lastTireChangeKm = veh.mileage;
          veh.tireWearPercentage = 0;
          if (veh.tires) {
            veh.tires.frontLeft = 98;
            veh.tires.frontRight = 98;
            veh.tires.rearLeft = 98;
            veh.tires.rearRight = 98;
          }
        }
      }
    }

    // Journal d'audit souverain
    this.addActivityLog({
      channel: 'internal_system',
      type: 'mission',
      title: `Fiche de Réception établie (${frNum})`,
      details: `Véhicule ${itv.vehiclePlate} réceptionné (${itv.coutInterventionDZD.toLocaleString('fr-DZ')} DA). Réintégration au parc validée.`,
      timestamp: new Date().toISOString(),
      status: 'validated',
      driverName: itv.receivedBy,
      vehiclePlate: itv.vehiclePlate
    });

    return itv;
  }

  // ===================== FUEL LOGS & OVERCONSUMPTION =====================

  getFuelLogs(): FuelLog[] {
    return this.fuelLogs;
  }

  addFuelLog(log: Omit<FuelLog, 'id'>): FuelLog {
    const vehicle = this.vehicles.find(v => v.plate === log.vehiclePlate);
    let isOverconsumption = false;
    let calculatedConsumption = 0;

    // Calculate consumption if previous odometer exists
    if (log.odometerKm && vehicle) {
      const previousLog = this.fuelLogs
        .filter(l => l.vehiclePlate === log.vehiclePlate && l.odometerKm && l.odometerKm < log.odometerKm!)
        .sort((a, b) => (b.odometerKm || 0) - (a.odometerKm || 0))[0];

      if (previousLog && previousLog.odometerKm) {
        const distance = log.odometerKm - previousLog.odometerKm;
        if (distance > 50) {
          calculatedConsumption = parseFloat(((log.liters / distance) * 100).toFixed(1));
          // If > 25% above mixed average
          if (vehicle.averageConsumption && calculatedConsumption > (vehicle.averageConsumption * 1.25)) {
            isOverconsumption = true;

            // Automatically trigger surconsommation alert
            this.alerts.unshift({
              id: `alt-${Date.now()}`,
              vehicleId: vehicle.id,
              vehiclePlate: vehicle.plate,
              type: 'surconsommation',
              severity: 'high',
              title: `Surconsommation anormale (${calculatedConsumption} L/100km)`,
              message: `Le véhicule ${vehicle.plate} (${vehicle.make} ${vehicle.model}) présente une consommation de ${calculatedConsumption} L/100km (+${Math.round(((calculatedConsumption - vehicle.averageConsumption) / vehicle.averageConsumption) * 100)}% par rapport aux ${vehicle.averageConsumption} L/100km constructeur).`,
              dueDate: 'Sous 48h',
              date: new Date().toISOString().split('T')[0],
              actionRequired: 'Contrôler le véhicule en atelier (pression pneus, injecteurs, fuite) et auditer le trajet.',
              resolved: false,
            });
          }
        }
      }
    }

    const newLog: FuelLog = {
      ...log,
      id: `fl-${Date.now()}`,
      status: log.status || 'pending',
      isOverconsumption: isOverconsumption || log.isOverconsumption,
      calculatedConsumption: calculatedConsumption || log.calculatedConsumption,
    };
    this.fuelLogs.unshift(newLog);

    // Update vehicle mileage if provided
    if (newLog.odometerKm && vehicle && newLog.odometerKm > vehicle.mileage) {
      vehicle.mileage = newLog.odometerKm;
    }

    return newLog;
  }

  updateAccidentClaim(id: string, updates: Partial<AccidentClaim>): AccidentClaim | undefined {
    const claim = this.accidentClaims.find(c => c.id === id);
    if (!claim) return undefined;
    Object.assign(claim, updates);
    return claim;
  }

  updateFuelLog(id: string, updates: Partial<FuelLog>): FuelLog | undefined {
    const log = this.fuelLogs.find(l => l.id === id);
    if (!log) return undefined;
    Object.assign(log, updates);
    return log;
  }

  // ===================== MAINTENANCE & ACCIDENTS =====================

  getMaintenanceRecords(): MaintenanceRecord[] {
    return this.maintenanceRecords;
  }

  addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `mr-${Date.now()}`,
    };
    this.maintenanceRecords.unshift(newRecord);
    
    // Update vehicle next service
    const v = this.vehicles.find(veh => veh.plate === newRecord.vehiclePlate);
    if (v && newRecord.type === 'vidange') {
      v.lastServiceKm = newRecord.odometerKm;
      v.nextServiceKm = newRecord.odometerKm + 10000;
      // Mark any vidange overdue alert as resolved
      this.alerts.forEach(a => {
        if (a.vehiclePlate === v.plate && a.type === 'vidange_overdue') {
          a.resolved = true;
        }
      });
    }
    return newRecord;
  }

  getAccidentClaims(): AccidentClaim[] {
    return this.accidentClaims;
  }

  addAccidentClaim(claim: Omit<AccidentClaim, 'id' | 'claimNumber'>): AccidentClaim {
    const count = this.accidentClaims.length + 1;
    const year = new Date().getFullYear();
    const claimNumber = `SIN-${year}-${String(count).padStart(4, '0')}`;
    const newClaim: AccidentClaim = {
      ...claim,
      id: `acc-${Date.now()}`,
      claimNumber,
    };
    this.accidentClaims.unshift(newClaim);

    // Mark vehicle as in accident status
    const v = this.vehicles.find(veh => veh.plate === newClaim.vehiclePlate);
    if (v) {
      v.status = 'accident';
    }

    // Add alert for manager
    this.alerts.unshift({
      id: `alt-${Date.now()}`,
      vehicleId: newClaim.vehicleId,
      vehiclePlate: newClaim.vehiclePlate,
      type: 'accident_pending',
      severity: 'high',
      title: `Nouveau Sinistre déclaré (${claimNumber})`,
      message: `${newClaim.driverName} a déclaré un accident à ${newClaim.location}. Gravité: ${newClaim.severity}.`,
      date: new Date().toISOString().split('T')[0],
      actionRequired: 'Consulter les photos et ouvrir le dossier d\'assurance.',
      resolved: false,
    });

    return newClaim;
  }

  transmitClaimToInsurance(claimId: string, company: any): boolean {
    const claim = this.accidentClaims.find(c => c.id === claimId);
    if (!claim) return false;
    claim.insuranceTransmitted = true;
    claim.insuranceTransmittedTo = company;
    claim.status = 'insurance_processing';
    return true;
  }

  // ===================== ALERTS & MESSAGES =====================

  getAlerts(): FleetAlert[] {
    return this.alerts;
  }

  resolveAlert(alertId: string): boolean {
    const alt = this.alerts.find(a => a.id === alertId);
    if (!alt) return false;
    alt.resolved = true;
    return true;
  }

  getActivityLogs(): SovereignActivityLog[] {
    return this.activityLogs;
  }

  addActivityLog(log: Omit<SovereignActivityLog, 'id'>): SovereignActivityLog {
    const newLog: SovereignActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.activityLogs.unshift(newLog);
    return newLog;
  }
}

export const fleetDb = new FleetDatabase();
