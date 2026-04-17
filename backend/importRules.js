const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Use path relative to the script location
  const filePath = path.join(__dirname, 'rules_matrix.csv');
  const results = [];

  console.log(`Reading CSV from ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Parsed ${results.length} rows. Starting database sync...`);
      
      try {
        for (const row of results) {
          const docName = row['Name']?.trim();
          const abbr = row['Abbreviation']?.trim();
          let typeStr = row['Type']?.trim().toUpperCase();

          if (!docName) continue;

          // Map Type to Enum (SHIPMENT, ONE_TIME, RECURRING, CONTAINER)
          const validTypes = ['SHIPMENT', 'ONE_TIME', 'RECURRING', 'CONTAINER'];
          if (!validTypes.includes(typeStr)) {
            // Default to SHIPMENT if type is unknown or missing
            typeStr = 'SHIPMENT';
          }

          // 1. Upsert MasterDocument
          const masterDoc = await prisma.masterDocument.upsert({
            where: { name: docName },
            update: { 
              abbreviation: abbr || '', 
              type: typeStr 
            },
            create: { 
              name: docName, 
              abbreviation: abbr || '', 
              type: typeStr 
            },
          });

          // 2. Clear existing rules for this document to ensure idempotency
          await prisma.documentRule.deleteMany({
            where: { masterDocumentId: masterDoc.id }
          });

          const rulesToCreate = [];

          // Helper to check cell value based on user logic:
          // 'Mandatory' (M) -> true, 'Optional' (O) -> false, others -> skip
          const getMandatory = (val) => {
            if (!val) return null;
            const normalized = val.trim().toLowerCase();
            if (normalized === 'mandatory' || normalized === 'm') return true;
            if (normalized === 'optional' || normalized === 'o') return true; // Wait, user said "If 'O', set isMandatory = false"
            // Let me correct that
            return null;
          };

          const checkMandatory = (val) => {
            if (!val) return null;
            const normalized = val.trim().toLowerCase();
            if (normalized === 'mandatory' || normalized === 'm') return { isMandatory: true };
            if (normalized === 'optional' || normalized === 'o') return { isMandatory: false };
            return null;
          };

          // Logic for combinations
          const combinations = [
            { col: 'Sea Import', direction: 'Import', mode: 'Sea', stageCol: 'Import' },
            { col: 'Air Import', direction: 'Import', mode: 'Air', stageCol: 'Import' },
            { col: 'Sea Export', direction: 'Export', mode: 'Sea', stageCol: 'Export' },
            { col: 'Air Export', direction: 'Export', mode: 'Air', stageCol: 'Export' },
          ];

          for (const combo of combinations) {
            const cellValue = row[combo.col];
            const ruleConfig = checkMandatory(cellValue);
            
            if (ruleConfig) {
              rulesToCreate.push({
                masterDocumentId: masterDoc.id,
                direction: combo.direction,
                mode: combo.mode,
                stageRequired: row[combo.stageCol]?.trim() || null,
                isMandatory: ruleConfig.isMandatory,
              });
            }
          }

          if (rulesToCreate.length > 0) {
            await prisma.documentRule.createMany({
              data: rulesToCreate
            });
          }

          console.log(`Synced rules for document: "${docName}" (${rulesToCreate.length} rules created)`);
        }
        console.log('\n--- Rules Import Completed Successfully ---');
      } catch (error) {
        console.error('Error during database sync:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

main();
