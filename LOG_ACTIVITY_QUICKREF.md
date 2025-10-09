# 🚀 LOG ACTIVITY - QUICK REFERENCE

## Akses Cepat

### 🔗 Menu
**Navbar → Profile Dropdown → Log Aktivitas**

### 🎯 Shortcuts
- Super Admin: Lihat semua log dari semua user
- Admin: Lihat log aktivitas sendiri

---

## 📊 Fitur Utama

### 1. Filter & Search
```
┌─────────────────────────────────────┐
│ 🔍 Search: [Cari aktivitas...]      │
│ 📁 Kategori: [Pilih kategori]       │
│ 🏷️  Tipe: [Pilih tipe]              │
│ 👤 User: [Pilih user] (Super Admin) │
│ 📅 Dari: [YYYY-MM-DD]               │
│ 📅 Sampai: [YYYY-MM-DD]             │
│                    [🔄 Reset] [📥 Export CSV] │
└─────────────────────────────────────┘
```

### 2. Stats Dashboard
```
┌──────────┬──────────┬──────────┬──────────┐
│ Total Log│ Hari Ini │ Kategori │ User Aktif│
│  1,234   │   45     │    6     │    12    │
└──────────┴──────────┴──────────┴──────────┘
```

### 3. Activity Table
```
┌───────────┬──────────┬──────┬──────┬─────────────┬────────┬────────┐
│ Waktu     │ Pengguna │ Kateg│ Tipe │ Deskripsi   │ Status │ IP     │
├───────────┼──────────┼──────┼──────┼─────────────┼────────┼────────┤
│ 09/10 10:30│ John Doe│SURAT │CREATE│Buat surat...│   ✓    │127.0..│
└───────────┴──────────┴──────┴──────┴─────────────┴────────┴────────┘
```

---

## 🎨 Kategori & Badge Colors

| Kategori | Warna | Deskripsi |
|----------|-------|-----------|
| AUTH | 🔵 Blue | Login, Logout |
| SURAT | 🟣 Purple | CRUD Surat |
| USER | 🟢 Green | CRUD User |
| PROFILE | 🟡 Yellow | Update Profile, Password |
| TRASH | 🔴 Red | Restore, Delete Permanent |
| SYSTEM | ⚫ Gray | System activities |

---

## 🔧 Aktivitas yang Dilacak

### ✅ Sudah Aktif
- [x] Login (Success/Failed)
- [x] Logout
- [x] Create Surat
- [x] Delete Surat (ke Trash)

### 📝 Siap Diaktifkan
- [ ] Update Surat
- [ ] Restore Surat
- [ ] Permanent Delete Surat
- [ ] Bulk Operations
- [ ] User Management
- [ ] Profile Updates

---

## 💻 Kode untuk Developer

### Import Logger
```typescript
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';
```

### Log Activity
```typescript
await logActivity({
  userId: session.operatorId,
  category: 'SURAT',
  type: 'CREATE',
  description: ActivityDescriptions.SURAT_CREATED(nomor, perihal),
  entityType: 'Surat',
  entityId: id,
  metadata: { nomor, perihal },
});
```

### Template Deskripsi
```typescript
ActivityDescriptions.SURAT_CREATED(nomor, perihal)
ActivityDescriptions.SURAT_UPDATED(nomor)
ActivityDescriptions.SURAT_DELETED(nomor)
ActivityDescriptions.LOGIN_SUCCESS(username)
ActivityDescriptions.LOGOUT(username)
```

---

## 🗄️ Database

### Migration
```bash
npx prisma migrate dev --name add_activity_log
npx prisma generate
```

### Query Log
```typescript
// Get all logs
const logs = await prisma.activityLog.findMany({
  include: { user: true },
  orderBy: { createdAt: 'desc' },
});

// Get user logs
const userLogs = await prisma.activityLog.findMany({
  where: { userId: 'user-id' },
});

// Get today's logs
const todayLogs = await prisma.activityLog.findMany({
  where: {
    createdAt: {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  },
});
```

---

## 📥 Export CSV

### Format CSV
```csv
Tanggal & Waktu,Pengguna,Username,Role,Kategori,Tipe,Deskripsi,Status,IP Address
09/10/2025 10:30,John Doe,johndoe,ADMIN,SURAT,CREATE,Membuat surat...,SUCCESS,127.0.0.1
```

### Download
1. Set filter yang diinginkan
2. Klik tombol "Export CSV"
3. File akan otomatis terdownload

---

## 🔐 Permission Matrix

| Fitur | Super Admin | Admin |
|-------|-------------|-------|
| View Own Logs | ✅ | ✅ |
| View All Logs | ✅ | ❌ |
| Filter by User | ✅ | ❌ |
| Export Own Logs | ✅ | ✅ |
| Export All Logs | ✅ | ❌ |

---

## 🎯 Best Practices

### DO ✅
- Selalu log aktivitas penting
- Gunakan template deskripsi yang sudah ada
- Tambahkan metadata yang berguna
- Handle error dengan gracefully

### DON'T ❌
- Jangan log password atau data sensitif
- Jangan throw error dari logging function
- Jangan log terlalu banyak data di metadata
- Jangan lupa kategori dan tipe yang benar

---

## 🐛 Quick Troubleshooting

### Log tidak muncul?
```bash
# 1. Check Prisma
npx prisma generate

# 2. Check Migration
npx prisma migrate status

# 3. Check Console
# Lihat error di browser console & server terminal
```

### Export gagal?
- Check apakah ada data yang akan di-export
- Pastikan filter tidak terlalu ketat
- Check browser console

---

## 📞 Quick Links

- **Documentation:** `LOG_ACTIVITY_DOCUMENTATION.md`
- **Schema:** `prisma/schema.prisma`
- **Logger:** `src/lib/activityLogger.ts`
- **Actions:** `src/app/(app)/log-activity/actions.ts`
- **Page:** `src/app/(app)/log-activity/page.tsx`

---

**Version:** 1.0.0  
**Status:** ✅ Ready to Use
