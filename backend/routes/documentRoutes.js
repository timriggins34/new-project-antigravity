const express = require('express');
const router = express.Router();
const fs = require('fs');
const prisma = require('../db');
const { upload } = require('../utils/storage');

// Smart Document Upload Endpoint (Disk Storage)
router.post('/documents/upload', upload.single('file'), async (req, res) => {
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
router.get('/documents/download/:id', async (req, res) => {
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
router.post('/documents', async (req, res) => {
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
router.get('/doc-jobs', async (req, res) => {
  try {
    const jobs = await prisma.docJob.findMany({
      include: { documents: true }
    });
    res.json(jobs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch doc jobs' }); }
});

router.patch('/doc-jobs/:id', async (req, res) => {
  try {
    const updated = await prisma.docJob.update({
      where: { job_id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update doc job' }); }
});

module.exports = router;
