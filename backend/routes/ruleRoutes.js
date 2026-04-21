const express = require('express');
const router = express.Router();
const prisma = require('../db');

// --- DOCUMENT RULES & MATRIX ---

router.get('/audit-logs', async (req, res) => {
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

router.get('/matrix', async (req, res) => {
  try {
    const normalize = (val) => (val === 'ANY' || !val) ? null : val;
    const direction = normalize(req.query.direction);
    const mode = normalize(req.query.mode);
    const incoterm = normalize(req.query.incoterm);
    
    // For GET Matrix display, we only take the FIRST HS code if a list is provided
    const rawHsCode = req.query.hsCode || '';
    const hsCode = rawHsCode.includes(',') ? normalize(rawHsCode.split(',')[0]) : normalize(rawHsCode);
    
    const hierarchy = [
      { direction, mode, incoterm, hsCode },
      { direction, mode, incoterm, hsCode: null },
      { direction, mode, incoterm: null, hsCode: null },
      { direction, mode: null, incoterm: null, hsCode: null },
      { direction: null, mode: null, incoterm: null, hsCode: null },
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

router.post('/sync', async (req, res) => {
  try {
    const normalize = (val) => (val === 'ANY' || !val) ? null : val;
    const { direction: rawDir, mode: rawMode, incoterm: rawInc, hsCode, rules } = req.body;
    
    const finalDirection = normalize(rawDir);
    const finalMode = normalize(rawMode);
    const finalIncoterm = normalize(rawInc);
    
    // Batch processing: Split HS codes by comma
    const hsCodesArray = hsCode && String(hsCode).trim() 
      ? hsCode.split(',').map(code => code.trim()).filter(Boolean) 
      : [null];

    const allOperations = [];
    
    for (const code of hsCodesArray) {
      const finalHsCode = normalize(code);
      
      // Calculate Diffs for Audit Log
      const oldRules = await prisma.documentRule.findMany({
        where: {
          direction: finalDirection,
          mode: finalMode,
          incoterm: finalIncoterm,
          hsCode: finalHsCode
        }
      });

      const oldMandatoryCount = oldRules.filter(r => r.isMandatory).length;
      const oldOptionalCount = oldRules.filter(r => !r.isMandatory).length;
      const newMandatoryCount = rules.filter(r => r.isMandatory).length;
      const newOptionalCount = rules.filter(r => !r.isMandatory).length;

      // Only add Audit Log if there's actually a change
      const oldSig = oldRules.map(r => `${r.masterDocumentId}-${r.stageRequired}-${r.isMandatory}`).sort().join('|');
      const newSig = rules.map(r => `${r.masterDocumentId}-${r.stageRequired}-${r.isMandatory}`).sort().join('|');
      
      if (oldSig !== newSig) {
        allOperations.push(
          prisma.ruleAuditLog.create({
            data: {
              direction: finalDirection,
              mode: finalMode,
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
            direction: finalDirection,
            mode: finalMode,
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
              direction: finalDirection,
              mode: finalMode,
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

router.delete('/reset', async (req, res) => {
  try {
    const normalize = (val) => (val === 'ANY' || !val) ? null : val;
    const { direction: rawDir, mode: rawMode, incoterm: rawInc, hsCode } = req.query;
    
    const finalDirection = normalize(rawDir);
    const finalMode = normalize(rawMode);
    const finalIncoterm = normalize(rawInc);
    
    const hsCodesArray = hsCode && String(hsCode).trim() 
      ? hsCode.split(',').map(code => code.trim()).filter(Boolean) 
      : [null];

    const allOperations = [];
    
    for (const code of hsCodesArray) {
      const finalHsCode = normalize(code);
      
      // Fetch existing to count removals
      const oldRules = await prisma.documentRule.findMany({
        where: {
          direction: finalDirection,
          mode: finalMode,
          incoterm: finalIncoterm,
          hsCode: finalHsCode
        }
      });

      allOperations.push(
        prisma.ruleAuditLog.create({
          data: {
            direction: finalDirection || 'ANY',
            mode: finalMode || 'ANY',
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
            direction: finalDirection,
            mode: finalMode,
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

// --- MASTER DOCUMENTS ---
// Note: Mounted at /api directly
router.get('/master-documents', async (req, res) => {
  try {
    const docs = await prisma.masterDocument.findMany({ orderBy: { name: 'asc' } });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch master documents' });
  }
});

module.exports = router;
