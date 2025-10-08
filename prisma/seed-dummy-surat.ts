import { PrismaClient, ArahSurat, TipeDokumen, Role } from '@prisma/client';

const prisma = new PrismaClient();

const TUJUAN_DISPOSISI = ['KASUBBID_TEKKOM', 'KASUBBID_TEKINFO', 'KASUBBAG_RENMIN', 'KAUR_KEU'];
const PERIHAL_SAMPLES = [
  'Permohonan Data',
  'Konfirmasi Kegiatan',
  'Laporan Harian',
  'Undangan Rapat',
  'Pemberitahuan Perbaikan Sistem',
  'Distribusi Informasi',
  'Permintaan Tindak Lanjut',
  'Penyampaian Nota Dinas',
  'Koordinasi Internal',
  'Update Progres Pekerjaan'
];
const ASAL_SAMPLES = ['Bag Renmin', 'Subbid Tekkom', 'Subbid Tekinfo', 'Kaur Keu', 'Eksternal'];
const TUJUAN_SAMPLES = ['Kapolda', 'Wakapolda', 'Kabid TIK', 'Kasubbid Tekkom', 'Kasubbid Tekinfo'];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}
function randomSubset<T>(arr: T[]): T[] {
  const count = randomInt(1, Math.min(3, arr.length));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Random date within last 12 months (inclusive)
function randomDateLast12Months() {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - 11); // covers current month + previous 11 months
  const ts = randomInt(past.getTime(), now.getTime());
  return new Date(ts);
}

function addRandomDelta(base: Date, maxDaysForward: number) {
  const d = new Date(base.getTime());
  const addDays = randomInt(0, maxDaysForward);
  d.setDate(d.getDate() + addDays);
  d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), randomInt(0, 999));
  return d;
}

async function ensureOperator() {
  let op = await prisma.pengguna.findFirst();
  if (!op) {
    op = await prisma.pengguna.create({
      data: {
        nama: 'Operator Seed',
        username: 'operator_seed',
        password: 'hashed_dummy',
        role: Role.ADMIN
      }
    });
  }
  return op;
}

async function getCurrentSequenceBases(year: number) {
  const lastAgenda = await prisma.surat.findFirst({
    where: { nomor_agenda: { startsWith: `AG-${year}-` } },
    select: { nomor_agenda: true },
    orderBy: { nomor_agenda: 'desc' }
  });
  const baseAgenda = lastAgenda && lastAgenda.nomor_agenda
    ? parseInt(lastAgenda.nomor_agenda.split('-').pop() || '0', 10)
    : 0;

  const lastNomorSurat = await prisma.surat.findFirst({
    where: { nomor_surat: { startsWith: `NS/${year}/` } },
    select: { nomor_surat: true },
    orderBy: { nomor_surat: 'desc' }
  });
  const baseNomorSurat = lastNomorSurat
    ? parseInt((lastNomorSurat.nomor_surat.split('/').pop() || '0'), 10)
    : 0;

  return { baseAgenda, baseNomorSurat };
}

async function main() {
  const operator = await ensureOperator();

  const yearForCodes = new Date().getFullYear();
  const { baseAgenda, baseNomorSurat } = await getCurrentSequenceBases(yearForCodes);

  const COUNT = 400;
  console.log(
    `Seeding ${COUNT} Surat (range tanggal acak 12 bulan terakhir). Mulai nomor_agenda ${(baseAgenda + 1)
      .toString()
      .padStart(4, '0')} / nomor_surat ${(baseNomorSurat + 1)
      .toString()
      .padStart(5, '0')} (tahun kode ${yearForCodes})`
  );

  // Create surat dengan lampiran
  for (let i = 0; i < COUNT; i++) {
    const seqAgenda = baseAgenda + i + 1;
    const seqSurat = baseNomorSurat + i + 1;

    const arah = Math.random() > 0.5 ? ArahSurat.MASUK : ArahSurat.KELUAR;

    const base = randomDateLast12Months();
    let tanggalSurat: Date;
    let tanggalDiterimaDibuat: Date;

    if (arah === ArahSurat.MASUK) {
      tanggalSurat = addRandomDelta(base, 0);
      tanggalDiterimaDibuat = addRandomDelta(tanggalSurat, 7);
      if (tanggalDiterimaDibuat < tanggalSurat) {
        tanggalDiterimaDibuat = new Date(tanggalSurat.getTime() + 2 * 3600_000);
      }
    } else {
      tanggalDiterimaDibuat = addRandomDelta(base, 0);
      tanggalSurat = addRandomDelta(tanggalDiterimaDibuat, 2);
      if (tanggalSurat < tanggalDiterimaDibuat) {
        tanggalSurat = new Date(tanggalDiterimaDibuat.getTime() + 1 * 3600_000);
      }
    }

    // Create surat with lampiran
    const surat = await prisma.surat.create({
      data: {
        nomor_agenda: `AG-${yearForCodes}-${String(seqAgenda).padStart(4, '0')}`,
        nomor_surat: `NS/${yearForCodes}/${String(seqSurat).padStart(5, '0')}`,
        tanggal_surat: tanggalSurat,
        tanggal_diterima_dibuat: tanggalDiterimaDibuat,
        perihal: `${randomPick(PERIHAL_SAMPLES)} (${seqAgenda})`,
        asal_surat: arah === ArahSurat.MASUK ? randomPick(ASAL_SAMPLES) : 'Bid TIK Polda',
        tujuan_surat: randomPick(TUJUAN_SAMPLES),
        arah_surat: arah,
        tipe_dokumen: randomPick([
          TipeDokumen.NOTA_DINAS,
          TipeDokumen.SURAT_BIASA,
          TipeDokumen.SPRIN,
          TipeDokumen.TELEGRAM
        ]),
        tujuan_disposisi: randomSubset(TUJUAN_DISPOSISI),
        isi_disposisi: 'Isi disposisi dummy otomatis. Ref #' + seqAgenda + '. Uji sistem.',
        id_operator: operator.id,
        lampiran: {
          create: {
            nama_file: `scan_surat_${seqSurat}_dummy.pdf`,
            path_file: `/uploads/dummy/scan_${seqSurat}.pdf`,
            tipe_file: 'application/pdf',
            ukuran_file: randomInt(50000, 500000)
          }
        }
      }
    });

    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${COUNT} surat dibuat...`);
    }
  }

  console.log(`Selesai menambah ${COUNT} data dummy beserta lampiran (12 bulan terakhir).`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });