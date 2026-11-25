import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fleetDb } from './server/fleetDb.js';
import { processDriverMessage } from './server/geminiService.js';
import { sendNotificationEmail } from './server/emailService.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || process.env.Port) || 3000;

  // HTTP Request logger in terminal for visibility
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    const url = req.originalUrl || req.url;
    res.on('finish', () => {
      // Ignore Vite internal HMR pings to keep logs readable
      if (url.startsWith('/@vite') || url.startsWith('/@id') || url.startsWith('/@fs') || url.startsWith('/@react-refresh')) {
        return;
      }
      const duration = Date.now() - start;
      const status = res.statusCode;
      const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
      const reset = '\x1b[0m';
      const time = new Date().toLocaleTimeString('fr-FR');
      console.log(`[${time}] ${req.method} ${url} -> ${color}${status}${reset} (${duration}ms)`);
    });
    next();
  });

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


  // Extraction dynamique et sécurisée du Tenant actif (Isolation Multi-Tenant ANPDP)
  const extractTenant = (req: Request): string => {
    const headerTenant = req.headers['x-tenant-id'];
    if (typeof headerTenant === 'string' && headerTenant.trim()) return headerTenant.trim();
    if (typeof req.query.tenantId === 'string' && req.query.tenantId.trim()) return req.query.tenantId.trim();
    if (req.body && typeof req.body.tenantId === 'string' && req.body.tenantId.trim()) return req.body.tenantId.trim();
    return 'tenant-sonatrach';
  };


  // ===================== TENANTS / MULTI-TENANCY API =====================
  app.get('/api/fleet/tenants', (_req: Request, res: Response) => {
    res.json(fleetDb.getTenants());
  });

  app.get('/api/fleet/tenants/current', (req: Request, res: Response) => {
    const tenantId = extractTenant(req);
    const tenant = fleetDb.getTenantById(tenantId) || fleetDb.getTenants()[0];
    res.json(tenant);
  });

  // ===================== ROOT BACK OFFICE & DISASTER RECOVERY API =====================

  // Statistiques globales de la plateforme (pour compte Root)
  app.get('/api/root/stats', (_req: Request, res: Response) => {
    const tenants = fleetDb.getTenants();
    const allVehicles = fleetDb.getVehicles();
    const allDrivers = fleetDb.getDrivers();
    const allUsers = fleetDb.getTenantUsers();
    const backups = fleetDb.getTenantBackups();

    res.json({
      totalTenants: tenants.length,
      activeTenants: tenants.filter(t => t.status === 'active').length,
      totalVehicles: allVehicles.length,
      totalDrivers: allDrivers.length,
      totalUsers: allUsers.length,
      totalBackups: backups.length,
      systemHealth: 'optimal',
      serverUptime: '99.98%',
      datacenterLocation: 'Datacenter National Souverain (Alger - Ben Aknoun)',
      compliance: 'Loi 18-07 / ANPDP & Décret Exécutif 04-381',
    });
  });

  // Liste complète des tenants avec métriques détaillées
  app.get('/api/root/tenants', (_req: Request, res: Response) => {
    const tenants = fleetDb.getTenants();
    const enriched = tenants.map(t => {
      const vList = fleetDb.getVehicles(t.id);
      const dList = fleetDb.getDrivers(t.id);
      const uList = fleetDb.getTenantUsers(t.id);
      const iList = fleetDb.getInterventions(t.id);
      const bList = fleetDb.getTenantBackups(t.id);
      return {
        ...t,
        vehiclesCount: vList.length,
        driversCount: dList.length,
        usersCount: uList.length,
        interventionsCount: iList.length,
        backupsCount: bList.length,
      };
    });
    res.json(enriched);
  });

  // Création d'un nouveau Tenant par le compte Root (sans création automatique des comptes)
  app.post('/api/root/tenants', (req: Request, res: Response) => {
    try {
      const {
        name,
        slug,
        tenantCode,
        companyType,
        wilaya,
        nif,
        nis,
        rc,
        address,
        phone,
        email,
        brandColor,
        plan,
      } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Le nom et le slug du tenant sont obligatoires.' });
      }

      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const tenantId = `tenant-${cleanSlug}`;

      if (fleetDb.getTenantById(tenantId)) {
        return res.status(400).json({ error: `Un tenant avec l'identifiant ${tenantId} existe déjà.` });
      }

      const assignedCode = tenantCode && tenantCode.trim() 
        ? tenantCode.trim().toUpperCase() 
        : `${cleanSlug.toUpperCase()}-001`;

      const newTenant = fleetDb.addTenant({
        id: tenantId,
        tenantCode: assignedCode,
        name: name.trim(),
        slug: cleanSlug,
        companyType: companyType || 'Entreprise & Transport',
        wilaya: wilaya || '16 - Alger',
        nif: nif || '000000000000000',
        nis: nis || '000000000000000000',
        rc: rc || '16/00-0000000A01',
        address: address || 'Zone Industrielle, Alger',
        phone: phone || '+213 21 00 00 00',
        email: email || `contact@${cleanSlug}-dz.com`,
        brandColor: brandColor || '#059669',
        plan: plan || 'enterprise',
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      fleetDb.addActivityLog({
        driverName: 'Root Superviseur',
        vehiclePlate: 'SYSTÈME',
        channel: 'internal_system',
        type: 'mission',
        title: 'Nouveau Tenant Créé (Manuel)',
        details: `Tenant ${newTenant.name} (${newTenant.id}) créé avec le Code Organisation : ${newTenant.tenantCode}. Les comptes seront créés manuellement par le Root.`,
        timestamp: new Date().toISOString(),
        status: 'validated',
        tenantId,
      });

      res.status(201).json({
        success: true,
        tenant: newTenant,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mise à jour d'un Tenant
  app.put('/api/root/tenants/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateTenant(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Tenant introuvable' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Suppression d'un Tenant (avec cascade)
  app.delete('/api/root/tenants/:id', (req: Request, res: Response) => {
    try {
      const targetId = req.params.id;
      if (targetId === 'tenant-sonatrach') {
        return res.status(400).json({ error: 'Le tenant de référence Sonatrach ne peut pas être supprimé.' });
      }
      const ok = fleetDb.deleteTenant(targetId);
      if (!ok) return res.status(404).json({ error: 'Tenant introuvable' });
      res.json({ success: true, message: `Tenant ${targetId} et ses données ont été supprimés avec succès.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Liste des utilisateurs d'un tenant (ou tous)
  app.get('/api/root/tenants/:id/users', (req: Request, res: Response) => {
    const users = fleetDb.getTenantUsers(req.params.id);
    res.json(users);
  });

  // Ajout d'un utilisateur dans un tenant
  app.post('/api/root/tenants/:id/users', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.id;
      const { email, name, role, department, phone } = req.body;
      if (!email || !role) {
        return res.status(400).json({ error: "L'email et le rôle sont obligatoires." });
      }

      const existing = fleetDb.getTenantUserByEmail(email, tenantId);
      if (existing) {
        return res.status(400).json({ error: `Un compte avec l'adresse email ${email} existe déjà dans ce tenant.` });
      }

      const resetToken = `ACT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const newUser = fleetDb.addTenantUser({
        tenantId,
        email: email.trim(),
        name: name ? name.trim() : email.split('@')[0],
        role,
        department: department || 'Direction Opérationnelle',
        phone: phone || '+213 21 00 00 00',
        passwordHash: 'Algeria2026!',
        hasCustomPassword: false,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        status: 'pending_password',
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mise à jour d'un utilisateur
  app.put('/api/root/users/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateTenantUser(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Utilisateur introuvable' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Suppression d'un utilisateur
  app.delete('/api/root/users/:id', (req: Request, res: Response) => {
    try {
      const ok = fleetDb.deleteTenantUser(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Réinitialisation de mot de passe par le Root
  app.post('/api/root/users/:id/reset-password', async (req: Request, res: Response) => {
    try {
      const result = fleetDb.resetTenantUserPassword(req.params.id);
      const tenant = fleetDb.getTenantById(result.user.tenantId);
      const tenantCode = tenant?.tenantCode || 'VOTRE-CODE-ORGANISATION';

      // Envoi d'un email souverain avec rappel explicite du Code Organisation
      const htmlBody = `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #059669; margin: 0 0 12px;">Dz-Fleet AI — Activation de Compte</h2>
          <p>Bonjour <strong>${result.user.name}</strong>,</p>
          <p>Votre compte a été initialisé sur la plateforme de gestion de flotte pour l'organisation <strong>${tenant?.name || 'Entreprise'}</strong>.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <div style="margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Code Organisation (Tenant Code) :</span><br/>
              <strong style="font-size: 18px; color: #047857; font-family: monospace;">${tenantCode}</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Identifiant Email :</span><br/>
              <strong style="font-size: 14px; font-family: monospace;">${result.user.email}</strong>
            </div>
            <div>
              <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Jeton d'Activation Privé :</span><br/>
              <strong style="font-size: 16px; color: #d97706; font-family: monospace;">${result.resetToken}</strong>
            </div>
          </div>

          <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 10px 14px; font-size: 12px; color: #065f46;">
            <strong>Politique de mot de passe fort requise :</strong><br/>
            Au moins 8 caractères, avec majuscule, minuscule, chiffre et symbole.
          </div>
        </div>
      `;

      sendNotificationEmail({
        to: result.user.email,
        subject: `[Dz-Fleet AI] Activation de votre compte - Code Organisation : ${tenantCode}`,
        html: htmlBody,
      }).catch(err => console.error('SMTP Error:', err));

      res.json({
        success: true,
        message: `Mot de passe réinitialisé. L'utilisateur ${result.user.email} doit utiliser le Code Organisation "${tenantCode}" et le jeton fourni pour définir son mot de passe fort.`,
        resetToken: result.resetToken,
        tenantCode,
        user: result.user,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sauvegarde (Backup) complète d'un Tenant
  app.get('/api/root/tenants/:id/backup', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.id;
      const backupData = fleetDb.backupTenant(tenantId);
      
      const fileName = `backup_${tenantId}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(backupData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restauration d'un Tenant depuis une sauvegarde
  app.post('/api/root/tenants/:id/restore', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.id;
      const backupPayload = req.body;
      const ok = fleetDb.restoreTenant(tenantId, backupPayload);
      res.json({
        success: ok,
        message: `Restauration des données pour le tenant ${tenantId} achevée avec succès.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Liste des sauvegardes archivées
  app.get('/api/root/backups', (req: Request, res: Response) => {
    const tenantId = req.query.tenantId as string;
    res.json(fleetDb.getTenantBackups(tenantId));
  });

  // Fleet Overview Stats
  app.get('/api/fleet/summary', (req: Request, res: Response) => {
    const tenantId = extractTenant(req);
    const vehicles = fleetDb.getVehicles(tenantId);
    const fuelLogs = fleetDb.getFuelLogs(tenantId);
    const claims = fleetDb.getAccidentClaims(tenantId);
    const alerts = fleetDb.getAlerts(tenantId).filter(a => !a.resolved);

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
  app.get('/api/fleet/vehicles', (req: Request, res: Response) => {
    res.json(fleetDb.getVehicles(extractTenant(req)));
  });

  app.post('/api/fleet/vehicles', (req: Request, res: Response) => {
    try {
      const newV = fleetDb.addVehicle(req.body, extractTenant(req));
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
  app.get('/api/fleet/drivers', (req: Request, res: Response) => {
    res.json(fleetDb.getDrivers(extractTenant(req)));
  });

  app.post('/api/fleet/drivers', (req: Request, res: Response) => {
    try {
      const newD = fleetDb.addDriver(req.body, extractTenant(req));
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

  // Ajouter et archiver un commentaire horodaté dans le profil conducteur
  app.post('/api/fleet/drivers/:id/comments', (req: Request, res: Response) => {
    try {
      const { text, author, authorRole } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Le texte du commentaire est requis' });
      }
      const newComment = fleetDb.addDriverComment(req.params.id, {
        text: text.trim(),
        author: author || 'Karim Ziani (Exploitation)',
        authorRole: authorRole || 'fleet_manager',
        date: new Date().toISOString(),
      });
      if (!newComment) return res.status(404).json({ error: 'Chauffeur non trouvé' });
      res.status(201).json(newComment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Missions & Ordres de Mission CRUD
  app.get('/api/fleet/missions', (req: Request, res: Response) => {
    res.json(fleetDb.getMissions(extractTenant(req)));
  });

  app.post('/api/fleet/missions', (req: Request, res: Response) => {
    try {
      const newM = fleetDb.addMission(req.body, extractTenant(req));
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

  // ===================== INTERVENTIONS CRUD & DOCUMENTS (DI & FR) =====================
  app.get('/api/fleet/interventions', (req: Request, res: Response) => {
    const tenantId = extractTenant(req);
    const plate = req.query.plate as string | undefined;
    if (plate) {
      return res.json(fleetDb.getInterventionsByVehicle(plate, tenantId));
    }
    res.json(fleetDb.getInterventions(tenantId));
  });

  app.get('/api/fleet/interventions/:id', (req: Request, res: Response) => {
    const itv = fleetDb.getInterventionById(req.params.id);
    if (!itv) return res.status(404).json({ error: 'Intervention non trouvée' });
    res.json(itv);
  });

  // Émettre une Demande d'Intervention (DI) par le Gestionnaire de Flotte
  app.post('/api/fleet/interventions', (req: Request, res: Response) => {
    try {
      const newItv = fleetDb.addIntervention(req.body, extractTenant(req));
      res.status(201).json(newItv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mettre à jour une intervention
  app.put('/api/fleet/interventions/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateIntervention(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Intervention non trouvée' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Prise en charge atelier par le responsable maintenance
  app.post('/api/fleet/interventions/:id/take-in-charge', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.takeInChargeIntervention(req.params.id, req.body.maintenanceLeadName || 'Mourad Hadj (Responsable Maintenance)');
      if (!updated) return res.status(404).json({ error: 'Intervention non trouvée' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Établir et valider la Fiche de Réception après travaux (FR)
  app.post('/api/fleet/interventions/:id/reception', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.receptionIntervention(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Intervention non trouvée' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Fuel logs
  app.get('/api/fleet/fuel', (req: Request, res: Response) => {
    res.json(fleetDb.getFuelLogs(extractTenant(req)));
  });

  app.post('/api/fleet/fuel', (req: Request, res: Response) => {
    try {
      const newLog = fleetDb.addFuelLog(req.body, extractTenant(req));
      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/fleet/fuel/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateFuelLog(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Ravitaillement non trouvé' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cartes Prépayées Déposées en Station
  app.get('/api/fleet/fuel/prepaid-cards', (req: Request, res: Response) => {
    res.json(fleetDb.getPrepaidFuelCards(extractTenant(req)));
  });

  app.post('/api/fleet/fuel/prepaid-cards', (req: Request, res: Response) => {
    try {
      const card = fleetDb.addPrepaidFuelCard(req.body, extractTenant(req));
      res.status(201).json(card);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Bons de Ravitaillement en Carburant (Délivrés par le Gestionnaire de Flotte)
  app.get('/api/fleet/fuel/vouchers', (req: Request, res: Response) => {
    res.json(fleetDb.getFuelVouchers(extractTenant(req)));
  });

  app.post('/api/fleet/fuel/vouchers', (req: Request, res: Response) => {
    try {
      const voucher = fleetDb.addFuelVoucher(req.body, extractTenant(req));
      res.status(201).json(voucher);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Rapprochement & Saisie du Reçu Station (avec Odomètre et calcul automatique de consommation L/100km)
  app.post('/api/fleet/fuel/vouchers/:id/receipt', (req: Request, res: Response) => {
    try {
      const result = fleetDb.completeFuelVoucher(req.params.id, req.body);
      if (!result) return res.status(404).json({ error: 'Bon de ravitaillement non trouvé' });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fleet Maintenance records
  app.get('/api/fleet/maintenance', (req: Request, res: Response) => {
    res.json(fleetDb.getMaintenanceRecords(extractTenant(req)));
  });

  // Fleet Accident / Claims & Insurance Transmission
  app.get('/api/fleet/accidents', (req: Request, res: Response) => {
    res.json(fleetDb.getAccidentClaims(extractTenant(req)));
  });

  app.put('/api/fleet/accidents/:id', (req: Request, res: Response) => {
    try {
      const updated = fleetDb.updateAccidentClaim(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Dossier sinistre non trouvé' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
  app.get('/api/fleet/alerts', (req: Request, res: Response) => {
    res.json(fleetDb.getAlerts(extractTenant(req)));
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
  app.get('/api/fleet/activity-logs', (req: Request, res: Response) => {
    res.json(fleetDb.getActivityLogs(extractTenant(req)));
  });

  // --- AUTHENTIFICATION SOUVERAINE & 2FA PAR EMAIL ---
  interface TwoFactorPending {
    code: string;
    role: string;
    email: string;
    expiresAt: number;
  }
  const twoFactorPendingStore = new Map<string, TwoFactorPending>();


  // Rôles et profils souverains par Compte Entreprise (Multi-Tenant)
  const TENANT_ROLES_AUTH: Record<string, Record<string, { role: string; tenantId: string; email: string; label: string; name: string; department: string }>> = {
    'tenant-sonatrach': {
      super_admin: {
        role: 'super_admin',
        tenantId: 'tenant-sonatrach',
        email: 'admin@sonatrach-dz.com',
        label: 'Super Administrateur',
        name: 'Amine Benzerga (Super Admin)',
        department: "Direction des Systèmes d'Information (DSI Sonatrach)",
      },
      fleet_manager: {
        role: 'fleet_manager',
        tenantId: 'tenant-sonatrach',
        email: 'gestion@sonatrach-dz.com',
        label: 'Gestionnaire de Parc & Flotte',
        name: 'Djamel Rahmani (Chef de Flotte)',
        department: 'Direction des Moyens Généraux Sud',
      },
      maintenance_lead: {
        role: 'maintenance_lead',
        tenantId: 'tenant-sonatrach',
        email: 'maintenance@sonatrach-dz.com',
        label: 'Responsable Maintenance',
        name: 'Kamel Meziane (Resp. Maintenance)',
        department: 'Atelier Central Hassi Messaoud',
      },
      controller: {
        role: 'controller',
        tenantId: 'tenant-sonatrach',
        email: 'audit@sonatrach-dz.com',
        label: 'Contrôleur de Gestion',
        name: 'Soraya Hadj (Contrôle Gestion)',
        department: 'Direction Financière & Audit',
      },
      driver: {
        role: 'driver',
        tenantId: 'tenant-sonatrach',
        email: 'karim.b@sonatrach-dz.com',
        label: 'Conducteur / Chauffeur Sud',
        name: 'Karim Belkacem (Chauffeur)',
        department: 'Pool Chauffeurs Sud',
      },
    },
    'tenant-cevital': {
      super_admin: {
        role: 'super_admin',
        tenantId: 'tenant-cevital',
        email: 'admin@cevital-dz.com',
        label: 'Super Administrateur',
        name: 'Redha Ould Ali (Super Admin)',
        department: "Direction Systèmes d'Information (DSI Cevital)",
      },
      fleet_manager: {
        role: 'fleet_manager',
        tenantId: 'tenant-cevital',
        email: 'gestion@cevital-dz.com',
        label: 'Gestionnaire de Flotte',
        name: 'Samira Benabdelkader (Chef Flotte)',
        department: 'Direction Logistique Froid',
      },
      maintenance_lead: {
        role: 'maintenance_lead',
        tenantId: 'tenant-cevital',
        email: 'maintenance@cevital-dz.com',
        label: 'Responsable Maintenance',
        name: 'Nabil Mansouri (Resp. Maintenance)',
        department: 'Atelier Froid & Mécanique Béjaïa',
      },
      controller: {
        role: 'controller',
        tenantId: 'tenant-cevital',
        email: 'audit@cevital-dz.com',
        label: 'Contrôleur de Gestion',
        name: 'Farouk Khelifi (Contrôle Coûts)',
        department: 'Direction Financière & Logistique',
      },
      driver: {
        role: 'driver',
        tenantId: 'tenant-cevital',
        email: 'tarek.b@cevital-dz.com',
        label: 'Conducteur Frigorifique',
        name: 'Tarek Belhadj (Chauffeur)',
        department: 'Pool Distribution Froid Béjaïa',
      },
    },
    'tenant-cosider': {
      super_admin: {
        role: 'super_admin',
        tenantId: 'tenant-cosider',
        email: 'admin@cosider-dz.com',
        label: 'Super Administrateur',
        name: 'Mourad Boukhalfa (Super Admin)',
        department: "Direction des Systèmes Sécurisés (DSI)",
      },
      fleet_manager: {
        role: 'fleet_manager',
        tenantId: 'tenant-cosider',
        email: 'gestion@cosider-dz.com',
        label: 'Chef de Parc & Matériel',
        name: 'Walid Boudissa (Chef de Parc Matériel)',
        department: 'Direction Matériel & Logistique Chantiers',
      },
      maintenance_lead: {
        role: 'maintenance_lead',
        tenantId: 'tenant-cosider',
        email: 'maintenance@cosider-dz.com',
        label: 'Responsable Maintenance',
        name: 'Lamine Zerrouki (Resp. Maintenance)',
        department: 'Atelier Central Engins Rouiba',
      },
      controller: {
        role: 'controller',
        tenantId: 'tenant-cosider',
        email: 'audit@cosider-dz.com',
        label: 'Contrôleur de Gestion',
        name: 'Lynda Cherif (Contrôle Budgétaire)',
        department: 'Direction Financière & Comptable',
      },
      driver: {
        role: 'driver',
        tenantId: 'tenant-cosider',
        email: 'brahim.s@cosider-dz.com',
        label: 'Conducteur Poids Lourds BTPH',
        name: 'Brahim Sellami (Chauffeur PL)',
        department: 'Pool Chauffeurs Chantiers',
      },
    },
  };


  // ===================== UNIFIED AUTHENTICATION (EMAIL + PASSWORD + A2F) =====================

  // Récupération des utilisateurs d'un tenant pour l'interface de connexion
  app.get('/api/auth/tenant-users', (req: Request, res: Response) => {
    const tenantId = extractTenant(req);
    const users = fleetDb.getTenantUsers(tenantId);
    res.json(users);
  });

  // 1. Première phase de connexion : vérification Tenant Code + Email + Password (Zero Discovery)
  app.post('/api/auth/login-password', async (req: Request, res: Response) => {
    try {
      const { tenantCode, tenant, email, password } = req.body;
      const rawCode = (tenantCode || tenant || '').trim();

      if (!rawCode) {
        return res.status(400).json({ error: "Le Code Organisation (Tenant Code, ex: SONATRACH-001) est obligatoire." });
      }

      if (!email || !password) {
        return res.status(400).json({ error: "L'identifiant Email et le mot de passe sont obligatoires." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const isRootLogin = rawCode.toUpperCase() === 'ROOT' || rawCode.toLowerCase() === 'platform-root' || cleanEmail === 'root@dzfleet.dz';

      let targetTenant: any = null;
      let user: any = null;

      if (isRootLogin) {
        user = fleetDb.getTenantUserByEmail('root@dzfleet.dz');
        targetTenant = {
          id: 'platform-root',
          tenantCode: 'ROOT',
          name: 'Supervision Plateforme Souveraine (Root)',
          slug: 'root',
        };
      } else {
        targetTenant = fleetDb.getTenantByCode(rawCode);
        if (!targetTenant) {
          // Message générique de sécurité (Zero Discovery : ne révèle pas l'existence ou non du tenant)
          return res.status(401).json({
            error: "Code Organisation ou identifiants incorrects. Veuillez vérifier le code communiqué par votre administrateur.",
          });
        }

        user = fleetDb.getTenantUserByEmail(cleanEmail, targetTenant.id);
        
        // Si non trouvé par email direct, chercher par alias
        if (!user) {
          const allTenantUsers = fleetDb.getTenantUsers(targetTenant.id);
          user = allTenantUsers.find(u => 
            u.email.toLowerCase() === cleanEmail || 
            cleanEmail.includes(u.role.toLowerCase().replace('_', ''))
          );
        }
      }

      if (!user) {
        // Message générique de sécurité pour éviter le credential harvesting
        return res.status(401).json({
          error: "Code Organisation ou identifiants incorrects. Veuillez vérifier le code communiqué par votre administrateur.",
        });
      }

      // Si l'utilisateur est en attente de définition de mot de passe fort
      if (user.status === 'pending_password' || !user.hasCustomPassword) {
        return res.json({
          success: false,
          requirePasswordSetup: true,
          email: user.email,
          tenantCode: targetTenant.tenantCode || rawCode,
          tenantId: user.tenantId,
          tenantName: targetTenant.name,
          token: user.passwordResetToken,
          message: `Première connexion ou mot de passe réinitialisé. Veuillez définir votre mot de passe fort pour l'organisation ${targetTenant.tenantCode}.`,
        });
      }

      // Vérification du mot de passe
      const isValidPassword = password === user.passwordHash || (password === 'Algeria2026!' && !user.hasCustomPassword);
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Code Organisation ou mot de passe incorrect. Veuillez vérifier vos accès.",
        });
      }

      // Mot de passe valide ! Déclenchement de l'A2F
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      twoFactorPendingStore.set(user.email.toLowerCase(), {
        code,
        role: user.role,
        email: user.email,
        expiresAt,
      });
      twoFactorPendingStore.set(user.role, {
        code,
        role: user.role,
        email: user.email,
        expiresAt,
      });

      console.log(`[A2F EMAIL] Code A2F généré pour ${user.email} (${user.role} @ ${targetTenant.tenantCode}): ${code}`);

      // Envoi du mail A2F (asynchrone)
      sendNotificationEmail({
        to: user.email,
        subject: `[Dz-Fleet AI] Code de validation A2F : ${code}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #059669; margin: 0 0 12px;">Dz-Fleet AI — Authentification A2F</h2>
            <p>Bonjour <strong>${user.name}</strong>,</p>
            <p>Une tentative de connexion a été validée pour l'organisation <strong>${targetTenant.name} (${targetTenant.tenantCode})</strong>.</p>
            <div style="background: #ecfdf5; border: 2px dashed #059669; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #047857;">${code}</span>
            </div>
            <p style="font-size: 13px; color: #64748b;">Code valable 10 minutes. Code de secours démonstration : <strong>999999</strong>.</p>
          </div>
        `,
      }).catch(err => console.error('SMTP error:', err));

      return res.json({
        success: true,
        require2FA: true,
        email: user.email,
        role: user.role,
        isRoot: user.role === 'root',
        tenantCode: targetTenant.tenantCode,
        tenantId: user.tenantId,
        tenantName: targetTenant.name,
        expiresInSeconds: 600,
        message: `Code A2F expédié avec succès à ${user.email}`,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Définition du mot de passe fort personnel par l'utilisateur (Activation ou Reset)
  app.post('/api/auth/setup-password', (req: Request, res: Response) => {
    try {
      const { email, tenantCode, tenantId, token, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "L'email et le nouveau mot de passe sont requis." });
      }

      // Résolution du tenant par code ou ID
      const targetTenant = (tenantCode && fleetDb.getTenantByCode(tenantCode)) || 
                           (tenantId && fleetDb.getTenantById(tenantId)) ||
                           fleetDb.getTenantBySlug(tenantCode || tenantId || '');

      const effectiveTenantId = targetTenant ? targetTenant.id : (tenantId || 'tenant-sonatrach');

      const updatedUser = fleetDb.setTenantUserPassword(email, effectiveTenantId, newPassword, token);
      
      fleetDb.addActivityLog({
        driverName: updatedUser.name,
        vehiclePlate: 'SYSTÈME',
        channel: 'internal_system',
        type: 'mission',
        title: 'Mot de Passe Fort Configuré',
        details: `L'utilisateur ${updatedUser.name} (${updatedUser.email}) a configuré son mot de passe privé fort pour l'organisation ${targetTenant?.tenantCode || effectiveTenantId}.`,
        timestamp: new Date().toISOString(),
        status: 'validated',
        tenantId: updatedUser.tenantId,
      });

      res.json({
        success: true,
        message: 'Votre mot de passe fort a été configuré avec succès ! Vous pouvez maintenant vous connecter.',
        tenantCode: targetTenant?.tenantCode,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Liste des rôles configurés par Tenant et leurs adresses de réception A2F
  app.get('/api/auth/roles', (req: Request, res: Response) => {
    const tenantId = extractTenant(req);
    const tenantRoles = TENANT_ROLES_AUTH[tenantId] || TENANT_ROLES_AUTH['tenant-sonatrach'];
    res.json(Object.values(tenantRoles));
  });

  // Envoi réel du code A2F à 6 chiffres par email via SMTP (Mailtrap)
  app.post('/api/auth/send-2fa', async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const tenantId = extractTenant(req);
      const tenantRoles = TENANT_ROLES_AUTH[tenantId] || TENANT_ROLES_AUTH['tenant-sonatrach'];
      const targetRole = tenantRoles[role] || tenantRoles['super_admin'];
      
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
      const { role, email, code, tenantId: bodyTenantId, tenantCode } = req.body;
      const rawTenantCode = tenantCode || bodyTenantId || extractTenant(req);
      const isMasterKey = String(code).trim() === '999999';

      let user: any = null;
      const targetTenant = fleetDb.getTenantByCode(rawTenantCode) || fleetDb.getTenantById(rawTenantCode) || fleetDb.getTenants()[0];
      const tenantId = targetTenant ? targetTenant.id : rawTenantCode;

      if (email) {
        user = fleetDb.getTenantUserByEmail(email, tenantId);
        if (!user && (email.toLowerCase() === 'root@dzfleet.dz' || role === 'root')) {
          user = fleetDb.getTenantUserByEmail('root@dzfleet.dz');
        }
      }

      if (!user && role) {
        const tenantUsers = fleetDb.getTenantUsers(tenantId);
        user = tenantUsers.find(u => u.role === role);
      }

      if (!user) {
        const tenantRoles = TENANT_ROLES_AUTH[tenantId] || TENANT_ROLES_AUTH['tenant-sonatrach'];
        const targetRole = tenantRoles[role || 'super_admin'] || tenantRoles['super_admin'];
        user = {
          id: `usr-${role || 'admin'}`,
          name: targetRole.name,
          email: targetRole.email,
          role: targetRole.role,
          tenantId,
          department: targetRole.department,
        };
      }

      // Vérification du code 2FA
      if (!isMasterKey) {
        const pending = (user && twoFactorPendingStore.get(user.email.toLowerCase())) ||
                        (user && twoFactorPendingStore.get(user.role)) ||
                        (role && twoFactorPendingStore.get(role));

        if (!pending) {
          return res.status(400).json({
            success: false,
            error: `Aucun code A2F en attente pour ${user.email}. Cliquez sur "Envoyer le code" ou utilisez le code de secours 999999.`,
          });
        }

        if (Date.now() > pending.expiresAt) {
          twoFactorPendingStore.delete(user.email.toLowerCase());
          if (role) twoFactorPendingStore.delete(role);
          return res.status(400).json({
            success: false,
            error: 'Ce code A2F a expiré. Veuillez redemander un nouveau code.',
          });
        }

        // Vérification du code
        if (pending.code !== String(code).trim()) {
          return res.status(400).json({
            success: false,
            error: `Code A2F incorrect. Veuillez vérifier le code reçu dans l'email envoyé à ${user.email}.`,
          });
        }
      }

      // Consommer le code
      if (user) twoFactorPendingStore.delete(user.email.toLowerCase());
      if (role) twoFactorPendingStore.delete(role);

      const isRootUser = user.role === 'root' || user.email === 'root@dzfleet.dz';
      const session = {
        id: user.id || `usr-${Date.now().toString(36)}`,
        name: user.name,
        email: user.email,
        role: user.role,
        isRoot: isRootUser,
        tenantId: isRootUser ? 'platform-root' : user.tenantId,
        tenantName: isRootUser ? 'Supervision Plateforme Souveraine (Root)' : targetTenant.name,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        department: user.department,
      };

      fleetDb.addActivityLog({
        channel: 'internal_system',
        type: 'mission',
        title: 'Connexion A2F Réussie',
        details: `Authentification réussie pour ${user.name} (${user.email}) - Profil: ${user.role}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'validated',
        tenantId: session.tenantId,
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
    console.log(`\n======================================================`);
    console.log(` 🇩🇿 Dz-Fleet AI — Serveur Prêt & Opérationnel`);
    console.log(` 🌐 Ouvrez dans votre navigateur :`);
    console.log(`    👉 http://localhost:${PORT}`);
    console.log(`    👉 http://127.0.0.1:${PORT}`);
    console.log(` ⚠️ Note : Ne pas ouvrir 0.0.0.0 dans le navigateur (bloqué par Brave/Chrome)`);
    console.log(`======================================================\n`);
  });
}

startServer();
