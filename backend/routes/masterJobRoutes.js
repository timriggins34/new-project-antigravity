const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { generateMasterJobNo } = require('../utils/idGenerator');

// --- MASTER JOBS & SMART CHECKLISTS ---

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
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
          { direction: { in: [direction, null] } },
          { mode: { in: [mode, null] } },
          { 
            OR: [
              { hsCode: hsCode || null },
              { hsCode: null }
            ]
          },
          {
            OR: [
              { incoterm: incoterm || null },
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
          if (r.incoterm === incoterm && r.incoterm !== null) score += 100;
          if (r.mode === mode && r.mode !== null) score += 10;
          if (r.direction === direction && r.direction !== null) score += 5;
          return score || 1; // Base score of 1 for null/null/null/null
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

router.get('/:id/checklist', async (req, res) => {
  try {
    const checklist = await prisma.jobChecklist.findMany({
      where: { masterJobId: req.params.id },
      include: {
        masterDocument: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (checklist.length > 0) {
      console.log(`[API] Returning ${checklist.length} items. First item isMandatory: ${checklist[0].isMandatory}`);
    }
    
    res.json(checklist);

  } catch (error) {
    console.error('Fetch checklist failed:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

router.patch('/checklist/:id', async (req, res) => {
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

module.exports = router;
