const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed (PostgreSQL & RBAC)...');

  // Clear existing data in dependency order
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hSCodeItem.deleteMany();
  await prisma.freightJob.deleteMany();
  await prisma.licence.deleteMany();
  await prisma.logisticsTrip.deleteMany();
  await prisma.docJob.deleteMany();
  await prisma.clearanceJob.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing records');

  // Password hashing
  const saltRounds = 10;
  const commonPasswordHash = await bcrypt.hash('password123', saltRounds);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      username: 'admin',
      passwordHash: commonPasswordHash,
      role: 'ADMIN'
    }
  });

  const emp1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      username: 'john_doe',
      passwordHash: commonPasswordHash,
      role: 'EMPLOYEE'
    }
  });

  const emp2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      username: 'jane_smith',
      passwordHash: commonPasswordHash,
      role: 'EMPLOYEE'
    }
  });

  console.log('✅ Seeded Admin and Employee users');

  const adminId = adminUser.id;

  // 2. CLIENTS (with Relational Documents)
  const client1 = await prisma.client.create({
    data: {
      client_id: 'CLI-001', name: 'Global Tech Traders Pvt Ltd', nickname: 'GTT',
      clientType: 'Importer', constitution: 'Pvt Ltd', status: 'Active', clientSinceYear: '2015',
      pan: 'ABCGT1234F', gstin: '27AABCT1234E1Z1', iec: '0388123456', cin_llpin: 'U12345MH2015PTC123456', tan: 'MUMG12345C',
      address: 'Plot 14, Millennium Business Park, Sector 10, Mahape, Navi Mumbai, MH 400710',
      contactPerson: 'Arun Kumar', contactNickname: 'Arun', mobile: '9876543210', email: 'arun.kumar@gtt.in',
      contact1: '9876543210', bankName: 'HDFC Bank', branchName: 'Vashi Branch', accountNumber: '50200012345678',
      accountType: 'Current', ifsc: 'HDFC0001234', swift: 'HDFCINFBBXXX', bankAddress: 'Ground Floor, Sai Chambers, Sector 17, Vashi, Navi Mumbai 400703',
      adCode: '1234567',
      createdById: adminId,
      updatedById: adminId,
      documents: {
        create: [
          { 
            name: 'IEC Certificate', 
            url: 'https://storage.tradeflow.in/docs/iec_001.pdf',
            createdById: adminId,
            updatedById: adminId
          },
          { 
            name: 'GST Registration', 
            url: 'https://storage.tradeflow.in/docs/gst_001.pdf',
            createdById: adminId,
            updatedById: adminId
          }
        ]
      }
    }
  });

  const client2 = await prisma.client.create({
    data: {
      client_id: 'CLI-002', name: 'Alpha Manufacturing Ltd', nickname: 'Alpha',
      clientType: 'Both', constitution: 'Public Ltd', status: 'Active', clientSinceYear: '2010',
      pan: 'VWXAL9876G', gstin: '27XYZPT9876F2Z2', iec: '0399876543', cin_llpin: 'L98765MH2010PLC987654', tan: 'PUNM98765B',
      address: 'Survey No. 45/2, Chakan Industrial Area, Phase II, Chakan, Pune, MH 410501',
      contactPerson: 'Neha Sharma', contactNickname: 'Neha', mobile: '9123456780', email: 'neha.sharma@alphamfg.co.in',
      contact1: '9123456780', bankName: 'ICICI Bank', branchName: 'Shivaji Nagar, Pune', accountNumber: '003920112233',
      accountType: 'Current', ifsc: 'ICIC0000039', swift: 'ICICINFBBXXX', bankAddress: '157, Shivaji Nagar, Pune 411005',
      adCode: '7654321',
      createdById: adminId,
      updatedById: adminId,
      documents: {
        create: [
          { 
            name: 'PAN Card Copy', 
            url: 'https://storage.tradeflow.in/docs/pan_002.pdf',
            createdById: adminId,
            updatedById: adminId
          }
        ]
      }
    }
  });
  console.log('✅ Seeded clients and documents with traceability');

  // 3. VENDORS
  const vendor1 = await prisma.vendor.create({
    data: { 
      vendor_id: 'VND-001', name: 'FastTrack Logistics Pvt Ltd', type: 'Trucking', contact: 'Ramesh Singh', phone: '+91 98765 43210', email: 'ops@fasttrack.in',
      createdById: adminId, updatedById: adminId
    }
  });
  const vendor2 = await prisma.vendor.create({
    data: { 
      vendor_id: 'VND-002', name: 'Oceanic Freight Solutions', type: 'Freight', contact: 'Sarah Miller', phone: '+65 6225 0198', email: 'smiller@oceanic.com',
      createdById: adminId, updatedById: adminId
    }
  });
  console.log('✅ Seeded vendors with traceability');

  // 4. CLEARANCE JOBS (with HS Code Items & Duty Tracking)
  await prisma.clearanceJob.create({
    data: {
      job_id: 'IMP-8802', client: 'Global Tech Traders Pvt Ltd', port: 'INNSA1', type: 'Sea Import', stage: 'Assessment', status: 'pending', alert: false, assigned: 'Rahul S.', date: 'Today, 10:30',
      icegateChallan: 'CHAL-2024-9981',
      dutyAmount: 145000.50,
      penalty: 500.00,
      paymentDate: new Date('2024-04-10T11:00:00Z'),
      createdById: adminId,
      updatedById: adminId,
      hsCodeItems: {
        create: [
          { itemName: 'Central Processing Units', hsCode: '84713010', assessableValue: 500000.00, createdById: adminId, updatedById: adminId },
          { itemName: 'Graphics Storage Units', hsCode: '84717020', assessableValue: 200000.00, createdById: adminId, updatedById: adminId }
        ]
      },
      vendors: { connect: [{ id: vendor1.id }] }
    }
  });

  await prisma.clearanceJob.create({
    data: {
      job_id: 'IMP-8805', client: 'Alpha Manufacturing Ltd', port: 'INBOM4', type: 'Air Import', stage: 'OOC', status: 'completed', alert: false, assigned: 'Priya M.', date: 'Today, 14:15',
      oocTimestamp: new Date('2024-04-12T16:30:00Z'),
      createdById: adminId,
      updatedById: adminId,
      hsCodeItems: {
        create: [
          { itemName: 'Hydraulic Valves', hsCode: '84812000', assessableValue: 85000.00, createdById: adminId, updatedById: adminId }
        ]
      },
      vendors: { connect: [{ id: vendor2.id }] }
    }
  });
  console.log('✅ Seeded clearance jobs with HS Codes and duty info');

  // 5. DOC JOBS (with relational documents and checklist flags)
  await prisma.docJob.create({
    data: {
      job_id: 'IMP-8802', client: 'Global Tech Traders Pvt Ltd', status: 'review', type: 'Sea Import',
      hasHardCopyBOL: true,
      hasHardCopyDO: false,
      createdById: adminId,
      updatedById: adminId,
      documents: {
        create: [
          { name: 'Commercial Invoice', createdById: adminId, updatedById: adminId },
          { name: 'Packing List', createdById: adminId, updatedById: adminId },
          { name: 'Original Bill of Lading', createdById: adminId, updatedById: adminId }
        ]
      }
    }
  });
  console.log('✅ Seeded doc jobs with checklist flags');

  // 6. FREIGHT & LICENCES
  await prisma.freightJob.create({
    data: {
      job_id: 'FRT-9001', type: 'Sea Import', pol: 'Shanghai', pod: 'Nhava Sheva', vessel: 'MSC EMANUELA', etd: '15-Apr-24', eta: '04-May-24', status: 'In Transit', alert: false,
      createdById: adminId, updatedById: adminId,
      vendors: { connect: [{ id: vendor2.id }] }
    }
  });
  await prisma.licence.create({
    data: { 
      licence_id: 'EPCG-2023-45', client: 'Alpha Manufacturing Ltd', type: 'EPCG', status: 'Active', expiry: '2027-10-15', utilized: 45, alert: false,
      createdById: adminId, updatedById: adminId
    }
  });

  await prisma.logisticsTrip.create({
    data: { 
      trip_id: 'TRP-501', job: 'IMP-8802', truck: 'MH-04-EY-1234', driver: 'Suresh Patil', from: 'JNPT Port', to: 'Vashi Warehouse', status: 'dispatch', eta: 'Today, 18:00', delayed: false,
      createdById: adminId, updatedById: adminId
    }
  });

  console.log('\n🎉 Database re-seeded successfully with PostgreSQL support and RBAC data!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
