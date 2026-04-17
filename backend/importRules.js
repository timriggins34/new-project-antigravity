const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'rules_matrix.csv');
  const results = [];
  let headers = [];

  console.log('--- Rules Import Debugger ---');
  console.log(`Target Path: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`CRITICAL: File not found at ${filePath}`);
    process.exit(1);
  }

  console.log('Reading file stream...');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headerList) => {
      headers = headerList;
      console.log('Detected CSV Headers:', headers);
    })
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Parsed ${results.length} rows from CSV.`);
      
      if (results.length === 0) {
        console.warn('WARNING: No rows were parsed from the CSV. Please check the file encoding or content.');
        return;
      }

      console.log('Starting DB sync with aggressive logging...');
      
      try {
        let successCount = 0;
        let skippedCount = 0;

        for (const row of results) {
          // Use the EXACT headers provided by user in the latest request
          const docName = row['Document Name']?.trim();
          const abbr = row['Abbreviation']?.trim();
          let typeStr = row['Type']?.trim().toUpperCase();

          if (!docName) {
            console.log(`[SKIP] Row missing 'Document Name'. Headers detected were:`, headers);
            skippedCount++;
            continue;
          }

          console.log(`[PROCESS] Found Document: "${docName}"`);

          // Map Type to Enum (SHIPMENT, ONE_TIME, RECURRING, CONTAINER)
          const validTypes = ['SHIPMENT', 'ONE_TIME', 'RECURRING', 'CONTAINER'];
          if (!validTypes.includes(typeStr)) {
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

          // 2. Clear existing rules for this document for idempotency
          await prisma.documentRule.deleteMany({
            where: { masterDocumentId: masterDoc.id }
          });

          const rulesToCreate = [];

          const checkMandatory = (val) => {
            if (!val) return null;
            const normalized = val.trim().toLowerCase();
            // 'M' for Mandatory, 'O' for Optional
            if (normalized === 'mandatory' || normalized === 'm') return { isMandatory: true };
            if (normalized === 'optional' || normalized === 'o') return { isMandatory: false };
            return null;
          };

          // Define combinations based on NEW exact CSV headers
          const combinations = [
            { col: 'Sea Import', direction: 'Import', mode: 'Sea', stageCol: 'Import Stage' },
            { col: 'Air Import', direction: 'Import', mode: 'Air', stageCol: 'Import Stage' },
            { col: 'Sea Export', direction: 'Export', mode: 'Sea', stageCol: 'Export Stage' },
            { col: 'Air Export', direction: 'Export', mode: 'Air', stageCol: 'Export Stage' },
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
            console.log(`   + Created ${rulesToCreate.length} rules for "${docName}"`);
            successCount++;
          } else {
            console.log(`   ! No rules matched for "${docName}" (all direction columns were empty)`);
          }
        }

        console.log('\n--- Final Summary ---');
        console.log(`Successfully processed: ${successCount} documents`);
        console.log(`Skipped rows: ${skippedCount}`);
        console.log('----------------------');

      } catch (error) {
        console.error('CRITICAL DATABASE ERROR during sync:', error);
      } finally {
        await prisma.$disconnect();
        console.log('Database disconnected.');
      }
    });
}

main().catch(err => {
  console.error('FATAL SCRIPT ERROR:', err);
  process.exit(1);
});
