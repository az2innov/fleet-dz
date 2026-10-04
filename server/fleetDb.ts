import { 
  Vehicle, 
  Driver, 
  FuelLog, 
  MaintenanceRecord, 
  AccidentClaim, 
  FleetAlert, 
  SovereignActivityLog,
  MissionOrder 
} from '../src/types.js';

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
      tires: {
        frontLeft: 88,
        frontRight: 87,
        rearLeft: 90,
        rearRight: 89,
        lastInspectionDate: '2026-07-10',
        notes: 'Pneumatiques renforcés pour pistes sahariennes.',
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
      status: 'verified',
      source: 'pwa_manual',
      notes: 'Plein saisi et validé par le terminal PWA Chauffeur',
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
      status: 'verified',
      source: 'pwa_manual',
      notes: 'Gasoil plein complet trajet Oran-Mostaganem saisi via PWA',
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
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v-${Date.now()}`,
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
    const newDriver: Driver = {
      ...driver,
      id: `d-${Date.now()}`,
    };
    this.drivers.unshift(newDriver);
    return newDriver;
  }

  updateDriver(id: string, updates: Partial<Driver>): Driver | undefined {
    const d = this.drivers.find(drv => drv.id === id);
    if (!d) return undefined;
    Object.assign(d, updates);
    return d;
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
