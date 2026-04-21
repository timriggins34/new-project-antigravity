const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- FREIGHT JOBS ---
router.get('/freight-jobs', async (req, res) => {
  try {
    const freight = await prisma.freightJob.findMany({
      include: { vendors: true }
    });
    res.json(freight);
  }
  catch (error) { res.status(500).json({ error: 'Failed to fetch freight jobs' }); }
});

router.put('/freight-jobs/:id', async (req, res) => {
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

module.exports = router;
