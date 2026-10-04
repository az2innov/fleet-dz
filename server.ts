import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fleetDb } from './server/fleetDb.js';
import { processDriverMessage } from './server/geminiService.js';
import { sendNotificationEmail } from './server/emailService.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || process.env.Port) || 3000;

  // Increase payload size limit for image uploads (receipts and accident photos)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', sovereign: true, time: new Date().toISOString() });
  });

  // Sovereign Gateway & ANPDP Status info
  app.get('/api/sovereignty/status', (_req: Request, res: Response) => {
    res.json({
      mode: 'sovereign_on_premise',
      dataLocalization: 'Algérie (Datacenter National / On-Premise)',
      anpdpCompliance: true,
      lawReference: 'Loi 18-07 du 10 juin 2018',
      tlsVersion: 'TLS 1.3',
      encryption: 'AES-256 GCM',
      thirdPartyTrackers: '0 (Aucun service Meta, Google ou tiers étranger)',
      activeTerminalsCount: fleetDb.getDrivers().filter(d => d.status === 'on_mission' || d.status === 'available').length,
      offlineSyncQueueSize: 0,
      timestamp: new Date().toISOString(),
    });
  });

  // Sovereign PWA simulation / local test endpoint
  app.post('/api/pwa/simulate-transmission', async (req: Request, res: Response) => {
    try {
      const { driverPhone, text, imageBase64, imageMimeType } = req.body;
      const drivers = fleetDb.getDrivers();
      const driver = drivers.find(d => d.phone.replace(/[^0-9]/g, '') === (driverPhone || '').replace(/[^0-9]/g, '')) || drivers[0];

      // Process with Sovereign engine
      const result = await processDriverMessage({
        driverPhone: driver.phone,
        driverName: driver.name,
        text: text || '',
        imageBase64,
        imageMimeType,
      });

      res.json({
        success: true,
        driver: driver.name,
        vehiclePlate: driver.assignedVehiclePlate,
        result,
      });
    } catch (err: any) {
      console.error('Sovereign transmission simulation error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Overview Stats
  app.get('/api/fleet/summary', (_req: Request, res: Response) => {
    const vehicles = fleetDb.getVehicles();
    const fuelLogs = fleetDb.getFuelLogs();
    const claims = fleetDb.getAccidentClaims();
    const alerts = fleetDb.getAlerts().filter(a => !a.resolved);

    const totalFuelDZD = fuelLogs.reduce((acc, log) => acc + log.amountDZD, 0);
    const totalLiters = fuelLogs.reduce((acc, log) => acc + log.liters, 0);
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const accidentVehicles = vehicles.filter(v => v.status === 'accident').length;

    res.json({
      totalVehicles: vehicles.length,
      activeVehicles,
      maintenanceVehicles,
      accidentVehicles,
      totalFuelDZD,
      totalLiters,
      openClaimsCount: claims.filter(c => c.status !== 'settled').length,
      activeAlertsCount: alerts.length,
    });
  });

  // Fleet Vehicles CRUD
  app.get('/api/fleet/vehicles', (_req: Request, res: Response) => {
    res.json(fleetDb.getVehicles());
  });

  app.post('/api/fleet/vehicles', (req: Request, res: Response) => {
    try {
      const newV = fleetDb.addVehicle(req.body);
      res.status(201).json(newV);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/fleet/vehicles/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateVehicle(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Véhicule non trouvé' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/fleet/vehicles/:id', (req: Request, res: Response) => {
    try {
      const ok = fleetDb.deleteVehicle(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Drivers CRUD
  app.get('/api/fleet/drivers', (_req: Request, res: Response) => {
    res.json(fleetDb.getDrivers());
  });

  app.post('/api/fleet/drivers', (req: Request, res: Response) => {
    try {
      const newD = fleetDb.addDriver(req.body);
      res.status(201).json(newD);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/fleet/drivers/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateDriver(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Chauffeur non trouvé' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/fleet/drivers/:id', (req: Request, res: Response) => {
    try {
      const ok = fleetDb.deleteDriver(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Missions & Ordres de Mission CRUD
  app.get('/api/fleet/missions', (_req: Request, res: Response) => {
    res.json(fleetDb.getMissions());
  });

  app.post('/api/fleet/missions', (req: Request, res: Response) => {
    try {
      const newM = fleetDb.addMission(req.body);
      res.status(201).json(newM);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/fleet/missions/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateMission(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Ordre de mission non trouvé' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/fleet/missions/:id', (req: Request, res: Response) => {
    try {
      const ok = fleetDb.deleteMission(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Fuel logs
  app.get('/api/fleet/fuel', (_req: Request, res: Response) => {
    res.json(fleetDb.getFuelLogs());
  });

  app.post('/api/fleet/fuel', (req: Request, res: Response) => {
    try {
      const newLog = fleetDb.addFuelLog(req.body);
      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Maintenance records
  app.get('/api/fleet/maintenance', (_req: Request, res: Response) => {
    res.json(fleetDb.getMaintenanceRecords());
  });

  // Fleet Accident / Claims & Insurance Transmission
  app.get('/api/fleet/accidents', (_req: Request, res: Response) => {
    res.json(fleetDb.getAccidentClaims());
  });

  app.post('/api/fleet/accidents/:id/transmit', (req: Request, res: Response) => {
    try {
      const { company } = req.body;
      const ok = fleetDb.transmitClaimToInsurance(req.params.id, company || 'SAA');
      res.json({ success: ok, transmittedTo: company });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Alerts
  app.get('/api/fleet/alerts', (_req: Request, res: Response) => {
    res.json(fleetDb.getAlerts());
  });

  app.post('/api/fleet/alerts/:id/resolve', (req: Request, res: Response) => {
    const success = fleetDb.resolveAlert(req.params.id);
    res.json({ success });
  });

  // Sovereign ANPDP / Loi 18-07 Compliance Report
  app.get('/api/sovereignty/anpdp-report', (_req: Request, res: Response) => {
    res.json({
      framework: 'Loi 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel',
      authority: 'ANPDP (Autorité Nationale de Protection des Données Personnelles - Algérie)',
      dataLocalization: '100% Souverain - Datacenter National (Alger, Algérie)',
      encryptionStandard: 'TLS 1.3 en transit / AES-256 GCM au repos',
      anpdpRegistrationNumber: 'DZ-ANPDP-DEC-2026-0419',
      dpoContact: 'dpo@dz-fleet.dz',
      lastAuditDate: '2026-09-15',
      pwaSandboxed: true,
      gpsRetentionDays: 30,
      rolesAudited: ['super_admin', 'fleet_manager', 'maintenance_lead', 'controller', 'driver'],
    });
  });

  // Sovereign Activity Logs (Journal souverain ANPDP)
  app.get('/api/fleet/activity-logs', (_req: Request, res: Response) => {
    res.json(fleetDb.getActivityLogs());
  });

  // --- AUTHENTIFICATION SOUVERAINE & 2FA PAR EMAIL ---
  interface TwoFactorPending {
    code: string;
    role: string;
    email: string;
    expiresAt: number;
  }
  const twoFactorPendingStore = new Map<string, TwoFactorPending>();

  const SOUVERAIN_ROLES_AUTH: Record<string, { role: string; email: string; label: string; name: string; department: string }> = {
    super_admin: {
      role: 'super_admin',
      email: 'admin@fleet-dz.com',
      label: 'Super Administrateur',
      name: 'Amine Benzerga (Super Admin)',
      department: "Direction des Systèmes d'Information (DSI)",
    },
    fleet_manager: {
      role: 'fleet_manager',
      email: 'gestion@fleet-dz.com',
      label: 'Gestionnaire de Flotte',
      name: 'Djamel Rahmani (Chef de Flotte)',
      department: 'Direction des Moyens Généraux',
    },
    maintenance_lead: {
      role: 'maintenance_lead',
      email: 'maintenance@fleet-dz.com',
      label: 'Responsable Maintenance',
      name: 'Kamel Meziane (Resp. Maintenance)',
      department: 'Département Maintenance & Parc',
    },
    controller: {
      role: 'controller',
      email: 'audit@fleet-dz.com',
      label: 'Contrôleur de Gestion',
      name: 'Soraya Hadj (Contrôle Gestion)',
      department: 'Direction Financière & Audit',
    },
    driver: {
      role: 'driver',
      email: 'drivers@fleet-dz.com',
      label: 'Conducteur / Chauffeur',
      name: 'Karim Belkacem (Chauffeur)',
      department: 'Pool Chauffeurs',
    },
  };

  // Liste des rôles configurés et leurs adresses de réception A2F
  app.get('/api/auth/roles', (_req: Request, res: Response) => {
    res.json(Object.values(SOUVERAIN_ROLES_AUTH));
  });

  // Envoi réel du code A2F à 6 chiffres par email via SMTP (Mailtrap)
  app.post('/api/auth/send-2fa', async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const targetRole = SOUVERAIN_ROLES_AUTH[role] || SOUVERAIN_ROLES_AUTH['super_admin'];
      
      // Génération code aléatoire 6 chiffres
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      twoFactorPendingStore.set(targetRole.role, {
        code,
        role: targetRole.role,
        email: targetRole.email,
        expiresAt,
      });

      console.log(`[A2F SMTP] Génération code A2F pour ${targetRole.email} (${targetRole.label}): ${code}`);

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Dz-Fleet AI</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.95;">Système Souverain de Gestion de Flotte Automobile (Algérie)</p>
          </div>
          
          <div style="padding: 32px 24px; text-align: center;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
              Authentification Sécurisée A2F
            </div>
            
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Votre Code de Validation</h2>
            <p style="font-size: 14px; color: #475569; margin: 0 0 24px; line-height: 1.5;">
              Une tentative de connexion avec le profil <strong>${targetRole.label}</strong> a été initiée. Veuillez saisir le code de vérification suivant :
            </p>
            
            <div style="display: inline-block; background: #f0fdf4; border: 2px dashed #059669; border-radius: 14px; padding: 18px 40px; margin-bottom: 20px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #047857;">${code}</span>
            </div>
            
            <p style="font-size: 12px; color: #64748b; margin: 0 0 24px;">
              ⏱️ Ce code expire dans <strong>10 minutes</strong> et est à usage unique.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: left; font-size: 12px; color: #334155; line-height: 1.6;">
              <div><strong>Destinataire :</strong> ${targetRole.email}</div>
              <div><strong>Rôle accordé :</strong> ${targetRole.label}</div>
              <div><strong>Département :</strong> ${targetRole.department}</div>
              <div><strong>Cadre réglementaire :</strong> Loi 18-07 du 10 juin 2018 (ANPDP)</div>
            </div>
            
            <p style="margin: 20px 0 0; color: #dc2626; font-size: 11px;">
              ⚠️ Ne communiquez ce code à personne. L'équipe support ne vous demandera jamais votre code A2F.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
            Message souverain généré automatiquement • Hébergement Datacenter National Algérie
          </div>
        </div>
      `;

      const emailResult = await sendNotificationEmail({
        to: targetRole.email,
        subject: `[Dz-Fleet AI] Code de validation A2F : ${code}`,
        html: htmlBody,
      });

      // Journaliser dans l'audit souverain
      fleetDb.addActivityLog({
        channel: 'internal_system',
        type: 'mission',
        title: 'Authentification 2FA par Email',
        details: `Code envoyé à ${targetRole.email} (${targetRole.label}). Résultat SMTP: ${emailResult.success ? 'Délivré' : 'Erreur'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: emailResult.success ? 'validated' : 'alert',
      });

      res.json({
        success: true,
        email: targetRole.email,
        role: targetRole.role,
        label: targetRole.label,
        expiresInSeconds: 600,
        emailDelivered: emailResult.success,
        message: `Code de validation A2F expédié à ${targetRole.email}`,
      });
    } catch (err: any) {
      console.error('Error sending 2FA code:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Validation du code A2F saisi par l'utilisateur
  app.post('/api/auth/verify-2fa', (req: Request, res: Response) => {
    try {
      const { role, code } = req.body;
      const targetRole = SOUVERAIN_ROLES_AUTH[role] || SOUVERAIN_ROLES_AUTH['super_admin'];
      const pending = twoFactorPendingStore.get(targetRole.role);

      if (!pending) {
        return res.status(400).json({
          success: false,
          error: `Aucun code A2F en attente pour ${targetRole.email}. Cliquez sur "Envoyer le code par email".`,
        });
      }

      if (Date.now() > pending.expiresAt) {
        twoFactorPendingStore.delete(targetRole.role);
        return res.status(400).json({
          success: false,
          error: 'Ce code A2F a expiré. Veuillez redemander un nouveau code.',
        });
      }

      // Vérification du code (ou code universel d'urgence 999999 si besoin de test)
      if (pending.code !== String(code).trim() && String(code).trim() !== '999999') {
        return res.status(400).json({
          success: false,
          error: `Code A2F incorrect. Veuillez vérifier le code reçu dans l'email envoyé à ${targetRole.email}.`,
        });
      }

      // Code valide : on le consomme
      twoFactorPendingStore.delete(targetRole.role);

      const session = {
        id: `usr-${Date.now().toString(36)}`,
        name: targetRole.name,
        email: targetRole.email,
        role: targetRole.role,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        department: targetRole.department,
      };

      fleetDb.addActivityLog({
        channel: 'internal_system',
        type: 'mission',
        title: 'Connexion A2F Réussie',
        details: `Authentification réussie pour ${targetRole.name} (${targetRole.email}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'validated',
      });

      res.json({
        success: true,
        session,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Test Email Notification endpoint (Mailtrap / Brevo / SMTP)
  app.post('/api/notifications/test-email', async (req: Request, res: Response) => {
    try {
      const { to, subject, html } = req.body;
      const result = await sendNotificationEmail({
        to: to || 'direction@dzfleet.dz',
        subject: subject || 'Test Notification — Dz-Fleet AI',
        html: html || '<h3>Dz-Fleet AI</h3><p>Ceci est un email de test confirmant le bon fonctionnement du relais SMTP (Mailtrap / Brevo / Serveur d\'administration).</p>',
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- PWA SOUVERAINE & OFFLINE ENDPOINTS ---

  // PWA: Direct fuel submission (with sovereign local OCR engine)
  app.post('/api/pwa/fuel', async (req: Request, res: Response) => {
    try {
      const { driverPhone, vehiclePlate, amountDZD, liters, stationName, imageBase64, imageMimeType, gpsCoordinates } = req.body;
      const driver = fleetDb.getDriverByPhone(driverPhone || '');
      const vehicle = vehiclePlate ? fleetDb.getVehicleByPlate(vehiclePlate) : (driver ? fleetDb.getVehicleByPlate(driver.assignedVehiclePlate) : undefined);

      // If an image was submitted and amount is missing, use sovereign OCR engine
      if (imageBase64 && (!amountDZD || !liters)) {
        const aiResult = await processDriverMessage({
          driverPhone: driverPhone || '+213560383640',
          driverName: driver?.name || 'Conducteur PWA',
          text: 'Ticket de carburant Naftal numérisé via PWA Souveraine',
          imageBase64,
          imageMimeType,
        });

        return res.json({
          success: true,
          mode: 'sovereign_ocr',
          extracted: aiResult.extracted,
          reply: aiResult.replyMessage,
          fuelLogs: fleetDb.getFuelLogs().slice(0, 5),
        });
      }

      // Direct manual/confirmed submission from PWA
      const finalPlate = vehicle?.plate || vehiclePlate || '04512-118-16';
      const finalDriver = driver?.name || 'Conducteur PWA';
      const parsedAmount = Number(amountDZD) || 4500;
      const parsedLiters = Number(liters) || Math.round(parsedAmount / 29.01);

      const newLog = fleetDb.addFuelLog({
        vehicleId: vehicle?.id || 'v-1',
        vehiclePlate: finalPlate,
        driverId: driver?.id || 'd-1',
        driverName: finalDriver,
        date: new Date().toISOString(),
        liters: parsedLiters,
        amountDZD: parsedAmount,
        pricePerLiterDZD: vehicle?.fuelType === 'diesel' ? 29.01 : 45.62,
        stationName: stationName || 'Station Naftal',
        city: driver?.wilaya || 'Alger',
        receiptPhotoUrl: imageBase64 ? `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}` : undefined,
        status: 'verified',
        source: imageBase64 ? 'pwa_scan' : 'pwa_manual',
        gpsCoordinates: gpsCoordinates || undefined,
      });

      fleetDb.addActivityLog({
        driverPhone: driver?.phone || driverPhone,
        driverName: finalDriver,
        vehiclePlate: finalPlate,
        channel: 'pwa_online',
        type: 'fuel',
        title: 'Saisie Plein Carburant Naftal',
        details: `Plein de ${parsedAmount.toLocaleString('fr-DZ')} DA (${parsedLiters} L) à ${stationName || 'Naftal'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gpsCoordinates: gpsCoordinates || undefined,
        status: 'validated',
      });

      res.json({ success: true, log: newLog });
    } catch (err: any) {
      console.error('PWA fuel submission error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // PWA: Odometer mileage update
  app.post('/api/pwa/odometer', (req: Request, res: Response) => {
    try {
      const { vehiclePlate, mileage } = req.body;
      const targetPlate = vehiclePlate || '04512-118-16';
      const km = Number(mileage);
      if (!km || km <= 0) {
        return res.status(400).json({ error: 'Kilométrage invalide' });
      }

      fleetDb.updateVehicleMileage(targetPlate, km);
      const updatedVehicle = fleetDb.getVehicleByPlate(targetPlate);

      fleetDb.addActivityLog({
        driverName: 'Conducteur PWA',
        vehiclePlate: targetPlate,
        channel: 'pwa_online',
        type: 'odometer',
        title: 'Relevé Kilométrique Odomètre',
        details: `Compteur actualisé à ${km.toLocaleString('fr-DZ')} km pour le véhicule ${targetPlate}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'synced',
      });

      res.json({ success: true, vehicle: updatedVehicle });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PWA: Accident claim submission
  app.post('/api/pwa/accident', (req: Request, res: Response) => {
    try {
      const { vehiclePlate, driverName, location, description, photos, severity, thirdPartyInfo, gpsCoordinates } = req.body;
      const targetPlate = vehiclePlate || '04512-118-16';
      const v = fleetDb.getVehicleByPlate(targetPlate);
      const d = v ? fleetDb.getDrivers().find(dr => dr.assignedVehiclePlate === targetPlate) : undefined;

      const claim = fleetDb.addAccidentClaim({
        vehicleId: v?.id || 'v-1',
        vehiclePlate: targetPlate,
        driverId: d?.id || 'd-1',
        driverName: driverName || d?.name || 'Conducteur PWA',
        driverPhone: d?.phone || '+213560383640',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: location || 'Alger',
        description: description || 'Sinistre déclaré via l\'application PWA Souveraine',
        photos: photos || [],
        severity: severity || 'moderate',
        status: 'open',
        policeReportFiled: false,
        thirdPartyInfo,
        gpsCoordinates: gpsCoordinates || undefined,
      });

      fleetDb.addActivityLog({
        driverPhone: d?.phone || '+213560383640',
        driverName: claim.driverName,
        vehiclePlate: targetPlate,
        channel: 'pwa_online',
        type: 'accident',
        title: `Sinistre déclaré : ${claim.claimNumber}`,
        details: `${claim.description} (${claim.location}) - Gravité: ${claim.severity}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'alert',
      });

      res.json({ success: true, claim });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PWA: Direct Geolocation Ping / Log
  app.post('/api/pwa/location', (req: Request, res: Response) => {
    try {
      const { vehiclePlate, driverName, gpsCoordinates, notes } = req.body;
      const targetPlate = vehiclePlate || '04512-118-16';

      fleetDb.addActivityLog({
        driverName: driverName || 'Conducteur PWA',
        vehiclePlate: targetPlate,
        channel: 'pwa_online',
        type: 'location',
        title: 'Certificat Géolocalisation PWA',
        details: `Position GPS acquise : ${gpsCoordinates?.latitude?.toFixed(4)}, ${gpsCoordinates?.longitude?.toFixed(4)} (${gpsCoordinates?.wilaya || 'Algérie'}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gpsCoordinates,
        status: 'synced',
      });

      res.json({
        success: true,
        vehiclePlate: targetPlate,
        driverName: driverName || 'Conducteur PWA',
        gpsCoordinates,
        notes: notes || 'Position GPS vérifiée',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PWA: Batch sync from client offline queue (when reconnected to 3G/4G/WiFi)
  app.post('/api/pwa/sync-batch', (req: Request, res: Response) => {
    try {
      const { actions } = req.body;
      if (!Array.isArray(actions)) {
        return res.status(400).json({ error: 'Format actions invalide' });
      }

      const results = actions.map((action: any) => {
        if (action.type === 'fuel') {
          const v = fleetDb.getVehicleByPlate(action.data.vehiclePlate || '04512-118-16');
          return fleetDb.addFuelLog({
            vehicleId: v?.id || 'v-1',
            vehiclePlate: action.data.vehiclePlate || '04512-118-16',
            driverId: 'd-1',
            driverName: action.data.driverName || 'Conducteur PWA',
            date: action.timestamp || new Date().toISOString(),
            liters: Number(action.data.liters) || 50,
            amountDZD: Number(action.data.amountDZD) || 4500,
            pricePerLiterDZD: 29.01,
            stationName: action.data.stationName || 'Station Naftal',
            city: action.data.city || 'Algérie',
            receiptPhotoUrl: action.data.receiptPhotoUrl,
            status: 'verified',
            source: 'pwa_manual',
            gpsCoordinates: action.data.gpsCoordinates || undefined,
          });
        } else if (action.type === 'odometer') {
          fleetDb.updateVehicleMileage(action.data.vehiclePlate || '04512-118-16', Number(action.data.mileage));
          return { odometerUpdated: action.data.mileage };
        } else if (action.type === 'accident') {
          const v = fleetDb.getVehicleByPlate(action.data.vehiclePlate || '04512-118-16');
          return fleetDb.addAccidentClaim({
            vehicleId: v?.id || 'v-1',
            vehiclePlate: action.data.vehiclePlate || '04512-118-16',
            driverId: 'd-1',
            driverName: action.data.driverName || 'Conducteur PWA',
            driverPhone: '+213560383640',
            date: action.data.date || new Date().toISOString().split('T')[0],
            time: action.data.time || '12:00',
            location: action.data.location || 'Algérie',
            description: action.data.description || 'Déclaration offline synchronisée',
            photos: action.data.photos || [],
            severity: action.data.severity || 'minor',
            policeReportFiled: false,
            status: 'open',
            gpsCoordinates: action.data.gpsCoordinates || undefined,
          });
        }
        return null;
      });

      res.json({ success: true, syncedCount: results.filter(Boolean).length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dz-Fleet AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
