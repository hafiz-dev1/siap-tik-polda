# 📊 LOG ACTIVITY FEATURE - DOKUMENTASI LENGKAP

## 🎯 Overview

Fitur **Log Activity** adalah sistem komprehensif untuk melacak dan merekam semua aktivitas yang dilakukan oleh pengguna (Super Admin dan Admin) dalam sistem SIAP (Sistem Informasi Arsip Polda).

### ✨ Fitur Utama

1. **Tracking Otomatis** - Semua aktivitas penting dicatat secara otomatis
2. **Filter & Search** - Pencarian dan filter berdasarkan kategori, tipe, user, dan tanggal
3. **Export CSV** - Download log aktivitas dalam format CSV
4. **Dashboard Stats** - Statistik aktivitas real-time
5. **Role-based Access** - Super Admin dapat melihat semua log, Admin hanya melihat log sendiri
6. **IP & User Agent Tracking** - Melacak IP Address dan browser yang digunakan

---

## 📁 Struktur File

### 1. Database Schema (`prisma/schema.prisma`)

**Model ActivityLog:**
```prisma
model ActivityLog {
  id              String           @id @default(uuid())
  userId          String
  user            Pengguna         @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        ActivityCategory
  type            ActivityType
  description     String           @db.Text
  entityType      String?
  entityId        String?
  metadata        Json?
  ipAddress       String?
  userAgent       String?
  status          String           @default("SUCCESS")
  createdAt       DateTime         @default(now())

  @@index([userId])
  @@index([category])
  @@index([type])
  @@index([createdAt])
  @@index([userId, createdAt])
  @@map("activity_log")
}
```

**Enums:**
```prisma
enum ActivityCategory {
  AUTH          // Login, Logout
  SURAT         // CRUD Surat
  USER          // CRUD User
  PROFILE       // Update Profile, Change Password
  TRASH         // Restore, Delete Permanently
  SYSTEM        // System-related activities
}

enum ActivityType {
  LOGIN
  LOGOUT
  CREATE
  UPDATE
  DELETE
  RESTORE
  PERMANENT_DELETE
  BULK_DELETE
  BULK_RESTORE
  BULK_PERMANENT_DELETE
  VIEW
  DOWNLOAD
  UPLOAD
  PASSWORD_CHANGE
  PROFILE_UPDATE
}
```

### 2. Helper Library (`src/lib/activityLogger.ts`)

**Fungsi Utama:**
- `logActivity()` - Mencatat aktivitas ke database
- `getIpAddress()` - Mendapatkan IP address dari request
- `getUserAgent()` - Mendapatkan user agent dari request
- `ActivityDescriptions` - Template deskripsi untuk berbagai aktivitas

**Contoh Penggunaan:**
```typescript
await logActivity({
  userId: session.operatorId,
  category: 'SURAT',
  type: 'CREATE',
  description: ActivityDescriptions.SURAT_CREATED(nomor_surat, perihal),
  entityType: 'Surat',
  entityId: newSurat.id,
  metadata: {
    nomor_surat,
    perihal,
    arah_surat,
    tipe_dokumen,
  },
});
```

### 3. Server Actions (`src/app/(app)/log-activity/actions.ts`)

**Fungsi yang Tersedia:**
- `getActivityLogs()` - Mendapatkan log dengan filter dan pagination
- `getActivityStats()` - Mendapatkan statistik aktivitas
- `exportActivityLogsToCSV()` - Export log ke CSV
- `getUsersForFilter()` - Mendapatkan daftar user untuk filter (Super Admin only)

### 4. UI Components

**Halaman:**
- `src/app/(app)/log-activity/page.tsx` - Server component halaman log
- `src/app/(app)/log-activity/ActivityLogClient.tsx` - Client component dengan filter, search, dan export

**Navbar:**
- `src/app/components/UserDropdown.tsx` - Ditambahkan menu "Log Aktivitas"

---

## 🔄 Aktivitas yang Dilacak

### 1. **Autentikasi (AUTH)**
- ✅ Login (Success/Failed)
- ✅ Logout

### 2. **Surat (SURAT)**
- ✅ Create Surat
- ✅ Update Surat
- ✅ Delete Surat (Soft Delete)
- ✅ Restore Surat
- ✅ Permanent Delete Surat
- ✅ Bulk Delete Surat
- ✅ Bulk Restore Surat
- ✅ Bulk Permanent Delete Surat
- 📝 View Surat Detail (Optional)
- 📝 Download Lampiran (Optional)

### 3. **User (USER)**
- 📝 Create User
- 📝 Update User
- 📝 Delete User
- 📝 Restore User
- 📝 Permanent Delete User
- 📝 Bulk Operations

### 4. **Profile (PROFILE)**
- 📝 Update Profile
- 📝 Change Password
- 📝 Update Profile Picture

### 5. **System (SYSTEM)**
- 📝 Auto Purge Expired Trash

**Legend:**
- ✅ = Sudah diimplementasikan
- 📝 = Siap untuk diimplementasikan (tinggal tambahkan logging)

---

## 🎨 Fitur UI

### Dashboard Stats
- **Total Log** - Jumlah total semua log
- **Hari Ini** - Log yang dibuat hari ini
- **Kategori** - Jumlah kategori yang aktif
- **User Aktif** - Jumlah user yang memiliki log

### Filter & Search
1. **Search Bar** - Cari berdasarkan deskripsi, nama, username, dll
2. **Category Filter** - Filter berdasarkan kategori (AUTH, SURAT, USER, dll)
3. **Type Filter** - Filter berdasarkan tipe aktivitas
4. **User Filter** - Filter berdasarkan user (Super Admin only)
5. **Date Range** - Filter berdasarkan tanggal

### Table Columns
- Waktu
- Pengguna (nama & username)
- Kategori (badge berwarna)
- Tipe (badge berwarna)
- Deskripsi
- Status (icon: ✓ Success, ✗ Failed, ⚠ Warning)
- IP Address

### Export CSV
- Download semua log yang terfilter
- Format: UTF-8 dengan BOM (kompatibel dengan Excel)
- Nama file: `activity-logs-YYYY-MM-DD.csv`

---

## 🔐 Role-based Access

### Super Admin
- ✅ Melihat semua log dari semua user
- ✅ Filter berdasarkan user tertentu
- ✅ Export semua log
- ✅ Akses penuh ke semua fitur

### Admin
- ✅ Melihat log aktivitas sendiri saja
- ✅ Filter dan search dalam log sendiri
- ✅ Export log sendiri
- ❌ Tidak bisa melihat log user lain

---

## 📝 Cara Menambahkan Logging ke Fungsi Baru

### Step 1: Import Library
```typescript
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';
```

### Step 2: Tambahkan Logging
```typescript
// Setelah operasi berhasil
await logActivity({
  userId: session.operatorId,
  category: 'SURAT', // atau USER, PROFILE, TRASH, SYSTEM
  type: 'CREATE', // atau UPDATE, DELETE, dll
  description: ActivityDescriptions.SURAT_CREATED(nomor_surat, perihal),
  entityType: 'Surat', // opsional
  entityId: newSurat.id, // opsional
  metadata: { // opsional - data tambahan dalam JSON
    nomor_surat,
    perihal,
  },
  ipAddress: getIpAddress(request), // untuk API routes
  userAgent: getUserAgent(request), // untuk API routes
  status: 'SUCCESS', // atau FAILED, WARNING
});
```

### Step 3: Tambahkan Template Deskripsi (Opsional)
Edit `src/lib/activityLogger.ts`:
```typescript
export const ActivityDescriptions = {
  // ... existing descriptions
  
  YOUR_NEW_ACTION: (param1: string, param2: string) => 
    `Deskripsi aktivitas dengan ${param1} dan ${param2}`,
};
```

---

## 🚀 Instalasi & Setup

### 1. Generate Migration
```bash
npx prisma migrate dev --name add_activity_log
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. (Optional) Seed Data untuk Testing
Buat file `prisma/seed-activity-logs.ts` jika ingin menambahkan dummy data.

---

## 📊 Query Examples

### Mendapatkan Log User Tertentu
```typescript
const logs = await prisma.activityLog.findMany({
  where: {
    userId: 'user-id',
    category: 'SURAT',
  },
  include: {
    user: {
      select: {
        nama: true,
        username: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Mendapatkan Statistik
```typescript
const stats = await prisma.activityLog.groupBy({
  by: ['category'],
  _count: true,
  where: {
    createdAt: {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  },
});
```

---

## 🎯 Best Practices

### 1. **Consistency**
- Selalu gunakan `ActivityDescriptions` template untuk deskripsi yang konsisten
- Gunakan kategori dan tipe yang sesuai

### 2. **Error Handling**
- Logging tidak boleh mengganggu operasi utama
- Jika logging gagal, tetap lanjutkan operasi utama
- Error di logging hanya di-log ke console, tidak di-throw

### 3. **Performance**
- Logging dilakukan asynchronous dengan `await` tapi tidak di-await dalam try-catch terpisah
- Index database sudah dioptimasi untuk query cepat
- Gunakan pagination untuk menampilkan log

### 4. **Privacy & Security**
- Jangan log data sensitif (password, token, dll) di metadata
- IP Address dan User Agent dicatat untuk audit
- Soft delete cascade: jika user dihapus, log-nya juga terhapus

### 5. **Metadata**
- Gunakan metadata untuk menyimpan data tambahan yang berguna untuk audit
- Format JSON memudahkan penyimpanan data terstruktur
- Jangan terlalu banyak data di metadata (keep it minimal)

---

## 🐛 Troubleshooting

### Error: "ActivityLog model not found"
**Solusi:** Jalankan `npx prisma generate` untuk regenerate Prisma Client

### Error: "Column 'category' does not exist"
**Solusi:** Jalankan migration: `npx prisma migrate dev`

### Log tidak muncul
**Checklist:**
1. Apakah logging dipanggil dengan benar?
2. Apakah ada error di console?
3. Apakah userId valid?
4. Apakah Prisma Client sudah di-regenerate?

### Export CSV gagal
**Checklist:**
1. Apakah ada data yang akan di-export?
2. Apakah filter terlalu ketat?
3. Check browser console untuk error

---

## 📈 Future Enhancements

### Planned Features
1. **Real-time Updates** - WebSocket untuk live log updates
2. **Advanced Analytics** - Charts dan grafik aktivitas
3. **Email Notifications** - Alert untuk aktivitas kritis
4. **Audit Reports** - Generate PDF report untuk audit
5. **Data Retention Policy** - Auto-delete log yang sudah terlalu lama
6. **Export to Excel** - Export dalam format .xlsx dengan formatting
7. **Activity Replay** - Melihat detail lengkap aktivitas termasuk before/after

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan:
1. Check dokumentasi ini
2. Check error di console
3. Review kode di file yang disebutkan
4. Buat issue ticket dengan detail error

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-09  
**Author:** AI Assistant  
**Status:** ✅ Production Ready
