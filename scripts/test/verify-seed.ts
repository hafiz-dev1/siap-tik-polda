// Verify seed results
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    const totalSurat = await prisma.surat.count();
    const totalLampiran = await prisma.lampiran.count();
    
    const suratMasuk = await prisma.surat.count({
      where: { arah_surat: 'MASUK' }
    });
    
    const suratKeluar = await prisma.surat.count({
      where: { arah_surat: 'KELUAR' }
    });

    const byTipeDokumen = await prisma.surat.groupBy({
      by: ['tipe_dokumen'],
      _count: true
    });

    console.log('\n📊 HASIL SEED DATABASE:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total Surat         : ${totalSurat} surat`);
    console.log(`📎 Total Lampiran      : ${totalLampiran} file`);
    console.log(`📥 Surat Masuk         : ${suratMasuk} surat`);
    console.log(`📤 Surat Keluar        : ${suratKeluar} surat`);
    console.log('\n📋 Breakdown by Tipe Dokumen:');
    byTipeDokumen.forEach(item => {
      console.log(`   - ${item.tipe_dokumen.padEnd(15)}: ${item._count} surat`);
    });
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('Error:', error);
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
