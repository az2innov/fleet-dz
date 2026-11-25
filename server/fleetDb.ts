import { 
  Tenant,
  Vehicle, 
  Driver, 
  FuelLog, 
  PrepaidFuelCard,
  FuelVoucher,
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

// Générateur de Bon de Ravitaillement Officiel (Délivré par le Gestionnaire de Flotte)
export const generateSampleFuelVoucherSvg = (
  voucherNumber: string,
  date: string,
  plate: string,
  model: string,
  driver: string,
  station: string,
  liters: number,
  amountDZD: number,
  cardNum?: string,
  refuelType: string = 'Dotation Partielle / Appoint'
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 580" width="100%" height="100%">
    <rect width="100%" height="100%" fill="#ffffff" stroke="#047857" stroke-width="5" rx="16"/>
    <rect x="20" y="20" width="760" height="540" fill="none" stroke="#a7f3d0" stroke-width="2" rx="12"/>
    
    <!-- Header -->
    <rect x="25" y="25" width="750" height="90" fill="#ecfdf5" rx="10"/>
    <text x="50" y="55" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#065f46">DZ-FLEET MOBILITY ALGERIA</text>
    <text x="50" y="75" font-family="system-ui, sans-serif" font-size="11" fill="#047857">Direction Centrale des Moyens Généraux &amp; Gestion de Flotte Automobile</text>
    <text x="50" y="93" font-family="system-ui, sans-serif" font-size="10" fill="#6b7280">Système Souverain d'Approvisionnement Carburant — Décret Exécutif N° 04-381</text>
    
    <rect x="520" y="38" width="235" height="64" fill="#047857" rx="8"/>
    <text x="637" y="60" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#a7f3d0" text-anchor="middle">BON DE RAVITAILLEMENT CARBURANT</text>
    <text x="637" y="86" font-family="monospace" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${voucherNumber}</text>

    <!-- Informations Générales -->
    <line x1="50" y1="130" x2="750" y2="130" stroke="#e5e7eb" stroke-width="1.5"/>

    <text x="50" y="160" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Date d'Émission :</text>
    <text x="50" y="180" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111827">${date}</text>

    <text x="280" y="160" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Type de Ravitaillement :</text>
    <text x="280" y="180" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#047857">${refuelType}</text>

    <text x="530" y="160" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Mode de Règlement :</text>
    <text x="530" y="180" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#b45309">Carte Prépayée ${cardNum || 'Déposée en Station'}</text>

    <!-- Détails Véhicule & Chauffeur -->
    <rect x="50" y="205" width="700" height="95" fill="#f8fafc" stroke="#e2e8f0" rx="10"/>
    <text x="70" y="230" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#334155">AFFECTATION DU VÉHICULE &amp; CONDUCTEUR BÉNÉFICIAIRE</text>

    <text x="70" y="258" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">Matricule Officiel :</text>
    <text x="70" y="280" font-family="monospace" font-size="15" font-weight="bold" fill="#0f172a">${plate}</text>

    <text x="280" y="258" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">Marque / Modèle :</text>
    <text x="280" y="280" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">${model}</text>

    <text x="510" y="258" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">Conducteur Titulaire :</text>
    <text x="510" y="280" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">${driver}</text>

    <!-- Dotation & Station Partenaire -->
    <rect x="50" y="315" width="700" height="110" fill="#fffbeb" stroke="#fde68a" rx="10"/>
    <text x="70" y="340" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#92400e">STATION D'ESSENCE &amp; QUANTITÉ AUTORISÉE</text>

    <text x="70" y="370" font-family="system-ui, sans-serif" font-size="11" fill="#78350f">Station Dépositaire Conventionnée :</text>
    <text x="70" y="392" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#1e293b">${station}</text>
    <text x="70" y="410" font-family="system-ui, sans-serif" font-size="10" fill="#6b7280">Carte Prépayée N° : ${cardNum || 'Convention Naftal Flotte'}</text>

    <text x="430" y="370" font-family="system-ui, sans-serif" font-size="11" fill="#78350f">Volume Alloué :</text>
    <text x="430" y="395" font-family="monospace" font-size="18" font-weight="bold" fill="#047857">${liters} Litres</text>

    <text x="580" y="370" font-family="system-ui, sans-serif" font-size="11" fill="#78350f">Budget Prévisionnel :</text>
    <text x="580" y="395" font-family="monospace" font-size="18" font-weight="bold" fill="#b45309">${amountDZD.toLocaleString('fr-DZ')} DA</text>

    <!-- Signatures & Cachet -->
    <rect x="50" y="440" width="340" height="105" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
    <text x="65" y="462" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#475569">VISA &amp; SIGNATURE GESTIONNAIRE DU PARC</text>
    <text x="65" y="482" font-family="system-ui, sans-serif" font-size="11" fill="#1e293b">Émis par : Karim Ziani (Exploitation Flotte)</text>
    <circle cx="310" cy="495" r="28" fill="#ecfdf5" stroke="#047857" stroke-width="2"/>
    <text x="310" y="492" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#047857" text-anchor="middle">GESTION</text>
    <text x="310" y="504" font-family="system-ui, sans-serif" font-size="7" fill="#047857" text-anchor="middle">PARC AUTO</text>

    <rect x="410" y="440" width="340" height="105" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
    <text x="425" y="462" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#475569">CACHET STATION D'ESSENCE APRÈS RAVITAILLEMENT</text>
    <text x="425" y="482" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">À remplir par le pompiste lors de la délivrance du reçu.</text>
    <text x="425" y="500" font-family="monospace" font-size="10" fill="#0369a1">Relevé Odomètre obligatoire à la pompe</text>
    <text x="425" y="520" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">Document certifié pour le contrôle de gestion.</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
};

// Générateur de Reçu de Caisse Numérisé de la Station d'Essence Naftal
export const generateSampleStationReceipt = (
  receiptNumber: string,
  date: string,
  station: string,
  plate: string,
  driver: string,
  liters: number,
  amountDZD: number,
  odometerKm: number
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <rect width="100%" height="100%" fill="#fffdfa" stroke="#d1d5db" stroke-width="2" rx="10"/>
    <line x1="20" y1="20" x2="480" y2="20" stroke="#f59e0b" stroke-width="6"/>

    <!-- Header Naftal -->
    <text x="250" y="55" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#d97706" text-anchor="middle">NAFTAL SPA 🇩🇿</text>
    <text x="250" y="75" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#4b5563" text-anchor="middle">BRANCHE COMMERCIALISATION CARBURANTS</text>
    <text x="250" y="95" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#111827" text-anchor="middle">${station}</text>
    
    <line x1="40" y1="110" x2="460" y2="110" stroke="#e5e7eb" stroke-dasharray="4,4"/>

    <!-- Ticket Details -->
    <text x="50" y="135" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">REÇU DE CARBURANT / TICKET STATION :</text>
    <text x="450" y="135" font-family="monospace" font-size="12" font-weight="bold" fill="#111827" text-anchor="end">${receiptNumber}</text>

    <text x="50" y="160" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Date &amp; Heure du service :</text>
    <text x="450" y="160" font-family="monospace" font-size="11" font-weight="bold" fill="#111827" text-anchor="end">${date.replace('T', ' ').substring(0, 16)}</text>

    <text x="50" y="185" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Mode de Paiement :</text>
    <text x="450" y="185" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#047857" text-anchor="end">Carte Prépayée Entreprise</text>

    <line x1="40" y1="205" x2="460" y2="205" stroke="#e5e7eb" stroke-dasharray="4,4"/>

    <!-- Véhicule & Kilométrage -->
    <rect x="40" y="220" width="420" height="90" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
    <text x="55" y="245" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">Véhicule Servi (Matricule) :</text>
    <text x="445" y="245" font-family="monospace" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="end">${plate}</text>

    <text x="55" y="270" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">Chauffeur :</text>
    <text x="445" y="270" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">${driver}</text>

    <text x="55" y="295" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0369a1">Odomètre Relevé (Compteur) :</text>
    <text x="445" y="295" font-family="monospace" font-size="14" font-weight="bold" fill="#0369a1" text-anchor="end">${odometerKm.toLocaleString('fr-DZ')} KM</text>

    <line x1="40" y1="325" x2="460" y2="325" stroke="#e5e7eb" stroke-dasharray="4,4"/>

    <!-- Pompe & Prix -->
    <text x="50" y="355" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Volume Réel Délivré :</text>
    <text x="450" y="355" font-family="monospace" font-size="18" font-weight="bold" fill="#047857" text-anchor="end">${liters} Litres</text>

    <text x="50" y="385" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Prix Unitaire Officiel :</text>
    <text x="450" y="385" font-family="monospace" font-size="12" fill="#374151" text-anchor="end">${(amountDZD / liters).toFixed(2)} DA / L</text>

    <rect x="40" y="410" width="420" height="60" fill="#ecfdf5" stroke="#a7f3d0" rx="8"/>
    <text x="60" y="445" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#065f46">TOTAL DÉBITÉ CARTE :</text>
    <text x="440" y="448" font-family="monospace" font-size="22" font-weight="black" fill="#047857" text-anchor="end">${amountDZD.toLocaleString('fr-DZ')} DA</text>

    <!-- Code Barre & Certification -->
    <rect x="80" y="500" width="340" height="50" fill="#ffffff" stroke="#e5e7eb"/>
    <line x1="90" y1="505" x2="90" y2="545" stroke="#000000" stroke-width="3"/>
    <line x1="100" y1="505" x2="100" y2="545" stroke="#000000" stroke-width="1.5"/>
    <line x1="110" y1="505" x2="110" y2="545" stroke="#000000" stroke-width="4"/>
    <line x1="125" y1="505" x2="125" y2="545" stroke="#000000" stroke-width="2"/>
    <line x1="135" y1="505" x2="135" y2="545" stroke="#000000" stroke-width="3"/>
    <line x1="150" y1="505" x2="150" y2="545" stroke="#000000" stroke-width="1.5"/>
    <line x1="160" y1="505" x2="160" y2="545" stroke="#000000" stroke-width="4"/>
    <line x1="180" y1="505" x2="180" y2="545" stroke="#000000" stroke-width="2"/>
    <line x1="200" y1="505" x2="200" y2="545" stroke="#000000" stroke-width="3"/>
    <line x1="215" y1="505" x2="215" y2="545" stroke="#000000" stroke-width="1.5"/>
    <line x1="230" y1="505" x2="230" y2="545" stroke="#000000" stroke-width="3"/>
    <line x1="250" y1="505" x2="250" y2="545" stroke="#000000" stroke-width="4"/>
    <line x1="270" y1="505" x2="270" y2="545" stroke="#000000" stroke-width="2"/>
    <line x1="290" y1="505" x2="290" y2="545" stroke="#000000" stroke-width="1.5"/>
    <line x1="310" y1="505" x2="310" y2="545" stroke="#000000" stroke-width="4"/>
    <line x1="330" y1="505" x2="330" y2="545" stroke="#000000" stroke-width="3"/>
    <line x1="350" y1="505" x2="350" y2="545" stroke="#000000" stroke-width="2"/>
    <line x1="370" y1="505" x2="370" y2="545" stroke="#000000" stroke-width="3"/>
    <line x1="390" y1="505" x2="390" y2="545" stroke="#000000" stroke-width="4"/>
    <line x1="410" y1="505" x2="410" y2="545" stroke="#000000" stroke-width="2"/>

    <text x="250" y="575" font-family="monospace" font-size="11" fill="#6b7280" text-anchor="middle">* NAFTAL-POS-${receiptNumber} *</text>

    <!-- Stamp -->
    <circle cx="250" cy="635" r="30" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="3,3"/>
    <text x="250" y="632" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#d97706" text-anchor="middle">NAFTAL REÇU</text>
    <text x="250" y="644" font-family="system-ui, sans-serif" font-size="7" fill="#d97706" text-anchor="middle">CARTE PAYÉE</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
};

export class FleetDatabase {

  private tenants: Tenant[] = [
    {
      id: 'tenant-sonatrach',
      name: 'Sonatrach - DP Hassi Messaoud',
      slug: 'sonatrach',
      companyType: 'Énergie & Hydrocarbures',
      wilaya: '30 - Ouargla (Base Irara, Hassi Messaoud)',
      nif: '000016001298453',
      nis: '000016001298453001',
      rc: '16/00-0128945B01',
      address: 'Zone Industrielle Irara, BP 50, Hassi Messaoud, Ouargla',
      phone: '+213 29 73 80 00',
      email: 'contact@sonatrach-dz.com',
      brandColor: '#059669',
      plan: 'sovereign_on_premise',
      status: 'active',
      createdAt: '2024-01-15T08:00:00Z',
    },
    {
      id: 'tenant-cevital',
      name: 'Cevital Agro-Industrie',
      slug: 'cevital',
      companyType: 'Agro-Industrie & Chaîne du Froid',
      wilaya: '06 - Béjaïa (Nouveau Quai Portuaire)',
      nif: '099806019234812',
      nis: '099806019234812001',
      rc: '06/00-0982341A02',
      address: 'Nouveau Quai Portuaire, BP 153, 06000 Béjaïa',
      phone: '+213 34 21 11 00',
      email: 'flotte@cevital-dz.com',
      brandColor: '#d97706',
      plan: 'enterprise',
      status: 'active',
      createdAt: '2024-03-01T08:00:00Z',
    },
    {
      id: 'tenant-cosider',
      name: 'Cosider Groupe Travaux Publics',
      slug: 'cosider',
      companyType: 'BTPH & Grands Chantiers Nationaux',
      wilaya: '16 - Alger (Base Centrale Rouiba)',
      nif: '000216004928174',
      nis: '000216004928174001',
      rc: '16/00-0492817C03',
      address: 'Zone Industrielle Rouiba, Voie C, BP 64, Alger',
      phone: '+213 23 85 40 10',
      email: 'materiel@cosider-dz.com',
      brandColor: '#2563eb',
      plan: 'enterprise',
      status: 'active',
      createdAt: '2024-02-10T08:00:00Z',
    }
  ];

  private vehicles: Vehicle[] = [
    {
      tenantId: 'tenant-sonatrach',
      id: 'v-1',
      plate: '04512-118-16',
      make: 'Renault',
      model: 'Symbol 1.6 Expression',
      year: 2021,
      registrationYear: 2021,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-2',
      plate: '12890-120-16',
      make: 'Peugeot',
      model: '208 1.6 HDi Active',
      year: 2022,
      registrationYear: 2022,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-3',
      plate: '00341-319-31',
      make: 'Toyota',
      model: 'Hilux Double Cabine 4x4',
      year: 2020,
      registrationYear: 2020,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-4',
      plate: '08761-121-09',
      make: 'Hyundai',
      model: 'H100 Fourgon Tôlé',
      year: 2021,
      registrationYear: 2021,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-5',
      plate: '01923-122-16',
      make: 'Dacia',
      model: 'Duster 1.5 dCi 4x2',
      year: 2023,
      registrationYear: 2023,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-6',
      plate: '02345-123-30',
      make: 'Toyota',
      model: 'Land Cruiser Prado TX-L',
      year: 2023,
      registrationYear: 2023,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-7',
      plate: '01450-418-16',
      make: 'Renault Trucks',
      model: 'K440 P 6x4 Benne Lourde',
      year: 2021,
      registrationYear: 2021,
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
      tenantId: 'tenant-sonatrach',
      id: 'v-8',
      plate: '05230-519-30',
      make: 'Mercedes-Benz',
      model: 'Actros 3344 Semi-Remorque Citerne',
      year: 2020,
      registrationYear: 2020,
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
    },

    // ==================== TENANT CEVITAL AGRO-INDUSTRIE (WILAYA 06 - BEJAIA) ====================
    {
      id: 'v-cev-1',
      tenantId: 'tenant-cevital',
      plate: '07120-122-06',
      make: 'Peugeot',
      model: 'Boxer 2.2 HDi Frigorifique',
      year: 2022,
      registrationYear: 2022,
      driverId: 'd-cev-1',
      driverName: 'Tarek Belhadj',
      driverPhone: '+213550998877',
      fuelType: 'diesel',
      status: 'active',
      mileage: 98400,
      tankCapacityLiters: 90,
      averageConsumption: 9.8,
      lastServiceKm: 90000,
      nextServiceKm: 100000,
      insuranceCompany: 'SAA',
      insuranceExpiry: '2026-12-10',
      technicalControlExpiry: '2026-11-20',
      vignetteYear: 2026,
      wilayaCode: '06',
      chassisNumber: 'VF3Y3MFC11234567',
      vehicleCategory: 'VU',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '2.2L HDi',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x2',
      acquisitionCostDZD: 5400000,
      totalMaintenanceCostDZD: 45000,
      lastTireChangeKm: 70000,
      tireLifespanKm: 60000,
      tireWearPercentage: 47,
      enginePowerHP: 140,
      ptacKg: 3500,
      ptraKg: 6000,
      payloadKg: 1450,
      registrationDocUrl: generateSampleCarteGrise('07120-122-06', 'Peugeot', 'Boxer 2.2 HDi Frigorifique', 'VF3Y3MFC11234567', 'VU (Véhicule Utilitaire Frigo)', 3500, 6000, 140),
      tires: {
        frontLeft: 78,
        frontRight: 76,
        rearLeft: 82,
        rearRight: 80,
        lastInspectionDate: '2026-09-12',
        notes: 'Pneumatiques utilitaires renforcés C conformes.',
      }
    },
    {
      id: 'v-cev-2',
      tenantId: 'tenant-cevital',
      plate: '08340-121-06',
      make: 'Renault',
      model: 'Master 2.3 dCi Caisse Isotherme',
      year: 2021,
      registrationYear: 2021,
      driverId: 'd-cev-2',
      driverName: 'Yassine Hamidi',
      driverPhone: '+213661887766',
      fuelType: 'diesel',
      status: 'active',
      mileage: 112000,
      tankCapacityLiters: 100,
      averageConsumption: 10.2,
      lastServiceKm: 110000,
      nextServiceKm: 120000,
      insuranceCompany: 'CAAT',
      insuranceExpiry: '2026-10-15',
      technicalControlExpiry: '2026-09-30',
      vignetteYear: 2026,
      wilayaCode: '06',
      chassisNumber: 'VF1MADF123456789',
      vehicleCategory: 'VU',
      operationalMissionStatus: 'en_mission',
      engineDisplacement: '2.3L dCi Twin Turbo',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x2',
      acquisitionCostDZD: 5100000,
      totalMaintenanceCostDZD: 62000,
      lastTireChangeKm: 80000,
      tireLifespanKm: 60000,
      tireWearPercentage: 53,
      enginePowerHP: 150,
      ptacKg: 3500,
      ptraKg: 6000,
      payloadKg: 1380,
      registrationDocUrl: generateSampleCarteGrise('08340-121-06', 'Renault', 'Master 2.3 dCi Caisse Isotherme', 'VF1MADF123456789', 'VU (Véhicule Utilitaire Isotherme)', 3500, 6000, 150),
      tires: {
        frontLeft: 72,
        frontRight: 70,
        rearLeft: 75,
        rearRight: 74,
        lastInspectionDate: '2026-08-15',
        notes: 'Pneumatiques en bon état opérationnel.',
      }
    },
    {
      id: 'v-cev-3',
      tenantId: 'tenant-cevital',
      plate: '09560-123-06',
      make: 'Hyundai',
      model: 'H350 2.5 CRDi Frigo',
      year: 2023,
      registrationYear: 2023,
      driverId: 'd-cev-3',
      driverName: 'Slimane Touati',
      driverPhone: '+213770776655',
      fuelType: 'diesel',
      status: 'active',
      mileage: 48200,
      tankCapacityLiters: 75,
      averageConsumption: 8.9,
      lastServiceKm: 40000,
      nextServiceKm: 50000,
      insuranceCompany: 'CASH',
      insuranceExpiry: '2027-02-28',
      technicalControlExpiry: '2027-01-15',
      vignetteYear: 2026,
      wilayaCode: '06',
      chassisNumber: 'KMHFB37FAPU012984',
      vehicleCategory: 'VU',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '2.5L CRDi',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x2',
      acquisitionCostDZD: 6200000,
      totalMaintenanceCostDZD: 28000,
      lastTireChangeKm: 0,
      tireLifespanKm: 50000,
      tireWearPercentage: 40,
      enginePowerHP: 170,
      ptacKg: 3500,
      ptraKg: 6500,
      payloadKg: 1500,
      registrationDocUrl: generateSampleCarteGrise('09560-123-06', 'Hyundai', 'H350 2.5 CRDi Frigo', 'KMHFB37FAPU012984', 'VU (Véhicule Frigorifique)', 3500, 6500, 170),
      tires: {
        frontLeft: 88,
        frontRight: 88,
        rearLeft: 90,
        rearRight: 90,
        lastInspectionDate: '2026-10-01',
        notes: 'Pneumatiques d\'origine récents.',
      }
    },
    {
      id: 'v-cev-4',
      tenantId: 'tenant-cevital',
      plate: '03410-420-06',
      make: 'Renault Trucks',
      model: 'D-Wide 19T Frigorifique Lourd',
      year: 2020,
      registrationYear: 2020,
      driverId: 'd-cev-4',
      driverName: 'Omar Chergui',
      driverPhone: '+213551223344',
      fuelType: 'diesel',
      status: 'active',
      mileage: 215000,
      tankCapacityLiters: 300,
      averageConsumption: 22.5,
      lastServiceKm: 200000,
      nextServiceKm: 220000,
      insuranceCompany: 'SAA',
      insuranceExpiry: '2026-11-30',
      technicalControlExpiry: '2026-10-15',
      vignetteYear: 2026,
      wilayaCode: '06',
      chassisNumber: 'VF624GPA00003410',
      vehicleCategory: 'PL',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '7.7L DTI 8',
      engineCylinders: 6,
      transmissionType: 'Robotisée',
      transmissionGears: 9,
      drivetrain: '4x2',
      acquisitionCostDZD: 18500000,
      totalMaintenanceCostDZD: 185000,
      lastTireChangeKm: 180000,
      tireLifespanKm: 80000,
      tireWearPercentage: 44,
      enginePowerHP: 280,
      ptacKg: 19000,
      ptraKg: 26000,
      payloadKg: 10500,
      registrationDocUrl: generateSampleCarteGrise('03410-420-06', 'Renault Trucks', 'D-Wide 19T Frigorifique', 'VF624GPA00003410', 'PL (Poids Lourd Frigorifique)', 19000, 26000, 280),
      tires: {
        frontLeft: 70,
        frontRight: 68,
        rearLeft: 74,
        rearRight: 72,
        lastInspectionDate: '2026-09-05',
        notes: 'Pneumatiques poids lourds 315/80 R22.5 vérifiés.',
      }
    },
    // ==================== TENANT COSIDER TRAVAUX PUBLICS (WILAYA 16 - ALGER) ====================
    {
      id: 'v-cos-1',
      tenantId: 'tenant-cosider',
      plate: '06110-419-16',
      make: 'MAN',
      model: 'TGS 33.400 Benne 6x4 Chantier Lourd',
      year: 2021,
      registrationYear: 2021,
      driverId: 'd-cos-1',
      driverName: 'Brahim Sellami',
      driverPhone: '+213550334455',
      fuelType: 'diesel',
      status: 'active',
      mileage: 164000,
      tankCapacityLiters: 400,
      averageConsumption: 34.0,
      lastServiceKm: 160000,
      nextServiceKm: 175000,
      insuranceCompany: 'SAA',
      insuranceExpiry: '2026-11-15',
      technicalControlExpiry: '2026-10-25',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'WMA06XZZ5MM06110',
      vehicleCategory: 'PL',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '10.5L D20 Common Rail',
      engineCylinders: 6,
      transmissionType: 'Manuelle',
      transmissionGears: 16,
      drivetrain: '6x4',
      acquisitionCostDZD: 26000000,
      totalMaintenanceCostDZD: 195000,
      lastTireChangeKm: 130000,
      tireLifespanKm: 80000,
      tireWearPercentage: 42,
      enginePowerHP: 400,
      ptacKg: 33000,
      ptraKg: 44000,
      payloadKg: 18500,
      registrationDocUrl: generateSampleCarteGrise('06110-419-16', 'MAN', 'TGS 33.400 Benne 6x4', 'WMA06XZZ5MM06110', 'PL (Poids Lourd Benne 6x4)', 33000, 44000, 400),
      tires: {
        frontLeft: 76,
        frontRight: 74,
        rearLeft: 78,
        rearRight: 77,
        lastInspectionDate: '2026-10-02',
        notes: 'Pneumatiques profil chantier 13 R22.5 conformes.',
      }
    },
    {
      id: 'v-cos-2',
      tenantId: 'tenant-cosider',
      plate: '08220-520-16',
      make: 'Mercedes-Benz',
      model: 'Arocs 4145 Benne 8x4 Carrière & Terrassement',
      year: 2022,
      registrationYear: 2022,
      driverId: 'd-cos-2',
      driverName: 'Rabah Mahrez',
      driverPhone: '+213661445566',
      fuelType: 'diesel',
      status: 'active',
      mileage: 128000,
      tankCapacityLiters: 450,
      averageConsumption: 38.5,
      lastServiceKm: 120000,
      nextServiceKm: 135000,
      insuranceCompany: 'CAAT',
      insuranceExpiry: '2026-12-18',
      technicalControlExpiry: '2026-11-05',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'WDB9640431L08220',
      vehicleCategory: 'PL',
      operationalMissionStatus: 'en_mission',
      engineDisplacement: '12.8L OM 471 Turbo',
      engineCylinders: 6,
      transmissionType: 'Robotisée',
      transmissionGears: 12,
      drivetrain: '8x4',
      acquisitionCostDZD: 31500000,
      totalMaintenanceCostDZD: 210000,
      lastTireChangeKm: 90000,
      tireLifespanKm: 75000,
      tireWearPercentage: 51,
      enginePowerHP: 450,
      ptacKg: 41000,
      ptraKg: 48000,
      payloadKg: 24000,
      registrationDocUrl: generateSampleCarteGrise('08220-520-16', 'Mercedes-Benz', 'Arocs 4145 Benne 8x4', 'WDB9640431L08220', 'PL (Poids Lourd Benne 8x4)', 41000, 48000, 450),
      tires: {
        frontLeft: 71,
        frontRight: 69,
        rearLeft: 73,
        rearRight: 72,
        lastInspectionDate: '2026-09-18',
        notes: 'Pneumatiques carrière tout-terrain vérifiés.',
      }
    },
    {
      id: 'v-cos-3',
      tenantId: 'tenant-cosider',
      plate: '09440-521-16',
      make: 'Volvo',
      model: 'FMX 460 Tracteur Semi-Remorque Porte-Engins',
      year: 2021,
      registrationYear: 2021,
      driverId: 'd-cos-3',
      driverName: 'Abdelkader Belmadi',
      driverPhone: '+213552667788',
      fuelType: 'diesel',
      status: 'active',
      mileage: 182000,
      tankCapacityLiters: 500,
      averageConsumption: 42.0,
      lastServiceKm: 175000,
      nextServiceKm: 190000,
      insuranceCompany: 'CASH',
      insuranceExpiry: '2026-10-30',
      technicalControlExpiry: '2026-09-15',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'YV2X460T5MA09440',
      vehicleCategory: 'SM',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '12.8L D13K Turbo',
      engineCylinders: 6,
      transmissionType: 'Robotisée',
      transmissionGears: 14,
      drivetrain: '6x4',
      acquisitionCostDZD: 34000000,
      totalMaintenanceCostDZD: 245000,
      lastTireChangeKm: 140000,
      tireLifespanKm: 90000,
      tireWearPercentage: 47,
      enginePowerHP: 460,
      ptacKg: 26000,
      ptraKg: 60000,
      payloadKg: 42000,
      registrationDocUrl: generateSampleCarteGrise('09440-521-16', 'Volvo', 'FMX 460 Tracteur SM Porte-Engins', 'YV2X460T5MA09440', 'SM (Semi-Remorque Porte-Engin)', 26000, 60000, 460),
      tires: {
        frontLeft: 79,
        frontRight: 77,
        rearLeft: 81,
        rearRight: 80,
        lastInspectionDate: '2026-08-28',
        notes: 'Ensemble pneumatique tracteur et sellette convoi lourd en excellent état.',
      }
    },
    {
      id: 'v-cos-4',
      tenantId: 'tenant-cosider',
      plate: '05330-122-16',
      make: 'Isuzu',
      model: 'D-Max 2.5 Di-D 4x4 Chantier',
      year: 2022,
      registrationYear: 2022,
      driverId: 'd-cos-4',
      driverName: 'Mustapha Chaouche',
      driverPhone: '+213770556677',
      fuelType: 'diesel',
      status: 'active',
      mileage: 76500,
      tankCapacityLiters: 76,
      averageConsumption: 7.9,
      lastServiceKm: 70000,
      nextServiceKm: 80000,
      insuranceCompany: 'SAA',
      insuranceExpiry: '2026-12-31',
      technicalControlExpiry: '2026-11-12',
      vignetteYear: 2026,
      wilayaCode: '16',
      chassisNumber: 'MPATFR86JHT05330',
      vehicleCategory: 'VU',
      operationalMissionStatus: 'reserve_depot',
      engineDisplacement: '2.5L Di-D Intercooler',
      engineCylinders: 4,
      transmissionType: 'Manuelle',
      transmissionGears: 6,
      drivetrain: '4x4',
      acquisitionCostDZD: 4800000,
      totalMaintenanceCostDZD: 35000,
      lastTireChangeKm: 50000,
      tireLifespanKm: 60000,
      tireWearPercentage: 44,
      enginePowerHP: 136,
      ptacKg: 3000,
      ptraKg: 6000,
      payloadKg: 1050,
      registrationDocUrl: generateSampleCarteGrise('05330-122-16', 'Isuzu', 'D-Max 2.5 Di-D 4x4 Chantier', 'MPATFR86JHT05330', 'VU (Pick-up Tout-Terrain)', 3000, 6000, 136),
      tires: {
        frontLeft: 84,
        frontRight: 82,
        rearLeft: 86,
        rearRight: 85,
        lastInspectionDate: '2026-09-20',
        notes: 'Pneus Bridgestone Dueler A/T tout terrain très bon état.',
      }
    }

  ];

  private drivers: Driver[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
    },
    // ==================== TENANT CEVITAL AGRO-INDUSTRIE ====================
    {
      id: 'd-cev-1',
      tenantId: 'tenant-cevital',
      name: 'Tarek Belhadj',
      phone: '+213550998877',
      email: 'tarek.b@cevital-dz.com',
      wilaya: '06 - Béjaïa',
      address: 'Cité Tobbal, Bâtiment C, 06000 Béjaïa',
      birthDate: '1983-05-14',
      educationLevel: 'Secondaire',
      licenseNumber: '06/2004/098124',
      licenseCategories: ['B', 'C'],
      licenseExpiry: '2029-05-14',
      medicalCheckupExpiry: '2027-04-10',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '07120-122-06',
      status: 'available',
      department: 'Direction Logistique Froid',
      hiringDate: '2016-03-01',
      bloodGroup: 'O+',
      managerNotes: 'Chauffeur frigorifique expérimenté, respect strict de la chaîne de froid HACCP.',
      comments: [
        {
          id: 'cmt-cev-1',
          text: 'Chauffeur frigorifique expérimenté, respect strict de la chaîne de froid HACCP.',
          date: '2026-09-01T08:30:00Z',
          author: 'Samira Benabdelkader (Chef Flotte)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    {
      id: 'd-cev-2',
      tenantId: 'tenant-cevital',
      name: 'Yassine Hamidi',
      phone: '+213661887766',
      email: 'yassine.h@cevital-dz.com',
      wilaya: '06 - Béjaïa',
      address: 'Route des Aurès, Ihaddaden, 06000 Béjaïa',
      birthDate: '1988-11-20',
      educationLevel: 'Moyen',
      licenseNumber: '06/2010/045129',
      licenseCategories: ['B', 'C'],
      licenseExpiry: '2028-11-20',
      medicalCheckupExpiry: '2027-02-15',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '08340-121-06',
      status: 'on_mission',
      department: 'Direction Logistique Froid',
      hiringDate: '2018-09-15',
      bloodGroup: 'A+',
      managerNotes: 'Actuellement en mission navette Béjaïa - Alger - Blida.',
      comments: [
        {
          id: 'cmt-cev-2',
          text: 'Actuellement en mission navette Béjaïa - Alger - Blida.',
          date: '2026-10-10T09:00:00Z',
          author: 'Samira Benabdelkader (Chef Flotte)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    {
      id: 'd-cev-3',
      tenantId: 'tenant-cevital',
      name: 'Slimane Touati',
      phone: '+213770776655',
      email: 'slimane.t@cevital-dz.com',
      wilaya: '16 - Alger',
      address: 'Cité 150 Logements, Oued Smar, 16059 Alger',
      birthDate: '1991-03-08',
      educationLevel: 'Universitaire',
      licenseNumber: '16/2014/112948',
      licenseCategories: ['B'],
      licenseExpiry: '2030-03-08',
      medicalCheckupExpiry: '2027-08-20',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '09560-123-06',
      status: 'available',
      department: 'Direction Commerciale & Distribution Centre',
      hiringDate: '2021-04-01',
      bloodGroup: 'B+',
      managerNotes: 'Ponctuel, excellente maîtrise des livraisons urbaines hyper-centre.',
      comments: [
        {
          id: 'cmt-cev-3',
          text: 'Ponctuel, excellente maîtrise des livraisons urbaines hyper-centre.',
          date: '2026-08-15T11:00:00Z',
          author: 'Samira Benabdelkader (Chef Flotte)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    {
      id: 'd-cev-4',
      tenantId: 'tenant-cevital',
      name: 'Omar Chergui',
      phone: '+213551223344',
      email: 'omar.c@cevital-dz.com',
      wilaya: '06 - Béjaïa',
      address: 'Boulevard Krim Belkacem, 06000 Béjaïa',
      birthDate: '1979-09-25',
      educationLevel: 'Secondaire',
      licenseNumber: '06/1999/012984',
      licenseCategories: ['B', 'C', 'E'],
      licenseExpiry: '2027-09-25',
      medicalCheckupExpiry: '2026-12-01',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '03410-420-06',
      status: 'available',
      department: 'Direction Transports Lourds',
      hiringDate: '2012-01-10',
      bloodGroup: 'AB+',
      managerNotes: 'Chauffeur Poids Lourds senior, spécialiste liaisons Béjaïa - Sétif - Constantine.',
      comments: [
        {
          id: 'cmt-cev-4',
          text: 'Chauffeur Poids Lourds senior, spécialiste liaisons Béjaïa - Sétif - Constantine.',
          date: '2026-07-20T14:00:00Z',
          author: 'Samira Benabdelkader (Chef Flotte)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    // ==================== TENANT COSIDER TRAVAUX PUBLICS ====================
    {
      id: 'd-cos-1',
      tenantId: 'tenant-cosider',
      name: 'Brahim Sellami',
      phone: '+213550334455',
      email: 'brahim.s@cosider-dz.com',
      wilaya: '16 - Alger',
      address: 'Cité des Fonctionnaires, Rouiba, 16012 Alger',
      birthDate: '1980-04-12',
      educationLevel: 'Moyen',
      licenseNumber: '16/2001/084920',
      licenseCategories: ['B', 'C', 'E'],
      licenseExpiry: '2028-04-12',
      medicalCheckupExpiry: '2027-03-15',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '06110-419-16',
      status: 'available',
      department: 'Direction Matériel & Chantiers Lourd',
      hiringDate: '2014-06-01',
      bloodGroup: 'O+',
      managerNotes: 'Conducteur d\'engins et poids lourds carrière émérite, habilitation CQP BTPH.',
      comments: [
        {
          id: 'cmt-cos-1',
          text: 'Conducteur d\'engins et poids lourds carrière émérite, habilitation CQP BTPH.',
          date: '2026-08-10T10:00:00Z',
          author: 'Walid Boudissa (Chef Matériel)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    {
      id: 'd-cos-2',
      tenantId: 'tenant-cosider',
      name: 'Rabah Mahrez',
      phone: '+213661445566',
      email: 'rabah.m@cosider-dz.com',
      wilaya: '16 - Alger',
      address: 'Cité Sorecal, Bab Ezzouar, 16042 Alger',
      birthDate: '1984-07-28',
      educationLevel: 'Secondaire',
      licenseNumber: '16/2005/039182',
      licenseCategories: ['B', 'C'],
      licenseExpiry: '2029-07-28',
      medicalCheckupExpiry: '2027-01-20',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '08220-520-16',
      status: 'on_mission',
      department: 'Direction Chantiers Métro & Génie Civil',
      hiringDate: '2017-02-15',
      bloodGroup: 'A-',
      managerNotes: 'En mission évacuation déblais Chantier Métro Alger.',
      comments: [
        {
          id: 'cmt-cos-2',
          text: 'En mission évacuation déblais Chantier Métro Alger.',
          date: '2026-10-05T08:00:00Z',
          author: 'Walid Boudissa (Chef Matériel)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    {
      id: 'd-cos-3',
      tenantId: 'tenant-cosider',
      name: 'Abdelkader Belmadi',
      phone: '+213552667788',
      email: 'abdelkader.b@cosider-dz.com',
      wilaya: '09 - Blida',
      address: 'Route de Chiffa, 09000 Blida',
      birthDate: '1977-12-05',
      educationLevel: 'Secondaire',
      licenseNumber: '09/1997/005129',
      licenseCategories: ['B', 'C', 'E'],
      licenseExpiry: '2027-12-05',
      medicalCheckupExpiry: '2026-11-25',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '09440-521-16',
      status: 'available',
      department: 'Direction Convois Exceptionnels & Ouvrages d\'Art',
      hiringDate: '2010-05-20',
      bloodGroup: 'B+',
      managerNotes: 'Expert convoi exceptionnel porte-engins pelles et grues chenillées.',
      comments: [
        {
          id: 'cmt-cos-3',
          text: 'Expert convoi exceptionnel porte-engins pelles et grues chenillées.',
          date: '2026-09-15T15:00:00Z',
          author: 'Walid Boudissa (Chef Matériel)',
          authorRole: 'fleet_manager'
        }
      ]
    },
    {
      id: 'd-cos-4',
      tenantId: 'tenant-cosider',
      name: 'Mustapha Chaouche',
      phone: '+213770556677',
      email: 'mustapha.c@cosider-dz.com',
      wilaya: '16 - Alger',
      address: 'Cité 5 Juillet, Bab Ezzouar, 16042 Alger',
      birthDate: '1989-02-18',
      educationLevel: 'Universitaire',
      licenseNumber: '16/2011/078214',
      licenseCategories: ['B'],
      licenseExpiry: '2031-02-18',
      medicalCheckupExpiry: '2027-06-30',
      medicalCheckupStatus: 'valid',
      assignedVehiclePlate: '05330-122-16',
      status: 'available',
      department: 'Direction Coordination des Chantiers',
      hiringDate: '2019-11-01',
      bloodGroup: 'O-',
      managerNotes: 'Conducteur liaison ingénieurs et conducteurs de travaux.',
      comments: [
        {
          id: 'cmt-cos-4',
          text: 'Conducteur liaison ingénieurs et conducteurs de travaux.',
          date: '2026-08-01T09:30:00Z',
          author: 'Walid Boudissa (Chef Matériel)',
          authorRole: 'fleet_manager'
        }
      ]
    }

  ];

  private missions: MissionOrder[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
    },

// ==================== MISSIONS CEVITAL ====================
    {
      id: 'om-cev-1',
      tenantId: 'tenant-cevital',
      orderNumber: 'OM-2026-0701',
      title: 'Distribution Chaîne du Froid Agro-Alimentaire',
      purpose: 'Acheminement produits laitiers et margarine sous température dirigée (-20°C).',
      departureCity: 'Béjaïa (Quai Portuaire)',
      departureWilaya: '06 - Béjaïa',
      destinationCity: 'Alger (Plateforme Froid Oued Smar)',
      destinationWilaya: '16 - Alger',
      intermediateStops: ['Bouira', 'Boumerdès'],
      departureDate: '2026-11-24',
      departureTime: '06:00',
      returnDate: '2026-11-25',
      returnTime: '18:00',
      vehicleId: 'v-cev-2',
      vehiclePlate: '08340-121-06',
      vehicleModel: 'Renault Master 2.3 dCi Caisse Isotherme',
      driverId: 'd-cev-2',
      driverName: 'Yassine Hamidi',
      driverPhone: '+213661887766',
      driverLicenseNumber: '06/2010/045129',
      driverLicenseCategory: 'C',
      estimatedDistanceKm: 520,
      estimatedFuelBudgetDZD: 16500,
      tollFeesDZD: 1200,
      perDiemDZD: 8000,
      totalBudgetDZD: 25700,
      status: 'in_progress',
      signedBy: 'Samira Benabdelkader (Directrice Logistique)',
      signedAt: '2026-11-23T16:00:00Z',
      officialSeal: true,
      notes: 'Contrôler impérativement l\'enregistreur thermique à chaque étape de livraison.',
      createdAt: '2026-11-23T14:30:00Z',
    },
    {
      id: 'om-cev-2',
      tenantId: 'tenant-cevital',
      orderNumber: 'OM-2026-0702',
      title: 'Approvisionnement Plateforme Agro Sétif',
      purpose: 'Livraison pondéreuse sucre et huiles alimentaires raffinées.',
      departureCity: 'Béjaïa (Complexe Cevital)',
      departureWilaya: '06 - Béjaïa',
      destinationCity: 'Sétif (Zone Industrielle)',
      destinationWilaya: '19 - Sétif',
      intermediateStops: ['Kherrata', 'Amoucha'],
      departureDate: '2026-11-26',
      departureTime: '07:00',
      returnDate: '2026-11-26',
      returnTime: '20:00',
      vehicleId: 'v-cev-4',
      vehiclePlate: '03410-420-06',
      vehicleModel: 'Renault Trucks D-Wide 19T',
      driverId: 'd-cev-4',
      driverName: 'Omar Chergui',
      driverPhone: '+213551223344',
      driverLicenseNumber: '06/1999/012984',
      driverLicenseCategory: 'C',
      estimatedDistanceKm: 260,
      estimatedFuelBudgetDZD: 17800,
      tollFeesDZD: 600,
      perDiemDZD: 5000,
      totalBudgetDZD: 23400,
      status: 'approved',
      signedBy: 'Samira Benabdelkader (Directrice Logistique)',
      signedAt: '2026-11-24T10:00:00Z',
      officialSeal: true,
      notes: 'Passage par les Gorges de Kherrata avec prudence.',
      createdAt: '2026-11-24T09:00:00Z',
    },
    // ==================== MISSIONS COSIDER ====================
    {
      id: 'om-cos-1',
      tenantId: 'tenant-cosider',
      orderNumber: 'OM-2026-0801',
      title: 'Évacuation Déblais & Terrassement Métro Alger',
      purpose: 'Rotation bennes lourdes pour extraction terrassement puits Métro Place des Martyrs.',
      departureCity: 'Rouiba (Base Centrale Matériel)',
      departureWilaya: '16 - Alger',
      destinationCity: 'Alger Centre (Chantier Métro)',
      destinationWilaya: '16 - Alger',
      intermediateStops: ['Décharge Contrôlée Oued Smar'],
      departureDate: '2026-11-24',
      departureTime: '05:30',
      returnDate: '2026-11-24',
      returnTime: '19:00',
      vehicleId: 'v-cos-2',
      vehiclePlate: '08220-520-16',
      vehicleModel: 'Mercedes-Benz Arocs 4145 Benne 8x4',
      driverId: 'd-cos-2',
      driverName: 'Rabah Mahrez',
      driverPhone: '+213661445566',
      driverLicenseNumber: '16/2005/039182',
      driverLicenseCategory: 'C',
      estimatedDistanceKm: 180,
      estimatedFuelBudgetDZD: 21500,
      tollFeesDZD: 800,
      perDiemDZD: 4500,
      totalBudgetDZD: 26800,
      status: 'in_progress',
      signedBy: 'Walid Boudissa (Directeur Matériel)',
      signedAt: '2026-11-23T18:00:00Z',
      officialSeal: true,
      notes: 'Bâche de benne obligatoire lors de la traversée de la rocade nord.',
      createdAt: '2026-11-23T15:00:00Z',
    },
    {
      id: 'om-cos-2',
      tenantId: 'tenant-cosider',
      orderNumber: 'OM-2026-0802',
      title: 'Convoi Lourd Porte-Engins Viaduc Chiffa',
      purpose: 'Transfert grue automotrice Liebherr 80T vers viaduc autoroutier.',
      departureCity: 'Rouiba (Atelier Central)',
      departureWilaya: '16 - Alger',
      destinationCity: 'Gorges de la Chiffa (Chantier Viaduc)',
      destinationWilaya: '09 - Blida',
      intermediateStops: ['Poste de Pesage Baba Ali'],
      departureDate: '2026-11-27',
      departureTime: '04:00',
      returnDate: '2026-11-27',
      returnTime: '16:00',
      vehicleId: 'v-cos-3',
      vehiclePlate: '09440-521-16',
      vehicleModel: 'Volvo FMX 460 Tracteur Semi-Remorque SM',
      driverId: 'd-cos-3',
      driverName: 'Abdelkader Belmadi',
      driverPhone: '+213552667788',
      driverLicenseNumber: '09/1997/005129',
      driverLicenseCategory: 'E',
      estimatedDistanceKm: 140,
      estimatedFuelBudgetDZD: 18500,
      tollFeesDZD: 1500,
      perDiemDZD: 7000,
      totalBudgetDZD: 27000,
      status: 'approved',
      signedBy: 'Walid Boudissa (Directeur Matériel)',
      signedAt: '2026-11-24T11:00:00Z',
      officialSeal: true,
      notes: 'Convoi exceptionnel de catégorie 2, escorte véhicule pilote requise.',
      createdAt: '2026-11-24T10:15:00Z',
    }

  ];

  private interventions: VehicleIntervention[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
    },

// ==================== INTERVENTIONS CEVITAL ====================
    {
      id: 'itv-cev-1',
      tenantId: 'tenant-cevital',
      interventionOrderNumber: 'DI-2026-0150',
      receptionSheetNumber: 'FR-2026-0150',
      natureIntervention: 'preventive',
      vehicleId: 'v-cev-1',
      vehiclePlate: '07120-122-06',
      vehicleMakeModel: 'Peugeot Boxer 2.2 HDi Frigorifique',
      vehicleCategory: 'VU',
      fuelType: 'diesel',
      odometerOutKm: 98000,
      odometerInKm: 98400,
      driverId: 'd-cev-1',
      driverName: 'Tarek Belhadj',
      driverPhone: '+213550998877',
      type: 'climatisation',
      title: 'Révision Périodique Groupe Frigorifique Carrier Xarios',
      description: 'Entretien du compresseur frigorifique, appoint fluide R404A et contrôle étanchéité caisse.',
      urgency: 'normal',
      garageType: 'partenaire_conventionne',
      garageName: 'Atelier Frigorifique & Froid Industriel Béjaïa',
      dateSortieIntervention: '2026-11-18T08:00',
      estimatedDurationDays: 1,
      requestedBy: 'Samira Benabdelkader (Chef Flotte)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-11-17',
      officialSealDI: true,
      dateRetourIntervention: '2026-11-19T16:30',
      coutInterventionDZD: 45000,
      workDoneDetails: 'Vidange huile compresseur frigorifique, remplacement courroie d\'entraînement et recharge 1.8kg gaz R404A.',
      partsReplaced: ['Courroie alternateur groupe froid', 'Filtre déshydrateur', 'Huile synthétique ester POE'],
      qualityChecks: {
        brakingTested: true,
        fluidLevelsChecked: true,
        tiresInspected: true,
        dashboardWarningsOff: true,
        roadTested: true,
      },
      receptionDecision: 'conforme_bon_service',
      receptionNotes: 'Descente en température validée à -22°C en 45 minutes.',
      receivedBy: 'Nabil Mansouri (Resp. Maintenance)',
      receivedByRole: 'maintenance_lead',
      receptionDate: '2026-11-19',
      officialSealFR: true,
      status: 'cloturee_receptionnee',
      createdAt: '2026-11-17T09:00:00Z',
    },
    {
      id: 'itv-cev-2',
      tenantId: 'tenant-cevital',
      interventionOrderNumber: 'DI-2026-0151',
      natureIntervention: 'curative',
      vehicleId: 'v-cev-2',
      vehiclePlate: '08340-121-06',
      vehicleMakeModel: 'Renault Master 2.3 dCi Caisse Isotherme',
      vehicleCategory: 'VU',
      fuelType: 'diesel',
      odometerOutKm: 112000,
      driverId: 'd-cev-2',
      driverName: 'Yassine Hamidi',
      driverPhone: '+213661887766',
      type: 'freinage',
      title: 'Remplacement Disques & Plaquettes Train Avant',
      description: 'Témoin d\'usure allumé et vibration légère au freinage à charge.',
      urgency: 'urgent',
      garageType: 'concessionnaire',
      garageName: 'Concessionnaire Renault Trucks Béjaïa',
      dateSortieIntervention: '2026-11-23T14:00',
      estimatedDurationDays: 1,
      requestedBy: 'Samira Benabdelkader (Chef Flotte)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-11-23',
      officialSealDI: true,
      status: 'en_cours_atelier',
      createdAt: '2026-11-23T10:00:00Z',
    },
    // ==================== INTERVENTIONS COSIDER ====================
    {
      id: 'itv-cos-1',
      tenantId: 'tenant-cosider',
      interventionOrderNumber: 'DI-2026-0180',
      receptionSheetNumber: 'FR-2026-0180',
      natureIntervention: 'curative',
      vehicleId: 'v-cos-1',
      vehiclePlate: '06110-419-16',
      vehicleMakeModel: 'MAN TGS 33.400 Benne 6x4',
      vehicleCategory: 'PL',
      fuelType: 'diesel',
      odometerOutKm: 163500,
      odometerInKm: 164000,
      driverId: 'd-cos-1',
      driverName: 'Brahim Sellami',
      driverPhone: '+213550334455',
      type: 'suspension_direction',
      title: 'Réparation Vérin Hydraulique de Benne & Remplacement Flexibles',
      description: 'Fuite huile hydraulique constatée au niveau du flexible haute pression télescopique.',
      urgency: 'urgent',
      garageType: 'atelier_interne',
      garageName: 'Atelier Central Hydraulique BTPH Rouiba',
      dateSortieIntervention: '2026-11-15T07:30',
      estimatedDurationDays: 2,
      requestedBy: 'Walid Boudissa (Chef Matériel)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-11-14',
      officialSealDI: true,
      dateRetourIntervention: '2026-11-17T17:00',
      coutInterventionDZD: 85000,
      workDoneDetails: 'Remplacement de 2 flexibles hydrauliques 350 bars, réfection kit joints vérin Hyva et vidange 50L huile HV46.',
      partsReplaced: ['Kit joints vérin télescopique', 'Flexibles HP sertis 4SP', 'Huile hydraulique Total Equivis ZS 46 (50L)'],
      qualityChecks: {
        brakingTested: true,
        fluidLevelsChecked: true,
        tiresInspected: true,
        dashboardWarningsOff: true,
        roadTested: true,
      },
      receptionDecision: 'conforme_bon_service',
      receptionNotes: 'Essai de basculement à 25 tonnes effectué avec succès sans aucune fuite.',
      receivedBy: 'Lamine Zerrouki (Resp. Maintenance)',
      receivedByRole: 'maintenance_lead',
      receptionDate: '2026-11-17',
      officialSealFR: true,
      status: 'cloturee_receptionnee',
      createdAt: '2026-11-14T08:30:00Z',
    },
    {
      id: 'itv-cos-2',
      tenantId: 'tenant-cosider',
      interventionOrderNumber: 'DI-2026-0181',
      natureIntervention: 'preventive',
      vehicleId: 'v-cos-2',
      vehiclePlate: '08220-520-16',
      vehicleMakeModel: 'Mercedes-Benz Arocs 4145 Benne 8x4',
      vehicleCategory: 'PL',
      fuelType: 'diesel',
      odometerOutKm: 128000,
      driverId: 'd-cos-2',
      driverName: 'Rabah Mahrez',
      driverPhone: '+213661445566',
      type: 'revision_generale',
      title: 'Grande Révision Périodique 120 000 km Mercedes Trucks',
      description: 'Vidange moteur, ponts et boîte PowerShift 3, filtres gasoil et séparateur d\'eau.',
      urgency: 'normal',
      garageType: 'atelier_interne',
      garageName: 'Atelier Central Poids Lourds Rouiba',
      dateSortieIntervention: '2026-11-20T08:00',
      estimatedDurationDays: 2,
      requestedBy: 'Walid Boudissa (Chef Matériel)',
      requestedByRole: 'fleet_manager',
      requestDate: '2026-11-19',
      officialSealDI: true,
      status: 'en_cours_atelier',
      createdAt: '2026-11-19T10:00:00Z',
    }

  ];

  private prepaidFuelCards: PrepaidFuelCard[] = [
    {
      tenantId: 'tenant-sonatrach',
      id: 'pfc-1',
      cardNumber: 'NAFTAL-CORP-1601',
      cardName: 'Carte Naftal Flotte — Station Rocade Sud',
      stationName: 'Station Naftal Rocade Sud (Chéraga)',
      stationCity: '16 - Alger',
      initialBalanceDZD: 300000,
      currentBalanceDZD: 218400,
      depositDate: '2026-09-01',
      status: 'active',
      notes: 'Convention d\'approvisionnement flotte véhicules légers et utilitaires Direction Générale.'
    },
    {
      tenantId: 'tenant-sonatrach',
      id: 'pfc-2',
      cardNumber: 'NAFTAL-CORP-1602',
      cardName: 'Carte Naftal Flotte — Station El Mouradia',
      stationName: 'Station Naftal El Mouradia',
      stationCity: '16 - Alger',
      initialBalanceDZD: 200000,
      currentBalanceDZD: 142800,
      depositDate: '2026-09-15',
      status: 'active',
      notes: 'Dotation carburant réservée aux déplacements urbains et navettes administratives.'
    },
    {
      tenantId: 'tenant-sonatrach',
      id: 'pfc-3',
      cardNumber: 'NAFTAL-CORP-3101',
      cardName: 'Carte Naftal Région Ouest — Es Senia',
      stationName: 'Station Naftal Es Senia',
      stationCity: '31 - Oran',
      initialBalanceDZD: 250000,
      currentBalanceDZD: 185500,
      depositDate: '2026-08-20',
      status: 'active',
      notes: 'Convention dédiée aux ordres de mission région Ouest et desserte portuaire.'
    },
    {
      id: 'pfc-4',
      cardNumber: 'NAFTAL-CORP-3001',
      cardName: 'Carte Naftal Sud & Poids Lourds — Hassi Messaoud',
      stationName: 'Station Naftal Base 24 Février',
      stationCity: '30 - Ouargla',
      initialBalanceDZD: 500000,
      currentBalanceDZD: 384000,
      depositDate: '2026-08-01',
      status: 'active',
      notes: 'Dépôt gros volumes camions porteurs PL et semi-remorques transport saharien.'
    },

// ==================== CARTES NAFTAL CEVITAL ====================
    {
      id: 'pfc-cev-1',
      tenantId: 'tenant-cevital',
      cardNumber: 'NAFTAL-CEV-0601',
      cardName: 'Carte Naftal Flotte - Station Port Béjaïa',
      stationName: 'Station Naftal Portuaire Béjaïa (Quai Nord)',
      stationCity: '06 - Béjaïa',
      initialBalanceDZD: 500000,
      currentBalanceDZD: 385000,
      depositDate: '2026-01-05',
      status: 'active',
      notes: 'Dotation mensuelle carburant pour les véhicules frigorifiques.',
    },
    {
      id: 'pfc-cev-2',
      tenantId: 'tenant-cevital',
      cardNumber: 'NAFTAL-CEV-1602',
      cardName: 'Carte Naftal Centre - Station Dar El Beïda',
      stationName: 'Station Naftal RN5 Dar El Beïda (Alger)',
      stationCity: '16 - Alger',
      initialBalanceDZD: 400000,
      currentBalanceDZD: 290000,
      depositDate: '2026-01-10',
      status: 'active',
      notes: 'Carte relais pour réapprovisionnement livraisons Centre.',
    },
    // ==================== CARTES NAFTAL COSIDER ====================
    {
      id: 'pfc-cos-1',
      tenantId: 'tenant-cosider',
      cardNumber: 'NAFTAL-COS-1601',
      cardName: 'Carte Naftal Chantiers - Station ZI Rouiba',
      stationName: 'Station Naftal Zone Industrielle Rouiba',
      stationCity: '16 - Alger',
      initialBalanceDZD: 800000,
      currentBalanceDZD: 540000,
      depositDate: '2026-01-02',
      status: 'active',
      notes: 'Dotation mensuelle gasoil pour flotte bennes 6x4 et 8x4.',
    },
    {
      id: 'pfc-cos-2',
      tenantId: 'tenant-cosider',
      cardNumber: 'NAFTAL-COS-0902',
      cardName: 'Carte Naftal Ouvrages d\'Art - Station Chiffa',
      stationName: 'Station Naftal Autoroute Chiffa',
      stationCity: '09 - Blida',
      initialBalanceDZD: 600000,
      currentBalanceDZD: 410000,
      depositDate: '2026-01-15',
      status: 'active',
      notes: 'Carte relais pour les transferts convoi lourd viaduc.',
    }

  ];

  private fuelVouchers: FuelVoucher[] = [
    {
      tenantId: 'tenant-sonatrach',
      id: 'bv-1',
      voucherNumber: 'BR-2026-0141',
      date: '2026-10-04',
      vehicleId: 'v-3',
      vehiclePlate: '00341-319-31',
      vehicleModel: 'Toyota Hilux 4x4',
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      driverPhone: '+213770456789',
      stationName: 'Station Naftal Base 24 Février',
      stationCity: '30 - Ouargla',
      fuelType: 'diesel',
      refuelType: 'dotation_mission',
      quantityRequestedLiters: 70,
      estimatedAmountDZD: 2030,
      prepaidCardId: 'pfc-4',
      prepaidCardNumber: 'NAFTAL-CORP-3001',
      issuedBy: 'Karim Ziani (Gestionnaire Flotte)',
      issuedAt: '2026-10-04T08:15:00Z',
      notes: 'Dotation mission OM-2026-0891 Alger -> Hassi Messaoud',
      status: 'ravitaille',
      stationReceiptNumber: 'REC-NAFTAL-88912',
      actualDate: '2026-10-04T18:45:00Z',
      actualQuantityLiters: 70,
      actualAmountDZD: 2030,
      odometerKm: 142300,
      previousOdometerKm: 141480,
      distanceDrivenKm: 820,
      calculatedConsumption: 8.5,
      completedAt: '2026-10-04T19:00:00Z',
    },
    {
      tenantId: 'tenant-sonatrach',
      id: 'bv-2',
      voucherNumber: 'BR-2026-0142',
      date: '2026-10-06',
      vehicleId: 'v-2',
      vehiclePlate: '12890-120-16',
      vehicleModel: 'Peugeot 208 HDi',
      driverId: 'd-2',
      driverName: 'Youcef Amrani',
      driverPhone: '+213661789012',
      stationName: 'Station Naftal Rocade Sud (Chéraga)',
      stationCity: '16 - Alger',
      fuelType: 'diesel',
      refuelType: 'partiel_appoint',
      quantityRequestedLiters: 25,
      estimatedAmountDZD: 725,
      prepaidCardId: 'pfc-1',
      prepaidCardNumber: 'NAFTAL-CORP-1601',
      issuedBy: 'Karim Ziani (Gestionnaire Flotte)',
      issuedAt: '2026-10-06T07:15:00Z',
      notes: 'Appoint carburant départ mission Oran OM-2026-0892',
      status: 'ravitaille',
      stationReceiptNumber: 'REC-NAFTAL-90114',
      actualDate: '2026-10-06T07:45:00Z',
      actualQuantityLiters: 25,
      actualAmountDZD: 725,
      odometerKm: 64200,
      previousOdometerKm: 63710,
      distanceDrivenKm: 490,
      calculatedConsumption: 5.1,
      completedAt: '2026-10-06T08:00:00Z',
    },
    {
      tenantId: 'tenant-sonatrach',
      id: 'bv-3',
      voucherNumber: 'BR-2026-0143',
      date: '2026-10-07',
      vehicleId: 'v-1',
      vehiclePlate: '04512-118-16',
      vehicleModel: 'Renault Symbol 1.6 Expression',
      driverId: 'd-1',
      driverName: 'Karim Belkacem',
      driverPhone: '+213550123456',
      stationName: 'Station Naftal El Mouradia',
      stationCity: '16 - Alger',
      fuelType: 'essence',
      refuelType: 'partiel_appoint',
      quantityRequestedLiters: 30,
      estimatedAmountDZD: 1368,
      prepaidCardId: 'pfc-2',
      prepaidCardNumber: 'NAFTAL-CORP-1602',
      issuedBy: 'Karim Ziani (Gestionnaire Flotte)',
      issuedAt: '2026-10-07T08:30:00Z',
      notes: 'Dotation appoint pour courriers ministériels',
      status: 'emis',
    },
    {
      tenantId: 'tenant-sonatrach',
      id: 'bv-4',
      voucherNumber: 'BR-2026-0144',
      date: '2026-10-07',
      vehicleId: 'v-7',
      vehiclePlate: '01450-418-16',
      vehicleModel: 'Renault Trucks K440 P 6x4 Benne',
      driverId: 'd-3',
      driverName: 'Ahmed Benali',
      driverPhone: '+213770456789',
      stationName: 'Station Naftal Rocade Sud (Chéraga)',
      stationCity: '16 - Alger',
      fuelType: 'diesel',
      refuelType: 'plein_complet',
      quantityRequestedLiters: 200,
      estimatedAmountDZD: 5802,
      prepaidCardId: 'pfc-1',
      prepaidCardNumber: 'NAFTAL-CORP-1601',
      issuedBy: 'Karim Ziani (Gestionnaire Flotte)',
      issuedAt: '2026-10-07T10:00:00Z',
      notes: 'Plein complet pour rotation chantier carrières Tipaza',
      status: 'emis',
    },

// ==================== BONS DE RAVITAILLEMENT CEVITAL ====================
    {
      id: 'bv-cev-1',
      tenantId: 'tenant-cevital',
      voucherNumber: 'BR-2026-0301',
      date: '2026-11-20',
      vehicleId: 'v-cev-1',
      vehiclePlate: '07120-122-06',
      vehicleModel: 'Peugeot Boxer 2.2 HDi Frigorifique',
      driverId: 'd-cev-1',
      driverName: 'Tarek Belhadj',
      driverPhone: '+213550998877',
      stationName: 'Station Naftal Portuaire Béjaïa (Quai Nord)',
      stationCity: '06 - Béjaïa',
      fuelType: 'diesel',
      refuelType: 'plein_complet',
      quantityRequestedLiters: 70,
      estimatedAmountDZD: 2030,
      prepaidCardId: 'pfc-cev-1',
      prepaidCardNumber: 'NAFTAL-CEV-0601',
      issuedBy: 'Samira Benabdelkader (Chef Flotte)',
      issuedAt: '2026-11-20T07:30:00Z',
      status: 'ravitaille',
      stationReceiptNumber: 'RS-BEJ-2026-8910',
      actualDate: '2026-11-20T08:15',
      actualQuantityLiters: 68.5,
      actualAmountDZD: 1987.18,
      odometerKm: 98400,
      previousOdometerKm: 97700,
      distanceDrivenKm: 700,
      calculatedConsumption: 9.78,
      completedAt: '2026-11-20T08:20:00Z',
      receiptPhotoUrl: generateSampleStationReceipt('RS-BEJ-2026-8910', '2026-11-20 08:15', 'Station Naftal Portuaire Béjaïa', '07120-122-06', 'Tarek Belhadj', 68.5, 1987.18, 98400),
    },
    {
      id: 'bv-cev-2',
      tenantId: 'tenant-cevital',
      voucherNumber: 'BR-2026-0302',
      date: '2026-11-23',
      vehicleId: 'v-cev-2',
      vehiclePlate: '08340-121-06',
      vehicleModel: 'Renault Master 2.3 dCi Caisse Isotherme',
      driverId: 'd-cev-2',
      driverName: 'Yassine Hamidi',
      driverPhone: '+213661887766',
      stationName: 'Station Naftal RN5 Dar El Beïda (Alger)',
      stationCity: '16 - Alger',
      fuelType: 'diesel',
      refuelType: 'partiel_appoint',
      quantityRequestedLiters: 45,
      estimatedAmountDZD: 1305,
      prepaidCardId: 'pfc-cev-2',
      prepaidCardNumber: 'NAFTAL-CEV-1602',
      issuedBy: 'Samira Benabdelkader (Chef Flotte)',
      issuedAt: '2026-11-23T11:00:00Z',
      status: 'emis',
    },
    // ==================== BONS DE RAVITAILLEMENT COSIDER ====================
    {
      id: 'bv-cos-1',
      tenantId: 'tenant-cosider',
      voucherNumber: 'BR-2026-0401',
      date: '2026-11-21',
      vehicleId: 'v-cos-1',
      vehiclePlate: '06110-419-16',
      vehicleModel: 'MAN TGS 33.400 Benne 6x4',
      driverId: 'd-cos-1',
      driverName: 'Brahim Sellami',
      driverPhone: '+213550334455',
      stationName: 'Station Naftal Zone Industrielle Rouiba',
      stationCity: '16 - Alger',
      fuelType: 'diesel',
      refuelType: 'plein_complet',
      quantityRequestedLiters: 250,
      estimatedAmountDZD: 7252,
      prepaidCardId: 'pfc-cos-1',
      prepaidCardNumber: 'NAFTAL-COS-1601',
      issuedBy: 'Walid Boudissa (Chef Matériel)',
      issuedAt: '2026-11-21T06:00:00Z',
      status: 'ravitaille',
      stationReceiptNumber: 'RS-ROU-2026-5541',
      actualDate: '2026-11-21T06:40',
      actualQuantityLiters: 245.0,
      actualAmountDZD: 7107.45,
      odometerKm: 164000,
      previousOdometerKm: 163280,
      distanceDrivenKm: 720,
      calculatedConsumption: 34.02,
      completedAt: '2026-11-21T06:45:00Z',
      receiptPhotoUrl: generateSampleStationReceipt('RS-ROU-2026-5541', '2026-11-21 06:40', 'Station Naftal ZI Rouiba', '06110-419-16', 'Brahim Sellami', 245.0, 7107.45, 164000),
    },
    {
      id: 'bv-cos-2',
      tenantId: 'tenant-cosider',
      voucherNumber: 'BR-2026-0402',
      date: '2026-11-23',
      vehicleId: 'v-cos-2',
      vehiclePlate: '08220-520-16',
      vehicleModel: 'Mercedes-Benz Arocs 4145 Benne 8x4',
      driverId: 'd-cos-2',
      driverName: 'Rabah Mahrez',
      driverPhone: '+213661445566',
      stationName: 'Station Naftal Autoroute Chiffa',
      stationCity: '09 - Blida',
      fuelType: 'diesel',
      refuelType: 'plein_complet',
      quantityRequestedLiters: 300,
      estimatedAmountDZD: 8703,
      prepaidCardId: 'pfc-cos-2',
      prepaidCardNumber: 'NAFTAL-COS-0902',
      issuedBy: 'Walid Boudissa (Chef Matériel)',
      issuedAt: '2026-11-23T05:30:00Z',
      status: 'emis',
    }

  ];

  private fuelLogs: FuelLog[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      previousOdometerKm: 86800,
      distanceDrivenKm: 650,
      stationName: 'Naftal El Mouradia',
      city: 'Alger',
      status: 'pending',
      source: 'pwa_manual',
      refuelType: 'plein_complet',
      notes: 'Plein complet saisi via terminal PWA Chauffeur (En attente de validation gestionnaire)',
      gpsCoordinates: { latitude: 36.7412, longitude: 3.0515, accuracy: 12, wilaya: '16 - Alger' },
      isOverconsumption: false,
      calculatedConsumption: 7.4,
      stationReceiptNumber: 'REC-NAFTAL-77124',
      prepaidCardNumber: 'NAFTAL-CORP-1602',
      receiptPhotoUrl: generateSampleStationReceipt('REC-NAFTAL-77124', new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), 'Naftal El Mouradia (Wilaya 16)', '04512-118-16', 'Karim Belkacem', 48, 7200, 87450),
    },
    {
      tenantId: 'tenant-sonatrach',
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
      previousOdometerKm: 63330,
      distanceDrivenKm: 850,
      stationName: 'Naftal Rocade Sud Chéraga',
      city: 'Alger',
      status: 'verified',
      source: 'voucher_receipt',
      refuelType: 'partiel_appoint',
      voucherNumber: 'BR-2026-0142',
      stationReceiptNumber: 'REC-NAFTAL-90114',
      prepaidCardNumber: 'NAFTAL-CORP-1601',
      notes: 'Rapprochement validé Bon BR-2026-0142 et reçu officiel Naftal',
      gpsCoordinates: { latitude: 36.7645, longitude: 2.9528, accuracy: 15, wilaya: '16 - Alger' },
      isOverconsumption: false,
      calculatedConsumption: 5.3,
      receiptPhotoUrl: generateSampleStationReceipt('REC-NAFTAL-90114', new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), 'Naftal Rocade Sud (Chéraga)', '12890-120-16', 'Youcef Amrani', 45, 2900, 64180),
    },
    {
      tenantId: 'tenant-sonatrach',
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
      previousOdometerKm: 141400,
      distanceDrivenKm: 550,
      stationName: 'Naftal Es Senia',
      city: 'Oran',
      status: 'pending',
      source: 'pwa_manual',
      refuelType: 'dotation_mission',
      voucherNumber: 'BR-2026-0141',
      stationReceiptNumber: 'REC-NAFTAL-88912',
      prepaidCardNumber: 'NAFTAL-CORP-3101',
      notes: 'Dotation mission Oran-Mostaganem — Surconsommation détectée vs 9.4 constructeur',
      gpsCoordinates: { latitude: 35.6512, longitude: -0.6214, accuracy: 10, wilaya: '31 - Oran' },
      isOverconsumption: true,
      calculatedConsumption: 12.7,
      receiptPhotoUrl: generateSampleStationReceipt('REC-NAFTAL-88912', new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), 'Naftal Es Senia (Oran)', '00341-319-31', 'Ahmed Benali', 70, 4500, 141950),
    },
    {
      tenantId: 'tenant-sonatrach',
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
      previousOdometerKm: 37890,
      distanceDrivenKm: 830,
      stationName: 'Naftal Bab Ezzouar',
      city: 'Alger',
      status: 'verified',
      source: 'pwa_scan',
      refuelType: 'plein_complet',
      stationReceiptNumber: 'REC-NAFTAL-66521',
      prepaidCardNumber: 'NAFTAL-CORP-1601',
      notes: 'Ticket analysé par reconnaissance souveraine embarquée PWA',
      isOverconsumption: false,
      calculatedConsumption: 5.9,
      receiptPhotoUrl: generateSampleStationReceipt('REC-NAFTAL-66521', new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), 'Naftal Bab Ezzouar (Alger)', '01923-122-16', 'Reda Khelil', 49, 3200, 38720),
    },

// ==================== FUEL LOGS CEVITAL ====================
    {
      id: 'fl-cev-1',
      tenantId: 'tenant-cevital',
      vehicleId: 'v-cev-1',
      vehiclePlate: '07120-122-06',
      driverId: 'd-cev-1',
      driverName: 'Tarek Belhadj',
      amountDZD: 1987.18,
      liters: 68.5,
      pricePerLiterDZD: 29.01,
      date: '2026-11-20 08:15',
      odometerKm: 98400,
      previousOdometerKm: 97700,
      distanceDrivenKm: 700,
      stationName: 'Station Naftal Portuaire Béjaïa (Quai Nord)',
      city: '06 - Béjaïa',
      status: 'verified',
      source: 'voucher_receipt',
      refuelType: 'plein_complet',
      voucherNumber: 'BR-2026-0301',
      stationReceiptNumber: 'RS-BEJ-2026-8910',
      prepaidCardNumber: 'NAFTAL-CEV-0601',
      isOverconsumption: false,
      calculatedConsumption: 9.8,
      receiptPhotoUrl: generateSampleStationReceipt('RS-BEJ-2026-8910', '2026-11-20 08:15', 'Station Naftal Portuaire Béjaïa', '07120-122-06', 'Tarek Belhadj', 68.5, 1987.18, 98400),
    },
    // ==================== FUEL LOGS COSIDER ====================
    {
      id: 'fl-cos-1',
      tenantId: 'tenant-cosider',
      vehicleId: 'v-cos-1',
      vehiclePlate: '06110-419-16',
      driverId: 'd-cos-1',
      driverName: 'Brahim Sellami',
      amountDZD: 7107.45,
      liters: 245.0,
      pricePerLiterDZD: 29.01,
      date: '2026-11-21 06:40',
      odometerKm: 164000,
      previousOdometerKm: 163280,
      distanceDrivenKm: 720,
      stationName: 'Station Naftal Zone Industrielle Rouiba',
      city: '16 - Alger',
      status: 'verified',
      source: 'voucher_receipt',
      refuelType: 'plein_complet',
      voucherNumber: 'BR-2026-0401',
      stationReceiptNumber: 'RS-ROU-2026-5541',
      prepaidCardNumber: 'NAFTAL-COS-1601',
      isOverconsumption: false,
      calculatedConsumption: 34.0,
      receiptPhotoUrl: generateSampleStationReceipt('RS-ROU-2026-5541', '2026-11-21 06:40', 'Station Naftal ZI Rouiba', '06110-419-16', 'Brahim Sellami', 245.0, 7107.45, 164000),
    }

  ];

  private maintenanceRecords: MaintenanceRecord[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
    },

// ==================== MAINTENANCE CEVITAL ====================
    {
      id: 'mr-cev-1',
      tenantId: 'tenant-cevital',
      vehicleId: 'v-cev-1',
      vehiclePlate: '07120-122-06',
      type: 'climatisation',
      costDZD: 45000,
      odometerKm: 98400,
      date: '2026-11-19',
      garageName: 'Atelier Frigorifique Béjaïa',
      notes: 'Entretien du groupe frigorifique Carrier et recharge gaz.',
      status: 'completed',
    },
    // ==================== MAINTENANCE COSIDER ====================
    {
      id: 'mr-cos-1',
      tenantId: 'tenant-cosider',
      vehicleId: 'v-cos-1',
      vehiclePlate: '06110-419-16',
      type: 'reparation_mecanique',
      costDZD: 85000,
      odometerKm: 164000,
      date: '2026-11-17',
      garageName: 'Atelier Central Hydraulique Rouiba',
      notes: 'Réfection kit joints vérin benne et flexibles 350 bars.',
      status: 'completed',
    }

  ];

  private accidentClaims: AccidentClaim[] = [
    {
      tenantId: 'tenant-sonatrach',
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
    },

// ==================== SINISTRES CEVITAL ====================
    {
      id: 'acc-cev-1',
      tenantId: 'tenant-cevital',
      claimNumber: 'SIN-2026-0101',
      vehicleId: 'v-cev-2',
      vehiclePlate: '08340-121-06',
      driverId: 'd-cev-2',
      driverName: 'Yassine Hamidi',
      driverPhone: '+213661887766',
      date: '2026-10-18',
      time: '14:20',
      location: 'Quai de déchargement Oued Smar, Alger',
      description: 'Accrochage léger en marche arrière contre le butoir de quai. Feu arrière gauche fissuré.',
      severity: 'minor',
      photos: [],
      policeReportFiled: false,
      status: 'settled',
      estimatedCostDZD: 18000,
    },
    // ==================== SINISTRES COSIDER ====================
    {
      id: 'acc-cos-1',
      tenantId: 'tenant-cosider',
      claimNumber: 'SIN-2026-0201',
      vehicleId: 'v-cos-1',
      vehiclePlate: '06110-419-16',
      driverId: 'd-cos-1',
      driverName: 'Brahim Sellami',
      driverPhone: '+213550334455',
      date: '2026-10-22',
      time: '11:15',
      location: 'Chantier Déviation Rouiba',
      description: 'Éclatement pneumatique arrière gauche sur ferraille de chantier sans dommage corporel.',
      severity: 'minor',
      photos: [],
      policeReportFiled: false,
      status: 'settled',
      estimatedCostDZD: 42000,
    }

  ];

  private alerts: FleetAlert[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
    },

// ==================== ALERTES CEVITAL ====================
    {
      id: 'alt-cev-1',
      tenantId: 'tenant-cevital',
      vehicleId: 'v-cev-2',
      vehiclePlate: '08340-121-06',
      type: 'controle_technique',
      severity: 'high',
      title: 'Contrôle Technique Requis (08340-121-06)',
      message: 'Le certificat de contrôle technique du Master arrive à expiration le 30/09/2026.',
      dueDate: 'Sous 7 jours',
      date: '2026-09-20',
      actionRequired: 'Présenter le véhicule au centre de contrôle agréé Béjaïa.',
      resolved: false,
    },
    // ==================== ALERTES COSIDER ====================
    {
      id: 'alt-cos-1',
      tenantId: 'tenant-cosider',
      vehicleId: 'v-cos-2',
      vehiclePlate: '08220-520-16',
      type: 'vidange_overdue',
      severity: 'high',
      title: 'Vidange Moteur Lourd Recommandée (08220-520-16)',
      message: 'Le kilométrage (128 000 km) approche du seuil de révision Mercedes (135 000 km).',
      dueDate: 'Sous 10 jours',
      date: '2026-11-20',
      actionRequired: 'Programmer la vidange à l\'Atelier Central Rouiba.',
      resolved: false,
    }

  ];

  private activityLogs: SovereignActivityLog[] = [
    {
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
      tenantId: 'tenant-sonatrach',
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
    },

// ==================== ACTIVITY LOGS CEVITAL ====================
    {
      id: 'act-cev-1',
      tenantId: 'tenant-cevital',
      driverName: 'Samira Benabdelkader',
      vehiclePlate: '08340-121-06',
      channel: 'internal_system',
      type: 'mission',
      title: 'Ordre de Mission émis (OM-2026-0701)',
      details: 'Navette Frigorifique Béjaïa - Alger validée.',
      timestamp: '2026-11-23T14:30:00Z',
      status: 'validated',
    },
    // ==================== ACTIVITY LOGS COSIDER ====================
    {
      id: 'act-cos-1',
      tenantId: 'tenant-cosider',
      driverName: 'Walid Boudissa',
      vehiclePlate: '08220-520-16',
      channel: 'internal_system',
      type: 'mission',
      title: 'Ordre de Mission émis (OM-2026-0801)',
      details: 'Terrassement Métro Alger approuvé pour Arocs 8x4.',
      timestamp: '2026-11-23T15:00:00Z',
      status: 'validated',
    }

  ];

  // ===================== TENANTS CRUD =====================

  getTenants(): Tenant[] {
    return this.tenants;
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.find(t => t.id === id);
  }

  addTenant(tenant: Tenant): Tenant {
    this.tenants.push(tenant);
    return tenant;
  }

  // ===================== VEHICLES CRUD =====================

  getVehicles(tenantId?: string): Vehicle[] {
    if (tenantId) {
      return this.vehicles.filter(v => v.tenantId === tenantId);
    }
    return this.vehicles;
  }

  getVehicleById(id: string, tenantId?: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id && (!tenantId || v.tenantId === tenantId));
  }

  getVehicleByPlate(plate: string, tenantId?: string): Vehicle | undefined {
    return this.vehicles.find(v => v.plate === plate && (!tenantId || v.tenantId === tenantId));
  }

  getVehicleByPhone(phone: string, tenantId?: string): Vehicle | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    const last9 = clean.slice(-9);
    const driver = this.drivers.find(d => {
      if (tenantId && d.tenantId !== tenantId) return false;
      const dClean = d.phone.replace(/[^0-9]/g, '');
      return dClean.slice(-9) === last9;
    });
    if (driver) {
      const v = this.vehicles.find(v => v.plate === driver.assignedVehiclePlate && (!tenantId || v.tenantId === tenantId));
      if (v) return v;
    }
    const tenantVehicles = tenantId ? this.getVehicles(tenantId) : this.vehicles;
    return tenantVehicles[0];
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>, tenantId?: string): Vehicle {
    const targetTenant = tenantId || vehicle.tenantId || 'tenant-sonatrach';
    const ptac = vehicle.ptacKg || (vehicle.vehicleCategory === 'PL' ? 19000 : vehicle.vehicleCategory === 'SM' ? 26000 : 2000);
    const newVehicle: Vehicle = {
      ...vehicle,
      tenantId: targetTenant,
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
          tenantId: v.tenantId,
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

  getDrivers(tenantId?: string): Driver[] {
    if (tenantId) {
      return this.drivers.filter(d => d.tenantId === tenantId);
    }
    return this.drivers;
  }

  getDriverById(id: string, tenantId?: string): Driver | undefined {
    return this.drivers.find(d => d.id === id && (!tenantId || d.tenantId === tenantId));
  }

  getDriverByPhone(phone: string, tenantId?: string): Driver | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    const last9 = clean.slice(-9);
    return this.drivers.find(d => {
      if (tenantId && d.tenantId !== tenantId) return false;
      const dClean = d.phone.replace(/[^0-9]/g, '');
      return dClean.slice(-9) === last9;
    });
  }

  addDriver(driver: Omit<Driver, 'id'>, tenantId?: string): Driver {
    const targetTenant = tenantId || driver.tenantId || 'tenant-sonatrach';
    const comments = driver.comments || (driver.managerNotes ? [{
      id: `cmt-${Date.now()}`,
      text: driver.managerNotes,
      date: new Date().toISOString(),
      author: 'Karim Ziani (Exploitation)',
      authorRole: 'fleet_manager',
    }] : []);

    const newDriver: Driver = {
      ...driver,
      tenantId: targetTenant,
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

  getMissions(tenantId?: string): MissionOrder[] {
    if (tenantId) {
      return this.missions.filter(m => m.tenantId === tenantId);
    }
    return this.missions;
  }

  getMissionById(id: string, tenantId?: string): MissionOrder | undefined {
    return this.missions.find(m => m.id === id && (!tenantId || m.tenantId === tenantId));
  }

  addMission(mission: Omit<MissionOrder, 'id' | 'orderNumber' | 'createdAt'>, tenantId?: string): MissionOrder {
    const targetTenant = tenantId || mission.tenantId || 'tenant-sonatrach';
    const count = this.missions.filter(m => m.tenantId === targetTenant).length + 1;
    const year = new Date().getFullYear();
    const orderNumber = `OM-${year}-${String(count).padStart(4, '0')}`;
    const newMission: MissionOrder = {
      ...mission,
      tenantId: targetTenant,
      id: `om-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    this.missions.unshift(newMission);

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

  getInterventions(tenantId?: string): VehicleIntervention[] {
    if (tenantId) {
      return this.interventions.filter(i => i.tenantId === tenantId);
    }
    return this.interventions;
  }

  getInterventionsByVehicle(vehiclePlate: string, tenantId?: string): VehicleIntervention[] {
    return this.interventions.filter(i => i.vehiclePlate === vehiclePlate && (!tenantId || i.tenantId === tenantId));
  }

  getInterventionById(id: string, tenantId?: string): VehicleIntervention | undefined {
    return this.interventions.find(i => i.id === id && (!tenantId || i.tenantId === tenantId));
  }

  addIntervention(data: Omit<VehicleIntervention, 'id' | 'interventionOrderNumber' | 'createdAt'>, tenantId?: string): VehicleIntervention {
    const targetTenant = tenantId || data.tenantId || 'tenant-sonatrach';
    const count = this.interventions.filter(i => i.tenantId === targetTenant).length + 80;
    const year = new Date().getFullYear();
    const orderNumber = `DI-${year}-${String(count + 1).padStart(4, '0')}`;

    const veh = this.vehicles.find(v => v.id === data.vehicleId || v.plate === data.vehiclePlate);
    const natureIntervention = data.natureIntervention || (['vidange_moteur', 'revision_generale', 'pneumatiques', 'controle_technique_repa'].includes(data.type) ? 'preventive' : 'curative');
    const fuelType = data.fuelType || (veh ? veh.fuelType : 'diesel');

    const newItv: VehicleIntervention = {
      ...data,
      tenantId: targetTenant,
      id: `itv-${Date.now()}`,
      interventionOrderNumber: orderNumber,
      natureIntervention,
      fuelType,
      status: 'demande_emise',
      officialSealDI: true,
      createdAt: new Date().toISOString(),
    };

    if (veh && newItv.urgency === 'critique') {
      veh.operationalMissionStatus = 'maintenance';
      veh.status = 'maintenance';
    }

    this.addActivityLog({
      tenantId: targetTenant,
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
      tenantId: itv.tenantId,
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
    receptionDecision: 'conforme_bon_service\' | \'avec_reserves';
    receptionNotes?: string;
    receivedBy: string;
    receivedByRole?: 'maintenance_lead\' | \'super_admin';
  }): VehicleIntervention | undefined {
    const itv = this.interventions.find(i => i.id === id);
    if (!itv) return undefined;

    const targetTenant = itv.tenantId || 'tenant-sonatrach';
    const year = new Date().getFullYear();
    const frCount = this.interventions.filter(i => i.receptionSheetNumber && i.tenantId === targetTenant).length + 80;
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
    itv.receptionDecision = receptionData.receptionDecision || 'conforme_bon_service';
    itv.receptionNotes = receptionData.receptionNotes;
    itv.receivedBy = receptionData.receivedBy;
    itv.receivedByRole = receptionData.receivedByRole || 'maintenance_lead';
    itv.receptionDate = new Date().toISOString().split('T')[0];
    itv.officialSealFR = true;
    itv.status = 'cloturee_receptionnee';

    const veh = this.vehicles.find(v => v.id === itv.vehicleId || v.plate === itv.vehiclePlate);
    if (veh) {
      if (receptionData.odometerInKm && Number(receptionData.odometerInKm) > veh.mileage) {
        veh.mileage = Number(receptionData.odometerInKm);
      }
      veh.operationalMissionStatus = 'reserve_depot';
      veh.status = 'active';

      if (itv.coutInterventionDZD && itv.coutInterventionDZD > 0) {
        veh.totalMaintenanceCostDZD = (veh.totalMaintenanceCostDZD || 0) + itv.coutInterventionDZD;
      }
    }

    this.addMaintenanceRecord({
      tenantId: targetTenant,
      vehicleId: itv.vehicleId,
      vehiclePlate: itv.vehiclePlate,
      type: itv.type === 'vidange_moteur' ? 'vidange' : itv.type === 'freinage' ? 'plaquettes_freins' : itv.type === 'pneumatiques' ? 'pneus' : 'reparation_mecanique',
      costDZD: itv.coutInterventionDZD,
      odometerKm: itv.odometerInKm,
      date: new Date().toISOString().split('T')[0],
      garageName: itv.garageName,
      notes: `Clôture FR ${frNum} suite à DI ${itv.interventionOrderNumber}. Travaux: ${itv.workDoneDetails}`,
      status: 'completed',
    });

    this.addActivityLog({
      tenantId: targetTenant,
      channel: 'internal_system',
      type: 'mission',
      title: `Intervention Réceptionnée (${frNum})`,
      details: `Fiche de Réception validée par ${itv.receivedBy} pour le véhicule ${itv.vehiclePlate}. Montant: ${itv.coutInterventionDZD.toLocaleString('fr-DZ')} DA.`,
      timestamp: new Date().toISOString(),
      status: 'validated',
      driverName: itv.receivedBy,
      vehiclePlate: itv.vehiclePlate
    });

    return itv;
  }

  // ===================== FUEL LOGS & OVERCONSUMPTION =====================

  getFuelLogs(tenantId?: string): FuelLog[] {
    if (tenantId) {
      return this.fuelLogs.filter(l => l.tenantId === tenantId);
    }
    return this.fuelLogs;
  }

  addFuelLog(log: Omit<FuelLog, 'id'>, tenantId?: string): FuelLog {
    const targetTenant = tenantId || log.tenantId || 'tenant-sonatrach';
    const vehicle = this.vehicles.find(v => v.plate === log.vehiclePlate);
    let isOverconsumption = false;
    let calculatedConsumption = 0;

    if (log.odometerKm && vehicle) {
      const previousLog = this.fuelLogs
        .filter(l => l.vehiclePlate === log.vehiclePlate && l.odometerKm && l.odometerKm < log.odometerKm!)
        .sort((a, b) => (b.odometerKm || 0) - (a.odometerKm || 0))[0];

      if (previousLog && previousLog.odometerKm) {
        const distance = log.odometerKm - previousLog.odometerKm;
        if (distance > 50) {
          calculatedConsumption = parseFloat(((log.liters / distance) * 100).toFixed(1));
          if (vehicle.averageConsumption && calculatedConsumption > (vehicle.averageConsumption * 1.25)) {
            isOverconsumption = true;

            this.alerts.unshift({
              id: `alt-${Date.now()}`,
              tenantId: targetTenant,
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
      tenantId: targetTenant,
      id: `fl-${Date.now()}`,
      status: log.status || 'pending',
      isOverconsumption: isOverconsumption || log.isOverconsumption,
      calculatedConsumption: calculatedConsumption || log.calculatedConsumption,
    };
    this.fuelLogs.unshift(newLog);

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

  // ===================== PREPAID CARDS & FUEL VOUCHERS =====================

  getPrepaidFuelCards(tenantId?: string): PrepaidFuelCard[] {
    if (tenantId) {
      return this.prepaidFuelCards.filter(c => c.tenantId === tenantId);
    }
    return this.prepaidFuelCards;
  }

  addPrepaidFuelCard(card: Omit<PrepaidFuelCard, 'id'>, tenantId?: string): PrepaidFuelCard {
    const targetTenant = tenantId || card.tenantId || 'tenant-sonatrach';
    const newCard: PrepaidFuelCard = {
      ...card,
      tenantId: targetTenant,
      id: `pfc-${Date.now()}`,
    };
    this.prepaidFuelCards.push(newCard);
    return newCard;
  }

  getFuelVouchers(tenantId?: string): FuelVoucher[] {
    if (tenantId) {
      return this.fuelVouchers.filter(v => v.tenantId === tenantId);
    }
    return this.fuelVouchers;
  }

  addFuelVoucher(data: Partial<FuelVoucher>, tenantId?: string): FuelVoucher {
    const targetTenant = tenantId || data.tenantId || 'tenant-sonatrach';
    const vCount = this.fuelVouchers.filter(v => v.tenantId === targetTenant).length + 145;
    const voucherNumber = `BR-2026-0${vCount}`;
    const vehicle = this.vehicles.find(v => v.id === data.vehicleId || v.plate === data.vehiclePlate);
    const driver = this.drivers.find(d => d.id === data.driverId || d.name === data.driverName);
    const fuelType = data.fuelType || vehicle?.fuelType || 'diesel';
    const ratePerLiter = fuelType === 'diesel' ? 29.01 : fuelType === 'essence' ? 45.62 : 9.00;
    const quantity = data.quantityRequestedLiters || 40;
    const estimatedAmount = data.estimatedAmountDZD || Math.round(quantity * ratePerLiter);

    const newVoucher: FuelVoucher = {
      id: `bv-${Date.now()}`,
      tenantId: targetTenant,
      voucherNumber,
      date: data.date || new Date().toISOString().split('T')[0],
      vehicleId: vehicle?.id || data.vehicleId || 'v-1',
      vehiclePlate: vehicle?.plate || data.vehiclePlate || '04512-118-16',
      vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : data.vehicleModel || 'Véhicule',
      driverId: driver?.id || data.driverId || 'd-1',
      driverName: driver?.name || data.driverName || 'Chauffeur',
      driverPhone: driver?.phone || data.driverPhone || '',
      stationName: data.stationName || 'Station Naftal Rocade Sud (Chéraga)',
      stationCity: data.stationCity || '16 - Alger',
      fuelType,
      refuelType: data.refuelType || 'partiel_appoint',
      quantityRequestedLiters: quantity,
      estimatedAmountDZD: estimatedAmount,
      prepaidCardId: data.prepaidCardId,
      prepaidCardNumber: data.prepaidCardNumber || 'NAFTAL-CORP-1601',
      issuedBy: data.issuedBy || 'Karim Ziani (Gestionnaire Flotte)',
      issuedAt: new Date().toISOString(),
      notes: data.notes || '',
      status: 'emis',
    };

    this.fuelVouchers.unshift(newVoucher);

    this.addActivityLog({
      tenantId: targetTenant,
      channel: 'internal_system',
      type: 'fuel',
      title: `Bon de Ravitaillement émis (${voucherNumber})`,
      details: `${quantity}L de ${fuelType.toUpperCase()} autorisés pour ${newVoucher.vehiclePlate} (${newVoucher.driverName}) à la station ${newVoucher.stationName}.`,
      timestamp: new Date().toISOString(),
      status: 'validated',
      driverName: newVoucher.driverName,
      vehiclePlate: newVoucher.vehiclePlate,
    });

    return newVoucher;
  }

  completeFuelVoucher(
    voucherId: string, 
    receiptData: {
      stationReceiptNumber: string;
      actualDate: string;
      actualQuantityLiters: number;
      actualAmountDZD: number;
      odometerKm: number;
      receiptPhotoUrl?: string;
    }
  ): { voucher: FuelVoucher; fuelLog: FuelLog } | undefined {
    const voucher = this.fuelVouchers.find(v => v.id === voucherId);
    if (!voucher) return undefined;

    const targetTenant = voucher.tenantId || 'tenant-sonatrach';
    const vehicle = this.vehicles.find(v => v.plate === voucher.vehiclePlate);
    const previousOdometer = vehicle?.mileage || (receiptData.odometerKm - 350);
    const distance = Math.max(1, receiptData.odometerKm - previousOdometer);

    const consumption = parseFloat(((receiptData.actualQuantityLiters / distance) * 100).toFixed(1));

    const theoreticalConso = vehicle?.averageConsumption || 8.0;
    const isOverconsumption = consumption > (theoreticalConso * 1.20);

    if (voucher.prepaidCardId) {
      const card = this.prepaidFuelCards.find(c => c.id === voucher.prepaidCardId);
      if (card) {
        card.currentBalanceDZD = Math.max(0, card.currentBalanceDZD - receiptData.actualAmountDZD);
        if (card.currentBalanceDZD < 25000) {
          card.status = 'low_balance';
        }
      }
    }

    voucher.status = 'ravitaille';
    voucher.stationReceiptNumber = receiptData.stationReceiptNumber;
    voucher.actualDate = receiptData.actualDate;
    voucher.actualQuantityLiters = receiptData.actualQuantityLiters;
    voucher.actualAmountDZD = receiptData.actualAmountDZD;
    voucher.odometerKm = receiptData.odometerKm;
    voucher.previousOdometerKm = previousOdometer;
    voucher.distanceDrivenKm = distance;
    voucher.calculatedConsumption = consumption;
    voucher.receiptPhotoUrl = receiptData.receiptPhotoUrl || generateSampleStationReceipt(
      receiptData.stationReceiptNumber,
      receiptData.actualDate,
      voucher.stationName,
      voucher.vehiclePlate,
      voucher.driverName,
      receiptData.actualQuantityLiters,
      receiptData.actualAmountDZD,
      receiptData.odometerKm
    );
    voucher.completedAt = new Date().toISOString();

    if (vehicle && receiptData.odometerKm > vehicle.mileage) {
      vehicle.mileage = receiptData.odometerKm;
    }

    const newLog: FuelLog = {
      id: `fl-${Date.now()}`,
      tenantId: targetTenant,
      vehicleId: voucher.vehicleId,
      vehiclePlate: voucher.vehiclePlate,
      driverId: voucher.driverId,
      driverName: voucher.driverName,
      amountDZD: receiptData.actualAmountDZD,
      liters: receiptData.actualQuantityLiters,
      pricePerLiterDZD: parseFloat((receiptData.actualAmountDZD / receiptData.actualQuantityLiters).toFixed(2)),
      date: receiptData.actualDate,
      odometerKm: receiptData.odometerKm,
      previousOdometerKm: previousOdometer,
      distanceDrivenKm: distance,
      stationName: voucher.stationName,
      city: voucher.stationCity,
      receiptPhotoUrl: voucher.receiptPhotoUrl,
      status: 'verified',
      source: 'voucher_receipt',
      refuelType: voucher.refuelType,
      voucherNumber: voucher.voucherNumber,
      stationReceiptNumber: receiptData.stationReceiptNumber,
      prepaidCardNumber: voucher.prepaidCardNumber,
      notes: `Ravitaillement rapproché — Bon ${voucher.voucherNumber} (${voucher.refuelType === 'partiel_appoint' ? 'Appoint' : 'Plein'}) — Carte ${voucher.prepaidCardNumber || 'Prépayée'}`,
      isOverconsumption,
      calculatedConsumption: consumption,
    };

    this.fuelLogs.unshift(newLog);

    if (isOverconsumption && vehicle) {
      this.alerts.unshift({
        id: `alt-fuel-${Date.now()}`,
        tenantId: targetTenant,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        type: 'surconsommation',
        severity: 'high',
        title: `Alerte Surconsommation : ${consumption} L/100km`,
        message: `Surconsommation anormale relevée sur ${vehicle.plate} (${vehicle.make} ${vehicle.model}). Ravitaillement de ${receiptData.actualQuantityLiters}L pour ${distance} km parcourus (${consumption} L/100km contre ${theoreticalConso} L/100km constructeur, écart +${Math.round(((consumption - theoreticalConso) / theoreticalConso) * 100)}%).`,
        dueDate: 'Sous 48h',
        date: new Date().toISOString().split('T')[0],
        actionRequired: 'Contrôler la pression pneumatique, remplacer les filtres et inspecter le système d\'injection.',
        resolved: false,
      });
    }

    this.addActivityLog({
      tenantId: targetTenant,
      channel: 'internal_system',
      type: 'fuel',
      title: `Ravitaillement validé (${receiptData.stationReceiptNumber})`,
      details: `${receiptData.actualQuantityLiters}L servis (${receiptData.actualAmountDZD.toLocaleString('fr-DZ')} DA). Compteur : ${receiptData.odometerKm} km (Conso : ${consumption} L/100km).`,
      timestamp: new Date().toISOString(),
      status: 'validated',
      driverName: voucher.driverName,
      vehiclePlate: voucher.vehiclePlate,
    });

    return { voucher, fuelLog: newLog };
  }

  // ===================== MAINTENANCE & ACCIDENTS =====================

  getMaintenanceRecords(tenantId?: string): MaintenanceRecord[] {
    if (tenantId) {
      return this.maintenanceRecords.filter(m => m.tenantId === tenantId);
    }
    return this.maintenanceRecords;
  }

  addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>, tenantId?: string): MaintenanceRecord {
    const targetTenant = tenantId || record.tenantId || 'tenant-sonatrach';
    const newRecord: MaintenanceRecord = {
      ...record,
      tenantId: targetTenant,
      id: `mr-${Date.now()}`,
    };
    this.maintenanceRecords.unshift(newRecord);
    
    const v = this.vehicles.find(veh => veh.plate === newRecord.vehiclePlate);
    if (v && newRecord.type === 'vidange') {
      v.lastServiceKm = newRecord.odometerKm;
      v.nextServiceKm = newRecord.odometerKm + 10000;
      this.alerts.forEach(a => {
        if (a.vehiclePlate === v.plate && a.type === 'vidange_overdue') {
          a.resolved = true;
        }
      });
    }
    return newRecord;
  }

  getAccidentClaims(tenantId?: string): AccidentClaim[] {
    if (tenantId) {
      return this.accidentClaims.filter(c => c.tenantId === tenantId);
    }
    return this.accidentClaims;
  }

  addAccidentClaim(claim: Omit<AccidentClaim, 'id' | 'claimNumber'>, tenantId?: string): AccidentClaim {
    const targetTenant = tenantId || claim.tenantId || 'tenant-sonatrach';
    const count = this.accidentClaims.filter(c => c.tenantId === targetTenant).length + 1;
    const year = new Date().getFullYear();
    const claimNumber = `SIN-${year}-${String(count).padStart(4, '0')}`;
    const newClaim: AccidentClaim = {
      ...claim,
      tenantId: targetTenant,
      id: `acc-${Date.now()}`,
      claimNumber,
    };
    this.accidentClaims.unshift(newClaim);

    const v = this.vehicles.find(veh => veh.plate === newClaim.vehiclePlate);
    if (v) {
      v.status = 'accident';
    }

    this.alerts.unshift({
      id: `alt-${Date.now()}`,
      tenantId: targetTenant,
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

  getAlerts(tenantId?: string): FleetAlert[] {
    if (tenantId) {
      return this.alerts.filter(a => a.tenantId === tenantId);
    }
    return this.alerts;
  }

  resolveAlert(alertId: string): boolean {
    const alt = this.alerts.find(a => a.id === alertId);
    if (!alt) return false;
    alt.resolved = true;
    return true;
  }

  getActivityLogs(tenantId?: string): SovereignActivityLog[] {
    if (tenantId) {
      return this.activityLogs.filter(l => l.tenantId === tenantId);
    }
    return this.activityLogs;
  }

  addActivityLog(log: Omit<SovereignActivityLog, 'id'>, tenantId?: string): SovereignActivityLog {
    const targetTenant = tenantId || log.tenantId || 'tenant-sonatrach';
    const newLog: SovereignActivityLog = {
      ...log,
      tenantId: targetTenant,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.activityLogs.unshift(newLog);
    return newLog;
  }
}

export const fleetDb = new FleetDatabase();
