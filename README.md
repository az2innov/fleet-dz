# Dz-Fleet AI — Système Intégré de Gestion de Flotte Automobile & Mobilité (Algérie)

Solution SaaS et mobile souveraine, conçue sur mesure pour les entreprises privées, les groupes industriels et les établissements publics algériens.

Conforme aux exigences réglementaires nationales (**Loi 18-07 relative à la protection des données à caractère personnel / ANPDP**, normes de circulation routière, contrôles de la Gendarmerie Nationale et de la DGSN) avec une gestion opérationnelle de pointe : sécurité d'accès renforcée (**A2F TOTP / RBAC**), pilotage analytique des coûts en Dinars Algériens (DA), suivi du carburant Naftal et expérience chauffeur intuitive en mode déconnecté (PWA Offline-First).

---

## 1. Architecture & Sécurité de Niveau Entreprise

### Authentification Forte & A2F (Double Facteur)
* Connexion sécurisée des gestionnaires et administrateurs avec validation par mot de passe et code à usage unique (TOTP / Google Authenticator / FreeOTP).
* Contrôle d'accès basé sur les rôles (**RBAC**) :
  * **Super Administrateur** : Configuration souveraine, audit de sécurité, attribution des rôles.
  * **Gestionnaire de Flotte** : CRUD véhicules, chauffeurs, ordres de mission, suivi carburant et sinistres.
  * **Responsable Maintenance** : Fiches pneumatiques, alertes vidanges, révisions et passages en contrôle technique.
  * **Contrôleur de Gestion** : Suivi financier des budgets en DA, détection des surconsommations, péages et per diem.
  * **Chauffeur / Conducteur** : Interface smartphone PWA, relevé odomètre, scan tickets Naftal, déclaration express et ordre de mission embarqué.

### Hébergement Souverain & Chiffrement de Bout en Bout
* Hébergement 100% sur le territoire national algérien (Datacenter Alger).
* Protocoles stricts HTTPS / TLS 1.3 avec bac à sable (**Sandboxing PWA**) immunisé contre les virus et malwares mobiles (sans nécessité d'APK tiers non sécurisé).
* Conformité totale avec les directives de l'**ANPDP** pour le traitement des données de localisation et d'identité en Algérie (purge automatique des traces GPS après 30 jours, consentement explicite).

---

## 2. Espace Administrateur & Gestionnaire de Flotte (Back-Office)

### A. Gestion du Parc de Véhicules (CRUD Complet)
* **Cycle de vie des véhicules** : Ajout, modification, consultation détaillée, mise en maintenance atelier ou réforme administrative.
* **Immatriculation algérienne normalisée** : Format matricule officiel (ex: `04512-118-16` avec code wilaya et année).
* **Fiches techniques détaillées** : Marque, modèle, motorisation (*Gasoil à 29.01 DA/L, Sans Plomb à 45.62 DA/L, Sirghaz/GPL à 9.00 DA/L*), consommation mixte constructeur, kilométrage direct et **état des pneumatiques** (usure en % AVD, AVG, ARD, ARG).
* **Suivi des Échéances Réglementaires** : Alertes automatisées avant expiration de l'Assurance automobile (**CAAT, SAA, CASH, CIAR, 2A, GAM**), du Contrôle Technique et de la Vignette fiscale.

### B. Gestion des Chauffeurs & Conducteurs (CRUD Complet)
* **Fiches profils complètes** : État civil, téléphone (+213), wilaya, date d'embauche, direction/service de rattachement, groupe sanguin et contact d'urgence famille.
* **Permis de conduire** : Suivi des catégories détenues (**B, C, D, E, Transport en commun**), dates de validité et **visites médicales professionnelles périodiques** obligatoires (avec alertes d'expiration).
* **Affectation & Disponibilité** : Attribution d'un véhicule titulaire ou statut dynamique (*Disponible, En mission, En repos/congé, En formation*).

### C. Gestion des Parcours, Trajets & Ordres de Mission
* **Catalogue des trajets & missions** : Création des circuits logistiques (ville/wilaya de départ, étapes intermédiaires, destination, calcul automatique des distances en km).
* **Affectation dynamique** : Association d'un véhicule disponible et d'un chauffeur qualifié avec budget estimatif carburant, frais de péage autoroutier et indemnités journalières de déplacement (*per diem*) en Dinars Algériens (DA).
* **Édition d'Ordres de Mission officiels** : Génération et impression du document réglementaire conforme aux contrôles de la **Gendarmerie Nationale (1055)** et de la **Sûreté Nationale / Police (1548)** (en-tête officiel de la République, cachet humide, signature, QR code de contrôle et visa Loi 18-07).

### D. Supervision Opérationnelle, Coûts & Intelligence Artificielle
* **Suivi Carburant & Énergie** : Historique des pleins Naftal, détection automatisée des **surconsommations anormales** (> +25% vs mixte constructeur) et vérification automatique des tickets scannés par vision IA (**Gemini**).
* **Déclaration & Instruction des Sinistres** : Gestion des dossiers d'accidents, analyse photographique des dommages par IA, transmission instantanée aux compagnies d'assurance conventionnées (**SAA, CAAT, CASH, CIAR**) et impression du rapport d'expertise IA.
* **Tableau de Bord Exécutif** : KPIs financiers en direct (Dépense carburant totale en DA, Taux de disponibilité du parc en %, Kilométrage total parcouru, Émissions de CO₂ estimées en tonnes/kg, Missions actives).

---

## 3. Espace Conducteur — Application Mobile PWA & Compagnon Connecté

### A. Application PWA Mobile Ultra-Rapide (Android / iOS)
* **Résilience Totale Hors-Ligne (Offline-First)** : Fonctionnement garanti sur les axes routiers sahariens (RN1, RN49, etc.) ou autoroutiers sans couverture 3G/4G, avec stockage local chiffré et synchronisation automatique en tâche de fond dès le retour du réseau.
* **Relevé Kilométrique Quotidien** : Mise à jour simplifiée du compteur odomètre à la prise de poste et au retour de mission.
* **Saisie & Numérisation des Pleins Naftal** : Saisie en Dinars Algériens avec capture photo du ticket de caisse et lecture automatique OCR par IA (Gemini).
* **Déclaration Express d'Accident / Panne** : Formulaire guidé de constat avec photos des chocs, tiers impliqué, rapport de police et géolocalisation.
* **Géolocalisation Satellite en 1 Clic** : Acquisition instantanée des coordonnées GPS réelles du véhicule pour certifier le lieu d'un plein ou d'un incident.

### B. Canaux Alternatifs & Confort d'Usage
* **Compagnon WhatsApp / Messagerie** : Déclaration d'un plein ou du compteur par simple message texte ou photo de ticket, traité instantanément par le bot IA.
* **Fiche de Mission Embarquée** : Consultation directe sur le smartphone du trajet assigné, des étapes autorisées, du per diem en DA, des numéros d'urgence nationaux (1055, 1548, 14) et affichage plein écran de l'Ordre de Mission officiel numérisé lors des contrôles routiers.

---

## Démarrage & Exécution

### Prérequis
* Node.js (>= 18) ou Bun
* Clé API Google Gemini (`GEMINI_API_KEY`) pour l'OCR des tickets Naftal et l'analyse visuelle des sinistres.

### Installation & Lancement
```bash
# 1. Cloner ou ouvrir le dossier du projet
cd ./fleet

# 2. Installer les dépendances
npm install
# ou avec bun :
bun install

# 3. Configurer la clé Gemini
cp .env.example .env
# Renseigner GEMINI_API_KEY=...

# 4. Lancer le serveur et l'application (Port 3000)
npm run dev
# ou avec bun :
bun run dev
```

Accédez à la plateforme sur `http://localhost:3000` (Espace Back-Office Gestionnaire & Flotte) ou `http://localhost:3000/?view=pwa` (Espace Conducteur Smartphone).
