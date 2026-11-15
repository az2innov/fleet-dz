# Dz-Fleet AI — Cahier de Recette & Guide des Testeurs
**Système Souverain de Gestion de Flotte Automobile (Algérie)**  
*Version : 2.4.0 (Dev / Validation)* • *Date : Novembre 2026*

---

## 🎯 Objectif de la Campagne de Test
Ce mémo a pour but de guider les équipes et collaborateurs (direction générale, gestionnaires de parc, responsables logistique & maintenance, contrôleurs de gestion, conducteurs) dans la validation globale des fonctionnalités de **Dz-Fleet AI**, tant sur la console de gestion (ordinateur) que sur l'application embarquée mobile (smartphone Android / iPhone).

---

## 🔗 Liens d'Accès & Environnement

| Élément | URL / Coordonnées | Remarques |
| :--- | :--- | :--- |
| **Portail Gestionnaire (PC / Tablette)** | [https://fleet-dz.onrender.com](https://fleet-dz.onrender.com) | Console centrale de supervision |
| **PWA Conducteur (Smartphone)** | [https://fleet-dz.onrender.com/?view=pwa](https://fleet-dz.onrender.com/?view=pwa) | Application mobile dédiée chauffeur |
| **Boîte de Réception E-mails (Mailtrap)** | [https://mailtrap.io](https://mailtrap.io) | Réception des codes A2F et alertes |
| **Code Maître A2F de Secours** | `999999` | Code universel de validation rapide |

---

## 👥 Comptes & Profils de Test (Rôles RBAC)

Pour tester la sécurité et la stricte séparation des responsabilités, 5 rôles souverains sont configurés :

| Rôle | Email Officiel | Périmètre & Droits Principaux |
| :--- | :--- | :--- |
| **Super Administrateur** | `admin@fleet-dz.com` | DSI, sécurité, conformité Loi 18-07 ANPDP, journal d'audit des accès |
| **Gestionnaire de Flotte** | `gestion@fleet-dz.com` | Ajout/modification de véhicules, fiches chauffeurs, ordres de mission |
| **Responsable Maintenance** | `maintenance@fleet-dz.com` | Suivi des vidanges (10 000 km), usure pneumatiques, contrôles techniques |
| **Contrôleur de Gestion** | `audit@fleet-dz.com` | Budgets missions, analyse dépenses Naftal en Dinars (DA), surconsommations |
| **Conducteur / Chauffeur** | `drivers@fleet-dz.com` | Saisie odomètre, scan tickets Naftal (OCR), ordres de mission mobiles |

---

## 🛡️ Matrice de Responsabilités : Qui Fait Quoi par Profil ?

Cette section détaille pour chacun des 5 profils :
1. Sa **mission globale** et son niveau de privilège dans le système.
2. Ses **tâches opérationnelles quotidiennes** sur la plateforme.
3. Son **rôle dans la recette** (scénarios de test à exécuter ou à valider).
4. Ses **critères d'acceptation et livrables**.

---

### 1. 👑 Super Administrateur (`admin@fleet-dz.com`)

* **Mission Principale :**  
  Direction des Systèmes d'Information (DSI), gouvernance informatique, sécurité souveraine des accès et garantie de conformité légale à la Loi 18-07 ANPDP relative à la protection des données à caractère personnel.
* **Ce qu'il fait dans l'application (Au quotidien) :**
  - **Gouvernance des accès & RBAC :** Contrôle des droits des utilisateurs et application du principe du moindre privilège.
  - **Sécurité & Authentification A2F :** Surveillance de la passerelle d'envoi SMTP (codes à 6 chiffres par email) et maintien de la clé maîtresse de secours (`999999`).
  - **Audit de Sécurité Souverain :** Consultation des journaux d'événements immuables (historique des connexions, modifications de parc, annulations de mission, suppressions).
  - **Conformité Réglementaire ANPDP :** Supervision du stockage 100% hébergé en Algérie, du chiffrement des données sensibles (AES-256) et de la purge automatique sous 30 jours des coordonnées GPS.
  - **Génération d'Attestations :** Export et signature électronique de la déclaration officielle de conformité ANPDP.
* **Son Rôle dans la Recette (Ce qu'il teste) :**
  - **Scénario T01 (Responsable & Validateur) :** Authentification A2F par email réel via Mailtrap, réception du code et inscription de la session dans les logs d'audit.
  - **Scénario T09 (Responsable & Validateur) :** Contrôle des mentions ANPDP Loi 18-07, téléchargement de la déclaration `.txt` et test d'impression de l'attestation officielle.
  - **Scénario T10 (Co-validateur) :** Validation du rendu visuel de la console de supervision en Mode Jour et Mode Nuit (Obsidian Midnight).

---

### 2. 🚛 Gestionnaire de Flotte (`gestion@fleet-dz.com`)

* **Mission Principale :**  
  Pilotage opérationnel de la flotte automobile, affectation des chauffeurs aux véhicules, émission des Ordres de Mission officiels et suivi de la disponibilité du parc.
* **Ce qu'il fait dans l'application (Au quotidien) :**
  - **Gestion du Parc Automobile :** Enregistrement, modification et déclassement des véhicules (numéro d'immatriculation algérien, marque, modèle, type de carburant, date de mise en service).
  - **Gestion des Conducteurs :** Fiches chauffeurs, numéro de permis de conduire, numéro de téléphone portable, wilaya de rattachement et véhicule assigné.
  - **Génération des QR Codes d'Appairage :** Création en un clic du QR Code personnalisé permettant au conducteur de lier son smartphone à son véhicule.
  - **Émission des Ordres de Mission (OM) :** Planification des trajets inter-wilayas aux normes nationales algériennes, étapes autorisées (ex: Djelfa, Ghardaïa, Ouargla), péages et per diem.
  - **Instruction des Sinistres :** Réception et validation des déclarations d'accident envoyées par les chauffeurs depuis le terrain avec coordonnées GPS et photos.
* **Son Rôle dans la Recette (Ce qu'il teste) :**
  - **Scénario T03 (Responsable PC) :** Génération du QR Code Chauffeur depuis l'onglet *Chauffeurs* et vérification de la bonne affectation du véhicule (*Renault Symbol 04512-118-16*).
  - **Scénario T07 (Rédacteur & Validateur) :** Création complète d'un Ordre de Mission (*Alger → Hassi Messaoud*), vérification du circuit imposé et contrôle du document officiel généré.
  - **Scénario T08 (Validateur Dossier) :** Réception de la déclaration de sinistre transmise par le smartphone, vérification des photos de dommages et des coordonnées GPS.
  - **Scénario T02 (Superviseur) :** Validation du déploiement de la PWA sur les smartphones des conducteurs de son équipe.

---

### 3. 🔧 Responsable de Maintenance (`maintenance@fleet-dz.com`)

* **Mission Principale :**  
  Disponibilité technique des véhicules, sécurité mécanique, préservation du capital automobile et déclenchement prédictif des entretiens.
* **Ce qu'il fait dans l'application (Au quotidien) :**
  - **Maintenance Prédictive des Vidanges :** Surveillance continue des odomètres réels saisis par les chauffeurs et détection des échéances de révision moteur (palier standard de 10 000 km).
  - **Gestion des Alertes Mécaniques :** Prise en charge des alertes critiques de dépassement kilométrique et acquittement d'intervention (*« Marquer Résolu »*).
  - **Surveillance de l'Usure des Pneumatiques :** Suivi visuel et kilométrique des 4 pneumatiques par véhicule, planification des permutations et des renouvellements.
  - **Contrôles Techniques Légaux :** Gestion du calendrier des visites obligatoires de contrôle technique automobile.
  - **Historique Technique :** Suivi des interventions préventives et curatives réalisées en atelier ou chez les concessionnaires partenaires.
* **Son Rôle dans la Recette (Ce qu'il teste) :**
  - **Scénario T06 (Responsable & Validateur) :** Constat de l'apparition d'une alerte rouge de priorité haute sur le tableau de bord dès qu'un chauffeur déclare un odomètre critique (ex: `95 000 km`).
  - **Acquittement de Maintenance :** Test de la prise en charge et de la résolution de l'alerte vidange (*« Marquer Résolu »*).
  - **Vérification État Véhicules :** Contrôle de la visibilité des jauges d'usure des pneumatiques dans l'onglet *Véhicules*.
  - **Consultation Sinistres (Volet Réparations) :** Évaluation des dégâts matériels sur les sinistres déclarés (T08) pour estimation des réparations d'atelier.

---

### 4. 📊 Contrôleur de Gestion (`audit@fleet-dz.com`)

* **Mission Principale :**  
  Maîtrise des coûts d'exploitation de la flotte en Dinars Algériens (DZD / DA), audit des dépenses en carburant Naftal et détection des surconsommations anormales.
* **Ce qu'il fait dans l'application (Au quotidien) :**
  - **Audit des Dépenses Carburant :** Consolidation en temps réel des ravitaillements en Dinars (DA) par véhicule, par station-service et par chauffeur.
  - **Conformité aux Barèmes Officiels Naftal :** Contrôle de l'application rigoureuse de la grille tarifaire nationale algérienne :
    * Gasoil : **29,01 DA / Litre**
    * Essence Sans Plomb : **45,62 DA / Litre**
    * GPL / Sirghaz : **9,00 DA / Litre**
  - **Détection des Surconsommations :** Analyse comparative de la consommation moyenne (L/100 km) par rapport aux données constructeur (seuil d'alerte à +15%).
  - **Audit des Frais de Mission :** Vérification des indemnités de déplacement (per diem), des frais de péage et des nuitées allouées dans les Ordres de Mission.
  - **Rapprochement Financier & Export :** Rapprochement entre les tickets Naftal scannés et les relevés des cartes carburant d'entreprise ; export comptable au format CSV / Excel.
* **Son Rôle dans la Recette (Ce qu'il teste) :**
  - **Scénario T04 (Auditeur Financier) :** Vérification de la prise en compte immédiate d'un ticket Naftal scanné par un chauffeur dans le total des dépenses de la flotte en Dinars (DA).
  - **Scénario T07 (Contrôleur Budgétaire) :** Audit du calcul automatique de l'allocation carburant estimée (distance × barème) et des frais de péage lors de la création d'un Ordre de Mission.
  - **Conformité Monétaire :** S'assurer de la stricte conformité des montants affichés en Dinars Algériens (DA).

---

### 5. 📱 Conducteur / Chauffeur (`drivers@fleet-dz.com`)

* **Mission Principale :**  
  Exécution sur le terrain des missions de transport, conservation du véhicule en bon état, déclaration quotidienne des compteurs et traçabilité des frais de route.
* **Ce qu'il fait dans l'application (Au quotidien) :**
  - **Application Mobile Embarquée (PWA) :** Utilisation sur smartphone sans contrainte de réseau, opérationnelle même en zone blanche désertique.
  - **Relevé Quotidien de l'Odomètre :** Saisie du kilométrage de départ et d'arrivée de chaque vacation.
  - **Numérisation Instantanée des Tickets Naftal :** Prise de photo du ticket ou reçu de station-service avec reconnaissance automatique par IA (OCR) du litrage, du montant en DA et du nom de la station.
  - **Présentation de l'Ordre de Mission Numérique :** Présentation du document officiel avec visa électronique et QR code lors des contrôles routiers (Gendarmerie Nationale, Police).
  - **Déclaration Express d'Accrochage :** Enregistrement immédiat des photos des dommages et certification des coordonnées GPS en cas d'accident sur la route.
  - **Sauvegarde Hors-Ligne Automatique :** Enregistrement local des opérations en zone sans réseau avec synchronisation automatique et silencieuse dès le retour de la 4G.
* **Son Rôle dans la Recette (Ce qu'il teste) :**
  - **Scénario T02 (Acteur Mobile) :** Installation de la PWA sur son smartphone personnel ou professionnel (Chrome sur Android ou Safari sur iPhone) et ajout sur l'écran d'accueil.
  - **Scénario T03 (Acteur Mobile) :** Scan du QR Code remis par le gestionnaire et vérification de la mémorisation automatique de son profil conducteur.
  - **Scénario T04 (Acteur Mobile) :** Prise de photo d'un ticket Naftal avec l'appareil photo du smartphone et vérification de l'extraction OCR par l'IA.
  - **Scénario T05 (Acteur Mobile) :** Activation du Mode Avion (simulation Sahara), constat du voyant `🟠 Zone Blanche`, saisie d'un odomètre en attente, puis désactivation du Mode Avion et synchronisation `🟢 En ligne`.
  - **Scénario T06 (Acteur Mobile) :** Saisie d'un relevé kilométrique supérieur à l'échéance de vidange pour vérifier la transmission instantanée à la maintenance.
  - **Scénario T08 (Acteur Mobile) :** Déclaration de sinistre avec capture photo et actualisation du pointage GPS certifié.

---

### 📊 Tableau Récapitulatif RACI (Scénarios de Test × Profils)

**Légende RACI :**
* **R (Réalisateur / Testeur actif) :** Exécute l'action de test sur son interface (PC ou Mobile).
* **A (Approbateur / Validateur) :** Vérifie le résultat métier et accorde le statut CONFORME.
* **C (Consulté) :** Fournit des données d'entrée ou analyse l'impact.
* **I (Informé) :** Reçoit le résultat, la notification ou l'alerte automatique.

| Réf | Scénario de Test | Super Admin | Gestionnaire Flotte | Resp. Maintenance | Contrôleur Gestion | Conducteur Chauffeur |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **T01** | **Connexion A2F sécurisée par email (SMTP)** | **R / A** | I | I | I | I |
| **T02** | **Installation PWA sur Smartphone (iOS/Android)** | I | **A** | - | - | **R** |
| **T03** | **Liaison Chauffeur & Véhicule par QR Code** | I | **R** | I | - | **R / A** |
| **T04** | **Plein Naftal & Scanner Photo OCR (IA)** | - | I | I | **A** | **R** |
| **T05** | **Continuité Hors-Ligne (Sahara / RN1)** | I | **A** | - | - | **R** |
| **T06** | **Alerte Vidange & Maintenance Prédictive** | I | I | **R / A** | - | **R** *(saisie km)* |
| **T07** | **Création & Visa Ordre de Mission Officiel** | - | **R / A** | - | **C** *(barème DA)* | **R** *(consultation)* |
| **T08** | **Déclaration Sinistre & Géolocalisation GPS** | I | **A** *(dossier)* | **C** *(réparation)* | - | **R** *(constat mobile)* |
| **T09** | **Conformité ANPDP Loi 18-07 & Registre** | **R / A** | I | - | **C** | - |
| **T10** | **Ergonomie Mode Jour & Mode Nuit (Obsidian)** | **R / A** | **R / A** | **R / A** | **R / A** | **R / A** |

---

## 📱 Guide Pas-à-Pas : Installation de la PWA Conducteur (Android & iPhone)

L'application **Dz-Fleet AI Conducteur** est une **PWA (Progressive Web App)** : elle ne nécessite aucun téléchargement sur le Play Store ou l'App Store, n'encombre pas la mémoire du téléphone, fonctionne hors-ligne (Sahara/RN1) et s'installe directement sous forme d'icône d'application native en 10 secondes.

---

### 🟢 Procédure sur Smartphone Android (Samsung, Xiaomi, Oppo, Realme, etc.)

> [!TIP] Navigateurs recommandés : **Google Chrome** ou **Microsoft Edge**.

1. **Accéder à l'application :**
   * Ouvrez l'application **Google Chrome** (ou **Edge**).
   * Saisissez l'adresse : **`https://fleet-dz.onrender.com/?view=pwa`** *(ou scannez le QR Code fourni par votre gestionnaire)*.
2. **Déclencher l'installation de l'icône :**
   * Une bannière verte apparaît en haut de l'écran : touchez **« 📲 Installer l'icône sur votre téléphone »**.
   * *Méthode alternative :* Si la bannière n'apparaît pas, appuyez sur les **trois petits points verticaux (⋮)** en haut à droite de Chrome, puis sélectionnez **« Installer l'application »** (ou *« Ajouter à l'écran d'accueil »*).
3. **Valider :**
   * Appuyez sur **« Installer »** dans la boîte de dialogue de confirmation.
4. **Lancement :**
   * Quittez Chrome. Une icône verte officielle **DZ-FLEET** est désormais installée sur votre écran d'accueil avec vos autres applications.
   * Touchez l'icône : l'application s'ouvre en **plein écran immersif**, sans barre d'adresse.

> [!WARNING] Piège fréquent sur Android (Navigateur intégré) :
> Si vous avez cliqué sur le lien depuis une application de messagerie (WhatsApp, Viber, SMS ou Gmail), la page peut s'ouvrir dans un affichage temporaire "in-app". Dans ce cas, appuyez sur les **trois points (⋮)** en haut à droite et choisissez **« Ouvrir dans le navigateur Chrome »** pour faire apparaître l'option d'installation.

---

### 🍎 Procédure sur iPhone & iPad (Apple iOS)

> [!IMPORTANT] Règle stricte d'Apple :
> Sur iOS, Apple **impose obligatoirement** d'utiliser le navigateur natif **Safari** pour ajouter une application sur l'écran d'accueil. Les navigateurs tiers (Opera, Chrome iOS, Firefox) n'ont pas l'autorisation d'installer des PWA.

1. **Ouvrir Safari :**
   * Lancez impérativement l'application **Safari** (icône de la boussole bleue).
2. **Saisir l'adresse exacte :**
   * Dans la **barre d'adresse** de Safari (en haut ou en bas selon votre version d'iOS), écrivez :  
     **`https://fleet-dz.onrender.com/?view=pwa`** *(ou scannez le QR Code du chauffeur avec l'appareil photo de l'iPhone)*.
   * *(Attention : veillez à saisir le lien dans la barre d'adresse de Safari et non dans un champ de recherche Google).*
3. **Menu Partager :**
   * En bas de l'écran de Safari, touchez le bouton **Partager** (le carré avec une flèche orientée vers le haut : `⎋` ou `[↑]`).
4. **Ajouter à l'écran d'accueil :**
   * Faites défiler le menu d'actions vers le bas et touchez la ligne **« Sur l'écran d'accueil »** (accompagnée d'une petite icône `➕`).
5. **Confirmer :**
   * En haut à droite, touchez le bouton **« Ajouter »**.
6. **Lancement :**
   * L'icône officielle **DZ-FLEET** apparaît immédiatement sur votre écran d'accueil d'iPhone.
   * Dès que vous appuyez dessus, l'application se lance comme une application native de l'App Store, en plein écran total.

---

### 🔑 Astuce : Liaison Automatique du Profil Conducteur par QR Code

Chaque véhicule ou chauffeur peut recevoir son lien personnalisé :
* Le gestionnaire se rend sur son PC dans l'onglet **« Chauffeurs »** et clique sur **« QR Chauffeur »**.
* Le chauffeur scanne ce QR Code une seule fois avec son smartphone lors de l'installation.
* L'application mémorise définitivement son identité : le chauffeur n'a plus jamais besoin de se connecter ou de saisir son nom, son écran affiche directement sa fiche vérifiée, son véhicule attitré et ses missions !

---

## 📋 Scénarios de Test Détaillés

### Scénario 1 : Authentification Sécurisée A2F par Email Réel (SMTP)
* **Profils impliqués :** Super Administrateur (Réalisateur & Validateur).
* **Objectif :** Valider l'envoi et la vérification du code à 6 chiffres par email via Mailtrap.
* **Étapes :**
  1. Sur le portail PC, cliquez sur le badge de rôle ou l'avatar en haut à droite.
  2. Sélectionnez un profil (ex: **Super Administrateur** `admin@fleet-dz.com`).
  3. Cliquez sur **« Envoyer le code de validation par email »**.
  4. Rendez-vous sur votre boîte de réception **Mailtrap** pour récupérer le code à 6 chiffres.
  5. Saisissez le code dans l'application pour valider la session.
* **Résultat Attendu :** Session validée, notification de succès, inscription de l'action dans le journal d'audit souverain.

---

### Scénario 2 : Installation & Utilisation de la PWA Conducteur sur Smartphone
* **Profils impliqués :** Conducteur / Chauffeur (Réalisateur terrain) | Gestionnaire de Flotte (Approbateur).
* **Objectif :** Valider l'accès et l'installation de l'application sur smartphone Android et iPhone.
* **Étapes sur Android :**
  1. Ouvrez l'adresse dans **Google Chrome** ou **Edge** : `https://fleet-dz.onrender.com/?view=pwa`.
  2. Cliquez sur la bannière **« 📲 Installer l'icône sur votre téléphone »** (ou menu ⋮ > *Installer l'application*).
  3. Quittez le navigateur et lancez l'application depuis la nouvelle icône sur l'écran d'accueil.
* **Étapes sur iPhone :**
  1. Ouvrez obligatoirement l'adresse dans **Apple Safari**.
  2. Touchez le bouton **Partager** (carré avec flèche vers le haut ⎋ en bas).
  3. Touchez **« Sur l'écran d'accueil » (➕)** puis **« Ajouter »**.
  4. Lancez l'application depuis l'icône sur votre écran d'accueil.
* **Résultat Attendu :** L'application s'ouvre en **plein écran immersif** (sans barre d'adresse ni boutons superflus), avec l'icône officielle DZ-FLEET.

---

### Scénario 3 : Liaison & Personnalisation du Profil Chauffeur
* **Profils impliqués :** Gestionnaire de Flotte (Émetteur QR sur PC) | Conducteur (Scan & Validation Mobile).
* **Objectif :** S'assurer que le smartphone est bien lié à son conducteur sans risque de confusion.
* **Étapes :**
  1. Sur le portail PC, allez dans l'onglet **« Chauffeurs »**.
  2. Sur la fiche de **Karim Belkacem**, cliquez sur **« QR Chauffeur »**.
  3. Scannez le QR Code avec le smartphone (ou copiez le lien avec `?driverId=drv-1`).
  4. Ouvrez l'application sur le téléphone.
* **Résultat Attendu :** 
  - La carte du conducteur affiche directement : *Karim Belkacem (Vérifié)*, son téléphone, son véhicule assigné (*Renault Symbol 04512-118-16*) et son odomètre actuel.
  - Même après fermeture ou redémarrage du téléphone, l'application reste mémorisée sur son profil.

---

### Scénario 4 : Déclaration de Plein Carburant Naftal & Scanner OCR (IA)
* **Profils impliqués :** Conducteur (Prise photo & saisie) | Contrôleur de Gestion (Validation financière).
* **Objectif :** Enregistrer un ravitaillement Naftal en Dinars (DA) avec analyse automatique de photo.
* **Étapes :**
  1. Sur la PWA smartphone, touchez **« Plein Carburant (Naftal) »**.
  2. Touchez **« Scanner Ticket Naftal (Photo) »** et prenez en photo un reçu ou ticket Naftal avec la caméra.
  3. Vérifiez l'extraction automatique par l'IA : litrage (L), montant en Dinars (DA) et station-service.
  4. Validez l'envoi.
* **Résultat Attendu :** Le plein est instantanément comptabilisé, le coût total de la flotte est mis à jour sur la console gestionnaire, et la consommation moyenne est recalculée.

---

### Scénario 5 : Continuité Opérationnelle en Zone Blanche / Sahara (Mode Hors-Ligne)
* **Profils impliqués :** Conducteur / Chauffeur (Test terrain) | Gestionnaire (Contrôle réception).
* **Objectif :** Valider la capacité de saisie en plein désert sans couverture réseau 4G.
* **Étapes :**
  1. Sur votre smartphone, activez le **Mode Avion**.
  2. Constatez que le voyant supérieur passe immédiatement de `🟢 En ligne` à `🟠 Zone Blanche (Hors-ligne)`.
  3. Déclarez un relevé kilométrique (ex: `125 500 km`) ou un plein de carburant.
  4. Constatez le message de sauvegarde locale sécurisée (`1 opération en attente`).
  5. Désactivez le **Mode Avion** pour rétablir la connexion Internet.
* **Résultat Attendu :** Le voyant repasse automatiquement à `🟢 En ligne` et synchronise silencieusement les données vers le serveur central sans perte.

---

### Scénario 6 : Relevé Odomètre & Déclenchement d'Alerte Vidange (10 000 km)
* **Profils impliqués :** Conducteur (Saisie km mobile) | Responsable Maintenance (Prise en charge alerte PC).
* **Objectif :** Tester la maintenance prédictive et la détection automatique des échéances de révision.
* **Étapes :**
  1. Sur la PWA, touchez **« Relevé Kilométrique »**.
  2. Saisissez un kilométrage supérieur à l'échéance de vidange du véhicule (ex: `95 000 km`).
  3. Validez.
  4. Ouvrez le portail gestionnaire sur PC avec le profil **Responsable Maintenance** (onglet **« Tableau de Bord »**).
* **Résultat Attendu :** Une alerte rouge de priorité haute apparaît dans le tableau de bord : *« Dépassement échéance vidange moteur »*. Le responsable maintenance peut cliquer sur **« Marquer Résolu »** une fois l'entretien planifié.

---

### Scénario 7 : Création & Présentation d'un Ordre de Mission Officiel (OM)
* **Profils impliqués :** Gestionnaire de Flotte (Créateur PC) | Contrôleur de Gestion (Audit frais) | Conducteur (Contrôle mobile).
* **Objectif :** Créer un ordre de mission aux normes algériennes et le consulter sur mobile aux barrages de contrôle.
* **Étapes :**
  1. Sur le portail PC (onglet **« Missions »**), cliquez sur **« + Nouvel Ordre de Mission »**.
  2. Renseignez : *Trajet (Alger → Hassi Messaoud)*, *Étapes autorisées (Djelfa, Ghardaïa, Ouargla)*, *Péages* et *Per Diem*.
  3. Constatez le calcul automatique du budget carburant selon le barème officiel Naftal (Gasoil 29.01 DA / Sans Plomb 45.62 DA / GPL 9.00 DA).
  4. Validez la mission.
  5. Sur le smartphone du chauffeur assigné, touchez **« Afficher l'Ordre de Mission Officiel »**.
* **Résultat Attendu :** Le document réglementaire complet s'affiche avec la mention *« République Algérienne Démocratique et Populaire »*, le circuit officiel, le QR code de contrôle et le visa électronique.

---

### Scénario 8 : Déclaration Sinistre & Géolocalisation GPS Certifiée
* **Profils impliqués :** Conducteur (Déclarant mobile) | Gestionnaire de Flotte (Instruction dossier) | Resp. Maintenance (Expertise dégâts).
* **Objectif :** Déclarer un accrochage ou sinistre avec photo des dégâts et localisation GPS certifiée.
* **Étapes :**
  1. Sur la PWA smartphone, touchez **« Déclarer un Sinistre »**.
  2. Renseignez le lieu (ex: *RN1 Sortie Blida*), le tiers impliqué, et prenez une photo des dégâts.
  3. Touchez **« Actualiser Position GPS »** pour certifier les coordonnées (latitude / longitude).
  4. Validez la déclaration.
* **Résultat Attendu :** Le sinistre est enregistré instantanément dans l'onglet **« Sinistres »** du portail gestionnaire, prêt à être transmis aux compagnies conventionnées (SAA, CAAT, CASH, CIAR...).

---

### Scénario 9 : Conformité ANPDP Loi 18-07 & Registre des Traitements
* **Profils impliqués :** Super Administrateur (Réalisateur & Validateur légal).
* **Objectif :** Vérifier les garanties juridiques et la souveraineté numérique des données.
* **Étapes :**
  1. En haut à droite du portail PC, cliquez sur le badge vert **« ANPDP Loi 18-07 »**.
  2. Consultez les garanties : *Hébergement 100% en Algérie*, *Chiffrement AES-256*, *Purge automatique des coordonnées GPS sous 30 jours*.
  3. Cliquez sur **« Télécharger Déclaration ANPDP (.txt) »** ou **« Imprimer Attestation »**.
* **Résultat Attendu :** Génération immédiate de l'attestation officielle de conformité réglementaire.

---

### Scénario 10 : Confort Visuel Mode Jour & Mode Nuit (Obsidian Midnight)
* **Profils impliqués :** Tous les profils (Évaluation ergonomique commune).
* **Objectif :** Tester l'ergonomie visuelle et le contraste de lecture en plein jour et de nuit.
* **Étapes :**
  1. Cliquez sur le bouton **Lune / Soleil** dans la barre de navigation.
  2. Constatez le passage entre le **Mode Jour** (clair, contrasté) et le **Mode Nuit Obsidian** (noir profond `#090d16`, cartes surélevées `#121929`, bordures bleutées `#222f47`, haute lisibilité).
* **Résultat Attendu :** Lisibilité parfaite sans fatigue visuelle, couleurs d'état (vert, ambre, rouge) nettes et contrastées.

---

## 📝 Grille de Notation & Retour des Testeurs

Les testeurs peuvent consigner leurs retours selon cette grille synthétique :

| Réf | Fonctionnalité Testée | Profil Testeur Assigné | Statut (OK / KO / À améliorer) | Remarques & Observations |
| :---: | :--- | :--- | :---: | :--- |
| **T01** | Connexion 2FA par e-mail (Mailtrap) | Super Administrateur | `[   ]` | |
| **T02** | Installation PWA sur l'écran d'accueil | Conducteur / Chauffeur | `[   ]` | |
| **T03** | Reconnaissance du chauffeur & véhicule | Gestionnaire Flotte & Chauffeur | `[   ]` | |
| **T04** | Scanner photo du ticket Naftal (OCR) | Conducteur & Contrôleur Gestion | `[   ]` | |
| **T05** | Fonctionnement en Mode Avion (Sahara) | Conducteur / Chauffeur | `[   ]` | |
| **T06** | Synchronisation automatique au retour 4G | Conducteur / Chauffeur | `[   ]` | |
| **T07** | Alerte vidange & maintenance prédictive | Responsable Maintenance | `[   ]` | |
| **T08** | Ordre de mission numérique sur mobile | Gestionnaire Flotte & Chauffeur | `[   ]` | |
| **T09** | Déclaration sinistre & géolocalisation | Conducteur & Gestionnaire Flotte | `[   ]` | |
| **T10** | Ergonomie Mode Nuit / Mode Jour | Tous les profils | `[   ]` | |
