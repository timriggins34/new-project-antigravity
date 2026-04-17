/**
 * Custom ID Generator for Master Jobs
 * Format: [DIR]_[FY]_[SEQ] (e.g., IMP_26_001)
 */

async function generateMasterJobNo(direction, prisma) {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed (Jan is 0)
  const currentYear = now.getFullYear();

  // Indian Financial Year starts April 1st
  // If month is Jan(0), Feb(1), March(2), the FY starts in previous year
  let fyYear = currentYear;
  if (currentMonth < 3) {
    fyYear = currentYear - 1;
  }

  const fyStr = fyYear.toString().slice(-2);
  const dirPrefix = direction.toUpperCase().substring(0, 3); // IMP or EXP
  
  const prefix = `${dirPrefix}_${fyStr}_`;

  // Query DB for the latest sequence in this FY and direction
  const lastJob = await prisma.masterJob.findFirst({
    where: {
      jobNo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      jobNo: 'desc',
    },
  });

  let nextSeq = 1;
  if (lastJob) {
    const lastSeqStr = lastJob.jobNo.split('_').pop();
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const seqStr = nextSeq.toString().padStart(3, '0');
  return `${prefix}${seqStr}`;
}

module.exports = { generateMasterJobNo };
