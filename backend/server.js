const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes

// --- CLIENTS ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients.map(c => ({...c, docs: JSON.parse(c.docs)})));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch clients' }); }
});

app.post('/api/clients', async (req, res) => {
  try {
    const data = req.body;
    const newClient = await prisma.client.create({
      data: {
        client_id: `CLI-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: data.name, nickname: data.nickname, clientType: data.clientType, constitution: data.constitution,
        status: data.status, clientSinceYear: data.clientSinceYear, pan: data.pan, gstin: data.gstin,
        iec: data.iec, cin_llpin: data.cin_llpin, tan: data.tan, address: data.address,
        contactPerson: data.contactPerson, contactNickname: data.contactNickname, mobile: data.mobile,
        email: data.email, contact1: data.contact1, contact2: data.contact2, bankName: data.bankName,
        branchName: data.branchName, accountNumber: data.accountNumber, accountType: data.accountType,
        ifsc: data.ifsc, swift: data.swift, bankAddress: data.bankAddress, adCode: data.adCode,
        details: data.details, docs: JSON.stringify(data.docs || [])
      }
    });
    res.status(201).json(newClient);
  } catch (error) { res.status(500).json({ error: 'Failed to create client' }); }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.client.update({
      where: { client_id: req.params.id },
      data: { ...data, docs: data.docs ? JSON.stringify(data.docs) : undefined }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update client' }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await prisma.client.delete({ where: { client_id: req.params.id } });
    res.json({ message: 'Client deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete client' }); }
});

// --- VENDORS ---
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json(vendors.map(v => ({...v, activeJobs: JSON.parse(v.activeJobs), pastJobs: JSON.parse(v.pastJobs)})));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch vendors' }); }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const data = req.body;
    const vendor = await prisma.vendor.create({
      data: {
        vendor_id: `VND-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: data.name, type: data.type, contact: data.contact, phone: data.phone, email: data.email,
        activeJobs: JSON.stringify(data.activeJobs || []), pastJobs: JSON.stringify(data.pastJobs || [])
      }
    });
    res.status(201).json(vendor);
  } catch (error) { res.status(500).json({ error: 'Failed to create vendor' }); }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.vendor.update({
      where: { vendor_id: req.params.id },
      data: { 
        ...data, 
        activeJobs: data.activeJobs ? JSON.stringify(data.activeJobs) : undefined,
        pastJobs: data.pastJobs ? JSON.stringify(data.pastJobs) : undefined
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update vendor' }); }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    await prisma.vendor.delete({ where: { vendor_id: req.params.id } });
    res.json({ message: 'Vendor deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete vendor' }); }
});

// --- CLEARANCE JOBS ---
app.get('/api/clearance-jobs', async (req, res) => {
  try {
    const jobs = await prisma.clearanceJob.findMany();
    res.json(jobs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch clearance jobs' }); }
});

app.post('/api/clearance-jobs', async (req, res) => {
  try {
    const data = req.body;
    const job = await prisma.clearanceJob.create({
      data: {
        job_id: `CJ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        ...data
      }
    });
    res.status(201).json(job);
  } catch (error) { res.status(500).json({ error: 'Failed to create job' }); }
});

app.put('/api/clearance-jobs/:id', async (req, res) => {
  try {
    const updated = await prisma.clearanceJob.update({
      where: { job_id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update job' }); }
});

// PATCH: Advance a clearance job to the next stage
app.patch('/api/clearance-jobs/:id/advance', async (req, res) => {
  const stages = ['Filing', 'Assessment', 'Duty', 'Exam', 'OOC'];
  try {
    const job = await prisma.clearanceJob.findUnique({ where: { job_id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const currentIdx = stages.indexOf(job.stage);
    const isLastStage = currentIdx === stages.length - 1;

    const nextStage = isLastStage ? job.stage : stages[currentIdx + 1];
    const newStatus = isLastStage ? 'completed' : 'pending';

    const updated = await prisma.clearanceJob.update({
      where: { job_id: req.params.id },
      data: {
        stage: nextStage,
        status: newStatus,
        alert: false, // clear any alert on advancement
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to advance job stage' });
  }
});

app.delete('/api/clearance-jobs/:id', async (req, res) => {
  try {
    await prisma.clearanceJob.delete({ where: { job_id: req.params.id } });
    res.json({ message: 'Job deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete job' }); }
});

// --- DOC JOBS ---
app.get('/api/doc-jobs', async (req, res) => {
  try {
    const jobs = await prisma.docJob.findMany();
    res.json(jobs.map(j => ({...j, docs: JSON.parse(j.docs)})));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch doc jobs' }); }
});

app.post('/api/doc-jobs', async (req, res) => {
  try {
    const data = req.body;
    const job = await prisma.docJob.create({
      data: {
        job_id: `DJ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        client: data.client, status: data.status, type: data.type,
        docs: JSON.stringify(data.docs || [])
      }
    });
    res.status(201).json(job);
  } catch (error) { res.status(500).json({ error: 'Failed to create doc job' }); }
});

app.put('/api/doc-jobs/:id', async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.docJob.update({
      where: { job_id: req.params.id },
      data: { ...data, docs: data.docs ? JSON.stringify(data.docs) : undefined }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update doc job' }); }
});

app.delete('/api/doc-jobs/:id', async (req, res) => {
  try {
    await prisma.docJob.delete({ where: { job_id: req.params.id } });
    res.json({ message: 'Doc job deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete doc job' }); }
});

// --- LOGISTICS TRIPS ---
app.get('/api/logistics-trips', async (req, res) => {
  try { const trips = await prisma.logisticsTrip.findMany(); res.json(trips); } 
  catch (error) { res.status(500).json({ error: 'Failed to fetch trips' }); }
});

app.post('/api/logistics-trips', async (req, res) => {
  try {
    const data = req.body;
    const trip = await prisma.logisticsTrip.create({
      data: { trip_id: `TRP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, ...data }
    });
    res.status(201).json(trip);
  } catch (error) { res.status(500).json({ error: 'Failed to create trip' }); }
});

app.put('/api/logistics-trips/:id', async (req, res) => {
  try {
    const updated = await prisma.logisticsTrip.update({ where: { trip_id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update trip' }); }
});

app.delete('/api/logistics-trips/:id', async (req, res) => {
  try {
    await prisma.logisticsTrip.delete({ where: { trip_id: req.params.id } });
    res.json({ message: 'Trip deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete trip' }); }
});

// --- LICENCES ---
app.get('/api/licences', async (req, res) => {
  try { const licences = await prisma.licence.findMany(); res.json(licences); } 
  catch (error) { res.status(500).json({ error: 'Failed to fetch licences' }); }
});

app.post('/api/licences', async (req, res) => {
  try {
    const data = req.body;
    const licence = await prisma.licence.create({
      data: { licence_id: `LIC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, ...data }
    });
    res.status(201).json(licence);
  } catch (error) { res.status(500).json({ error: 'Failed to create licence' }); }
});

app.put('/api/licences/:id', async (req, res) => {
  try {
    const updated = await prisma.licence.update({ where: { licence_id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update licence' }); }
});

app.delete('/api/licences/:id', async (req, res) => {
  try {
    await prisma.licence.delete({ where: { licence_id: req.params.id } });
    res.json({ message: 'Licence deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete licence' }); }
});

// --- FREIGHT JOBS ---
app.get('/api/freight-jobs', async (req, res) => {
  try { const freight = await prisma.freightJob.findMany(); res.json(freight); } 
  catch (error) { res.status(500).json({ error: 'Failed to fetch freight jobs' }); }
});

app.post('/api/freight-jobs', async (req, res) => {
  try {
    const data = req.body;
    const job = await prisma.freightJob.create({
      data: { job_id: `FRT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, ...data }
    });
    res.status(201).json(job);
  } catch (error) { res.status(500).json({ error: 'Failed to create freight job' }); }
});

app.put('/api/freight-jobs/:id', async (req, res) => {
  try {
    const updated = await prisma.freightJob.update({ where: { job_id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update freight job' }); }
});

app.delete('/api/freight-jobs/:id', async (req, res) => {
  try {
    await prisma.freightJob.delete({ where: { job_id: req.params.id } });
    res.json({ message: 'Freight job deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete freight job' }); }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
