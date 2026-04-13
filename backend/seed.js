const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.client.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.clearanceJob.deleteMany();
  await prisma.docJob.deleteMany();
  await prisma.logisticsTrip.deleteMany();
  await prisma.licence.deleteMany();
  await prisma.freightJob.deleteMany();

  // 1. Clients
  const clientsData = [
    { 
      client_id: 'CLI-001', 
      name: 'Global Tech Traders', nickname: 'GTT', clientType: 'Importer', constitution: 'Pvt Ltd', status: 'Active', clientSinceYear: '2015',
      pan: 'ABCDE1234F', gstin: '27AABCT1234E1Z1', iec: '0388123456', cin_llpin: 'U12345MH2015PTC123456', tan: 'MUMG12345C',
      address: 'Navi Mumbai, MH', contactPerson: 'Arun Kumar', contactNickname: 'Arun', mobile: '9876543210', email: 'arun@gtt.in', contact1: '9876543210', contact2: null,
      bankName: 'HDFC Bank', branchName: 'Navi Mumbai', accountNumber: '50200012345678', accountType: 'Current', ifsc: 'HDFC0001234', swift: 'HDFCINFBB', bankAddress: 'Sector 17, Vashi', adCode: '1234567',
      details: 'Key account for electronics imports.', docs: JSON.stringify(['IEC Copy', 'GST Certificate', 'AEO T1']) 
    },
    { 
      client_id: 'CLI-002', 
      name: 'Alpha Manufacturing', nickname: 'Alpha', clientType: 'Both', constitution: 'Public Ltd', status: 'Active', clientSinceYear: '2010',
      pan: 'VWXYZ9876G', gstin: '27XYZPT9876F2Z2', iec: '0399876543', cin_llpin: 'L98765MH2010PLC987654', tan: 'PUNM98765B',
      address: 'Pune, MH', contactPerson: 'Neha Sharma', contactNickname: 'Neha', mobile: '9123456780', email: 'operations@alpha.co.in', contact1: '9123456780', contact2: '9123456781',
      bankName: 'ICICI Bank', branchName: 'Shivaji Nagar', accountNumber: '003920112233', accountType: 'Current', ifsc: 'ICIC0000039', swift: 'ICICINFBB', bankAddress: 'Shivaji Nagar, Pune', adCode: '7654321',
      details: null, docs: JSON.stringify(['IEC Copy', 'LUT 2024', 'Advance Auth']) 
    },
    { 
      client_id: 'CLI-003', 
      name: 'MedSupply Co', nickname: 'MedSupply', clientType: 'Importer', constitution: 'LLP', status: 'Inactive', clientSinceYear: '2020',
      pan: 'MEDPL5555H', gstin: '27MEDPT5555G3Z3', iec: '0377555111', cin_llpin: 'AAB-1234', tan: 'MUMM55555A',
      address: 'Andheri East, MH', contactPerson: 'Dr. Vivek', contactNickname: 'Vivek', mobile: '9988776655', email: 'vivek@medsupply.in', contact1: '9988776655', contact2: null,
      bankName: 'State Bank of India', branchName: 'Andheri', accountNumber: '30112233445', accountType: 'Current', ifsc: 'SBIN0001234', swift: 'SBININBB', bankAddress: 'MIDC Andheri', adCode: '1122334',
      details: 'Temporarily suspended due to license renewal.', docs: JSON.stringify(['IEC Copy', 'Drug License', 'GST Certificate']) 
    },
  ];
  for (const c of clientsData) await prisma.client.create({ data: c });

  // 2. Vendors
  const vendorsData = [
    { vendor_id: 'VND-001', name: 'FastTrack Logistics', type: 'Trucking', contact: 'Ramesh Singh', phone: '+91 98765 43210', email: 'ops@fasttrack.in', activeJobs: JSON.stringify(['IMP-8802', 'EXP-9921']), pastJobs: JSON.stringify(['IMP-8790', 'EXP-9905', 'EXP-9888']) },
    { vendor_id: 'VND-002', name: 'Oceanic Freight', type: 'Freight', contact: 'Sarah Miller', phone: '+1 415 555 0198', email: 'smiller@oceanic.com', activeJobs: JSON.stringify(['IMP-8805']), pastJobs: JSON.stringify(['IMP-8750', 'IMP-8766']) },
    { vendor_id: 'VND-003', name: 'Nhava Sheva Terminals', type: 'Terminal', contact: 'Port Ops Desk', phone: '+91 22 6677 8899', email: 'support@jnpt.gov.in', activeJobs: JSON.stringify(['IMP-8802', 'EXP-9921', 'IMP-8810']), pastJobs: JSON.stringify(['IMP-8799']) },
    { vendor_id: 'VND-004', name: 'FSSAI Regional Office', type: 'Gov', contact: 'Duty Officer', phone: '+91 22 2222 3333', email: 'helpdesk-mumbai@fssai.gov.in', activeJobs: JSON.stringify([]), pastJobs: JSON.stringify(['IMP-8711', 'IMP-8722']) },
  ];
  for (const v of vendorsData) await prisma.vendor.create({ data: v });

  // 3. Clearance Jobs
  const clearanceJobs = [
    { job_id: 'IMP-8802', client: 'Global Tech Traders', port: 'INNSA1', type: 'Sea Import', stage: 'Assessment', status: 'pending', alert: false, assigned: 'Rahul S.', date: 'Today, 10:30' },
    { job_id: 'IMP-8805', client: 'Alpha Manufacturing', port: 'INBOM4', type: 'Air Import', stage: 'Duty', status: 'pending', alert: true, assigned: 'Priya M.', date: 'Today, 09:15' },
    { job_id: 'EXP-9921', client: 'Aero Dynamics', port: 'INNSA1', type: 'Sea Export', stage: 'Exam', status: 'pending', alert: false, assigned: 'Arjun K.', date: 'Yesterday' },
    { job_id: 'IMP-8799', client: 'MedSupply Co', port: 'INDEL4', type: 'Air Import', stage: 'OOC', status: 'completed', alert: false, assigned: 'Rahul S.', date: 'Yesterday' },
    { job_id: 'IMP-8810', client: 'Retail Group Inc', port: 'INNSA1', type: 'Sea Import', stage: 'Filing', status: 'pending', alert: true, assigned: 'Sneha P.', date: 'Today, 11:45' }
  ];
  for (const c of clearanceJobs) await prisma.clearanceJob.create({ data: c });

  // 4. Doc Jobs
  const docJobs = [
    { job_id: 'IMP-8802', client: 'Global Tech Traders', status: 'review', type: 'Sea Import', docs: JSON.stringify([
      { name: 'Commercial Invoice', status: 'verified', type: 'pdf' },
      { name: 'Packing List', status: 'verified', type: 'pdf' },
      { name: 'Bill of Lading', status: 'pending', type: 'pdf' },
      { name: 'Certificate of Origin', status: 'missing', type: 'doc' },
    ])},
    { job_id: 'EXP-9921', client: 'Aero Dynamics', status: 'missing', type: 'Air Export', docs: JSON.stringify([
      { name: 'Commercial Invoice', status: 'verified', type: 'pdf' },
      { name: 'Airway Bill', status: 'missing', type: 'pdf' },
    ])},
    { job_id: 'IMP-8799', client: 'MedSupply Co', status: 'complete', type: 'Air Import', docs: JSON.stringify([
      { name: 'Commercial Invoice', status: 'verified', type: 'pdf' },
      { name: 'Packing List', status: 'verified', type: 'pdf' },
      { name: 'Airway Bill', status: 'verified', type: 'pdf' },
    ])},
  ];
  for (const d of docJobs) await prisma.docJob.create({ data: d });

  // 5. Logistics
  const logisticsTrips = [
    { trip_id: 'TRP-101', job: 'IMP-8802', truck: 'MH-04-AB-1234', driver: 'Rajesh K.', from: 'Nhava Sheva', to: 'Bhiwandi WH', status: 'dispatch', eta: 'Today 16:00', delayed: false },
    { trip_id: 'TRP-102', job: 'EXP-9921', truck: 'MH-43-CD-9876', driver: 'Sunil M.', from: 'Pune Factory', to: 'Nhava Sheva', status: 'enroute', eta: 'Delayed (+2h)', delayed: true },
    { trip_id: 'TRP-103', job: 'IMP-8805', truck: 'MH-01-XY-5544', driver: 'Vikram S.', from: 'Mumbai Air Cargo', to: 'Andheri East', status: 'enroute', eta: 'Today 14:30', delayed: false },
    { trip_id: 'TRP-104', job: 'IMP-8799', truck: 'MH-02-ZZ-1111', driver: 'Amit R.', from: 'Mumbai Air Cargo', to: 'Kurla', status: 'arrived', eta: 'Arrived 11:00', delayed: false },
    { trip_id: 'TRP-105', job: 'EXP-9925', truck: 'Pending Allocation', driver: 'TBD', from: 'Thane WH', to: 'Nhava Sheva', status: 'dispatch', eta: 'TBD', delayed: false },
  ];
  for (const l of logisticsTrips) await prisma.logisticsTrip.create({ data: l });

  // 6. Licences
  const licencesData = [
    { licence_id: 'EPCG-2023-45', client: 'Alpha Manufacturing', type: 'EPCG', status: 'Active', expiry: '2027-10-15', utilized: 45, alert: false },
    { licence_id: 'AA-2024-12', client: 'Global Tech Traders', type: 'Advance Auth.', status: 'Expiring', expiry: '2024-05-20', utilized: 92, alert: true },
    { licence_id: 'AEO-T1-889', client: 'MedSupply Co', type: 'AEO T1', status: 'Active', expiry: '2026-01-10', utilized: null, alert: false },
    { licence_id: 'FSSAI-0992', client: 'Retail Group Inc', type: 'FSSAI', status: 'Pending renewal', expiry: '2024-04-30', utilized: null, alert: true },
    { licence_id: 'DGFT-IEC-55', client: 'Aero Dynamics', type: 'IEC Modification', status: 'Processing', expiry: 'N/A', utilized: null, alert: false },
  ];
  for (const l of licencesData) await prisma.licence.create({ data: l });

  // 7. Freight
  const freightJobs = [
    { job_id: 'FRT-9001', mbl: 'MBL4559821', awb: null, type: 'Sea Import', pol: 'Shanghai, CNSHA', pod: 'Nhava Sheva, INNSA', vessel: 'MSC EMANUELA v.203E', etd: '15-Apr-2024', eta: '04-May-2024', status: 'In Transit', alert: false },
    { job_id: 'FRT-9002', mbl: 'MBL9912234', awb: null, type: 'Sea Export', pol: 'Nhava Sheva, INNSA', pod: 'Jebel Ali, AEJEA', vessel: 'X-PRESS MAKALU v.199W', etd: '01-May-2024', eta: '08-May-2024', status: 'Origin', alert: false },
    { job_id: 'FRT-9003', mbl: null, awb: '125-99882233', type: 'Air Import', pol: 'Frankfurt, FRA', pod: 'Mumbai, BOM', vessel: 'LH 8380', etd: '05-May-2024', eta: '06-May-2024', status: 'Delayed', alert: true },
    { job_id: 'FRT-9004', mbl: 'MBL2233445', awb: null, type: 'Sea Import', pol: 'Singapore, SGSIN', pod: 'Chennai, INMAA', vessel: 'WAN HAI 510 v.155S', etd: '20-Apr-2024', eta: '26-Apr-2024', status: 'Arrived', alert: false },
  ];
  for (const f of freightJobs) await prisma.freightJob.create({ data: f });

  console.log('Database successfully seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
