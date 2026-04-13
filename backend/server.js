const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    // Parse the JSON string back into an array before sending to frontend
    res.json(clients.map(c => ({...c, docs: JSON.parse(c.docs)})));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const data = req.body;
    const newClient = await prisma.client.create({
      data: {
        client_id: `CLI-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: data.name,
        nickname: data.nickname,
        clientType: data.clientType,
        constitution: data.constitution,
        status: data.status,
        clientSinceYear: data.clientSinceYear,
        pan: data.pan,
        gstin: data.gstin,
        iec: data.iec,
        cin_llpin: data.cin_llpin,
        tan: data.tan,
        address: data.address,
        contactPerson: data.contactPerson,
        contactNickname: data.contactNickname,
        mobile: data.mobile,
        email: data.email,
        contact1: data.contact1,
        contact2: data.contact2,
        bankName: data.bankName,
        branchName: data.branchName,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        ifsc: data.ifsc,
        swift: data.swift,
        bankAddress: data.bankAddress,
        adCode: data.adCode,
        details: data.details,
        docs: JSON.stringify(data.docs || [])
      }
    });
    res.json(newClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { client_id: id } });
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json(vendors.map(v => ({...v, activeJobs: JSON.parse(v.activeJobs), pastJobs: JSON.parse(v.pastJobs)})));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.get('/api/clearance-jobs', async (req, res) => {
  try {
    const jobs = await prisma.clearanceJob.findMany();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clearance jobs' });
  }
});

app.get('/api/doc-jobs', async (req, res) => {
  try {
    const jobs = await prisma.docJob.findMany();
    res.json(jobs.map(j => ({...j, docs: JSON.parse(j.docs)})));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documentation jobs' });
  }
});

app.get('/api/logistics', async (req, res) => {
  try {
    const trips = await prisma.logisticsTrip.findMany();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logistics trips' });
  }
});

app.get('/api/licences', async (req, res) => {
  try {
    const licences = await prisma.licence.findMany();
    res.json(licences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch licences' });
  }
});

app.get('/api/freight', async (req, res) => {
  try {
    const freight = await prisma.freightJob.findMany();
    res.json(freight);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freight jobs' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
