const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in dependency order
  await prisma.freightJob.deleteMany();
  await prisma.licence.deleteMany();
  await prisma.logisticsTrip.deleteMany();
  await prisma.docJob.deleteMany();
  await prisma.clearanceJob.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.client.deleteMany();

  console.log('✅ Cleared existing records');

  // ─────────────────────────────────────────────
  // 1. CLIENTS
  // ─────────────────────────────────────────────
  const clientsData = [
    {
      client_id: 'CLI-001',
      name: 'Global Tech Traders Pvt Ltd', nickname: 'GTT',
      clientType: 'Importer', constitution: 'Pvt Ltd', status: 'Active', clientSinceYear: '2015',
      pan: 'ABCGT1234F', gstin: '27AABCT1234E1Z1', iec: '0388123456',
      cin_llpin: 'U12345MH2015PTC123456', tan: 'MUMG12345C',
      address: 'Plot 14, Millennium Business Park, Sector 10, Mahape, Navi Mumbai, MH 400710',
      contactPerson: 'Arun Kumar', contactNickname: 'Arun',
      mobile: '9876543210', email: 'arun.kumar@gtt.in',
      contact1: '9876543210', contact2: '02227620011',
      bankName: 'HDFC Bank', branchName: 'Vashi Branch',
      accountNumber: '50200012345678', accountType: 'Current',
      ifsc: 'HDFC0001234', swift: 'HDFCINFBBXXX',
      bankAddress: 'Ground Floor, Sai Chambers, Sector 17, Vashi, Navi Mumbai 400703',
      adCode: '1234567',
      details: 'Premium account. Key importer of consumer electronics & semiconductors. AEO T1 certified.',
      docs: JSON.stringify(['IEC Copy', 'GST Certificate', 'AEO T1 Certificate', 'Bank AD Code Letter'])
    },
    {
      client_id: 'CLI-002',
      name: 'Alpha Manufacturing Ltd', nickname: 'Alpha',
      clientType: 'Both', constitution: 'Public Ltd', status: 'Active', clientSinceYear: '2010',
      pan: 'VWXAL9876G', gstin: '27XYZPT9876F2Z2', iec: '0399876543',
      cin_llpin: 'L98765MH2010PLC987654', tan: 'PUNM98765B',
      address: 'Survey No. 45/2, Chakan Industrial Area, Phase II, Chakan, Pune, MH 410501',
      contactPerson: 'Neha Sharma', contactNickname: 'Neha',
      mobile: '9123456780', email: 'neha.sharma@alphamfg.co.in',
      contact1: '9123456780', contact2: '02135672200',
      bankName: 'ICICI Bank', branchName: 'Shivaji Nagar, Pune',
      accountNumber: '003920112233', accountType: 'Current',
      ifsc: 'ICIC0000039', swift: 'ICICINFBBXXX',
      bankAddress: '157, Shivaji Nagar, Pune 411005',
      adCode: '7654321',
      details: 'Auto-component manufacturer. Exports to Germany & USA. Holds active EPCG and Advance Authorization.',
      docs: JSON.stringify(['IEC Copy', 'LUT 2024-25', 'EPCG Licence', 'Advance Authorization', 'GST Certificate'])
    },
    {
      client_id: 'CLI-003',
      name: 'MedSupply Co LLP', nickname: 'MedSupply',
      clientType: 'Importer', constitution: 'LLP', status: 'Inactive', clientSinceYear: '2020',
      pan: 'MEDPL5555H', gstin: '27MEDPT5555G3Z3', iec: '0377555111',
      cin_llpin: 'AAB-1234', tan: 'MUMM55555A',
      address: 'Unit 8, Andheri Industrial Estate, MIDC, Andheri East, Mumbai, MH 400093',
      contactPerson: 'Dr. Vivek Nair', contactNickname: 'Vivek',
      mobile: '9988776655', email: 'vivek.nair@medsupply.in',
      contact1: '9988776655', contact2: null,
      bankName: 'State Bank of India', branchName: 'Andheri East Branch',
      accountNumber: '30112233445566', accountType: 'Current',
      ifsc: 'SBIN0001234', swift: 'SBININBBXXX',
      bankAddress: 'MIDC Service Centre, MIDC Andheri, Mumbai 400093',
      adCode: '1122334',
      details: 'Medical device importer. Account temporarily inactive pending CDSCO import licence renewal.',
      docs: JSON.stringify(['IEC Copy', 'CDSCO Import Licence', 'Drug License', 'GST Certificate'])
    },
    {
      client_id: 'CLI-004',
      name: 'Aero Dynamics Exports', nickname: 'AeroDyn',
      clientType: 'Exporter', constitution: 'Pvt Ltd', status: 'Active', clientSinceYear: '2018',
      pan: 'AEROQ3311K', gstin: '29AADCA3311K1ZX', iec: '0512345678',
      cin_llpin: 'U35300KA2018PTC123456', tan: 'BLRA33110A',
      address: '88, Electronics City Phase 1, Hosur Road, Bengaluru, KA 560100',
      contactPerson: 'Priya Menon', contactNickname: 'Priya',
      mobile: '9900112233', email: 'priya.menon@aerodyn.in',
      contact1: '9900112233', contact2: '08066991100',
      bankName: 'Axis Bank', branchName: 'Electronics City',
      accountNumber: '918010054321001', accountType: 'Current',
      ifsc: 'UTIB0001881', swift: 'AXISINBBXXX',
      bankAddress: 'Ground Floor, Infosys Campus Road, Electronics City, Bengaluru 560100',
      adCode: '5544332',
      details: 'Aerospace component exporter to EU & US markets. LUT holder. Priority clearance tracking required.',
      docs: JSON.stringify(['IEC Copy', 'LUT 2024-25', 'GST Certificate', 'DGCA Approval'])
    },
    {
      client_id: 'CLI-005',
      name: 'Retail Group Inc', nickname: 'RGI',
      clientType: 'Importer', constitution: 'Public Ltd', status: 'Active', clientSinceYear: '2012',
      pan: 'RETGR4422M', gstin: '27AABCR4422M1Z5', iec: '0344221199',
      cin_llpin: 'L51909MH2012PLC223344', tan: 'MUMR44220B',
      address: 'Godrej BKC, Plot C-68, G Block, Bandra Kurla Complex, Mumbai, MH 400051',
      contactPerson: 'Sanjay Mehta', contactNickname: 'Sanjay',
      mobile: '9821991234', email: 'sanjay.mehta@rgi.com',
      contact1: '9821991234', contact2: '02261550000',
      bankName: 'Kotak Mahindra Bank', branchName: 'BKC Branch',
      accountNumber: '9912345678901', accountType: 'Current',
      ifsc: 'KKBK0000553', swift: 'KKBKINBBCPC',
      bankAddress: 'Ground Floor, Platina, Plot C-59, BKC, Mumbai 400051',
      adCode: '9988776',
      details: 'Large-format retail importer. FSSAI import licence holder. Primary importer for food & FMCG.',
      docs: JSON.stringify(['IEC Copy', 'FSSAI Import Licence', 'GST Certificate', 'FSSAI State Lic.'])
    },
  ];
  for (const c of clientsData) await prisma.client.create({ data: c });
  console.log(`✅ Seeded ${clientsData.length} clients`);

  // ─────────────────────────────────────────────
  // 2. VENDORS
  // ─────────────────────────────────────────────
  const vendorsData = [
    {
      vendor_id: 'VND-001', name: 'FastTrack Logistics Pvt Ltd', type: 'Trucking',
      contact: 'Ramesh Singh', phone: '+91 98765 43210', email: 'ops@fasttrack.in',
      activeJobs: JSON.stringify(['IMP-8802', 'EXP-9921', 'IMP-8810']),
      pastJobs: JSON.stringify(['IMP-8790', 'EXP-9905', 'EXP-9888', 'IMP-8799', 'IMP-8750'])
    },
    {
      vendor_id: 'VND-002', name: 'Oceanic Freight Solutions', type: 'Freight',
      contact: 'Sarah Miller', phone: '+65 6225 0198', email: 'smiller@oceanic.com',
      activeJobs: JSON.stringify(['IMP-8805', 'FRT-9001', 'FRT-9004']),
      pastJobs: JSON.stringify(['IMP-8750', 'IMP-8766', 'FRT-8900', 'FRT-8901'])
    },
    {
      vendor_id: 'VND-003', name: 'Nhava Sheva Port & Terminal', type: 'Terminal',
      contact: 'Port Operations Desk', phone: '+91 22 6677 8899', email: 'support@jnpt.gov.in',
      activeJobs: JSON.stringify(['IMP-8802', 'EXP-9921', 'IMP-8810', 'IMP-8805']),
      pastJobs: JSON.stringify(['IMP-8799', 'IMP-8790', 'EXP-9888'])
    },
    {
      vendor_id: 'VND-004', name: 'FSSAI Regional Office Mumbai', type: 'Gov',
      contact: 'Duty Officer', phone: '+91 22 2222 3333', email: 'helpdesk-mumbai@fssai.gov.in',
      activeJobs: JSON.stringify(['IMP-8810']),
      pastJobs: JSON.stringify(['IMP-8711', 'IMP-8722', 'IMP-8744'])
    },
    {
      vendor_id: 'VND-005', name: 'SkyAir Cargo Handlers', type: 'Freight',
      contact: 'James Pereira', phone: '+91 98200 56789', email: 'james@skyair.in',
      activeJobs: JSON.stringify(['IMP-8805', 'EXP-9930', 'FRT-9003']),
      pastJobs: JSON.stringify(['IMP-8760', 'EXP-9911', 'EXP-9890'])
    },
    {
      vendor_id: 'VND-006', name: 'Inland Container Depot - Pune', type: 'Terminal',
      contact: 'Mr. Patil', phone: '+91 020 2712 4455', email: 'icdpune@inbox.in',
      activeJobs: JSON.stringify(['EXP-9921']),
      pastJobs: JSON.stringify(['EXP-9888', 'EXP-9870', 'EXP-9855'])
    },
    {
      vendor_id: 'VND-007', name: 'Customs & Excise Brokers Ltd', type: 'Gov',
      contact: 'CA Anand Iyer', phone: '+91 22 4455 6677', email: 'anand@cebl.co.in',
      activeJobs: JSON.stringify(['IMP-8802', 'IMP-8799']),
      pastJobs: JSON.stringify(['IMP-8711', 'IMP-8750', 'IMP-8766', 'EXP-9905'])
    },
  ];
  for (const v of vendorsData) await prisma.vendor.create({ data: v });
  console.log(`✅ Seeded ${vendorsData.length} vendors`);

  // ─────────────────────────────────────────────
  // 3. CLEARANCE JOBS
  //    client names must match seeded clients above
  // ─────────────────────────────────────────────
  const clearanceJobs = [
    { job_id: 'IMP-8802', client: 'Global Tech Traders Pvt Ltd', port: 'INNSA1', type: 'Sea Import',   stage: 'Assessment', status: 'pending',   alert: false, assigned: 'Rahul S.',  date: 'Today, 10:30' },
    { job_id: 'IMP-8805', client: 'Alpha Manufacturing Ltd',      port: 'INBOM4', type: 'Air Import',   stage: 'Duty',       status: 'pending',   alert: true,  assigned: 'Priya M.',  date: 'Today, 09:15' },
    { job_id: 'EXP-9921', client: 'Aero Dynamics Exports',        port: 'INNSA1', type: 'Sea Export',   stage: 'Exam',       status: 'pending',   alert: false, assigned: 'Arjun K.', date: 'Yesterday' },
    { job_id: 'IMP-8799', client: 'MedSupply Co LLP',             port: 'INDEL4', type: 'Air Import',   stage: 'OOC',        status: 'completed', alert: false, assigned: 'Rahul S.',  date: 'Yesterday' },
    { job_id: 'IMP-8810', client: 'Retail Group Inc',             port: 'INNSA1', type: 'Sea Import',   stage: 'Filing',     status: 'pending',   alert: true,  assigned: 'Sneha P.', date: 'Today, 11:45' },
    { job_id: 'EXP-9930', client: 'Aero Dynamics Exports',        port: 'INBLR4', type: 'Air Export',   stage: 'Filing',     status: 'pending',   alert: false, assigned: 'Arjun K.', date: 'Today, 08:00' },
    { job_id: 'IMP-8815', client: 'Global Tech Traders Pvt Ltd',  port: 'INMAA1', type: 'Sea Import',   stage: 'Filing',     status: 'pending',   alert: false, assigned: 'Sneha P.', date: 'Today, 13:00' },
    { job_id: 'EXP-9940', client: 'Alpha Manufacturing Ltd',      port: 'INNSA1', type: 'Sea Export',   stage: 'Assessment', status: 'pending',   alert: false, assigned: 'Priya M.',  date: '2 days ago' },
    { job_id: 'IMP-8820', client: 'Retail Group Inc',             port: 'INBOM4', type: 'Air Import',   stage: 'OOC',        status: 'completed', alert: false, assigned: 'Rahul S.',  date: '2 days ago' },
  ];
  for (const c of clearanceJobs) await prisma.clearanceJob.create({ data: c });
  console.log(`✅ Seeded ${clearanceJobs.length} clearance jobs`);

  // ─────────────────────────────────────────────
  // 4. DOC JOBS  (job_id matches clearance jobs)
  // ─────────────────────────────────────────────
  const docJobs = [
    {
      job_id: 'IMP-8802', client: 'Global Tech Traders Pvt Ltd', status: 'review', type: 'Sea Import',
      docs: JSON.stringify([
        { name: 'Commercial Invoice',   status: 'verified', type: 'pdf' },
        { name: 'Packing List',         status: 'verified', type: 'pdf' },
        { name: 'Bill of Lading',       status: 'pending',  type: 'pdf' },
        { name: 'Certificate of Origin',status: 'missing',  type: 'doc' },
        { name: 'Inspection Certificate',status: 'missing', type: 'pdf' },
      ])
    },
    {
      job_id: 'IMP-8805', client: 'Alpha Manufacturing Ltd', status: 'review', type: 'Air Import',
      docs: JSON.stringify([
        { name: 'Commercial Invoice', status: 'verified', type: 'pdf' },
        { name: 'Airway Bill',        status: 'verified', type: 'pdf' },
        { name: 'Packing List',       status: 'verified', type: 'pdf' },
        { name: 'Bill of Entry',      status: 'pending',  type: 'pdf' },
      ])
    },
    {
      job_id: 'EXP-9921', client: 'Aero Dynamics Exports', status: 'missing', type: 'Sea Export',
      docs: JSON.stringify([
        { name: 'Commercial Invoice',    status: 'verified', type: 'pdf' },
        { name: 'Packing List',          status: 'verified', type: 'pdf' },
        { name: 'Shipping Bill',         status: 'pending',  type: 'pdf' },
        { name: 'Airway Bill',           status: 'missing',  type: 'pdf' },
        { name: 'Export Licence (DGFT)', status: 'missing',  type: 'doc' },
      ])
    },
    {
      job_id: 'IMP-8799', client: 'MedSupply Co LLP', status: 'complete', type: 'Air Import',
      docs: JSON.stringify([
        { name: 'Commercial Invoice',     status: 'verified', type: 'pdf' },
        { name: 'Packing List',           status: 'verified', type: 'pdf' },
        { name: 'Airway Bill',            status: 'verified', type: 'pdf' },
        { name: 'CDSCO Import Permit',    status: 'verified', type: 'pdf' },
        { name: 'Bill of Entry (OOC)',     status: 'verified', type: 'pdf' },
      ])
    },
    {
      job_id: 'IMP-8810', client: 'Retail Group Inc', status: 'review', type: 'Sea Import',
      docs: JSON.stringify([
        { name: 'Commercial Invoice', status: 'verified', type: 'pdf' },
        { name: 'Packing List',       status: 'pending',  type: 'pdf' },
        { name: 'Bill of Lading',     status: 'missing',  type: 'pdf' },
        { name: 'FSSAI NOC',          status: 'missing',  type: 'doc' },
        { name: 'Phytosanitary Cert', status: 'missing',  type: 'pdf' },
      ])
    },
    {
      job_id: 'EXP-9930', client: 'Aero Dynamics Exports', status: 'review', type: 'Air Export',
      docs: JSON.stringify([
        { name: 'Commercial Invoice', status: 'verified', type: 'pdf' },
        { name: 'Airway Bill',        status: 'pending',  type: 'pdf' },
        { name: 'Shipping Bill',      status: 'pending',  type: 'pdf' },
      ])
    },
  ];
  for (const d of docJobs) await prisma.docJob.create({ data: d });
  console.log(`✅ Seeded ${docJobs.length} doc jobs`);

  // ─────────────────────────────────────────────
  // 5. LOGISTICS TRIPS  (job references clearance job_ids)
  // ─────────────────────────────────────────────
  const logisticsTrips = [
    { trip_id: 'TRP-101', job: 'IMP-8802', truck: 'MH-04-AB-1234', driver: 'Rajesh Kumar',   from: 'Nhava Sheva CFS',     to: 'Bhiwandi Warehouse',  status: 'dispatch', eta: 'Today 16:00',      delayed: false },
    { trip_id: 'TRP-102', job: 'EXP-9921', truck: 'MH-43-CD-9876', driver: 'Sunil Mhatre',   from: 'Chakan Factory',      to: 'Nhava Sheva Gate 5',  status: 'enroute',  eta: 'Delayed (+2h)',     delayed: true  },
    { trip_id: 'TRP-103', job: 'IMP-8805', truck: 'MH-01-XY-5544', driver: 'Vikram Shinde',  from: 'Mumbai Air Cargo (T)',to: 'Andheri East WH',     status: 'enroute',  eta: 'Today 14:30',      delayed: false },
    { trip_id: 'TRP-104', job: 'IMP-8799', truck: 'MH-02-ZZ-1111', driver: 'Amit Raut',      from: 'Mumbai Air Cargo (T)',to: 'Kurla Medical WH',    status: 'arrived',  eta: 'Arrived 11:00',    delayed: false },
    { trip_id: 'TRP-105', job: 'EXP-9930', truck: 'Pending Allocation', driver: 'TBD',        from: 'Electronics City BLR',to: 'BLR Air Cargo',       status: 'dispatch', eta: 'TBD',              delayed: false },
    { trip_id: 'TRP-106', job: 'IMP-8810', truck: 'MH-09-GH-3322', driver: 'Suresh Jadhav', from: 'Nhava Sheva CFS',     to: 'BKC Distribution WH', status: 'dispatch', eta: 'Tomorrow 09:00',   delayed: false },
    { trip_id: 'TRP-107', job: 'IMP-8815', truck: 'TN-07-KP-6677', driver: 'Murugan S.',    from: 'Chennai Port CFS',    to: 'GTT Chennai Hub',     status: 'enroute',  eta: 'Today 18:00',      delayed: false },
    { trip_id: 'TRP-108', job: 'IMP-8820', truck: 'MH-04-VR-8811', driver: 'Pravin More',   from: 'Mumbai Air Cargo (T)',to: 'RGI Dharavi WH',      status: 'arrived',  eta: 'Arrived 08:30',    delayed: false },
  ];
  for (const l of logisticsTrips) await prisma.logisticsTrip.create({ data: l });
  console.log(`✅ Seeded ${logisticsTrips.length} logistics trips`);

  // ─────────────────────────────────────────────
  // 6. LICENCES
  // ─────────────────────────────────────────────
  const licencesData = [
    { licence_id: 'EPCG-2023-45',  client: 'Alpha Manufacturing Ltd',      type: 'EPCG',             status: 'Active',          expiry: '2027-10-15', utilized: 45,  alert: false },
    { licence_id: 'AA-2024-12',    client: 'Global Tech Traders Pvt Ltd',  type: 'Advance Auth.',    status: 'Expiring',        expiry: '2024-05-20', utilized: 92,  alert: true  },
    { licence_id: 'AEO-T1-889',    client: 'MedSupply Co LLP',             type: 'AEO T1',           status: 'Active',          expiry: '2026-01-10', utilized: null,alert: false },
    { licence_id: 'FSSAI-0992',    client: 'Retail Group Inc',             type: 'FSSAI Import Lic.',status: 'Pending renewal', expiry: '2024-04-30', utilized: null,alert: true  },
    { licence_id: 'DGFT-IEC-55',   client: 'Aero Dynamics Exports',        type: 'IEC Modification', status: 'Processing',      expiry: 'N/A',        utilized: null,alert: false },
    { licence_id: 'LUT-GTT-2024',  client: 'Global Tech Traders Pvt Ltd',  type: 'LUT 2024-25',      status: 'Active',          expiry: '2025-03-31', utilized: 60,  alert: false },
    { licence_id: 'LUT-AER-2024',  client: 'Aero Dynamics Exports',        type: 'LUT 2024-25',      status: 'Active',          expiry: '2025-03-31', utilized: 28,  alert: false },
    { licence_id: 'EPCG-2022-18',  client: 'Alpha Manufacturing Ltd',       type: 'EPCG',             status: 'Active',          expiry: '2026-06-30', utilized: 70,  alert: false },
    { licence_id: 'AA-2023-07',    client: 'Alpha Manufacturing Ltd',       type: 'Advance Auth.',    status: 'Expiring',        expiry: '2024-06-01', utilized: 88,  alert: true  },
    { licence_id: 'AEO-T2-RGI',   client: 'Retail Group Inc',             type: 'AEO T2',           status: 'Processing',      expiry: 'N/A',        utilized: null,alert: false },
  ];
  for (const l of licencesData) await prisma.licence.create({ data: l });
  console.log(`✅ Seeded ${licencesData.length} licences`);

  // ─────────────────────────────────────────────
  // 7. FREIGHT JOBS
  // ─────────────────────────────────────────────
  const freightJobs = [
    { job_id: 'FRT-9001', mbl: 'MEDU4559821000', awb: null,          type: 'Sea Import',  pol: 'Shanghai, CNSHA',       pod: 'Nhava Sheva, INNSA', vessel: 'MSC EMANUELA v.203E',    etd: '15-Apr-2024', eta: '04-May-2024', status: 'In Transit', alert: false },
    { job_id: 'FRT-9002', mbl: 'COSU9912234011', awb: null,          type: 'Sea Export',  pol: 'Nhava Sheva, INNSA',    pod: 'Jebel Ali, AEJEA',   vessel: 'X-PRESS MAKALU v.199W',  etd: '01-May-2024', eta: '08-May-2024', status: 'Origin',     alert: false },
    { job_id: 'FRT-9003', mbl: null,             awb: '125-99882233',type: 'Air Import',  pol: 'Frankfurt, DEFRA',      pod: 'Mumbai, INBOM',      vessel: 'LH 8380',                etd: '05-May-2024', eta: '06-May-2024', status: 'Delayed',    alert: true  },
    { job_id: 'FRT-9004', mbl: 'WHLC2233445009', awb: null,          type: 'Sea Import',  pol: 'Singapore, SGSIN',      pod: 'Chennai, INMAA',     vessel: 'WAN HAI 510 v.155S',     etd: '20-Apr-2024', eta: '26-Apr-2024', status: 'Arrived',    alert: false },
    { job_id: 'FRT-9005', mbl: 'HLCUSHA240512345',awb: null,         type: 'Sea Export',  pol: 'Nhava Sheva, INNSA',    pod: 'Hamburg, DEHAM',     vessel: 'EVER GIVEN v.088E',      etd: '10-May-2024', eta: '28-May-2024', status: 'Booked',     alert: false },
    { job_id: 'FRT-9006', mbl: null,             awb: '098-11223344',type: 'Air Export',  pol: 'Bengaluru, INBLR',      pod: 'Los Angeles, USLAX', vessel: 'AI 191',                 etd: '08-May-2024', eta: '09-May-2024', status: 'In Transit', alert: false },
    { job_id: 'FRT-9007', mbl: 'ONEY7711223300', awb: null,          type: 'Sea Import',  pol: 'Rotterdam, NLRTM',      pod: 'Nhava Sheva, INNSA', vessel: 'ONE COMMITMENT v.055W', etd: '22-Apr-2024', eta: '18-May-2024', status: 'In Transit', alert: false },
    { job_id: 'FRT-9008', mbl: null,             awb: '176-88991122',type: 'Air Import',  pol: 'Tokyo Narita, JPNRT',   pod: 'Chennai, INMAA',     vessel: 'NH 827',                 etd: '07-May-2024', eta: '08-May-2024', status: 'Arrived',    alert: false },
  ];
  for (const f of freightJobs) await prisma.freightJob.create({ data: f });
  console.log(`✅ Seeded ${freightJobs.length} freight jobs`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('────────────────────────────────────');
  console.log(`   Clients     : ${clientsData.length}`);
  console.log(`   Vendors     : ${vendorsData.length}`);
  console.log(`   Clearance   : ${clearanceJobs.length}`);
  console.log(`   Doc Jobs    : ${docJobs.length}`);
  console.log(`   Logistics   : ${logisticsTrips.length}`);
  console.log(`   Licences    : ${licencesData.length}`);
  console.log(`   Freight     : ${freightJobs.length}`);
  console.log('────────────────────────────────────');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
