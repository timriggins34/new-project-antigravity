const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const masterDocuments = [
  { name: "Purchase Order", abbreviation: "PO", type: "SHIPMENT" },
  { name: "Draft Bill Of Lading", abbreviation: "DBL", type: "SHIPMENT" },
  { name: "Bill Of Lading/Master Bill Of Lading", abbreviation: "BL/MBL", type: "SHIPMENT" },
  { name: "House Bill Of Lading", abbreviation: "HBL", type: "SHIPMENT" },
  { name: "Checklist Shipping Bill", abbreviation: "CSB", type: "SHIPMENT" },
  { name: "Shipping Bill", abbreviation: "SB", type: "SHIPMENT" },
  { name: "Draft Airway Bill", abbreviation: "DAWB", type: "SHIPMENT" },
  { name: "Airway Bill", abbreviation: "AWB", type: "SHIPMENT" },
  { name: "Proforma Invoice", abbreviation: "PI", type: "SHIPMENT" },
  { name: "Commercial Invoice", abbreviation: "CI", type: "SHIPMENT" },
  { name: "Packing List", abbreviation: "PL", type: "SHIPMENT" },
  { name: "Bill Of Entry/Bill Of Entry (Assessed Copy)", abbreviation: "BOE/BOEA", type: "SHIPMENT" },
  { name: "Bill Of Entry (Gatepass)", abbreviation: "BOEG", type: "SHIPMENT" },
  { name: "Bill Of Entry (Out Of Charge)", abbreviation: "BOEOOC", type: "SHIPMENT" },
  { name: "Delivery Order", abbreviation: "DO", type: "SHIPMENT" },
  { name: "Let Export Order", abbreviation: "LEO", type: "SHIPMENT" },
  { name: "Export General Manifest", abbreviation: "EGM", type: "SHIPMENT" },
  { name: "Import General Manifest", abbreviation: "IGM", type: "SHIPMENT" },
  { name: "Air Import General Manifest", abbreviation: "AIGM", type: "SHIPMENT" },
  { name: "Freight Certificate", abbreviation: "FC", type: "SHIPMENT" },
  { name: "E-Way Bill", abbreviation: "EWB", type: "SHIPMENT" },
  { name: "Lorry Receipt", abbreviation: "LR", type: "SHIPMENT" },
  { name: "Gate Pass", abbreviation: "GP", type: "SHIPMENT" },
  { name: "Empty Offload Receipt", abbreviation: "EOR", type: "SHIPMENT" },
  { name: "Final CHA Invoice", abbreviation: "INV", type: "SHIPMENT" },
  { name: "Export Invoice", abbreviation: "EXINV", type: "SHIPMENT" },
  { name: "Gate-in Receipt", abbreviation: "GATEIN", type: "SHIPMENT" },
  { name: "Terminal Handover Doc", abbreviation: "HANDOVER", type: "SHIPMENT" },
  { name: "Form 13", abbreviation: "F13", type: "SHIPMENT" },
  { name: "Certificate of Insurance/Insurance Certificate", abbreviation: "COI", type: "SHIPMENT" },
  { name: "Certificate of Analysis", abbreviation: "COA", type: "SHIPMENT" },
  { name: "Certificate Of Origin", abbreviation: "COO", type: "SHIPMENT" },
  { name: "CHA Authorization Letter", abbreviation: "AUTH", type: "RECURRING" },
  { name: "Import Export Code (IEC)", abbreviation: "IEC", type: "SHIPMENT" },
  { name: "Authorized Dealer (AD) Code Registration", abbreviation: "ADCODE", type: "SHIPMENT" },
  { name: "GST Registration (GSTIN)", abbreviation: "GSTIN", type: "SHIPMENT" },
  { name: "MSME/Udyam Registration Number", abbreviation: "UDYAM", type: "SHIPMENT" },
  { name: "AEO Status", abbreviation: "AEO", type: "RECURRING" },
  { name: "LUT/Bond", abbreviation: "LUT", type: "RECURRING" },
  { name: "Label Undertaking", abbreviation: "LU", type: "SHIPMENT" },
  { name: "Food Grade Certificate", abbreviation: "FGC", type: "RECURRING" },
  { name: "FSSAI Licence", abbreviation: "FSSAI", type: "SHIPMENT" },
  { name: "Fumigation Certificate", abbreviation: "FUM", type: "SHIPMENT" },
  { name: "Plant Quarantine No Objection Certificate", abbreviation: "PQNOC", type: "SHIPMENT" },
  { name: "Phytosanitary Certificate", abbreviation: "PHY", type: "RECURRING" },
  { name: "Export Oriented Unit", abbreviation: "EOU", type: "RECURRING" },
  { name: "Export Promotion Capital Goods Authorization", abbreviation: "EPCG", type: "RECURRING" },
  { name: "Advance Authorization", abbreviation: "ADV", type: "RECURRING" },
  { name: "Registration Cum Membership Certificate", abbreviation: "RCMC", type: "RECURRING" },
  { name: "APEDA Registration", abbreviation: "APEDA", type: "RECURRING" },
  { name: "Self-Sealing Permission", abbreviation: "SELF", type: "RECURRING" },
  { name: "Factory Stuffing Permission", abbreviation: "STUFF", type: "SHIPMENT" },
  { name: "Electronic Bank Realization Certificate", abbreviation: "EBRC", type: "SHIPMENT" },
  { name: "FEMA Declarations", abbreviation: "EDF/SDF", type: "SHIPMENT" },
  { name: "Letter of Credit", abbreviation: "LC", type: "SHIPMENT" },
  { name: "Verified Gross Mass Certificate", abbreviation: "VGM", type: "SHIPMENT" },
  { name: "Cargo Arrival Notice", abbreviation: "CAN", type: "SHIPMENT" },
  { name: "Material Safety Data Sheet", abbreviation: "MSDS/SDS", type: "SHIPMENT" },
  { name: "Non-Dangerous Goods Declaration", abbreviation: "NONDG", type: "SHIPMENT" },
  { name: "Bureau of Indian Standards Certificate", abbreviation: "BIS", type: "RECURRING" },
  { name: "EPR Certificate", abbreviation: "EPR", type: "RECURRING" },
  { name: "LMPC", abbreviation: "LMPC", type: "RECURRING" },
  { name: "WPC ETA", abbreviation: "WPC", type: "SHIPMENT" },
  { name: "DCGI NOC", abbreviation: "DCGI", type: "SHIPMENT" },
  { name: "Pre-Shipment Inspection Certificate", abbreviation: "PSIC", type: "SHIPMENT" },
  { name: "Animal Quarantine NOC", abbreviation: "AQNOC", type: "SHIPMENT" },
  { name: "Sanitary Certificate", abbreviation: "SANI", type: "SHIPMENT" },
  { name: "AERB NOC", abbreviation: "AERB", type: "SHIPMENT" },
  { name: "WCCB NOC", abbreviation: "WCCB", type: "SHIPMENT" },
  { name: "Textile Committee Certificate", abbreviation: "TCC", type: "SHIPMENT" },
  { name: "Certificate of Free Sale", abbreviation: "FRSLC", type: "SHIPMENT" },
  { name: "Kimberley Process Certificate", abbreviation: "KPC", type: "SHIPMENT" },
  { name: "Halal / Kosher Certificate", abbreviation: "HAL", type: "RECURRING" },
  { name: "RoDTEP / RoSCTL Scrips", abbreviation: "RODTEP", type: "SHIPMENT" },
  { name: "Consular Invoice", abbreviation: "CON", type: "SHIPMENT" },
  { name: "GSP Certificate", abbreviation: "GSP", type: "SHIPMENT" }
];

async function main() {
  console.log('🌱 Starting Master Document database seed...');
  
  try {
    // Insert all documents, ignoring duplicates if any exist
    const result = await prisma.masterDocument.createMany({
      data: masterDocuments,
      skipDuplicates: true,
    });
    
    console.log(`✅ Successfully inserted ${result.count} documents!`);
    console.log('🚀 Your document library is fully restored. You can safely delete this script or keep it as a backup.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });