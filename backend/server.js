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
const { generateMasterJobNo } = require('./utils/idGenerator');


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
      logisticsTripId,
      jobChecklistId
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
        logisticsTripId: logisticsTripId || null,
        jobChecklistId: jobChecklistId || null
      }
    });

    // If it's a checklist upload, update the checklist status
    if (jobChecklistId) {
      await prisma.jobChecklist.update({
        where: { id: jobChecklistId },
        data: {
          status: 'VERIFY',
          filePath: req.file.path,
          overrideReason: null // Reset override reason if a file is uploaded
        }
      });
    }


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

// --- MASTER JOBS & SMART CHECKLISTS ---

app.get('/api/master-jobs', async (req, res) => {
  try {
    const jobs = await prisma.masterJob.findMany({
      include: {
        client: { select: { name: true, nickname: true } },
        checklists: {
          include: { masterDocument: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch master jobs' });
  }
});

app.post('/api/master-jobs', async (req, res) => {
  try {
    const { clientId, direction, mode, incoterm, hsCode } = req.body;

    // 1. Generate Custom jobNo
    const jobNo = await generateMasterJobNo(direction, prisma);

    // 2. Create MasterJob
    const masterJob = await prisma.masterJob.create({
      data: {
        jobNo,
        clientId,
        direction,
        mode,
        incoterm,
        hsCode,
        computedStatus: 'PENDING'
      }
    });

    // 3. GENERATE SMART CHECKLIST (REFINED HIERARCHICAL ENGINE)
    const allMatchingRules = await prisma.documentRule.findMany({
      where: {
        AND: [
          { direction: { in: [direction, 'ANY'] } },
          { mode: { in: [mode, 'ANY'] } },
          { 
            OR: [
              { hsCode: hsCode || null },
              { hsCode: null }
            ]
          },
          {
            OR: [
              { incoterm: incoterm || null },
              { incoterm: 'ANY' },
              { incoterm: null }
            ]
          }
        ]
      }
    });

    const masterDocs = await prisma.masterDocument.findMany();
    const checklistItems = [];

    for (const doc of masterDocs) {
      const docRules = allMatchingRules.filter(r => r.masterDocumentId === doc.id);
      if (docRules.length === 0) continue;

      // SPECIFICITY SCORING
      docRules.sort((a, b) => {
        const getScore = (r) => {
          let score = 0;
          if (r.hsCode === hsCode && r.hsCode !== null) score += 1000;
          if (r.incoterm === incoterm && r.incoterm !== 'ANY' && r.incoterm !== null) score += 100;
          if (r.mode === mode && r.mode !== 'ANY') score += 10;
          if (r.direction === direction && r.direction !== 'ANY') score += 5;
          return score || 1; // Base score of 1 for ANY/ANY/ANY/ANY
        };
        return getScore(b) - getScore(a);
      });

      const bestRule = docRules[0];
      checklistItems.push({
        masterJobId: masterJob.id,
        masterDocumentId: doc.id,
        stage: bestRule.stageRequired || 'General',
        isMandatory: bestRule.isMandatory,
        status: 'MISSING'
      });
    }


    if (checklistItems.length > 0) {
      await prisma.jobChecklist.createMany({ data: checklistItems });
      const manCount = checklistItems.filter(i => i.isMandatory).length;
      console.log(`[Checklist Gen] Created ${checklistItems.length} items for Job ${jobNo} (Mandatory: ${manCount})`);
    }

    res.status(201).json(masterJob);


  } catch (error) {
    console.error('Master Job creation failed:', error);
    res.status(500).json({ error: 'Failed to create Master Job and Checklist' });
  }
});

app.get('/api/master-jobs/:id/checklist', async (req, res) => {
  try {
    const checklist = await prisma.jobChecklist.findMany({
      where: { masterJobId: req.params.id },
      include: {
        masterDocument: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    // Explicitly logging the first item's isMandatory flag for debug
    if (checklist.length > 0) {
      console.log(`[API] Returning ${checklist.length} items. First item isMandatory: ${checklist[0].isMandatory}`);
    }
    
    res.json(checklist);

  } catch (error) {
    console.error('Fetch checklist failed:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

app.patch('/api/master-jobs/checklist/:id', async (req, res) => {
  try {
    const { status, overrideReason } = req.body;
    const updated = await prisma.jobChecklist.update({
      where: { id: req.params.id },
      data: { status, overrideReason }
    });
    res.json(updated);
  } catch (error) {
    console.error('Checklist update failed:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
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

app.get('/api/document-rules/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.ruleAuditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    res.json(logs);
  } catch (error) {
    console.error('Audit Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.get('/api/document-rules/matrix', async (req, res) => {
  try {
    const { direction, mode, incoterm } = req.query;
    const finalIncoterm = incoterm === 'ANY' || !incoterm ? null : incoterm;
    
    // For GET Matrix display, we only take the FIRST HS code if a list is provided
    const rawHsCode = req.query.hsCode || '';
    const hsCode = rawHsCode.includes(',') ? rawHsCode.split(',')[0].trim() : (rawHsCode || null);
    
    const hierarchy = [
      { direction, mode, incoterm, hsCode },
      { direction, mode, incoterm, hsCode: null },
      { direction, mode, incoterm: null, hsCode: null },
      { direction, mode: 'ANY', incoterm: null, hsCode: null },
      { direction: 'ANY', mode: 'ANY', incoterm: null, hsCode: null },
    ];

    for (let i = 0; i < hierarchy.length; i++) {
      const rules = await prisma.documentRule.findMany({
        where: hierarchy[i],
        include: { masterDocument: true }
      });

      if (rules.length > 0) {
        return res.json(rules.map(r => ({
          ...r,
          isInherited: i > 0 // If i=0, it's an exact match, else it's inherited
        })));
      }
    }

    res.json([]);
  } catch (error) {
    console.error('Matrix Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch rule matrix' });
  }
});


app.post('/api/document-rules/sync', async (req, res) => {
  try {
    const { direction, mode, incoterm, hsCode, rules } = req.body;
    const finalIncoterm = incoterm === 'ANY' ? null : (incoterm || null);
    
    // Batch processing: Split HS codes by comma
    const hsCodesArray = hsCode && String(hsCode).trim() 
      ? hsCode.split(',').map(code => code.trim()).filter(Boolean) 
      : [null];

    const allOperations = [];
    
    for (const code of hsCodesArray) {
      const finalHsCode = code === 'ANY' ? null : (code || null);
      
      // Calculate Diffs for Audit Log
      const oldRules = await prisma.documentRule.findMany({
        where: {
          direction: direction || 'ANY',
          mode: mode || 'ANY',
          incoterm: finalIncoterm,
          hsCode: finalHsCode
        }
      });

      const oldMandatoryCount = oldRules.filter(r => r.isMandatory).length;
      const oldOptionalCount = oldRules.filter(r => !r.isMandatory).length;
      const newMandatoryCount = rules.filter(r => r.isMandatory).length;
      const newOptionalCount = rules.filter(r => !r.isMandatory).length;

      // Only add Audit Log if there's actually a change (or rules being added/removed)
      const oldSig = oldRules.map(r => `${r.masterDocumentId}-${r.stageRequired}-${r.isMandatory}`).sort().join('|');
      const newSig = rules.map(r => `${r.masterDocumentId}-${r.stageRequired}-${r.isMandatory}`).sort().join('|');
      
      if (oldSig !== newSig) {
        allOperations.push(
          prisma.ruleAuditLog.create({
            data: {
              direction: direction || 'ANY',
              mode: mode || 'ANY',
              incoterm: finalIncoterm,
              hsCode: finalHsCode,
              addedMandatory: newMandatoryCount,
              removedMandatory: oldMandatoryCount,
              addedOptional: newOptionalCount,
              removedOptional: oldOptionalCount,
              userId: req.user.id
            }
          })
        );
      }

      allOperations.push(
        prisma.documentRule.deleteMany({
          where: {
            direction: direction || 'ANY',
            mode: mode || 'ANY',
            incoterm: finalIncoterm,
            hsCode: finalHsCode
          }
        })
      );
      
      if (rules && rules.length > 0) {
        allOperations.push(
          prisma.documentRule.createMany({
            data: rules.map(r => ({
              masterDocumentId: r.masterDocumentId,
              direction: direction || 'ANY',
              mode: mode || 'ANY',
              incoterm: finalIncoterm,
              hsCode: finalHsCode,
              stageRequired: r.stageRequired,
              isMandatory: r.isMandatory
            }))
          })
        );
      }
    }

    await prisma.$transaction(allOperations);
    res.json({ success: true });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync rules batch' });
  }
});


app.delete('/api/document-rules/reset', async (req, res) => {
  try {
    const { direction, mode, incoterm, hsCode } = req.query;
    const finalIncoterm = incoterm === 'ANY' ? null : (incoterm || null);
    
    const hsCodesArray = hsCode && String(hsCode).trim() 
      ? hsCode.split(',').map(code => code.trim()).filter(Boolean) 
      : [null];

    const allOperations = [];
    
    for (const code of hsCodesArray) {
      const finalHsCode = code === 'ANY' ? null : (code || null);
      
      // Fetch existing to count removals
      const oldRules = await prisma.documentRule.findMany({
        where: {
          direction: direction || 'ANY',
          mode: mode || 'ANY',
          incoterm: finalIncoterm,
          hsCode: finalHsCode
        }
      });

      allOperations.push(
        prisma.ruleAuditLog.create({
          data: {
            direction: direction || 'ANY',
            mode: mode || 'ANY',
            incoterm: finalIncoterm,
            hsCode: finalHsCode,
            addedMandatory: 0,
            removedMandatory: oldRules.filter(r => r.isMandatory).length,
            addedOptional: 0,
            removedOptional: oldRules.filter(r => !r.isMandatory).length,
            userId: req.user.id
          }
        })
      );

      allOperations.push(
        prisma.documentRule.deleteMany({
          where: {
            direction: direction || 'ANY',
            mode: mode || 'ANY',
            incoterm: finalIncoterm,
            hsCode: finalHsCode
          }
        })
      );
    }

    await prisma.$transaction(allOperations);
    res.json({ success: true });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: 'Failed to reset rules batch' });
  }
});



app.get('/api/master-documents', async (req, res) => {
  try {
    const docs = await prisma.masterDocument.findMany({ orderBy: { name: 'asc' } });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch master documents' });
  }
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


