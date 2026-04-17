const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { verifyToken, restrictIP } = require('./middleware/auth');
const { upload, UPLOAD_ROOT } = require('./utils/storage');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- BACKGROUND JOBS (CRON) ---

// Daily License Expiry Check (Midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily licence expiry check...');
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const licences = await prisma.licence.findMany({
      where: { alert: false }
    });

    let alertCount = 0;
    for (const licence of licences) {
      const expiryDate = new Date(licence.expiry);
      if (expiryDate <= thirtyDaysFromNow) {
        await prisma.licence.update({
          where: { id: licence.id },
          data: { alert: true }
        });
        alertCount++;
      }
    }
    console.log(`✅ Cron completed. Flagged ${alertCount} licences for expiry.`);
  } catch (error) {
    console.error('❌ Cron job failed:', error);
  }
});

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', restrictIP, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- API ENDPOINTS (PROTECTED) ---
// Global protection for all /api routes defined below
app.use('/api', verifyToken, restrictIP);

// --- USERS & ASSIGNMENT ---
app.get('/api/users/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, username: true }
    });
    res.json(employees);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch employees' }); }
});

// --- CLIENTS ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: { documents: true }
    });
    res.json(clients);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch clients' }); }
});

app.post('/api/clients', async (req, res) => {
  try {
    const data = req.body;
    const newClient = await prisma.client.create({
      data: {
        ...data,
        client_id: `CLI-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        documents: data.documents ? { create: data.documents } : undefined
      },
      include: { documents: true }
    });
    res.status(201).json(newClient);
  } catch (error) { res.status(500).json({ error: 'Failed to create client' }); }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { documents, ...rest } = req.body;
    const updated = await prisma.client.update({
      where: { client_id: req.params.id },
      data: rest,
      include: { documents: true }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update client' }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    // Delete related documents first (or rely on Cascade if set up, but SQLite needs care)
    const client = await prisma.client.findUnique({ where: { client_id: req.params.id } });
    if (client) {
      await prisma.document.deleteMany({ where: { clientId: client.id } });
      await prisma.client.delete({ where: { client_id: req.params.id } });
    }
    res.json({ message: 'Client and related records deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete client' }); }
});

// --- VENDORS ---
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: { clearanceJobs: true, freightJobs: true, documents: true }
    });
    res.json(vendors);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch vendors' }); }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const data = req.body;
    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        vendor_id: `VND-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      }
    });
    res.status(201).json(vendor);
  } catch (error) { res.status(500).json({ error: 'Failed to create vendor' }); }
});

// --- CLEARANCE JOBS ---
app.get('/api/clearance-jobs', async (req, res) => {
  try {
    const jobs = await prisma.clearanceJob.findMany({
      include: { 
        hsCodeItems: true, 
        vendors: true, 
        assignedTo: { select: { id: true, name: true } },
        documents: true 
      }
    });
    res.json(jobs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch clearance jobs' }); }
});

app.post('/api/clearance-jobs', async (req, res) => {
  try {
    const { hsCodeItems, vendors, assignedToId, ...rest } = req.body;
    const job = await prisma.clearanceJob.create({
      data: {
        ...rest,
        job_id: `CJ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        hsCodeItems: hsCodeItems ? { create: hsCodeItems } : undefined,
        vendors: vendors ? { connect: vendors.map(v => ({ id: v.id })) } : undefined,
        assignedToId: assignedToId || null
      },
      include: { hsCodeItems: true, vendors: true, assignedTo: true }
    });
    res.status(201).json(job);
  } catch (error) { res.status(500).json({ error: 'Failed to create job' }); }
});

app.put('/api/clearance-jobs/:id', async (req, res) => {
  try {
    const { hsCodeItems, vendors, assignedToId, ...rest } = req.body;
    const updated = await prisma.clearanceJob.update({
      where: { job_id: req.params.id },
      data: {
        ...rest,
        vendors: vendors ? { set: vendors.map(v => ({ id: v.id })) } : undefined,
        assignedToId: assignedToId || null
      },
      include: { hsCodeItems: true, vendors: true, assignedTo: true }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update job' }); }
});

// Tally Export Endpoint
app.get('/api/clearance/:id/tally-export', async (req, res) => {
  try {
    const job = await prisma.clearanceJob.findUnique({
      where: { job_id: req.params.id },
      include: { hsCodeItems: true }
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });

    const assessableValue = job.hsCodeItems.reduce((acc, item) => acc + (item.assessableValue || 0), 0);
    const duty = job.dutyAmount || 0;
    const penalty = job.penalty || 0;
    const total = assessableValue + duty + penalty;

    const csvContent = [
      'Job_ID,Client,Challan,Assessable_Value,Duty,Penalty,Total',
      `${job.job_id},"${job.client}",${job.icegateChallan || 'N/A'},${assessableValue.toFixed(2)},${duty.toFixed(2)},${penalty.toFixed(2)},${total.toFixed(2)}`
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.attachment(`tally-export-${job.job_id}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export Tally data' });
  }
});

// Smart Document Upload Endpoint (Disk Storage)
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { 
      documentName, 
      entityType, 
      entityId, 
      clientId, 
      docJobId, 
      vendorId, 
      clearanceJobId, 
      logisticsTripId 
    } = req.body;

    // Save metadata to DB
    const document = await prisma.document.create({
      data: {
        name: documentName || req.file.originalname,
        url: req.file.path, // Store the disk path
        clientId: clientId || null,
        docJobId: docJobId || null,
        vendorId: vendorId || null,
        clearanceJobId: clearanceJobId || null,
        logisticsTripId: logisticsTripId || null
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Document Download/Stream Endpoint
app.get('/api/documents/download/:id', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc || !doc.url) return res.status(404).json({ error: 'Document not found' });

    if (!fs.existsSync(doc.url)) {
      return res.status(404).json({ error: 'File missing on local drive' });
    }

    res.download(doc.url, doc.name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to access document' });
  }
});

// Legacy Record creation (still useful for simple links)
app.post('/api/documents', async (req, res) => {
  try {
    const { name, url, clientId, docJobId } = req.body;
    const document = await prisma.document.create({
      data: { name, url, clientId, docJobId }
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document record' });
  }
});

// --- DOC JOBS ---
app.get('/api/doc-jobs', async (req, res) => {
  try {
    const jobs = await prisma.docJob.findMany({
      include: { documents: true }
    });
    res.json(jobs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch doc jobs' }); }
});

app.patch('/api/doc-jobs/:id', async (req, res) => {
  try {
    const updated = await prisma.docJob.update({
      where: { job_id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update doc job' }); }
});

// --- LOGISTICS TRIPS ---
app.get('/api/logistics-trips', async (req, res) => {
  try { 
    const trips = await prisma.logisticsTrip.findMany({
      include: { 
        assignedTo: { select: { id: true, name: true } },
        documents: true 
      }
    }); 
    res.json(trips); 
  } 
  catch (error) { res.status(500).json({ error: 'Failed to fetch trips' }); }
});

// Kanban Status Update
app.patch('/api/logistics/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.logisticsTrip.update({
      where: { trip_id: req.params.id },
      data: { 
        status,
        delayed: false 
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update logistics status' }); }
});

app.post('/api/logistics-trips', async (req, res) => {
  try {
    const { assignedToId, ...data } = req.body;
    const trip = await prisma.logisticsTrip.create({
      data: {
        ...data,
        assignedToId: assignedToId || null
      },
      include: { assignedTo: true }
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create logistics trip' });
  }
});

app.put('/api/logistics-trips/:id', async (req, res) => {
  try {
    const { assignedToId, ...data } = req.body;
    const updated = await prisma.logisticsTrip.update({
      where: { trip_id: req.params.id },
      data: {
        truck: data.truck,
        driver: data.driver,
        status: data.status,
        eta: data.eta,
        delayed: data.delayed,
        assignedToId: assignedToId || null
      },
      include: { assignedTo: true }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update logistics trip' }); }
});

// --- LICENCES ---
app.get('/api/licences', async (req, res) => {
  try { const licences = await prisma.licence.findMany(); res.json(licences); } 
  catch (error) { res.status(500).json({ error: 'Failed to fetch licences' }); }
});

// Licence Utilization Update
app.patch('/api/licences/:id/utilize', async (req, res) => {
  try {
    const { amount } = req.body;
    const licence = await prisma.licence.findUnique({
      where: { licence_id: req.params.id }
    });

    if (!licence) return res.status(404).json({ error: 'Licence not found' });

    const updated = await prisma.licence.update({
      where: { licence_id: req.params.id },
      data: { utilized: (licence.utilized || 0) + amount }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update licence utilization' });
  }
});

// --- FREIGHT JOBS ---
app.get('/api/freight-jobs', async (req, res) => {
  try { 
    const freight = await prisma.freightJob.findMany({
      include: { vendors: true }
    }); 
    res.json(freight); 
  } 
  catch (error) { res.status(500).json({ error: 'Failed to fetch freight jobs' }); }
});

app.put('/api/freight-jobs/:id', async (req, res) => {
  try {
    const { vendors, ...data } = req.body;
    const updated = await prisma.freightJob.update({
      where: { job_id: req.params.id },
      data: {
        ...data,
        vendors: vendors ? { set: vendors.map(v => ({ id: v.id })) } : undefined
      },
      include: { vendors: true }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update freight job' }); }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
