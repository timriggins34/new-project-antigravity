const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- CLEARANCE JOBS ---
router.get('/clearance-jobs', async (req, res) => {
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

router.post('/clearance-jobs', async (req, res) => {
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

router.put('/clearance-jobs/:id', async (req, res) => {
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
router.get('/clearance/:id/tally-export', async (req, res) => {
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

module.exports = router;
